import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-1 w-full max-w-4xl mx-auto flex-col gap-12 py-20 px-6">
      <header className="flex flex-col gap-4">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Built with Opus 4.7 hackathon · Acton Academy Falls Church pilot
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl font-semibold tracking-tight text-stone-900">
          Strata
        </h1>
        <p className="font-serif text-xl text-stone-700 italic">
          Mastery, layer by layer.
        </p>
        <p className="text-lg text-stone-600 leading-relaxed max-w-2xl">
          A diagnostic that finds <em>why</em> a child gets math wrong, not just{' '}
          <em>whether</em> they did. Currently scoped to grade 3–4 fractions —
          extending to all of 4th-grade math next. Grounded in the Illustrative
          Mathematics curriculum and the Common Core.
        </p>
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

      <section className="grid sm:grid-cols-3 gap-4">
        <Step
          number="1"
          title="Drag-and-build assessment"
          body="Ten minutes. Nine problems. Every interaction is recorded as process telemetry — drags, removals, commits, resets, timing."
        />
        <Step
          number="2"
          title="Mastery map with named misconceptions"
          body="Claude Opus 4.7 reads the trajectory and produces a categorical map per CCSS standard, with specific misconceptions flagged from evidence."
        />
        <Step
          number="3"
          title="Pedagogically sound plan"
          body="A Plan Architect agent prescribes 2–3 concrete activities per gap, sequenced concrete-to-abstract, drawn from a curated resource library."
        />
      </section>

      <section className="rounded-xl border border-stone-200 bg-stone-50 p-6 flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-stone-500">
          What&apos;s distinctive
        </h2>
        <ul className="list-disc ml-5 space-y-2 text-stone-700 leading-relaxed">
          <li>
            <span className="font-medium">Named misconception detection with traceable evidence</span>{' '}
            — wrong-answer patterns are explicitly mapped to misconceptions from
            the literature, citing the specific problems where they fired.
          </li>
          <li>
            <span className="font-medium">Strategy-switching on reset is treated as positive evidence of mastery</span>{' '}
            — a learner who tries one approach, gaps, resets, and tries another
            successfully is showing self-correction (Rittle-Johnson 2017,
            Siegler&apos;s overlapping-waves theory).
          </li>
        </ul>
      </section>

      <footer className="text-xs text-stone-500 italic mt-4">
        Bundle structure adapted from Illustrative Mathematics K-5 (CC BY 4.0).
        Standards taxonomy from CCSS-M and the Achievethecore Coherence Map.
        MIT licensed.
      </footer>
    </main>
  )
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-5">
      <span className="text-xs font-mono text-stone-400">{number}</span>
      <h3 className="text-sm font-medium text-stone-900">{title}</h3>
      <p className="text-sm text-stone-600 leading-relaxed">{body}</p>
    </article>
  )
}
