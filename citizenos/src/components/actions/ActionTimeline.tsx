import { Check, Clock } from 'lucide-react'
import type { TimelineEvent } from '@/api/actions'

interface ActionTimelineProps {
  events: TimelineEvent[]
}

export default function ActionTimeline({ events }: ActionTimelineProps) {
  if (events.length === 0) return null

  return (
    <div className="w-full">
      {/* Desktop horizontal */}
      <div className="hidden sm:flex items-start w-full">
        {events.map((event, index) => (
          <div key={index} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                  event.completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                }`}
              >
                {event.completed ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </div>
              <span className={`text-[11px] font-medium text-center max-w-[100px] ${
                event.completed ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {event.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
              </span>
            </div>

            {index < events.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mt-4 ${
                event.completed ? 'bg-primary' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Mobile vertical */}
      <div className="flex flex-col gap-0 sm:hidden">
        {events.map((event, index) => {
          const isLast = index === events.length - 1

          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    event.completed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  }`}
                >
                  {event.completed ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-6 ${
                    event.completed ? 'bg-primary' : 'bg-muted-foreground/20'
                  }`} />
                )}
              </div>

              <div className="pt-0.5">
                <span className={`text-sm ${
                  event.completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {event.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
