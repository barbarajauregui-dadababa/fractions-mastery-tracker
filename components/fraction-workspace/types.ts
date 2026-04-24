import type { Fraction } from '@/lib/fraction-math'

/**
 * Piece denominators the UI can render. 1 = a whole-unit piece (used for
 * problems where the goal is a whole number as a fraction, e.g. 3/1).
 */
export type PieceDenominator = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

export interface PlacedPiece {
  /** Unique per placement (random). Used as a React key and for telemetry. */
  id: string
  denominator: PieceDenominator
}

/** Event the workspace emits; caller persists to Supabase at commit time. */
export type TelemetryEvent =
  | { type: 'placement'; t: number; denominator: number; placed_count_after: number }
  | { type: 'removal'; t: number; denominator: number; placed_count_after: number }
  | { type: 'commit_attempt'; t: number; placed: number[]; result: 'success' | 'gap' | 'overhang' }
  /** Learner clicked "Try again" after a failed commit — workspace cleared. */
  | { type: 'reset'; t: number; after_commit_attempt_number: number }

export interface BuildFractionProblem {
  id: string
  problem_type: 'build_fraction'
  target_shape: 'bar'
  goal: Fraction
  available_denominators: PieceDenominator[]
  /** How many whole units the target represents. Default 1. For improper
   *  fractions (5/4) or whole-number fractions (3/1) this is 2 or 3 etc. */
  target_whole_value?: number
  framing_text?: string
}
