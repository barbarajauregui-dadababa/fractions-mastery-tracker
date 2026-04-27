/**
 * "Resume your voyage" email — sent when someone enters their email at
 * /resume. Lists every learner registered with that email and links each
 * one back to its voyage page. If no learners match, no email is sent
 * (the page UI shows a generic "check your inbox" either way to avoid
 * leaking which addresses are registered).
 */
import { Resend } from 'resend'
import { emailLayout, escapeEmailHtml } from './email-layout'

interface LearnerEntry {
  id: string
  name: string
}

interface SendArgs {
  email: string
  learners: LearnerEntry[]
}

interface SendResult {
  skipped?: boolean
  emailId?: string
  error?: string
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS ?? 'Strata Mundo <onboarding@resend.dev>'

export async function sendResumeEmail({ email, learners }: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { skipped: true }
  if (learners.length === 0) return { skipped: true }

  const resend = new Resend(apiKey)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  try {
    const res = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Your Strata Mundo voyage',
      html: resumeHtml({ learners, siteUrl }),
    })
    return { emailId: res.data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'unknown email error' }
  }
}

function resumeHtml({
  learners,
  siteUrl,
}: {
  learners: LearnerEntry[]
  siteUrl: string
}): string {
  // One brass button per voyage. No redundant URL printed underneath.
  const buttons = learners
    .map(
      (l) => `
      <div style="text-align: center; margin: 0 0 14px;">
        <a href="${siteUrl}/learner/${l.id}" style="display: inline-block; background: #92400e; color: #fbf6e7; padding: 14px 28px; text-decoration: none; font-family: Georgia, 'Times New Roman', serif; letter-spacing: 0.20em; text-transform: uppercase; font-size: 13px; font-weight: bold; border: 2px solid #b75000; border-radius: 2px; box-shadow: 0 2px 0 #6b2d09;">
          ${escapeEmailHtml(l.name)}'s voyage &rarr;
        </a>
      </div>`,
    )
    .join('')

  const intro =
    learners.length === 1
      ? 'You requested a link back to your math mastery voyage.'
      : 'You requested a link back to your math mastery voyages.'

  return emailLayout({
    cloudscapeUrl: `${siteUrl}/images/cloudscape-denis.jpg`,
    body: `
      <h1 style="font-family: Georgia, 'Times New Roman', serif; color: #44291a; font-size: 24px; line-height: 1.3; margin: 0 0 18px; font-weight: 600; text-align: center;">
        Welcome back
      </h1>
      <ul style="font-family: Georgia, serif; font-size: 15px; line-height: 1.7; color: #44403c; padding-left: 22px; margin: 0 0 24px;">
        <li>${intro}</li>
        <li>Click ${learners.length === 1 ? 'the button' : 'a button'} below to resume.</li>
        <li>Bookmark the page once it opens — it's the same link every time.</li>
      </ul>
      ${buttons}
    `,
    footerLine: 'Didn’t request this? You can safely ignore this email.<br>Built with Claude Opus 4.7.',
  })
}
