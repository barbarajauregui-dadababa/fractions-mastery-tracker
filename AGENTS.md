<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Next.js 16 gotchas confirmed for this project

- **Async Request APIs are mandatory.** `cookies()`, `headers()`, `params`, and `searchParams` are all Promises. You MUST `await` them. Synchronous access is fully removed. Use `PageProps<'/route/[slug]'>` generic type helper where available (run `npx next typegen` after scaffolding).
- **Turbopack is default.** `package.json` scripts should NOT include `--turbopack` flag — it's implicit.
- **`middleware.ts` is deprecated**, renamed to **`proxy.ts`**. If we need session-refresh middleware for Supabase later, name it `proxy.ts` and export a `proxy()` function. Edge runtime is NOT supported in `proxy`; runtime is Node.js.
- **`next lint` command removed.** `package.json` uses `"lint": "eslint"` directly.
- **Parallel routes need `default.js`** — not currently used, but if we add one, include the file.

---

# Strata

## What this project is

A mastery-diagnostic tool for 3rd–4th grade fractions. A learner takes a 30–45 minute show-your-work assessment; Opus 4.7 analyzes the responses to produce a categorical mastery map (misconception detected / working / demonstrated / not assessed) with evidence citations; a Managed Agent (the Plan Architect) generates a tailored guide-facing plan of 2–3 concrete activities per priority gap. Focused ~10-minute re-probes verify whether specific misconceptions have resolved.

Built solo in 4 days for the Cerebral Valley "Built with Opus 4.7" hackathon, with a pilot at Acton Academy Falls Church.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind v4
- **Database / auth:** Supabase (Postgres + email/password + anonymous auth) via `@supabase/ssr`
- **Hosting:** Vercel (auto-deploy from GitHub main)
- **Model:** Anthropic Claude Opus 4.7 (`claude-opus-4-7`) for all substantive reasoning — assessment analysis, plan generation, misconception detection
- **Long-running agent:** Anthropic Managed Agents for the Plan Architect (multi-step plan synthesis with differential diagnosis and self-evaluation)

## Non-negotiable pedagogical principles

Every design decision must honor these. Flag any proposed code or UI that violates them.

1. **No learner-facing chatbot.** All learner-facing interactions are structured: forms, generated problems, visual feedback. The LLM does cognitive work behind the scenes, never as a chat interface with a child.
2. **Mastery over performance.** The system measures what the learner understands and can apply, not what she can fake under pressure. Categorical states (🔴 / 🟡 / 🟢 / ⚪), never percentage thresholds.
3. **Respect learner agency.** No locking content behind prerequisites. No gated re-assessment. Suggest, don't gate. The guide declares mastery; the system shows evidence.
4. **Intrinsic motivation.** The assessment and plan must feel purposeful to the learner, not like a test she's being put through.
5. **Protect against gaming.** Show-your-work format (typed answer + typed work-shown). Varied problem types per sub-skill. No multiple choice. No patterns a rushing kid could shortcut.

## Separation strategy — clean-room from prior project

This repo must contain no visible lineage to any prior ed-tech project (including one called "Diagonally"). The hackathon rules require new work only.

**Red-flag vocabulary / patterns. Stop and flag if any of these appear — in code you're about to write, in a dependency you're about to add, or in a suggestion you're about to make:**

- "Galaxy" as a home-screen concept
- 3D force graphs, `react-force-graph-3d`, or similar libraries
- "Tokens" as a reward mechanic
- "Builder" or "Player" modes
- "Circuit board builder"
- Status enum values like `available`, `in_progress`, `in_review`, `approved_unplayed`, `unlocked`, `mastered`
- Class codes + personal codes auth flow
- Any reference to "Diagonally" by name

Prefer plain, boring alternatives: 2D SVG or `react-flow` for the concept tree, simple state enums (`not_assessed`, `working`, `demonstrated`, `misconception`), Supabase email/password auth.

## Working style

- **Spec is authoritative.** Before writing code for a feature, consult `../ideas and vision/idea-1-fractions-mastery-spec.md`. The spec has been iterated carefully; defer to it over ad-hoc decisions.
- **Follow the build plan sequentially.** `../ideas and vision/hackathon-build-plan.md` defines the day-by-day sequence and three go/no-go gates. Do not leap ahead.
- **Parking-lot discipline.** Feature ideas that emerge mid-build go into `../ideas and vision/parking-lot.md`, never into code.
- **Barbara is a new-ish builder.** Explain choices when they matter. Before running commands or making file changes, state in one sentence what it does. Don't spiral when something breaks — stop, describe what happened, debug together.
- **Pause at checkpoints.** When a task has discrete steps, finish one, report, and wait for verification before proceeding.

## Folder layout

```
c:\projects\math-mastery-personal\
├── hackathon\                          (this repo — fresh, MIT license, built during hackathon)
│   ├── app\                            (Next.js App Router pages)
│   ├── components\                     (React components — created as needed)
│   ├── content\                        (domain JSONs — copied from ideas and vision drafts on review)
│   ├── lib\                            (supabase clients, utility code)
│   ├── AGENTS.md                       (this file)
│   └── README.md
└── ideas and vision\                   (reference material, not code — note: folder uses spaces)
    ├── hackathon-context-summary.md
    ├── idea-1-fractions-mastery-spec.md
    ├── hackathon-build-plan.md
    ├── parking-lot.md
    ├── phase-2-todo.md
    └── questions-for-barbara.md
```

The `hackathon/` folder is the only place code lives. The `ideas and vision/` folder is reference material.

## Key files in content/ (to be populated Friday morning)

- `fractions-misconceptions.json` — 8 misconceptions + 7 prerequisite concepts
- `fractions-concept-graph.json` — 8 sub-skill nodes + 12 dependency edges
- `fractions-problem-bank.json` — 62 tagged problems with misconception-mapping rules (the diagnosis engine's substrate — quality matters most here)
- `fractions-resources.json` — 20 curated resources tagged by misconception + modality

Drafts for all of these exist in `../ideas and vision/*-draft.json`. Copy into `content/` once Barbara reviews.

Static, loaded at build time. Do not generate problems or resources with an agent at runtime. The spec is explicit: "The library is curated by Barbara before/during hackathon, not generated by an agent. The agent's job is selection and sequencing, not discovery."

## Commands

```bash
npm run dev        # Next.js dev server on :3000 (Turbopack by default)
npm run build      # production build (Vercel runs this on deploy)
npm run lint       # ESLint
```

## Environment variables

Set these in `.env.local` (dev) and in Vercel project settings (production):

- `NEXT_PUBLIC_SUPABASE_URL` — e.g. `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the Supabase publishable key (new format: `sb_publishable_...`). Name kept as `ANON_KEY` for Vercel integration compatibility; the value is the new publishable key.
- `ANTHROPIC_API_KEY` — server-side only. Never prefix with `NEXT_PUBLIC_`.

The Supabase secret key (`sb_secret_...`, formerly `service_role`) is NOT used in v1. If anything ever needs it, stop and flag it.
