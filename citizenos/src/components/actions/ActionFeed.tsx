import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useActionStore } from '@/stores/useActionStore'
import { useAuthStore } from '@/stores/useAuthStore'
import ActionCard from './ActionCard'

interface ActionFeedProps {
  limit?: number
  compact?: boolean
  stateFilter?: string
}

export default function ActionFeed({ limit = 5, compact, stateFilter }: ActionFeedProps) {
  const navigate = useNavigate()
  const { feed, isFeedLoading, fetchFeed } = useActionStore()
  const user = useAuthStore((s) => s.user)
  const profiles = useAuthStore((s) => s.profiles)
  const categories = useAuthStore((s) => s.categories)

  useEffect(() => {
    fetchFeed({
      personas: profiles.length > 0 ? profiles : undefined,
      categories: categories.length > 0 ? categories : undefined,
      state: stateFilter ?? user?.state_code,
      limit,
    })
  }, [fetchFeed, profiles, categories, user?.state_code, stateFilter, limit])

  if (isFeedLoading && feed.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border p-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (feed.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-8 text-center">
        <Zap className="mx-auto mb-2 size-5 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No actions match your profile yet. Complete onboarding to get personalized updates.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {feed.slice(0, limit).map((action) => (
        <ActionCard key={action.id} action={action} compact={compact} />
      ))}

      {feed.length > 3 && (
        <button
          onClick={() => navigate('/actions')}
          className="text-sm text-primary hover:underline w-full text-center py-1"
        >
          View all actions &rarr;
        </button>
      )}
    </div>
  )
}
