import { useState } from 'react'
import { Mail, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDemoStore } from '@/stores/useDemoStore'

export default function DemoEmailCapture() {
  const [email, setEmail] = useState('')
  const captureEmail = useDemoStore(s => s.captureEmail)
  const setPhase = useDemoStore(s => s.setPhase)

  function handleStart() {
    if (email.trim()) {
      captureEmail(email.trim())
      localStorage.setItem('demo_email', email.trim())
    }
    setPhase('picker')
  }

  function handleSkip() {
    setPhase('picker')
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border bg-card p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white text-2xl">
            {'\u{1F1FA}\u{1F1F8}'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to CitizenOS</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            See how government affects real people through an interactive guided demo.
          </p>
        </div>

        {/* Email field */}
        <div className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              className="pl-10"
            />
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Demo
          </Button>
        </div>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip, just show me <ArrowRight className="inline h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
