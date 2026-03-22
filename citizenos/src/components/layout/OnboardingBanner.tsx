import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuthStore'

export default function OnboardingBanner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasCompleted = useAuthStore((s) => s.hasCompletedOnboarding)
  const [dismissed, setDismissed] = useState(false)

  if (!isAuthenticated || hasCompleted() || dismissed) return null

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm truncate">
            <span className="font-medium">Complete your profile</span>
            <span className="text-muted-foreground hidden sm:inline">
              {' '}— tell us your visa status, employment, and interests so we can show you bills and policies that directly affect you.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" variant="default" className="h-7 text-xs">
            <Link to="/onboarding">Complete Now</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
