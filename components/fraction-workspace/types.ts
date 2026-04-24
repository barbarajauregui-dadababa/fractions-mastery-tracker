import type { Fraction } from '@/lib/fraction-math'

export type PieceDenominator = 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

export interface PlacedPiece {
  /** Unique per placement (timestamp + random). Used as a React key and for telemetry. */
  id: string
  denominator: PieceDenominator
}

/** Event the workspace emits; caller persists to Supabase at commit time. */
export type TelemetryEvent =
  | { type: 'placement'; t: number; denominator: number; placed_count_after: number }
  | { type: 'removal'; t: number; denominator: number; placed_count_after: number }
  | { type: 'commit_attempt'; t: number; placed: number[]; result: 'success' | 'gap' | 'overhang' }

export interface BuildFractionProblem {
  id: string
  problem_type: 'build_fraction'
  target_shape: 'bar'
  goal: Fraction
  available_denominators: PieceDenominator[]
  framing_text?: string
}
