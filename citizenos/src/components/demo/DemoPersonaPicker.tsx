import { Globe, Briefcase, GraduationCap, Store, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDemoStore } from '@/stores/useDemoStore'
import { DEMO_PERSONAS, type DemoPersona } from '@/lib/demoScripts'

const ICONS: Record<string, React.ElementType> = {
  Globe,
  Briefcase,
  GraduationCap,
  Store,
}

function PersonaCard({ persona, onSelect, completed }: { persona: DemoPersona; onSelect: (id: string) => void; completed: boolean }) {
  const Icon = ICONS[persona.icon] || Globe

  return (
    <button
      onClick={() => onSelect(persona.id)}
      className={`group relative flex flex-col items-center gap-3 rounded-xl border-2 bg-card p-5 text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
        completed ? 'border-green-500/50 opacity-75' : 'border-border hover:' + persona.colorAccent
      }`}
    >
      {completed && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white text-xs">
          {'\u2713'}
        </div>
      )}

      {/* Avatar */}
      <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${persona.color} text-white text-2xl shadow-lg`}>
        <Icon className="h-7 w-7" />
      </div>

      {/* Info */}
      <div>
        <h3 className="font-bold text-base">{persona.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{persona.role}</p>
        <p className="text-xs text-muted-foreground">{persona.location}</p>
      </div>

      {/* Question */}
      <p className="text-sm italic text-muted-foreground">
        &ldquo;{persona.question}&rdquo;
      </p>

      {/* CTA */}
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
        Start <span aria-hidden>{'\u2192'}</span>
      </span>
    </button>
  )
}

export default function DemoPersonaPicker() {
  const selectPersona = useDemoStore(s => s.selectPersona)
  const completedPersonas = useDemoStore(s => s.completedPersonas)
  const exitDemo = useDemoStore(s => s.exitDemo)

  function handleWatchAll() {
    // Start with first non-completed persona, or first one
    const next = DEMO_PERSONAS.find(p => !completedPersonas.includes(p.id)) || DEMO_PERSONAS[0]
    selectPersona(next.id)
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="mx-4 w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Who do you want to be?
          </h2>
          <p className="mt-2 text-base text-white/70">
            Pick a persona to see CitizenOS through their eyes.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_PERSONAS.map(persona => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onSelect={selectPersona}
              completed={completedPersonas.includes(persona.id)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            onClick={handleWatchAll}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Watch All Four (Auto-Play)
          </Button>
          <button
            onClick={exitDemo}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            Exit demo
          </button>
        </div>
      </div>
    </div>
  )
}
