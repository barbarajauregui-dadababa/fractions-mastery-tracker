import Link from 'next/link'
import Image from 'next/image'
import {
  CornerFlourish,
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

        {/* Slow-turning gears — top-right cluster, ember-glow */}
        <div className="absolute top-6 right-6 sm:top-10 sm:right-16 text-brass animate-turn-slow ember-glow pointer-events-none">
          <Gear className="h-24 w-24 sm:h-36 sm:w-36" teeth={16} />
        </div>
        <div className="absolute top-32 right-44 hidden sm:block text-brass-deep animate-turn-slow-reverse ember-glow pointer-events-none">
          <Gear className="h-20 w-20" teeth={10} />
        </div>
        <div className="absolute top-44 right-24 hidden sm:block text-copper animate-turn-slow pointer-events-none">
          <Gear className="h-12 w-12" teeth={8} />
        </div>

        {/* Bottom-left gear cluster */}
        <div className="absolute bottom-8 left-8 hidden sm:block text-brass-deep animate-turn-slow-reverse ember-glow pointer-events-none">
          <Gear className="h-28 w-28" teeth={12} />
        </div>
        <div className="absolute bottom-32 left-32 hidden sm:block text-copper animate-turn-slow pointer-events-none">
          <Gear className="h-14 w-14" teeth={10} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 grid sm:grid-cols-[1fr_1.2fr] gap-8 sm:gap-12 items-center">
          {/* LEFT: clockwork globe, framed as a museum plate */}
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
              className="text-xs tracking-[0.4em] uppercase text-brass"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              Built with Opus 4.7
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
            </div>

            <p
              className="text-sm text-cream-soft italic mt-2"
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Already have a voyage?{' '}
              <Link
                href="/resume"
                className="text-brass hover:text-brass-glow underline underline-offset-2 not-italic"
              >
                Resume by email →
              </Link>
            </p>

            {/* Balloon — small, rising in the upper-right of this column */}
            <div className="absolute -top-12 -right-4 sm:-right-12 w-32 sm:w-44 animate-balloon-float pointer-events-none ember-glow">
              <Image
                src="/images/balloon-flying.jpg"
                alt="Aerostat of the Marquis de Brantes, 1784"
                width={270}
                height={447}
                className="w-full h-auto"
                style={{ filter: 'sepia(0.4) contrast(1.05) brightness(1.05)', mixBlendMode: 'screen' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* THREE-QUESTION SECTIONS — diagram plates on warm paper */}
      <section className="bg-paper py-20 px-6 relative">
        {/* Subtle paper texture via radial dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(oklch(0.18 0.018 55) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="relative max-w-5xl mx-auto flex flex-col gap-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <p
              className="text-xs tracking-[0.4em] uppercase text-brass-deep"
              style={{ fontFamily: 'var(--font-cinzel)' }}
            >
              ◇ The three questions ◇
            </p>
            <h2
              className="text-3xl sm:text-4xl tracking-tight text-ink max-w-3xl"
              style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
            >
              Three questions Strata Mundo answers
            </h2>
            <OrnamentalRule className="h-5 text-brass-deep mt-2" width={320} />
          </div>

          <DiagramPlate
            index={1}
            kicker="Where is the learner, really?"
            problemTitle="No tool reads how a learner reasons"
            problemBullets={[
              'Schools push a fixed curriculum, ignoring what each learner has mastered',
              'Khan-style probes measure performance, not understanding',
              'Without the full picture, tailored learning is guesswork',
            ]}
            solutionTitle="A telemetry-based diagnostic, with a probe loop"
            solutionBullets={[
              'Reads the full trajectory, not just the final answer',
              'Names specific misconceptions with traceable evidence',
              'Categorical states — never percentages',
              'Loop: assess → diagnose → plan → probe → declare',
            ]}
          />

          <DiagramPlate
            index={2}
            kicker="What should they work on next?"
            problemTitle="Knowing the gaps doesn’t tell you the order"
            problemBullets={[
              'Concept dependencies are real but invisible',
              'Boxed curricula assume linear order',
              'Guides re-cover mastered material or skip foundational gaps',
            ]}
            solutionTitle="A mastery atlas grounded in published progressions"
            solutionBullets={[
              'Every standard, every prerequisite, in one view',
              'Skip what is mastered; focus where it is needed',
              'Built on the Coherence Map and the IM Sections',
            ]}
          />

          <DiagramPlate
            index={3}
            kicker="What tools will actually work for them?"
            problemTitle="Hours hunting for the right activity"
            problemBullets={[
              'Boxed curricula offer one type of practice',
              'Hands-on, real-world activities are hard to find',
              'Math learned in isolation gets forgotten',
            ]}
            solutionTitle="A tailored plan from a curated, multimodal library"
            solutionBullets={[
              'Concrete → representational → abstract per gap',
              'On-screen + off-screen + hands-on per concept',
              'Library grown by the community: AI-vetted, human-approved',
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
 * "Diagram plate" — problem-and-remedy pair styled as a Victorian
 * scientific plate. Roman numeral chapter mark + drop-cap on each
 * solution, asymmetric layout — engraving margins on the brass remedy.
 */
function DiagramPlate({
  index,
  kicker,
  problemTitle,
  problemBullets,
  solutionTitle,
  solutionBullets,
}: {
  index: number
  kicker: string
  problemTitle: string
  problemBullets: string[]
  solutionTitle: string
  solutionBullets: string[]
}) {
  return (
    <article className="grid sm:grid-cols-[120px_1fr] gap-6 sm:gap-10">
      <div className="flex flex-col gap-1 sm:gap-2 items-center sm:items-end sm:text-right">
        <RomanNumeral
          n={index}
          className="text-7xl sm:text-8xl text-brass-deep leading-none"
        />
        <p
          className="text-xl sm:text-2xl text-brass-deep mt-1 italic leading-snug"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
        >
          {kicker}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <PanelCard
          ribbonLabel="The condition observed"
          ribbonClass="bg-paper-deep border-stone-400 text-ink-soft"
          title={problemTitle}
          bullets={problemBullets}
        />
        <PanelCard
          ribbonLabel="Strata Mundo · the remedy"
          ribbonClass="bg-brass/20 border-brass-deep text-brass-deep"
          title={solutionTitle}
          bullets={solutionBullets}
          accent
        />
      </div>
    </article>
  )
}

function PanelCard({
  ribbonLabel,
  ribbonClass,
  title,
  bullets,
  accent = false,
}: {
  ribbonLabel: string
  ribbonClass: string
  title: string
  bullets: string[]
  accent?: boolean
}) {
  return (
    <div
      className={`relative bg-paper border-2 ${
        accent
          ? 'border-brass-deep shadow-[0_0_20px_oklch(0.74_0.14_80/0.15)]'
          : 'border-stone-300'
      } p-5 sm:p-6 flex flex-col gap-3 rounded-sm`}
    >
      <CornerFlourish corner="tl" className={`absolute top-1.5 left-1.5 h-5 w-5 ${accent ? 'text-brass-deep' : 'text-stone-400'}`} />
      <CornerFlourish corner="tr" className={`absolute top-1.5 right-1.5 h-5 w-5 ${accent ? 'text-brass-deep' : 'text-stone-400'}`} />
      <CornerFlourish corner="bl" className={`absolute bottom-1.5 left-1.5 h-5 w-5 ${accent ? 'text-brass-deep' : 'text-stone-400'}`} />
      <CornerFlourish corner="br" className={`absolute bottom-1.5 right-1.5 h-5 w-5 ${accent ? 'text-brass-deep' : 'text-stone-400'}`} />

      <span
        className={`inline-flex w-fit text-[11px] tracking-[0.2em] uppercase border-2 px-2 py-1 rounded-sm ${ribbonClass}`}
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        {ribbonLabel}
      </span>

      <h3
        className="text-lg sm:text-xl text-ink leading-snug pr-2"
        style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
      >
        {title}
      </h3>

      <ul
        className="list-disc ml-5 space-y-1.5 text-sm text-ink-soft leading-relaxed"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
