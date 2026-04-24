'use client'

import { useState } from 'react'
import FractionWorkspaceV2 from '@/components/fraction-workspace/FractionWorkspaceV2'
import type { BuildFractionProblem } from '@/components/fraction-workspace/types'

/**
 * Sandbox v2 — Option A mechanic per Barbara's Apr 24 feedback.
 *
 * Identity rule: assessment tool, not practice tool. Minimal scaffolding.
 * Target is blank; pieces are same-color blue, size proportional to their
 * value. Palette pieces are rendered at the exact width+height they'll
 * occupy when placed. Multi-whole targets start with 1 whole and grow
 * via the "+" button.
 */

const SANDBOX_PROBLEMS: BuildFractionProblem[] = [
  {
    id: 'v2-build-3-4',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 3, denominator: 4 },
    available_denominators: [2, 3, 4, 6, 8, 12],
    framing_text: 'Build three-fourths of this bar.',
  },
  {
    id: 'v2-build-1-4-r1',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    // R1 triggers: compatible pool is [2, 4, 8, 12] (4 denominators).
    // Pruning the goal denom 4 leaves [2, 8, 12] (3 — NOT > 3), so 4 stays.
    // If we wanted equivalence forcing, pass available_denominators with
    // more compatible options so the pruned pool stays > 3.
    goal: { numerator: 1, denominator: 4 },
    available_denominators: [2, 3, 4, 6, 8, 12],
    framing_text: 'Build one-fourth of this bar.',
  },
  {
    id: 'v2-build-5-4-multiwhole',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 5, denominator: 4 },
    target_whole_value: 2,
    available_denominators: [2, 3, 4, 6, 8],
    framing_text: 'Build 5/4. You\'ll need more than one whole — tap + to add another.',
  },
  {
    id: 'v2-build-3-1-whole-numbers',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 3, denominator: 1 },
    target_whole_value: 3,
    available_denominators: [1, 2, 3, 6],
    framing_text: 'Build 3 as a fraction. Use whole-bar pieces (the big green ones).',
  },
  {
    id: 'v2-build-2-3',
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: 2, denominator: 3 },
    available_denominators: [2, 3, 4, 6, 12],
    framing_text: 'Build two-thirds of this bar.',
  },
]

export default function FractionSandboxV2Page() {
  const [problemIndex, setProblemIndex] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const problem = SANDBOX_PROBLEMS[problemIndex]

  function handleSuccess() {
    setCompleted((prev) => new Set(prev).add(problem.id))
  }

  function nextProblem() {
    const next = (problemIndex + 1) % SANDBOX_PROBLEMS.length
    setProblemIndex(next)
  }

  function prevProblem() {
    const prev = (problemIndex - 1 + SANDBOX_PROBLEMS.length) % SANDBOX_PROBLEMS.length
    setProblemIndex(prev)
  }

  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-6 py-10 px-6">
      <header className="flex items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fraction workspace — V2 (Option A)</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Blank target, same-color blue pieces, exact-proportional sizes, + button for
            multi-whole. This is a playtest; tell me what&apos;s off.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            {problemIndex + 1} / {SANDBOX_PROBLEMS.length}
          </span>
          {completed.has(problem.id) && (
            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          )}
        </div>
      </header>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 bg-white dark:bg-zinc-950/40">
        <FractionWorkspaceV2
          key={problem.id}
          problem={problem}
          onCommitSuccess={handleSuccess}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={prevProblem}
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-sm"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={nextProblem}
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-sm"
        >
          Next →
        </button>
      </div>

      <section className="text-xs text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2">
        <p className="font-medium text-zinc-600 dark:text-zinc-400">
          What to notice as you play
        </p>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <strong>Target is blank.</strong> No dotted hint divisions — the only visible lines
            are the edges of placed pieces.
          </li>
          <li>
            <strong>Palette pieces are the exact size they&apos;ll be in the target.</strong> Drag
            a 1/4 piece, drop it, and it occupies 1/4 of a whole. No shrinkage.
          </li>
          <li>
            <strong>All pieces are blue.</strong> Size is the only cue.
          </li>
          <li>
            <strong>Palette is filtered to compatible denominators.</strong> For a 3/4 goal,
            only 1/2, 1/4, 1/8, 1/12 appear (thirds / sixths wouldn&apos;t align). Open the Debug
            panel under the target to see what was filtered out.
          </li>
          <li>
            <strong>Multi-whole problems start with 1 whole.</strong> Tap the dashed &ldquo;+&rdquo; button to
            the right of the target to add another whole when you run out of room.
          </li>
          <li>
            <strong>After Check, pieces lock.</strong> Wrong → &ldquo;Try again&rdquo; clears and resets
            (logged in telemetry). Right → locked in ✓.
          </li>
        </ul>
      </section>
    </main>
  )
}
