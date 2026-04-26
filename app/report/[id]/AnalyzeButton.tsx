'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzeButton({
  assessmentId,
  parentAssessmentId,
}: {
  assessmentId: string
  parentAssessmentId?: string | null
}) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runAnalysis() {
    if (isRunning) return
    setIsRunning(true)
    setError(null)
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
        const text = await res.text()
        throw new Error(text || `Analysis failed with status ${res.status}`)
      }
      if (parentAssessmentId) {
        router.push(`/report/${parentAssessmentId}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed.'
      setError(message)
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={runAnalysis}
        disabled={isRunning}
        className="inline-flex h-10 items-center justify-center rounded-sm bg-brass-deep px-6 text-xs font-bold uppercase text-cream hover:bg-brass disabled:opacity-50 transition-colors w-fit border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
      >
        {isRunning ? 'Analyzing… ~10–20 sec' : 'Run analysis ◇'}
      </button>
      {error && (
        <p className="text-sm text-red-700 italic" style={{ fontFamily: 'var(--font-fraunces)' }}>{error}</p>
      )}
    </div>
  )
}
