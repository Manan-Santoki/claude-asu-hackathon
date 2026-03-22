import { useEffect, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  Zap,
  Globe,
  Briefcase,
  GraduationCap,
  Store,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/stores/useDemoStore'

const ICONS: Record<string, React.ElementType> = {
  Globe,
  Briefcase,
  GraduationCap,
  Store,
}

export default function DemoNarratorBar() {
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const narratorText = useDemoStore(s => s.narratorText)
  const currentStepIndex = useDemoStore(s => s.currentStepIndex)
  const isAutoPlaying = useDemoStore(s => s.isAutoPlaying)
  const playbackSpeed = useDemoStore(s => s.playbackSpeed)
  const nextStep = useDemoStore(s => s.nextStep)
  const prevStep = useDemoStore(s => s.prevStep)
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
    const delay = playbackSpeed === 'fast' ? step.autoAdvanceAfter * 0.5 : step.autoAdvanceAfter
    const timer = setTimeout(nextStep, delay)
    return () => clearTimeout(timer)
  }, [isAutoPlaying, currentStepIndex, selectedPersona, playbackSpeed, nextStep])

  if (!selectedPersona) return null

  const Icon = ICONS[selectedPersona.icon] || Globe
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[10002] animate-in slide-in-from-bottom duration-300">
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div
          className={`h-full bg-gradient-to-r ${selectedPersona.color} transition-all duration-500 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bar content */}
      <div className={`border-l-4 ${selectedPersona.colorAccent} bg-card/95 backdrop-blur-md border-t px-4 py-3 sm:px-6`}>
        <div className="mx-auto flex max-w-7xl items-start gap-4">
          {/* Persona avatar */}
          <div className={`hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${selectedPersona.color} text-white shadow-md`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Narrator text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground">
                {selectedPersona.name}
              </span>
              <span className="text-xs text-muted-foreground">
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              {displayedText}
              {displayedText.length < narratorText.length && (
                <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5 align-text-bottom" />
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={prevStep} title="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={toggleAutoPlay} title={isAutoPlaying ? 'Pause' : 'Play'}>
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={nextStep} title="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-border mx-1" />

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSpeed}
              title={playbackSpeed === 'normal' ? 'Speed up' : 'Normal speed'}
              className={playbackSpeed === 'fast' ? 'text-amber-500' : ''}
            >
              <Zap className="h-4 w-4" />
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
