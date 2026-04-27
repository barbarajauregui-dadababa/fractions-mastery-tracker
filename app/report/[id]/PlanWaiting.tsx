'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import GeneratePlanButton from './GeneratePlanButton'

const POLL_INTERVAL_MS = 7000
const TIMEOUT_MS = 4 * 60 * 1000 // 4 minutes — Plan Architect should finish in 1–3 min

interface Props {
  assessmentId: string
}

export default function PlanWaiting({ assessmentId }: Props) {
  const router = useRouter()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      setElapsedMs(elapsed)
      if (elapsed >= TIMEOUT_MS) {
        setTimedOut(true)
        clearInterval(interval)
        return
      }
      // Refresh the route — server component re-renders, and if the plan
      // has landed in the database, the parent will render PlanDisplay
      // instead of <PlanWaiting/>.
      router.refresh()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [router])

  if (timedOut) {
    return (
      <section className="flex flex-col gap-3 rounded-sm border-2 border-amber-700/40 bg-paper-deep p-5">
        <div
          className="text-sm tracking-[0.25em] uppercase text-amber-800"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          The Plan Architect did not return in time
        </div>
        <p
          className="text-sm text-ink-soft"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          This sometimes happens on the first plan after a deploy. Click below to run it now.
        </p>
        <GeneratePlanButton assessmentId={assessmentId} />
      </section>
    )
  }

  const seconds = Math.floor(elapsedMs / 1000)
  return (
    <section className="flex items-center gap-4 rounded-sm border-2 border-brass-deep/40 bg-paper-deep/40 px-5 py-4">
      <SteampunkSpinner />
      <div className="flex-1">
        <div
          className="text-sm tracking-[0.25em] uppercase text-brass-deep"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          The Plan Architect is at work
        </div>
        <div
          className="text-base italic text-ink mt-0.5"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Drafting your plan… ~1–3 minutes.
        </div>
        <div
          className="text-xs text-ink-faint mt-1"
          style={{ fontFamily: 'var(--font-special-elite)' }}
        >
          Read the mastery map above while it works.
          {seconds > 0 && ` (${seconds}s elapsed)`}
        </div>
      </div>
    </section>
  )
}

function SteampunkSpinner() {
  // Slow-turning gear instead of a generic spinner — period-appropriate.
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-9 w-9 text-brass-deep animate-turn-slow"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        const x1 = 50 + 38 * Math.cos(a)
        const y1 = 50 + 38 * Math.sin(a)
        const x2 = 50 + 46 * Math.cos(a)
        const y2 = 50 + 46 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" />
      })}
      <circle cx="50" cy="50" r="34" />
      <circle cx="50" cy="50" r="14" />
      <circle cx="50" cy="50" r="5" fill="currentColor" stroke="none" />
    </svg>
  )
}

