/**
 * Shared layout for every Strata Mundo transactional email — warm tan
 * ground with the Denis cloudscape as a faint header strip, cream paper
 * card with brass-deep border, brand wordmark + ornamental rule at the
 * top, footer line at the bottom.
 *
 * Caller passes the body HTML (greeting + bullets + CTA, etc.) and a
 * one-line footer string. Welcome, contributor, and resume emails all
 * use this so they look consistent and match the website's brass +
 * cream + cloudscape palette.
 */
export function emailLayout({
  cloudscapeUrl,
  body,
  footerLine,
}: {
  cloudscapeUrl: string
  body: string
  footerLine: string
}): string {
  return `
    <div style="background: #d8c596; padding: 24px 16px; font-family: Georgia, 'Times New Roman', serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 600px; width: 100%; margin: 0 auto; background: #fbf6e7; border: 2px solid #92400e; border-collapse: separate;">
        <!-- Cloudscape header strip -->
        <tr>
          <td style="padding: 0; line-height: 0; font-size: 0;">
            <img src="${cloudscapeUrl}" alt="" width="600" height="80" style="display: block; width: 100%; height: 80px; object-fit: cover;">
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 36px 28px;">

            <!-- Brand wordmark + tagline -->
            <div style="text-align: center;">
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; letter-spacing: 0.4em; text-transform: uppercase; color: #92400e; font-weight: bold;">
                &diams; Strata Mundo &diams;
              </p>
              <p style="margin: 6px 0 0; font-family: Georgia, serif; font-style: italic; font-size: 14px; color: #78716c;">
                Your math mastery voyage.
              </p>
            </div>

            <!-- Brass ornamental rule -->
            <div style="text-align: center; margin: 22px 0 28px;">
              <span style="display: inline-block; height: 1px; width: 90px; background: #92400e; vertical-align: middle;"></span>
              <span style="display: inline-block; color: #92400e; font-size: 13px; padding: 0 10px; vertical-align: middle;">&diams;</span>
              <span style="display: inline-block; height: 1px; width: 90px; background: #92400e; vertical-align: middle;"></span>
            </div>

            ${body}

            <!-- Closing rule -->
            <div style="text-align: center; margin: 24px 0 18px;">
              <span style="display: inline-block; height: 1px; width: 60px; background: #c2864a; vertical-align: middle;"></span>
            </div>

            <p style="font-family: Georgia, serif; font-size: 12px; line-height: 1.6; color: #78716c; font-style: italic; text-align: center; margin: 0;">
              ${footerLine}
            </p>

          </td>
        </tr>
      </table>
    </div>
  `
}

export function escapeEmailHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
