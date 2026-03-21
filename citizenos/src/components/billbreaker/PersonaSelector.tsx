import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useBillStore } from '@/stores/useBillStore'
import { PERSONAS, getPersonaById } from '@/lib/personas'
import {
  GraduationCap,
  Shield,
  Globe,
  Store,
  Heart,
  Users,
  Stethoscope,
  Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Shield,
  Globe,
  Store,
  Heart,
  Users,
  Stethoscope,
  Briefcase,
}

interface PersonaSelectorProps {
  billId: string
}

export default function PersonaSelector({ billId }: PersonaSelectorProps) {
  const profiles = useAuthStore((s) => s.profiles)
  const fetchImpact = useBillStore((s) => s.fetchImpact)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleToggle = useCallback(
    (personaId: string) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(personaId)) {
          next.delete(personaId)
        } else {
          next.add(personaId)
        }
        const ids = Array.from(next)
        if (ids.length > 0) {
          fetchImpact(billId, ids)
        }
        return next
      })
    },
    [billId, fetchImpact]
  )

  if (!profiles || profiles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Complete onboarding to see personalized impacts
        </p>
      </div>
    )
  }

  // Only show personas that match the user's profiles
  const availablePersonas = profiles
    .map((id) => getPersonaById(id))
    .filter(Boolean) as (typeof PERSONAS)[number][]

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Select your perspectives
      </p>
      <div className="flex flex-wrap gap-2">
        {availablePersonas.map((persona) => {
          const isSelected = selected.has(persona.id)
          const Icon = ICON_MAP[persona.icon]

          return (
            <Button
              key={persona.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggle(persona.id)}
              className="gap-1.5 transition-all"
            >
              {Icon && <Icon className="size-3.5" />}
              {persona.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
