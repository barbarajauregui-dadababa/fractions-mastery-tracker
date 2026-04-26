'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { selectFocusedProbeProblems } from '@/lib/problem-selection'

interface Props {
  learnerId: string
  standardId: string
  standardName: string
  parentAssessmentId: string
}

export default function FocusedProbeButton({
  learnerId,
  standardId,
  standardName,
  parentAssessmentId,
}: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (isStarting) return
    setIsStarting(true)
    setError(null)

    try {
      const selected = selectFocusedProbeProblems(standardId, { maxCount: 6 })
      if (selected.length === 0) {
        setError(`No problems available for ${standardName} yet.`)
        setIsStarting(false)
        return
      }

      const responses = selected.map((p) => ({
        problem_id: p.id,
        telemetry: [],
        committed_success: false,
        final_placed_denominators: [],
      }))

      const { data: assessment, error: insertError } = await supabase
        .from('assessments')
        .insert({
          learner_id: learnerId,
          concept: 'fractions',
          type: 'focused_probe',
          responses,
        })
        .select('id')
        .single()
      if (insertError) throw insertError

      router.push(`/assess/${assessment.id}?parent=${parentAssessmentId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not start focused probe.'
      setError(message)
      setIsStarting(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isStarting}
        className="inline-flex h-8 items-center justify-center rounded-sm border-2 border-brass-deep px-3.5 text-[10px] font-bold uppercase text-ink hover:bg-brass-deep/15 disabled:opacity-50 transition-colors w-fit"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
      >
        {isStarting ? 'Starting probe…' : 'Run focused probe'}
      </button>
      {error && (
        <span className="text-xs text-red-700 italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {error}
        </span>
      )}
    </div>
  )
}
