import type { SectionRoadmapEntry, SectionStatus } from './PlanDisplay'
import { RomanNumeral } from '@/app/Ornament'
import { ProgressionInfo, SectionInfo } from '@/app/SourceInfo'

const FOURTH_GRADE_DOMAINS: { code: string; name: string; status: 'in_progress' | 'v15' }[] = [
  { code: '4.OA', name: 'Operations & Algebraic Thinking', status: 'v15' },
  { code: '4.NBT', name: 'Number & Operations in Base Ten', status: 'v15' },
  { code: '4.NF', name: 'Number & Operations — Fractions', status: 'in_progress' },
  { code: '4.MD', name: 'Measurement & Data', status: 'v15' },
  { code: '4.G', name: 'Geometry', status: 'v15' },
]

export function FourthGradeOverviewStrip() {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="text-sm tracking-[0.25em] uppercase text-ink-faint"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          The 5 Progressions of 4th-grade math
        </span>
        <ProgressionInfo />
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {FOURTH_GRADE_DOMAINS.map((d) => {
          const inProgress = d.status === 'in_progress'
          return (
            <li
              key={d.code}
              className={`rounded-sm border-2 px-3 py-2.5 flex flex-col gap-0.5 ${
                inProgress
                  ? 'bg-paper border-brass-deep shadow-sm'
                  : 'bg-paper-deep/40 border-stone-300 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs tracking-[0.15em] ${
                    inProgress ? 'text-brass-deep' : 'text-ink-faint'
                  }`}
                  style={{ fontFamily: 'var(--font-cinzel)' }}
                >
                  {d.code}
                </span>
              </div>
              <div
                className={`text-xs leading-tight ${
                  inProgress ? 'text-ink' : 'text-ink-faint'
                }`}
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                {d.name}
              </div>
              <div
                className={`mt-1 ${
                  inProgress
                    ? 'text-base text-brass-deep'
                    : 'text-xs text-ink-faint italic'
                }`}
                style={{
                  fontFamily: inProgress
                    ? 'var(--font-cinzel)'
                    : 'var(--font-fraunces)',
                  fontWeight: inProgress ? 700 : undefined,
                }}
              >
                {inProgress ? 'In progress' : 'Coming in v1.5'}
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

interface SectionStripProps {
  learnerName: string
  roadmap: SectionRoadmapEntry[]
}

export function FractionsSectionStrip({ learnerName, roadmap }: SectionStripProps) {
  return (
    <section className="flex flex-col gap-2 pl-4 border-l-2 border-brass-deep">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="text-sm tracking-[0.25em] uppercase text-ink-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Inside 4.NF · IM Sections for {learnerName}
          </span>
          <SectionInfo />
        </div>
        <div
          className="text-xs text-ink-faint italic"
          style={{ fontFamily: 'var(--font-special-elite)' }}
        >
          Grade 3 Unit 5 + Grade 4 Unit 2
        </div>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
        {roadmap.map((p, i) => (
          <SectionTile key={p.name} entry={p} index={i + 1} />
        ))}
      </ol>
    </section>
  )
}

function SectionTile({
  entry,
  index,
}: {
  entry: SectionRoadmapEntry
  index: number
}) {
  const cls = tileClass(entry.status)
  return (
    <li className={`rounded-sm border-2 px-3 py-2.5 flex flex-col gap-1 min-h-[5.5rem] ${cls.container}`}>
      <div className="flex items-center gap-1.5">
        <RomanNumeral
          n={index}
          className={`text-xs ${cls.index}`}
        />
        <StatusBadge status={entry.status} />
      </div>
      <div
        className={`text-sm leading-snug ${cls.title}`}
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
      >
        {entry.name}
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: SectionStatus }) {
  switch (status) {
    case 'mastered':
      return (
        <span
          className="ml-auto inline-flex items-center gap-1 text-[11px] tracking-[0.15em] uppercase text-emerald-700"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M5 12.5l4.5 4.5L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Mastered
        </span>
      )
    case 'now':
      return (
        <span
          className="ml-auto inline-flex items-center gap-1 text-[11px] tracking-[0.15em] uppercase text-brass-deep"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brass-deep animate-pulse" aria-hidden />
          Now
        </span>
      )
    case 'later':
      return (
        <span
          className="ml-auto text-[11px] tracking-[0.15em] uppercase text-ink-faint"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Later
        </span>
      )
    case 'not_yet_assessed':
      return (
        <span
          className="ml-auto text-[11px] tracking-[0.15em] uppercase text-ink-faint italic"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Not yet probed
        </span>
      )
  }
}

function tileClass(status: SectionStatus): {
  container: string
  index: string
  title: string
} {
  switch (status) {
    case 'mastered':
      return {
        container: 'bg-emerald-50 border-emerald-700/40',
        index: 'text-emerald-700',
        title: 'text-ink-soft',
      }
    case 'now':
      return {
        container: 'bg-paper border-brass-deep shadow-sm',
        index: 'text-brass-deep',
        title: 'text-ink',
      }
    case 'later':
      return {
        container: 'bg-paper-deep/40 border-stone-300 opacity-75',
        index: 'text-ink-faint',
        title: 'text-ink-faint',
      }
    case 'not_yet_assessed':
      return {
        container: 'bg-paper-deep/40 border-stone-300 border-dashed opacity-75',
        index: 'text-ink-faint',
        title: 'text-ink-faint',
      }
  }
}
