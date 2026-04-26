'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  submissionId: string
  adminKey: string
  currentStatus: string
  existingNotes: string
}

export default function ReviewActions({ submissionId, adminKey, currentStatus, existingNotes }: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState(existingNotes)
  const [pending, setPending] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  const isFinalized = currentStatus === 'human_approved' || currentStatus === 'human_rejected'

  async function review(action: 'approve' | 'reject') {
    if (pending) return
    setPending(action)
    setError(null)
    setDoneMessage(null)
    try {
      const res = await fetch('/api/admin/review-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          action,
          notes,
          admin_key: adminKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? `Failed (${res.status})`)
        setPending(null)
        return
      }
      setDoneMessage(action === 'approve' ? 'Approved.' : 'Rejected.')
      setPending(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed.')
      setPending(null)
    }
  }

  if (isFinalized) {
    return (
      <div
        className="rounded-sm border-2 border-brass-deep/40 bg-paper-deep/40 p-5 text-sm text-ink-soft"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        Final status: <strong className="text-ink">{currentStatus.replace('human_', '')}</strong>
        {existingNotes && (
          <div className="mt-2 italic">Notes: {existingNotes}</div>
        )}
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-3 rounded-sm border-2 border-brass-deep bg-[oklch(0.98_0.012_78)] p-5">
      <p
        className="text-xs tracking-[0.25em] uppercase text-brass-deep"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        Human review
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Optional notes: reason for approval/rejection, edits requested, etc."
        className="rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 py-2 text-sm focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 resize-y"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      />
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => review('approve')}
          disabled={pending !== null}
          className="inline-flex h-10 items-center justify-center rounded-sm bg-emerald-700 px-6 text-xs font-bold uppercase text-cream hover:bg-emerald-600 disabled:opacity-50 transition-colors border border-emerald-600 shadow-[0_0_12px_oklch(0.55_0.15_150/0.4)]"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          {pending === 'approve' ? 'Approving…' : 'Approve ◇'}
        </button>
        <button
          type="button"
          onClick={() => review('reject')}
          disabled={pending !== null}
          className="inline-flex h-10 items-center justify-center rounded-sm border-2 border-red-700 px-6 text-xs font-bold uppercase text-red-800 hover:bg-red-50 disabled:opacity-50 transition-colors"
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
        >
          {pending === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-700 italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {error}
        </p>
      )}
      {doneMessage && (
        <p className="text-sm text-emerald-700 italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
          {doneMessage}
        </p>
      )}
    </section>
  )
}
