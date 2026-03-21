import { Check } from 'lucide-react'
import type { Bill } from '@/api/bills'

const STEPS = [
  { key: 'introduced', label: 'Introduced' },
  { key: 'in_committee', label: 'Committee' },
  { key: 'passed_house', label: 'Passed House' },
  { key: 'passed_senate', label: 'Passed Senate' },
  { key: 'enacted', label: 'Enacted' },
] as const

// Map statuses to their step index (0-based)
const STATUS_INDEX: Record<Bill['status'], number> = {
  introduced: 0,
  in_committee: 1,
  passed_house: 2,
  passed_senate: 3,
  enacted: 4,
  vetoed: 3, // vetoed happens after passing both chambers
}

interface StatusTimelineProps {
  status: Bill['status']
}

export default function StatusTimeline({ status }: StatusTimelineProps) {
  const currentIndex = STATUS_INDEX[status]
  const isVetoed = status === 'vetoed'

  return (
    <div className="w-full">
      {/* Desktop horizontal stepper */}
      <div className="hidden sm:flex items-center w-full">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                        ? isVetoed
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
                        : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isCurrent && isVetoed ? (
                    <span className="text-[10px]">X</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium text-center whitespace-nowrap ${
                    isCompleted || isCurrent
                      ? isCurrent && isVetoed
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {isCurrent && isVetoed ? 'Vetoed' : step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 mt-[-18px] ${
                    isCompleted
                      ? 'bg-primary'
                      : isFuture
                        ? 'bg-muted-foreground/20'
                        : 'bg-muted-foreground/20'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile vertical stepper */}
      <div className="flex flex-col gap-0 sm:hidden">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.key} className="flex items-start gap-3">
              {/* Circle + vertical line */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                        ? isVetoed
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isCurrent && isVetoed ? (
                    <span className="text-[10px]">X</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 h-6 ${
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm pt-1 ${
                  isCompleted || isCurrent
                    ? isCurrent && isVetoed
                      ? 'text-red-600 dark:text-red-400 font-semibold'
                      : 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {isCurrent && isVetoed ? 'Vetoed' : step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
