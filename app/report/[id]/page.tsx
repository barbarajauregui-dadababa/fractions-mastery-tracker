import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyzeButton from './AnalyzeButton'
import GeneratePlanButton from './GeneratePlanButton'
import type { PlanContent } from './PlanDisplay'
import FocusedProbeButton from './FocusedProbeButton'
import ActivityTile, { type CompletedActivity } from './ActivityTile'
import resourcesRaw from '@/content/fractions-resources.json'

interface ResourceRow {
  id: string
  title: string
  modality: string
  source_site?: string
  url?: string | null
  duration_minutes?: number
}
const resources = resourcesRaw as unknown as { resources: ResourceRow[] }
function resourceById(id: string): ResourceRow | undefined {
  return resources.resources.find((r) => r.id === id)
}
import coherenceMapRaw from '@/content/coherence-map-fractions.json'
import misconceptionsRaw from '@/content/fractions-misconceptions.json'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface StandardReport {
  state: StandardState
  evidence_problem_ids: string[]
  flagged_misconception_ids: string[]
  reasoning: string
}

interface MasteryMap {
  standards: Record<string, StandardReport>
  overall_notes: string
}

interface CoherenceNode {
  id: string
  name: string
  statement: string
  grade: number
  role: 'prerequisite' | 'core'
  layer: number
}

interface Misconception {
  id: string
  name: string
}

const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }
const misconceptions = misconceptionsRaw as unknown as { misconceptions: Misconception[] }

function standardName(id: string): string {
  return coherenceMap.nodes.find((n) => n.id === id)?.name ?? id
}

function misconceptionName(id: string): string {
  return misconceptions.misconceptions.find((m) => m.id === id)?.name ?? id
}

function sortedByLayer(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const la = coherenceMap.nodes.find((n) => n.id === a)?.layer ?? 99
    const lb = coherenceMap.nodes.find((n) => n.id === b)?.layer ?? 99
    if (la !== lb) return la - lb
    return a.localeCompare(b)
  })
}

export default async function ReportPage(props: PageProps<'/report/[id]'>) {
  const { id } = await props.params
  const sp = await props.searchParams
  const rawParent = sp?.parent
  const parentAssessmentId = typeof rawParent === 'string' ? rawParent : null
  const supabase = await createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('id, type, completed_at, mastery_map, learner_id, learners(name)')
    .eq('id', id)
    .single()

  if (error || !assessment) notFound()

  const learnerName = Array.isArray(assessment.learners)
    ? assessment.learners[0]?.name
    : (assessment.learners as { name: string } | null)?.name
  const displayName = learnerName ?? 'Learner'

  const masteryMap = assessment.mastery_map as MasteryMap | null
  const isCompleted = !!assessment.completed_at

  // Fetch the active plan for this assessment (if Plan Architect has run).
  let planContent: PlanContent | null = null
  let planId: string | null = null
  let planGeneratedAt: string | null = null
  if (masteryMap) {
    const { data: planRow } = await supabase
      .from('plans')
      .select('id, plan_content, generated_at')
      .eq('assessment_id', id)
      .eq('status', 'active')
      .maybeSingle()
    if (planRow) {
      planContent = planRow.plan_content as PlanContent
      planId = planRow.id as string
      planGeneratedAt = planRow.generated_at as string
    }
  }

  // Bucket standards by state (hide not_assessed per Barbara's Q6 decision).
  const byState = {
    misconception: [] as string[],
    working: [] as string[],
    demonstrated: [] as string[],
  }
  if (masteryMap) {
    for (const [sid, r] of Object.entries(masteryMap.standards)) {
      if (r.state === 'not_assessed') continue
      byState[r.state].push(sid)
    }
  }

  // Hero stats — derived from plan + resource library.
  const focusStandards = [...byState.misconception, ...byState.working]
  let totalMinutes = 0
  let handsOnCount = 0
  let activityCount = 0
  if (planContent && masteryMap) {
    for (const gap of planContent.priority_gaps) {
      for (const act of gap.activities) {
        activityCount += 1
        const r = resourceById(act.resource_id)
        if (r?.duration_minutes) totalMinutes += r.duration_minutes
        if (r?.modality === 'manipulative') handsOnCount += 1
      }
    }
  }
  const focusLabel =
    focusStandards.length === 0
      ? null
      : focusStandards.length === 1
        ? standardName(focusStandards[0])
        : focusStandards.length <= 3
          ? focusStandards.map((s) => standardName(s)).join(' · ')
          : `${focusStandards.length} standards`

  return (
    <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col gap-8 py-10 px-8">
      {masteryMap && focusLabel ? (
        <section className="rounded-2xl bg-stone-100 dark:bg-zinc-900/60 px-7 py-6 flex flex-col gap-2">
          <div className="flex items-baseline gap-2 flex-wrap text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-zinc-400">
            <span>Current focus</span>
            <span aria-hidden className="text-stone-300 dark:text-zinc-700">·</span>
            <span className="normal-case tracking-normal text-stone-600 dark:text-zinc-300 font-normal">
              {displayName}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50">
            {focusLabel}
          </h1>
          {activityCount > 0 && (
            <div className="mt-1 flex items-center gap-3 text-sm text-stone-600 dark:text-zinc-400">
              <span>
                <span className="font-medium text-stone-800 dark:text-zinc-200">{activityCount}</span>{' '}
                {activityCount === 1 ? 'activity' : 'activities'}
              </span>
              {totalMinutes > 0 && (
                <>
                  <span aria-hidden className="text-stone-300 dark:text-zinc-700">·</span>
                  <span>~{totalMinutes} min total</span>
                </>
              )}
              {handsOnCount > 0 && (
                <>
                  <span aria-hidden className="text-stone-300 dark:text-zinc-700">·</span>
                  <span>
                    {handsOnCount} hands-on
                  </span>
                </>
              )}
            </div>
          )}
        </section>
      ) : (
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Report</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Mastery map for <strong>{displayName}</strong>
            {isCompleted
              ? ` — completed ${new Date(assessment.completed_at!).toLocaleString()}`
              : ' — not yet completed'}
          </p>
        </header>
      )}

      {!isCompleted && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          This assessment has not been submitted yet. Finish it before running analysis.
        </div>
      )}

      {isCompleted && !masteryMap && (
        <section className="flex flex-col gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-medium">Step 1 — Analyze the responses</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Run analysis to produce the mastery map.
          </p>
          <AnalyzeButton assessmentId={id} parentAssessmentId={parentAssessmentId} />
        </section>
      )}

      {masteryMap && (
        <>
          {/* At-a-glance summary — deterministically derived from the mastery
              map. Structured + scannable. The Plan Architect's / analysis
              engine's narrative appears below as supplementary notes. */}
          <AtAGlanceSummary
            masteryMap={masteryMap}
            byState={byState}
          />

          {/* Supplementary narrative from Plan Architect (if it ran) or from
              the analysis engine. Shown smaller, below the structured summary. */}
          {(planContent?.overall_notes ?? masteryMap.overall_notes) && (
            <section className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Analyst&apos;s notes
              </div>
              {planContent?.overall_notes ?? masteryMap.overall_notes}
            </section>
          )}

          {/* Three buckets: red (attention), yellow (working), green (demonstrated). */}
          <section className="flex flex-col gap-4">
            <Bucket
              title="Needs attention"
              subtitle="Misconceptions detected. Start here."
              dot="bg-red-500"
              containerClass="bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900"
              standardIds={sortedByLayer(byState.misconception)}
              masteryMap={masteryMap}
              plan={planContent}
              planId={planId}
              learnerId={assessment.learner_id}
              parentAssessmentId={id}
              showProbeButton
              defaultOpen
            />
            <Bucket
              title="Working on it"
              subtitle="Partial understanding. Support with activities."
              dot="bg-yellow-500"
              containerClass="bg-yellow-50/60 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
              standardIds={sortedByLayer(byState.working)}
              masteryMap={masteryMap}
              plan={planContent}
              planId={planId}
              learnerId={assessment.learner_id}
              parentAssessmentId={id}
              showProbeButton
              defaultOpen
            />
            <Bucket
              title="Demonstrated"
              subtitle="Solid — no action needed this week."
              dot="bg-green-500"
              containerClass="bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-900"
              standardIds={sortedByLayer(byState.demonstrated)}
              masteryMap={masteryMap}
              plan={planContent}
              planId={planId}
              learnerId={assessment.learner_id}
              parentAssessmentId={id}
              showProbeButton={false}
              defaultOpen={false}
            />
          </section>

          {/* Plan generation action / status. */}
          {!planContent && (
            <section className="flex flex-col gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-6">
              <h2 className="text-lg font-medium">Step 2 — Generate plan</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                The Plan Architect reads the mastery map above and prescribes 2–3
                activities per priority gap. Takes 1–3 minutes.
              </p>
              <GeneratePlanButton assessmentId={id} />
            </section>
          )}
          {planContent && planId && (
            <>
              <div className="text-xs text-zinc-500">
                Plan generated{' '}
                {planGeneratedAt && new Date(planGeneratedAt).toLocaleString()}.
              </div>
              {planContent.prerequisite_check_recommendations &&
                planContent.prerequisite_check_recommendations.length > 0 && (
                  <div className="rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm leading-relaxed">
                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      Next assessment — consider probing
                    </div>
                    <ul className="list-disc ml-5 space-y-1">
                      {planContent.prerequisite_check_recommendations.map((sid) => (
                        <li key={sid}>
                          {standardName(sid)}{' '}
                          <span className="font-mono text-xs text-amber-700/80">({sid})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </>
          )}
        </>
      )}
    </main>
  )
}

function AtAGlanceSummary({
  masteryMap,
  byState,
}: {
  masteryMap: MasteryMap
  byState: { misconception: string[]; working: string[]; demonstrated: string[] }
}) {
  const notAssessed = Object.entries(masteryMap.standards)
    .filter(([, r]) => r.state === 'not_assessed')
    .map(([sid]) => sid)

  const misconceptionNamesForAttention = new Set<string>()
  for (const sid of byState.misconception) {
    for (const mid of masteryMap.standards[sid].flagged_misconception_ids) {
      misconceptionNamesForAttention.add(misconceptionName(mid))
    }
  }
  for (const sid of byState.working) {
    for (const mid of masteryMap.standards[sid].flagged_misconception_ids) {
      misconceptionNamesForAttention.add(misconceptionName(mid))
    }
  }

  return (
    <section className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
        At a glance
      </div>
      <ul className="flex flex-col gap-3 text-sm">
        {/* Knows well (green/demonstrated) */}
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500 shrink-0" />
          <div>
            <div className="font-medium">
              Knows well ({byState.demonstrated.length})
            </div>
            <div className="text-zinc-600 dark:text-zinc-400">
              {byState.demonstrated.length === 0
                ? '—'
                : byState.demonstrated.map((sid) => standardName(sid)).join('; ')}
            </div>
          </div>
        </li>

        {/* Working on it */}
        <li className="flex items-start gap-2">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-yellow-500 shrink-0" />
          <div>
            <div className="font-medium">
              Working on ({byState.working.length + byState.misconception.length})
            </div>
            <div className="text-zinc-600 dark:text-zinc-400">
              {byState.working.length + byState.misconception.length === 0
                ? '—'
                : [...byState.misconception, ...byState.working]
                    .map((sid) => standardName(sid))
                    .join('; ')}
            </div>
            {misconceptionNamesForAttention.size > 0 && (
              <div className="text-xs text-zinc-500 mt-1">
                Flagged misconceptions: {[...misconceptionNamesForAttention].join('; ')}
              </div>
            )}
          </div>
        </li>

        {/* Probe next session (not_assessed) */}
        {notAssessed.length > 0 && (
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-zinc-400 shrink-0" />
            <div>
              <div className="font-medium">
                Probe next session ({notAssessed.length})
              </div>
              <div className="text-zinc-600 dark:text-zinc-400">
                {notAssessed.map((sid) => standardName(sid)).join('; ')}
              </div>
            </div>
          </li>
        )}
      </ul>
    </section>
  )
}

function Bucket({
  title,
  subtitle,
  dot,
  containerClass,
  standardIds,
  masteryMap,
  plan,
  planId,
  learnerId,
  parentAssessmentId,
  showProbeButton,
  defaultOpen,
}: {
  title: string
  subtitle: string
  dot: string
  containerClass: string
  standardIds: string[]
  masteryMap: MasteryMap
  plan: PlanContent | null
  planId: string | null
  learnerId: string
  parentAssessmentId: string
  showProbeButton: boolean
  defaultOpen: boolean
}) {
  const completed: CompletedActivity[] = plan?._completed_activities ?? []
  if (standardIds.length === 0) return null
  return (
    <details open={defaultOpen} className={`rounded-md border ${containerClass}`}>
      <summary className="cursor-pointer px-4 py-3 flex items-center gap-3 list-none">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
        <span className="font-medium">{title}</span>
        <span className="text-xs text-zinc-600 dark:text-zinc-400">({standardIds.length})</span>
        <span className="text-xs text-zinc-500 ml-2">{subtitle}</span>
      </summary>
      <ul className="flex flex-col gap-3 px-4 pb-4">
        {standardIds.map((sid) => {
          const report = masteryMap.standards[sid]
          const gap = plan?.priority_gaps.find((g) => g.standard_id === sid)
          return (
            <li
              key={sid}
              className="rounded-md bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{standardName(sid)}</span>
                  <span className="text-xs font-mono text-zinc-500">{sid}</span>
                </div>
                {showProbeButton && (
                  <FocusedProbeButton
                    learnerId={learnerId}
                    standardId={sid}
                    standardName={standardName(sid)}
                    parentAssessmentId={parentAssessmentId}
                  />
                )}
              </div>
              {report.reasoning && (
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                  {report.reasoning}
                </p>
              )}
              {report.flagged_misconception_ids.length > 0 && (
                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium">Flagged misconception:</span>{' '}
                  {report.flagged_misconception_ids.map((m) => misconceptionName(m)).join(', ')}
                </div>
              )}
              {report.evidence_problem_ids.length > 0 && (
                <details className="mt-1 text-xs text-zinc-500">
                  <summary className="cursor-pointer select-none">
                    Audit — which problems informed this?
                  </summary>
                  <div className="mt-1 font-mono">
                    {report.evidence_problem_ids.join(', ')}
                  </div>
                </details>
              )}
              {gap && planId && (
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2">
                    Prescribed activities
                    {gap.diagnosis === 'prerequisite-gap' && (
                      <span className="ml-2 text-amber-700 dark:text-amber-400">
                        · Prerequisite gap
                      </span>
                    )}
                  </div>
                  {gap.rationale_for_this_gap && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-3">
                      {gap.rationale_for_this_gap}
                    </p>
                  )}
                  <ol className="flex flex-col gap-2">
                    {gap.activities
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((act) => {
                        const r = resourceById(act.resource_id)
                        const done = completed.find((c) => c.resource_id === act.resource_id)
                        return (
                          <ActivityTile
                            key={act.resource_id}
                            planId={planId}
                            order={act.order}
                            resourceId={act.resource_id}
                            rationale={act.rationale}
                            resource={r}
                            completedAt={done?.done_at ?? null}
                            allCompleted={completed}
                          />
                        )
                      })}
                  </ol>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </details>
  )
}
