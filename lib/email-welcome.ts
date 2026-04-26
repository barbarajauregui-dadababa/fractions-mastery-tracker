/**
 * Welcome email sent when a new learner is set up. Gives the contributor
 * a permanent link back to /learner/<id> so they can resume any time.
 *
 * Uses Resend (same client as activity submissions). If RESEND_API_KEY is
 * not set, sending is skipped silently and we return { skipped: true } —
 * the form still completes, but the learner's bookmark URL is the only
 * recovery path.
 */

import { Resend } from 'resend'

interface SendArgs {
  learnerId: string
  learnerName: string
  email: string
}

interface SendResult {
  skipped?: boolean
  emailId?: string
  error?: string
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'Strata Mundo <onboarding@resend.dev>'

export async function sendWelcomeEmail({
  learnerId,
  learnerName,
  email,
}: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { skipped: true }
  }
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const voyageUrl = `${siteUrl}/learner/${learnerId}`

  try {
    const res = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `${learnerName}'s math mastery voyage on Strata Mundo`,
      html: welcomeHtml({ learnerName, voyageUrl }),
    })
    return { emailId: res.data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'unknown email error' }
  }
}

function welcomeHtml({
  learnerName,
  voyageUrl,
}: {
  learnerName: string
  voyageUrl: string
}): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #292524;">
      <h1 style="color: #92400e; font-family: 'Cinzel', Georgia, serif; margin-top: 0;">
        Welcome to Strata Mundo
      </h1>

      <ul style="padding-left: 20px;">
        <li><strong>${escapeHtml(learnerName)}'s math mastery voyage</strong> is set up and ready.</li>
        <li>Bookmark the link below — it's how ${escapeHtml(learnerName)} returns to the voyage any time.</li>
        <li>Save this email too, in case the bookmark gets lost.</li>
      </ul>

      <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border: 2px solid #c2864a; border-radius: 4px; text-align: center;">
        <a href="${voyageUrl}" style="display: inline-block; background: #92400e; color: #fef3c7; padding: 12px 28px; text-decoration: none; font-family: 'Cinzel', Georgia, serif; letter-spacing: 0.18em; text-transform: uppercase; font-size: 12px; font-weight: bold;">
          Open ${escapeHtml(learnerName)}'s voyage &rarr;
        </a>
        <div style="margin-top: 12px; font-size: 12px; color: #78716c; word-break: break-all;">
          ${voyageUrl}
        </div>
      </div>

      <p style="color: #78716c; font-style: italic; margin-top: 30px; font-size: 13px;">
        Strata Mundo is your math mastery voyage — diagnostic, plan, and probe loop, built on Claude Opus 4.7.
      </p>
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
