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

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Government actions,{' '}
            <span className="text-primary">explained for you</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            CitizenOS tracks bills, executive orders, agency rules, and court rulings —
            then uses AI to show you exactly how they affect your life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-base px-8">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          Everything you need to stay informed
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Go beyond the headlines. Understand what the government is actually doing and how it impacts you.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2">
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
      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Recent government actions
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Here's a preview of what CitizenOS tracks. Sign up to see personalized impact analysis.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {sampleActions.map((action) => (
              <Card key={action.title} className="border-border/60">
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

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/signup">
                Sign up to see full details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          Democracy works better when you're informed
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Create a free account to get personalized impact analysis, track your representatives, and find candidates that match your values.
        </p>
        <Button asChild size="lg" className="text-base px-8">
          <Link to="/signup">
            Create Your Free Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>CitizenOS — Civic engagement for everyone</span>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
