import Link from 'next/link'
import Image from 'next/image'
import {
  Gear,
  OrnamentalRule,
  RomanNumeral,
} from './Ornament'

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      {/* HERO — bold asymmetric: dark cloudscape backdrop, clockwork globe
          left, balloon ascending right, brand wordmark dominant. */}
      <section className="relative overflow-hidden border-b border-brass-deep/40">
        {/* Cloudscape painting backdrop, dimmed for legibility */}
        <div className="absolute inset-0 vignette">
          <Image
            src="/images/cloudscape-denis.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          {/* Warm dark wash to sink the painting into the page */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, oklch(0.13 0.014 50 / 0.55) 0%, oklch(0.16 0.018 55 / 0.65) 60%, oklch(0.13 0.014 50 / 0.85) 100%)',
            }}
          />
        </div>

        {/* Top-right gear cluster — large gear that used to sit behind the
            balloon was removed per Barbara. The two remaining gears mesh
            with each other. Both turn (animate-turn-slow / -reverse). */}
        <div className="absolute top-32 right-44 hidden sm:block text-brass-deep animate-turn-slow-reverse ember-glow pointer-events-none">
          <Gear className="h-20 w-20" teeth={10} />
        </div>
        <div className="absolute top-44 right-24 hidden sm:block text-copper animate-turn-slow pointer-events-none">
          <Gear className="h-12 w-12" teeth={8} />
        </div>

        {/* Bottom-left gear cluster — copper (red) gear meshed with the
            brass (yellow) gear, both turning. Their teeth visually
            interlock; the copper turns one way, brass the other. */}
        <div className="absolute bottom-8 left-8 hidden sm:block text-brass-deep animate-turn-slow-reverse ember-glow pointer-events-none">
          <Gear className="h-28 w-28" teeth={12} />
        </div>
        <div className="absolute bottom-28 left-28 hidden sm:block text-copper animate-turn-slow pointer-events-none">
          <Gear className="h-14 w-14" teeth={10} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 grid sm:grid-cols-[1fr_1.2fr] gap-8 sm:gap-12 items-center">
          {/* LEFT: clockwork celestial globe — the Emmoser piece (1579, Met Museum, CC0).
              The Pegasus base is the visual anchor, framed as a museum plate. */}
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto">
              <Image
                src="/images/clockwork-globe.jpg"
                alt="Celestial globe with clockwork — Gerhard Emmoser, 1579"
                fill
                priority
                sizes="(max-width: 640px) 80vw, 480px"
                className="object-contain drop-shadow-[0_8px_30px_oklch(0.74_0.14_80/0.4)]"
                style={{ filter: 'sepia(0.2) contrast(1.1) brightness(1.05)' }}
              />
              {/* Bronze frame ring */}
              <div className="absolute inset-0 rounded-full border-2 border-brass-deep/40 pointer-events-none" />
            </div>
            <p
              className="text-center text-xs tracking-[0.2em] uppercase text-cream-faint mt-4 italic"
              style={{ fontFamily: 'var(--font-special-elite)' }}
            >
              Celestial globe with clockwork — Emmoser, Vienna 1579
            </p>
          </div>

          {/* RIGHT: brand wordmark + tagline + balloon ascending */}
          <div className="relative flex flex-col gap-6 items-start text-left">
            <p
              className="text-sm tracking-[0.4em] uppercase text-brass"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Built with Claude Opus 4.7
            </p>

            <h1
              className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05]"
              style={{
                fontFamily: 'var(--font-cinzel)',
                letterSpacing: '0.04em',
                color: 'oklch(0.86 0.16 88)',
                textShadow:
                  '0 0 18px oklch(0.74 0.14 80 / 0.55), 0 2px 0 oklch(0.40 0.10 60 / 0.35)',
              }}
            >
              Strata
              <br />
              Mundo
            </h1>

            <p
              className="text-xl sm:text-2xl italic text-cream-soft"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Your math mastery voyage.
            </p>

            <OrnamentalRule className="h-6 text-brass-deep w-72" width={320} />

            <p
              className="text-base sm:text-lg text-cream-soft leading-relaxed max-w-xl"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              A diagnostic that reads <em>how</em> a learner reasons, a plan that prescribes the next steps in pedagogically sound order, and a probe loop that verifies mastery as the voyage unfolds.
            </p>

            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/setup"
                className="inline-flex h-12 items-center justify-center rounded-sm bg-brass-deep px-7 text-sm font-bold uppercase text-cream hover:bg-brass transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-glow focus-visible:ring-offset-2 focus-visible:ring-offset-background border border-brass shadow-[0_0_20px_oklch(0.74_0.14_80/0.4)]"
                style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
              >
                Begin the voyage
              </Link>
              <Link
                href="/resume"
                className="inline-flex h-12 items-center justify-center rounded-sm border-2 border-brass-deep bg-transparent px-7 text-sm font-bold uppercase text-cream hover:bg-brass-deep/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-glow focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
              >
                Continue your voyage
              </Link>
            </div>

            {/* Small balloon — aged-photograph asset, slightly tilted as if
                pinned at an angle, gently floating. The outer wrapper holds
                position; the middle wrapper handles the rotation; the inner
                wrapper handles the float animation. They compose cleanly
                because rotation and translate live on separate elements. */}
            <div className="absolute -top-12 -right-4 sm:-right-12 w-32 sm:w-44 pointer-events-none">
              <div style={{ rotate: '4deg' }}>
                <div
                  className="animate-balloon-float"
                  style={{
                    filter:
                      'drop-shadow(0 10px 22px oklch(0 0 0 / 0.45)) drop-shadow(0 2px 4px oklch(0 0 0 / 0.30))',
                  }}
                >
                  <Image
                    src="/images/balloon-old-photo.png"
                    alt="Aérostat of the Marquis de Brantes, 1784 — aged photograph"
                    width={1045}
                    height={1505}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE-QUESTION SECTIONS — Denis cloudscape backdrop on a soft tan
          ground, matching the report and contribute pages. Cards use solid
          near-white to read clearly against the painted sky. */}
      <section
        className="relative py-20 px-6 overflow-hidden"
        style={{ background: 'oklch(0.88 0.025 70)' }}
      >
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
        <div className="relative max-w-5xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2
              className="text-3xl sm:text-4xl tracking-tight text-ink max-w-3xl"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              Three questions Strata Mundo answers
            </h2>
            <OrnamentalRule className="h-5 text-brass-deep mt-2" width={320} />
          </div>

          <ThreeQuestions
            questions={[
              {
                kicker: 'Question I',
                title: 'Where is the learner really at in their math mastery?',
                bullets: [
                  'Reads telemetry — every drag, removal, commit, reset, and timing — not just the final answer',
                  'Produces a categorical mastery map per CCSS standard',
                  'Four states: Mastered · Building the skill · Misconception detected · Not yet probed',
                  'Names specific misconceptions with traceable evidence pointing to the problems where they fired',
                ],
              },
              {
                kicker: 'Question II',
                title: 'What should they work on next?',
                bullets: [
                  'A mastery atlas built from the published Common Core Coherence Map',
                  'Every standard, every prerequisite, in one view',
                  'Concept dependencies (which standards build on which) are visible at a glance',
                  'Plan Architect skips mastered standards and starts where work is needed',
                ],
              },
              {
                kicker: 'Question III',
                title: 'What tools will work for them?',
                bullets: [
                  'Tailored plan from a curated multimodal library',
                  'Concrete → representational → abstract per gap',
                  'On-screen + off-screen + hands-on per concept',
                  'Library grown by the community: AI-vetted, human-approved',
                ],
              },
            ]}
          />
        </div>
      </section>

      {/* FOOTER ATTRIBUTION — dark, signed */}
      <footer className="bg-background py-10 px-6 text-center border-t border-brass-deep/40">
        <OrnamentalRule className="h-4 text-brass-deep mx-auto mb-4" width={220} />
        <p
          className="text-xs text-cream-faint italic max-w-3xl mx-auto leading-relaxed"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Imagery: cloudscape by Simon Alexandre-Clément Denis (1786, Getty Museum, public domain). Celestial globe by Gerhard Emmoser (1579, Met Museum, CC0). Aerostat of the Marquis de Brantes, J. B. Guibert sculp. (1784, Bibliothèque nationale de France / Gallica, public domain).
        </p>
        <p
          className="text-xs text-cream-faint italic max-w-3xl mx-auto leading-relaxed mt-2"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Sections from Illustrative Mathematics K-5 (CC BY 4.0). Standards from CCSS-M and the Coherence Map. Progressions from Bill McCallum, hosted at mathematicalmusings.org. MIT licensed.
        </p>
      </footer>
    </main>
  )
}

/**
 * Three-questions component, mirrors the format used on the methodology
 * page: roman numeral + "Question N" kicker + serif title + bullet list,
 * brass-bordered card. Per Barbara — both pages should use the same format
 * (was: home used a problem/remedy DiagramPlate, methodology used this
 * cleaner kicker+bullets layout). Home now matches methodology.
 */
function ThreeQuestions({
  questions,
}: {
  questions: { kicker: string; title: string; bullets: string[] }[]
}) {
  return (
    <ol className="flex flex-col gap-5 mt-2">
      {questions.map((q, i) => (
        <li
          key={i}
          className="relative bg-[oklch(0.98_0.012_78)] border-2 border-brass-deep/50 rounded-sm p-5 sm:p-6 flex flex-col gap-2 shadow-[0_0_25px_oklch(0.74_0.14_80/0.18)]"
        >
          <div className="flex items-baseline gap-3">
            <RomanNumeral
              n={i + 1}
              className="text-3xl text-brass-deep leading-none"
            />
            <p
              className="text-sm tracking-[0.25em] uppercase text-ink-faint"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              {q.kicker}
            </p>
          </div>
          <h3
            className="text-lg sm:text-xl text-ink leading-snug"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            {q.title}
          </h3>
          <ul
            className="list-disc ml-5 space-y-1 text-sm sm:text-base text-ink-soft leading-relaxed"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            {q.bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}
