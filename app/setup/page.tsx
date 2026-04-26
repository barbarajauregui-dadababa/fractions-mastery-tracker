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
    <main className="bg-background min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-16 flex flex-col gap-8">
        <header className="flex flex-col gap-2 items-center text-center">
          <p
            className="text-[10px] tracking-[0.4em] uppercase text-brass"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Begin a voyage
          </p>
          <h1
            className="text-3xl sm:text-4xl tracking-tight text-cream"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            New Learner Profile
          </h1>
          <p
            className="text-sm italic text-cream-soft max-w-md"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Set up the profile — for a learner you guide, or for yourself if you&apos;re an older learner. The fractions assessment starts automatically.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-sm border-2 border-brass-deep bg-paper p-6 shadow-[0_0_20px_oklch(0.74_0.14_80/0.25)]"
        >
          <label className="flex flex-col gap-1.5">
            <span
              className="text-[10px] tracking-[0.2em] uppercase text-brass-deep"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Name
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint"
              style={{ fontFamily: 'var(--font-fraunces)' }}
              placeholder="First name"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex flex-col gap-1.5 flex-1">
              <span
                className="text-[10px] tracking-[0.2em] uppercase text-brass-deep"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                Age
              </span>
              <input
                type="number"
                min={5}
                max={18}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-10 rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              />
            </label>
            <label className="flex flex-col gap-1.5 flex-1">
              <span
                className="text-[10px] tracking-[0.2em] uppercase text-brass-deep"
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                Grade level
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="h-10 rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              />
            </label>
          </div>

          <div
            className="text-sm text-ink-soft italic"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Concept: <strong className="text-ink not-italic">Fractions</strong> (3rd–4th grade)
          </div>

          {error && (
            <div
              className="rounded-sm border-2 border-red-600/40 bg-paper-deep px-3 py-2 text-sm text-red-700"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="inline-flex h-11 items-center justify-center rounded-sm bg-brass-deep px-6 text-sm font-bold uppercase text-cream hover:bg-brass disabled:opacity-50 transition-colors w-fit border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
          >
            {isSubmitting ? 'Beginning the voyage…' : 'Begin the voyage'}
          </button>
        </form>
      </div>
    </main>
  )
}
