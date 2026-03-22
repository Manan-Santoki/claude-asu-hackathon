import { useEffect, useState, useCallback } from 'react'
import { useDemoStore } from '@/stores/useDemoStore'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export default function DemoSpotlight() {
  const spotlightTarget = useDemoStore(s => s.spotlightTarget)
  const [rect, setRect] = useState<Rect | null>(null)

  const updateRect = useCallback(() => {
    if (!spotlightTarget) {
      setRect(null)
      return
    }
    const el = document.querySelector(spotlightTarget)
    if (!el) {
      setRect(null)
      return
    }
    const r = el.getBoundingClientRect()
    const padding = 8
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    })
  }, [spotlightTarget])

  // Track element position
  useEffect(() => {
    updateRect()

    // Re-measure on scroll/resize
    const handleUpdate = () => requestAnimationFrame(updateRect)
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    // Also poll briefly for elements that appear after navigation
    const poll = setInterval(updateRect, 300)
    const stop = setTimeout(() => clearInterval(poll), 3000)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
      clearInterval(poll)
      clearTimeout(stop)
    }
  }, [updateRect])

  if (!spotlightTarget || !rect) return null

  // Use a full-screen overlay with a cutout for the target
  const clipPath = `polygon(
    0% 0%, 0% 100%,
    ${rect.left}px 100%,
    ${rect.left}px ${rect.top}px,
    ${rect.left + rect.width}px ${rect.top}px,
    ${rect.left + rect.width}px ${rect.top + rect.height}px,
    ${rect.left}px ${rect.top + rect.height}px,
    ${rect.left}px 100%,
    100% 100%, 100% 0%
  )`

  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        className="fixed inset-0 z-[10001] pointer-events-none transition-all duration-500"
        style={{
          clipPath,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Glow ring around target */}
      <div
        className="fixed z-[10001] pointer-events-none rounded-lg transition-all duration-500"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.3)',
        }}
      />
    </>
  )
}
