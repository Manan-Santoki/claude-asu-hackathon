import { useEffect } from 'react'
import { useBillStore } from '@/stores/useBillStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, Globe } from 'lucide-react'

interface BillImpactSectionProps {
  billId: string
}

export default function BillImpactSection({ billId }: BillImpactSectionProps) {
  const impactResults = useBillStore((s) => s.impactResults)
  const isImpactLoading = useBillStore((s) => s.isImpactLoading)
  const fetchImpact = useBillStore((s) => s.fetchImpact)

  useEffect(() => {
    if (billId) {
      fetchImpact(billId)
    }
  }, [billId, fetchImpact])

  if (isImpactLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Who does this affect?</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!impactResults) return null

  // General bill — affects everyone broadly
  if (impactResults.isGeneral) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Who does this affect?</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                <Globe className="size-3.5" />
              </span>
              General Public
              <Badge variant="secondary" className="text-xs">General</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">
              {impactResults.generalStatement}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Specific groups affected
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Who does this affect?</h2>
      <div className="space-y-3">
        {impactResults.affectedGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="size-3.5" />
                </span>
                {group.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/90">
                {group.impact}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
