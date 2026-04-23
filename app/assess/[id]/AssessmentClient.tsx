'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export interface PublicProblem {
  id: string
  sub_skill_id: string
  problem_type: 'procedural' | 'conceptual' | 'applied'
  prompt: string
}

interface Response {
  problem_id: string
  answer: string
  work_shown: string
}

interface Props {
  assessmentId: string
  problems: PublicProblem[]
  learnerName: string
}

export default function AssessmentClient({ assessmentId, problems, learnerName }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [index, setIndex] = useState(0)
  const [responses, setResponses] = useState<Response[]>(() =>
    problems.map((p) => ({ problem_id: p.id, answer: '', work_shown: '' }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = problems.length
  const current = problems[index]
  const currentResponse = responses[index]
  const isLast = index === total - 1

  function updateCurrent(field: 'answer' | 'work_shown', value: string) {
    setResponses((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  async function submitAssessment() {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    try {
      const { error: updateError } = await supabase
        .from('assessments')
        .update({ responses, completed_at: new Date().toISOString() })
        .eq('id', assessmentId)
      if (updateError) throw updateError
      router.push(`/report/${assessmentId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not submit assessment.'
      setError(message)
      setIsSubmitting(false)
    }
  }

  function goNext() {
    if (isLast) {
      void submitAssessment()
    } else {
      setIndex((i) => i + 1)
    }
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1)
  }

  if (total === 0) {
    return (
      <main className="flex flex-1 w-full max-w-2xl mx-auto flex-col gap-4 py-24 px-8">
        <h1 className="text-2xl font-semibold">No problems loaded</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          This assessment has no problems. Create a new one from the dashboard.
        </p>
      </main>
    )
  }

  return (
    <main className="flex flex-1 w-full max-w-2xl mx-auto flex-col gap-8 py-12 px-8">
      <header className="flex items-baseline justify-between gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          Assessment for <strong className="text-zinc-900 dark:text-zinc-100">{learnerName}</strong>
        </span>
        <span>
          Problem {index + 1} of {total}
        </span>
      </header>

      <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded">
        <div
          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <section className="flex flex-col gap-6">
        <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
          {current.prompt}
        </p>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Your answer</span>
          <input
            type="text"
            value={currentResponse.answer}
            onChange={(e) => updateCurrent('answer', e.target.value)}
            className="h-11 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 text-base bg-white dark:bg-zinc-950"
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Show your work</span>
          <textarea
            value={currentResponse.work_shown}
            onChange={(e) => updateCurrent('work_shown', e.target.value)}
            rows={6}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 p-3 text-base bg-white dark:bg-zinc-950 resize-y"
            placeholder="Explain how you got your answer — drawings described in words are fine."
          />
        </label>
      </section>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      <footer className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0 || isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-sm font-medium disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? 'Submitting…' : isLast ? 'Submit assessment' : 'Next'}
        </button>
      </footer>
    </main>
  )
}
