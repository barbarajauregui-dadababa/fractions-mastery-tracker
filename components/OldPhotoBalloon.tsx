/**
 * The Marquis de Brantes 1784 aerostat dressed up as an old photograph:
 *   - cream paper backing with a thin brown trim
 *   - drop shadow as if lying on a surface
 *   - sepia filter on the image
 *   - small typewriter-style caption beneath the image
 *
 * Optional props:
 *   - tilt: degrees of rotation (e.g. -3 for "casually placed")
 *   - motion: 'static' | 'rise' — 'rise' applies the slow up-and-back
 *     animation defined in globals.css (animate-rise-slow). The animation
 *     uses the individual translate property so it doesn't fight a parent
 *     rotate.
 *   - size: max width in px (defaults to 360)
 *   - showCaption: hide caption when used in tight spaces
 */
import Image from 'next/image'

interface Props {
  tilt?: number
  motion?: 'static' | 'rise'
  size?: number
  showCaption?: boolean
  className?: string
}

export default function OldPhotoBalloon({
  tilt = 0,
  motion = 'static',
  size = 360,
  showCaption = true,
  className,
}: Props) {
  // Outer wrapper handles rotation; inner wrapper handles motion. This way
  // the rotate transform doesn't get clobbered when motion translates.
  const animationClass = motion === 'rise' ? 'animate-rise-slow' : ''

  return (
    <div
      className={className}
      style={{
        rotate: tilt ? `${tilt}deg` : undefined,
        maxWidth: size,
        margin: '0 auto',
      }}
    >
      <div
        className={animationClass}
        style={{
          background: 'oklch(0.93 0.025 78)',
          padding: showCaption ? '14px 14px 32px 14px' : '12px',
          boxShadow:
            '0 14px 30px oklch(0 0 0 / 0.45), 0 3px 6px oklch(0 0 0 / 0.30), inset 0 0 0 1px oklch(0.55 0.05 75)',
          borderRadius: 2,
        }}
      >
        <div className="relative w-full" style={{ aspectRatio: '270 / 447' }}>
          <Image
            src="/images/balloon-flying.jpg"
            alt="Aérostat of the Marquis de Brantes, 1784"
            fill
            sizes={`${size}px`}
            className="object-contain"
            style={{
              filter: 'sepia(0.55) brightness(0.97) contrast(1.05)',
            }}
          />
        </div>
        {showCaption && (
          <p
            className="text-center mt-2 text-[11px] tracking-[0.18em] uppercase"
            style={{
              fontFamily: 'var(--font-special-elite)',
              color: 'oklch(0.42 0.04 60)',
            }}
          >
            Aérostat — Brantes, 1784
          </p>
        )}
      </div>
    </div>
  )
}
