import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAllProblems } from '@/lib/problem-selection'
import { ANALYSIS_SYSTEM_PROMPT, ANALYSIS_USER_INSTRUCTIONS } from '@/lib/analysis-prompt'
import coherenceMapRaw from '@/content/coherence-map-fractions.json'
import misconceptionsRaw from '@/content/fractions-misconceptions.json'
import type { TelemetryEvent } from '@/components/fraction-workspace/types'

// Opus is the premium tier; 10–25 sec typical runtime. Raise Vercel timeout
// so the synchronous fetch doesn't get cut off on slow analyses.
export const maxDuration = 60

interface StoredResponse {
  problem_id: string
  problem_type: string
  telemetry: TelemetryEvent[]
  committed_success: boolean
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set on server' }, { status: 500 })
  }

  let body: { assessment_id?: string; parent_assessment_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  const assessmentId = body.assessment_id
  const parentAssessmentId = body.parent_assessment_id
  if (!assessmentId) {
    return NextResponse.json({ error: 'assessment_id required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: assessment, error: fetchError } = await supabase
    .from('assessments')
    .select('id, completed_at, responses')
    .eq('id', assessmentId)
    .single()
  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'assessment not found' }, { status: 404 })
  }
  if (!assessment.completed_at) {
    return NextResponse.json({ error: 'assessment not yet completed' }, { status: 400 })
  }

  const responses = (assessment.responses as StoredResponse[] | null) ?? []
  if (responses.length === 0) {
    return NextResponse.json({ error: 'assessment has no responses' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })

  // Cache breakpoint strategy: system prompt + full problem bank + misconceptions +
  // Coherence Map are stable across every analysis call. One ephemeral breakpoint
  // at the end of the system array caches all four so subsequent analyses pay
  // ~10% of the cached-input cost.

  const problemBank = getAllProblems()
  const coherenceMap = coherenceMapRaw as unknown as {
    nodes: Array<{ id: string; statement: string; cluster_heading?: string }>
  }
  const standardIds = coherenceMap.nodes.map((n) => n.id)

  const apiResponse = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4000,
    system: [
      { type: 'text', text: ANALYSIS_SYSTEM_PROMPT },
      {
        type: 'text',
        text: `PROBLEM BANK (reference):\n${JSON.stringify(problemBank, null, 2)}`,
      },
      {
        type: 'text',
        text: `MISCONCEPTION TAXONOMY (reference):\n${JSON.stringify(misconceptionsRaw, null, 2)}`,
      },
      {
        type: 'text',
        text: `COHERENCE MAP SUBGRAPH (reference — CCSS standards covered by this assessment):\n${JSON.stringify(coherenceMap, null, 2)}`,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `LEARNER RESPONSES (telemetry-based):
${JSON.stringify(responses, null, 2)}

SUB-SKILL LIST — produce an entry for each, using CCSS standard IDs as keys:
${JSON.stringify(standardIds)}

${ANALYSIS_USER_INSTRUCTIONS}`,
      },
    ],
  })

  const firstBlock = apiResponse.content[0]
  if (!firstBlock || firstBlock.type !== 'text') {
    return NextResponse.json({ error: 'unexpected response format from model' }, { status: 500 })
  }

  let jsonText = firstBlock.text.trim()
  // Defensively strip markdown code fences if the model wraps its output.
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '')
  }

  let masteryMap: unknown
  try {
    masteryMap = JSON.parse(jsonText)
  } catch {
    return NextResponse.json(
      { error: 'model returned invalid JSON', raw: firstBlock.text.slice(0, 500) },
      { status: 500 }
    )
  }

  const { error: updateError } = await supabase
    .from('assessments')
    .update({ mastery_map: masteryMap })
    .eq('id', assessmentId)
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Focused-probe flow: merge the probe's findings back into the parent
  // assessment's mastery map. Only overwrite standards the probe actually
  // assessed (state !== 'not_assessed') so we don't wipe out unrelated ones.
  let parentMerged = false
  if (parentAssessmentId) {
    const { data: parent } = await supabase
      .from('assessments')
      .select('mastery_map')
      .eq('id', parentAssessmentId)
      .single()
    if (parent?.mastery_map) {
      type StandardEntry = {
        state: 'misconception' | 'working' | 'demonstrated' | 'not_assessed'
      }
      type MMap = { standards: Record<string, StandardEntry>; overall_notes?: string }
      const parentMap = parent.mastery_map as MMap
      const probeMap = masteryMap as MMap
      const mergedStandards = { ...parentMap.standards }
      for (const [sid, entry] of Object.entries(probeMap.standards ?? {})) {
        if (entry.state !== 'not_assessed') {
          mergedStandards[sid] = entry
        }
      }
      const merged: MMap = {
        ...parentMap,
        standards: mergedStandards,
      }
      const { error: parentErr } = await supabase
        .from('assessments')
        .update({ mastery_map: merged })
        .eq('id', parentAssessmentId)
      parentMerged = !parentErr
    }
  }

  return NextResponse.json({
    mastery_map: masteryMap,
    parent_merged: parentMerged,
    usage: apiResponse.usage,
  })
}
