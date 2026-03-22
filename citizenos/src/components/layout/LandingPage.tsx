import { Link } from 'react-router-dom'
import {
  FileText,
  Users,
  ClipboardList,
  Zap,
  MapPin,
  Shield,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Eye,
  Scale,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: FileText,
    title: 'BillBreaker',
    description:
      'Complex legislation broken down into plain English. See AI summaries, understand personal impact, and ask questions about any bill.',
  },
  {
    icon: Zap,
    title: 'Government Actions',
    description:
      'Track executive orders, proclamations, agency rules, and court rulings — not just bills. See how they affect you.',
  },
  {
    icon: Users,
    title: 'RepScore',
    description:
      'Hold your representatives accountable. Track voting records, campaign promises, funding sources, and accountability scores.',
  },
  {
    icon: ClipboardList,
    title: 'VoteMap',
    description:
      'Take a policy quiz and get matched with candidates who align with your values. Compare them side-by-side.',
  },
  {
    icon: MapPin,
    title: 'Interactive Map',
    description:
      'Explore government activity state by state. Click any state to see bills, actions, reps, and candidates.',
  },
  {
    icon: Shield,
    title: 'Personalized Impact',
    description:
      'Select your persona — student, veteran, parent, small business owner — and see how each action impacts you specifically.',
  },
]

const stats = [
  { value: '2,400+', label: 'Bills Tracked', icon: FileText },
  { value: '535', label: 'Representatives', icon: Users },
  { value: '50', label: 'States Covered', icon: MapPin },
  { value: '100%', label: 'Free & Open', icon: Scale },
]

const sampleActions = [
  {
    type: 'Executive Order',
    title: 'Establishing the Department of Government Efficiency',
    date: 'Jan 20, 2025',
    typeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    type: 'Proclamation',
    title: 'Adjusting H-1B Nonimmigrant Visa Fee to $100,000',
    date: 'Feb 3, 2025',
    typeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    type: 'Court Ruling',
    title: 'Federal Judge Blocks Harvard Funding Freeze',
    date: 'Mar 10, 2025',
    typeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
  {
    type: 'Bill',
    title: 'Affordable Insulin Now Act',
    date: 'Jan 15, 2025',
    typeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
]

const trustSignals = [
  { icon: Eye, text: 'Non-partisan — we show facts, not opinions' },
  { icon: TrendingUp, text: 'AI-powered analysis from official government sources' },
  { icon: Shield, text: 'Your data stays private — we never sell it' },
]

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Tracking government actions in real time
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Government actions,{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                explained for you
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              CitizenOS tracks bills, executive orders, agency rules, and court rulings —
              then uses AI to show you exactly how they affect your life.
            </p>

            {/* CTA buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/map">Explore the Map</Link>
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              {trustSignals.map((signal) => (
                <div key={signal.text} className="flex items-center gap-2">
                  <signal.icon className="h-4 w-4 text-primary/70 shrink-0" />
                  <span>{signal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3 py-6 sm:py-8">
                <stat.icon className="h-5 w-5 text-primary/60 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Everything you need to stay informed
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Go beyond the headlines. Understand what the government is actually doing and how it impacts you.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/60 transition-all duration-200 hover:shadow-md hover:border-primary/20"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2.5 transition-colors duration-200 group-hover:bg-primary/15">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Sample actions preview */}
      <section className="bg-muted/40 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Recent government actions
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Here's a preview of what CitizenOS tracks. Sign up to see personalized impact analysis.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {sampleActions.map((action) => (
              <Card
                key={action.title}
                className="group border-border/60 transition-all duration-200 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${action.typeColor}`}
                    >
                      {action.type}
                    </span>
                    <span className="text-xs text-muted-foreground">{action.date}</span>
                  </div>
                  <CardTitle className="text-sm font-semibold leading-snug">
                    {action.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="group">
              <Link to="/signup">
                Sign up to see full details
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Democracy works better when you're informed
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Create a free account to get personalized impact analysis, track your representatives, and find candidates that match your values.
          </p>
          <Button asChild size="lg" className="text-base px-8 shadow-lg shadow-primary/25">
            <Link to="/signup">
              Create Your Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">CitizenOS</span>
              <span className="text-border">|</span>
              <span>Civic engagement for everyone</span>
            </div>
            <div className="flex gap-6">
              <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
              <Link to="/map" className="hover:text-foreground transition-colors">Map</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
