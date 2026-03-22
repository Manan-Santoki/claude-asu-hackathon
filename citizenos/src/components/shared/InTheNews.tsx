import { useEffect } from 'react'
import { Newspaper } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useArticleStore } from '@/stores/useArticleStore'
import ArticleCard from './ArticleCard'

interface InTheNewsProps {
  personId: string
  personName: string
}

export default function InTheNews({ personId, personName }: InTheNewsProps) {
  const articles = useArticleStore((s) => s.articlesByPerson[personId])
  const isLoading = useArticleStore((s) => s.loadingByPerson[personId] ?? false)
  const fetchArticles = useArticleStore((s) => s.fetchArticles)

  useEffect(() => {
    fetchArticles(personId, personName)
  }, [personId, personName, fetchArticles])

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">In The News</h2>
        {articles && (
          <span className="text-sm text-muted-foreground">
            ({articles.length})
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[280px] flex-shrink-0 space-y-2">
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Articles strip */}
      {!isLoading && articles && articles.length > 0 && (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Empty state */}
      {!isLoading && articles && articles.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No recent articles found.
        </div>
      )}
    </section>
  )
}
