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
      className={`group rounded-xl border transition-colors ${
        isDone
          ? 'bg-stone-50 dark:bg-zinc-900/40 border-stone-200 dark:border-zinc-800 opacity-75'
          : 'bg-white dark:bg-zinc-950 border-stone-200 dark:border-zinc-800 hover:border-stone-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start gap-4 p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
            isDone
              ? 'bg-stone-100 dark:bg-zinc-900 text-stone-400 dark:text-zinc-600'
              : 'bg-stone-100 dark:bg-zinc-900 text-stone-700 dark:text-zinc-300'
          }`}
        >
          <ModalityGlyph modality={modality} className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={`text-sm font-medium leading-snug ${
                isDone ? 'line-through text-stone-500 dark:text-zinc-500' : 'text-stone-900 dark:text-zinc-100'
              }`}
            >
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
            {modality && <span>{modalityLabel(modality)}</span>}
            {typeof minutes === 'number' && (
              <>
                <span aria-hidden>·</span>
                <span>~{minutes} min</span>
              </>
            )}
            {resource?.source_site && !resource?.url && (
              <>
                <span aria-hidden>·</span>
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
              className="text-xs text-stone-600 dark:text-zinc-400 underline underline-offset-2 decoration-stone-300 hover:text-stone-900 dark:hover:text-zinc-100"
            >
              Open
            </a>
          )}
          <button
            type="button"
            onClick={toggleDone}
            disabled={isPending}
            aria-pressed={isDone}
            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors disabled:opacity-50 ${
              isDone
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-white dark:bg-zinc-950 border-stone-300 dark:border-zinc-700 hover:border-stone-400 dark:hover:border-zinc-500'
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

      <div className="px-4 pb-3 pl-[calc(1rem+11px+11px+1rem-9px)]">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="text-xs text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200 inline-flex items-center gap-1"
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
          <p className="mt-2 text-sm text-stone-700 dark:text-zinc-300 leading-relaxed max-w-prose">
            {rationale}
          </p>
        )}
        {isDone && completedAt && (
          <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
            Completed {new Date(completedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </li>
  )
}
