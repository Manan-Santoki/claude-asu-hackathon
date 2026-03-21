import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuizStore } from '@/stores/useQuizStore'
import QuizQuestion from './QuizQuestion'
import { ChevronLeft, ChevronRight, SkipForward, Send } from 'lucide-react'

export default function PolicyQuiz() {
  const {
    questions,
    answers,
    currentStep,
    isLoading,
    isSubmitting,
    fetchQuestions,
    setAnswer,
    nextStep,
    prevStep,
    submitQuiz,
  } = useQuizStore()

  useEffect(() => {
    if (questions.length === 0) fetchQuestions()
  }, [questions.length, fetchQuestions])

  if (isLoading || questions.length === 0) {
    return (
      <Card className="p-8 space-y-6">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-28" />
          ))}
        </div>
      </Card>
    )
  }

  const question = questions[currentStep]
  const isLast = currentStep === questions.length - 1
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <Card className="p-6 sm:p-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>
            Question {currentStep + 1} of {questions.length}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuizQuestion
        question={question}
        value={answers[question.axis]}
        onAnswer={(val) => setAnswer(question.axis, val)}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="flex gap-2">
          {!isLast && (
            <Button variant="ghost" size="sm" onClick={nextStep}>
              Skip
              <SkipForward className="h-4 w-4 ml-1" />
            </Button>
          )}

          {isLast ? (
            <Button
              onClick={submitQuiz}
              disabled={isSubmitting || answeredCount === 0}
            >
              {isSubmitting ? (
                <span className="animate-pulse">Matching...</span>
              ) : (
                <>
                  See My Matches
                  <Send className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
