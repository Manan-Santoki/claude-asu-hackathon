import { useEffect, useState, useCallback, useMemo } from 'react'
import { Search, X, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBillStore } from '@/stores/useBillStore'
import { CATEGORIES } from '@/lib/categories'
import BillCard from './BillCard'
import DataSourceBadge from '@/components/shared/DataSourceBadge'

const STATUS_OPTIONS = [
  { value: 'introduced', label: 'Introduced' },
  { value: 'in_committee', label: 'In Committee' },
  { value: 'passed_house', label: 'Passed House' },
  { value: 'passed_senate', label: 'Passed Senate' },
  { value: 'enacted', label: 'Enacted' },
  { value: 'vetoed', label: 'Vetoed' },
]

interface BillListProps {
  stateFilter?: string
  compact?: boolean
}

export default function BillList({ stateFilter, compact }: BillListProps) {
  const { bills, totalBills, isLoading, fetchBills, filters } = useBillStore()
  const [searchInput, setSearchInput] = useState('')
  const [category, setCategory] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')

  const loadBills = useCallback(
    (page = 1) => {
      fetchBills({
        page,
        state: stateFilter,
        category: category || undefined,
        status: status || undefined,
        search: searchInput || undefined,
      })
    },
    [fetchBills, stateFilter, category, status, searchInput]
  )

  // Fetch on mount and when filters change
  useEffect(() => {
    loadBills(1)
  }, [category, status, stateFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBills(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilterCount = [category, status, searchInput].filter(Boolean).length

  const sortedBills = useMemo(() => {
    const arr = [...bills]
    switch (sortBy) {
      case 'oldest':
        arr.sort((a, b) => new Date(a.introduced_date || '').getTime() - new Date(b.introduced_date || '').getTime())
        break
      case 'status': {
        const order: Record<string, number> = { enacted: 0, passed_senate: 1, passed_house: 2, in_committee: 3, introduced: 4, vetoed: 5 }
        arr.sort((a, b) => (order[a.status] ?? 4) - (order[b.status] ?? 4))
        break
      }
      default: // newest
        arr.sort((a, b) => new Date(b.last_action_date || b.introduced_date || '').getTime() - new Date(a.last_action_date || a.introduced_date || '').getTime())
    }
    return arr
  }, [bills, sortBy])

  const handleLoadMore = () => {
    const nextPage = (filters.page ?? 1) + 1
    fetchBills({
      page: nextPage,
      state: stateFilter,
      category: category || undefined,
      status: status || undefined,
      search: searchInput || undefined,
    })
  }

  const hasMore = bills.length < totalBills

  return (
    <div className="flex flex-col gap-4">
      {/* Source indicator + Filter bar */}
      <div className="flex items-center justify-between">
        <DataSourceBadge sourceKey="bills" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Keyword search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') loadBills(1) }}
            className="pl-9 h-9"
          />
        </div>

        {/* Category dropdown */}
        <Select value={category} onValueChange={(v) => setCategory(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status dropdown */}
        <Select value={status} onValueChange={(v) => setStatus(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <ArrowUpDown className="h-3 w-3 mr-1" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filter indicators */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </span>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => {
            setCategory('')
            setStatus('')
            setSearchInput('')
            setSortBy('newest')
          }}>
            <X className="h-3 w-3 mr-1" /> Clear all
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && bills.length === 0 && (
        <div className={compact ? "grid gap-4 grid-cols-1" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
          {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl border p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
              <div className="flex justify-between pt-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill cards grid */}
      {!isLoading && bills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No bills found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
      )}

      {bills.length > 0 && (
        <>
          <div className={compact ? "grid gap-4 grid-cols-1" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"}>
            {sortedBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}

          {/* Result count */}
          <p className="text-xs text-muted-foreground text-center">
            Showing {bills.length} of {totalBills} bills
          </p>
        </>
      )}
    </div>
  )
}
