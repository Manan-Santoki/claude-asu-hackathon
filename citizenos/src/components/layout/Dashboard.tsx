import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Users, ClipboardList, Zap, Bell, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotifStore } from '@/stores/useNotifStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import PageWrapper from '@/components/layout/PageWrapper'
import RepList from '@/components/repscore/RepList'
import ActionFeed from '@/components/actions/ActionFeed'
import type { Notification } from '@/api/notifications'

const quickLinks = [
  {
    to: '/bill/latest',
    icon: FileText,
    title: 'Saved Bills',
    description: 'Review bills you bookmarked',
  },
  {
    to: '/actions',
    icon: Zap,
    title: 'Gov Actions',
    description: 'Track orders, rules & rulings',
  },
  {
    to: '/reps',
    icon: Users,
    title: 'Followed Reps',
    description: 'Track your representatives',
  },
  {
    to: '/vote',
    icon: ClipboardList,
    title: 'Policy Quiz',
    description: 'Find your political match',
  },
]

const IMPACT_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
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
  return `${Math.floor(diffDays / 30)}mo ago`
}

function RecentNotification({ notif, onClick }: { notif: Notification; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
    >
      <span className={`mt-1.5 block h-2 w-2 rounded-full shrink-0 ${IMPACT_DOT[notif.impact_level] ?? 'bg-gray-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight line-clamp-1">{notif.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
        {notif.reason && (
          <p className="mt-1 text-[11px] text-primary/80 font-medium">{notif.reason}</p>
        )}
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{timeAgo(notif.created_at)}</p>
      </div>
      {!notif.read && (
        <Badge variant="secondary" className="text-[10px] shrink-0">New</Badge>
      )}
    </button>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const notifications = useNotifStore((s) => s.notifications)
  const fetchNotifications = useNotifStore((s) => s.fetchNotifications)
  const navigate = useNavigate()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded) {
      fetchNotifications()
      setLoaded(true)
    }
  }, [loaded, fetchNotifications])

  const onboarded = !!user?.onboarding_completed

  // Only show unread or recent high/medium impact notifications
  const relevantNotifs = notifications
    .filter((n) => !n.read || n.impact_level !== 'low')
    .slice(0, 5)

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="text-muted-foreground mb-6">
        {onboarded
          ? 'Here are bills and government actions that affect you.'
          : 'Complete your profile to see personalized content.'}
      </p>

      {/* Onboarding prompt if not completed */}
      {!onboarded && (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 py-4">
            <Sparkles className="h-8 w-8 text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Personalize your experience</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tell us your visa status, employment, and interests. We'll show you the exact bills, executive orders, and policies that affect your life.
              </p>
            </div>
            <Button asChild size="sm">
              <Link to="/onboarding">Set Up Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Card key={link.to} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <link.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{link.title}</CardTitle>
              </div>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={link.to}>Go &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personalized notifications — only when onboarded */}
      {onboarded && relevantNotifs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Affecting You</h2>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/settings">View All</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {relevantNotifs.map((notif) => (
              <RecentNotification
                key={notif.id}
                notif={notif}
                onClick={() => {
                  if (notif.action_id) navigate(`/action/${notif.action_id}`)
                  else if (notif.bill_id) navigate(`/bill/${notif.bill_id}`)
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions feed */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Government Actions{onboarded ? ' For You' : ''}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/actions">View All</Link>
          </Button>
        </div>
        <ActionFeed limit={4} compact />
      </div>

      {user?.state_code && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your Representatives</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/reps">View All</Link>
            </Button>
          </div>
          <RepList stateFilter={user.state_code} compact />
        </div>
      )}
    </PageWrapper>
  )
}
