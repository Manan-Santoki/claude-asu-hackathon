import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import PromiseItem from './PromiseItem'
import type { CampaignPromise } from '@/api/reps'

type PromiseStatus = CampaignPromise['status'] | 'all'

interface PromiseTrackerProps {
  promises: CampaignPromise[]
  isLoading: boolean
}

export default function PromiseTracker({ promises, isLoading }: PromiseTrackerProps) {
  const [filter, setFilter] = useState<PromiseStatus>('all')

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Campaign Promises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (promises.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Campaign Promises</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No promises tracked for this representative.</p>
        </CardContent>
      </Card>
    )
  }

  const kept = promises.filter((p) => p.status === 'kept').length
  const broken = promises.filter((p) => p.status === 'broken').length
  const inProgress = promises.filter((p) => p.status === 'in_progress').length
  const tbd = promises.filter((p) => p.status === 'not_yet_addressed').length

  const filtered = filter === 'all' ? promises : promises.filter((p) => p.status === filter)

  const statusFilters: { value: PromiseStatus; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: promises.length },
    { value: 'kept', label: 'Kept', count: kept },
    { value: 'broken', label: 'Broken', count: broken },
    { value: 'in_progress', label: 'In Progress', count: inProgress },
    { value: 'not_yet_addressed', label: 'TBD', count: tbd },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Campaign Promises</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-green-600 font-medium">{kept} kept</span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-red-600 font-medium">{broken} broken</span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="text-yellow-600 font-medium">{inProgress} in progress</span>
          {tbd > 0 && (
            <>
              <span className="text-muted-foreground">&middot;</span>
              <span className="text-gray-500 font-medium">{tbd} TBD</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {statusFilters.map((sf) => (
            <Badge
              key={sf.value}
              variant={filter === sf.value ? 'default' : 'outline'}
              className="cursor-pointer text-xs"
              onClick={() => setFilter(sf.value)}
            >
              {sf.label} ({sf.count})
            </Badge>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((promise) => (
            <PromiseItem key={promise.id} promise={promise} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
