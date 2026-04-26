import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-welcome'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  let body: { learner_id?: unknown; learner_name?: unknown; email?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body.learner_id !== 'string' || body.learner_id.length === 0) {
    return NextResponse.json({ error: 'learner_id required' }, { status: 400 })
  }
  if (typeof body.learner_name !== 'string' || body.learner_name.length === 0) {
    return NextResponse.json({ error: 'learner_name required' }, { status: 400 })
  }
  if (
    typeof body.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)
  ) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 })
  }

  const result = await sendWelcomeEmail({
    learnerId: body.learner_id,
    learnerName: body.learner_name,
    email: body.email.toLowerCase().trim(),
  })

  return NextResponse.json(result)
}
