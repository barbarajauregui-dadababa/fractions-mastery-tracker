'use client'

import { useState } from 'react'
import FractionWorkspace from '@/components/fraction-workspace/FractionWorkspace'
import type { BuildFractionProblem, TelemetryEvent } from '@/components/fraction-workspace/types'

const SANDBOX_PROBLEMS: BuildFractionProblem[] = [
  {
    id: 'sandbox-1',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 3, denominator: 4 },
    available_denominators: [2, 3, 4, 6, 8],
    framing_text: 'Build three-fourths of this bar.',
  },
  {
    id: 'sandbox-2',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 1, denominator: 4 },
    // Goal denom intentionally excluded to force equivalence reasoning (two 1/8 = 1/4).
    available_denominators: [2, 3, 6, 8],
    framing_text: 'Build one-fourth. You do not have a 1/4 piece — find another way.',
  },
  {
    id: 'sandbox-3',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 5, denominator: 4 },
    available_denominators: [2, 3, 4],
    target_whole_value: 2,
    framing_text: 'Build 5/4. You have two whole bars to work with.',
  },
  {
    id: 'sandbox-4',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 3, denominator: 1 },
    available_denominators: [1, 2, 3],
    target_whole_value: 3,
    framing_text: 'Build 3 — three whole bars. Use any pieces that add up to 3.',
  },
  {
    id: 'sandbox-5',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 1, denominator: 2 },
    available_denominators: [4, 6, 8],
    framing_text: 'Build one-half. You do not have a 1/2 piece — use smaller pieces that add up to a half.',
  },
]

export default function FractionSandboxPage() {
  const [problemIndex, setProblemIndex] = useState(0)
  const [events, setEvents] = useState<TelemetryEvent[]>([])
  const [completedIds, setCompletedIds] = useState<string[]>([])

  const problem = SANDBOX_PROBLEMS[problemIndex]

  function handleTelemetry(e: TelemetryEvent) {
    setEvents((prev) => [...prev, { ...e }])
  }

  function handleSuccess() {
    if (!completedIds.includes(problem.id)) {
      setCompletedIds((prev) => [...prev, problem.id])
    }
  }

  function resetProblem() {
    setEvents([])
    // force remount of workspace by keying off problemIndex + reset counter
    setProblemIndex(problemIndex)
  }

  function nextProblem() {
    const next = (problemIndex + 1) % SANDBOX_PROBLEMS.length
    setProblemIndex(next)
    setEvents([])
  }

  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-6 py-10 px-6">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fraction workspace sandbox</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Dev-only playground for the Build-a-Fraction mechanic. Not for learners.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            Problem {problemIndex + 1} / {SANDBOX_PROBLEMS.length}
          </span>
        </div>
      </header>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-950/40">
        <FractionWorkspace
          key={`${problem.id}-${events.length === 0 ? 'fresh' : 'active'}`}
          problem={problem}
          onTelemetryEvent={handleTelemetry}
          onCommitSuccess={handleSuccess}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={nextProblem}
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-sm"
        >
          Next sample problem
        </button>
        <button
          type="button"
          onClick={resetProblem}
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-sm"
        >
          Reset this problem
        </button>
        {completedIds.includes(problem.id) && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            Solved once already — try a different decomposition.
          </span>
        )}
      </div>

      <section className="text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <p className="font-medium text-zinc-600 dark:text-zinc-400 mb-1">
          What to notice (for Barbara)
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            Drag a piece from the palette into the bar. It snaps in place from the left. Click a placed piece
            to remove it.
          </li>
          <li>
            The overhang (red label) and gap (gray label) are the self-correcting feedback.
          </li>
          <li>
            &quot;Check my answer&quot; is the commit step. Bounces if wrong, locks in green if right. In the real
            assessment, this will be a drag-onto-the-numeral — this is the v1 proxy.
          </li>
          <li>
            Problem 4 is the interesting one — the palette doesn&apos;t contain a 1/2 piece, forcing the learner
            to discover equivalent fractions.
          </li>
        </ul>
      </section>
    </main>
  )
}
