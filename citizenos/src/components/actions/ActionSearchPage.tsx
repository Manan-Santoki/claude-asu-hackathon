import { useEffect, useState, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
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
import { useActionStore } from '@/stores/useActionStore'
import { CATEGORIES } from '@/lib/categories'
import { PERSONAS } from '@/lib/personas'
import ActionCard from './ActionCard'
import type { ActionType } from '@/api/actions'
import PageWrapper from '@/components/layout/PageWrapper'

const TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'bill', label: 'Bill' },
  { value: 'executive_order', label: 'Executive Order' },
  { value: 'proclamation', label: 'Proclamation' },
  { value: 'memorandum', label: 'Memorandum' },
  { value: 'final_rule', label: 'Final Rule' },
  { value: 'proposed_rule', label: 'Proposed Rule' },
  { value: 'court_ruling', label: 'Court Ruling' },
  { value: 'agency_action', label: 'Agency Action' },
]

export default function ActionSearchPage() {
  const { actions, totalActions, isLoading, fetchActions, filters } = useActionStore()
  const [searchInput, setSearchInput] = useState('')
  const [type, setType] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [persona, setPersona] = useState<string>('')

  const buildFilters = useCallback(
    (page: number) => ({
      page,
      type: (type || undefined) as ActionType | 'all' | undefined,
      category: category || undefined,
      persona: persona || undefined,
      search: searchInput || undefined,
    }),
    [type, category, persona, searchInput]
  )

  useEffect(() => {
    fetchActions(buildFilters(1))
  }, [type, category, persona]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    fetchActions(buildFilters(1))
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleLoadMore = () => {
    const nextPage = (filters.page ?? 1) + 1
    fetchActions(buildFilters(nextPage))
  }

  const hasMore = actions.length < totalActions

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-6">
        <Filter className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Government Actions</h1>
          <p className="text-sm text-muted-foreground">
            Track executive orders, rules, court rulings, and more
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-9 h-9"
            />
          </div>

          <Select value={type} onValueChange={(v) => setType(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Select value={persona} onValueChange={(v) => setPersona(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Who it affects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Everyone</SelectItem>
              {PERSONAS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={handleSearch} className="h-9">
            Search
          </Button>
        </div>

        {/* Loading skeleton */}
        {isLoading && actions.length === 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border p-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-14 rounded-full" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && actions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No actions found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {/* Action cards grid */}
        {actions.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Showing {actions.length} of {totalActions} actions
            </p>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
