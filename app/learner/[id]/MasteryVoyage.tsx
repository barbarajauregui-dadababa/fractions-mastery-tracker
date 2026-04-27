/**
 * Mastery Voyage — single-column page that mirrors the report's strata
 * image at full size, plus a standard-by-standard list below.
 *
 * Per Barbara, post-demo: removed the right-side ExpandedBalloonPanel
 * (the big balloon with sandbags). The voyage now reads as one canonical
 * view of "where the learner is across the 5 progressions of 4th-grade
 * math." Same StrataCloudscape compact strip the report shows, without
 * a competing second column.
 */
import StrataCloudscape from '@/components/StrataCloudscape'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'

interface CoherenceNode {
  id: string
  statement: string
  role?: 'prerequisite' | 'core'
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
function standardName(id: string): string {
  const node = coherenceMap.nodes.find((n) => n.id === id)
  if (!node) return id
  const stmt = node.statement
  const semi = stmt.indexOf(';')
  const period = stmt.indexOf('. ')
  const cut = [semi, period].filter((i) => i > 0).sort((a, b) => a - b)[0]
  if (cut !== undefined) return stmt.slice(0, cut).trim()
  if (stmt.length > 100) return stmt.slice(0, 97).trim() + '…'
  return stmt
}
function standardIsPrerequisite(id: string): boolean {
  return coherenceMap.nodes.find((n) => n.id === id)?.role === 'prerequisite'
}

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
  /** Number of completed activities per standard. Reserved for future use. */
  completedByStandard?: Record<string, number>
}

export default function MasteryVoyage({ masteryMap }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* Non-compact mode = much taller stratum bands so the balloon fits
          inside one band, plus the count chips ("Mastered" / "Building the
          skill" / "Misconception detected" / "Not yet probed") show inside
          the active 4.NF stratum. */}
      <StrataCloudscape masteryMap={masteryMap} showBalloon={true} />

      {masteryMap?.standards && (
        <details className="rounded-sm border-2 border-brass-deep/40 bg-paper p-5">
          <summary
            className="cursor-pointer list-none flex items-center justify-between text-sm tracking-[0.25em] uppercase text-brass-deep"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Standards in Progression: Number and Operations — Fractions
            <span className="text-ink-faint">▼</span>
          </summary>
          <ul className="mt-4 flex flex-col gap-2">
            {sortedStandards(masteryMap.standards).map(({ id, state }) => (
              <li
                key={id}
                className="flex items-baseline gap-3 text-sm border-b border-stone-300/50 last:border-0 pb-2 last:pb-0"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full shrink-0 mt-1.5 ${stateDot(state)}`}
                  aria-hidden
                />
                <span className="text-ink flex-1">{standardName(id)}</span>
                <span
                  className="text-sm tracking-[0.15em] uppercase text-ink-faint"
                  style={{ fontFamily: 'var(--font-cinzel)' }}
                >
                  {stateLabel(state)}
                </span>
                <span
                  className="text-xs font-mono text-ink-faint"
                  style={{ fontFamily: 'var(--font-special-elite)' }}
                >
                  {id}{standardIsPrerequisite(id) ? ' · prerequisite' : ''}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <Legend />
    </div>
  )
}

function sortedStandards(
  standards: Record<string, { state: StandardState }>,
): { id: string; state: StandardState }[] {
  const order: Record<StandardState, number> = {
    misconception: 0,
    working: 1,
    not_assessed: 2,
    demonstrated: 3,
  }
  return Object.entries(standards)
    .map(([id, v]) => ({ id, state: v.state }))
    .sort((a, b) => order[a.state] - order[b.state] || a.id.localeCompare(b.id))
}

function stateLabel(state: StandardState): string {
  switch (state) {
    case 'misconception':
      return 'Needs attention'
    case 'working':
      return 'Needs work'
    case 'demonstrated':
      return 'Mastered'
    case 'not_assessed':
      return 'Not yet probed'
  }
}

function stateDot(state: StandardState): string {
  switch (state) {
    case 'misconception':
      return 'bg-red-600'
    case 'working':
      return 'bg-amber-600'
    case 'demonstrated':
      return 'bg-emerald-600'
    case 'not_assessed':
      return 'bg-stone-400'
  }
}

function Legend() {
  const items: { color: string; label: string }[] = [
    { color: 'bg-emerald-600', label: 'Mastered' },
    { color: 'bg-amber-600', label: 'Building the skill' },
    { color: 'bg-red-600', label: 'Misconception detected' },
    { color: 'bg-stone-400', label: 'Not yet probed' },
  ]
  return (
    <div
      className="flex items-center justify-center gap-5 flex-wrap text-xs text-cream-soft"
      style={{ fontFamily: 'var(--font-special-elite)' }}
    >
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${it.color}`} aria-hidden />
          {it.label}
        </span>
      ))}
    </div>
  )
}
