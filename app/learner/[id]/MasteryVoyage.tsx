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
import OldPhotoBalloon from '@/components/OldPhotoBalloon'
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
        {/* Left: strata without the balloon — the balloon lives big on the
            right panel, so on the voyage we leave the strata text uncovered. */}
        <StrataCloudscape masteryMap={masteryMap} showBalloon={false} />
        <ExpandedBalloonPanel masteryMap={masteryMap} />
      </div>

      {/* Standard-by-standard list — collapsible details element */}
      {masteryMap?.standards && (
        <details className="mt-8 rounded-sm border-2 border-brass-deep/40 bg-paper p-5">
          <summary
            className="cursor-pointer list-none flex items-center justify-between text-xs tracking-[0.25em] uppercase text-brass-deep"
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
                  className="text-xs tracking-[0.15em] uppercase text-ink-faint"
                  style={{ fontFamily: 'var(--font-cinzel)' }}
                >
                  {stateLabel(state)}
                </span>
                <span
                  className="text-xs font-mono text-ink-faint"
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
          className="text-xs tracking-[0.4em] uppercase text-cream-soft"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          ◇ Eleven weights · 4.NF standards ◇
        </p>
      </div>

      {/* Big balloon as old photo, centered upper-mid, static (sandbags hang from it) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{ width: '60%', top: '6%' }}
      >
        <OldPhotoBalloon size={400} showCaption={false} />
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
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-cream-soft"
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

/** Smile-shaped arc of sandbags wrapping around the balloon — edges curve
 *  up alongside the balloon body, middle dips below the basket. */
function sandbagPosition(i: number, total: number): { x: number; y: number } {
  const t = total === 1 ? 0.5 : i / (total - 1)
  const x = 10 + t * 80 // 10..90 (edges close to balloon's outer silhouette)
  // Parabolic dip: 0 at edges, 1 at middle. Edges sit at y_top (alongside
  // the balloon's mid-body), middle sits at y_bot (just below the basket).
  const dip = 1 - 4 * Math.pow(t - 0.5, 2)
  const y = 30 + dip * 46 // 30..76
  return { x, y }
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
  // Period-engraving palette: dark sepia ink for outlines and hatching,
  // muted earth-tone fill that signals state without screaming "cartoon".
  const ink = 'oklch(0.22 0.04 55)'
  const inkSoft = 'oklch(0.32 0.045 55)'
  const fill = sandbagFill(state)
  return (
    <div
      className="absolute pointer-events-auto group"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, 0)' }}
      role="img"
      aria-label={title}
    >
      {/* Custom hover tooltip — appears immediately on mouseover with the
          standard name. Replaces the slow native `title` tooltip. */}
      <div
        className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 whitespace-nowrap rounded-sm border-2 border-brass-deep bg-paper px-2.5 py-1 text-xs text-ink shadow-[0_4px_10px_oklch(0_0_0/0.5)] pointer-events-none"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.06em' }}
      >
        {title}
      </div>
      <svg
        width="28"
        height="42"
        viewBox="0 0 28 42"
        className="drop-shadow-[0_2px_3px_oklch(0_0_0/0.5)] hover:scale-110 transition-transform cursor-pointer"
      >
        {/* Hanging rope — dark ink, slight twist */}
        <line x1="14" y1="0" x2="14" y2="8" stroke={ink} strokeWidth="1.2" />
        <line x1="13.5" y1="2" x2="14.5" y2="6" stroke={ink} strokeWidth="0.4" opacity="0.7" />
        {/* Brass clasp at top of bag */}
        <ellipse cx="14" cy="9.5" rx="3.2" ry="1.6" fill="oklch(0.74 0.14 80)" stroke={ink} strokeWidth="0.5" />
        {/* Bag body — muted state-color fill */}
        <path
          d="M 6 12 Q 5 10.5 14 10.5 Q 23 10.5 22 12 L 23.5 33 Q 23.5 38 14 38 Q 4.5 38 4.5 33 Z"
          fill={fill}
          fillOpacity="0.78"
        />
        {/* Vertical fold strokes — three soft curves down the bag */}
        <path d="M 9 14 Q 9 26 10.5 36" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.6" />
        <path d="M 14 14 Q 14 26 14 37.5" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.6" />
        <path d="M 19 14 Q 19 26 17.5 36" fill="none" stroke={ink} strokeWidth="0.5" opacity="0.6" />
        {/* Cross-hatch shadow strokes on the right (engraving shading) */}
        <line x1="19.5" y1="20" x2="22" y2="26" stroke={inkSoft} strokeWidth="0.4" />
        <line x1="19.5" y1="24" x2="22.5" y2="30" stroke={inkSoft} strokeWidth="0.4" />
        <line x1="19" y1="28" x2="22" y2="34" stroke={inkSoft} strokeWidth="0.4" />
        <line x1="18.5" y1="32" x2="21" y2="36" stroke={inkSoft} strokeWidth="0.4" />
        {/* Counter-hatch (cross-direction) for deeper shadow */}
        <line x1="20" y1="22" x2="20.5" y2="34" stroke={inkSoft} strokeWidth="0.3" opacity="0.7" />
        <line x1="21.5" y1="24" x2="22" y2="34" stroke={inkSoft} strokeWidth="0.3" opacity="0.7" />
        {/* Tie ridge — sash near top of bag */}
        <path d="M 5 14 Q 14 16.5 23 14" fill="none" stroke={ink} strokeWidth="0.8" />
        <path d="M 5.5 14.8 Q 14 17 22.5 14.8" fill="none" stroke={ink} strokeWidth="0.4" opacity="0.6" />
        {/* Bag outline — heaviest ink stroke, drawn last */}
        <path
          d="M 6 12 Q 5 10.5 14 10.5 Q 23 10.5 22 12 L 23.5 33 Q 23.5 38 14 38 Q 4.5 38 4.5 33 Z"
          fill="none"
          stroke={ink}
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function sandbagFill(state: StandardState): string {
  // Earth-tone state palette so colors blend with the sepia engraving
  // line work rather than fighting it.
  switch (state) {
    case 'misconception':
      return 'oklch(0.48 0.16 25)' // muted iron-oxide red
    case 'working':
      return 'oklch(0.60 0.13 65)' // antique amber
    case 'demonstrated':
      return 'oklch(0.50 0.12 150)' // verdigris green
    case 'not_assessed':
      return 'oklch(0.62 0.025 75)' // faded parchment
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
      className="mt-6 flex items-center justify-center gap-5 flex-wrap text-xs text-cream-soft"
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
