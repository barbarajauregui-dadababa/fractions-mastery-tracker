/**
 * SourceInfo — small "i" pill that opens a popover with a layer's
 * source citation and clickable URL.
 *
 * Uses the native HTML <details> element so it's a server component
 * (no client-side state). Click to open, click again to close.
 *
 * Three preset variants are exported below for the three layers we
 * actually use in the report UI:
 *   - PROGRESSION  -> Progressions for the CCSS in Mathematics (UA, McCallum)
 *   - SECTION      -> Illustrative Mathematics K-5 Curriculum (CC BY 4.0)
 *   - STANDARD     -> Common Core State Standards for Mathematics
 */

interface Props {
  layer: string
  description: string
  sourceName: string
  authors: string
  url: string
}

export function SourceInfo({ layer, description, sourceName, authors, url }: Props) {
  return (
    <details className="inline-block relative align-middle group">
      <summary
        className="cursor-help inline-flex h-4 w-4 items-center justify-center rounded-full border border-brass-deep/50 bg-paper-deep/40 text-[11px] text-brass-deep hover:bg-brass/15 list-none"
        aria-label={`About: ${layer}`}
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        i
      </summary>
      <div className="absolute left-0 top-5 z-30 w-72 rounded-sm border-2 border-brass-deep/50 bg-paper p-3 text-xs shadow-lg">
        <div
          className="text-sm tracking-[0.2em] uppercase text-brass-deep mb-1"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {layer}
        </div>
        <p
          className="text-ink-soft leading-relaxed"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {description}
        </p>
        <div
          className="text-ink mt-2 italic"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          Source: {sourceName}
        </div>
        <div
          className="text-xs text-ink-faint mt-1"
          style={{ fontFamily: 'var(--font-special-elite)' }}
        >
          {authors}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-copper hover:text-brass-deep underline underline-offset-2 mt-2 inline-block break-all"
          style={{ fontFamily: 'var(--font-special-elite)' }}
        >
          View source →
        </a>
      </div>
    </details>
  )
}

export function ProgressionInfo() {
  return (
    <SourceInfo
      layer="Progression"
      description="Cross-grade developmental arc through one mathematical domain (e.g., Fractions, K–5). The brand’s top-level grouping."
      sourceName="Progressions for the Common Core State Standards in Mathematics"
      authors="Bill McCallum, Hung-Hsi Wu, Phil Daro et al. — University of Arizona, Institute for Mathematics and Education"
      url="https://ime.math.arizona.edu/progressions"
    />
  )
}

export function SectionInfo() {
  return (
    <SourceInfo
      layer="Section"
      description="In-grade grouping of lessons within a Unit. Each Section contains several lessons targeting specific Standards."
      sourceName="Illustrative Mathematics K-5 Curriculum"
      authors="Illustrative Mathematics, distributed by Kendall Hunt. CC BY 4.0 license."
      url="https://im.kendallhunt.com/k5"
    />
  )
}

export function StandardInfo() {
  return (
    <SourceInfo
      layer="Standard"
      description="Individual learning target. Each standard has a CCSS-M code (e.g., 4.NF.A.1)."
      sourceName="Common Core State Standards for Mathematics"
      authors="National Governors Association + Council of Chief State School Officers"
      url="https://www.corestandards.org/Math/"
    />
  )
}
