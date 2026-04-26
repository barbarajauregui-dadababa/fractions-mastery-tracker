import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'

const coherenceMap = coherenceMapRaw as unknown as { nodes: { id: string; name: string }[] }
function standardName(id: string): string {
  return coherenceMap.nodes.find((n) => n.id === id)?.name ?? id
}

interface Row {
  id: string
  created_at: string
  title: string
  modality: string
  status: string
  ai_vet_verdict: string | null
  ai_vet_reasoning: string | null
  contributor_name: string
  contributor_email: string
  standard_ids: string[]
}

interface PageProps {
  searchParams: Promise<{ key?: string; status?: string }>
}

export default async function AdminQueuePage({ searchParams }: PageProps) {
  const { key, status } = await searchParams
  const adminSecret = process.env.ADMIN_REVIEW_SECRET

  if (!adminSecret) {
    return (
      <main className="bg-paper min-h-screen p-10">
        <div className="max-w-xl mx-auto rounded-sm border-2 border-red-700 bg-paper-deep p-6 text-ink">
          <h1
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Admin secret not configured
          </h1>
          <p className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Set <code>ADMIN_REVIEW_SECRET</code> in the environment.
          </p>
        </div>
      </main>
    )
  }
  if (key !== adminSecret) {
    return (
      <main className="bg-paper min-h-screen p-10">
        <div className="max-w-xl mx-auto rounded-sm border-2 border-red-700 bg-paper-deep p-6 text-ink">
          <h1
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Not authorized
          </h1>
          <p className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            This admin queue requires <code>?key=...</code> in the URL.
          </p>
        </div>
      </main>
    )
  }

  const supabase = await createClient()
  let q = supabase
    .from('activity_submissions')
    .select(
      'id, created_at, title, modality, status, ai_vet_verdict, ai_vet_reasoning, contributor_name, contributor_email, standard_ids',
    )
    .order('created_at', { ascending: false })
    .limit(200)

  if (status && typeof status === 'string') {
    q = q.eq('status', status)
  }

  const { data, error } = await q
  const rows: Row[] = !error && Array.isArray(data) ? (data as Row[]) : []

  // Bucket counts for the filter chips
  const counts = await Promise.all([
    countByStatus(supabase, null),
    countByStatus(supabase, 'pending_ai_vet'),
    countByStatus(supabase, 'ai_passed'),
    countByStatus(supabase, 'ai_borderline'),
    countByStatus(supabase, 'ai_rejected'),
    countByStatus(supabase, 'human_approved'),
    countByStatus(supabase, 'human_rejected'),
  ])
  const [allCount, pendingCount, passCount, borderlineCount, rejectCount, approvedCount, humanRejectedCount] =
    counts

  const filters: { value: string | null; label: string; count: number }[] = [
    { value: null, label: 'All', count: allCount },
    { value: 'pending_ai_vet', label: 'Pending AI', count: pendingCount },
    { value: 'ai_passed', label: 'AI pass', count: passCount },
    { value: 'ai_borderline', label: 'AI borderline', count: borderlineCount },
    { value: 'ai_rejected', label: 'AI reject', count: rejectCount },
    { value: 'human_approved', label: 'Approved', count: approvedCount },
    { value: 'human_rejected', label: 'Rejected', count: humanRejectedCount },
  ]

  return (
    <main className="bg-paper min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-ink-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Admin · activity-submission queue
          </p>
          <h1
            className="text-2xl text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Submissions ({allCount})
          </h1>
        </header>

        {/* Filter chips */}
        <nav className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = (status ?? null) === (f.value ?? null)
            const href = f.value
              ? `/admin/submissions?key=${encodeURIComponent(key)}&status=${f.value}`
              : `/admin/submissions?key=${encodeURIComponent(key)}`
            return (
              <Link
                key={f.label}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-sm border-2 px-3 py-1 text-[10px] tracking-[0.18em] uppercase ${
                  active
                    ? 'border-brass-deep bg-brass/20 text-ink'
                    : 'border-brass-deep/40 bg-paper text-ink-soft hover:border-brass-deep'
                }`}
                style={{ fontFamily: 'var(--font-cinzel)' }}
              >
                {f.label} <span className="text-ink-faint">({f.count})</span>
              </Link>
            )
          })}
        </nav>

        {error && (
          <div
            className="rounded-sm border-2 border-red-700 bg-paper-deep p-4 text-sm text-red-700"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {error.message}
          </div>
        )}

        {rows.length === 0 ? (
          <div
            className="rounded-sm border border-brass-deep/40 bg-paper-deep/40 p-6 text-sm text-ink-soft italic"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            No submissions in this view yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-sm border-2 border-brass-deep/40 bg-[oklch(0.98_0.012_78)] p-4"
              >
                <div className="flex items-baseline gap-3 flex-wrap">
                  <StatusPill status={r.status} />
                  <Link
                    href={`/admin/submissions/${r.id}?key=${encodeURIComponent(key)}`}
                    className="text-base text-ink hover:text-brass-deep transition-colors"
                    style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                  >
                    {r.title}
                  </Link>
                  <span
                    className="text-[10px] tracking-[0.18em] uppercase text-brass-deep ml-auto"
                    style={{ fontFamily: 'var(--font-cinzel)' }}
                  >
                    {r.modality}
                  </span>
                </div>
                <div
                  className="mt-1 text-xs text-ink-faint"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  by <span className="text-ink-soft not-italic">{r.contributor_name}</span> &lt;{r.contributor_email}&gt; · {new Date(r.created_at).toLocaleString()}
                </div>
                <div
                  className="mt-1 text-xs text-ink-soft italic"
                  style={{ fontFamily: 'var(--font-fraunces)' }}
                >
                  {r.standard_ids
                    .slice(0, 3)
                    .map((sid) => `${standardName(sid)} (${sid})`)
                    .join(' · ')}
                  {r.standard_ids.length > 3 && ` +${r.standard_ids.length - 3} more`}
                </div>
                <Link
                  href={`/admin/submissions/${r.id}?key=${encodeURIComponent(key)}`}
                  className="mt-2 inline-flex h-8 items-center justify-center rounded-sm border-2 border-brass-deep px-3 text-[10px] font-bold uppercase text-ink hover:bg-brass-deep/15 transition-colors"
                  style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
                >
                  Review →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}

async function countByStatus(supabase: Awaited<ReturnType<typeof createClient>>, status: string | null): Promise<number> {
  let q = supabase.from('activity_submissions').select('id', { count: 'exact', head: true })
  if (status) q = q.eq('status', status)
  const { count } = await q
  return count ?? 0
}

function StatusPill({ status }: { status: string }) {
  const { label, cls } = pillFor(status)
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.18em] uppercase ${cls}`}
      style={{ fontFamily: 'var(--font-cinzel)' }}
    >
      {label}
    </span>
  )
}

function pillFor(status: string): { label: string; cls: string } {
  switch (status) {
    case 'pending_ai_vet':
      return { label: 'Pending AI', cls: 'border-stone-400 bg-stone-50 text-ink-soft' }
    case 'ai_passed':
      return { label: 'AI pass', cls: 'border-emerald-700/60 bg-emerald-50 text-emerald-800' }
    case 'ai_borderline':
      return { label: 'AI borderline', cls: 'border-brass-deep bg-brass/15 text-brass-deep' }
    case 'ai_rejected':
      return { label: 'AI reject', cls: 'border-red-700/60 bg-red-50 text-red-800' }
    case 'human_approved':
      return { label: 'Approved', cls: 'border-emerald-700 bg-emerald-100 text-emerald-900' }
    case 'human_rejected':
      return { label: 'Rejected', cls: 'border-red-700 bg-red-100 text-red-900' }
    default:
      return { label: status, cls: 'border-stone-400 bg-stone-50 text-ink-soft' }
  }
}
