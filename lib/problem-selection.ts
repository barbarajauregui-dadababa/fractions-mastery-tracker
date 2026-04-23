import problemBankRaw from '@/content/fractions-problem-bank.json'

export type ProblemType = 'procedural' | 'conceptual' | 'applied'

export interface Problem {
  id: string
  sub_skill_id: string
  problem_type: ProblemType
  difficulty: number
  prompt: string
  expected_answer: string
  acceptable_equivalents?: string[]
  target_misconception_ids: string[]
  misconception_response_map: Record<string, string>
  show_your_work_expectation: string
}

interface ProblemBank {
  problems: Problem[]
}

const problemBank = problemBankRaw as unknown as ProblemBank

export function getAllProblems(): Problem[] {
  return problemBank.problems
}

export function getProblemById(id: string): Problem | undefined {
  return problemBank.problems.find((p) => p.id === id)
}

/**
 * Select a balanced subset of problems for a full assessment.
 *
 * Strategy: for each sub-skill, pick up to `perSubSkill` problems using
 * round-robin across problem_type (procedural → conceptual → applied) so
 * the learner sees a mix rather than all of one kind clustered together.
 * Within each type, easier problems come first.
 *
 * Deterministic — same bank yields same selection. If we want per-learner
 * variation later, seed a PRNG and shuffle within each type. For v1 the
 * stability is a feature (easy to reason about during the pilot).
 */
export function selectProblems(targetCount = 20): Problem[] {
  const bySubSkill = new Map<string, Problem[]>()
  for (const p of problemBank.problems) {
    if (!bySubSkill.has(p.sub_skill_id)) bySubSkill.set(p.sub_skill_id, [])
    bySubSkill.get(p.sub_skill_id)!.push(p)
  }

  const subSkillIds = [...bySubSkill.keys()].sort()
  const perSubSkill = Math.max(2, Math.ceil(targetCount / subSkillIds.length))

  const selected: Problem[] = []
  for (const ss of subSkillIds) {
    selected.push(...pickFromSubSkill(bySubSkill.get(ss)!, perSubSkill))
  }
  return selected
}

function pickFromSubSkill(pool: Problem[], count: number): Problem[] {
  const types: ProblemType[] = ['procedural', 'conceptual', 'applied']
  const byType: Record<ProblemType, Problem[]> = {
    procedural: [],
    conceptual: [],
    applied: [],
  }
  for (const p of pool) {
    byType[p.problem_type].push(p)
  }
  for (const t of types) {
    byType[t].sort((a, b) => a.difficulty - b.difficulty)
  }

  const picked: Problem[] = []
  let progress = true
  while (picked.length < count && progress) {
    progress = false
    for (const t of types) {
      if (picked.length >= count) break
      const next = byType[t].shift()
      if (next) {
        picked.push(next)
        progress = true
      }
    }
  }
  return picked
}
