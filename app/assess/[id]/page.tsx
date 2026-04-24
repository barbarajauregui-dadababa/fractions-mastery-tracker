import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProblemById, type Problem } from '@/lib/problem-selection'
import AssessmentClient, { type PublicProblem } from './AssessmentClient'

export default async function AssessPage(props: PageProps<'/assess/[id]'>) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('id, learner_id, responses, completed_at, learners(name)')
    .eq('id', id)
    .single()

  if (error || !assessment) notFound()
  if (assessment.completed_at) redirect(`/report/${id}`)

  type ResponseSkeleton = { problem_id: string }
  const responses = (assessment.responses as ResponseSkeleton[] | null) ?? []

  const publicProblems: PublicProblem[] = responses
    .map((r) => getProblemById(r.problem_id))
    .filter((p): p is Problem => !!p)
    .map((p) => ({
      id: p.id,
      ccss_standard_ids: p.ccss_standard_ids,
      problem_type: p.problem_type,
      target_shape: p.target_shape,
      available_denominators: p.available_denominators,
      target_whole_value: p.target_whole_value,
      goal: p.goal,
      framing_text: p.real_world_context?.framing_text,
    }))

  const learnerName = Array.isArray(assessment.learners)
    ? assessment.learners[0]?.name
    : (assessment.learners as { name: string } | null)?.name
  const displayName = learnerName ?? 'Learner'

  return (
    <AssessmentClient
      assessmentId={id}
      problems={publicProblems}
      learnerName={displayName}
    />
  )
}
