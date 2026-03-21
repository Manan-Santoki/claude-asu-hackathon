import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PageWrapper from '@/components/layout/PageWrapper'
import RepCard from './RepCard'
import { useRepStore } from '@/stores/useRepStore'
import { getRepScore } from '@/api/reps'
import type { RepScores } from '@/api/reps'
import { US_STATES } from '@/lib/states'

export default function RepScoreDashboard() {
  const { reps, isLoading, filters, fetchReps, setFilters } = useRepStore()
  const [search, setSearch] = useState('')
  const [scores, setScores] = useState<Record<string, RepScores>>({})
  const [sortBy, setSortBy] = useState<string>('alignment')

  useEffect(() => {
    fetchReps()
  }, [fetchReps])

  useEffect(() => {
    if (reps.length === 0) return
    const fetchScores = async () => {
      const results: Record<string, RepScores> = {}
      await Promise.all(
        reps.map(async (rep) => {
          const score = await getRepScore(rep.member_id)
          results[rep.member_id] = score
        })
      )
      setScores(results)
    }
    fetchScores()
  }, [reps])

  const handleStateChange = (value: string) => {
    setFilters({ state: value === 'all' ? undefined : value })
    fetchReps({ state: value === 'all' ? undefined : value, chamber: filters.chamber })
  }

  const handleChamberChange = (value: string) => {
    const chamber = value === 'all' ? undefined : (value as 'senate' | 'house')
    setFilters({ chamber })
    fetchReps({ state: filters.state, chamber })
  }

  // Filter by search
  let filtered = reps
  if (search) {
    const q = search.toLowerCase()
    filtered = reps.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.state_code.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q)
    )
  }

  // Sort by score
  if (sortBy === 'alignment') {
    filtered = [...filtered].sort(
      (a, b) =>
        (scores[b.member_id]?.overall_accountability_score ?? 0) -
        (scores[a.member_id]?.overall_accountability_score ?? 0)
    )
  } else if (sortBy === 'loyalty') {
    filtered = [...filtered].sort((a, b) => b.votes_with_party_pct - a.votes_with_party_pct)
  } else if (sortBy === 'attendance') {
    filtered = [...filtered].sort((a, b) => a.missed_votes_pct - b.missed_votes_pct)
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-1">RepScore Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Track how your representatives vote and whether they keep their campaign promises.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />

        <Select value={filters.state ?? 'all'} onValueChange={handleStateChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {US_STATES.map((s) => (
              <SelectItem key={s.code} value={s.code}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.chamber ?? 'all'} onValueChange={handleChamberChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Chambers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chambers</SelectItem>
            <SelectItem value="senate">Senate</SelectItem>
            <SelectItem value="house">House</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alignment">Alignment Score</SelectItem>
            <SelectItem value="loyalty">Party Loyalty</SelectItem>
            <SelectItem value="attendance">Attendance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results summary */}
      <div className="mb-4">
        <Badge variant="outline" className="text-xs">
          {filtered.length} representative{filtered.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Rep grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No representatives found matching your filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((rep) => (
            <RepCard
              key={rep.id}
              rep={rep}
              score={scores[rep.member_id]?.overall_accountability_score}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
