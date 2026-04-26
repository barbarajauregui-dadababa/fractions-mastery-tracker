'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GeneratePlanButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runPlan() {
    if (isRunning) return
    setIsRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment_id: assessmentId }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Plan generation failed with status ${res.status}`)
      }
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Plan generation failed.'
      setError(message)
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={runPlan}
        disabled={isRunning}
        className="inline-flex h-10 items-center justify-center rounded-sm bg-brass-deep px-6 text-xs font-bold uppercase text-cream hover:bg-brass disabled:opacity-50 transition-colors w-fit border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
      >
        {isRunning ? 'Plan Architect at work… 1–3 min' : 'Generate plan ◇'}
      </button>
      {error && <p className="text-sm text-red-700 italic" style={{ fontFamily: 'var(--font-fraunces)' }}>{error}</p>}
    </div>
  )
}
