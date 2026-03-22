import { useState } from 'react'
import { Globe, Briefcase, GraduationCap, Store, Mail, Check, ArrowRight, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDemoStore } from '@/stores/useDemoStore'
import { DEMO_PERSONAS } from '@/lib/demoScripts'
import { useNavigate } from 'react-router-dom'

const ICONS: Record<string, React.ElementType> = {
  Globe,
  Briefcase,
  GraduationCap,
  Store,
}

export default function DemoCTA() {
  const selectedPersona = useDemoStore(s => s.selectedPersona)
  const completedPersonas = useDemoStore(s => s.completedPersonas)
  const capturedEmail = useDemoStore(s => s.capturedEmail)
  const switchPersona = useDemoStore(s => s.switchPersona)
  const exitDemo = useDemoStore(s => s.exitDemo)
  const navigate = useNavigate()

  const [email, setEmail] = useState(capturedEmail || '')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe() {
    if (!email.trim()) return
    // Store subscription in localStorage (InsForge integration in production)
    const sub = {
      email: email.trim(),
      personaId: selectedPersona?.id,
      personaName: selectedPersona?.name,
      personaTags: selectedPersona?.tags,
      personaCategories: selectedPersona?.categories,
      subscribedAt: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('demo_subscriptions') || '[]')
    existing.push(sub)
    localStorage.setItem('demo_subscriptions', JSON.stringify(existing))
    localStorage.setItem('demo_email', email.trim())
    setSubscribed(true)
  }

  function handleSignUp() {
    exitDemo()
    navigate('/signup')
  }

  if (!selectedPersona) return null

  const firstName = selectedPersona.name.split(' ')[0]

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8">
      <div className="mx-4 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
        {/* Main card */}
        <div className="rounded-2xl border bg-card p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              You just saw CitizenOS through
            </h2>
            <p className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent mt-1" style={{
              backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
            }}>
              <span className={`bg-gradient-to-r ${selectedPersona.color} bg-clip-text text-transparent`}>
                {selectedPersona.name}&apos;s eyes.
              </span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              The same platform. Four completely different experiences.
            </p>
          </div>

          {/* Persona chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {DEMO_PERSONAS.map(p => {
              const Icon = ICONS[p.icon] || Globe
              const done = completedPersonas.includes(p.id)
              return (
                <div
                  key={p.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${
                    done
                      ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {p.name.split(' ')[0]}
                  {done && <Check className="h-3 w-3" />}
                </div>
              )
            })}
          </div>

          {/* Subscribe section */}
          <div className="rounded-xl border bg-muted/30 p-5 mb-4">
            {subscribed ? (
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                  <Check className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Subscribed as {firstName}!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;ll email you when real government actions affect {firstName}&apos;s life &mdash;
                  with news articles and a link to chat.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <Mail className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Stay in {firstName}&apos;s shoes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Get real email alerts when government actions affect {firstName} &mdash;
                      court rulings, new rules, bill votes. Includes news articles and a &ldquo;Chat about this&rdquo; link.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={capturedEmail || 'your@email.com'}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                    className="flex-1"
                  />
                  <Button onClick={handleSubscribe} size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shrink-0">
                    <Mail className="h-3.5 w-3.5" />
                    Subscribe
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={switchPersona} className="w-full">
              Try Another Persona <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <span className="relative bg-card px-2 text-xs text-muted-foreground">or</span>
            </div>

            <Button onClick={handleSignUp} className="w-full">
              <UserPlus className="h-4 w-4" />
              See what affects the real YOU &mdash; Sign Up
            </Button>
          </div>

          {/* Exit */}
          <button
            onClick={exitDemo}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Exit demo
          </button>
        </div>
      </div>
    </div>
  )
}
