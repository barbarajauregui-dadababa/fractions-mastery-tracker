import Image from 'next/image'
import Link from 'next/link'
import ContributeForm from './ContributeForm'
import { CornerFlourish, OrnamentalRule } from '@/app/Ornament'

export const metadata = {
  title: 'Contribute an activity · Strata Mundo',
  description:
    'Propose a learning activity for any 3rd–4th grade fractions standard. Anyone can contribute. AI-vetted, human-approved.',
}

interface SearchParamsShape {
  searchParams: Promise<{ standard?: string }>
}

export default async function ContributePage({ searchParams }: SearchParamsShape) {
  const sp = await searchParams
  const initialStandardId = typeof sp.standard === 'string' ? sp.standard : undefined

  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: 'oklch(0.88 0.025 70)' }}>
      {/* Atmospheric backdrop — matches the report aesthetic */}
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

      <div className="relative max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3 items-center text-center">
          <p
            className="text-base sm:text-lg tracking-[0.3em] uppercase text-brass-deep font-bold"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◇ The library grows ◇
          </p>
          <h1
            className="text-3xl sm:text-4xl tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Contribute a new learning activity
          </h1>
          <OrnamentalRule className="h-5 text-brass-deep mt-1" width={300} />
          <ul
            className="text-base text-ink-soft italic max-w-xl space-y-1.5 text-left list-disc pl-5"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <li>Anyone can contribute — guides, teachers, parents, learners, and other users.</li>
            <li>Strata Mundo&apos;s library grows from what works in real practice, not what&apos;s easy to publish.</li>
            <li>Every submission is AI-vetted, then human-approved.</li>
          </ul>
        </header>

        <section className="relative rounded-sm border-2 border-brass-deep/60 bg-[oklch(0.98_0.012_78)] p-6 sm:p-8 shadow-[0_0_25px_oklch(0.74_0.14_80/0.18)]">
          <CornerFlourish corner="tl" className="absolute top-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="tr" className="absolute top-2 right-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="bl" className="absolute bottom-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="br" className="absolute bottom-2 right-2 h-5 w-5 text-brass-deep" />

          <ContributeForm initialStandardId={initialStandardId} />
        </section>

        <section
          className="rounded-sm border border-brass-deep/40 bg-paper-deep/40 px-5 py-4 flex flex-col gap-2 text-sm text-ink-soft"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          <p
            className="text-sm tracking-[0.25em] uppercase text-brass-deep"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            How submissions are reviewed
          </p>
          <p>
            Your submission is read by Claude Opus 4.7 against a documented set of pedagogical criteria, then forwarded to a human reviewer for final approval. The full criteria — both AI and human — are published on the{' '}
            <Link href="/methodology#vetting" className="text-copper hover:text-brass-deep underline underline-offset-2">
              Methodology page
            </Link>
            . You&apos;ll receive an email confirmation either way.
          </p>
        </section>
      </div>
    </main>
  )
}
