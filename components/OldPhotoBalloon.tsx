/**
 * The Marquis de Brantes 1784 aerostat as a fully-baked aged photograph
 * (cream paper, distressed darkened edges, sepia tones — all in the image
 * itself, no CSS frame on top).
 *
 *   - tilt: degrees of rotation (e.g. -3 for "casually placed on a desk")
 *   - motion: 'static' | 'rise' — 'rise' applies the slow up-and-back
 *     animation defined in globals.css. Uses individual CSS `translate`
 *     so it composes cleanly with the parent rotate.
 *   - size: max width in px (defaults to 360)
 */
import Image from 'next/image'

interface Props {
  tilt?: number
  motion?: 'static' | 'rise'
  size?: number
  className?: string
}

export default function OldPhotoBalloon({
  tilt = 0,
  motion = 'static',
  size = 360,
  className,
}: Props) {
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
          filter: 'drop-shadow(0 12px 26px oklch(0 0 0 / 0.40)) drop-shadow(0 3px 6px oklch(0 0 0 / 0.30))',
        }}
      >
        <Image
          src="/images/balloon-old-photo.png"
          alt="Aérostat of the Marquis de Brantes, 1784 — aged photograph"
          width={1045}
          height={1505}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  )
}
