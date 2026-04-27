import Image from 'next/image'
import Link from 'next/link'
import ResumeForm from './ResumeForm'
import { CornerFlourish, OrnamentalRule } from '@/app/Ornament'

export const metadata = {
  title: 'Resume your voyage · Strata Mundo',
  description:
    'Return to a math mastery voyage by entering the email used at setup. We email you a link.',
}

export default function ResumePage() {
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

      <div className="relative max-w-xl mx-auto px-6 py-16 flex flex-col gap-8">
        <header className="flex flex-col gap-3 items-center text-center">
          <p
            className="text-base sm:text-lg tracking-[0.3em] uppercase text-brass-deep font-bold"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◇ Return to your voyage ◇
          </p>
          <h1
            className="text-3xl sm:text-4xl tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            Resume an existing voyage
          </h1>
          <OrnamentalRule className="h-5 text-brass-deep mt-1" width={300} />
          <ul
            className="text-base text-ink-soft italic max-w-md text-left list-disc pl-5 space-y-1.5"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <li>Enter the email used when the voyage was set up.</li>
            <li>We&apos;ll email a link directly to the learner&apos;s voyage page.</li>
            <li>If multiple voyages share that email (e.g., siblings), the email lists them all.</li>
          </ul>
        </header>

        <section className="relative rounded-sm border-2 border-brass-deep/60 bg-[oklch(0.98_0.012_78)] p-6 sm:p-8 shadow-[0_0_25px_oklch(0.74_0.14_80/0.18)]">
          <CornerFlourish corner="tl" className="absolute top-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="tr" className="absolute top-2 right-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="bl" className="absolute bottom-2 left-2 h-5 w-5 text-brass-deep" />
          <CornerFlourish corner="br" className="absolute bottom-2 right-2 h-5 w-5 text-brass-deep" />
          <ResumeForm />
        </section>

        <div className="flex flex-col items-center gap-3">
          <p
            className="text-sm text-ink-soft italic text-center"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Don&apos;t have a voyage yet?
          </p>
          <Link
            href="/setup"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-brass-deep px-7 text-sm font-bold uppercase text-cream hover:bg-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-glow border border-brass shadow-[0_0_20px_oklch(0.74_0.14_80/0.4)]"
            style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
          >
            Begin the voyage
          </Link>
        </div>
      </div>
    </main>
  )
}
