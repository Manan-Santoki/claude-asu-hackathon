// VoteMap Quiz API client — mock data layer
// Replace with InsForge edge function calls when backend is ready

import { POLICY_AXES } from '@/lib/policyAxes'
import { getCandidates, getCandidatePositions, type Candidate } from './candidates'

export interface QuizQuestion {
  axis: string
  label: string
  question: string
  description: string
  options: { value: number; label: string }[]
}

export interface MatchResult {
  candidate: Candidate
  score: number
  axis_breakdown: Record<string, { user: number; candidate: number; diff: number }>
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  await delay(200)
  return POLICY_AXES.map((axis) => ({
    axis: axis.id,
    label: axis.label,
    question: axis.question,
    description: axis.description,
    options: [
      { value: -2, label: 'Strongly Disagree' },
      { value: -1, label: 'Disagree' },
      { value: 0, label: 'Neutral' },
      { value: 1, label: 'Agree' },
      { value: 2, label: 'Strongly Agree' },
    ],
  }))
}

export async function submitQuiz(
  answers: Record<string, number>
): Promise<MatchResult[]> {
  await delay(800)

  const allCandidates = await getCandidates()
  const matches: MatchResult[] = []

  for (const candidate of allCandidates) {
    const positions = await getCandidatePositions(candidate.id)
    const axisBreakdown: Record<string, { user: number; candidate: number; diff: number }> = {}
    let totalDiff = 0
    let axesCompared = 0

    for (const pos of positions) {
      const userAnswer = answers[pos.axis]
      if (userAnswer !== undefined) {
        const diff = Math.abs(userAnswer - pos.score)
        axisBreakdown[pos.axis] = {
          user: userAnswer,
          candidate: pos.score,
          diff,
        }
        totalDiff += diff
        axesCompared++
      }
    }

    const maxPossibleDiff = 4 * axesCompared // max diff per axis is 4 (-2 vs +2)
    const matchPct = maxPossibleDiff > 0
      ? Math.round((1 - totalDiff / maxPossibleDiff) * 100)
      : 0

    matches.push({
      candidate,
      score: matchPct,
      axis_breakdown: axisBreakdown,
    })
  }

  // Sort by match percentage descending
  matches.sort((a, b) => b.score - a.score)
  return matches
}
