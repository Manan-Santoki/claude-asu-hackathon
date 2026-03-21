import { useBillStore } from '@/stores/useBillStore'
import { getPersonaById } from '@/lib/personas'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { User } from 'lucide-react'

export default function ImpactPanel() {
  const impactResults = useBillStore((s) => s.impactResults)
  const isImpactLoading = useBillStore((s) => s.isImpactLoading)

  if (isImpactLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const entries = Object.entries(impactResults)

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center">
        <User className="mx-auto mb-2 size-5 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Select personas above to see how this bill affects you
        </p>
      </div>
    )
  }

  return (
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
              <p className="text-sm leading-relaxed text-foreground/90">
                {text}
              </p>
            </CardContent>
            {index < entries.length - 1 && <Separator />}
          </Card>
        )
      })}
    </div>
  )
}
