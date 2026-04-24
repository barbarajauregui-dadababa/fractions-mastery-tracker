'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import FractionWorkspaceV2 from '@/components/fraction-workspace/FractionWorkspaceV2'
import type {
  BuildFractionProblem,
  PieceDenominator,
  TelemetryEvent,
} from '@/components/fraction-workspace/types'

export interface PublicProblem {
  id: string
  ccss_standard_ids: string[]
  problem_type:
    | 'partition_target'
    | 'build_fraction'
    | 'identify_fraction'
    | 'place_on_number_line'
    | 'equivalent_fractions'
    | 'compare_fractions'
  target_shape: 'bar' | 'circle' | 'number_line' | 'set_of_objects'
  available_denominators: PieceDenominator[]
  target_whole_value?: number
  goal: unknown
  framing_text?: string
}

interface StoredResponse {
  problem_id: string
  problem_type: string
  telemetry: TelemetryEvent[]
  /** Derived at submit time from telemetry (last commit_attempt with success). */
  committed_success: boolean
}

interface Props {
  assessmentId: string
  problems: PublicProblem[]
  learnerName: string
}

export default function AssessmentClient({ assessmentId, problems, learnerName }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [index, setIndex] = useState(0)
  const [telemetryByProblem, setTelemetryByProblem] = useState<Record<string, TelemetryEvent[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = problems.length
  const current = problems[index]
  const isLast = index === total - 1
  const currentId = current?.id ?? ''

  const recordTelemetry = useCallback(
    (event: TelemetryEvent) => {
      if (!currentId) return
      setTelemetryByProblem((prev) => ({
        ...prev,
        [currentId]: [...(prev[currentId] ?? []), event],
      }))
    },
    [currentId]
  )

  const submit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const responses: StoredResponse[] = problems.map((p) => {
        const events = telemetryByProblem[p.id] ?? []
        const success = events.some(
          (e) => e.type === 'commit_attempt' && e.result === 'success'
        )
        return {
          problem_id: p.id,
          problem_type: p.problem_type,
          telemetry: events,
          committed_success: success,
        }
      })
      const { error: updateError } = await supabase
        .from('assessments')
        .update({ responses, completed_at: new Date().toISOString() })
        .eq('id', assessmentId)
      if (updateError) throw updateError
      router.push(`/report/${assessmentId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit assessment.'
      setError(message)
      setIsSubmitting(false)
    }
  }, [assessmentId, isSubmitting, problems, router, supabase, telemetryByProblem])

  function goNext() {
    if (isLast) void submit()
    else setIndex((i) => i + 1)
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1)
  }

  if (total === 0) {
    return (
      <main className="flex flex-1 w-full max-w-2xl mx-auto flex-col gap-4 py-24 px-8">
        <h1 className="text-2xl font-semibold">No problems loaded</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          This assessment has no problems. Create a new one from the dashboard.
        </p>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-5 py-6 px-6 pb-24">
        <header className="flex items-baseline justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>
            Assessment for <strong className="text-zinc-900 dark:text-zinc-100">{learnerName}</strong>
          </span>
          <span>
            Problem {index + 1} of {total}
          </span>
        </header>

        <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950/40">
          {current.problem_type === 'build_fraction' ? (
            <FractionWorkspaceV2
              key={current.id}
              problem={toBuildFractionProblem(current)}
              onTelemetryEvent={recordTelemetry}
            />
          ) : (
            <NotYetSupportedPlaceholder
              problemType={current.problem_type}
              framing={current.framing_text}
            />
          )}
        </section>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}
      </main>

      {/* Sticky footer so Back / Next are always visible regardless of scroll. */}
      <footer className="sticky bottom-0 left-0 right-0 z-10 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto py-3 px-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0 || isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-sm font-medium disabled:opacity-50 bg-white dark:bg-zinc-900"
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800"
          >
            {isSubmitting ? 'Submitting…' : isLast ? 'Submit assessment' : 'Next'}
          </button>
        </div>
      </footer>
    </>
  )
}

function toBuildFractionProblem(p: PublicProblem): BuildFractionProblem {
  const goal = p.goal as { numerator: number; denominator: number }
  return {
    id: p.id,
    problem_type: 'build_fraction',
    target_shape: 'bar',
    goal: { numerator: goal.numerator, denominator: goal.denominator },
    available_denominators: p.available_denominators,
    target_whole_value: p.target_whole_value,
    framing_text: p.framing_text,
  }
}

function NotYetSupportedPlaceholder({
  problemType,
  framing,
}: {
  problemType: string
  framing?: string
}) {
  const label = problemType.replace(/_/g, ' ')
  return (
    <div className="flex flex-col items-center gap-3 text-center py-10">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      {framing && <p className="max-w-lg text-zinc-700 dark:text-zinc-300">{framing}</p>}
      <div className="rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 px-6 py-8 text-sm text-zinc-500">
        This problem type doesn&apos;t have an interactive UI yet — it&apos;ll be built alongside the
        drag-and-build mechanic. For now, use <strong>Next</strong> to move on.
      </div>
    </div>
  )
}
