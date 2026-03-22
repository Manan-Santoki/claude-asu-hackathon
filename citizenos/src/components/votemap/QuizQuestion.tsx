import { cn } from '@/lib/utils'
import type { QuizQuestion as QuizQuestionType } from '@/api/quiz'

interface Props {
  question: QuizQuestionType
  value: number | undefined
  onAnswer: (value: number) => void
}

const OPTION_STYLES: Record<number, { base: string; selected: string }> = {
  [-2]: {
    base: 'border-red-200 dark:border-red-900/50 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20',
    selected: 'border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10',
  },
  [-1]: {
    base: 'border-orange-200 dark:border-orange-900/50 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20',
    selected: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-2 ring-orange-500/20 shadow-lg shadow-orange-500/10',
  },
  [0]: {
    base: 'border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/30',
    selected: 'border-gray-500 bg-gray-50 dark:bg-gray-800/30 ring-2 ring-gray-500/20 shadow-lg shadow-gray-500/10',
  },
  [1]: {
    base: 'border-sky-200 dark:border-sky-900/50 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20',
    selected: 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 ring-2 ring-sky-500/20 shadow-lg shadow-sky-500/10',
  },
  [2]: {
    base: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
    selected: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10',
  },
}

export default function QuizQuestion({ question, value, onAnswer }: Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 py-4">
      <div className="space-y-3">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
          {question.label}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold leading-tight max-w-xl">
          &ldquo;{question.question}&rdquo;
        </h2>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          {question.description}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full max-w-lg">
        {question.options.map((opt) => {
          const isSelected = value === opt.value
          const style = OPTION_STYLES[opt.value] ?? OPTION_STYLES[0]

          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              className={cn(
                'group relative flex-1 min-w-[100px] py-3.5 px-4 rounded-xl border-2 font-semibold text-sm transition-all duration-300',
                'hover:shadow-md hover:-translate-y-0.5 active:scale-95',
                isSelected ? style.selected : style.base,
              )}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
