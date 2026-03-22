import { useDemoStore } from '@/stores/useDemoStore'

export default function DemoProgressRail() {
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const currentStepIndex = useDemoStore(s => s.currentStepIndex)
  const goToStep = useDemoStore(s => s.goToStep)

  if (!selectedPersona) return null

  return (
    <div className="fixed top-14 left-0 right-0 z-[10002] bg-card/90 backdrop-blur-sm border-b">
      <div className="mx-auto max-w-7xl px-4 py-1.5 flex items-center gap-1">
        {/* Persona badge */}
        <span className={`mr-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${selectedPersona.color} px-2.5 py-0.5 text-xs font-medium text-white`}>
          {selectedPersona.emoji} {selectedPersona.name.split(' ')[0]}
        </span>

        {/* Step dots */}
        <div className="flex items-center gap-1 flex-1">
          {selectedPersona.steps.map((step, i) => {
            const isCurrent = i === currentStepIndex
            const isCompleted = i < currentStepIndex

            return (
              <button
                key={step.id}
                onClick={() => goToStep(i)}
                className="group flex items-center"
                title={`Step ${i + 1}`}
              >
                {/* Connector line */}
                {i > 0 && (
                  <div className={`h-0.5 w-4 sm:w-8 transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
                {/* Dot */}
                <div className={`rounded-full transition-all ${
                  isCurrent
                    ? 'h-3 w-3 bg-primary ring-2 ring-primary/30'
                    : isCompleted
                    ? 'h-2 w-2 bg-primary'
                    : 'h-2 w-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/60'
                }`} />
              </button>
            )
          })}
        </div>

        {/* Step label */}
        <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
          {currentStepIndex + 1}/{selectedPersona.steps.length}
        </span>
      </div>
    </div>
  )
}
