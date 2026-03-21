import { Calendar, Building2, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCategoryById } from '@/lib/categories'
import { useActionStore } from '@/stores/useActionStore'
import ActionTypeBadge from './ActionTypeBadge'
import type { GovernmentAction } from '@/api/actions'

const impactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  repealed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

interface ActionHeaderProps {
  action: GovernmentAction
}

export default function ActionHeader({ action }: ActionHeaderProps) {
  const { savedActionIds, toggleSave } = useActionStore()
  const isSaved = savedActionIds.has(action.id)

  const displayDate = action.effective_date || action.signing_date || action.publication_date
  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="flex flex-col gap-4">
      {/* Type badge + impact + status */}
      <div className="flex flex-wrap items-center gap-3">
        <ActionTypeBadge type={action.action_type} />
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${impactColors[action.impact_level]}`}>
          {action.impact_level.toUpperCase()} IMPACT
        </span>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[action.status] ?? statusColors.active}`}>
          {action.status.toUpperCase()}
        </span>
        {action.executive_order_number && (
          <span className="text-sm font-mono font-semibold text-muted-foreground">
            EO {action.executive_order_number}
          </span>
        )}
      </div>

      {/* Full title */}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {action.title}
      </h1>

      {/* Authority + agencies */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="font-medium text-foreground">{action.issuing_authority}</span>
        </span>
        {action.agencies.length > 0 && (
          <span className="text-muted-foreground">
            via {action.agencies.join(', ')}
          </span>
        )}
      </div>

      {/* Date */}
      {formattedDate && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {action.effective_date ? 'Effective' : action.signing_date ? 'Signed' : 'Published'} {formattedDate}
          </span>
        </div>
      )}

      {/* Status detail */}
      {action.status_detail && (
        <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          {action.status_detail}
        </p>
      )}

      {/* Category badges + actions */}
      <div className="flex flex-wrap items-center gap-2">
        {action.categories.map((catId) => {
          const cat = getCategoryById(catId)
          return (
            <Badge key={catId} variant="secondary">
              {cat?.label ?? catId}
            </Badge>
          )
        })}

        <div className="ml-auto flex items-center gap-2">
          {action.full_text_url && (
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={action.full_text_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Full Text
              </a>
            </Button>
          )}
          <Button
            variant={isSaved ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => toggleSave(action.id)}
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
