/**
 * Static visual mockups of the remaining Build-a-Fraction UI directions,
 * after Barbara's round-2 feedback:
 * - Drop Option C (goal numeral must always be shown)
 * - Remove shading from Option B's reference (no pre-shading allowed)
 * - Target divisions match the goal's denominator only (not a chaotic
 *   overlay of halves/thirds/fourths)
 *
 * Non-interactive — pure visual comparison. Pick one and I'll build it.
 */

const BAR_WIDTH = 320
const BAR_HEIGHT = 56
const BORDER_COLOR = '#52525b' // zinc-600
const PIECE_FILL = '#f4f4f5' // zinc-100 — same color for all pieces; size is the information
const PIECE_STROKE = '#52525b'
const DOTTED_COLOR = '#a1a1aa' // zinc-400
const OUTLINE_COLOR = '#b45309' // amber-700 for the dashed "region" outline — no fill, outline only

function BarTarget({
  widthPx,
  heightPx,
  denominatorDivisions,
}: {
  widthPx: number
  heightPx: number
  /** Number of equal parts to mark on the target with dotted lines (= goal's denominator). */
  denominatorDivisions: number
}) {
  const lines: number[] = []
  for (let i = 1; i < denominatorDivisions; i++) {
    lines.push((i / denominatorDivisions) * widthPx)
  }
  return (
    <svg width={widthPx} height={heightPx} className="rounded">
      <rect
        x="1"
        y="1"
        width={widthPx - 2}
        height={heightPx - 2}
        rx="4"
        fill="white"
        stroke={BORDER_COLOR}
        strokeWidth="2"
      />
      {lines.map((x, i) => (
        <line
          key={i}
          x1={x}
          x2={x}
          y1={4}
          y2={heightPx - 4}
          stroke={DOTTED_COLOR}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}
    </svg>
  )
}

/** A single same-color piece whose WIDTH is proportional to its fraction value. */
function PieceBar({
  proportion,
  widthPerWhole,
  heightPx,
}: {
  proportion: number
  widthPerWhole: number
  heightPx: number
}) {
  const width = proportion * widthPerWhole
  return (
    <svg width={width} height={heightPx}>
      <rect
        x="1"
        y="1"
        width={width - 2}
        height={heightPx - 2}
        rx="3"
        fill={PIECE_FILL}
        stroke={PIECE_STROKE}
        strokeWidth="2"
      />
    </svg>
  )
}

function Palette({
  denominators,
  widthPerWhole,
}: {
  denominators: number[]
  widthPerWhole: number
}) {
  return (
    <div className="flex items-end gap-3 justify-center">
      {denominators.map((d) => (
        <PieceBar key={d} proportion={1 / d} widthPerWhole={widthPerWhole} heightPx={32} />
      ))}
    </div>
  )
}

function GoalNumeral({
  numerator,
  denominator,
}: {
  numerator: number
  denominator: number
}) {
  return (
    <div className="inline-flex flex-col items-center leading-none rounded-md bg-white px-4 py-2 ring-2 ring-zinc-300">
      <span className="text-xl font-semibold">{numerator}</span>
      <span className="w-7 border-t-2 border-zinc-700 my-1" />
      <span className="text-xl font-semibold">{denominator}</span>
    </div>
  )
}

/** Option A: unlabeled same-color pieces + numeral goal + target with
 *  dotted divisions matching the goal's denominator (so for 3/4: 3 dotted
 *  lines making 4 equal parts). No shading anywhere. */
function OptionA() {
  return (
    <div className="flex flex-col gap-4 items-center text-sm">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Goal</span>
        <GoalNumeral numerator={3} denominator={4} />
      </div>

      <BarTarget widthPx={BAR_WIDTH} heightPx={BAR_HEIGHT} denominatorDivisions={4} />

      <div className="text-xs text-zinc-500 italic max-w-md text-center">
        Target bar is divided into 4 equal dotted parts (matching the goal&apos;s denominator).
        No shading, no pre-fill. Pieces are all the same color — size is the information.
      </div>

      <div className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Pieces</div>
      <Palette denominators={[2, 3, 4, 6, 8]} widthPerWhole={BAR_WIDTH} />
    </div>
  )
}

/** Option B: Option A PLUS a small visual reference next to the numeral,
 *  showing the whole divided into 4 dotted parts with the 3/4 region
 *  marked by a dashed outline (no fill, no tint — just the boundary). */
function OptionB() {
  const refWidth = 140
  const refHeight = 36
  const numerator = 3
  const denominator = 4
  const segWidth = refWidth / denominator
  return (
    <div className="flex flex-col gap-4 items-center text-sm">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Goal</span>
        <GoalNumeral numerator={numerator} denominator={denominator} />
        <span className="text-zinc-400">=</span>
        <svg width={refWidth + 4} height={refHeight + 4}>
          <rect
            x="1"
            y="1"
            width={refWidth}
            height={refHeight}
            rx="3"
            fill="white"
            stroke={BORDER_COLOR}
            strokeWidth="2"
          />
          {/* Dotted division lines at each 1/4 boundary */}
          {Array.from({ length: denominator - 1 }).map((_, i) => (
            <line
              key={i}
              x1={(i + 1) * segWidth}
              x2={(i + 1) * segWidth}
              y1={3}
              y2={refHeight - 1}
              stroke={DOTTED_COLOR}
              strokeDasharray="3 3"
            />
          ))}
          {/* Dashed outline around the 3/4 region — no fill. */}
          <rect
            x="2"
            y="2"
            width={numerator * segWidth - 2}
            height={refHeight - 2}
            rx="2"
            fill="none"
            stroke={OUTLINE_COLOR}
            strokeWidth="2"
            strokeDasharray="5 3"
          />
        </svg>
      </div>

      <BarTarget widthPx={BAR_WIDTH} heightPx={BAR_HEIGHT} denominatorDivisions={4} />

      <div className="text-xs text-zinc-500 italic max-w-md text-center">
        Goal shows the numeral AND a small reference shape: the whole divided into 4 dotted
        parts with a dashed amber outline around the 3/4 region. No shading, just the
        boundary. Build area below matches the same denominator divisions.
      </div>

      <div className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Pieces</div>
      <Palette denominators={[2, 3, 4, 6, 8]} widthPerWhole={BAR_WIDTH} />
    </div>
  )
}

/** Illustration of "add another whole" affordance — orthogonal to A/B. */
function AddWholeIllustration() {
  return (
    <div className="flex items-center gap-3">
      <BarTarget widthPx={200} heightPx={40} denominatorDivisions={4} />
      <button
        type="button"
        aria-label="Add another whole"
        className="h-10 w-10 rounded-full border-2 border-dashed border-zinc-400 text-zinc-500 text-xl font-light flex items-center justify-center hover:bg-zinc-100"
        disabled
      >
        +
      </button>
      <span className="text-xs text-zinc-500 italic max-w-xs">
        &ldquo;+&rdquo; button adds another whole to the right when the learner needs more room.
        Start with one whole; grow as needed. No pre-rendering.
      </span>
    </div>
  )
}

export default function MechanicOptionsPage() {
  return (
    <main className="flex flex-1 w-full max-w-5xl mx-auto flex-col gap-12 py-10 px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mechanic options — round 2</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
          Fixes from your last round: goal numeral kept in both options, no pre-shading, and
          dotted target divisions now match the goal&apos;s denominator only (no more overlapping
          tick chaos). Pick one.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold">Option A</h2>
          <span className="text-sm text-zinc-500">unlabeled pieces + numeral goal + dotted target</span>
          <span className="text-xs text-zinc-400 ml-auto">~20 min to build</span>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
          <OptionA />
        </div>
        <p className="text-xs text-zinc-600 max-w-2xl">
          Simplest. Pieces are all one color — size tells you what they are. Goal stays as the
          numeral (3/4). Target is divided into 4 equal dotted parts. Learner builds to fill
          3 of those 4 parts.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold">Option B</h2>
          <span className="text-sm text-zinc-500">numeral + outlined visual reference</span>
          <span className="text-xs text-zinc-400 ml-auto">~1 hr to build</span>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
          <OptionB />
        </div>
        <p className="text-xs text-zinc-600 max-w-2xl">
          Option A PLUS a small reference shape next to the numeral: the whole shown divided
          into 4 dotted parts with a dashed amber outline around the 3/4 region.
          No shading — just the boundary. Reinforces the numeral↔shape connection for learners
          who are still building notational fluency.
        </p>
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-semibold">Cross-cutting: add-another-whole button</h2>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
          <AddWholeIllustration />
        </div>
        <p className="text-xs text-zinc-600 max-w-2xl">
          Orthogonal to A/B. Instead of pre-rendering 2 or 3 wholes for improper fractions,
          the learner starts with one whole and hits &ldquo;+&rdquo; when they need more room. More
          natural for the &ldquo;oh, 5/4 needs more than one whole&rdquo; insight.
        </p>
      </section>

      <section className="text-sm text-zinc-700 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-semibold mb-3">Tell me</h2>
        <ul className="list-disc ml-5 space-y-1 text-zinc-600">
          <li>Option A or Option B?</li>
          <li>Add-another-whole button: yes or no?</li>
          <li>Any styling to change before I build it out (piece color, outline convention, etc.)?</li>
        </ul>
      </section>
    </main>
  )
}
