'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { selectProblems } from '@/lib/problem-selection'

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        const { error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError) throw signInError
      }

      const { data: userData } = await supabase.auth.getUser()
      const guideId = userData.user?.id ?? null

      const { data: learner, error: learnerError } = await supabase
        .from('learners')
        .insert({
          name: name.trim(),
          age: age ? Number(age) : null,
          grade_level: gradeLevel ? Number(gradeLevel) : null,
          guide_id: guideId,
        })
        .select('id')
        .single()
      if (learnerError) throw learnerError

      // v1 only supports build_fraction problems in the UI; selectProblems filters to those.
      // Once other problem_types have UI, pass preferSupported: false to get the full mix.
      const selected = selectProblems({ targetCount: 8, preferSupported: true })
      const responses = selected.map((p) => ({
        problem_id: p.id,
        telemetry: [],
        committed_success: false,
        final_placed_denominators: [],
      }))

      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          learner_id: learner.id,
          concept: 'fractions',
          type: 'full',
          responses,
        })
        .select('id')
        .single()
      if (assessmentError) throw assessmentError

      router.push(`/assess/${assessment.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong creating the learner.'
      setError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex flex-1 w-full max-w-xl mx-auto flex-col gap-8 py-24 px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Set up a learner</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create the learner, then a fractions assessment starts automatically.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 text-sm bg-white dark:bg-zinc-950"
            placeholder="First name"
          />
        </label>

        <div className="flex gap-4">
          <label className="flex flex-col gap-1.5 flex-1">
            <span className="text-sm font-medium">Age</span>
            <input
              type="number"
              min={5}
              max={18}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 text-sm bg-white dark:bg-zinc-950"
            />
          </label>
          <label className="flex flex-col gap-1.5 flex-1">
            <span className="text-sm font-medium">Grade level</span>
            <input
              type="number"
              min={1}
              max={12}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 dark:border-zinc-700 px-3 text-sm bg-white dark:bg-zinc-950"
            />
          </label>
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Concept: <strong>Fractions</strong> (3rd–4th grade)
        </div>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 w-fit"
        >
          {isSubmitting ? 'Starting assessment…' : 'Start assessment'}
        </button>
      </form>
    </main>
  )
}
