/**
 * Email notifications for the activity-submission pipeline.
 *
 * Two emails are sent for each submission:
 *   1. Notify the admin (Barbara) with a deep link to the review page.
 *   2. Acknowledge to the contributor that their submission was received.
 *
 * Uses Resend (https://resend.com). Requires:
 *   - RESEND_API_KEY in env
 *   - ADMIN_EMAIL in env (defaults to barbarajauregui@gmail.com)
 *   - NEXT_PUBLIC_SITE_URL in env (e.g., https://stratamundo.com)
 *
 * If RESEND_API_KEY is not set, both emails are skipped silently and
 * sendSubmissionEmails returns { skipped: true }. The submission still
 * lands in the database — the admin can find it via the admin queue.
 * This lets local dev work without setting up Resend.
 */

import { Resend } from 'resend'
import type { ActivitySubmissionInput, ActivityVetResult } from './ai-vet-activity'

interface SendArgs {
  submissionId: string
  submission: ActivitySubmissionInput
  vet: ActivityVetResult
}

interface SendResult {
  skipped?: boolean
  adminEmailId?: string
  contributorEmailId?: string
  error?: string
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'Strata Mundo <onboarding@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'barbarajauregui@gmail.com'

export async function sendSubmissionEmails({
  submissionId,
  submission,
  vet,
}: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { skipped: true }
  }
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const adminKey = process.env.ADMIN_REVIEW_SECRET ?? ''
  const reviewUrl = `${siteUrl}/admin/submissions/${submissionId}${adminKey ? `?key=${encodeURIComponent(adminKey)}` : ''}`

  try {
    // AI-rejected submissions don't go to human review — the AI's rationale
    // is the full feedback to the contributor. Skip the admin notification
    // (Barbara can still see rejections by filtering the admin queue).
    const adminEmailId =
      vet.verdict === 'reject'
        ? undefined
        : (
            await resend.emails.send({
              from: FROM_ADDRESS,
              to: ADMIN_EMAIL,
              subject: `[Strata Mundo] New activity submission: ${submission.title}`,
              html: adminEmailHtml({ submissionId, submission, vet, reviewUrl }),
            })
          ).data?.id

    // AI-rejected submissions skip the contributor email too — the result
    // panel on the contribute page already shows the rationale immediately,
    // so emailing the same content adds noise.
    const contributorEmailId =
      vet.verdict === 'reject'
        ? undefined
        : (
            await resend.emails.send({
              from: FROM_ADDRESS,
              to: submission.contributor_email,
              subject: 'Thank you for contributing to Strata Mundo',
              html: contributorEmailHtml({ submission, vet }),
            })
          ).data?.id

    return {
      adminEmailId,
      contributorEmailId,
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'unknown email error',
    }
  }
}

function adminEmailHtml({
  submissionId,
  submission,
  vet,
  reviewUrl,
}: SendArgs & { reviewUrl: string }): string {
  const verdictColor =
    vet.verdict === 'pass' ? '#166534' : vet.verdict === 'borderline' ? '#a16207' : '#991b1b'
  const flagsList =
    vet.flags.length > 0 ? `<p><strong>Flags:</strong> ${vet.flags.join(', ')}</p>` : ''
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #92400e; font-family: 'Cinzel', Georgia, serif;">New activity submission</h1>
      <p style="color: #78716c;">Submission ID: <code>${submissionId}</code></p>

      <h2 style="margin-top: 30px;">${escapeHtml(submission.title)}</h2>
      <p><strong>Modality:</strong> ${submission.modality}</p>
      <p><strong>Standards:</strong> ${submission.standard_ids.join(', ')}</p>
      <p><strong>Description:</strong></p>
      <blockquote style="border-left: 3px solid #c2864a; padding-left: 12px; color: #44403c;">
        ${escapeHtml(submission.description)}
      </blockquote>
      ${submission.url ? `<p><strong>URL:</strong> <a href="${escapeHtml(submission.url)}">${escapeHtml(submission.url)}</a></p>` : ''}
      ${submission.source_site ? `<p><strong>Source:</strong> ${escapeHtml(submission.source_site)}</p>` : ''}
      ${typeof submission.duration_minutes === 'number' ? `<p><strong>Duration:</strong> ${submission.duration_minutes} minutes</p>` : ''}
      ${submission.rationale ? `<p><strong>Why it works:</strong> ${escapeHtml(submission.rationale)}</p>` : ''}

      <p><strong>Contributor:</strong> ${escapeHtml(submission.contributor_name)} &lt;${escapeHtml(submission.contributor_email)}&gt;</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #c2864a;">

      <h3 style="color: ${verdictColor};">AI vet verdict: ${vet.verdict.toUpperCase()}</h3>
      <p>${escapeHtml(vet.reasoning)}</p>
      ${flagsList}

      <div style="margin-top: 30px; padding: 16px; background: #fef3c7; border: 2px solid #c2864a; border-radius: 4px;">
        <a href="${reviewUrl}" style="display: inline-block; background: #92400e; color: #fef3c7; padding: 10px 20px; text-decoration: none; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.18em; text-transform: uppercase; font-size: 12px; font-weight: bold;">
          Review submission &rarr;
        </a>
      </div>
    </div>
  `
}

function contributorEmailHtml({
  submission,
  vet,
}: {
  submission: ActivitySubmissionInput
  vet: ActivityVetResult
}): string {
  const nextStepsBullets =
    vet.verdict === 'pass'
      ? [
          'Your submission passed our automated review.',
          'A human reviewer will look at it next.',
          'You’ll receive an email when it’s approved (and live on the platform), or with an explanation if it can’t be accepted.',
        ]
      : vet.verdict === 'borderline'
        ? [
            'Our automated reviewer flagged a few things for closer human review.',
            'A human reviewer will look at it next.',
            'You’ll receive a follow-up email with the decision.',
          ]
        : [
            'Our automated reviewer didn’t accept this submission as written.',
            'The specific issues are below. Please revise and resubmit through the Contribute page.',
            'AI-rejected submissions don’t go to human review — the AI’s rationale is the full feedback. Once you address the issues, your revised submission will be re-vetted from scratch.',
          ]

  const reasoningBullets = vet.reasoning
    ? vet.reasoning
        .split(/\n+|(?:^|\s)[-*•]\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : []

  const flagsBlock =
    vet.flags.length > 0
      ? `<p style="margin: 0 0 4px;"><strong>Criteria flagged:</strong> ${vet.flags.join(', ')}</p>
         <p style="margin: 0; color: #78716c; font-style: italic; font-size: 13px;">See the criteria documentation in the Methodology page for what each flag means.</p>`
      : ''

  const safeName = escapeHtml(submission.contributor_name)
  return `
    <div style="background: #e4d5b2; padding: 32px 16px; font-family: Georgia, 'Times New Roman', serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 600px; width: 100%; margin: 0 auto; background: #fbf6e7; border: 2px solid #b75000; border-collapse: separate;">
        <tr>
          <td style="padding: 36px 36px 24px;">

            <!-- Brand wordmark -->
            <div style="text-align: center;">
              <p style="margin: 0; font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #92400e; font-weight: bold;">
                ◇ Strata Mundo ◇
              </p>
              <p style="margin: 6px 0 0; font-family: Georgia, serif; font-style: italic; font-size: 14px; color: #78716c;">
                The library grows.
              </p>
            </div>

            <!-- Brass ornamental rule -->
            <div style="text-align: center; margin: 22px 0 28px;">
              <span style="display: inline-block; height: 1px; width: 100px; background: #b75000; vertical-align: middle;"></span>
              <span style="display: inline-block; color: #b75000; font-size: 14px; padding: 0 10px; vertical-align: middle;">◇</span>
              <span style="display: inline-block; height: 1px; width: 100px; background: #b75000; vertical-align: middle;"></span>
            </div>

            <!-- Headline -->
            <h1 style="font-family: Georgia, serif; color: #44291a; font-size: 24px; line-height: 1.3; margin: 0 0 18px; font-weight: 600; text-align: center;">
              Thank you for contributing
            </h1>
            <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.5; color: #78716c; font-style: italic; text-align: center; margin: 0 0 24px;">
              A new learning activity for the community.
            </p>

            <!-- Greeting + next steps -->
            <p style="font-family: Georgia, serif; font-size: 16px; line-height: 1.65; color: #292524; margin: 0 0 8px;">
              Hi ${safeName},
            </p>
            <ul style="font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #44403c; padding-left: 22px; margin: 0 0 24px;">
              ${nextStepsBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>

            <!-- Section divider -->
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; height: 1px; width: 60px; background: #c2864a; vertical-align: middle;"></span>
            </div>

            <!-- Submission summary card -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px;">
              <tr>
                <td style="padding: 24px; background: #fef3c7; border: 1px solid #c2864a; border-radius: 3px;">
                  <p style="margin: 0 0 14px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #92400e; font-weight: bold; text-align: center;">
                    Your submission
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #292524;">
                    <tr><td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c; white-space: nowrap;"><strong>Title</strong></td><td style="padding: 2px 0; vertical-align: top;">${escapeHtml(submission.title)}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c;"><strong>Modality</strong></td><td style="padding: 2px 0; vertical-align: top;">${escapeHtml(submission.modality)}</td></tr>
                    <tr><td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c;"><strong>Standards</strong></td><td style="padding: 2px 0; vertical-align: top;">${submission.standard_ids.map((s) => escapeHtml(s)).join(', ')}</td></tr>
                    ${submission.url ? `<tr><td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c;"><strong>Link</strong></td><td style="padding: 2px 0; vertical-align: top;"><a href="${escapeHtml(submission.url)}" style="color: #92400e;">${escapeHtml(submission.url)}</a></td></tr>` : ''}
                    ${submission.source_site ? `<tr><td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c;"><strong>Source</strong></td><td style="padding: 2px 0; vertical-align: top;">${escapeHtml(submission.source_site)}</td></tr>` : ''}
                    ${typeof submission.duration_minutes === 'number' ? `<tr><td style="padding: 2px 8px 2px 0; vertical-align: top; color: #78716c;"><strong>Duration</strong></td><td style="padding: 2px 0; vertical-align: top;">${submission.duration_minutes} minutes</td></tr>` : ''}
                  </table>
                  <p style="margin: 14px 0 4px; font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #92400e; font-weight: bold;">
                    Why does this work?
                  </p>
                  <p style="margin: 0; padding-left: 12px; border-left: 3px solid #c2864a; font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #44403c; font-style: italic;">
                    ${escapeHtml(submission.description)}
                  </p>
                </td>
              </tr>
            </table>

            ${
              reasoningBullets.length > 0
                ? `
            <!-- AI reviewer notes -->
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; height: 1px; width: 60px; background: #c2864a; vertical-align: middle;"></span>
            </div>
            <p style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: #92400e; font-weight: bold; text-align: center;">
              AI reviewer notes · ${vet.verdict.toUpperCase()}
            </p>
            <ul style="font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #44403c; font-style: italic; padding-left: 22px; margin: 0 0 12px;">
              ${reasoningBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
            </ul>
            ${flagsBlock}`
                : ''
            }

            <!-- Closing rule + footer -->
            <div style="text-align: center; margin: 28px 0 18px;">
              <span style="display: inline-block; height: 1px; width: 60px; background: #c2864a; vertical-align: middle;"></span>
            </div>
            <p style="font-family: Georgia, serif; font-size: 12px; line-height: 1.6; color: #78716c; font-style: italic; text-align: center; margin: 0;">
              Strata Mundo's library grows from contributions like yours.
              <br>
              Built with Claude Opus 4.7.
            </p>

          </td>
        </tr>
      </table>
    </div>
  `
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
