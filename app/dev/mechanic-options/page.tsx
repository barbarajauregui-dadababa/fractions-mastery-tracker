/**
 * Static visual mockups of three possible directions for the Build-a-Fraction
 * mechanic, for Barbara to compare before deciding which one we build out.
 *
 * These are NON-INTERACTIVE — just SVG visuals showing what each variant
 * would look like on a sample problem ("Build 3/4 of a bar"). Apply Barbara's
 * constraints: same-color pieces (size is the information), dotted-line
 * divisions on target (not pre-shaded), and an "add another whole" button
 * for multi-unit extension.
 */

const BAR_WIDTH = 320
const BAR_HEIGHT = 56
const BORDER_COLOR = '#52525b' // zinc-600
const PIECE_FILL = '#f4f4f5' // zinc-100 — same color for all pieces, size is the info
const PIECE_STROKE = '#52525b' // zinc-600
const DOTTED_COLOR = '#a1a1aa' // zinc-400

// Division tick positions on a bar target (common denominators shown as subtle dotted verticals)
const DEFAULT_DIVISIONS = [2, 3, 4] // halves, thirds, fourths as hint ticks

function BarTarget({
  widthPx,
  heightPx,
  dividers,
}: {
  widthPx: number
  heightPx: number
  /** Denominators to show as dotted division ticks on the empty target. */
  dividers: number[]
}) {
  const tickLines: { x: number; label: string }[] = []
  for (const d of dividers) {
    for (let i = 1; i < d; i++) {
      tickLines.push({ x: (i / d) * widthPx, label: `1/${d}` })
    }
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
      {tickLines.map((t, i) => (
        <line
          key={i}
          x1={t.x}
          x2={t.x}
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

/** A single same-color piece of a given proportion (fraction of a whole). */
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

/** The palette: same-color pieces differentiated only by size. */
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

/** Option A: unlabeled same-color pieces + numeral goal + dotted-line target.
 *  Closest to what we have today, minus labels and with same-color pieces. */
function OptionA() {
  return (
    <div className="flex flex-col gap-4 items-center text-sm">
      <div className="flex items-center gap-4">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Goal</span>
        <GoalNumeral numerator={3} denominator={4} />
      </div>

      <BarTarget widthPx={BAR_WIDTH} heightPx={BAR_HEIGHT} dividers={DEFAULT_DIVISIONS} />

      <div className="text-xs text-zinc-500 italic">
        Target has subtle dotted tick marks at halves / thirds / fourths as hints, but no shading.
      </div>

      <div className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Pieces</div>
      <Palette denominators={[2, 3, 4, 6, 8]} widthPerWhole={BAR_WIDTH} />
    </div>
  )
}

/** Option B: numeral goal + small visual reference shape alongside it. Visual
 *  reference is a small outlined bar divided at the goal's denominator in
 *  dotted lines; the goal fraction's portion is subtly highlighted (still no
 *  heavy shading — just a light tint so the learner sees "this much of this
 *  many parts" without relying on numerals alone). */
function OptionB() {
  // Visual reference showing 3/4: bar divided into 4 dotted parts; 3 of them lightly tinted
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
        <svg width={refWidth} height={refHeight}>
          <rect
            x="1"
            y="1"
            width={refWidth - 2}
            height={refHeight - 2}
            rx="3"
            fill="white"
            stroke={BORDER_COLOR}
            strokeWidth="2"
          />
          {/* Light-tint the 3/4 portion */}
          <rect
            x="1"
            y="1"
            width={numerator * segWidth - 2}
            height={refHeight - 2}
            rx="3"
            fill="#fef3c7"
            opacity="0.7"
          />
          {/* Dotted division lines */}
          {Array.from({ length: denominator - 1 }).map((_, i) => (
            <line
              key={i}
              x1={(i + 1) * segWidth}
              x2={(i + 1) * segWidth}
              y1={3}
              y2={refHeight - 3}
              stroke={DOTTED_COLOR}
              strokeDasharray="3 3"
            />
          ))}
        </svg>
      </div>

      <BarTarget widthPx={BAR_WIDTH} heightPx={BAR_HEIGHT} dividers={DEFAULT_DIVISIONS} />

      <div className="text-xs text-zinc-500 italic max-w-md text-center">
        Goal shows the numeral <em>and</em> a small reference shape: the whole is divided into
        4 dotted parts with 3 lightly tinted, so the learner sees the fraction visually and
        symbolically. Build area is clean with only subtle hint ticks.
      </div>

      <div className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Pieces</div>
      <Palette denominators={[2, 3, 4, 6, 8]} widthPerWhole={BAR_WIDTH} />
    </div>
  )
}

/** Option C: visual-only goal (no numeral). A target shape is shown with
 *  dotted division lines AND a visual outline of the portion to fill — but
 *  the portion to fill is indicated by a dashed boundary, not by pre-shading.
 *  The learner has to build pieces that together fit inside the dashed
 *  boundary. Commit = filled region matches the dashed boundary area. */
function OptionC() {
  // Goal: the target itself. Divided into fourths (dotted), with a dashed
  // red outline around the 3/4 region that the learner should fill.
  const goalWidth = 200
  const goalHeight = 48
  const denom = 4
  const num = 3
  const segW = goalWidth / denom
  return (
    <div className="flex flex-col gap-4 items-center text-sm">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Goal</span>
        <svg width={goalWidth + 4} height={goalHeight + 4}>
          <rect
            x="1"
            y="1"
            width={goalWidth}
            height={goalHeight}
            rx="4"
            fill="white"
            stroke={BORDER_COLOR}
            strokeWidth="2"
          />
          {/* All dotted division lines */}
          {Array.from({ length: denom - 1 }).map((_, i) => (
            <line
              key={i}
              x1={(i + 1) * segW + 1}
              x2={(i + 1) * segW + 1}
              y1={4}
              y2={goalHeight - 2}
              stroke={DOTTED_COLOR}
              strokeDasharray="3 3"
            />
          ))}
          {/* Dashed RED outline showing the region to fill (3/4) */}
          <rect
            x="2"
            y="2"
            width={num * segW - 2}
            height={goalHeight - 2}
            rx="3"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
        </svg>
        <span className="text-xs text-zinc-500 italic mt-1">
          No numeral. &ldquo;Fill the dashed area with pieces.&rdquo;
        </span>
      </div>

      <div className="text-xs text-zinc-500 italic max-w-md text-center">
        Goal is purely visual: the learner sees the whole divided into 4 parts with 3 of them
        outlined as &ldquo;the area to fill.&rdquo; No &ldquo;3/4&rdquo; numeral anywhere. Pure CPA — the learner
        builds to a spatial goal. Commit = filled region visually matches the dashed outline.
      </div>

      <BarTarget widthPx={BAR_WIDTH} heightPx={BAR_HEIGHT} dividers={[denom]} />

      <div className="mt-2 text-xs uppercase tracking-wide text-zinc-500">Pieces</div>
      <Palette denominators={[2, 3, 4, 6, 8]} widthPerWhole={BAR_WIDTH} />
    </div>
  )
}

/** Illustration of "add another whole" affordance — an explicit + button
 *  that appends another empty bar to the right, so multi-unit targets
 *  grow as the learner needs them rather than being pre-rendered. */
function AddWholeIllustration() {
  return (
    <div className="flex items-center gap-3">
      <BarTarget widthPx={200} heightPx={40} dividers={[2, 3, 4]} />
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
        No pre-rendering of 2 or 3 wholes.
      </span>
    </div>
  )
}

export default function MechanicOptionsPage() {
  return (
    <main className="flex flex-1 w-full max-w-5xl mx-auto flex-col gap-12 py-10 px-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Mechanic options — visual comparison</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-2xl">
          Three directions for the Build-a-Fraction UI. All three use same-color pieces (size is
          the information, not color) and dotted-line hints on the target instead of pre-shading
          — per your Montessori-aligned feedback. Pick one and I&apos;ll build it out.
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
          Simplest change. Drop the &ldquo;1/2&rdquo; / &ldquo;1/4&rdquo; text from pieces — size is the only distinction.
          Goal stays as the numeral (3/4). Target bar is empty with subtle dotted ticks at 1/2, 1/3, 1/4
          as possible-landing hints.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold">Option B</h2>
          <span className="text-sm text-zinc-500">numeral + small visual reference</span>
          <span className="text-xs text-zinc-400 ml-auto">~1 hr to build</span>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
          <OptionB />
        </div>
        <p className="text-xs text-zinc-600 max-w-2xl">
          Goal has BOTH the numeral (3/4) and a small reference shape next to it: a mini-bar
          divided into 4 dotted parts with 3 of them lightly tinted. Connects the symbol to
          the shape; CPA-reinforcing. Build area itself stays clean like Option A.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold">Option C</h2>
          <span className="text-sm text-zinc-500">visual-only goal, no numeral</span>
          <span className="text-xs text-zinc-400 ml-auto">~2–3 hr to build</span>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
          <OptionC />
        </div>
        <p className="text-xs text-zinc-600 max-w-2xl">
          Pure PhET / Montessori style. No &ldquo;3/4&rdquo; numeral anywhere on the page. The goal IS a
          shape: a whole divided into 4 dotted parts with the 3/4 region outlined in a dashed
          red boundary. The learner builds pieces that fit inside the outlined region. Commit =
          the filled region visually matches the boundary. Strongest pedagogy for this age
          group, but biggest build (needs new analysis logic — the mastery map doesn&apos;t know
          what fraction the learner built without a numeral check).
        </p>
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-semibold">Cross-cutting: add-another-whole button</h2>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-8">
          <AddWholeIllustration />
        </div>
        <p className="text-xs text-zinc-600 max-w-2xl">
          Orthogonal to A/B/C: instead of pre-rendering 2 or 3 empty wholes for improper
          fractions, show ONE whole and a &ldquo;+&rdquo; button. Learner adds wholes as they fill the
          current one. More PhET-like; more natural for the &ldquo;I didn&apos;t know 5/4 needed two
          wholes until I ran out of space&rdquo; insight.
        </p>
      </section>

      <section className="text-sm text-zinc-700 border-t border-zinc-200 pt-8">
        <h2 className="text-lg font-semibold mb-3">Tell me</h2>
        <ul className="list-disc ml-5 space-y-1 text-zinc-600">
          <li>Which of A / B / C feels right (or a mix)?</li>
          <li>Add-another-whole button: yes or no?</li>
          <li>Anything about the piece / target / goal styling to adjust before I build it out?</li>
        </ul>
      </section>
    </main>
  )
}
