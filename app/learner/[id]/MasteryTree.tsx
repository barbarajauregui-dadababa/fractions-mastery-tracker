/**
 * Learner-facing mastery tree.
 *
 * Renders the 11 fractions standards as leaves on a stylized tree. The
 * trunk + 6 branches reflect the IM section structure (skipping the
 * bridge/review section 5 which has no unique standards). Each leaf is
 * colored by mastery state.
 */
import { standardName } from '@/lib/standard-labels'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

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
  /** Count of completed activities targeting each standard. Drives flower count. */
  completedByStandard?: Record<string, number>
}

export default function MasteryTree({ masteryMap, completedByStandard }: Props) {
  const stateOf = (sid: string): StandardState =>
    masteryMap?.standards?.[sid]?.state ?? 'not_assessed'
  const completedFor = (sid: string): number =>
    completedByStandard?.[sid] ?? 0
  const sectionMastered = (s: SectionDef): boolean =>
    s.standardIds.length > 0 &&
    s.standardIds.every((sid) => stateOf(sid) === 'demonstrated')

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox="0 0 600 720"
        className="w-full h-auto"
        aria-label="Mastery tree visualization"
      >
        <defs>
          {/* Soft ground shadow under the tree — kept; subtle and grounding. */}
          <radialGradient id="ground-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Ground shadow under the tree */}
        <ellipse cx="300" cy="690" rx="220" ry="10" fill="url(#ground-shadow)" />

        {/* Trunk — calmer, less saturated brown */}
        <path d={TRUNK_PATH} fill="#6b5544" stroke="#4a392c" strokeWidth="1" />
        {/* Trunk grain — subtle */}
        <path d="M 285 600 C 290 540, 295 480, 290 420" stroke="#56432f" strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M 305 620 C 305 560, 300 490, 308 430" stroke="#56432f" strokeWidth="1" fill="none" opacity="0.4" />

        {/* Branches */}
        {SECTIONS.map((s) => (
          <Branch key={s.id} section={s} />
        ))}

        {/* Fruits — drawn before leaves so leaves overlap them slightly */}
        {SECTIONS.filter(sectionMastered).map((s) => (
          <FruitCluster key={`fruit-${s.id}`} section={s} />
        ))}

        {/* Leaves clustered at each branch tip */}
        {SECTIONS.map((s) => (
          <LeafCluster
            key={`leaves-${s.id}`}
            section={s}
            stateOf={stateOf}
            completedFor={completedFor}
          />
        ))}

        {/* Section labels */}
        {SECTIONS.map((s) => (
          <SectionLabel key={`label-${s.id}`} section={s} />
        ))}
      </svg>

      <Legend />

      <details className="mt-6 text-sm">
        <summary className="cursor-pointer text-stone-600 dark:text-stone-400 font-medium">
          Standard-by-standard list
        </summary>
        <ul className="mt-3 flex flex-col gap-2 text-stone-700 dark:text-stone-300">
          {SECTIONS.flatMap((s) =>
            s.standardIds.map((sid) => (
              <li
                key={sid}
                className="flex items-center gap-3 rounded-md border border-stone-200 dark:border-stone-800 px-3 py-2"
              >
                <StateDot state={stateOf(sid)} />
                <span className="font-medium">{standardName(sid)}</span>
                <span className="text-xs font-mono text-stone-500 dark:text-stone-500">
                  {sid}
                </span>
                <span className="ml-auto text-xs text-stone-500 dark:text-stone-500 italic">
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
  completedFor,
}: {
  section: SectionDef
  stateOf: (sid: string) => StandardState
  completedFor: (sid: string) => number
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
        const flowerCount = Math.min(completedFor(sid), 3) // cap at 3 to avoid clutter
        return (
          <g key={sid}>
            <Leaf
              cx={cx}
              cy={cy}
              angle={angle}
              state={stateOf(sid)}
              label={sid}
            />
            {Array.from({ length: flowerCount }).map((_, fi) => {
              // Place flowers in a small arc to one side of the leaf.
              const flowerAngle = angle + 0.6 + fi * 0.35
              const fx = cx + 14 * Math.cos(flowerAngle)
              const fy = cy + 14 * Math.sin(flowerAngle)
              return (
                <Flower
                  key={`flower-${sid}-${fi}`}
                  cx={fx}
                  cy={fy}
                />
              )
            })}
          </g>
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

function Flower({ cx, cy }: { cx: number; cy: number }) {
  // Flat 5-petal mark — deliberate, not glossy.
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <title>Practice activity completed</title>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="0"
          cy="-3.5"
          rx="2.2"
          ry="3.2"
          fill="#fda4af"
          stroke="#e11d48"
          strokeWidth="0.4"
          transform={`rotate(${deg})`}
        />
      ))}
      <circle cx="0" cy="0" r="1.4" fill="#fbbf24" />
    </g>
  )
}

function FruitCluster({ section }: { section: SectionDef }) {
  // 1–2 fruits hung along the branch curve, between baseX/Y and tipX/Y.
  // Use a parametric point on the Bezier (t=0.55, t=0.75) for natural placement.
  const fruitCount = section.standardIds.length >= 2 ? 2 : 1
  const positions = fruitCount === 2 ? [0.55, 0.78] : [0.65]
  return (
    <g>
      {positions.map((t, i) => {
        const oneMinusT = 1 - t
        const x =
          oneMinusT * oneMinusT * section.baseX +
          2 * oneMinusT * t * section.ctrlX +
          t * t * section.tipX
        const y =
          oneMinusT * oneMinusT * section.baseY +
          2 * oneMinusT * t * section.ctrlY +
          t * t * section.tipY
        // Hang fruits slightly below the curve.
        const fruitY = y + 8
        return <Fruit key={`fruit-${section.id}-${i}`} cx={x} cy={fruitY} />
      })}
    </g>
  )
}

function Fruit({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <title>Section mastered</title>
      <line x1="0" y1="-7" x2="0" y2="-3" stroke="#4a392c" strokeWidth="1" />
      <ellipse cx="2" cy="-6" rx="2" ry="1.2" fill="#10b981" transform="rotate(35 2 -6)" />
      {/* Flat fruit body — deliberate, not glossy */}
      <circle cx="0" cy="0" r="6" fill="#059669" stroke="#065f46" strokeWidth="0.5" />
    </g>
  )
}

function leafFill(state: StandardState): string {
  switch (state) {
    case 'demonstrated':
      return '#10b981' // emerald-500 — flat, deliberate
    case 'working':
      return '#f59e0b' // amber-500
    case 'misconception':
      return '#ef4444' // red-500
    case 'not_assessed':
      return '#d6d3d1' // stone-300 — bare leaf
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
      return 'Building the skill'
    case 'misconception':
      return 'Misconception detected'
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
    <div className="mt-4 flex flex-col items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
      <div className="flex items-center justify-center gap-5 flex-wrap">
        <LegendItem state="demonstrated" />
        <LegendItem state="working" />
        <LegendItem state="misconception" />
        <LegendItem state="not_assessed" />
      </div>
      <div className="flex items-center justify-center gap-5 flex-wrap text-stone-500 dark:text-stone-500">
        <div className="flex items-center gap-1.5">
          <svg viewBox="-8 -8 16 16" className="h-4 w-4" aria-hidden>
            <defs>
              <radialGradient id="legend-flower" cx="0.4" cy="0.4" r="0.6">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="100%" stopColor="#fda4af" />
              </radialGradient>
            </defs>
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse key={deg} cx="0" cy="-3.5" rx="2.2" ry="3.2"
                fill="url(#legend-flower)" stroke="#fb7185" strokeWidth="0.4"
                transform={`rotate(${deg})`} />
            ))}
            <circle cx="0" cy="0" r="1.4" fill="#fbbf24" stroke="#d97706" strokeWidth="0.3" />
          </svg>
          <span>Flower = practice activity completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg viewBox="-8 -8 16 16" className="h-4 w-4" aria-hidden>
            <defs>
              <radialGradient id="legend-fruit" cx="0.35" cy="0.3" r="0.7">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="0" r="6" fill="url(#legend-fruit)" stroke="#065f46" strokeWidth="0.6" />
            <ellipse cx="-2" cy="-2" rx="1.5" ry="1" fill="rgba(255,255,255,0.5)" />
          </svg>
          <span>Fruit = whole section mastered</span>
        </div>
      </div>
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
