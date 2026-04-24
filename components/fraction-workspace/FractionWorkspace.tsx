'use client'

import { useCallback, useState } from 'react'
import { checkMatch, sumPieces, type Fraction } from '@/lib/fraction-math'
import type {
  BuildFractionProblem,
  PieceDenominator,
  PlacedPiece,
  TelemetryEvent,
} from './types'

/** Pixel width representing one whole unit. Multi-unit targets (goal > 1)
 *  render numWholes separate rounded rectangles with WHOLE_GAP_PX between them. */
const WIDTH_PER_WHOLE_PX = 320
const WHOLE_GAP_PX = 16
const BAR_HEIGHT_PX = 64

const PIECE_COLORS: Record<PieceDenominator, string> = {
  1: 'bg-lime-500',
  2: 'bg-sky-400',
  3: 'bg-purple-400',
  4: 'bg-emerald-400',
  5: 'bg-pink-400',
  6: 'bg-orange-400',
  8: 'bg-amber-400',
  10: 'bg-rose-400',
  12: 'bg-teal-400',
}

const PIECE_BORDER: Record<PieceDenominator, string> = {
  1: 'border-lime-700',
  2: 'border-sky-600',
  3: 'border-purple-600',
  4: 'border-emerald-600',
  5: 'border-pink-600',
  6: 'border-orange-600',
  8: 'border-amber-600',
  10: 'border-rose-600',
  12: 'border-teal-600',
}

function pieceWidthPx(denominator: PieceDenominator): number {
  return WIDTH_PER_WHOLE_PX / denominator
}

function pieceLabel(denominator: PieceDenominator): string {
  return denominator === 1 ? '1' : `1/${denominator}`
}

function makePieceId(): string {
  return `p-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}`
}

interface PlacedPieceGeom extends PlacedPiece {
  /** Visual left offset accounting for inter-whole gaps. */
  leftPx: number
  widthPx: number
}

/**
 * Compute piece positions in logical "total content" coords, then shift by
 * the number of whole-boundaries crossed × WHOLE_GAP_PX to get visual coords.
 * Pieces may visually straddle a gap if their placement would cross a whole
 * boundary — that's a rare case (happens only with awkward piece combos) and
 * acceptable for v1 since the math still resolves correctly.
 */
function computePlacedGeometry(placed: PlacedPiece[]): PlacedPieceGeom[] {
  const result: PlacedPieceGeom[] = []
  let logicalOffset = 0
  for (const p of placed) {
    const widthPx = pieceWidthPx(p.denominator)
    const wholeIndex = Math.floor(logicalOffset / WIDTH_PER_WHOLE_PX)
    const visualLeft = logicalOffset + wholeIndex * WHOLE_GAP_PX
    result.push({ ...p, leftPx: visualLeft, widthPx })
    logicalOffset += widthPx
  }
  return result
}

interface Props {
  problem: BuildFractionProblem
  onCommitSuccess?: (telemetry: TelemetryEvent[]) => void
  /** Fired on every telemetry event — caller can persist to Supabase. */
  onTelemetryEvent?: (event: TelemetryEvent) => void
}

type DragState =
  | { origin: 'palette'; denominator: PieceDenominator; pointerId: number }

type CommitState = 'idle' | 'failed' | 'success'

export default function FractionWorkspace({ problem, onCommitSuccess, onTelemetryEvent }: Props) {
  const [startedAt] = useState<number>(() => Date.now())
  const [dropZoneEl, setDropZoneEl] = useState<HTMLDivElement | null>(null)

  const [placed, setPlaced] = useState<PlacedPiece[]>([])
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const [commitState, setCommitState] = useState<CommitState>('idle')
  const [commitBounceKey, setCommitBounceKey] = useState(0)
  const [commitAttempts, setCommitAttempts] = useState(0)
  const [telemetryLog, setTelemetryLog] = useState<TelemetryEvent[]>([])

  const numWholes = Math.max(1, problem.target_whole_value ?? 1)
  const wholesTotalPx = WIDTH_PER_WHOLE_PX * numWholes
  const wholesVisualWidthPx = wholesTotalPx + (numWholes - 1) * WHOLE_GAP_PX
  const locked = commitState !== 'idle'

  const logEvent = useCallback(
    (event: TelemetryEvent) => {
      setTelemetryLog((prev) => [...prev, event])
      onTelemetryEvent?.(event)
    },
    [onTelemetryEvent]
  )

  const isPointOverDropZone = useCallback(
    (x: number, y: number): boolean => {
      if (!dropZoneEl) return false
      const r = dropZoneEl.getBoundingClientRect()
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
    },
    [dropZoneEl]
  )

  const handlePalettePointerDown = useCallback(
    (e: React.PointerEvent, denominator: PieceDenominator) => {
      if (locked) return
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      setDrag({ origin: 'palette', denominator, pointerId: e.pointerId })
      setDragPos({ x: e.clientX, y: e.clientY })
    },
    [locked]
  )

  const handlePalettePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      setDragPos({ x: e.clientX, y: e.clientY })
    },
    [drag]
  )

  const handlePalettePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!drag) return
      const overDrop = isPointOverDropZone(e.clientX, e.clientY)
      ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      if (overDrop && !locked) {
        const newPiece: PlacedPiece = { id: makePieceId(), denominator: drag.denominator }
        const next = [...placed, newPiece]
        setPlaced(next)
        logEvent({
          type: 'placement',
          t: Date.now() - startedAt,
          denominator: drag.denominator,
          placed_count_after: next.length,
        })
      }
      setDrag(null)
      setDragPos(null)
    },
    [drag, isPointOverDropZone, placed, logEvent, startedAt, locked]
  )

  const removePlaced = useCallback(
    (pieceId: string) => {
      if (locked) return
      const piece = placed.find((p) => p.id === pieceId)
      if (!piece) return
      const next = placed.filter((p) => p.id !== pieceId)
      setPlaced(next)
      logEvent({
        type: 'removal',
        t: Date.now() - startedAt,
        denominator: piece.denominator,
        placed_count_after: next.length,
      })
    },
    [locked, placed, logEvent, startedAt]
  )

  const handleCommit = useCallback(() => {
    if (locked || placed.length === 0) return
    const result = checkMatch(
      placed.map((p) => p.denominator),
      problem.goal
    )
    const commitEvent: TelemetryEvent = {
      type: 'commit_attempt',
      t: Date.now() - startedAt,
      placed: placed.map((p) => p.denominator),
      result,
    }
    logEvent(commitEvent)
    setCommitAttempts((n) => n + 1)
    if (result === 'success') {
      setCommitState('success')
      onCommitSuccess?.([...telemetryLog, commitEvent])
    } else {
      setCommitState('failed')
      setCommitBounceKey((k) => k + 1)
    }
  }, [locked, placed, problem.goal, startedAt, logEvent, onCommitSuccess, telemetryLog])

  const handleTryAgain = useCallback(() => {
    logEvent({
      type: 'reset',
      t: Date.now() - startedAt,
      after_commit_attempt_number: commitAttempts,
    })
    setPlaced([])
    setCommitState('idle')
  }, [logEvent, startedAt, commitAttempts])

  // --- Rendering ---

  const placedWithGeom = computePlacedGeometry(placed)
  const totalFilledLogicalPx = placedWithGeom.reduce((acc, p) => acc + p.widthPx, 0)
  const overhangPx = Math.max(0, totalFilledLogicalPx - wholesTotalPx)
  const gapPx = Math.max(0, wholesTotalPx - totalFilledLogicalPx)

  const currentSum = sumPieces(placed.map((p) => p.denominator))

  // Rightmost extent any placed piece reaches, in visual pixels (for sizing
  // the container if pieces overhang).
  const lastPiece = placedWithGeom[placedWithGeom.length - 1]
  const rightmostVisualPx = lastPiece ? lastPiece.leftPx + lastPiece.widthPx : 0
  const containerWidthPx = Math.max(wholesVisualWidthPx, rightmostVisualPx) + 32

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      {problem.framing_text && (
        <p className="text-center text-zinc-700 dark:text-zinc-300 max-w-lg">
          {problem.framing_text}
        </p>
      )}

      <GoalDisplay goal={problem.goal} commitState={commitState} />

      <div
        key={commitBounceKey}
        className={commitState === 'failed' ? 'animate-shake' : ''}
      >
        {/* Drop zone — padded so pieces can land past the rightmost whole too.
            Explicit height because the children are all absolute-positioned and
            would otherwise collapse this div to zero height (making the drop-hit
            test succeed only in a tiny padding strip). */}
        <div
          ref={setDropZoneEl}
          className="relative px-4 py-3 rounded-lg"
          style={{ width: containerWidthPx, height: BAR_HEIGHT_PX + 24 }}
        >
          {/* Whole-unit rectangles, side by side with gaps between them. */}
          {Array.from({ length: numWholes }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-md border-2 border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-900"
              style={{
                left: 16 + i * (WIDTH_PER_WHOLE_PX + WHOLE_GAP_PX),
                top: 12,
                width: WIDTH_PER_WHOLE_PX,
                height: BAR_HEIGHT_PX,
              }}
            />
          ))}

          {/* Placed pieces — positioned in visual coords above the whole rects. */}
          {placedWithGeom.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => removePlaced(p.id)}
              aria-label={`${pieceLabel(p.denominator)} piece. Click to remove.`}
              title="Click to remove"
              className={`absolute rounded-sm border-2 ${PIECE_COLORS[p.denominator]} ${PIECE_BORDER[p.denominator]} flex items-center justify-center text-xs font-bold text-white drop-shadow ${locked ? 'cursor-default' : 'hover:brightness-110 hover:ring-2 hover:ring-rose-400 cursor-pointer'} transition`}
              style={{
                left: p.leftPx + 16,
                top: 12,
                width: p.widthPx,
                height: BAR_HEIGHT_PX,
              }}
              disabled={locked}
            >
              {pieceLabel(p.denominator)}
            </button>
          ))}
        </div>
        <div className="h-5 mt-2 flex items-center justify-center">
          {overhangPx > 0 && commitState !== 'success' && (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Your pieces go past {numWholes === 1 ? 'the whole' : `${numWholes} wholes`}.
            </p>
          )}
          {overhangPx === 0 && gapPx > 0 && placed.length > 0 && commitState !== 'success' && (
            <p className="text-xs text-zinc-500">A gap remains.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {commitState === 'idle' && (
          <button
            type="button"
            onClick={handleCommit}
            disabled={placed.length === 0}
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Check my answer
          </button>
        )}
        {commitState === 'failed' && (
          <>
            <p className="text-sm text-rose-700 dark:text-rose-300">
              Not quite. Want to try a different way?
            </p>
            <button
              type="button"
              onClick={handleTryAgain}
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Try again
            </button>
            <p className="text-xs text-zinc-500 mt-1">
              Or use Next below to move on. Your thinking on this problem is saved either way.
            </p>
          </>
        )}
        {commitState === 'success' && (
          <p className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950 px-6 text-sm font-medium text-emerald-900 dark:text-emerald-200">
            Locked in ✓
          </p>
        )}
      </div>

      <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Pieces</p>
        <div className="flex flex-wrap items-end justify-center gap-3">
          {problem.available_denominators.map((d) => (
            <button
              key={d}
              type="button"
              onPointerDown={(e) => handlePalettePointerDown(e, d)}
              onPointerMove={handlePalettePointerMove}
              onPointerUp={handlePalettePointerUp}
              disabled={locked}
              className={`rounded-sm border-2 ${PIECE_COLORS[d]} ${PIECE_BORDER[d]} h-10 flex items-center justify-center text-xs font-bold text-white drop-shadow cursor-grab active:cursor-grabbing touch-none disabled:opacity-40`}
              style={{ width: pieceWidthPx(d) }}
              aria-label={`Drag a ${pieceLabel(d)} piece`}
            >
              {pieceLabel(d)}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          {locked
            ? commitState === 'success'
              ? 'Locked in. Use Next below to move on.'
              : 'Pieces are locked. Try again to clear and start over, or use Next.'
            : 'Drag a piece into the bar. Click a placed piece to remove it.'}
        </p>
      </div>

      <details className="w-full text-xs text-zinc-500 mt-2">
        <summary className="cursor-pointer">Debug (current state)</summary>
        <div className="mt-2 space-y-1">
          <div>
            Sum: {currentSum.numerator}/{currentSum.denominator}
          </div>
          <div>
            Placed: [{placed.map((p) => pieceLabel(p.denominator)).join(', ')}]
          </div>
          <div>Target wholes: {numWholes}</div>
          <div>Commit attempts: {commitAttempts}</div>
          <div>Events: {telemetryLog.length}</div>
        </div>
      </details>

      {drag && dragPos && (
        <div
          className={`fixed pointer-events-none z-50 rounded-sm border-2 ${PIECE_COLORS[drag.denominator]} ${PIECE_BORDER[drag.denominator]} h-10 flex items-center justify-center text-xs font-bold text-white shadow-lg`}
          style={{
            width: pieceWidthPx(drag.denominator),
            left: dragPos.x - pieceWidthPx(drag.denominator) / 2,
            top: dragPos.y - 20,
          }}
        >
          {pieceLabel(drag.denominator)}
        </div>
      )}
    </div>
  )
}

function GoalDisplay({
  goal,
  commitState,
}: {
  goal: Fraction
  commitState: CommitState
}) {
  const ring =
    commitState === 'success'
      ? 'ring-4 ring-emerald-400'
      : commitState === 'failed'
      ? 'ring-4 ring-rose-400'
      : 'ring-2 ring-zinc-300 dark:ring-zinc-700'
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-wide text-zinc-500">Goal</span>
      <div
        className={`rounded-md bg-white dark:bg-zinc-950 px-6 py-3 ${ring} transition-all`}
      >
        <div className="flex flex-col items-center leading-none">
          <span className="text-3xl font-semibold">{goal.numerator}</span>
          <span className="w-10 border-t-2 border-zinc-700 dark:border-zinc-300 my-1" />
          <span className="text-3xl font-semibold">{goal.denominator}</span>
        </div>
      </div>
    </div>
  )
}
