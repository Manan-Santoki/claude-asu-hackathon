import { cn } from '@/lib/utils'
import type { QuizQuestion as QuizQuestionType } from '@/api/quiz'

interface Props {
  question: QuizQuestionType
  value: number | undefined
  onAnswer: (value: number) => void
}

const OPTION_COLORS: Record<number, string> = {
  [-2]: 'border-red-400 bg-red-50 text-red-700 hover:bg-red-100 data-[selected=true]:bg-red-500 data-[selected=true]:text-white data-[selected=true]:border-red-600',
  [-1]: 'border-orange-400 bg-orange-50 text-orange-700 hover:bg-orange-100 data-[selected=true]:bg-orange-500 data-[selected=true]:text-white data-[selected=true]:border-orange-600',
  [0]: 'border-gray-400 bg-gray-50 text-gray-700 hover:bg-gray-100 data-[selected=true]:bg-gray-500 data-[selected=true]:text-white data-[selected=true]:border-gray-600',
  [1]: 'border-sky-400 bg-sky-50 text-sky-700 hover:bg-sky-100 data-[selected=true]:bg-sky-500 data-[selected=true]:text-white data-[selected=true]:border-sky-600',
  [2]: 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[selected=true]:border-blue-700',
}

export default function QuizQuestion({ question, value, onAnswer }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-4">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {question.label}
        </p>
        <h2 className="text-xl sm:text-2xl font-semibold leading-tight max-w-xl">
          "{question.question}"
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {question.description}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            data-selected={value === opt.value}
            onClick={() => onAnswer(opt.value)}
            className={cn(
              'flex-1 min-w-[100px] py-3 px-4 rounded-lg border-2 font-medium text-sm transition-all',
              OPTION_COLORS[opt.value]
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
