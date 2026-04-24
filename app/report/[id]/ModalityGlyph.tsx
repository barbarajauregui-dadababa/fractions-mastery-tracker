type Modality = 'video' | 'game_or_interactive' | 'manipulative' | 'worksheet' | string

interface Props {
  modality: Modality
  className?: string
}

export default function ModalityGlyph({ modality, className }: Props) {
  const cls = className ?? 'h-5 w-5'
  switch (modality) {
    case 'video':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M10 9.5v5l5-2.5z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'game_or_interactive':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M3 17l2 3h14l2-3" />
        </svg>
      )
    case 'manipulative':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M8 11V6a2 2 0 0 1 4 0v4" />
          <path d="M12 10V5.5a2 2 0 0 1 4 0V12" />
          <path d="M16 11V7.5a2 2 0 0 1 4 0v7c0 3.5-2.5 6.5-6 6.5h-3a5 5 0 0 1-4-2.3L4 15a2 2 0 0 1 3.2-2.4L8 13.5V8a2 2 0 1 1 4 0" />
        </svg>
      )
    case 'worksheet':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v5h5" />
          <path d="M8 13h8M8 17h5" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} stroke="currentColor" strokeWidth="1.75" aria-hidden>
          <circle cx="12" cy="12" r="8" />
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
