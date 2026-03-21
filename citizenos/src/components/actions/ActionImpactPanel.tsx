import { useState, useCallback } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useActionStore } from '@/stores/useActionStore'
import { getActionStory } from '@/api/actions'
import { getPersonaById, PERSONAS } from '@/lib/personas'
import {
  GraduationCap,
  Shield,
  Globe,
  Store,
  Heart,
  Users,
  Stethoscope,
  Briefcase,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

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

interface ActionImpactPanelProps {
  actionId: string
}

export default function ActionImpactPanel({ actionId }: ActionImpactPanelProps) {
  const profiles = useAuthStore((s) => s.profiles)
  const fetchImpact = useActionStore((s) => s.fetchImpact)
  const impactResults = useActionStore((s) => s.impactResults)
  const isImpactLoading = useActionStore((s) => s.isImpactLoading)
  const selectedAction = useActionStore((s) => s.selectedAction)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showStory, setShowStory] = useState(false)
  const [story, setStory] = useState<string | null>(null)
  const [storyLoading, setStoryLoading] = useState(false)

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
          fetchImpact(actionId, ids)
        }
        return next
      })
    },
    [actionId, fetchImpact]
  )

  const handleToggleStory = useCallback(async () => {
    if (!showStory) {
      if (selectedAction?.impact_story) {
        setStory(selectedAction.impact_story)
      } else if (!story) {
        setStoryLoading(true)
        try {
          const result = await getActionStory(actionId)
          setStory(result)
        } catch {
          setStory('Unable to load impact story.')
        } finally {
          setStoryLoading(false)
        }
      }
    }
    setShowStory((prev) => !prev)
  }, [showStory, selectedAction, story, actionId])

  // Determine available personas — user profiles or action's affected_personas
  const availablePersonas = (profiles && profiles.length > 0
    ? profiles
    : selectedAction?.affected_personas ?? []
  )
    .map((id) => getPersonaById(id))
    .filter(Boolean) as (typeof PERSONAS)[number][]

  const entries = Object.entries(impactResults)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">How does this affect you?</h2>

      {/* Persona selector */}
      {availablePersonas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Complete onboarding to see personalized impacts
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Select your perspectives</p>
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
      )}

      {/* Impact results */}
      {isImpactLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map(([personaId, text], index) => {
            const persona = getPersonaById(personaId)
            return (
              <Card key={personaId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="size-3.5" />
                    </span>
                    {persona?.label ?? personaId}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/90">{text}</p>
                </CardContent>
                {index < entries.length - 1 && <Separator />}
              </Card>
            )
          })}
        </div>
      ) : null}

      {/* Impact story collapsible */}
      <div className="rounded-lg border bg-card">
        <Button
          variant="ghost"
          onClick={handleToggleStory}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/50"
        >
          <span className="text-sm font-semibold">How this affects your day</span>
          {showStory ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </Button>

        {showStory && (
          <div className="border-t px-4 py-4">
            {storyLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <p className="text-sm italic leading-relaxed text-foreground/80">{story}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
