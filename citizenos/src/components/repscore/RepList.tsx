import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import RepCard from './RepCard'
import { useRepStore } from '@/stores/useRepStore'
import DataSourceBadge from '@/components/shared/DataSourceBadge'
import { getRepScoreBatch } from '@/api/reps'
import type { RepScores } from '@/api/reps'

interface RepListProps {
  stateFilter?: string
  compact?: boolean
}

export default function RepList({ stateFilter, compact }: RepListProps) {
  const { reps, isLoading, fetchReps } = useRepStore()
  const [scores, setScores] = useState<Record<string, RepScores>>({})

  useEffect(() => {
    fetchReps({ state: stateFilter })
  }, [stateFilter, fetchReps])

  // Batch fetch scores for all reps (avoids N+1 API calls)
  useEffect(() => {
    if (reps.length === 0) return
    getRepScoreBatch(reps).then(setScores).catch(() => {})
  }, [reps])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (reps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No representatives found.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <DataSourceBadge sourceKey="reps" />
      {reps.map((rep) => (
        <RepCard
          key={rep.id}
          rep={rep}
          score={scores[rep.member_id]?.overall_accountability_score}
          compact={compact}
        />
      ))}
    </div>
  )
}
