import problemBankRaw from '@/content/fractions-problem-bank.json'
import type { PieceDenominator } from '@/components/fraction-workspace/types'

export type ProblemType =
  | 'partition_target'
  | 'build_fraction'
  | 'identify_fraction'
  | 'place_on_number_line'
  | 'equivalent_fractions'
  | 'compare_fractions'

export type TargetShape = 'bar' | 'circle' | 'number_line' | 'set_of_objects'

export interface Problem {
  id: string
  ccss_standard_ids: string[]
  target_misconception_ids: string[]
  problem_type: ProblemType
  target_shape: TargetShape
  /** Number of whole units the target represents. 1 for standard < 1 fractions,
   *  > 1 for improper / whole-number-as-fraction problems (e.g. 5/4 → 2). */
  target_whole_value: number
  available_denominators: PieceDenominator[]
  /** Shape depends on problem_type — see the JSON for details. */
  goal: unknown
  real_world_context?: { scenario: string | null; framing_text: string } | null
  difficulty: number
  show_your_work_note?: string
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
 * Strategy: for each primary CCSS standard, round-robin across the 6
 * problem_types to keep the learner seeing variety rather than clustered
 * repeats. Within a problem_type pool, easier problems come first.
 *
 * A problem's "primary standard" is its first entry in ccss_standard_ids.
 * Deterministic — same bank yields same selection.
 *
 * v1: `preferSupported` filters to problem_types the UI can currently render
 * (today: only build_fraction). Set to false to get the full selection once
 * all problem_types have UI support.
 */
export function selectProblems(options?: {
  targetCount?: number
  preferSupported?: boolean
  supportedTypes?: ProblemType[]
}): Problem[] {
  const targetCount = options?.targetCount ?? 16
  const supportedTypes = options?.supportedTypes ?? ['build_fraction']
  const preferSupported = options?.preferSupported ?? true

  const pool = preferSupported
    ? problemBank.problems.filter((p) => supportedTypes.includes(p.problem_type))
    : problemBank.problems

  const byStandard = new Map<string, Problem[]>()
  for (const p of pool) {
    const primary = p.ccss_standard_ids[0] ?? 'unknown'
    if (!byStandard.has(primary)) byStandard.set(primary, [])
    byStandard.get(primary)!.push(p)
  }

  const standardIds = [...byStandard.keys()].sort()
  const perStandard = Math.max(1, Math.ceil(targetCount / Math.max(1, standardIds.length)))

  const selected: Problem[] = []
  for (const sid of standardIds) {
    const group = byStandard.get(sid)!
    group.sort((a, b) => a.difficulty - b.difficulty)
    selected.push(...group.slice(0, perStandard))
  }
  return selected.slice(0, targetCount)
}
