import Link from 'next/link'
import { Gear } from './Ornament'

/**
 * Global top navigation. Server component.
 *
 * Bold steampunk: dark mahogany ground with brass-deep border, brass
 * wordmark with a slowly-turning gear. Cinzel small caps everywhere.
 */
export default function TopNav() {
  return (
    <nav className="w-full border-b-2 border-brass-deep bg-background sticky top-0 z-30 shadow-[0_2px_12px_oklch(0_0_0/0.4)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-cream hover:text-brass-glow transition-colors"
        >
          <Gear
            teeth={10}
            className="h-6 w-6 text-brass-glow animate-turn-slow drop-shadow-[0_0_6px_oklch(0.86_0.16_88/0.5)]"
          />
          <span
            className="text-base font-bold uppercase"
            style={{
              fontFamily: 'var(--font-cinzel)',
              letterSpacing: '0.22em',
              color: 'oklch(0.95 0.06 85)',
              textShadow: '0 0 8px oklch(0.74 0.14 80 / 0.4)',
            }}
          >
            Strata Mundo
          </span>
        </Link>

        <ul
          className="flex items-center gap-1 text-[11px]"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          <NavLink href="/" label="Home" />
          <NavLink href="/methodology" label="Methodology" />
          <NavLink href="/setup" label="New learner" />
          <li>
            <a
              href="https://github.com/barbarajauregui-dadababa/fractions-mastery-tracker"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 uppercase text-cream-soft hover:text-brass-glow transition-colors"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="px-3 py-1.5 uppercase text-cream hover:text-brass-glow hover:underline hover:decoration-brass hover:decoration-1 hover:underline-offset-4 transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}
