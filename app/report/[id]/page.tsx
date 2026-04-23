import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyzeButton from './AnalyzeButton'
import conceptGraphRaw from '@/content/fractions-concept-graph.json'
import misconceptionsRaw from '@/content/fractions-misconceptions.json'

type SubSkillState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface SubSkillReport {
  state: SubSkillState
  evidence_problem_ids: string[]
  flagged_misconception_ids: string[]
  reasoning: string
}

interface MasteryMap {
  sub_skills: Record<string, SubSkillReport>
  overall_notes: string
}

interface ConceptNode {
  id: string
  name: string
  short_description: string
  level: number
}

interface Misconception {
  id: string
  name: string
}

const conceptGraph = conceptGraphRaw as unknown as { nodes: ConceptNode[] }
const misconceptions = misconceptionsRaw as unknown as { misconceptions: Misconception[] }

const stateStyles: Record<SubSkillState, { label: string; dot: string; bg: string }> = {
  misconception: {
    label: 'Misconception detected',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
  },
  working: {
    label: 'Working on it',
    dot: 'bg-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900',
  },
  demonstrated: {
    label: 'Demonstrated',
    dot: 'bg-green-500',
    bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900',
  },
  not_assessed: {
    label: 'Not yet assessed',
    dot: 'bg-zinc-400',
    bg: 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800',
  },
}

function subSkillName(id: string) {
  return conceptGraph.nodes.find((n) => n.id === id)?.name ?? id
}

function misconceptionName(id: string) {
  return misconceptions.misconceptions.find((m) => m.id === id)?.name ?? id
}

export default async function ReportPage(props: PageProps<'/report/[id]'>) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('id, type, completed_at, mastery_map, learners(name)')
    .eq('id', id)
    .single()

  if (error || !assessment) notFound()

  const learnerName =
    Array.isArray(assessment.learners)
      ? assessment.learners[0]?.name
      : (assessment.learners as { name: string } | null)?.name
  const displayName = learnerName ?? 'Learner'

  const masteryMap = assessment.mastery_map as MasteryMap | null
  const isCompleted = !!assessment.completed_at

  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-12 px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Report</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Mastery map for <strong>{displayName}</strong>
          {isCompleted
            ? ` — assessment completed ${new Date(assessment.completed_at!).toLocaleString()}`
            : ' — assessment not yet completed'}
        </p>
      </header>

      {!isCompleted && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          This assessment has not been submitted yet. Finish it before running analysis.
        </div>
      )}

      {isCompleted && !masteryMap && (
        <section className="flex flex-col gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-medium">Not analyzed yet</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Run the analysis to see the categorical mastery map.
          </p>
          <AnalyzeButton assessmentId={id} />
        </section>
      )}

      {masteryMap && (
        <>
          {masteryMap.overall_notes && (
            <section className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 p-4 text-sm leading-relaxed">
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Overall notes
              </div>
              {masteryMap.overall_notes}
            </section>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Sub-skills</h2>
            <ul className="flex flex-col gap-3">
              {Object.entries(masteryMap.sub_skills).map(([subSkillId, report]) => {
                const style = stateStyles[report.state]
                return (
                  <li
                    key={subSkillId}
                    className={`rounded-md border px-4 py-3 ${style.bg}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${style.dot}`} />
                        <span className="font-medium">{subSkillName(subSkillId)}</span>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                        {style.label}
                      </span>
                    </div>
                    {report.reasoning && (
                      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        {report.reasoning}
                      </p>
                    )}
                    {report.flagged_misconception_ids.length > 0 && (
                      <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        Flagged:{' '}
                        {report.flagged_misconception_ids
                          .map((m) => misconceptionName(m))
                          .join(', ')}
                      </div>
                    )}
                    {report.evidence_problem_ids.length > 0 && (
                      <div className="mt-1 text-xs font-mono text-zinc-500">
                        Evidence: {report.evidence_problem_ids.join(', ')}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  )
}
