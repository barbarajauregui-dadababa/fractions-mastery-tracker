/**
 * Welcome email sent when a new learner is set up. Gives the contributor
 * a permanent link back to /learner/<id> so they can resume any time.
 */

import { Resend } from 'resend'
import { emailLayout, escapeEmailHtml } from './email-layout'

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
  if (!apiKey) return { skipped: true }
  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const voyageUrl = `${siteUrl}/learner/${learnerId}`

  try {
    const res = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `${learnerName}'s math mastery voyage on Strata Mundo`,
      html: welcomeHtml({ learnerName, voyageUrl, cloudscapeUrl: `${siteUrl}/images/cloudscape-denis.jpg` }),
    })
    return { emailId: res.data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'unknown email error' }
  }
}

function welcomeHtml({
  learnerName,
  voyageUrl,
  cloudscapeUrl,
}: {
  learnerName: string
  voyageUrl: string
  cloudscapeUrl: string
}): string {
  const safeName = escapeEmailHtml(learnerName)
  return emailLayout({
    cloudscapeUrl,
    body: `
      <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #44291a; font-size: 26px; line-height: 1.2; margin: 0 0 18px; font-weight: 600; text-align: center;">
        Welcome aboard
      </h1>
      <p style="font-family: Georgia, serif; font-size: 16px; line-height: 1.65; color: #292524; margin: 0 0 14px;">
        <strong style="color: #44291a;">${safeName}'s</strong> math mastery voyage is set up and ready.
      </p>
      <ul style="font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #44403c; padding-left: 22px; margin: 0 0 28px;">
        <li>Bookmark the page once it opens — that's how ${safeName} returns any time.</li>
        <li>Save this email too, in case the bookmark gets lost.</li>
      </ul>
      <!-- CTA: button only, no surrounding card, no URL underneath. -->
      <div style="text-align: center; margin: 0 0 8px;">
        <a href="${voyageUrl}" style="display: inline-block; background: #92400e; color: #fbf6e7; padding: 16px 34px; text-decoration: none; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 0.22em; text-transform: uppercase; font-size: 13px; font-weight: bold; border: 2px solid #b75000; border-radius: 2px; box-shadow: 0 2px 0 #6b2d09;">
          Open ${safeName}'s voyage &rarr;
        </a>
      </div>
    `,
    footerLine:
      'A diagnostic that reads <em>how</em> a learner reasons, a tailored plan, and a probe loop that verifies mastery.<br>Built with Claude Opus 4.7.',
  })
}
