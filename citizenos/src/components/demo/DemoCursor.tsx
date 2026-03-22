import { useEffect, useState } from 'react'
import { useDemoStore } from '@/stores/useDemoStore'

/**
 * Animated fake cursor that moves smoothly to target elements and shows
 * a click ripple effect. Makes the demo feel like someone is using the app.
 */
export default function DemoCursor() {
  const cursorTarget = useDemoStore(s => s.cursorTarget)
  const cursorVisible = useDemoStore(s => s.cursorVisible)
  const cursorClicking = useDemoStore(s => s.cursorClicking)
  const selectedPersona = useDemoStore(s => s.selectedPersona)

  const [pos, setPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [showRipple, setShowRipple] = useState(false)

  // Smooth move to target
  useEffect(() => {
    if (cursorTarget) {
      setPos(cursorTarget)
    }
  }, [cursorTarget])

  // Click ripple
  useEffect(() => {
    if (cursorClicking) {
      setShowRipple(true)
      const timer = setTimeout(() => setShowRipple(false), 500)
      return () => clearTimeout(timer)
    }
  }, [cursorClicking])

  if (!cursorVisible) return null

  const accentColor = selectedPersona?.id === 'priya' ? '#6366f1'
    : selectedPersona?.id === 'marcus' ? '#f59e0b'
    : selectedPersona?.id === 'sofia' ? '#10b981'
    : selectedPersona?.id === 'bob' ? '#f43f5e'
    : '#f59e0b'

  return (
    <div
      className="fixed z-[10005] pointer-events-none"
      style={{
        left: pos.x,
        top: pos.y,
        transition: 'left 0.6s cubic-bezier(0.22, 1, 0.36, 1), top 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Cursor dot */}
      <div
        className="relative -translate-x-1/2 -translate-y-1/2"
      >
        {/* Main cursor */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
          <path
            d="M5 3l14 8.5L12.5 14 16 21l-3 1.5-3.5-7L5 12V3z"
            fill={accentColor}
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>

        {/* Click ripple */}
        {showRipple && (
          <div
            className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full animate-demo-ripple"
            style={{
              width: 40,
              height: 40,
              border: `2px solid ${accentColor}`,
            }}
          />
        )}
      </div>
    </div>
  )
}
