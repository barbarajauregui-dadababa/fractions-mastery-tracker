'use client'

import { useEffect, useState } from 'react'
import ModalityGlyph, { modalityLabel } from './ModalityGlyph'

const ALL_MODS = ['video', 'manipulative', 'game_or_interactive', 'worksheet', 'other'] as const
type Modality = (typeof ALL_MODS)[number]

const STORAGE_KEY = 'strata-modality-hidden'

/**
 * Lets the user filter the prescribed activities across all gap cards by
 * modality. Default: all five visible. Unchecking hides any ActivityTile
 * that has the matching `data-modality` attribute, via body-level CSS
 * rules in globals.css (body.hide-video, body.hide-manipulative, etc.).
 *
 * State persists in localStorage so the user's preference survives reloads.
 *
 * Render this on the report page once, anywhere above the buckets — the
 * effect is global because the body classes apply to every ActivityTile
 * on the page.
 */
export default function ModalityFilter() {
  const [hidden, setHidden] = useState<Set<Modality>>(new Set())
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        setHidden(new Set(parsed.filter((m) => ALL_MODS.includes(m as Modality)) as Modality[]))
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true)
  }, [])

  // Sync to body classes + persist.
  useEffect(() => {
    if (!hydrated) return
    const body = document.body
    for (const mod of ALL_MODS) {
      body.classList.toggle(`hide-${mod}`, hidden.has(mod))
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]))
    } catch {
      // localStorage may be unavailable (private mode, etc.) — silent fallback
    }
  }, [hidden, hydrated])

  function toggle(mod: Modality) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(mod)) next.delete(mod)
      else next.add(mod)
      return next
    })
  }

  return (
    <section
      className="rounded-sm border-2 border-brass-deep/40 bg-[oklch(0.98_0.012_78)] px-5 py-4 flex flex-col gap-3"
      style={{ fontFamily: 'var(--font-fraunces)' }}
    >
      <div
        className="text-sm tracking-[0.2em] uppercase text-brass-deep font-bold"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        ◇ Show activities of these types ◇
      </div>
      <div className="flex flex-wrap gap-3">
        {ALL_MODS.map((mod) => {
          const isVisible = !hidden.has(mod)
          return (
            <label
              key={mod}
              className={`relative inline-flex items-center gap-2 rounded-sm border-2 px-3 py-2 cursor-pointer transition-colors ${
                isVisible
                  ? 'border-brass-deep bg-brass/15 text-ink'
                  : 'border-brass-deep/30 bg-paper-deep/30 text-ink-faint'
              }`}
            >
              <input
                type="checkbox"
                checked={isVisible}
                onChange={() => toggle(mod)}
                className="sr-only"
              />
              {/* Visual checkbox indicator */}
              <span
                className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 transition-colors ${
                  isVisible ? 'border-brass-deep bg-brass-deep' : 'border-brass-deep/50 bg-paper'
                }`}
                aria-hidden
              >
                {isVisible && (
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-cream" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12.5l4.5 4.5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <ModalityGlyph modality={mod} className="h-5 w-5" />
              <span
                className="text-xs uppercase tracking-[0.1em] font-bold"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                {modalityLabel(mod)}
              </span>
            </label>
          )
        })}
      </div>
      <p
        className="text-xs text-ink-faint italic"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        Uncheck a type to hide it from the prescribed activities below.
        Your choice is remembered between visits.
      </p>
    </section>
  )
}
