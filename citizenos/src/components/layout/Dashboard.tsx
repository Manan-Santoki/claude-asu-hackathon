import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText,
  Users,
  ClipboardList,
  Zap,
  Bell,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotifStore } from '@/stores/useNotifStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import RepList from '@/components/repscore/RepList'
import ActionFeed from '@/components/actions/ActionFeed'
import type { Notification } from '@/api/notifications'

const quickLinks = [
  {
    to: '/bill/latest',
    icon: FileText,
    title: 'Saved Bills',
    description: 'Review bills you bookmarked',
    gradient: 'from-blue-500 to-blue-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    to: '/actions',
    icon: Zap,
    title: 'Gov Actions',
    description: 'Track orders, rules & rulings',
    gradient: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    to: '/reps',
    icon: Users,
    title: 'Your Reps',
    description: 'Track your representatives',
    gradient: 'from-emerald-500 to-teal-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    to: '/vote',
    icon: ClipboardList,
    title: 'Policy Quiz',
    description: 'Find your political match',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
]

const IMPACT_STYLES: Record<string, { dot: string; bg: string; border: string; label: string }> = {
  high: {
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-l-red-500',
    label: 'High Impact',
  },
  medium: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-l-amber-500',
    label: 'Medium',
  },
  low: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-l-emerald-500',
    label: 'Low',
  },
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
  const impact = IMPACT_STYLES[notif.impact_level] ?? {
    dot: 'bg-gray-400',
    bg: 'bg-muted',
    border: 'border-l-gray-400',
    label: 'Unknown',
  }

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border border-l-4 p-4 text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${impact.bg} ${impact.border}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`block h-2.5 w-2.5 rounded-full ${impact.dot} shrink-0`} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{impact.label}</span>
          {!notif.read && (
            <Badge className="ml-auto shrink-0 bg-primary text-primary-foreground text-[10px] px-2 py-0 border-0">New</Badge>
          )}
        </div>
        <p className="text-sm font-semibold leading-tight line-clamp-1">{notif.title}</p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
        {notif.reason && (
          <p className="mt-1.5 text-xs text-primary font-medium italic">{notif.reason}</p>
        )}
        <p className="mt-1.5 text-[11px] text-muted-foreground/60">{timeAgo(notif.created_at)}</p>
      </div>
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
  const unreadCount = notifications.filter(n => !n.read).length

  const relevantNotifs = notifications
    .filter((n) => !n.read || n.impact_level !== 'low')
    .slice(0, 6)

  return (
    <div>
      {/* Hero Banner — Stitch civic-gradient + Magic radial gradient overlays */}
      <div className="relative overflow-hidden border-b">
        {/* Gradient background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,oklch(0.546_0.245_263/0.15),transparent)]" />
        {/* Grid pattern overlay from Magic */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0_0/0.04)_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Civic Dashboard</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back{user?.name ? `, ${user.name}` : ''}
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                {user?.state_code && (
                  <>
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="font-medium">{user.state_code}</span>
                    <span className="text-border">|</span>
                  </>
                )}
                {onboarded
                  ? 'Here are bills and actions that affect you.'
                  : 'Complete your profile for personalized content.'}
              </p>
            </div>

            {/* Stat pills — glassmorphism from Stitch */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-card/70 backdrop-blur-sm border px-5 py-3 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tracking</p>
                  <p className="text-lg font-bold">{unreadCount} <span className="text-sm font-medium text-muted-foreground">new</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Onboarding CTA — inspired by Stitch civic-gradient + Magic CTA card */}
        {!onboarded && (
          <div className="relative mb-10 rounded-2xl overflow-hidden shadow-xl shadow-primary/15">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(1_0_0/0.1),transparent_50%)]" />
            <div className="relative z-10 p-8 text-primary-foreground">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shrink-0">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-3">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-medium">Personalize Your Experience</span>
                  </div>
                  <h2 className="text-xl font-bold">Make This Dashboard Yours</h2>
                  <p className="text-sm text-primary-foreground/80 mt-1 max-w-lg">
                    Tell us your background and interests. We'll show you the exact bills, executive orders, and policies that affect your life.
                  </p>
                </div>
                <Button asChild variant="secondary" size="lg" className="shrink-0 shadow-lg group">
                  <Link to="/onboarding">
                    Set Up Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Grid — enhanced with Stitch hover patterns */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-12">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative"
            >
              <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-ring border border-border/50">
                {/* Gradient top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${link.gradient}`} />
                <CardContent className="pt-5 pb-5">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${link.lightBg} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                    <link.icon className={`h-6 w-6 ${link.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-base mb-0.5">{link.title}</h3>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span>Explore</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-0.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two-column layout for notifications + actions */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left column: Notifications with border-l-4 accent from Stitch */}
          {onboarded && relevantNotifs.length > 0 && (
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Bell className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Affecting You</h2>
                    <p className="text-xs text-muted-foreground">Personalized alerts</p>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                  <Link to="/settings">View All</Link>
                </Button>
              </div>
              <div className="flex flex-col gap-3">
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
            </section>
          )}

          {/* Right column: Actions feed */}
          <section className={onboarded && relevantNotifs.length > 0 ? 'lg:col-span-3' : 'lg:col-span-5'}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                  <Zap className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Government Actions{onboarded ? ' For You' : ''}</h2>
                  <p className="text-xs text-muted-foreground">Executive orders, rules & rulings</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                <Link to="/actions">View All</Link>
              </Button>
            </div>
            <ActionFeed limit={4} compact />
          </section>
        </div>

        {/* Representatives section */}
        {user?.state_code && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Your Representatives</h2>
                  <p className="text-xs text-muted-foreground">Monitor voting records & activity</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                <Link to="/reps">View All</Link>
              </Button>
            </div>
            <RepList stateFilter={user.state_code} compact />
          </section>
        )}

        {/* Civic Intelligence CTA — from Stitch civic-gradient card */}
        <section className="mt-12">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/85 p-8 text-primary-foreground shadow-xl shadow-primary/15 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Civic Intelligence Briefing</h3>
                <p className="text-sm text-primary-foreground/80 max-w-lg leading-relaxed">
                  Based on your tracking history, get personalized impact reports on bills and executive orders that affect your community.
                </p>
              </div>
              <Button asChild variant="secondary" className="shrink-0 shadow-lg group">
                <Link to="/actions">
                  Review Actions
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
