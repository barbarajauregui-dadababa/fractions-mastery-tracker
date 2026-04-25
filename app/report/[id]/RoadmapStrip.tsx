import type { SectionRoadmapEntry, SectionStatus } from './PlanDisplay'

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
      <div className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-zinc-400">
        4th-grade math overview
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {FOURTH_GRADE_DOMAINS.map((d) => {
          const inProgress = d.status === 'in_progress'
          return (
            <li
              key={d.code}
              className={`rounded-lg border px-3 py-2.5 flex flex-col gap-0.5 ${
                inProgress
                  ? 'bg-white dark:bg-zinc-950 border-stone-300 dark:border-zinc-700 shadow-sm'
                  : 'bg-stone-50 dark:bg-zinc-900/40 border-stone-200 dark:border-zinc-800 opacity-70'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-mono ${
                    inProgress ? 'text-stone-700 dark:text-zinc-300' : 'text-stone-500 dark:text-zinc-500'
                  }`}
                >
                  {d.code}
                </span>
                {inProgress && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                )}
              </div>
              <div
                className={`text-xs leading-tight ${
                  inProgress ? 'text-stone-800 dark:text-zinc-200' : 'text-stone-500 dark:text-zinc-500'
                }`}
              >
                {d.name}
              </div>
              <div
                className={`text-[10px] mt-0.5 ${
                  inProgress
                    ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                    : 'text-stone-400 dark:text-zinc-600 italic'
                }`}
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
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-zinc-400">
          Fractions sections for {learnerName}
        </div>
        <div className="text-[10px] text-stone-500 dark:text-zinc-500 italic">
          Source: Illustrative Mathematics, Grade 3 Unit 5 and Grade 4 Unit 2
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
    <li className={`rounded-lg border px-3 py-2.5 flex flex-col gap-1 min-h-[5.5rem] ${cls.container}`}>
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-mono ${cls.index}`}>{index}</span>
        <StatusBadge status={entry.status} />
      </div>
      <div className={`text-sm leading-snug font-medium ${cls.title}`}>{entry.name}</div>
    </li>
  )
}

function StatusBadge({ status }: { status: SectionStatus }) {
  switch (status) {
    case 'mastered':
      return (
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M5 12.5l4.5 4.5L20 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Mastered
        </span>
      )
    case 'now':
      return (
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-stone-900 dark:text-zinc-50">
          <span className="h-1.5 w-1.5 rounded-full bg-stone-900 dark:bg-zinc-50 animate-pulse" aria-hidden />
          Now
        </span>
      )
    case 'later':
      return (
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-600">
          Later
        </span>
      )
    case 'not_yet_assessed':
      return (
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-stone-400 dark:text-zinc-600">
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
        container: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900',
        index: 'text-emerald-700 dark:text-emerald-400',
        title: 'text-stone-700 dark:text-zinc-300',
      }
    case 'now':
      return {
        container: 'bg-white dark:bg-zinc-950 border-stone-400 dark:border-zinc-500 shadow-sm ring-1 ring-stone-300 dark:ring-zinc-600',
        index: 'text-stone-700 dark:text-zinc-300',
        title: 'text-stone-900 dark:text-zinc-50',
      }
    case 'later':
      return {
        container: 'bg-stone-50 dark:bg-zinc-900/40 border-stone-200 dark:border-zinc-800 opacity-70',
        index: 'text-stone-400 dark:text-zinc-600',
        title: 'text-stone-500 dark:text-zinc-500',
      }
    case 'not_yet_assessed':
      return {
        container: 'bg-stone-50 dark:bg-zinc-900/40 border-stone-200 border-dashed dark:border-zinc-800 opacity-80',
        index: 'text-stone-400 dark:text-zinc-600',
        title: 'text-stone-500 dark:text-zinc-500',
      }
  }
}
