import { useEffect, useState } from 'react'
import { useDemoStore } from '@/stores/useDemoStore'

/**
 * Full-screen cinematic transition between demo pages.
 * Shows a persona-colored gradient wipe with the feature name.
 */
export default function DemoTransition() {
  const isTransitioning = useDemoStore(s => s.isTransitioning)
  const transitionLabel = useDemoStore(s => s.transitionLabel)
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const [phase, setPhase] = useState<'idle' | 'enter' | 'hold' | 'exit'>('idle')

  useEffect(() => {
    if (isTransitioning) {
      setPhase('enter')
      const holdTimer = setTimeout(() => setPhase('hold'), 250)
      const exitTimer = setTimeout(() => setPhase('exit'), 600)
      const doneTimer = setTimeout(() => {
        setPhase('idle')
        useDemoStore.getState().endTransition()
      }, 900)
      return () => {
        clearTimeout(holdTimer)
        clearTimeout(exitTimer)
        clearTimeout(doneTimer)
      }
    }
  }, [isTransitioning])

  if (phase === 'idle') return null

  const gradientClass = selectedPersona?.color || 'from-amber-500 to-orange-500'

  return (
    <div className="fixed inset-0 z-[10010] pointer-events-none flex items-center justify-center">
      {/* Background wipe */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-all duration-300 ease-in-out ${
          phase === 'enter'
            ? 'opacity-0 scale-110'
            : phase === 'hold'
            ? 'opacity-95 scale-100'
            : 'opacity-0 scale-95'
        }`}
      />

      {/* Label */}
      <div
        className={`relative z-10 text-center transition-all duration-300 ${
          phase === 'hold' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <p className="text-white/80 text-sm font-medium tracking-widest uppercase mb-1">
          {selectedPersona?.emoji} {selectedPersona?.name?.split(' ')[0]}
        </p>
        <h2 className="text-white text-3xl font-bold tracking-tight">
          {transitionLabel}
        </h2>
      </div>
    </div>
  )
}
