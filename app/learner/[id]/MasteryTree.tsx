/**
 * Learner-facing mastery tree.
 *
 * Renders the 11 fractions standards as leaves on a stylized tree. The
 * trunk + 6 branches reflect the IM section structure (skipping the
 * bridge/review section 5 which has no unique standards). Each leaf is
 * colored by mastery state.
 */
import coherenceMapRaw from '@/content/coherence-map-fractions.json'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface CoherenceNode {
  id: string
  name: string
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
function standardName(id: string): string {
  return coherenceMap.nodes.find((n) => n.id === id)?.name ?? id
}

interface SectionDef {
  id: number
  shortName: string
  fullName: string
  standardIds: string[]
  /** Tip of the branch — where leaves cluster. */
  tipX: number
  tipY: number
  /** Anchor point on the trunk where the branch starts. */
  baseX: number
  baseY: number
  /** Bezier control point — bends the branch into a natural curve. */
  ctrlX: number
  ctrlY: number
  /** Side for label placement. */
  side: 'left' | 'right'
}

const SECTIONS: SectionDef[] = [
  {
    id: 1,
    shortName: 'Intro to fractions',
    fullName: 'Introduction to Fractions',
    standardIds: ['2.G.A.3', '3.G.A.2', '3.NF.A.1'],
    tipX: 110, tipY: 520,
    baseX: 270, baseY: 580,
    ctrlX: 170, ctrlY: 600,
    side: 'left',
  },
  {
    id: 2,
    shortName: 'Number line',
    fullName: 'Fractions on the Number Line',
    standardIds: ['3.NF.A.2.a', '3.NF.A.2.b'],
    tipX: 490, tipY: 520,
    baseX: 330, baseY: 580,
    ctrlX: 430, ctrlY: 600,
    side: 'right',
  },
  {
    id: 3,
    shortName: 'Equivalent fractions',
    fullName: 'Equivalent Fractions',
    standardIds: ['3.NF.A.3.a', '3.NF.A.3.b', '3.NF.A.3.c'],
    tipX: 80, tipY: 320,
    baseX: 270, baseY: 440,
    ctrlX: 130, ctrlY: 410,
    side: 'left',
  },
  {
    id: 4,
    shortName: 'Comparing fractions',
    fullName: 'Fraction Comparisons',
    standardIds: ['3.NF.A.3.d'],
    tipX: 520, tipY: 320,
    baseX: 330, baseY: 440,
    ctrlX: 470, ctrlY: 410,
    side: 'right',
  },
  // Section 5 (Size and Location of Fractions) is a bridge/review with
  // no unique standards — omitted from the tree.
  {
    id: 6,
    shortName: 'Equivalence (4th)',
    fullName: 'Equivalent Fractions (4th grade)',
    standardIds: ['4.NF.A.1'],
    tipX: 140, tipY: 130,
    baseX: 280, baseY: 320,
    ctrlX: 180, ctrlY: 220,
    side: 'left',
  },
  {
    id: 7,
    shortName: 'Comparison (4th)',
    fullName: 'Fraction Comparison (4th grade)',
    standardIds: ['4.NF.A.2'],
    tipX: 460, tipY: 130,
    baseX: 320, baseY: 320,
    ctrlX: 420, ctrlY: 220,
    side: 'right',
  },
]

const TRUNK_PATH =
  // Tapered trunk from a wide base at y=680 to a narrow neck at y=300
  'M 270 680 ' +
  'C 268 600, 282 540, 280 480 ' +
  'C 278 420, 290 360, 290 300 ' +
  'L 310 300 ' +
  'C 310 360, 322 420, 320 480 ' +
  'C 318 540, 332 600, 330 680 Z'

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
}

export default function MasteryTree({ masteryMap }: Props) {
  const stateOf = (sid: string): StandardState =>
    masteryMap?.standards?.[sid]?.state ?? 'not_assessed'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox="0 0 600 720"
        className="w-full h-auto"
        aria-label="Mastery tree visualization"
      >
        <defs>
          {/* Soft ground shadow under the tree. */}
          <radialGradient id="ground-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,0,0,0.15)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          {/* Subtle leaf gradient for a touch of depth. */}
          <linearGradient id="leaf-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="leaf-yellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="leaf-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        {/* Ground */}
        <ellipse cx="300" cy="690" rx="220" ry="14" fill="url(#ground-shadow)" />

        {/* Trunk */}
        <path d={TRUNK_PATH} fill="#8b5e3c" stroke="#5a3a22" strokeWidth="1.2" />
        {/* Trunk grain for texture */}
        <path d="M 285 600 C 290 540, 295 480, 290 420" stroke="#6e4424" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M 305 620 C 305 560, 300 490, 308 430" stroke="#6e4424" strokeWidth="1" fill="none" opacity="0.5" />

        {/* Branches */}
        {SECTIONS.map((s) => (
          <Branch key={s.id} section={s} />
        ))}

        {/* Leaves clustered at each branch tip */}
        {SECTIONS.map((s) => (
          <LeafCluster
            key={`leaves-${s.id}`}
            section={s}
            stateOf={stateOf}
          />
        ))}

        {/* Section labels */}
        {SECTIONS.map((s) => (
          <SectionLabel key={`label-${s.id}`} section={s} />
        ))}
      </svg>

      <Legend />

      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-stone-600 dark:text-zinc-400 font-medium">
          Standard-by-standard list
        </summary>
        <ul className="mt-3 flex flex-col gap-2 text-stone-700 dark:text-zinc-300">
          {SECTIONS.flatMap((s) =>
            s.standardIds.map((sid) => (
              <li
                key={sid}
                className="flex items-center gap-3 rounded-md border border-stone-200 dark:border-zinc-800 px-3 py-2"
              >
                <StateDot state={stateOf(sid)} />
                <span className="font-medium">{standardName(sid)}</span>
                <span className="text-xs font-mono text-stone-500 dark:text-zinc-500">
                  {sid}
                </span>
                <span className="ml-auto text-xs text-stone-500 dark:text-zinc-500 italic">
                  {s.fullName}
                </span>
              </li>
            ))
          )}
        </ul>
      </details>
    </div>
  )
}

function Branch({ section }: { section: SectionDef }) {
  const d = `M ${section.baseX} ${section.baseY} Q ${section.ctrlX} ${section.ctrlY}, ${section.tipX} ${section.tipY}`
  return (
    <path
      d={d}
      stroke="#8b5e3c"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
  )
}

function LeafCluster({
  section,
  stateOf,
}: {
  section: SectionDef
  stateOf: (sid: string) => StandardState
}) {
  const n = section.standardIds.length
  // Arrange leaves around the tip in a small fan.
  const radius = 20
  return (
    <g>
      {section.standardIds.map((sid, i) => {
        // Distribute angularly around tip — fan width depends on count.
        const angle =
          n === 1
            ? -Math.PI / 2
            : -Math.PI / 2 + (i - (n - 1) / 2) * 0.55
        const cx = section.tipX + radius * Math.cos(angle)
        const cy = section.tipY + radius * Math.sin(angle)
        return (
          <Leaf
            key={sid}
            cx={cx}
            cy={cy}
            angle={angle}
            state={stateOf(sid)}
            label={sid}
          />
        )
      })}
    </g>
  )
}

function Leaf({
  cx,
  cy,
  angle,
  state,
  label,
}: {
  cx: number
  cy: number
  angle: number
  state: StandardState
  label: string
}) {
  // Teardrop: an ellipse rotated to "hang" naturally from its stem.
  const rotate = (angle * 180) / Math.PI + 90
  const fill = leafFill(state)
  const stroke = leafStroke(state)
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotate})`}>
      <title>{`${label} — ${stateLabel(state)}`}</title>
      <ellipse
        cx="0"
        cy="0"
        rx="9"
        ry="13"
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
      />
      {/* Subtle midrib */}
      <line x1="0" y1="-13" x2="0" y2="13" stroke="rgba(0,0,0,0.15)" strokeWidth="0.6" />
    </g>
  )
}

function leafFill(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return 'url(#leaf-green)'
    case 'working':
      return 'url(#leaf-yellow)'
    case 'misconception':
      return 'url(#leaf-red)'
    case 'not_assessed':
      return '#e7e5e4' // pale stone — bare leaf outline feel
  }
}
function leafStroke(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return '#047857'
    case 'working':
      return '#b45309'
    case 'misconception':
      return '#b91c1c'
    case 'not_assessed':
      return '#a8a29e'
  }
}
function stateLabel(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return 'Mastered'
    case 'working':
      return 'Working on'
    case 'misconception':
      return 'Needs attention'
    case 'not_assessed':
      return 'Not yet probed'
  }
}

function SectionLabel({ section }: { section: SectionDef }) {
  const labelX = section.tipX + (section.side === 'left' ? -30 : 30)
  const labelY = section.tipY + 40
  const anchor = section.side === 'left' ? 'end' : 'start'
  return (
    <g>
      <text
        x={labelX}
        y={labelY}
        fontSize="13"
        fontWeight="500"
        textAnchor={anchor}
        fill="#44403c"
        className="dark:[fill:#d4d4d8]"
      >
        {section.shortName}
      </text>
      <text
        x={labelX}
        y={labelY + 14}
        fontSize="10"
        textAnchor={anchor}
        fill="#78716c"
        className="dark:[fill:#a1a1aa]"
      >
        {section.standardIds.length} {section.standardIds.length === 1 ? 'standard' : 'standards'}
      </text>
    </g>
  )
}

function Legend() {
  return (
    <div className="mt-4 flex items-center justify-center gap-5 text-xs text-stone-600 dark:text-zinc-400">
      <LegendItem state="demonstrated" />
      <LegendItem state="working" />
      <LegendItem state="misconception" />
      <LegendItem state="not_assessed" />
    </div>
  )
}

function LegendItem({ state }: { state: StandardState }) {
  return (
    <div className="flex items-center gap-1.5">
      <StateDot state={state} />
      <span>{stateLabel(state)}</span>
    </div>
  )
}

function StateDot({ state }: { state: StandardState }) {
  const stroke = leafStroke(state)
  const fill = state === 'not_assessed' ? '#e7e5e4' : leafFill(state)
  return (
    <span
      className="inline-block h-3 w-3 rounded-full border"
      style={{
        background: fill.startsWith('url(') ? undefined : fill,
        borderColor: stroke,
        backgroundImage: fill.startsWith('url(') ? `linear-gradient(to bottom, ${gradientStops(state).top}, ${gradientStops(state).bottom})` : undefined,
      }}
      aria-hidden
    />
  )
}

function gradientStops(state: StandardState): { top: string; bottom: string } {
  switch (state) {
    case 'demonstrated':
      return { top: '#6ee7b7', bottom: '#059669' }
    case 'working':
      return { top: '#fde68a', bottom: '#f59e0b' }
    case 'misconception':
      return { top: '#fca5a5', bottom: '#ef4444' }
    case 'not_assessed':
      return { top: '#e7e5e4', bottom: '#e7e5e4' }
  }
}
