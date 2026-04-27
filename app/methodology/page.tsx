import type { Metadata } from 'next'
import { OrnamentalRule, RomanNumeral } from '@/app/Ornament'

export const metadata: Metadata = {
  title: 'Methodology — Strata Mundo',
  description:
    'How Strata Mundo diagnoses, plans, and verifies math mastery. Sources, glossary, and pedagogical principles.',
}

export default function MethodologyPage() {
  return (
    <main className="bg-paper min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-12 leading-relaxed">
        <header className="flex flex-col gap-3 items-center text-center">
          <p
            className="text-sm tracking-[0.3em] uppercase text-ink-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Methodology · A field manual
          </p>
          <h1
            className="text-4xl sm:text-5xl tracking-tight text-ink"
            style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
          >
            How Strata Mundo works
          </h1>
          <p
            className="text-base sm:text-lg italic text-ink-soft max-w-2xl"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            Transparent by design. Every choice — sources, vocabulary, the analysis rules, the plan logic — is explained here.
          </p>
          <OrnamentalRule className="h-5 text-brass-deep/50 mt-2" width={280} />
        </header>

        <Section id="three-questions">
          <H2>Three questions Strata Mundo answers</H2>
          <ThreeQuestions
            questions={[
              {
                kicker: 'Question I',
                title: 'Where is the learner, really?',
                bullets: [
                  'Reads drags, removals, commits, resets, timing — not just answers',
                  'Produces a categorical mastery map per CCSS standard',
                  'Four states with named misconceptions and traceable evidence',
                ],
              },
              {
                kicker: 'Question II',
                title: 'What should they work on next?',
                bullets: [
                  'Mastery atlas grounded in the Coherence Map and IM Sections',
                  'Concept dependencies visible',
                  'Plan Architect skips mastered, starts at the first flagged section',
                ],
              },
              {
                kicker: 'Question III',
                title: 'What tools will work for them?',
                bullets: [
                  'Tailored plan from a curated multimodal library',
                  'Concrete → representational → abstract sequencing per gap',
                  'On-screen + off-screen + hands-on per concept',
                  'Plan shifts as mastery evolves',
                ],
              },
            ]}
          />
        </Section>

        <SectionDivider />

        <Section id="sources">
          <H2>Authoritative sources</H2>
          <p className="text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Strata Mundo doesn&apos;t invent terminology, groupings, or sequencing. Every level of the hierarchy comes from a published, authoritative source.
          </p>
          <SourceTable>
            <SourceRow
              label="Progression"
              description="Cross-grade developmental arc through one mathematical domain (e.g., Fractions, K-5)."
              sourceName="Progressions for the Common Core State Standards in Mathematics"
              authors="Bill McCallum, Hung-Hsi Wu, Phil Daro et al. (University of Arizona, Institute for Mathematics and Education)"
              url="https://mathematicalmusings.org/"
            />
            <SourceRow
              label="Section"
              description="In-grade grouping of lessons within a Unit. Each Section contains several lessons targeting specific Standards."
              sourceName="Illustrative Mathematics K-5 Curriculum"
              authors="Illustrative Mathematics, distributed by Kendall Hunt. CC BY 4.0 license."
              url="https://im.kendallhunt.com/k5"
            />
            <SourceRow
              label="Standard"
              description="Individual learning target. Each standard has a CCSS-M code (e.g., 4.NF.A.1)."
              sourceName="Common Core State Standards for Mathematics"
              authors="National Governors Association + Council of Chief State School Officers"
              url="https://www.corestandards.org/Math/"
            />
            <SourceRow
              label="Coherence Map"
              description="Cross-grade prerequisite arrows showing which standards depend on which others. Used for differential diagnosis (within-concept vs. prerequisite gap)."
              sourceName="The Coherence Map"
              authors="Student Achievement Partners, based on Jason Zimba's Wiring Diagram"
              url="https://tools.achievethecore.org/coherence-map/"
            />
          </SourceTable>
          <p className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The hierarchy:{' '}
            <span className="font-medium text-ink">Progression → Section → Standard.</span>{' '}
            Each level uses its source&apos;s actual published terminology.
          </p>
        </Section>

        <SectionDivider />

        <Section id="glossary">
          <H2>Glossary</H2>
          <Bullets>
            <li><strong>Mastery map</strong> — the structured output of analysis. Every standard gets one of four states.</li>
            <li><strong>Mastered</strong> (green, emerald-600) — reliably understood with clear reasoning across multiple problems. Meets analysis rule R10.</li>
            <li><strong>Building the skill</strong> (amber) — reasoning is on the right track but not yet reliable. Some right, some wrong, OR right only after multiple attempts. More varied practice needed.</li>
            <li><strong>Misconception detected</strong> (red, with brass warning cartouche) — a specific named wrong mental model is firing. Targeted intervention required.</li>
            <li><strong>Not yet probed</strong> (stone-400) — this standard hasn&apos;t been touched in any completed assessment yet. Neither known nor unknown.</li>
            <li><strong>Telemetry</strong> — every interaction during an assessment recorded as a timestamped event: placement, removal, commit_attempt, reset.</li>
            <li><strong>Focused probe</strong> — a narrow re-assessment of one standard (4–6 problems, ~10 min). Run after the recommended activities to verify a misconception has resolved.</li>
            <li><strong>Plan Architect</strong> — Anthropic Managed Agent that reads a mastery map and writes a tailored plan with 2–3 activities per priority gap.</li>
            <li><strong>Smart-skip</strong> — when generating a plan, the Plan Architect skips Sections that are already mastered and starts at the first Section with any flagged standard.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="assessment">
          <H2>How the assessment works</H2>
          <Bullets>
            <li>~10 minutes, 7 problems. Drag-and-build mechanic: the learner drags unit fraction pieces (1/2, 1/3, 1/4, 1/6, 1/8) onto a target bar to construct the requested fraction.</li>
            <li>Some problems force equivalence reasoning by restricting the palette (e.g., &quot;build 2/3 using only sixths&quot;).</li>
            <li>No typed answers. No multiple choice. The mechanic asks the learner to <em>show</em>, not <em>tell</em>.</li>
            <li>Every interaction is recorded as process telemetry — drags, removals, commits, resets, timing.</li>
            <li>v1 covers <strong>11 standards</strong> across grades 2–4 (the part of the K-5 Fractions Progression we currently probe, plus 2 prerequisite Geometry standards on partitioning).</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="analysis">
          <H2>How analysis works</H2>
          <p className="text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            A single Claude Opus 4.7 call reads the telemetry and produces the mastery map. Analysis follows ten reasoning rules (R1–R10) that prioritize <em>process over outcome</em>.
          </p>
          <Bullets>
            <li><strong>R1</strong> — Process over outcome. Don&apos;t infer mastery from a correct final answer alone.</li>
            <li><strong>R2</strong> — First-commit-success with deliberate pacing is a strong &quot;demonstrated&quot; signal.</li>
            <li><strong>R3</strong> — Strategy-switching on reset (different denominators on the second attempt) is comparably strong evidence — self-correction is one of the strongest mastery signals research has (Rittle-Johnson 2017, Siegler&apos;s overlapping-waves theory).</li>
            <li><strong>R4</strong> — Same-strategy resets = guessing/fiddling, not reasoning.</li>
            <li><strong>R5</strong> — Three or more commit attempts with the same composition = working, not mastered.</li>
            <li><strong>R6</strong> — Rapid commits AND wrong = guessing (Wise 2017). Speed alone is not a guessing signal.</li>
            <li><strong>R7</strong> — Specific wrong-commit content maps to specific named misconceptions, declared in each problem&apos;s response map.</li>
            <li><strong>R8</strong> — No commit attempt → not_assessed.</li>
            <li><strong>R9</strong> — Evidence in data, not narrative. Use plain language; problem IDs go in audit fields, not in prose.</li>
            <li><strong>R10</strong> — &quot;Mastered&quot; requires success across multiple problems for a standard, with clear reasoning.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="plan">
          <H2>How the plan is generated</H2>
          <p className="text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The Plan Architect is an Anthropic Managed Agent running on Claude Opus 4.7. It reads the mastery map and writes a tailored plan in 1–3 minutes.
          </p>
          <Bullets>
            <li><strong>Differential diagnosis.</strong> For each priority gap, the agent decides whether the issue is within-concept or whether it&apos;s actually a prerequisite gap from an earlier standard.</li>
            <li><strong>Smart-skip.</strong> The agent identifies the FIRST IM Section containing any flagged standard and starts there. Earlier sections where everything is mastered or untouched are marked accordingly.</li>
            <li><strong>2–3 activities per priority gap.</strong> Activities are picked from a curated resource library, never generated.</li>
            <li><strong>Concrete → Representational → Abstract sequencing.</strong> Hands-on first, video/digital second, worksheet/symbolic last (Van de Walle 2014).</li>
            <li><strong>Avoids failed resources.</strong> If a previous plan tried a resource and the misconception is still flagged, the agent picks a different resource for the next plan.</li>
            <li><strong>Plain-language rationale.</strong> Every activity gets a 1–2 sentence explanation of why it&apos;s prescribed for this learner&apos;s specific misconception.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="probe">
          <H2>The probe loop</H2>
          <Bullets>
            <li>The general assessment maps the broad mastery picture across many standards.</li>
            <li>The plan prescribes activities for the flagged standards.</li>
            <li>After the learner does the activities, a <strong>focused probe</strong> runs on one standard — ~4–6 problems, ~10 minutes — to verify the misconception has resolved.</li>
            <li>If resolved → the standard moves to <em>Mastered</em> in the overall mastery map.</li>
            <li>If not resolved → the Plan Architect re-plans with options: same activities + more time, different modality, or escalate to a prerequisite.</li>
            <li>This <em>loop</em> is what distinguishes a diagnostic of current misconception from proof of mastery. Mastery is earned through the loop over time, not claimed from a single assessment.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="grounding">
          <H2>How the diagnosis is grounded</H2>
          <Bullets>
            <li><strong>Named misconception detection with traceable evidence.</strong> Wrong-answer patterns are mapped to misconceptions from the literature, citing the problems where they fired. Educators see a specific cognitive error, not a percentage.</li>
            <li><strong>Strategy-switching on reset is positive evidence of mastery.</strong> A learner who tries one approach, gaps, resets, and tries another successfully is demonstrating self-correction — one of the strongest mastery signals research has (Rittle-Johnson 2017, Siegler&apos;s overlapping-waves theory).</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="vetting">
          <H2>Community contributions: AI-vetted, human-approved</H2>
          <p className="text-base text-ink-soft leading-relaxed" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The library of activities grows the way good teaching practice has always grown — through the contributions of many practitioners. Anyone can submit a new activity for any standard via the <a href="/contribute" className="text-copper underline underline-offset-2 hover:text-brass-deep">Contribute</a> page, or directly from a learner&apos;s plan via the &quot;Suggest an activity for this standard&quot; link next to each gap.
          </p>
          <p className="text-base text-ink-soft leading-relaxed" style={{ fontFamily: 'var(--font-fraunces)' }}>
            Every submission goes through a two-stage review: an AI reviewer (Claude Opus 4.7) first, then a human reviewer. The AI never approves directly — it only passes, flags, or rejects. Final approval is always human. Both sets of criteria are documented below.
          </p>

          <H3>Stage 1 — AI vetting criteria</H3>
          <p className="text-sm text-ink-soft italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The AI applies the criteria in order. Each criterion has an ID; when a submission is flagged or rejected, the specific IDs are cited so the contributor knows exactly what to address.
          </p>

          <CriteriaBlock title="Section 1 — Completeness (must pass all)">
            <li><strong>1.1</strong> Title is a specific name, not a generic phrase. ✗ &quot;Math activity&quot; ✓ &quot;Build-a-fraction interactive — PhET&quot;</li>
            <li><strong>1.2</strong> Description explains what the learner <em>does</em> (action + concept), not just what they learn.</li>
            <li><strong>1.3</strong> Modality matches the description.</li>
            <li><strong>1.4</strong> At least one CCSS-M standard is selected, plausibly related to the description.</li>
          </CriteriaBlock>

          <CriteriaBlock title="Section 2 — Pedagogical fit (project hard rules; reject if violated)">
            <li><strong>2.1</strong> NOT a learner-facing chatbot or AI tutor.</li>
            <li><strong>2.2</strong> NOT primarily gamified with tokens, coins, streaks, or leaderboards.</li>
            <li><strong>2.3</strong> Grade band fits 3rd–4th grade (or a Coherence Map prerequisite like 2.G.A.3).</li>
            <li><strong>2.4</strong> Activity actually teaches the standards selected, not adjacent ones.</li>
          </CriteriaBlock>

          <CriteriaBlock title="Section 3 — Source quality (borderline if any concern)">
            <li><strong>3.1</strong> URL (if provided) is from a recognizable educational source OR is specific enough to verify.</li>
            <li><strong>3.2</strong> Source/vendor name matches the URL&apos;s domain.</li>
            <li><strong>3.3</strong> For physical materials, brand or vendor identifiable.</li>
            <li><strong>3.4</strong> No obvious blocklist domains (gambling, ads, content farms).</li>
          </CriteriaBlock>

          <CriteriaBlock title="Section 4 — Safety + appropriateness (reject if violated)">
            <li><strong>4.1</strong> Description is on-topic for math education.</li>
            <li><strong>4.2</strong> No promotional/advertorial language.</li>
            <li><strong>4.3</strong> No personally identifying info about specific children.</li>
            <li><strong>4.4</strong> Language appropriate for an educational context.</li>
          </CriteriaBlock>

          <CriteriaBlock title="Section 5 — Non-duplication (best-effort, flag for human)">
            <li><strong>5.1</strong> If submission appears identical to a known curated resource, flag.</li>
          </CriteriaBlock>

          <CriteriaBlock title="Section 6 — Instructions to the AI itself">
            <li><strong>6.1</strong> Never approve. Only humans approve.</li>
            <li><strong>6.2</strong> Never reject for stylistic preferences.</li>
            <li><strong>6.3</strong> Never reject &quot;different from typical&quot; approaches that meet pedagogical fit. Distinctive approaches are valuable.</li>
            <li><strong>6.4</strong> When uncertain, prefer &quot;borderline&quot; over &quot;rejected.&quot;</li>
            <li><strong>6.5</strong> Always cite the specific criterion ID(s) violated.</li>
            <li><strong>6.6</strong> Respond only with valid JSON.</li>
          </CriteriaBlock>

          <H3>Stage 2 — Human review criteria</H3>
          <p className="text-sm text-ink-soft italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The human reviewer applies all of the AI criteria above plus the following judgments, which require human discernment:
          </p>

          <CriteriaBlock title="Human-only judgments">
            <li><strong>H1</strong> Does the activity exemplify quality teaching practice — does it model the kind of learning we want children to have?</li>
            <li><strong>H2</strong> Is the activity additive to the existing library, or is it materially redundant with what we already have?</li>
            <li><strong>H3</strong> If a URL is provided, the human verifies it actually points to the activity described (the AI cannot fetch URLs).</li>
            <li><strong>H4</strong> For physical materials, the human verifies the material is purchasable/findable.</li>
            <li><strong>H5</strong> Does the description set realistic expectations? (Misleading promises about what a learner will achieve are rejected.)</li>
            <li><strong>H6</strong> Final pedagogical judgment: does this belong in a Strata Mundo learner&apos;s plan? When the human says yes, the activity is approved.</li>
          </CriteriaBlock>

          <p className="text-sm text-ink-soft italic" style={{ fontFamily: 'var(--font-fraunces)' }}>
            The criteria are versioned with the codebase and revised as we learn what works. The current source of truth lives in <code className="font-mono text-sm bg-paper-deep px-1.5 py-0.5 rounded">lib/ai-vet-activity.ts</code>.
          </p>
        </Section>

        <SectionDivider />

        <Section id="dont-do">
          <H2>What we deliberately don&apos;t do</H2>
          <Bullets>
            <li><strong>No learner-facing chatbot.</strong> All learner-facing interactions are structured: forms, problems, visual feedback. The LLM does cognitive work behind the scenes, never as a chat with a child.</li>
            <li><strong>No percentage scores.</strong> Categorical states only. Percentages collapse different mastery realities (fluent guessing, slow reasoning, partial understanding) into one number that hides the diagnosis.</li>
            <li><strong>No gamification.</strong> No XP, streaks, leaderboards, badges, or extrinsic rewards. Mastery-based settings reject these mechanics; we honor that.</li>
            <li><strong>No gated progression.</strong> The system suggests; the human decides. Mastery is declared by a human reviewer, supported by the evidence we surface.</li>
            <li><strong>No selling of learner data.</strong> Ever.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="limits">
          <H2>What v1 doesn&apos;t yet do</H2>
          <Bullets>
            <li>v1 only renders <code className="font-mono text-sm bg-paper-deep px-1.5 py-0.5 rounded">build_fraction</code> problems. Problem types for number-line placement, comparison, identification, and partitioning are in the bank but not yet rendered. Each focused probe currently varies in <em>surface features</em> (denominators, palettes, magnitudes) but not across <em>representation types</em>. That arrives in v1.1.</li>
            <li>v1 covers fractions only. v1.5 extends to all of 4th-grade math (Operations, Place Value, Measurement, Geometry).</li>
            <li>Multi-curriculum resource picker (Beast Academy / Saxon / Singapore / Math-U-See / Montessori) is post-v2.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="privacy">
          <H2>Privacy and data</H2>
          <Bullets>
            <li>Learner data lives in a Supabase Postgres database with row-level security.</li>
            <li>Anonymous authentication — no email, no password collection in v1.</li>
            <li>Telemetry events (drags, commits, etc.) are stored alongside the assessment row. No third-party analytics.</li>
            <li>The Plan Architect agent runs on Anthropic&apos;s Managed Agents infrastructure. No learner names or PII are sent to the agent — only mastery-map states + standard codes.</li>
          </Bullets>
        </Section>

        <SectionDivider />

        <Section id="license">
          <H2>License</H2>
          <Bullets>
            <li><strong>Code:</strong> MIT licensed.</li>
            <li><strong>Illustrative Mathematics K-5 Section structure:</strong> CC BY 4.0. We use IM section names verbatim with attribution.</li>
            <li><strong>PhET Interactive Simulations</strong> referenced as a resource: CC BY 4.0. Attribution: <em>&quot;PhET Interactive Simulations, University of Colorado Boulder.&quot;</em></li>
            <li><strong>CCSS-M and the Coherence Map:</strong> referenced for the standards taxonomy and prerequisite structure.</li>
          </Bullets>
        </Section>

        <footer className="mt-4 pt-6 border-t border-stone-300/40 flex flex-col items-center gap-3">
          <OrnamentalRule className="h-4 text-brass-deep/40" width={200} />
          <p
            className="text-xs text-ink-faint italic text-center"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            This is a v0.5 field manual — accurate but not yet exhaustive. The product blueprint, glossary, and source ledger have additional detail.
          </p>
        </footer>
      </div>
    </main>
  )
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-4">
      {children}
    </section>
  )
}

function SectionDivider() {
  return (
    <div className="flex justify-center">
      <OrnamentalRule className="h-4 text-brass-deep/35" width={180} />
    </div>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl sm:text-3xl tracking-tight text-ink mt-2"
      style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
    >
      {children}
    </h2>
  )
}

function Bullets({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="list-disc ml-5 space-y-2 text-ink-soft"
      style={{ fontFamily: 'var(--font-fraunces)' }}
    >
      {children}
    </ul>
  )
}

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
          className="relative bg-paper-deep/40 border-2 border-brass-deep/40 rounded-sm p-5 sm:p-6 flex flex-col gap-2"
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

function SourceTable({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-4 mt-2">{children}</ul>
}

function SourceRow({
  label,
  description,
  sourceName,
  authors,
  url,
}: {
  label: string
  description: string
  sourceName: string
  authors: string
  url: string
}) {
  return (
    <li className="rounded-sm border-2 border-brass-deep/30 bg-paper p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium tracking-[0.2em] uppercase text-brass-deep border border-brass-deep/40 bg-brass/10 px-2 py-0.5 rounded-sm"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          {label}
        </span>
      </div>
      <div className="text-sm text-ink-soft" style={{ fontFamily: 'var(--font-fraunces)' }}>
        {description}
      </div>
      <div className="text-sm text-ink" style={{ fontFamily: 'var(--font-fraunces)' }}>
        Source: <em>{sourceName}</em>
      </div>
      <div
        className="text-xs text-ink-faint"
        style={{ fontFamily: 'var(--font-special-elite)' }}
      >
        {authors}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-copper hover:text-brass-deep underline underline-offset-2 break-all"
        style={{ fontFamily: 'var(--font-special-elite)' }}
      >
        {url}
      </a>
    </li>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mt-2 text-xl text-ink"
      style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
    >
      {children}
    </h3>
  )
}

function CriteriaBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-sm border border-brass-deep/40 bg-paper-deep/40 p-4">
      <div
        className="text-sm tracking-[0.2em] uppercase text-brass-deep mb-2"
        style={{ fontFamily: 'var(--font-cinzel)' }}
      >
        {title}
      </div>
      <ul
        className="list-none pl-0 space-y-1.5 text-sm text-ink-soft leading-relaxed"
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        {children}
      </ul>
    </div>
  )
}
