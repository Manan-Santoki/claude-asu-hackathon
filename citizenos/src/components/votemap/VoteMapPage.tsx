import { Button } from '@/components/ui/button'
import { useQuizStore } from '@/stores/useQuizStore'
import PolicyQuiz from './PolicyQuiz'
import QuizResults from './QuizResults'
import { RotateCcw, Vote } from 'lucide-react'

export default function VoteMapPage() {
  const hasCompleted = useQuizStore((s) => s.hasCompleted)
  const resetQuiz = useQuizStore((s) => s.resetQuiz)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">VoteMap</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {hasCompleted
              ? 'See which candidates align with your values'
              : 'Answer 10 policy questions to find your best candidate matches'}
          </p>
        </div>

        {hasCompleted && (
          <Button variant="outline" size="sm" onClick={resetQuiz}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Retake Quiz
          </Button>
        )}
      </div>

      {hasCompleted ? <QuizResults /> : <PolicyQuiz />}
    </div>
  )
}
