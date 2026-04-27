/**
 * "Resume your voyage" email — sent when someone enters their email at
 * /resume. Lists every learner registered with that email and links each
 * one back to its voyage page. If no learners match, no email is sent
 * (the page UI shows a generic "check your inbox" either way to avoid
 * leaking which addresses are registered).
 */
import { Resend } from 'resend'

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
  const items = learners
    .map(
      (l) => `
      <li style="margin-bottom: 14px;">
        <a href="${siteUrl}/learner/${l.id}" style="color: #92400e; text-decoration: none; font-weight: bold;">
          ${escapeHtml(l.name)}'s voyage &rarr;
        </a>
        <div style="font-size: 12px; color: #78716c; word-break: break-all;">
          ${siteUrl}/learner/${l.id}
        </div>
      </li>`,
    )
    .join('')

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #292524;">
      <h1 style="color: #92400e; font-family: 'Cinzel', Georgia, serif; margin-top: 0;">
        Welcome back to Strata Mundo
      </h1>

      <ul style="padding-left: 20px;">
        <li>You requested a link back to ${learners.length === 1 ? 'your math mastery voyage' : 'your math mastery voyages'}.</li>
        <li>Click ${learners.length === 1 ? 'the link' : 'a link'} below to resume.</li>
        <li>Bookmark the URL once you&apos;re in — it&apos;s the same link every time.</li>
      </ul>

      <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border: 2px solid #c2864a; border-radius: 4px;">
        <ul style="padding-left: 20px; margin: 0;">${items}</ul>
      </div>

      <p style="color: #78716c; font-style: italic; margin-top: 30px; font-size: 13px;">
        Didn&apos;t request this? You can safely ignore this email.
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
