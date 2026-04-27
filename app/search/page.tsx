import Image from 'next/image'
import Link from 'next/link'
import SearchInput from './SearchInput'
import { CornerFlourish, OrnamentalRule } from '@/app/Ornament'
import { createClient } from '@/lib/supabase/server'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'
import resourcesRaw from '@/content/fractions-resources.json'

export const metadata = {
  title: 'Search · Strata Mundo',
  description: 'Search activities, math standards, and contributors across Strata Mundo.',
}

interface CoherenceNode {
  id: string
  name: string
  statement: string
  grade: number
  domain: string
}
const coherenceMap = coherenceMapRaw as unknown as { nodes: CoherenceNode[] }

interface CuratedResource {
  id: string
  title: string
  modality: string
  source_site?: string
  url?: string | null
  duration_minutes?: number
  notes?: string
}
const curatedResources = resourcesRaw as unknown as { resources: CuratedResource[] }

interface CommunitySubmission {
  id: string
  title: string
  description: string
  modality: string
  url: string | null
  source_site: string | null
  duration_minutes: number | null
  standard_ids: string[]
  contributor_name: string
}

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: rawQ } = await searchParams
  const q = (rawQ ?? '').trim()
  const lower = q.toLowerCase()

  // Fetch approved community submissions (these are the only public ones).
  let community: CommunitySubmission[] = []
  if (q.length > 0) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('activity_submissions')
      .select(
        'id, title, description, modality, url, source_site, duration_minutes, standard_ids, contributor_name',
      )
      .eq('status', 'human_approved')
      .limit(200)
    if (Array.isArray(data)) {
      community = data as CommunitySubmission[]
    }
  }

  // Filter standards
  const standards = q
    ? coherenceMap.nodes.filter((s) => {
        return (
          s.id.toLowerCase().includes(lower) ||
          s.name.toLowerCase().includes(lower) ||
          s.statement.toLowerCase().includes(lower) ||
          s.domain.toLowerCase().includes(lower)
        )
      })
    : []

  // Filter curated activities
  const curated = q
    ? curatedResources.resources.filter((r) => {
        return (
          r.title.toLowerCase().includes(lower) ||
          (r.modality ?? '').toLowerCase().includes(lower) ||
          (r.source_site ?? '').toLowerCase().includes(lower) ||
          (r.notes ?? '').toLowerCase().includes(lower)
        )
      })
    : []

  // Filter community submissions
  const communityMatches = q
    ? community.filter((c) => {
        return (
          c.title.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower) ||
          (c.modality ?? '').toLowerCase().includes(lower) ||
          (c.source_site ?? '').toLowerCase().includes(lower) ||
          (c.standard_ids ?? []).some((sid) => sid.toLowerCase().includes(lower))
        )
      })
    : []

  // Contributors — distinct names from approved submissions whose name matches.
  const contributorMap = new Map<string, number>()
  if (q.length > 0) {
    for (const c of community) {
      if (c.contributor_name.toLowerCase().includes(lower)) {
        contributorMap.set(c.contributor_name, (contributorMap.get(c.contributor_name) ?? 0) + 1)
      }
    }
  }
  const contributors = [...contributorMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  const totalResults =
    standards.length + curated.length + communityMatches.length + contributors.length

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: 'oklch(0.88 0.025 70)' }}>
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Image
          src="/images/cloudscape-denis.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
          style={{ filter: 'sepia(0.4) brightness(1.05) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.88 0.025 70 / 0.25) 0%, oklch(0.86 0.028 68 / 0.40) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 items-center text-center">
          <p
            className="text-sm tracking-[0.4em] uppercase text-brass-deep"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◇ Search the library ◇
          </p>
          <h1
            className="text-3xl sm:text-4xl tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Find activities, progressions, standards, and contributors
          </h1>
          <OrnamentalRule className="h-5 text-brass-deep mt-1" width={300} />
        </header>

        <section className="relative rounded-sm border-2 border-brass-deep/60 bg-[oklch(0.98_0.012_78)] p-6 shadow-[0_0_25px_oklch(0.74_0.14_80/0.18)]">
          <CornerFlourish corner="tl" className="absolute top-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="tr" className="absolute top-2 right-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="bl" className="absolute bottom-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="br" className="absolute bottom-2 right-2 h-5 w-5 text-brass-deep" />
          <SearchInput initialQuery={q} />
        </section>

        {q.length === 0 ? (
          <section
            className="rounded-sm border border-brass-deep/40 bg-paper-deep/40 px-5 py-4 text-sm text-ink-soft"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <p
              className="text-sm tracking-[0.25em] uppercase text-brass-deep mb-2"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              What you can search
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Math standards or progressions by CCSS-M code (e.g., <span style={{ fontFamily: 'var(--font-special-elite)' }}>3.NF.A.1</span>) or by name (e.g., <em>unit fractions</em>, <em>fractions progression</em>).</li>
              <li>Activities by title, source site, or modality (e.g., <em>video</em>, <em>hands-on</em>).</li>
              <li>Community contributors by name.</li>
            </ul>
          </section>
        ) : totalResults === 0 ? (
          <section
            className="rounded-sm border border-brass-deep/40 bg-[oklch(0.98_0.012_78)] px-5 py-4 text-sm text-ink-soft italic"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            No matches for <strong className="text-ink not-italic">&ldquo;{q}&rdquo;</strong>. Try a different term, a CCSS-M code (like <span style={{ fontFamily: 'var(--font-special-elite)' }}>3.NF.A.1</span>), or a modality (like <em>video</em>).
          </section>
        ) : (
          <>
            <p
              className="text-xs text-ink-faint italic"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              {totalResults} {totalResults === 1 ? 'match' : 'matches'} for &ldquo;{q}&rdquo;.
            </p>

            {standards.length > 0 && (
              <ResultsSection title={`Progressions, standards & concepts (${standards.length})`}>
                <ul className="flex flex-col gap-2">
                  {standards.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-sm border border-brass-deep/30 bg-[oklch(0.98_0.012_78)] px-4 py-3"
                    >
                      <Link
                        href={`/contribute?standard=${encodeURIComponent(s.id)}`}
                        className="block group"
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span
                            className="text-xs text-brass-deep"
                            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.1em' }}
                          >
                            {s.id}
                          </span>
                          <span
                            className="text-base text-ink group-hover:text-brass-deep transition-colors"
                            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                          >
                            {s.name}
                          </span>
                          <span
                            className="text-xs text-ink-faint italic ml-auto"
                            style={{ fontFamily: 'var(--font-fraunces)' }}
                          >
                            Grade {s.grade} · {s.domain}
                          </span>
                        </div>
                        <p
                          className="mt-1 text-sm text-ink-soft leading-snug"
                          style={{ fontFamily: 'var(--font-fraunces)' }}
                        >
                          {s.statement}
                        </p>
                        <p
                          className="mt-1.5 text-sm tracking-[0.18em] uppercase text-copper group-hover:text-brass-deep"
                          style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          + Suggest an activity for this standard →
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </ResultsSection>
            )}

            {(curated.length > 0 || communityMatches.length > 0) && (
              <ResultsSection
                title={`Activities (${curated.length + communityMatches.length})`}
              >
                <ul className="flex flex-col gap-2">
                  {curated.map((r) => (
                    <li
                      key={`curated-${r.id}`}
                      className="rounded-sm border border-brass-deep/30 bg-[oklch(0.98_0.012_78)] px-4 py-3"
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className="text-sm tracking-[0.18em] uppercase text-brass-deep"
                          style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          Activity · {r.modality} · curated
                        </span>
                      </div>
                      <p
                        className="text-base text-ink"
                        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                      >
                        {r.title}
                      </p>
                      <p
                        className="text-xs text-ink-faint italic"
                        style={{ fontFamily: 'var(--font-fraunces)' }}
                      >
                        {[r.source_site, r.duration_minutes ? `~${r.duration_minutes} min` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      {isLiveUrl(r.url) && (
                        <a
                          href={r.url!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-copper hover:text-brass-deep underline underline-offset-2"
                          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.08em' }}
                        >
                          Open →
                        </a>
                      )}
                    </li>
                  ))}
                  {communityMatches.map((c) => (
                    <li
                      key={`community-${c.id}`}
                      className="rounded-sm border border-brass-deep/30 bg-[oklch(0.98_0.012_78)] px-4 py-3"
                    >
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className="text-sm tracking-[0.18em] uppercase text-brass-deep"
                          style={{ fontFamily: 'var(--font-cinzel)' }}
                        >
                          Activity · {c.modality} · community
                        </span>
                        <span
                          className="text-xs text-ink-faint italic ml-auto"
                          style={{ fontFamily: 'var(--font-fraunces)' }}
                        >
                          contributed by {c.contributor_name}
                        </span>
                      </div>
                      <p
                        className="text-base text-ink"
                        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                      >
                        {c.title}
                      </p>
                      <p
                        className="mt-1 text-sm text-ink-soft"
                        style={{ fontFamily: 'var(--font-fraunces)' }}
                      >
                        {c.description}
                      </p>
                      <p
                        className="mt-1 text-xs text-ink-faint italic"
                        style={{ fontFamily: 'var(--font-fraunces)' }}
                      >
                        Standards: {c.standard_ids.join(', ')}
                        {c.duration_minutes ? ` · ~${c.duration_minutes} min` : ''}
                      </p>
                      {isLiveUrl(c.url) && (
                        <a
                          href={c.url!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-copper hover:text-brass-deep underline underline-offset-2"
                          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.08em' }}
                        >
                          Open →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </ResultsSection>
            )}

            {contributors.length > 0 && (
              <ResultsSection title={`Contributors (${contributors.length})`}>
                <ul className="flex flex-col gap-2">
                  {contributors.map((c) => (
                    <li
                      key={c.name}
                      className="rounded-sm border border-brass-deep/30 bg-[oklch(0.98_0.012_78)] px-4 py-3 flex items-baseline justify-between gap-3"
                    >
                      <span
                        className="text-base text-ink"
                        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="text-xs text-ink-faint italic"
                        style={{ fontFamily: 'var(--font-fraunces)' }}
                      >
                        {c.count} approved {c.count === 1 ? 'contribution' : 'contributions'}
                      </span>
                    </li>
                  ))}
                </ul>
              </ResultsSection>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function isLiveUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /^https?:\/\//i.test(url.trim())
}

function ResultsSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2
        className="text-sm tracking-[0.25em] uppercase text-brass-deep"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        ◇ {title} ◇
      </h2>
      {children}
    </section>
  )
}
