'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyzeButton({ assessmentId }: { assessmentId: string }) {
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
        body: JSON.stringify({ assessment_id: assessmentId }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Analysis failed with status ${res.status}`)
      }
      router.refresh()
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
        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 w-fit"
      >
        {isRunning ? 'Analyzing… this takes ~10–20 seconds' : 'Run analysis'}
      </button>
      {error && (
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      )}
    </div>
  )
}
