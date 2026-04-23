import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProblemById, type Problem } from '@/lib/problem-selection'
import AssessmentClient from './AssessmentClient'

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

  const publicProblems = responses
    .map((r) => getProblemById(r.problem_id))
    .filter((p): p is Problem => !!p)
    .map((p) => ({
      id: p.id,
      sub_skill_id: p.sub_skill_id,
      problem_type: p.problem_type,
      prompt: p.prompt,
    }))

  // Supabase's foreign-table select returns an array or object depending on cardinality;
  // learner_id is a to-one FK so this is a single object (or null).
  const learnerName =
    Array.isArray(assessment.learners)
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
