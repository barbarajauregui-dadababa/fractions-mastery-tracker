import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology — Strata Mundo',
  description:
    'How Strata Mundo diagnoses, plans, and verifies math mastery. Sources, glossary, and pedagogical principles.',
}

export default function MethodologyPage() {
  return (
    <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col gap-12 py-12 px-6 leading-relaxed">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Methodology
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
          How Strata Mundo works
        </h1>
        <p className="text-lg text-stone-700">
          Transparent by design. Every choice — sources, vocabulary, the analysis rules, the plan logic — is explained here.
        </p>
      </header>

      <Section id="why">
        <H2>Why we built this</H2>
        <Bullets>
          <li>Most math tools measure performance — speed, percentage correct. Mastery is something different: what the learner understands, can apply, and won&apos;t forget by Friday.</li>
          <li>Mastery-based learning communities (microschools, homeschoolers, alt-ed) want to tailor the curriculum to each learner — but lack the diagnostic tool to know what each learner has actually mastered.</li>
          <li>Strata Mundo answers two questions: <em>where is the learner, really?</em> and <em>what should they work on next, exactly?</em></li>
        </Bullets>
      </Section>

      <Section id="sources">
        <H2>Authoritative sources</H2>
        <p className="text-stone-700">
          Strata Mundo doesn&apos;t invent terminology, groupings, or sequencing. Every level of the hierarchy comes from a published, authoritative source.
        </p>
        <SourceTable>
          <SourceRow
            label="PROGRESSION"
            description="Cross-grade developmental arc through one mathematical domain (e.g., Fractions, K-5)."
            sourceName="Progressions for the Common Core State Standards in Mathematics"
            authors="Bill McCallum, Hung-Hsi Wu, Phil Daro et al. (University of Arizona, Institute for Mathematics and Education)"
            url="https://ime.math.arizona.edu/progressions"
          />
          <SourceRow
            label="SECTION"
            description="In-grade grouping of lessons within a Unit. Each Section contains several lessons targeting specific Standards."
            sourceName="Illustrative Mathematics K-5 Curriculum"
            authors="Illustrative Mathematics, distributed by Kendall Hunt. CC BY 4.0 license."
            url="https://im.kendallhunt.com/k5"
          />
          <SourceRow
            label="STANDARD"
            description="Individual learning target. Each standard has a CCSS-M code (e.g., 4.NF.A.1)."
            sourceName="Common Core State Standards for Mathematics"
            authors="National Governors Association + Council of Chief State School Officers"
            url="https://www.corestandards.org/Math/"
          />
          <SourceRow
            label="COHERENCE MAP"
            description="Cross-grade prerequisite arrows showing which standards depend on which others. Used for differential diagnosis (within-concept vs. prerequisite gap)."
            sourceName="The Coherence Map"
            authors="Student Achievement Partners, based on Jason Zimba's Wiring Diagram"
            url="https://tools.achievethecore.org/coherence-map/"
          />
        </SourceTable>
        <p className="text-sm text-stone-600">
          The hierarchy:{' '}
          <span className="font-medium">Progression → Section → Standard.</span>{' '}
          Each level uses its source&apos;s actual published terminology.
        </p>
      </Section>

      <Section id="glossary">
        <H2>Glossary</H2>
        <Bullets>
          <li><strong>Mastery map</strong> — the structured output of analysis. Every standard gets one of four states.</li>
          <li><strong>Mastered</strong> (green, emerald-600) — reliably understood with clear reasoning across multiple problems. Meets analysis rule R10.</li>
          <li><strong>Working on</strong> (amber-500) — partial understanding. Some right, some wrong, OR right only after multiple attempts without clear reasoning.</li>
          <li><strong>Needs attention</strong> (red-500) — a specific named misconception detected with evidence in the telemetry.</li>
          <li><strong>Not yet probed</strong> (stone-400) — this standard hasn&apos;t been touched in any completed assessment yet. Neither known nor unknown.</li>
          <li><strong>Telemetry</strong> — every interaction during an assessment recorded as a timestamped event: placement, removal, commit_attempt, reset.</li>
          <li><strong>Focused probe</strong> — a narrow re-assessment of one standard (4–6 problems, ~10 min). Used after the recommended activities to verify a misconception has resolved.</li>
          <li><strong>Plan Architect</strong> — Anthropic Managed Agent that reads a mastery map and writes a tailored plan with 2–3 activities per priority gap.</li>
          <li><strong>Smart-skip</strong> — when generating a plan, the Plan Architect skips Sections that are already mastered and starts at the first Section with any flagged standard.</li>
        </Bullets>
      </Section>

      <Section id="assessment">
        <H2>How the assessment works</H2>
        <Bullets>
          <li>~10 minutes, ~9 problems. Drag-and-build mechanic: the learner drags unit fraction pieces (1/2, 1/3, 1/4, 1/6, 1/8) onto a target bar to construct the requested fraction.</li>
          <li>Some problems force equivalence reasoning by restricting the palette (e.g., &quot;build 2/3 using only sixths&quot;).</li>
          <li>No typed answers. No multiple choice. The mechanic forces the learner to <em>show</em>, not <em>tell</em>.</li>
          <li>Every interaction is recorded as process telemetry — drags, removals, commits, resets, timing.</li>
          <li>v1 covers <strong>11 standards</strong> across grades 2–4 (the part of the K-5 Fractions Progression we currently probe, plus 2 prerequisite Geometry standards on partitioning).</li>
        </Bullets>
      </Section>

      <Section id="analysis">
        <H2>How analysis works</H2>
        <p className="text-stone-700">
          A single Claude Opus 4.7 call reads the telemetry and produces the mastery map. Analysis follows ten reasoning rules (R1–R10) that prioritize <em>process over outcome</em>.
        </p>
        <Bullets>
          <li><strong>R1</strong> — Process over outcome. Don&apos;t infer mastery from a correct final answer alone.</li>
          <li><strong>R2</strong> — First-commit-success with deliberate pacing is a strong &quot;demonstrated&quot; signal.</li>
          <li><strong>R3</strong> — Strategy-switching on reset (different denominators on second attempt) is comparably strong evidence — self-correction is one of the strongest mastery signals research has (Rittle-Johnson 2017, Siegler&apos;s overlapping-waves theory).</li>
          <li><strong>R4</strong> — Same-strategy resets = guessing/fiddling, not reasoning.</li>
          <li><strong>R5</strong> — Three or more commit attempts with the same composition = working, not mastered.</li>
          <li><strong>R6</strong> — Rapid commits AND wrong = guessing (Wise 2017). Speed alone is not a guessing signal.</li>
          <li><strong>R7</strong> — Specific wrong-commit content maps to specific named misconceptions, declared in each problem&apos;s response map.</li>
          <li><strong>R8</strong> — No commit attempt → not_assessed.</li>
          <li><strong>R9</strong> — Evidence in data, not narrative. Use plain language for guides; problem IDs go in audit fields, not in prose.</li>
          <li><strong>R10</strong> — &quot;Mastered&quot; requires success across multiple problems for a standard, with clear reasoning.</li>
        </Bullets>
      </Section>

      <Section id="plan">
        <H2>How the plan is generated</H2>
        <p className="text-stone-700">
          The Plan Architect is an Anthropic Managed Agent running on Claude Opus 4.7. It reads the mastery map and writes a guide-facing plan in 1–3 minutes.
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

      <Section id="probe">
        <H2>The probe loop</H2>
        <Bullets>
          <li>The general assessment maps the broad mastery picture across many standards.</li>
          <li>The plan prescribes activities for the flagged standards.</li>
          <li>After the learner does the activities, the guide runs a <strong>focused probe</strong> on one standard — ~4–6 problems, ~10 minutes — to verify the misconception has resolved.</li>
          <li>If resolved → the standard moves to <em>Mastered</em> in the parent mastery map.</li>
          <li>If not resolved → the Plan Architect re-plans with options: same activities + more time, different modality, or escalate to a prerequisite.</li>
          <li>This <em>loop</em> is what distinguishes diagnostic-of-current-misconception from proof-of-mastery. Mastery is earned through the loop over time, not claimed from a single assessment.</li>
        </Bullets>
      </Section>

      <Section id="dont-do">
        <H2>What we deliberately don&apos;t do</H2>
        <Bullets>
          <li><strong>No learner-facing chatbot.</strong> All learner-facing interactions are structured: forms, problems, visual feedback. The LLM does cognitive work behind the scenes, never as a chat with a child.</li>
          <li><strong>No percentage scores.</strong> Categorical states only. Percentages collapse different mastery realities (fluent guessing, slow reasoning, partial understanding) into one number that hides the diagnosis.</li>
          <li><strong>No gamification.</strong> No XP, streaks, leaderboards, badges, or extrinsic rewards. Mastery-based-learning communities reject these mechanics; we honor that.</li>
          <li><strong>No gated progression.</strong> The system suggests; the guide decides. Mastery is declared by the guide, supported by the evidence we surface.</li>
          <li><strong>No selling of learner data.</strong> Ever.</li>
        </Bullets>
      </Section>

      <Section id="limits">
        <H2>What v1 doesn&apos;t yet do</H2>
        <Bullets>
          <li>v1 only renders <code>build_fraction</code> problems in the UI. Problem types for number-line placement, comparison, identification, and partitioning are in the bank but not yet rendered. Each focused probe currently varies in <em>surface features</em> (denominators, palettes, magnitudes) but not across <em>representation types</em>. That arrives in v1.1.</li>
          <li>v1 covers fractions only. v1.5 extends to all of 4th-grade math (Operations, Place Value, Measurement, Geometry).</li>
          <li>The community-vetted real-world activity layer (Section 3 of the home-page vision) is post-v2 — guides and older learners contributing real-world activities, AI-vetted, human-curated. Not built yet.</li>
          <li>Multi-curriculum resource picker (Beast Academy / Saxon / Singapore / Math-U-See / Montessori) is post-v2.</li>
        </Bullets>
      </Section>

      <Section id="privacy">
        <H2>Privacy and data</H2>
        <Bullets>
          <li>Learner data lives in a Supabase Postgres database with row-level security.</li>
          <li>Anonymous authentication — no email, no password collection in v1.</li>
          <li>Telemetry events (drags, commits, etc.) are stored alongside the assessment row. No third-party analytics.</li>
          <li>The Plan Architect agent runs on Anthropic&apos;s Managed Agents infrastructure. No learner names or PII are sent to the agent — only mastery-map states + standard codes.</li>
        </Bullets>
      </Section>

      <Section id="license">
        <H2>License</H2>
        <Bullets>
          <li><strong>Code:</strong> MIT licensed.</li>
          <li><strong>Illustrative Mathematics K-5 Section structure:</strong> CC BY 4.0. We use IM section names verbatim with attribution.</li>
          <li><strong>PhET Interactive Simulations</strong> referenced as a resource: CC BY 4.0. Attribution: <em>&quot;PhET Interactive Simulations, University of Colorado Boulder.&quot;</em></li>
          <li><strong>CCSS-M and the Coherence Map:</strong> referenced for the standards taxonomy and prerequisite structure.</li>
        </Bullets>
      </Section>

      <footer className="text-xs text-stone-500 italic mt-4 border-t border-stone-200 pt-6">
        This is a v0.5 methodology page — accurate but not yet exhaustive. The
        product blueprint, glossary, and source ledger have additional detail.
        Email feedback or open a GitHub issue.
      </footer>
    </main>
  )
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3">
      {children}
    </section>
  )
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900 mt-2">
      {children}
    </h2>
  )
}

function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc ml-5 space-y-2 text-stone-700">{children}</ul>
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
    <li className="rounded-lg border border-stone-200 bg-white p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium font-mono uppercase tracking-wide text-stone-500 px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
          {label}
        </span>
      </div>
      <div className="text-sm text-stone-700">{description}</div>
      <div className="text-sm text-stone-800">
        Source: <em>{sourceName}</em>
      </div>
      <div className="text-xs text-stone-600">{authors}</div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-blue-700 underline underline-offset-2 hover:text-blue-900 break-all"
      >
        {url}
      </a>
    </li>
  )
}
