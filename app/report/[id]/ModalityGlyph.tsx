/**
 * Steampunk modality glyphs — inline SVG. No emojis, no external icons.
 *
 *   - video               → camera-obscura lens (Victorian projection era)
 *   - game_or_interactive → brass dial / clockwork chronograph
 *   - manipulative        → handcrafted gear-and-hand
 *   - worksheet           → quill on parchment
 */

type Modality = 'video' | 'game_or_interactive' | 'manipulative' | 'worksheet' | string

interface Props {
  modality: Modality
  className?: string
}

export default function ModalityGlyph({ modality, className }: Props) {
  const cls = className ?? 'h-5 w-5'
  switch (modality) {
    case 'video':
      // Camera obscura — round body with iris diaphragm + tripod legs.
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          {/* Lens body */}
          <circle cx="12" cy="11" r="6" />
          {/* Iris segments */}
          <path d="M12 5 L 14.5 8.5 L 17 8 L 16.5 11" strokeWidth="0.9" opacity="0.7" />
          <path d="M12 5 L 9.5 8.5 L 7 8 L 7.5 11" strokeWidth="0.9" opacity="0.7" />
          <path d="M12 17 L 9.5 13.5 L 7 14 L 7.5 11" strokeWidth="0.9" opacity="0.7" />
          <path d="M12 17 L 14.5 13.5 L 17 14 L 16.5 11" strokeWidth="0.9" opacity="0.7" />
          {/* Inner pupil */}
          <circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none" />
          {/* Tripod */}
          <path d="M8 18 L 6 22 M16 18 L 18 22 M12 17 L 12 22" strokeWidth="1" />
        </svg>
      )

    case 'game_or_interactive':
      // Clockwork dial — outer ring with hour marks + central pointer
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="6" strokeWidth="0.8" opacity="0.6" />
          {/* Hour ticks */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2
            const r1 = 7.3
            const r2 = 8.4
            const x1 = 12 + r1 * Math.cos(a)
            const y1 = 12 + r1 * Math.sin(a)
            const x2 = 12 + r2 * Math.cos(a)
            const y2 = 12 + r2 * Math.sin(a)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.8" />
          })}
          {/* Pointer */}
          <line x1="12" y1="12" x2="12" y2="6.5" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="12" y1="12" x2="15.5" y2="12" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      )

    case 'manipulative':
      // Brass gear with one tooth showing — hands-on / mechanical metaphor
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          {/* Gear silhouette: 8 teeth */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2
            const tx = 12 + 9 * Math.cos(a)
            const ty = 12 + 9 * Math.sin(a)
            return <rect key={i} x={tx - 1.4} y={ty - 1.4} width="2.8" height="2.8" transform={`rotate(${(i / 8) * 360} ${tx} ${ty})`} />
          })}
          <circle cx="12" cy="12" r="6.2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
      )

    case 'worksheet':
      // Quill on parchment — feather + ink lines
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
          {/* Parchment */}
          <path d="M5 4 L 17 4 L 19 7 L 19 21 L 5 21 Z" />
          {/* Lines of writing */}
          <line x1="7" y1="9" x2="14" y2="9" strokeWidth="0.9" />
          <line x1="7" y1="12" x2="16" y2="12" strokeWidth="0.9" />
          <line x1="7" y1="15" x2="13" y2="15" strokeWidth="0.9" />
          {/* Quill — diagonal feather emerging from the corner */}
          <path d="M16 6 Q 21 1.5 21 5 Q 21 8 17 9" strokeWidth="1.1" />
          <path d="M18.5 5 Q 19 6 18.4 6.5 M19.5 4.5 Q 20 5.5 19.4 6" strokeWidth="0.7" opacity="0.7" />
        </svg>
      )

    default:
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}

export function modalityLabel(modality: Modality): string {
  switch (modality) {
    case 'video':
      return 'Video'
    case 'game_or_interactive':
      return 'Interactive'
    case 'manipulative':
      return 'Hands-on'
    case 'worksheet':
      return 'Worksheet'
    default:
      return modality
  }
}
