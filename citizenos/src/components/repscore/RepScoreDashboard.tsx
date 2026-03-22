import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RepScore Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track how your representatives vote and whether they keep their promises.
          </p>
        </div>
      </div>

      {/* Filters — elevated card with subtle shadow */}
      <div className="rounded-xl border border-border/50 bg-card p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, state, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-lg"
            />
          </div>

          <Select value={filters.state ?? 'all'} onValueChange={handleStateChange}>
            <SelectTrigger className="w-40 h-10">
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
            <SelectTrigger className="w-36 h-10">
              <SelectValue placeholder="All Chambers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chambers</SelectItem>
              <SelectItem value="senate">Senate</SelectItem>
              <SelectItem value="house">House</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alignment">Alignment Score</SelectItem>
              <SelectItem value="loyalty">Party Loyalty</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="outline" className="text-xs font-medium rounded-full px-3">
          {filtered.length} representative{filtered.length !== 1 ? 's' : ''}
        </Badge>
        {Object.keys(scores).length > 0 && (
          <Badge variant="outline" className="text-xs font-medium rounded-full px-3 text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/50">
            {Object.values(scores).filter(s => s.overall_accountability_score >= 70).length} high scoring
          </Badge>
        )}
      </div>

      {/* Rep grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No representatives found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
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
