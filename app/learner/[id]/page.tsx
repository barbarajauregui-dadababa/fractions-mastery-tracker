import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MasteryVoyage from './MasteryVoyage'
import { OrnamentalRule } from '@/app/Ornament'

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

  const { data: assessments } = await supabase
    .from('assessments')
    .select('id, completed_at, mastery_map, type')
    .eq('learner_id', id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)

  const latest = assessments?.[0]
  const masteryMap = (latest?.mastery_map as MasteryMap | null) ?? null

  // Count completed activities per standard (drives pennant count).
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

  const counts = { demonstrated: 0, working: 0, misconception: 0, not_assessed: 0, total: 11 }
  if (masteryMap?.standards) {
    for (const entry of Object.values(masteryMap.standards)) {
      counts[entry.state] = (counts[entry.state] ?? 0) + 1
    }
  } else {
    counts.not_assessed = 11
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2 items-center text-center">
          <p
            className="text-xs tracking-[0.4em] uppercase text-brass"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Mastery voyage of
          </p>
          <h1
            className="text-3xl sm:text-4xl tracking-tight text-cream"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            {learner.name}
          </h1>
          {latest?.completed_at && (
            <p
              className="text-xs text-cream-faint italic mt-1"
              style={{ fontFamily: 'var(--font-special-elite)' }}
            >
              Snapshot from{' '}
              {new Date(latest.completed_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
          {!latest && (
            <p className="text-sm text-cream-soft">
              No completed assessments yet — every stratum awaits the first probe.
            </p>
          )}
          <OrnamentalRule className="h-4 text-brass-deep mt-3" width={240} />
        </header>

        <MasteryVoyage
          masteryMap={masteryMap}
          completedByStandard={completedByStandard}
        />

        {latest && (
          <section className="flex flex-wrap gap-3 pt-4 border-t border-brass-deep/40 justify-center">
            <Link
              href={`/report/${latest.id}`}
              className="inline-flex h-10 items-center justify-center rounded-sm bg-brass-deep px-5 text-sm font-bold uppercase text-cream hover:bg-brass border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.35)]"
              style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
            >
              View latest report
            </Link>
          </section>
        )}

        <footer
          className="text-xs text-cream-faint italic text-center"
          style={{ fontFamily: 'var(--font-special-elite)' }}
        >
          Cloudscape: Simon Alexandre-Clément Denis, 1786 (Getty Museum, public domain). Balloon: Versailles ascent, 1783 (Library of Congress, public domain). Progressions sourced from Bill McCallum, hosted at mathematicalmusings.org.
        </footer>
      </div>
    </main>
  )
}
