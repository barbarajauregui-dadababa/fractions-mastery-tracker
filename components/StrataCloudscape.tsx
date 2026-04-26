/**
 * Shared visual: the 5 4th-grade Progressions as cloud strata, with
 * the Denis cloudscape painting as full-bleed backdrop. Used as:
 *   - Left half of the Mastery Voyage page
 *   - Hero image at the top of the Mastery Report (replacing the old
 *     5-box strip)
 *
 * Active stratum (4.NF) is brass-bordered parchment with a glow shadow.
 * Other strata read as dim "coming in v1.5" placeholders.
 */
import Image from 'next/image'
import OldPhotoBalloon from './OldPhotoBalloon'

type StandardState = 'misconception' | 'working' | 'demonstrated' | 'not_assessed'

interface ProgressionDef {
  code: string
  name: string
  status: 'active' | 'v15'
  index: number
}

const PROGRESSIONS: ProgressionDef[] = [
  { code: '4.G', name: 'Geometry', status: 'v15', index: 5 },
  { code: '4.MD', name: 'Measurement & Data', status: 'v15', index: 4 },
  { code: '4.NF', name: 'Number & Operations — Fractions', status: 'active', index: 3 },
  { code: '4.OA', name: 'Operations & Algebraic Thinking', status: 'v15', index: 2 },
  { code: '4.NBT', name: 'Number & Operations in Base Ten', status: 'v15', index: 1 },
]

interface Props {
  masteryMap: { standards: Record<string, { state: StandardState }> } | null
  /** Compact mode for the report page: shorter strata, smaller balloon, no apex/foundation labels. */
  compact?: boolean
  /** Show the balloon at the active stratum. Defaults true. */
  showBalloon?: boolean
  /** Optional child rendered at the bottom-right inside the panel — used by
   *  the report to embed the "Open mastery voyage →" link as a brass cartouche. */
  bottomRightSlot?: React.ReactNode
}

export default function StrataCloudscape({ masteryMap, compact = false, showBalloon = true, bottomRightSlot }: Props) {
  const counts = { demonstrated: 0, working: 0, misconception: 0, not_assessed: 0 }
  if (masteryMap?.standards) {
    for (const entry of Object.values(masteryMap.standards)) {
      counts[entry.state] = (counts[entry.state] ?? 0) + 1
    }
  }
  const totalProbed = counts.demonstrated + counts.working + counts.misconception
  const totalStandards = totalProbed + counts.not_assessed

  return (
    <section
      className="relative overflow-hidden rounded-sm border-2 border-brass-deep/50 vignette"
      style={{ minHeight: compact ? 360 : 720 }}
    >
      {/* Cloudscape painting full-bleed backdrop */}
      <div className="absolute inset-0">
        <Image
          src="/images/cloudscape-denis.jpg"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 600px"
          className="object-cover"
          style={{ filter: 'sepia(0.15) brightness(1.05) contrast(1.05)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.30 0.04 230 / 0.45) 0%, oklch(0.40 0.06 220 / 0.30) 30%, oklch(0.45 0.05 75 / 0.20) 60%, oklch(0.20 0.05 50 / 0.55) 92%, oklch(0.13 0.014 50 / 0.85) 100%)',
          }}
        />
      </div>

      {!compact && (
        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
          <p
            className="text-xs tracking-[0.4em] uppercase text-cream-soft"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Apex of the voyage
          </p>
        </div>
      )}

      <ol className={`relative z-10 flex flex-col gap-1 px-4 sm:px-8 ${compact ? 'pt-6 pb-6' : 'pt-16 pb-32'}`}>
        {PROGRESSIONS.map((p) => (
          <ProgressionStratum
            key={p.code}
            progression={p}
            compact={compact}
            counts={p.code === '4.NF' ? counts : null}
            totalProbed={p.code === '4.NF' ? totalProbed : 0}
            totalStandards={p.code === '4.NF' ? totalStandards : 0}
          />
        ))}
      </ol>

      {showBalloon && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20"
          style={{ width: compact ? 110 : 150, top: compact ? '36%' : '40%' }}
        >
          {/* Compact (report page): old-photo treatment, rises slowly.
              Non-compact (voyage left, currently unused): same treatment but
              hidden on the voyage anyway via showBalloon=false. */}
          <OldPhotoBalloon
            size={compact ? 110 : 150}
            tilt={-2}
            motion="rise"
            showCaption={false}
          />
        </div>
      )}

      {!compact && (
        <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
          <p
            className="text-xs tracking-[0.4em] uppercase text-cream-faint"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            ◇ Foundation ◇
          </p>
        </div>
      )}

      {bottomRightSlot && (
        <div className="absolute bottom-3 right-3 z-30">{bottomRightSlot}</div>
      )}
    </section>
  )
}

function ProgressionStratum({
  progression,
  compact,
  counts,
  totalProbed,
  totalStandards,
}: {
  progression: ProgressionDef
  compact: boolean
  counts: { demonstrated: number; working: number; misconception: number; not_assessed: number } | null
  totalProbed: number
  totalStandards: number
}) {
  const active = progression.status === 'active'
  return (
    <li
      className={`relative flex items-center gap-3 px-3 ${compact ? 'py-2' : 'py-5 sm:py-6'} rounded-sm transition-colors ${
        active
          ? 'border-2 border-brass-glow bg-paper/85 backdrop-blur-sm shadow-[0_0_25px_oklch(0.74_0.14_80/0.45)]'
          : 'border border-cream-faint/30 bg-background/40 backdrop-blur-sm opacity-70'
      }`}
    >
      <div className="flex flex-col items-center justify-center min-w-[48px]">
        <span
          className={`${compact ? 'text-xs' : 'text-xs'} ${active ? 'text-brass-deep' : 'text-cream-faint'}`}
          style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.12em' }}
        >
          {progression.code}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={`${compact ? 'text-sm' : 'text-base sm:text-lg'} leading-snug ${
            active ? 'text-ink' : 'text-cream-soft'
          }`}
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600 }}
        >
          {progression.name}
        </h3>
        {!compact && active && counts ? (
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-ink-soft"
            style={{ fontFamily: 'var(--font-fraunces)' }}
          >
            <CountChip label="Mastered" value={counts.demonstrated} colorClass="bg-emerald-600" />
            <CountChip label="Needs work" value={counts.working} colorClass="bg-amber-600" />
            <CountChip label="Needs attention" value={counts.misconception} colorClass="bg-red-600" />
            <CountChip label="Not yet probed" value={counts.not_assessed} colorClass="bg-stone-400" />
          </div>
        ) : !compact ? (
          <p
            className="mt-1 text-xs italic text-cream-faint tracking-[0.15em] uppercase"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            Coming in v1.5
          </p>
        ) : null}
        {!compact && active && totalProbed > 0 && (
          <p
            className="mt-1 text-xs text-ink-faint italic"
            style={{ fontFamily: 'var(--font-special-elite)' }}
          >
            {totalProbed} of {totalStandards} standards probed so far.
          </p>
        )}
      </div>
    </li>
  )
}

function CountChip({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${colorClass}`} aria-hidden />
      <span className="text-ink-soft">
        <strong className="text-ink">{value}</strong> {label.toLowerCase()}
      </span>
    </span>
  )
}
