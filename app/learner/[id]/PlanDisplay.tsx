import misconceptionsRaw from '@/content/fractions-misconceptions.json'
import resourcesRaw from '@/content/fractions-resources.json'
import ActivityTile, { type CompletedActivity } from './ActivityTile'
import { standardName } from '@/lib/standard-labels'

interface Activity {
  resource_id: string
  order: number
  rationale: string
}

interface PriorityGap {
  standard_id: string
  current_state: 'misconception' | 'working' | 'demonstrated' | 'not_assessed'
  flagged_misconception_ids: string[]
  diagnosis: 'within-concept' | 'prerequisite-gap'
  prerequisite_flags: string[]
  activities: Activity[]
  rationale_for_this_gap: string
}

export type SectionStatus = 'mastered' | 'now' | 'later' | 'not_yet_assessed'

export interface SectionRoadmapEntry {
  name: string
  im_source?: string
  standard_ids: string[]
  status: SectionStatus
}

export interface PlanContent {
  priority_gaps: PriorityGap[]
  overall_notes: string
  prerequisite_check_recommendations?: string[]
  current_section?: string
  section_roadmap?: SectionRoadmapEntry[]
  /** Backwards compatibility — previous schema used "progression" terminology. */
  current_progression?: string
  progression_roadmap?: SectionRoadmapEntry[]
  _completed_activities?: CompletedActivity[]
}

interface Misconception {
  id: string
  name: string
}
interface Resource {
  id: string
  title: string
  modality: string
  source_site?: string
  url?: string | null
  notes?: string
}

const misconceptions = misconceptionsRaw as unknown as { misconceptions: Misconception[] }
const resources = resourcesRaw as unknown as { resources: Resource[] }

function misconceptionName(id: string): string {
  return misconceptions.misconceptions.find((m) => m.id === id)?.name ?? id
}
function resourceById(id: string): Resource | undefined {
  return resources.resources.find((r) => r.id === id)
}

export default function PlanDisplay({ planId, plan }: { planId: string; plan: PlanContent }) {
  const completed = plan._completed_activities ?? []
  return (
    <section className="flex flex-col gap-6">
      {plan.overall_notes && (
        <div className="rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950/40 p-4 text-sm leading-relaxed">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-stone-500">
            Plan summary
          </div>
          {plan.overall_notes}
        </div>
      )}

      {plan.priority_gaps.length === 0 && (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          No priority gaps — the Plan Architect did not identify any immediate action items.
        </p>
      )}

      {plan.priority_gaps.map((gap) => (
        <GapCard key={gap.standard_id} planId={planId} gap={gap} completed={completed} />
      ))}

      {plan.prerequisite_check_recommendations && plan.prerequisite_check_recommendations.length > 0 && (
        <div className="rounded-md border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm leading-relaxed">
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Next assessment — consider probing
          </div>
          <ul className="list-disc ml-5 space-y-1">
            {plan.prerequisite_check_recommendations.map((sid) => (
              <li key={sid}>
                {standardName(sid)}{' '}
                <span className="font-mono text-xs text-amber-700/80">({sid})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function GapCard({
  planId,
  gap,
  completed,
}: {
  planId: string
  gap: PriorityGap
  completed: CompletedActivity[]
}) {
  const stateClass =
    gap.current_state === 'misconception'
      ? 'border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20'
      : 'border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20'
  const dotClass =
    gap.current_state === 'misconception' ? 'bg-red-500' : 'bg-amber-500'
  return (
    <div className={`rounded-md border px-4 py-3 ${stateClass}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotClass}`} />
          <span className="font-medium">{standardName(gap.standard_id)}</span>
          <span className="text-xs font-mono text-stone-500">{gap.standard_id}</span>
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-stone-600 dark:text-stone-400">
          {gap.diagnosis === 'prerequisite-gap' ? 'Prerequisite gap' : 'Within-concept'}
        </span>
      </div>

      {gap.flagged_misconception_ids.length > 0 && (
        <div className="mt-2 text-xs text-stone-600 dark:text-stone-400">
          Flagged:{' '}
          {gap.flagged_misconception_ids.map((m) => misconceptionName(m)).join(', ')}
        </div>
      )}

      {gap.prerequisite_flags.length > 0 && (
        <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
          Prerequisite to address first:{' '}
          {gap.prerequisite_flags.map((sid) => standardName(sid)).join(', ')}
        </div>
      )}

      <p className="mt-3 text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
        {gap.rationale_for_this_gap}
      </p>

      <ol className="mt-4 flex flex-col gap-3">
        {gap.activities
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((act) => {
            const r = resourceById(act.resource_id)
            const doneEntry = completed.find((c) => c.resource_id === act.resource_id)
            return (
              <ActivityTile
                key={act.resource_id}
                planId={planId}
                order={act.order}
                resourceId={act.resource_id}
                rationale={act.rationale}
                resource={r}
                completedAt={doneEntry?.done_at ?? null}
                allCompleted={completed}
              />
            )
          })}
      </ol>
    </div>
  )
}
