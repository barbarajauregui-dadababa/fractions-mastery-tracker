'use client'

import { useEffect, useRef, useState } from 'react'

export default function ResumeForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/resume-learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? `Something went wrong (${res.status})`)
        setIsSubmitting(false)
        return
      }
      setSent(true)
      setIsSubmitting(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-sm border-2 border-emerald-700 bg-emerald-50 p-5 flex flex-col gap-2">
        <p
          className="text-sm tracking-[0.25em] uppercase text-emerald-800 font-bold"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Check your inbox
        </p>
        <ul
          className="list-disc ml-5 space-y-1 text-sm text-ink-soft"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          <li>If a voyage is registered with that email, we&apos;ve sent you a link.</li>
          <li>The email may take up to a minute to arrive. Check your Spam folder.</li>
          <li>
            If nothing arrives, the email may not be registered. You can{' '}
            <a href="/setup" className="text-copper hover:text-brass-deep underline underline-offset-2">
              start a new voyage
            </a>{' '}
            instead.
          </li>
        </ul>
      </div>
    )
  }

  const canSubmit =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && !isSubmitting

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span
          className="text-sm tracking-[0.18em] uppercase text-brass-deep font-bold"
          style={{ fontFamily: 'var(--font-cinzel)' }}
        >
          Your email
        </span>
        <input
          ref={inputRef}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12 rounded-sm border-2 border-brass-deep/60 bg-paper text-ink px-3 text-base focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/40 placeholder:text-ink-faint"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        />
        <span
          className="text-xs text-ink-faint italic"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          The email used when the voyage was set up.
        </span>
      </label>

      {error && (
        <div
          className="rounded-sm border-2 border-red-700/50 bg-red-50 px-4 py-3 text-sm text-red-800"
          style={{ fontFamily: 'var(--font-fraunces)' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-11 items-center justify-center rounded-sm bg-brass-deep px-7 text-xs font-bold uppercase text-cream hover:bg-brass disabled:opacity-50 transition-colors w-fit border border-brass shadow-[0_0_15px_oklch(0.74_0.14_80/0.4)]"
        style={{ fontFamily: 'var(--font-cinzel)', letterSpacing: '0.18em' }}
      >
        {isSubmitting ? 'Sending…' : 'Send me my voyages ◇'}
      </button>
    </form>
  )
}
