'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import ModalityGlyph, { modalityLabel } from './ModalityGlyph'

export interface CompletedActivity {
  resource_id: string
  done_at: string
}

interface Resource {
  id: string
  title: string
  modality: string
  source_site?: string
  url?: string | null
  duration_minutes?: number
}

interface Props {
  planId: string
  order: number
  resourceId: string
  rationale: string
  resource: Resource | undefined
  completedAt: string | null
  allCompleted: CompletedActivity[]
}

export default function ActivityTile({
  planId,
  resourceId,
  rationale,
  resource,
  completedAt: initialCompletedAt,
  allCompleted,
}: Props) {
  const supabase = createClient()
  const [completedAt, setCompletedAt] = useState<string | null>(initialCompletedAt)
  const [isPending, startTransition] = useTransition()
  const [showWhy, setShowWhy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDone() {
    setError(null)
    const wasCompleted = completedAt !== null
    const now = new Date().toISOString()
    setCompletedAt(wasCompleted ? null : now)

    startTransition(async () => {
      const { data: row, error: readErr } = await supabase
        .from('plans')
        .select('plan_content')
        .eq('id', planId)
        .single()
      if (readErr || !row) {
        setCompletedAt(wasCompleted ? initialCompletedAt : null)
        setError('Could not save — please retry.')
        return
      }
      const content = row.plan_content as { _completed_activities?: CompletedActivity[] }
      const current = content._completed_activities ?? allCompleted
      const next = wasCompleted
        ? current.filter((c) => c.resource_id !== resourceId)
        : [...current.filter((c) => c.resource_id !== resourceId), { resource_id: resourceId, done_at: now }]

      const { error: writeErr } = await supabase
        .from('plans')
        .update({ plan_content: { ...content, _completed_activities: next } })
        .eq('id', planId)
      if (writeErr) {
        setCompletedAt(wasCompleted ? initialCompletedAt : null)
        setError('Could not save — please retry.')
      }
    })
  }

  const isDone = completedAt !== null
  const title = resource?.title ?? resourceId
  const modality = resource?.modality ?? ''
  const minutes = resource?.duration_minutes

  return (
    <li
      className={`group relative rounded-sm border-2 transition-colors ${
        isDone
          ? 'bg-paper-deep/40 border-emerald-700/40 opacity-80'
          : 'bg-paper border-brass-deep/30 hover:border-brass-deep/60'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        {/* Modality glyph in a brass-bordered card */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border ${
            isDone
              ? 'bg-paper border-stone-300 text-ink-faint'
              : 'bg-paper-deep border-brass-deep/40 text-brass-deep'
          }`}
        >
          <ModalityGlyph modality={modality} className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Activity ribbon — Cinzel small caps */}
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] tracking-[0.2em] uppercase text-brass-deep"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Activity {modality ? `· ${modalityLabel(modality).toUpperCase()}` : ''}
            </span>
          </div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-base leading-snug ${
                isDone
                  ? 'line-through text-ink-faint'
                  : 'text-ink'
              }`}
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              {title}
            </span>
          </div>
          <div
            className="flex items-center gap-2 text-xs text-ink-faint"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            {typeof minutes === 'number' && <span>~{minutes} min</span>}
            {resource?.source_site && !resource?.url && (
              <>
                {typeof minutes === 'number' && <span aria-hidden>·</span>}
                <span>{resource.source_site}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {resource?.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-copper hover:text-brass-deep underline underline-offset-2"
              style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.08em' }}
            >
              Open
            </a>
          )}
          <button
            type="button"
            onClick={toggleDone}
            disabled={isPending}
            aria-pressed={isDone}
            aria-label={isDone ? 'Mark not done' : 'Mark done'}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-sm border-2 transition-colors disabled:opacity-50 ${
              isDone
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-paper border-brass-deep/50 hover:border-brass-deep'
            }`}
          >
            {isDone && (
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="3" aria-hidden>
                <path d="M5 12.5l4.5 4.5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 pl-[calc(1rem+12px+12px+1rem-9px)]">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="text-[11px] tracking-[0.15em] uppercase text-ink-faint hover:text-brass-deep inline-flex items-center gap-1"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className={`h-3 w-3 transition-transform ${showWhy ? 'rotate-90' : ''}`}
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {showWhy ? 'Hide rationale' : 'Why this activity?'}
        </button>
        {showWhy && (
          <div
            className="mt-2 text-sm text-ink-soft leading-relaxed max-w-prose italic"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <BulletedSentences text={rationale} />
          </div>
        )}
        {isDone && completedAt && (
          <div
            className="mt-1 text-xs text-emerald-700 italic"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            Completed {new Date(completedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        )}
        {error && (
          <p
            className="mt-1 text-xs text-red-700"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {error}
          </p>
        )}
      </div>
    </li>
  )
}

function BulletedSentences({ text }: { text: string }) {
  const trimmed = text.trim()
  if (!trimmed) return null
  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (sentences.length <= 1) {
    return <p className="leading-relaxed">{trimmed}</p>
  }
  return (
    <ul className="list-disc ml-5 space-y-1.5 leading-relaxed">
      {sentences.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ul>
  )
}
