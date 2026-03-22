import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  Globe,
  Briefcase,
  GraduationCap,
  Store,
  RotateCcw,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/stores/useDemoStore'

const ICONS: Record<string, React.ElementType> = {
  Globe,
  Briefcase,
  GraduationCap,
  Store,
}

const SPEED_LABELS: Record<string, string> = {
  slow: '0.5x',
  normal: '1x',
  fast: '2x',
}

const SPEED_COLORS: Record<string, string> = {
  slow: 'text-blue-400',
  normal: '',
  fast: 'text-amber-500',
}

export default function DemoNarratorBar() {
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const narratorText = useDemoStore(s => s.narratorText)
  const currentStepIndex = useDemoStore(s => s.currentStepIndex)
  const isAutoPlaying = useDemoStore(s => s.isAutoPlaying)
  const playbackSpeed = useDemoStore(s => s.playbackSpeed)
  const nextStep = useDemoStore(s => s.nextStep)
  const prevStep = useDemoStore(s => s.prevStep)
  const goToStep = useDemoStore(s => s.goToStep)
  const toggleAutoPlay = useDemoStore(s => s.toggleAutoPlay)
  const toggleSpeed = useDemoStore(s => s.toggleSpeed)
  const exitDemo = useDemoStore(s => s.exitDemo)
  const switchPersona = useDemoStore(s => s.switchPersona)
  const totalSteps = useDemoStore(s => s.getTotalSteps)()

  // Typewriter effect for narrator text
  const [displayedText, setDisplayedText] = useState('')
  useEffect(() => {
    setDisplayedText('')
    if (!narratorText) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(narratorText.slice(0, i))
      if (i >= narratorText.length) clearInterval(interval)
    }, 20)
    return () => clearInterval(interval)
  }, [narratorText])

  // Auto-advance
  useEffect(() => {
    if (!isAutoPlaying || !selectedPersona) return
    const step = selectedPersona.steps[currentStepIndex]
    if (!step?.autoAdvanceAfter) return
    const multiplier = playbackSpeed === 'fast' ? 0.5 : playbackSpeed === 'slow' ? 2 : 1
    const delay = step.autoAdvanceAfter * multiplier
    const timer = setTimeout(nextStep, delay)
    return () => clearTimeout(timer)
  }, [isAutoPlaying, currentStepIndex, selectedPersona, playbackSpeed, nextStep])

  if (!selectedPersona) return null

  const Icon = ICONS[selectedPersona.icon] || Globe
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10002] animate-in slide-in-from-bottom duration-300">
      {/* Step dots — moved from DemoProgressRail */}
      <div className="bg-card/80 backdrop-blur-sm border-t px-4 py-1">
        <div className="mx-auto max-w-7xl flex items-center gap-1">
          <span className={`mr-2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${selectedPersona.color} px-2 py-0.5 text-[10px] font-medium text-white`}>
            {selectedPersona.emoji} {selectedPersona.name.split(' ')[0]}
          </span>
          <div className="flex items-center gap-0.5 flex-1">
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
                  {i > 0 && (
                    <div className={`h-0.5 w-3 sm:w-6 transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                  <div className={`rounded-full transition-all ${
                    isCurrent
                      ? 'h-2.5 w-2.5 bg-primary ring-2 ring-primary/30'
                      : isCompleted
                      ? 'h-1.5 w-1.5 bg-primary'
                      : 'h-1.5 w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/60'
                  }`} />
                </button>
              )
            })}
          </div>
          <span className="text-[10px] text-muted-foreground ml-2">
            {currentStepIndex + 1}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-muted">
        <div
          className={`h-full bg-gradient-to-r ${selectedPersona.color} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bar content */}
      <div className={`border-l-4 ${selectedPersona.colorAccent} bg-card/95 backdrop-blur-md px-4 py-2.5 sm:px-6`}>
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {/* Persona avatar */}
          <div className={`hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selectedPersona.color} text-white shadow-md`}>
            <Icon className="h-4 w-4" />
          </div>

          {/* Narrator text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">
              {displayedText}
              {displayedText.length < narratorText.length && (
                <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5 align-text-bottom" />
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={prevStep} title="Previous step">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={toggleAutoPlay} title={isAutoPlaying ? 'Pause demo' : 'Resume demo'}>
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={nextStep} title="Next step">
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-border mx-0.5" />

            {/* Speed — cycles slow → normal → fast */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSpeed}
              title={`Speed: ${SPEED_LABELS[playbackSpeed]} — click to change`}
              className={`h-7 px-1.5 gap-1 text-xs ${SPEED_COLORS[playbackSpeed]}`}
            >
              <Gauge className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{SPEED_LABELS[playbackSpeed]}</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={switchPersona} title="Switch persona">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={exitDemo} title="Exit demo">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
