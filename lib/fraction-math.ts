export interface Fraction {
  numerator: number
  denominator: number
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return a
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return Math.abs(a * b) / gcd(a, b)
}

export function reduceFraction(f: Fraction): Fraction {
  if (f.numerator === 0) return { numerator: 0, denominator: 1 }
  const g = gcd(f.numerator, f.denominator)
  return { numerator: f.numerator / g, denominator: f.denominator / g }
}

/**
 * Given a set of placed unit-fraction pieces (each represented by its
 * denominator — the piece 1/d), sum them as a single fraction using the
 * LCD. Returns reduced form. If no pieces placed, returns 0/1.
 */
export function sumPieces(denominators: number[]): Fraction {
  if (denominators.length === 0) return { numerator: 0, denominator: 1 }
  const lcd = denominators.reduce((acc, d) => lcm(acc, d), 1)
  const num = denominators.reduce((acc, d) => acc + lcd / d, 0)
  return reduceFraction({ numerator: num, denominator: lcd })
}

export function fractionsEqual(a: Fraction, b: Fraction): boolean {
  const ar = reduceFraction(a)
  const br = reduceFraction(b)
  return ar.numerator === br.numerator && ar.denominator === br.denominator
}

export function fractionToDecimal(f: Fraction): number {
  return f.numerator / f.denominator
}

export type CommitResult = 'success' | 'gap' | 'overhang'

/**
 * Check whether a built collection matches the goal fraction. "gap" means
 * the learner has too little (short of the goal); "overhang" means too
 * much (past the goal).
 */
export function checkMatch(denominators: number[], goal: Fraction): CommitResult {
  const sum = sumPieces(denominators)
  const epsilon = 1e-9
  const sumDec = fractionToDecimal(sum)
  const goalDec = fractionToDecimal(goal)
  if (Math.abs(sumDec - goalDec) < epsilon) return 'success'
  if (sumDec < goalDec) return 'gap'
  return 'overhang'
}
