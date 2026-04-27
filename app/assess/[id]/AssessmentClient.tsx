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
  parentAssessmentId: string | null
  learnerId: string
}

export default function AssessmentClient({
  assessmentId,
  problems,
  learnerName,
  parentAssessmentId,
  learnerId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [index, setIndex] = useState(0)
  const [telemetryByProblem, setTelemetryByProblem] = useState<Record<string, TelemetryEvent[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStage, setSubmitStage] = useState<'idle' | 'saving' | 'analyzing'>('idle')
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
    setSubmitStage('saving')
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

      // Auto-analyze. We await it so the voyage page has a mastery_map
      // when the learner lands. ~15 sec for a typical assessment. If
      // analysis fails, we still redirect — the voyage page will show
      // the manual "Run analysis" button as a fallback.
      setSubmitStage('analyzing')
      let analysisOk = false
      try {
        const res = await fetch('/api/analyze-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assessment_id: assessmentId,
            parent_assessment_id: parentAssessmentId ?? undefined,
          }),
        })
        if (!res.ok) {
          console.warn('Auto-analysis failed; will retry from voyage page', await res.text())
        } else {
          analysisOk = true
        }
      } catch (analyzeErr) {
        console.warn('Auto-analysis error; will retry from voyage page', analyzeErr)
      }

      // Fire-and-forget plan generation so the user reads the mastery
      // map while the Plan Architect works in the background. We don't
      // await — the request continues even after navigation. The report
      // page will detect the in-flight plan and auto-refresh when it lands.
      // Skip for focused probes (the parent already has a plan).
      if (analysisOk && !parentAssessmentId) {
        const planAssessmentId = assessmentId
        fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assessment_id: planAssessmentId }),
          keepalive: true,
        }).catch((err) => {
          console.warn('Background plan generation kickoff error', err)
        })
      }

      // Voyage page absorbs the report. After both assessments and probes
      // we land on the learner's voyage; the probe's result was merged
      // into the parent assessment via the analyze endpoint.
      router.push(`/learner/${learnerId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit assessment.'
      setError(message)
      setIsSubmitting(false)
      setSubmitStage('idle')
    }
  }, [assessmentId, isSubmitting, learnerId, parentAssessmentId, problems, router, supabase, telemetryByProblem])

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
        <p className="text-stone-600 dark:text-stone-400">
          This assessment has no problems. Create a new one from the dashboard.
        </p>
      </main>
    )
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-8 pb-28 flex flex-col gap-5">
        <header className="flex items-baseline justify-between gap-4">
          <span
            className="text-sm tracking-[0.25em] uppercase text-brass"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Assessment for <span className="text-cream font-bold ml-1">{learnerName}</span>
          </span>
          <span
            className="text-sm tracking-[0.25em] uppercase text-cream-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Problem {index + 1} of {total}
          </span>
        </header>

        {/* Brass progress rule */}
        <div className="relative h-2 w-full bg-paper-deep/30 rounded-sm border border-brass-deep/40">
          <div
            className="absolute left-0 top-0 bottom-0 bg-brass shadow-[0_0_8px_oklch(0.74_0.14_80/0.6)] rounded-sm transition-all"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        {/* Workspace card — parchment within a brass frame, corner flourishes */}
        <section className="relative rounded-sm border-2 border-brass-deep bg-paper p-6 shadow-[0_0_30px_oklch(0.74_0.14_80/0.25)]">
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
          <div
            className="rounded-sm border-2 border-red-600/50 bg-paper-deep px-3 py-2 text-sm text-red-700"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Sticky footer with brass-bordered buttons */}
      <footer className="sticky bottom-0 left-0 right-0 z-10 border-t-2 border-brass-deep/50 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto py-3 px-6">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0 || isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-sm border-2 border-brass-deep px-5 text-xs font-bold uppercase text-cream hover:bg-brass-deep/20 disabled:opacity-30 transition-colors"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center rounded-sm bg-brass-deep px-6 text-xs font-bold uppercase text-cream disabled:opacity-50 hover:bg-brass transition-colors border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
          >
            {submitStage === 'analyzing'
              ? 'Analyzing… ~15 sec'
              : submitStage === 'saving'
                ? 'Saving…'
                : isLast
                  ? 'Submit assessment ◇'
                  : 'Next →'}
          </button>
        </div>
      </footer>
    </main>
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
      <div className="text-xs uppercase tracking-wide text-stone-500">{label}</div>
      {framing && <p className="max-w-lg text-stone-700 dark:text-stone-300">{framing}</p>}
      <div className="rounded-md border border-dashed border-stone-300 dark:border-stone-700 px-6 py-8 text-sm text-stone-500">
        This problem type doesn&apos;t have an interactive UI yet — it&apos;ll be built alongside the
        drag-and-build mechanic. For now, use <strong>Next</strong> to move on.
      </div>
    </div>
  )
}
