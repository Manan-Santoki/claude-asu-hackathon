import { useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDemoStore } from '@/stores/useDemoStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useQuizStore } from '@/stores/useQuizStore'
import { useMapStore } from '@/stores/useMapStore'
import { insforge } from '@/lib/insforge'
import type { DemoPersona } from '@/lib/demoScripts'
import { submitQuiz } from '@/api/quiz'

/**
 * DemoEngine — headless orchestrator for the entire demo experience.
 *
 * On persona select:  injects auth profiles, pre-fills quiz results
 * On step change:     fires transition → navigate → cursor → spotlight → type
 * On notification:    sends real email via edge function
 * On demo exit:       restores all stores to original state
 */
export default function DemoEngine() {
  const isActive = useDemoStore(s => s.isActive)
  const phase = useDemoStore(s => s.phase)
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const currentStepIndex = useDemoStore(s => s.currentStepIndex)
  const capturedEmail = useDemoStore(s => s.capturedEmail)

  const navigate = useNavigate()
  const location = useLocation()

  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Clean up all timers
  const clearTimers = useCallback(() => {
    if (typingRef.current) clearTimeout(typingRef.current)
    stepTimersRef.current.forEach(clearTimeout)
    stepTimersRef.current = []
  }, [])

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay)
    stepTimersRef.current.push(t)
    return t
  }, [])

  // ─── Inject store state when persona is selected ──────────────────────
  useEffect(() => {
    if (!isActive || !selectedPersona) return

    injectPersonaState(selectedPersona)

    return () => {
      // Will be restored in exitDemo handler
    }
  }, [isActive, selectedPersona]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Restore stores on demo exit ──────────────────────────────────────
  // Note: demo user logout is handled in useDemoStore.exitDemo() directly,
  // since DemoEngine unmounts when isActive becomes false.
  useEffect(() => {
    if (!isActive) {
      restoreStores()
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Execute step actions ─────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || phase !== 'playing' || !selectedPersona) return

    const step = useDemoStore.getState().getCurrentStep()
    if (!step) return

    clearTimers()

    let baseDelay = 0

    // 1. Page transition (if navigating to new route)
    if (step.route && step.route !== location.pathname) {
      if (step.transition) {
        useDemoStore.getState().startTransition(step.transition)
        baseDelay = 2600 // Wait for transition to finish (title holds for ~1.6s)
      }
      addTimer(() => {
        navigate(step.route!)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }, step.transition ? 400 : 0)
    }

    // 2. Map actions
    if (step.mapAction) {
      addTimer(() => {
        if (step.mapAction!.colorMode) {
          useMapStore.getState().setColorMode(
            step.mapAction!.colorMode as 'bill_activity' | 'party_control' | 'civic_score'
          )
        }
        if (step.mapAction!.highlightState) {
          useMapStore.getState().setSelectedState(step.mapAction!.highlightState!)
        }
      }, baseDelay + 300)
    }

    // 3. Cursor movement + click
    if (step.cursorTarget) {
      addTimer(() => {
        const el = document.querySelector(step.cursorTarget!)
        if (el) {
          scrollIntoDemo(el)
          // Slight delay to let scroll settle before positioning cursor
          setTimeout(() => {
            const rect = el.getBoundingClientRect()
            useDemoStore.getState().moveCursor(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2
            )
          }, 300)
        }
      }, baseDelay + 500)

      if (step.click) {
        addTimer(() => {
          useDemoStore.getState().clickCursor()
        }, baseDelay + 1100)

        addTimer(() => {
          const el = document.querySelector(step.click!) as HTMLElement
          if (el) el.click()
        }, baseDelay + 1300)
      }
    }

    // 4. Scroll to element
    if (step.scroll) {
      addTimer(() => {
        const el = document.querySelector(step.scroll!)
        if (el) scrollIntoDemo(el)
      }, baseDelay + 600)
    }

    // 5. Spotlight
    if (step.spotlight) {
      addTimer(() => {
        useDemoStore.getState().setSpotlight(step.spotlight!)
        // Also scroll spotlight target into view
        const el = document.querySelector(step.spotlight!)
        if (el) scrollIntoDemo(el)
      }, baseDelay + 800)
    }

    // 6. Auto-type
    if (step.type) {
      const { selector, text, speed = 50 } = step.type
      addTimer(() => {
        const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement
        if (!el) return

        el.focus()
        let i = 0

        const typeNext = () => {
          if (i > text.length) return
          const proto = el instanceof HTMLTextAreaElement
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
          nativeSetter?.call(el, text.slice(0, i))
          el.dispatchEvent(new Event('input', { bubbles: true }))
          el.dispatchEvent(new Event('change', { bubbles: true }))
          i++
          if (i <= text.length) {
            typingRef.current = setTimeout(typeNext, speed)
          }
        }
        typeNext()
      }, baseDelay + 1500)
    }

    // 7. Notification
    if (step.notification) {
      addTimer(() => {
        useDemoStore.getState().fireNotification({
          title: step.notification!.title,
          subtitle: step.notification!.subtitle,
          type: step.notification!.type,
        })

        // Send real email
        if (step.notification!.sendEmail && capturedEmail) {
          sendDemoEmail(capturedEmail, selectedPersona, step.notification!)
          addTimer(() => {
            useDemoStore.getState().setShowCheckEmail(true)
            useDemoStore.getState().setEmailSent(true)
          }, 2000)
        }
      }, baseDelay + 1000)
    }

    // Hide cursor after actions settle
    if (!step.cursorTarget) {
      useDemoStore.getState().hideCursor()
    }

    return () => clearTimers()
  }, [isActive, phase, selectedPersona, currentStepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-advance ─────────────────────────────────────────────────────
  useEffect(() => {
    const { isAutoPlaying, playbackSpeed } = useDemoStore.getState()
    if (!isActive || phase !== 'playing' || !isAutoPlaying || !selectedPersona) return

    const step = useDemoStore.getState().getCurrentStep()
    if (!step?.autoAdvanceAfter) return

    const multiplier = playbackSpeed === 'fast' ? 0.5 : playbackSpeed === 'slow' ? 2 : 1
    const delay = step.autoAdvanceAfter * multiplier
    const timer = setTimeout(() => useDemoStore.getState().nextStep(), delay)
    return () => clearTimeout(timer)
  }, [isActive, phase, selectedPersona, currentStepIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) return

    function handleKeyDown(e: KeyboardEvent) {
      const { phase } = useDemoStore.getState()
      if (phase !== 'playing') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          useDemoStore.getState().nextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          useDemoStore.getState().prevStep()
          break
        case 'Escape':
          e.preventDefault()
          useDemoStore.getState().exitDemo()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          useDemoStore.getState().toggleAutoPlay()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive])

  return null
}

// ─── Helper: Scroll element into the visible demo area ──────────────────────
// Accounts for the progress rail at the top (~50px) and narrator bar at the
// bottom (~120px) so the element is centered in the remaining viewport.

function scrollIntoDemo(el: Element) {
  const topOffset = 70    // header height (~64px) + padding
  const bottomOffset = 150 // narrator bar + step dots height
  const rect = el.getBoundingClientRect()
  const viewportH = window.innerHeight
  const visibleTop = topOffset
  const visibleBottom = viewportH - bottomOffset
  const visibleCenter = (visibleTop + visibleBottom) / 2
  const elCenter = rect.top + rect.height / 2

  // Only scroll if the element is outside the visible area
  if (rect.top < visibleTop || rect.bottom > visibleBottom) {
    window.scrollBy({
      top: elCenter - visibleCenter,
      behavior: 'smooth',
    })
  }
}

// ─── Helper: Inject persona state into app stores ───────────────────────────

async function injectPersonaState(persona: DemoPersona) {
  const authStore = useAuthStore.getState()
  const quizStore = useQuizStore.getState()

  // Save originals for restore
  useDemoStore.getState().saveOriginalStores(
    {
      profiles: authStore.profiles,
      categories: authStore.categories,
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
    },
    {
      hasCompleted: quizStore.hasCompleted,
      answers: quizStore.answers,
      matches: quizStore.matches,
    }
  )

  // Inject auth (this bypasses all "complete onboarding" gates)
  useAuthStore.setState({
    isAuthenticated: true,
    profiles: persona.tags,
    categories: persona.categories,
    user: {
      id: `demo-${persona.id}`,
      email: `${persona.id}@demo.citizenos.app`,
      name: persona.name,
      state_code: persona.stateCode,
      zip_code: '00000',
    },
  })

  // Pre-fill quiz with persona answers and compute matches
  try {
    const matches = await submitQuiz(persona.quizAnswers)
    useQuizStore.setState({
      answers: persona.quizAnswers,
      matches,
      hasCompleted: true,
      currentStep: 9, // Show as completed
    })
  } catch {
    // Quiz pre-fill failed, not critical
  }
}

// ─── Helper: Restore stores on demo exit ────────────────────────────────────

function restoreStores() {
  const { _originalAuth, _originalQuiz } = useDemoStore.getState()

  if (_originalAuth) {
    useAuthStore.setState({
      profiles: _originalAuth.profiles,
      categories: _originalAuth.categories,
      isAuthenticated: _originalAuth.isAuthenticated,
      user: _originalAuth.user as ReturnType<typeof useAuthStore.getState>['user'],
    })
  }

  if (_originalQuiz) {
    useQuizStore.setState({
      hasCompleted: _originalQuiz.hasCompleted,
      answers: _originalQuiz.answers,
      matches: _originalQuiz.matches as ReturnType<typeof useQuizStore.getState>['matches'],
    })
  }
}

// ─── Helper: Send real demo email ───────────────────────────────────────────

async function sendDemoEmail(
  email: string,
  persona: DemoPersona,
  notification: { title: string; subtitle: string; type: string }
) {
  const firstName = persona.name.split(' ')[0]

  // Build email body with inline HTML
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="height: 4px; background: linear-gradient(to right, #6366f1, #8b5cf6);"></div>
      <div style="padding: 32px 24px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
          <span style="font-size: 24px; font-weight: 700;">CitizenOS</span>
        </div>

        <p style="font-size: 16px; color: #111;">Hi ${firstName},</p>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <p style="font-size: 12px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Breaking Alert</p>
          <p style="font-size: 16px; font-weight: 600; color: #111; margin: 0 0 8px 0;">${notification.title}</p>
          <p style="font-size: 14px; color: #374151; margin: 0;">${notification.subtitle}</p>
        </div>

        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${persona.emoji} What this means for you (${persona.tags[0]?.replace('_', ' ')}):</p>
          <p style="font-size: 14px; color: #374151; margin: 0;">This ${notification.type.replace('_', ' ')} directly impacts your ${persona.tags[0]?.replace('_', ' ')} status. Log in to CitizenOS to see the full personalized impact analysis, read related news articles, and chat with our AI about what this means for your specific situation.</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://citizenos.app" style="display: inline-block; background: linear-gradient(to right, #f59e0b, #ea580c); color: white; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px;">Chat About This Action</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          You\u2019re receiving this because you explored CitizenOS as ${persona.name} (${persona.tags.map(t => t.replace('_', ' ')).join(', ')}).
          <br>This is a demo email from the CitizenOS hackathon project.
        </p>
      </div>
    </div>
  `

  // Send via InsForge edge function
  try {
    const { data, error } = await insforge.functions.invoke('send-demo-email', {
      body: {
        to: email,
        subject: `${firstName}, ${notification.title.toLowerCase()}`,
        html: htmlBody,
        persona: persona.id,
      },
    })
    if (error) {
      console.log('[Demo] Email edge function error:', error)
    } else {
      console.log('[Demo] Email sent:', data)
    }
  } catch {
    // Email sending is best-effort during demo
    console.log('[Demo] Email sending skipped — edge function unavailable')
  }
}
