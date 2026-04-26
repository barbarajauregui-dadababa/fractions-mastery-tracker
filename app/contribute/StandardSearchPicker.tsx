'use client'

import { useMemo, useState } from 'react'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'

interface CoherenceNode {
  id: string
  name: string
  statement: string
  grade: number
  domain: string
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
const STANDARDS: CoherenceNode[] = coherenceMap.nodes

interface Props {
  selected: string[]
  onChange: (selected: string[]) => void
  /** Lock to a single standard (used by the report's "Suggest activity for this standard" entry point). */
  lockedToStandard?: string
}

export default function StandardSearchPicker({ selected, onChange, lockedToStandard }: Props) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return STANDARDS
    return STANDARDS.filter((s) => {
      return (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.statement.toLowerCase().includes(q)
      )
    })
  }, [query])

  function toggle(id: string) {
    if (lockedToStandard) return
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id))
    } else {
      onChange([...selected, id])
    }
  }

  if (lockedToStandard) {
    const node = STANDARDS.find((s) => s.id === lockedToStandard)
    return (
      <div className="rounded-sm border-2 border-brass-deep/60 bg-paper-deep/40 px-4 py-3">
        <div
          className="text-xs tracking-[0.2em] uppercase text-brass-deep mb-1"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Mapped to standard
        </div>
        <div className="text-sm text-ink" style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}>
          {node?.name ?? lockedToStandard}{' '}
          <span
            className="text-xs text-ink-faint not-italic"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            ({lockedToStandard})
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name (e.g., 'unit fractions') or by code (e.g., '3.NF.A.1')"
        className="h-10 rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      />

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((sid) => {
            const node = STANDARDS.find((s) => s.id === sid)
            return (
              <button
                key={sid}
                type="button"
                onClick={() => toggle(sid)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-brass-deep bg-brass/20 px-2 py-1 text-xs text-ink hover:bg-brass/30 transition-colors"
                style={{ fontFamily: 'var(--font-fraunces)' }}
                title="Remove"
              >
                <span className="font-semibold">{sid}</span>
                <span className="text-ink-faint">{node?.name}</span>
                <span aria-hidden className="text-brass-deep">×</span>
              </button>
            )
          })}
        </div>
      )}

      <ul className="flex flex-col gap-1 max-h-72 overflow-y-auto rounded-sm border border-stone-300/50 bg-paper p-1">
        {filtered.length === 0 && (
          <li
            className="text-sm text-ink-faint italic px-3 py-2"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            No matches.
          </li>
        )}
        {filtered.map((s) => {
          const isSelected = selected.includes(s.id)
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className={`w-full text-left rounded-sm px-3 py-2 transition-colors ${
                  isSelected ? 'bg-brass/20' : 'hover:bg-paper-deep/40'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-xs text-brass-deep"
                    style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.1em' }}
                  >
                    {s.id}
                  </span>
                  <span
                    className="text-sm text-ink flex-1"
                    style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                  >
                    {s.name}
                  </span>
                  <span
                    className="text-xs text-ink-faint italic"
                    style={{ fontFamily: 'var(--font-fraunces)' }}
                  >
                    Grade {s.grade}
                  </span>
                </div>
                <div
                  className="mt-1 text-xs text-ink-soft leading-snug"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {s.statement}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      <p
        className="text-xs text-ink-faint italic"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        Click a standard to add or remove. Multiple standards are allowed for activities that span concepts.
      </p>
    </div>
  )
}
