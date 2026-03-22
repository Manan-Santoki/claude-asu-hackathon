import { useEffect, useState } from 'react'
import { Bell, Mail, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/stores/useDemoStore'

/**
 * Breaking news notification that slides in during demo.
 * Simulates a real-time government action alert.
 * Shows "Check your email!" when email has been sent.
 */
export default function DemoNotification() {
  const showNotification = useDemoStore(s => s.showNotification)
  const notificationData = useDemoStore(s => s.notificationData)
  const showCheckEmail = useDemoStore(s => s.showCheckEmail)
  const capturedEmail = useDemoStore(s => s.capturedEmail)
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const dismissNotification = useDemoStore(s => s.dismissNotification)

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (showNotification) {
      // Delay slightly for dramatic effect
      const timer = setTimeout(() => setVisible(true), 300)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [showNotification])

  if (!showNotification || !notificationData) return null

  const gradientClass = selectedPersona?.color || 'from-amber-500 to-orange-500'

  return (
    <div
      className={`fixed top-20 right-4 z-[10006] w-96 max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {/* Main notification card */}
      <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className={`h-1 bg-gradient-to-r ${gradientClass}`} />

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} text-white`}>
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Breaking
                </span>
                <span className="text-[10px] text-muted-foreground">Just now</span>
              </div>
              <p className="text-sm font-semibold leading-tight">
                {notificationData.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {notificationData.subtitle}
              </p>
            </div>
            <Button variant="ghost" size="icon-xs" onClick={dismissNotification}>
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Impact line */}
          <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
            <p className="text-xs">
              <span className="font-semibold">{selectedPersona?.emoji} {selectedPersona?.name}:</span>{' '}
              This directly affects your {selectedPersona?.tags?.[0]?.replace('_', ' ')} status.
              We&apos;ve prepared a personalized briefing.
            </p>
          </div>

          {/* Check email banner */}
          {showCheckEmail && capturedEmail && (
            <div className="mt-3 rounded-lg border-2 border-green-500/30 bg-green-500/5 px-3 py-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <Mail className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Check your email!
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Sent to {capturedEmail}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-green-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
