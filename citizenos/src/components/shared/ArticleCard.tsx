import { ExternalLink, Newspaper } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { PersonArticle, ArticleType } from '@/api/articles'

const TYPE_STYLES: Record<ArticleType, string> = {
  news: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  opinion: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  blog: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  press_release: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
}

const TYPE_LABELS: Record<ArticleType, string> = {
  news: 'News',
  opinion: 'Opinion',
  blog: 'Blog',
  press_release: 'Press',
}

interface ArticleCardProps {
  article: PersonArticle
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${article.title} — ${article.source}`}
      className="block flex-shrink-0 w-[280px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-[280px] overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        {/* Image area */}
        <div className="relative h-[120px] w-full overflow-hidden">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Newspaper className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
          {/* Content type badge */}
          <Badge
            variant="secondary"
            className={cn(
              'absolute top-2 right-2 text-[10px] px-1.5 py-0',
              TYPE_STYLES[article.content_type]
            )}
          >
            {TYPE_LABELS[article.content_type]}
          </Badge>
        </div>

        {/* Text content */}
        <div className="flex flex-col flex-1 p-3 gap-1">
          <h3 className="text-sm font-semibold leading-tight line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {article.snippet}
          </p>
          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto pt-1">
            <span className="truncate max-w-[180px]">
              {article.source} · {formatRelativeDate(article.published_date)}
            </span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </div>
        </div>
      </Card>
    </a>
  )
}
