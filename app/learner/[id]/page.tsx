import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MasteryTree from './MasteryTree'

interface MasteryMap {
  standards: Record<string, { state: 'misconception' | 'working' | 'demonstrated' | 'not_assessed' }>
}

export default async function LearnerDashboardPage(
  props: PageProps<'/learner/[id]'>
) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: learner, error: learnerErr } = await supabase
    .from('learners')
    .select('id, name, age, grade_level')
    .eq('id', id)
    .single()
  if (learnerErr || !learner) notFound()

  // Most recent completed assessment becomes the current mastery snapshot.
  const { data: assessments } = await supabase
    .from('assessments')
    .select('id, completed_at, mastery_map, type')
    .eq('learner_id', id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const latest = assessments?.[0]
  const masteryMap = (latest?.mastery_map as MasteryMap | null) ?? null

  // Count completed activities per standard (for flowers).
  const completedByStandard: Record<string, number> = {}
  if (latest) {
    const { data: planRow } = await supabase
      .from('plans')
      .select('plan_content')
      .eq('assessment_id', latest.id)
      .eq('status', 'active')
      .maybeSingle()
    type PlanShape = {
      priority_gaps?: { standard_id: string; activities: { resource_id: string }[] }[]
      _completed_activities?: { resource_id: string }[]
    }
    const plan = (planRow?.plan_content as PlanShape | null) ?? null
    if (plan) {
      const completedIds = new Set(
        (plan._completed_activities ?? []).map((c) => c.resource_id)
      )
      for (const gap of plan.priority_gaps ?? []) {
        for (const act of gap.activities ?? []) {
          if (completedIds.has(act.resource_id)) {
            completedByStandard[gap.standard_id] =
              (completedByStandard[gap.standard_id] ?? 0) + 1
          }
        }
      }
    }
  }

  // Counts for the at-a-glance bar.
  const counts = { demonstrated: 0, working: 0, misconception: 0, not_assessed: 0, total: 11 }
  if (masteryMap?.standards) {
    for (const entry of Object.values(masteryMap.standards)) {
      counts[entry.state] = (counts[entry.state] ?? 0) + 1
    }
  } else {
    counts.not_assessed = 11
  }

  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-8 py-10 px-6">
      <header className="flex flex-col gap-1">
        <div className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Mastery tree
        </div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
          {learner.name}
        </h1>
        {latest?.completed_at && (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Snapshot from{' '}
            {new Date(latest.completed_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
        {!latest && (
          <p className="text-sm text-stone-600 dark:text-stone-400">
            No completed assessments yet — the tree shows every standard as
            not yet probed.
          </p>
        )}
      </header>

      {/* Counts strip */}
      <section className="flex items-center justify-center gap-6 rounded-xl bg-stone-100 dark:bg-stone-900/60 px-6 py-4 text-sm">
        <Stat label="Mastered" value={counts.demonstrated} accent="text-emerald-700 dark:text-emerald-400" />
        <Divider />
        <Stat label="Working on" value={counts.working} accent="text-amber-700 dark:text-amber-400" />
        <Divider />
        <Stat label="Needs attention" value={counts.misconception} accent="text-red-700 dark:text-red-400" />
        <Divider />
        <Stat label="Not yet probed" value={counts.not_assessed} accent="text-stone-500 dark:text-stone-500" />
      </section>

      <MasteryTree
        masteryMap={masteryMap}
        completedByStandard={completedByStandard}
      />

      <section className="flex flex-wrap gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
        {latest && (
          <Link
            href={`/report/${latest.id}`}
            className="inline-flex h-9 items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
          >
            View latest report
          </Link>
        )}
        <Link
          href="/setup"
          className="inline-flex h-9 items-center justify-center rounded-md border border-stone-300 dark:border-stone-700 px-4 text-sm font-medium text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900"
        >
          Start a new assessment
        </Link>
      </section>

      <footer className="text-[10px] text-stone-400 dark:text-stone-600 italic">
        Section structure: Illustrative Mathematics, Grade 3 Unit 5 and Grade 4 Unit 2 (CC BY 4.0).
      </footer>
    </main>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-2xl font-semibold ${accent}`}>{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-stone-500 dark:text-stone-500">
        {label}
      </span>
    </div>
  )
}

function Divider() {
  return <span className="h-8 w-px bg-stone-200 dark:bg-stone-800" aria-hidden />
}
