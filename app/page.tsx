import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-5xl mx-auto flex-col gap-14 py-16 px-6">
      <header className="flex flex-col gap-5">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Built with Opus 4.7 hackathon
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight text-stone-900">
          Strata Mundo
        </h1>
        <p className="font-serif text-xl text-stone-700 italic">
          Mastery, layer by layer.
        </p>
        <ul className="text-base text-stone-700 leading-relaxed max-w-2xl space-y-1.5 list-disc ml-5">
          <li>What needs to be mastered — and corrected</li>
          <li>What to teach, and in what order</li>
          <li>How to teach it — and where to find the activities</li>
        </ul>
        <div className="flex flex-wrap gap-3 mt-2">
          <Link
            href="/setup"
            className="inline-flex h-11 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            Create a learner
          </Link>
          <a
            href="https://github.com/barbarajauregui-dadababa/fractions-mastery-tracker"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-5 text-sm font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            View on GitHub
          </a>
        </div>
      </header>

      <ProblemSection
        index="1"
        kicker="What needs to be mastered and corrected"
        problemTitle="No comprehensive assessment that finds gaps and misconceptions"
        problemBullets={[
          'Traditional schools push a fixed curriculum — ignoring what each learner has already mastered or where the foundation is shaky',
          'Mastery-based schools want to tailor — but no tool maps mastered concepts, named misconceptions, and areas to work on',
          'Khan’s course challenge probes only some skills, measures performance (right/wrong), not true mastery',
          'Without the full picture, a tailored curriculum is guesswork',
        ]}
        solutionTitle="A telemetry-based diagnostic, with a probe loop"
        solutionBullets={[
          'Reads the trajectory — drags, removals, commits, resets, timing — not just final answers',
          'Names specific misconceptions with evidence pointing to the problems where they fired',
          'Categorical states — Mastered / Working on / Needs attention / Not yet probed — never percentages',
          'Loop, not one-shot: assess → diagnose → plan → activities → focused probe → mastery declared, or re-plan',
          'The probe loop is what distinguishes diagnostic-of-current-misconception from proof-of-mastery',
        ]}
      />

      <ProblemSection
        index="2"
        kicker="In what order to teach, and learn"
        problemTitle="Knowing the gaps doesn’t tell you what to teach first"
        problemBullets={[
          'Concept dependencies are real but invisible',
          'Boxed curricula assume linear order — ignoring what’s already known',
          'Without a map, guides re-teach mastered material or skip foundational gaps',
        ]}
        solutionTitle="A mastery tree that shows the whole universe"
        solutionBullets={[
          'Every standard, every prerequisite, in one view',
          'Concept dependencies visible at a glance',
          'Skip what’s mastered; focus where it’s needed',
          'Built on the published Common Core Coherence Map and the Illustrative Mathematics curriculum sections',
          'Maximum flexibility for a tailored curriculum',
        ]}
      />

      <ProblemSection
        index="3"
        kicker="What to use, how to teach, how to learn"
        problemTitle="No easy way to find varied ways of learning a concept"
        problemBullets={[
          'Hours hunting for videos, exercises, and hands-on activities across sources',
          'Boxed curricula offer the same type of practice — limited variation',
          'Off-screen, real-world, hands-on activities are especially hard to find',
          'Math taught in isolation gets forgotten — true mastery comes from APPLYING it',
        ]}
        solutionTitle="A tailored plan from a curated, multimodal library"
        solutionBullets={[
          'Concrete → representational → abstract sequencing per gap',
          'On-screen + off-screen + hands-on activities per concept',
          'Math applied across contexts — not learned in isolation',
          'Plan is a living document — shifts as the learner’s mastery evolves',
          'Library grown by the community: AI-vetted, human-approved (vision)',
        ]}
      />

      <section className="rounded-xl border border-stone-200 bg-stone-50 p-6 flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
          What’s distinctive
        </h2>
        <ul className="list-disc ml-5 space-y-2 text-stone-700 leading-relaxed">
          <li>
            <span className="font-medium">Named misconception detection with traceable evidence</span>{' '}
            — wrong-answer patterns mapped to misconceptions from the literature, citing the problems where they fired
          </li>
          <li>
            <span className="font-medium">Strategy-switching on reset is positive evidence of mastery</span>{' '}
            — self-correction is one of the strongest mastery signals research has (Rittle-Johnson 2017, Siegler’s overlapping-waves theory)
          </li>
        </ul>
      </section>

      <footer className="text-xs text-stone-500 italic mt-2">
        Sections from Illustrative Mathematics K-5 (CC BY 4.0). Standards from CCSS-M and the Achievethecore Coherence Map. MIT licensed.
      </footer>
    </main>
  )
}

function ProblemSection({
  index,
  kicker,
  problemTitle,
  problemBullets,
  solutionTitle,
  solutionBullets,
}: {
  index: string
  kicker: string
  problemTitle: string
  problemBullets: string[]
  solutionTitle: string
  solutionBullets: string[]
}) {
  return (
    <section className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10">
      <div className="flex flex-col gap-1">
        <span className="font-serif text-5xl text-stone-300 leading-none">{index}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500 mt-2">
          {kicker}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="rounded-xl border border-stone-200 bg-white p-5 flex flex-col gap-3">
          <h3 className="font-serif text-lg font-semibold text-stone-900 leading-snug">
            {problemTitle}
          </h3>
          <ul className="list-disc ml-5 space-y-1.5 text-sm text-stone-700 leading-relaxed">
            {problemBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-700">
              Strata Mundo’s solution
            </span>
          </div>
          <h3 className="font-serif text-lg font-semibold text-stone-900 leading-snug">
            {solutionTitle}
          </h3>
          <ul className="list-disc ml-5 space-y-1.5 text-sm text-stone-700 leading-relaxed">
            {solutionBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
