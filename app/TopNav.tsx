import Link from 'next/link'

/**
 * Global top navigation. Server component — no client state.
 *
 * Rendered from the root layout so every route gets the nav.
 */
export default function TopNav() {
  return (
    <nav className="w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-stone-900 hover:text-stone-700"
        >
          Strata Mundo
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          <NavLink href="/" label="Home" />
          <NavLink href="/methodology" label="Methodology" />
          <NavLink href="/setup" label="New learner" />
          <li>
            <a
              href="https://github.com/barbarajauregui-dadababa/fractions-mastery-tracker"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 text-stone-600 hover:text-stone-900"
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
        className="px-3 py-1.5 rounded-md text-stone-700 hover:text-stone-900 hover:bg-stone-100"
      >
        {label}
      </Link>
    </li>
  )
}
