import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-8 space-y-6">
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const question = questions[currentStep]
  const isLast = currentStep === questions.length - 1
  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <div className="rounded-2xl border bg-card shadow-xl shadow-black/5 overflow-hidden">
      {/* Gradient header — inspired by Magic quiz card */}
      <div className="bg-gradient-to-r from-primary to-primary/80 p-5 sm:p-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-primary-foreground/90 text-sm font-medium">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-primary-foreground/90 text-sm font-medium">
            {answeredCount} answered
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-white'
                  : i < currentStep || answers[questions[i]?.axis] !== undefined
                  ? 'w-1.5 bg-white/60'
                  : 'w-1.5 bg-white/25'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question area */}
      <div className="p-6 sm:p-8">
        <QuizQuestion
          question={question}
          value={answers[question.axis]}
          onAnswer={(val) => setAnswer(question.axis, val)}
        />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-2">
            {!isLast && (
              <Button variant="ghost" size="sm" onClick={nextStep} className="text-muted-foreground gap-1.5">
                Skip
                <SkipForward className="h-4 w-4" />
              </Button>
            )}

            {isLast ? (
              <Button
                onClick={submitQuiz}
                disabled={isSubmitting || answeredCount === 0}
                className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 gap-1.5 group"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Matching...</span>
                ) : (
                  <>
                    See My Matches
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={nextStep} className="gap-1.5 group">
                Next
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
