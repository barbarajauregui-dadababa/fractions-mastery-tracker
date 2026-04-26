/**
 * Mastery Voyage — 2-column scene.
 *
 * LEFT: the 5-strata cloudscape with the balloon at the active 4.NF
 * stratum (the "you are here" view across the 4th-grade math
 * Progressions). Same component used in the report's hero.
 *
 * RIGHT: an expanded view of the balloon itself, with a sandbag for
 * each of the 11 fractions standards. Sandbags are colored by state
 * (red=misconception, amber=working, emerald=mastered, grey=not
 * yet probed). Hover reveals the standard name + state. The "11
 * weights drop as standards are mastered" mechanic ships in v1.5
 * — for now, all sandbags hang and signal state via color.
 *
 * Below both panels, a collapsible standard-by-standard list.
 */
import Image from 'next/image'
import StrataCloudscape from '@/components/StrataCloudscape'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'

interface CoherenceNode {
  id: string
  name: string
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
function standardName(id: string): string {
  return coherenceMap.nodes.find((n) => n.id === id)?.name ?? id
}

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
  /** Number of completed activities per standard. */
  completedByStandard?: Record<string, number>
}

export default function MasteryVoyage({ masteryMap }: Props) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StrataCloudscape masteryMap={masteryMap} />
        <ExpandedBalloonPanel masteryMap={masteryMap} />
      </div>

      {/* Standard-by-standard list — collapsible details element */}
      {masteryMap?.standards && (
        <details className="mt-8 rounded-sm border-2 border-brass-deep/40 bg-paper p-5">
          <summary
            className="cursor-pointer list-none flex items-center justify-between text-[10px] tracking-[0.25em] uppercase text-brass-deep"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Standard-by-standard list (11 standards)
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
                  className="text-[10px] tracking-[0.15em] uppercase text-ink-faint"
                  style={{ fontFamily: 'var(--font-cinzel)' }}
                >
                  {stateLabel(state)}
                </span>
                <span
                  className="text-[10px] font-mono text-ink-faint"
                  style={{ fontFamily: 'var(--font-special-elite)' }}
                >
                  {id}
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

/**
 * Right-side panel: the balloon enlarged, with 11 sandbag overlays
 * arranged in an arc beneath the basket. Each sandbag's color reflects
 * the state of one fractions standard. Native title attribute shows
 * the standard name on hover.
 */
function ExpandedBalloonPanel({ masteryMap }: Props) {
  const sandbags = buildSandbagList(masteryMap)
  return (
    <section
      className="relative overflow-hidden rounded-sm border-2 border-brass-deep/50 vignette"
      style={{ minHeight: 720 }}
    >
      {/* Cloudscape painting backdrop, dimmer here so balloon dominates */}
      <div className="absolute inset-0">
        <Image
          src="/images/cloudscape-denis.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          style={{ filter: 'sepia(0.25) brightness(1.0) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 35%, oklch(0.40 0.06 220 / 0.20) 0%, oklch(0.18 0.020 50 / 0.65) 60%, oklch(0.13 0.014 50 / 0.85) 100%)',
          }}
        />
      </div>

      {/* Apex label */}
      <div className="absolute top-4 left-0 right-0 text-center pointer-events-none z-10">
        <p
          className="text-[10px] tracking-[0.4em] uppercase text-cream-soft"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          ◇ Eleven weights · 4.NF standards ◇
        </p>
      </div>

      {/* Big balloon, centered upper-mid */}
      <div
        className="absolute left-1/2 -translate-x-1/2 animate-balloon-float ember-glow z-10 pointer-events-none"
        style={{ width: '62%', top: '8%' }}
      >
        <Image
          src="/images/balloon-versailles.jpg"
          alt="Airship with eleven weights for the eleven 4.NF standards"
          width={300}
          height={490}
          className="w-full h-auto"
          style={{ filter: 'sepia(0.4) brightness(1.05) contrast(1.05)', mixBlendMode: 'screen' }}
        />
      </div>

      {/* Sandbag overlays — 11 weights hanging from the basket area.
          Positioned in two rows so 11 fit cleanly without overlap.
          Each <Sandbag> uses `title` for the native hover tooltip. */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {sandbags.map((s, i) => {
          const { x, y } = sandbagPosition(i, sandbags.length)
          return (
            <Sandbag
              key={s.id}
              x={x}
              y={y}
              state={s.state}
              title={`${s.name} — ${stateLabel(s.state)} · ${s.id}`}
            />
          )
        })}
      </div>

      {/* Legend strip at bottom */}
      <div className="absolute bottom-3 left-0 right-0 px-4 z-10">
        <div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-cream-soft"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.15em' }}
        >
          <LegendDot color="bg-emerald-500" label="Mastered" />
          <LegendDot color="bg-amber-500" label="Needs work" />
          <LegendDot color="bg-red-500" label="Needs attention" />
          <LegendDot color="bg-stone-400" label="Not yet probed" />
        </div>
      </div>
    </section>
  )
}

interface SandbagEntry {
  id: string
  name: string
  state: StandardState
}

function buildSandbagList(
  masteryMap: { standards: Record<string, { state: StandardState }> } | null,
): SandbagEntry[] {
  // Always show one sandbag per Coherence Map node (11 standards).
  // If the masteryMap is missing, all default to 'not_assessed'.
  return coherenceMap.nodes.map((n) => {
    const state = masteryMap?.standards?.[n.id]?.state ?? 'not_assessed'
    return { id: n.id, name: n.name, state }
  })
}

/** Two arcs of sandbags hanging beneath the basket. */
function sandbagPosition(i: number, total: number): { x: number; y: number } {
  // Top arc gets the first 6, bottom arc the rest.
  const topRow = Math.min(6, total)
  const bottomRow = total - topRow
  if (i < topRow) {
    const t = topRow === 1 ? 0.5 : i / (topRow - 1)
    return { x: 22 + t * 56, y: 60 + Math.sin(t * Math.PI) * -3 }
  }
  const j = i - topRow
  const t = bottomRow === 1 ? 0.5 : j / (bottomRow - 1)
  return { x: 26 + t * 48, y: 75 + Math.sin(t * Math.PI) * -2 }
}

function Sandbag({
  x,
  y,
  state,
  title,
}: {
  x: number
  y: number
  state: StandardState
  title: string
}) {
  const fill = sandbagFill(state)
  const stroke = 'oklch(0.30 0.04 50)'
  return (
    <div
      className="absolute pointer-events-auto"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, 0)' }}
      title={title}
      role="img"
      aria-label={title}
    >
      <svg
        width="26"
        height="36"
        viewBox="0 0 26 36"
        className="drop-shadow-[0_2px_3px_oklch(0_0_0/0.45)] hover:scale-110 transition-transform cursor-help"
      >
        {/* Hanging rope */}
        <line x1="13" y1="0" x2="13" y2="8" stroke="oklch(0.55 0.12 70)" strokeWidth="1.2" />
        {/* Brass clasp */}
        <ellipse cx="13" cy="9.5" rx="3" ry="1.6" fill="oklch(0.74 0.14 80)" stroke={stroke} strokeWidth="0.4" />
        {/* Bag body */}
        <path
          d="M5.5 11 Q 5 9.5 13 9.5 Q 21 9.5 20.5 11 L 22 30 Q 22 34 13 34 Q 4 34 4 30 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth="0.7"
        />
        {/* Tie ridge */}
        <path
          d="M 5 14 Q 13 16 21 14"
          fill="none"
          stroke={stroke}
          strokeWidth="0.7"
          opacity="0.7"
        />
      </svg>
    </div>
  )
}

function sandbagFill(state: StandardState): string {
  switch (state) {
    case 'misconception':
      return 'oklch(0.55 0.20 25)' // red
    case 'working':
      return 'oklch(0.65 0.16 65)' // amber
    case 'demonstrated':
      return 'oklch(0.55 0.15 150)' // emerald
    case 'not_assessed':
      return 'oklch(0.60 0.020 70)' // warm stone
  }
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden />
      {label}
    </span>
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
    { color: 'bg-amber-600', label: 'Needs work' },
    { color: 'bg-red-600', label: 'Needs attention' },
    { color: 'bg-stone-400', label: 'Not yet probed' },
  ]
  return (
    <div
      className="mt-6 flex items-center justify-center gap-5 flex-wrap text-[11px] text-cream-soft"
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
