import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AnalyzeButton from './AnalyzeButton'
import PlanWaiting from './PlanWaiting'
import type { PlanContent } from './PlanDisplay'
import FocusedProbeButton from './FocusedProbeButton'
import ActivityTile, { type CompletedActivity } from './ActivityTile'
import ModalityFilter from './ModalityFilter'
import { FractionsSectionStrip } from './RoadmapStrip'
import StrataCloudscape from '@/components/StrataCloudscape'
import { CornerFlourish } from '@/app/Ornament'
import { StandardInfo } from '@/app/SourceInfo'
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
import problemBankRaw from '@/content/fractions-problem-bank.json'

interface BankProblem {
  id: string
  problem_type: string
  goal: unknown
  real_world_context?: { framing_text?: string }
}
const problemBank = problemBankRaw as unknown as { problems: BankProblem[] }
function problemById(id: string): BankProblem | undefined {
  return problemBank.problems.find((p) => p.id === id)
}
function describeProblem(p: BankProblem): string {
  const framing = p.real_world_context?.framing_text
  if (framing) {
    const trimmed = framing.length > 80 ? framing.slice(0, 77) + '…' : framing
    return trimmed
  }
  // Fallbacks based on problem_type
  const goal = p.goal as { numerator?: number; denominator?: number; then_shade?: { numerator: number; denominator: number } } | undefined
  if (goal?.numerator !== undefined && goal?.denominator !== undefined) {
    return `${p.problem_type.replace(/_/g, ' ')} ${goal.numerator}/${goal.denominator}`
  }
  if (goal?.then_shade) {
    return `${p.problem_type.replace(/_/g, ' ')} → ${goal.then_shade.numerator}/${goal.then_shade.denominator}`
  }
  return p.problem_type.replace(/_/g, ' ')
}

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
  statement: string
  cluster_heading?: string
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
  const node = coherenceMap.nodes.find((n) => n.id === id)
  if (!node) return id
  // First clause of the verbatim CCSS-M statement: everything up to the first
  // period+space or semicolon. Fall back to a 100-char truncation if neither
  // appears. This stays verbatim (no paraphrase) while keeping list items short.
  const stmt = node.statement
  const semi = stmt.indexOf(';')
  const period = stmt.indexOf('. ')
  const cut = [semi, period].filter((i) => i > 0).sort((a, b) => a - b)[0]
  if (cut !== undefined) return stmt.slice(0, cut).trim()
  if (stmt.length > 100) return stmt.slice(0, 97).trim() + '…'
  return stmt
}
function standardIsPrerequisite(id: string): boolean {
  return coherenceMap.nodes.find((n) => n.id === id)?.role === 'prerequisite'
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

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: 'oklch(0.88 0.025 70)' }}>
      {/* Atmospheric backdrop — Denis cloudscape on a soft warm-tan ground.
          Cards above use a near-white warm paper so they read as the
          brightest layer, the page is mid-tone, the painting peeks behind. */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Image
          src="/images/cloudscape-denis.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          style={{ filter: 'sepia(0.4) brightness(1.05) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.88 0.025 70 / 0.25) 0%, oklch(0.86 0.028 68 / 0.40) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      {masteryMap && (
        <>
          <div className="flex flex-col gap-3">
            <StrataCloudscape
              masteryMap={masteryMap}
              compact
              bottomRightSlot={
                <Link
                  href={`/learner/${assessment.learner_id}`}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-brass bg-brass-deep/85 backdrop-blur px-3 py-1.5 text-sm tracking-[0.18em] uppercase text-cream hover:bg-brass transition-colors shadow-[0_0_12px_oklch(0.74_0.14_80/0.45)]"
                  style={{ fontFamily: 'var(--font-cinzel)' }}
                >
                  Open the voyage →
                </Link>
              }
            />
            {(() => {
              const roadmap = planContent?.section_roadmap ?? planContent?.progression_roadmap
              if (!roadmap || roadmap.length === 0) return null
              return <FractionsSectionStrip learnerName={displayName} roadmap={roadmap} />
            })()}
          </div>
        </>
      )}

      <header className="flex flex-col gap-2">
        <p
          className="text-sm tracking-[0.3em] uppercase text-ink-faint"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Mastery report · {displayName}
        </p>
        <h1
          className="text-3xl tracking-tight text-ink"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
        >
          {displayName}&apos;s mastery report
        </h1>
        <p className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {isCompleted
            ? `Completed ${new Date(assessment.completed_at!).toLocaleString()}`
            : 'Not yet completed'}
        </p>
      </header>

      {!isCompleted && (
        <div className="rounded-sm border-2 border-amber-700/40 bg-paper-deep px-4 py-3 text-sm text-amber-800" style={{ fontFamily: 'var(--font-fraunces)' }}>
          This assessment has not been submitted yet. Finish it before running analysis.
        </div>
      )}

      {isCompleted && !masteryMap && (
        <section className="flex flex-col gap-3 rounded-sm border-2 border-brass-deep/30 bg-[oklch(0.98_0.012_78)] p-6">
          <h2
            className="text-lg text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Step I — Analyze the responses
          </h2>
          <p className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Run analysis to produce the mastery map.
          </p>
          <AnalyzeButton assessmentId={id} parentAssessmentId={parentAssessmentId} />
        </section>
      )}

      {masteryMap && (
        <>
          <AtAGlanceSummary
            masteryMap={masteryMap}
            byState={byState}
          />

          {(planContent?.overall_notes ?? masteryMap.overall_notes) && (
            <section className="relative rounded-sm border border-stone-300/80 bg-[oklch(0.98_0.012_78)] p-6 text-base leading-relaxed text-ink" style={{ fontFamily: 'var(--font-fraunces)' }}>
              <CornerFlourish corner="tl" className="absolute top-1.5 left-1.5 h-5 w-5 text-brass-deep" />
              <CornerFlourish corner="tr" className="absolute top-1.5 right-1.5 h-5 w-5 text-brass-deep" />
              <CornerFlourish corner="bl" className="absolute bottom-1.5 left-1.5 h-5 w-5 text-brass-deep" />
              <CornerFlourish corner="br" className="absolute bottom-1.5 right-1.5 h-5 w-5 text-brass-deep" />
              <div
                className="mb-3 text-base sm:text-lg tracking-[0.22em] uppercase text-brass-deep font-bold"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                Analyst&apos;s notes
              </div>
              <BulletedSentences
                text={planContent?.overall_notes ?? masteryMap.overall_notes ?? ''}
              />
            </section>
          )}

          {/* Modality filter — lets the user hide activity types they don't
              want (e.g. "no videos for my kid this week"). Body-class based,
              persists in localStorage. Affects every ActivityTile on the
              page via CSS. */}
          <ModalityFilter />

          {/* Three buckets: red (misconception), amber (building), green (mastered). */}
          <section className="flex flex-col gap-4">
            <Bucket
              title="Misconception detected"
              subtitle="A specific wrong mental model is firing. Targeted intervention required."
              dot="bg-red-600"
              showWarningGlyph
              containerClass="bg-[oklch(0.84_0.030_68)] border border-red-600/30 border-l-4 border-l-red-600"
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
              title="Building the skill"
              subtitle="Reasoning is on the right track but not yet reliable. More varied practice."
              dot="bg-amber-600"
              containerClass="bg-[oklch(0.84_0.030_68)] border border-amber-700/30 border-l-4 border-l-amber-600"
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
              title="Mastered"
              subtitle="Reliably understood. No action needed."
              dot="bg-emerald-600"
              containerClass="bg-[oklch(0.84_0.030_68)] border border-emerald-700/30 border-l-4 border-l-emerald-600"
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

          {/* No plan yet — Plan Architect is working in the background.
              The waiting component polls and auto-refreshes when the plan
              lands. After 4 min, falls back to a manual generate button. */}
          {!planContent && <PlanWaiting assessmentId={id} />}
          {planContent && planId && (
            <>
              <div className="text-xs text-stone-500">
                Plan generated{' '}
                {planGeneratedAt && new Date(planGeneratedAt).toLocaleString()}.
              </div>
              {planContent.prerequisite_check_recommendations &&
                planContent.prerequisite_check_recommendations.length > 0 && (
                  <div className="relative rounded-sm border-2 border-brass-deep/50 bg-[oklch(0.98_0.012_78)] px-5 py-4 text-sm leading-relaxed shadow-[0_0_20px_oklch(0.74_0.14_80/0.12)]">
                    <CornerFlourish corner="tl" className="absolute top-1.5 left-1.5 h-5 w-5 text-brass-deep" />
                    <CornerFlourish corner="tr" className="absolute top-1.5 right-1.5 h-5 w-5 text-brass-deep" />
                    <CornerFlourish corner="bl" className="absolute bottom-1.5 left-1.5 h-5 w-5 text-brass-deep" />
                    <CornerFlourish corner="br" className="absolute bottom-1.5 right-1.5 h-5 w-5 text-brass-deep" />
                    <div
                      className="mb-2 text-sm tracking-[0.25em] uppercase text-brass-deep"
                      style={{ fontFamily: 'var(--font-cinzel)' }}
                    >
                      Next assessment · consider probing
                    </div>
                    <ul
                      className="list-disc ml-5 space-y-1 text-ink-soft"
                      style={{ fontFamily: 'var(--font-fraunces)' }}
                    >
                      {planContent.prerequisite_check_recommendations.map((sid) => (
                        <li key={sid}>
                          <span className="italic">{standardName(sid)}</span>{' '}
                          <span
                            className="not-italic text-ink-faint text-xs"
                            style={{ fontFamily: 'var(--font-special-elite)' }}
                          >
                            ({sid}{standardIsPrerequisite(sid) ? ' · prerequisite' : ''})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </>
          )}
        </>
      )}
      </div>
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

  return (
    <section className="relative rounded-sm border-2 border-brass-deep/40 bg-[oklch(0.98_0.012_78)] p-6">
      <CornerFlourish corner="tl" className="absolute top-1.5 left-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <CornerFlourish corner="tr" className="absolute top-1.5 right-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <CornerFlourish corner="bl" className="absolute bottom-1.5 left-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <CornerFlourish corner="br" className="absolute bottom-1.5 right-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-sm tracking-[0.25em] uppercase text-brass-deep"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          At a glance · Number & Operations: Fractions progression · CCSS Math Standards
        </span>
        <StandardInfo />
      </div>
      <ul className="flex flex-col gap-4 text-sm" style={{ fontFamily: 'var(--font-fraunces)' }}>
        {/* Needs attention (red/misconception) */}
        {byState.misconception.length > 0 && (
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-red-600 shrink-0" />
            <div className="flex-1">
              <div className="text-ink">
                <span className="font-semibold">Needs attention</span>
                <span className="text-ink-faint ml-1.5" style={{ fontFamily: 'var(--font-cinzel)' }}>
                  ({byState.misconception.length})
                </span>
              </div>
              <ul className="mt-1 flex flex-col gap-0.5 text-ink-soft">
                {byState.misconception.map((sid) => (
                  <li key={sid} className="italic">
                    {standardName(sid)}{' '}
                    <span className="not-italic text-ink-faint text-xs" style={{ fontFamily: 'var(--font-special-elite)' }}>
                      ({sid}{standardIsPrerequisite(sid) ? ' · prerequisite' : ''})
                    </span>
                  </li>
                ))}
              </ul>
              {byState.misconception.some(
                (sid) => masteryMap.standards[sid].flagged_misconception_ids.length > 0
              ) && (
                <div className="text-xs text-ink-faint mt-1.5">
                  Flagged misconceptions:{' '}
                  {Array.from(
                    new Set(
                      byState.misconception.flatMap((sid) =>
                        masteryMap.standards[sid].flagged_misconception_ids.map((m) =>
                          misconceptionName(m)
                        )
                      )
                    )
                  ).join('; ')}
                </div>
              )}
            </div>
          </li>
        )}

        {/* Needs work (amber, formerly "Working on") */}
        {byState.working.length > 0 && (
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-amber-600 shrink-0" />
            <div className="flex-1">
              <div className="text-ink">
                <span className="font-semibold">Needs work</span>
                <span className="text-ink-faint ml-1.5" style={{ fontFamily: 'var(--font-cinzel)' }}>
                  ({byState.working.length})
                </span>
              </div>
              <ul className="mt-1 flex flex-col gap-0.5 text-ink-soft">
                {byState.working.map((sid) => (
                  <li key={sid} className="italic">
                    {standardName(sid)}{' '}
                    <span className="not-italic text-ink-faint text-xs" style={{ fontFamily: 'var(--font-special-elite)' }}>
                      ({sid}{standardIsPrerequisite(sid) ? ' · prerequisite' : ''})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )}

        {/* Mastered (emerald) */}
        <li className="flex items-start gap-3">
          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-600 shrink-0" />
          <div className="flex-1">
            <div className="text-ink">
              <span className="font-semibold">Mastered</span>
              <span className="text-ink-faint ml-1.5" style={{ fontFamily: 'var(--font-cinzel)' }}>
                ({byState.demonstrated.length})
              </span>
            </div>
            {byState.demonstrated.length === 0 ? (
              <div className="text-ink-soft italic mt-1">—</div>
            ) : (
              <ul className="mt-1 flex flex-col gap-0.5 text-ink-soft">
                {byState.demonstrated.map((sid) => (
                  <li key={sid} className="italic">
                    {standardName(sid)}{' '}
                    <span className="not-italic text-ink-faint text-xs" style={{ fontFamily: 'var(--font-special-elite)' }}>
                      ({sid}{standardIsPrerequisite(sid) ? ' · prerequisite' : ''})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>

        {/* Not yet probed (not_assessed) */}
        {notAssessed.length > 0 && (
          <li className="flex items-start gap-3">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-stone-400 shrink-0" />
            <div className="flex-1">
              <div className="text-ink">
                <span className="font-semibold">Not yet probed</span>
                <span className="text-ink-faint ml-1.5" style={{ fontFamily: 'var(--font-cinzel)' }}>
                  ({notAssessed.length})
                </span>
              </div>
              <ul className="mt-1 flex flex-col gap-0.5 text-ink-soft">
                {notAssessed.map((sid) => (
                  <li key={sid} className="italic">
                    {standardName(sid)}{' '}
                    <span className="not-italic text-ink-faint text-xs" style={{ fontFamily: 'var(--font-special-elite)' }}>
                      ({sid}{standardIsPrerequisite(sid) ? ' · prerequisite' : ''})
                    </span>
                  </li>
                ))}
              </ul>
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
  showWarningGlyph,
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
  showWarningGlyph?: boolean
  defaultOpen: boolean
}) {
  const completed: CompletedActivity[] = plan?._completed_activities ?? []
  if (standardIds.length === 0) return null
  return (
    <details open={defaultOpen} className={`relative rounded-sm border-2 ${containerClass}`}>
      <CornerFlourish corner="tl" className="absolute top-1.5 left-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <CornerFlourish corner="tr" className="absolute top-1.5 right-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <CornerFlourish corner="bl" className="absolute bottom-1.5 left-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <CornerFlourish corner="br" className="absolute bottom-1.5 right-1.5 h-5 w-5 text-brass-deep pointer-events-none" />
      <summary className="cursor-pointer px-4 py-3 flex items-center gap-3 list-none flex-wrap">
        <span className={`inline-block h-3 w-3 rounded-full ${dot}`} />
        {showWarningGlyph && <WarningCartouche />}
        <span
          className="font-bold uppercase text-ink text-base sm:text-lg"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          {title}
        </span>
        <span
          className="text-base text-ink-faint font-bold"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          ({standardIds.length})
        </span>
        <span
          className="text-sm text-ink-soft ml-2"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {subtitle}
        </span>
      </summary>
      <ul className="flex flex-col gap-3 px-4 pb-4">
        {standardIds.map((sid) => {
          const report = masteryMap.standards[sid]
          const gap = plan?.priority_gaps.find((g) => g.standard_id === sid)
          return (
            <li
              key={sid}
              className="rounded-sm bg-[oklch(0.93_0.018_75)] border border-brass-deep/30 px-4 py-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span
                    className="text-ink"
                    style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                  >
                    {standardName(sid)}
                  </span>
                  <span
                    className="text-xs text-ink-faint"
                    style={{ fontFamily: 'var(--font-special-elite)' }}
                  >
                    ({sid}{standardIsPrerequisite(sid) ? ' · prerequisite' : ''})
                  </span>
                </div>
              </div>
              {report.reasoning && (
                <div
                  className="mt-2 text-sm text-ink-soft"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  <BulletedSentences text={report.reasoning} />
                </div>
              )}
              {report.flagged_misconception_ids.length > 0 && (
                <div
                  className="mt-2 text-xs text-ink-soft"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  <span className="font-medium text-ink">Flagged misconception:</span>{' '}
                  {report.flagged_misconception_ids.map((m) => misconceptionName(m)).join(', ')}
                </div>
              )}
              {report.evidence_problem_ids.length > 0 && (
                <details className="mt-1 text-xs text-ink-faint">
                  <summary
                    className="cursor-pointer select-none uppercase tracking-[0.15em]"
                    style={{ fontFamily: 'var(--font-cinzel)' }}
                  >
                    Audit — which problems informed this?
                  </summary>
                  <ul
                    className="mt-2 list-disc ml-5 space-y-0.5 text-ink-soft"
                    style={{ fontFamily: 'var(--font-fraunces)' }}
                  >
                    {report.evidence_problem_ids.map((pid) => {
                      const p = problemById(pid)
                      return (
                        <li key={pid}>
                          <span style={{ fontFamily: 'var(--font-special-elite)' }}>{pid}</span>
                          {p ? (
                            <> — {describeProblem(p)}</>
                          ) : (
                            <span className="text-red-700 italic"> — unknown problem id (the AI may have hallucinated this)</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </details>
              )}
              {gap && planId && (
                <div className="mt-3 pt-3 border-t border-brass-deep/30">
                  <div
                    className="text-sm tracking-[0.2em] uppercase text-brass-deep mb-2"
                    style={{ fontFamily: 'var(--font-cinzel)' }}
                  >
                    Prescribed activities
                    {gap.diagnosis === 'prerequisite-gap' && (
                      <span className="ml-2 text-amber-700">
                        · Prerequisite gap
                      </span>
                    )}
                  </div>
                  <ol className="flex flex-col gap-2">
                    {gap.activities
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((act) => {
                        const r = resourceById(act.resource_id)
                        const done = completed.find((c) => c.resource_id === act.resource_id)
                        // Compose the long-form rationale for the activity:
                        // gap-level + activity-level concatenated. This is what
                        // the learner sees when they tap "Why this activity?".
                        const fullRationale = [
                          gap.rationale_for_this_gap?.trim(),
                          act.rationale?.trim(),
                        ]
                          .filter(Boolean)
                          .join(' ')
                        return (
                          <ActivityTile
                            key={act.resource_id}
                            planId={planId}
                            order={act.order}
                            resourceId={act.resource_id}
                            rationale={fullRationale}
                            resource={r}
                            completedAt={done?.done_at ?? null}
                            allCompleted={completed}
                          />
                        )
                      })}
                  </ol>

                  {showProbeButton && (
                    <div className="mt-4 pt-3 border-t border-dashed border-brass-deep/40 flex flex-col gap-2">
                      <div
                        className="text-sm tracking-[0.2em] uppercase text-brass-deep"
                        style={{ fontFamily: 'var(--font-cinzel)' }}
                      >
                        Verify mastery
                      </div>
                      <p
                        className="text-xs text-ink-soft leading-relaxed italic"
                        style={{ fontFamily: 'var(--font-fraunces)' }}
                      >
                        Once the activities above are complete, run a focused probe — a short re-test of just this standard, ~10 minutes — to confirm the misconception has resolved.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <FocusedProbeButton
                          learnerId={learnerId}
                          standardId={sid}
                          standardName={standardName(sid)}
                          parentAssessmentId={parentAssessmentId}
                        />
                        <Link
                          href={`/contribute?standard=${encodeURIComponent(sid)}`}
                          className="inline-flex items-center gap-1.5 text-sm tracking-[0.18em] uppercase text-copper hover:text-brass-deep underline underline-offset-2 decoration-brass-deep/40 hover:decoration-brass-deep"
                          style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          + Suggest an activity for this standard
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </details>
  )
}

/**
 * Split a paragraph into sentences and render as bullets. Splits on
 * sentence-terminal punctuation (.?!) followed by whitespace. Keeps the
 * punctuation. Falls back to the original text rendered as a single
 * bullet if it does not split cleanly.
 */
function BulletedSentences({ text }: { text: string }) {
  const trimmed = text.trim()
  if (!trimmed) return null

  // 1. If the analysis returned dash-prefixed bullets ("- foo\n- bar"),
  //    split on those bullets.
  const dashSplit = /(?:^|\n)\s*[-*•]\s+/
  if (dashSplit.test(trimmed)) {
    const items = trimmed
      .split(dashSplit)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (items.length > 0) {
      return (
        <ul className="list-disc ml-5 space-y-1.5 leading-relaxed">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )
    }
  }

  // 2. Newline-separated lines.
  const newlineLines = trimmed
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (newlineLines.length > 1) {
    return (
      <ul className="list-disc ml-5 space-y-1.5 leading-relaxed">
        {newlineLines.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    )
  }

  // 3. Fallback: sentence-split.
  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (sentences.length <= 1) {
    return <p className="leading-relaxed">{trimmed}</p>
  }
  return (
    <ul className="list-disc ml-5 space-y-1.5 leading-relaxed">
      {sentences.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  )
}

/**
 * Brass warning cartouche — a small octagonal brass plaque with an
 * exclamation mark, used next to "Misconception detected" to signal
 * "intervene here" without resorting to an emoji.
 */
function WarningCartouche() {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center"
      style={{ width: 18, height: 18 }}
    >
      <svg viewBox="0 0 18 18" width="18" height="18" fill="none">
        {/* Octagonal brass plaque */}
        <path
          d="M 5 1 L 13 1 L 17 5 L 17 13 L 13 17 L 5 17 L 1 13 L 1 5 Z"
          fill="oklch(0.74 0.14 80)"
          stroke="oklch(0.42 0.10 65)"
          strokeWidth="1"
        />
        {/* Inner bevel */}
        <path
          d="M 5.5 2 L 12.5 2 L 16 5.5 L 16 12.5 L 12.5 16 L 5.5 16 L 2 12.5 L 2 5.5 Z"
          fill="none"
          stroke="oklch(0.95 0.06 85 / 0.6)"
          strokeWidth="0.5"
        />
        {/* Exclamation mark */}
        <line
          x1="9" y1="4.5" x2="9" y2="11"
          stroke="oklch(0.20 0.03 50)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="9" cy="13.2" r="1" fill="oklch(0.20 0.03 50)" />
      </svg>
    </span>
  )
}
