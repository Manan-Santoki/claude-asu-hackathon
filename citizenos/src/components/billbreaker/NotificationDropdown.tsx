import { useNavigate } from 'react-router-dom'
import { CheckCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNotifStore } from '@/stores/useNotifStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Notification } from '@/api/notifications'

const IMPACT_BORDER: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`

  const diffDays = Math.floor(diffHr / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo ago`
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) {
  const borderColor = IMPACT_BORDER[notification.impact_level] ?? 'border-l-gray-300'

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-l-4 px-4 py-3 text-left transition-colors hover:bg-accent ${borderColor} ${
        notification.read ? 'opacity-70' : ''
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        {!notification.read ? (
          <span className="block h-2 w-2 rounded-full bg-blue-500" />
        ) : (
          <span className="block h-2 w-2" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">
          {notification.title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {timeAgo(notification.created_at)}
        </p>
      </div>
    </button>
  )
}

function OnboardingNotification({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 border-l-4 border-l-primary px-4 py-3 text-left transition-colors hover:bg-accent"
    >
      <div className="mt-0.5 shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">
          Complete your profile
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          Tell us your visa status, employment, and interests to see personalized bills and policies that affect you.
        </p>
      </div>
    </button>
  )
}

export default function NotificationDropdown() {
  const navigate = useNavigate()
  const notifications = useNotifStore((s) => s.notifications)
  const markRead = useNotifStore((s) => s.markRead)
  const markAllRead = useNotifStore((s) => s.markAllRead)
  const unreadCount = useNotifStore((s) => s.unreadCount)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding)

  const showOnboarding = isAuthenticated && !hasCompletedOnboarding()
  const recent = notifications.slice(0, 5)

  const handleClickNotification = (notif: Notification) => {
    if (!notif.read) {
      markRead(notif.id)
    }
    navigate(`/bill/${notif.bill_id}`)
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {(unreadCount > 0 || showOnboarding) && (
          <span className="text-xs text-muted-foreground">
            {unreadCount + (showOnboarding ? 1 : 0)} unread
          </span>
        )}
      </div>

      <Separator />

      {/* Onboarding prompt */}
      {showOnboarding && (
        <>
          <OnboardingNotification onClick={() => navigate('/onboarding')} />
          <Separator />
        </>
      )}

      {/* List */}
      {recent.length === 0 && !showOnboarding ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          {recent.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onClick={() => handleClickNotification(notif)}
            />
          ))}
        </div>
      )}

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
          Mark all read
        </Button>
        <Button
          variant="link"
          size="sm"
          className="h-8 text-xs"
          onClick={() => navigate('/settings')}
        >
          View All
        </Button>
      </div>
    </div>
  )
}
