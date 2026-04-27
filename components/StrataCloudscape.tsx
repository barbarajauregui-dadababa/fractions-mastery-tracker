/**
 * Shared visual: the 5 CCSS-M Progressions a 4th grader builds toward, as
 * cloud strata, with the Denis cloudscape painting as full-bleed backdrop.
 * Used as:
 *   - Left half of the Mastery Voyage page
 *   - Hero image at the top of the Mastery Report
 *
 * Strata are labeled by their published Progressions document title (verified
 * 2026-04-26 against the Achieve the Core Progressions list — "Draft K–6
 * Geometry", "Draft K–5 Measurement and Data", "Draft 3–5 Number and
 * Operations — Fractions", etc.). Per Barbara: drop the per-row CCSS code
 * chips so each band reads as the published progression title only.
 *
 * Each stratum has an inline (i) disclosure (<details>/<summary>, no client
 * JS) that lists the standards in that progression up through grade 4,
 * including prerequisite standards from neighboring domains. For the active
 * NF progression the list comes from coherence-map-fractions.json. For the
 * other 4 progressions the list is "Coming in v1.5 — full standard list
 * pending curation" until progressions-overview.json is built out.
 *
 * Active stratum (Number and Operations — Fractions) is brass-bordered
 * parchment with a glow shadow.
 */
import Image from 'next/image'
import OldPhotoBalloon from './OldPhotoBalloon'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface CoherenceNode {
  id: string
  statement: string
  cluster_heading?: string
  role?: 'prerequisite' | 'core'
  layer?: number
  khan_urls?: { title: string; url: string }[]
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
function shortLabel(stmt: string): string {
  const semi = stmt.indexOf(';')
  const period = stmt.indexOf('. ')
  const cut = [semi, period].filter((i) => i > 0).sort((a, b) => a - b)[0]
  if (cut !== undefined) return stmt.slice(0, cut).trim()
  return stmt.length > 100 ? stmt.slice(0, 97).trim() + '…' : stmt
}

interface ProgressionDef {
  /** Published Progressions document title (verbatim from Achieve the Core,
   *  with "Draft" dropped for visual brevity). */
  title: string
  status: 'active' | 'v15'
  index: number
}

const PROGRESSIONS: ProgressionDef[] = [
  { title: 'Geometry', status: 'v15', index: 5 },
  { title: 'Measurement and Data', status: 'v15', index: 4 },
  { title: 'Number and Operations — Fractions', status: 'active', index: 3 },
  { title: 'Operations and Algebraic Thinking', status: 'v15', index: 2 },
  { title: 'Number and Operations in Base Ten', status: 'v15', index: 1 },
]

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
  /** Compact mode (legacy use): shorter strata, smaller balloon, no apex/foundation labels. */
  compact?: boolean
  /** Show the balloon at the active stratum. Defaults true. */
  showBalloon?: boolean
  /** Optional child rendered at the bottom-right inside the panel — used by
   *  the report to embed the "Open mastery voyage →" link as a brass cartouche. */
  bottomRightSlot?: React.ReactNode
}

export default function StrataCloudscape({ masteryMap, compact = false, showBalloon = true, bottomRightSlot }: Props) {
  const counts = { demonstrated: 0, working: 0, misconception: 0, not_assessed: 0 }
  if (masteryMap?.standards) {
    for (const entry of Object.values(masteryMap.standards)) {
      counts[entry.state] = (counts[entry.state] ?? 0) + 1
    }
  }
  const totalProbed = counts.demonstrated + counts.working + counts.misconception
  const totalStandards = totalProbed + counts.not_assessed

  return (
    <section
      className="relative overflow-hidden rounded-sm border-2 border-brass-deep/50 vignette"
      style={{ minHeight: compact ? 360 : 980 }}
    >
      {/* Cloudscape painting full-bleed backdrop */}
      <div className="absolute inset-0">
        <Image
          src="/images/cloudscape-denis.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          style={{ filter: 'sepia(0.15) brightness(1.05) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.30 0.04 230 / 0.45) 0%, oklch(0.40 0.06 220 / 0.30) 30%, oklch(0.45 0.05 75 / 0.20) 60%, oklch(0.20 0.05 50 / 0.55) 92%, oklch(0.13 0.014 50 / 0.85) 100%)',
          }}
        />
      </div>

      {!compact && (
        <div className="absolute top-3 left-0 right-0 text-center pointer-events-none px-4">
          <span
            className="inline-block rounded-sm px-4 py-1.5 text-sm sm:text-base tracking-[0.32em] uppercase font-bold"
            style={{
              fontFamily: 'var(--font-cinzel)',
              color: 'oklch(1 0 0)',
              background: 'oklch(0.13 0.014 50 / 0.72)',
              border: '1px solid oklch(0.74 0.14 80 / 0.45)',
              boxShadow: '0 2px 12px oklch(0 0 0 / 0.5)',
              textShadow: '0 1px 2px oklch(0 0 0 / 0.95)',
            }}
          >
            ◇ Progressions up to 4th grade with prerequisites ◇
          </span>
        </div>
      )}

      <ol className={`relative z-10 flex flex-col gap-1 px-4 sm:px-8 ${compact ? 'pt-6 pb-6' : 'pt-16 pb-20'}`}>
        {PROGRESSIONS.map((p) => (
          <ProgressionStratum
            key={p.title}
            progression={p}
            compact={compact}
            counts={p.status === 'active' ? counts : null}
            totalProbed={p.status === 'active' ? totalProbed : 0}
            totalStandards={p.status === 'active' ? totalStandards : 0}
          />
        ))}
      </ol>

      {showBalloon && (
        <div
          className="absolute pointer-events-none z-20"
          style={{
            width: 110,
            top: compact ? '36%' : '37%',
            left: compact ? '50%' : '63%',
            transform: 'translateX(-50%)',
          }}
        >
          <OldPhotoBalloon size={110} tilt={-2} motion="rise" />
        </div>
      )}

      {!compact && (
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none px-4">
          <span
            className="inline-block rounded-sm px-4 py-1.5 text-sm sm:text-base tracking-[0.32em] uppercase font-bold"
            style={{
              fontFamily: 'var(--font-cinzel)',
              color: 'oklch(1 0 0)',
              background: 'oklch(0.13 0.014 50 / 0.72)',
              border: '1px solid oklch(0.74 0.14 80 / 0.45)',
              boxShadow: '0 2px 12px oklch(0 0 0 / 0.5)',
              textShadow: '0 1px 2px oklch(0 0 0 / 0.95)',
            }}
          >
            ◇ Starting point ◇
          </span>
        </div>
      )}

      {bottomRightSlot && (
        <div className="absolute bottom-3 right-3 z-30">{bottomRightSlot}</div>
      )}
    </section>
  )
}

function ProgressionStratum({
  progression,
  compact,
  counts,
  totalProbed,
  totalStandards,
}: {
  progression: ProgressionDef
  compact: boolean
  counts: { demonstrated: number; working: number; misconception: number; not_assessed: number } | null
  totalProbed: number
  totalStandards: number
}) {
  const active = progression.status === 'active'
  // For non-compact active stratum: chips stacked underneath the title on
  // the LEFT half. The right portion of the band stays empty so the
  // balloon (rendered at panel level, biased right) sits inside without
  // overlapping any text.
  if (!compact && active && counts) {
    return (
      <li
        className="relative flex items-start gap-3 px-4 py-8 sm:py-10 rounded-sm transition-colors border-2 border-brass-glow bg-paper/85 backdrop-blur-sm shadow-[0_0_25px_oklch(0.74_0.14_80/0.45)]"
      >
        <div className="flex flex-col gap-2 max-w-[55%]">
          <div className="flex items-baseline gap-2">
            <h3
              className="text-base sm:text-lg leading-snug text-ink"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              {progression.title}
            </h3>
            <ProgressionInfo progression={progression} />
          </div>
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-ink-soft"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <CountChip label="Mastered" value={counts.demonstrated} colorClass="bg-emerald-600" />
            <CountChip label="Building" value={counts.working} colorClass="bg-amber-600" />
            <CountChip label="Misconception" value={counts.misconception} colorClass="bg-red-600" />
            <CountChip label="Not yet probed" value={counts.not_assessed} colorClass="bg-stone-400" />
          </div>
          {totalProbed > 0 && (
            <p
              className="text-xs text-ink-faint italic"
              style={{ fontFamily: 'var(--font-special-elite)' }}
            >
              {totalProbed} of {totalStandards} standards probed so far.
            </p>
          )}
        </div>
      </li>
    )
  }

  // Default render: inactive strata (and compact mode) — flex-row layout.
  return (
    <li
      className={`relative flex items-center gap-3 px-3 ${compact ? 'py-2' : 'py-10 sm:py-12'} rounded-sm transition-colors ${
        active
          ? 'border-2 border-brass-glow bg-paper/85 backdrop-blur-sm shadow-[0_0_25px_oklch(0.74_0.14_80/0.45)]'
          : 'border border-cream-faint/30 bg-background/40 backdrop-blur-sm opacity-70'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <h3
            className={`${compact ? 'text-sm' : 'text-base sm:text-lg'} leading-snug ${
              active ? 'text-ink' : ''
            }`}
            style={{
              fontFamily: 'var(--font-fraunces)',
              fontWeight: 600,
              ...(active
                ? {}
                : {
                    color: 'oklch(0.96 0.04 85)',
                    textShadow:
                      '0 1px 3px oklch(0 0 0 / 0.85), 0 0 10px oklch(0 0 0 / 0.55)',
                  }),
            }}
          >
            {progression.title}
          </h3>
          {!compact && <ProgressionInfo progression={progression} />}
        </div>
        {!compact && !active && (
          <p
            className="mt-1 text-xs italic tracking-[0.15em] uppercase"
            style={{
              fontFamily: 'var(--font-cinzel)',
              color: 'oklch(0.86 0.06 80)',
              textShadow: '0 1px 2px oklch(0 0 0 / 0.8)',
            }}
          >
            Coming in v1.5
          </p>
        )}
      </div>
    </li>
  )
}

/** Inline (i) disclosure: <details>/<summary> shows the standards in the
 *  progression. For the active NF progression we list every standard from the
 *  coherence map, with its code, first-clause label, and Khan exercise links.
 *  For the other 4 progressions, a placeholder until progressions-overview.json
 *  is built out. */
function ProgressionInfo({ progression }: { progression: ProgressionDef }) {
  const isNF = progression.title === 'Number and Operations — Fractions'
  const nodes = isNF
    ? [...coherenceMap.nodes].sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0))
    : []
  return (
    <details className="inline-block group align-baseline">
      <summary
        className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-brass-deep/50 text-brass-deep text-xs cursor-pointer hover:bg-brass/10 transition-colors list-none select-none"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
        aria-label={`Standards in the ${progression.title} progression`}
      >
        i
      </summary>
      <div
        className="mt-2 rounded-sm border border-brass-deep/30 bg-paper/95 backdrop-blur-sm p-3 max-w-[520px] text-xs text-ink"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        <p
          className="text-[0.7rem] tracking-[0.18em] uppercase text-brass-deep mb-2"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Standards in this progression up to grade 4
        </p>
        {isNF ? (
          <ul className="flex flex-col gap-2">
            {nodes.map((n) => (
              <li key={n.id} className="leading-snug">
                <span
                  className="font-mono text-[0.7rem] text-brass-deep mr-1.5"
                  style={{ fontFamily: 'var(--font-special-elite)' }}
                >
                  {n.id}
                </span>
                {n.role === 'prerequisite' && (
                  <span
                    className="text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint mr-1.5"
                    style={{ fontFamily: 'var(--font-cinzel)' }}
                  >
                    (prerequisite)
                  </span>
                )}
                <span className="text-ink-soft">{shortLabel(n.statement)}</span>
                {n.khan_urls && n.khan_urls.length > 0 && (
                  <span className="ml-1.5 text-[0.7rem]">
                    {n.khan_urls.slice(0, 3).map((k, i) => (
                      <span key={k.url}>
                        {i > 0 && <span className="text-ink-faint">, </span>}
                        <a
                          href={k.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 underline underline-offset-2"
                        >
                          Khan: {k.title}
                        </a>
                      </span>
                    ))}
                    {n.khan_urls.length > 3 && (
                      <span className="text-ink-faint"> … (+{n.khan_urls.length - 3} more)</span>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-ink-soft">
            Coming in v1.5 — the full K-4 standard list for this progression is pending curation.
          </p>
        )}
      </div>
    </details>
  )
}

function CountChip({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} aria-hidden />
      <span className="text-ink-soft">
        <strong className="text-ink">{value}</strong> {label.toLowerCase()}
      </span>
    </span>
  )
}
