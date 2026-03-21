import { useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ActionTypeBadge from './ActionTypeBadge'
import { useActionStore } from '@/stores/useActionStore'
import type { GovernmentAction } from '@/api/actions'

const impactColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
}

interface ActionCardProps {
  action: GovernmentAction
  compact?: boolean
}

export default function ActionCard({ action, compact }: ActionCardProps) {
  const navigate = useNavigate()
  const { savedActionIds, toggleSave } = useActionStore()
  const isSaved = savedActionIds.has(action.id)

  const displayDate = action.effective_date || action.signing_date || action.publication_date

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/action/${action.id}`)}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-2 mb-2">
          <ActionTypeBadge type={action.action_type} />
          <Badge variant="outline" className={`text-xs ${impactColors[action.impact_level]}`}>
            {action.impact_level.toUpperCase()}
          </Badge>
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {displayDate && new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <h3 className={`font-semibold leading-tight mb-1.5 ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'}`}>
          {action.title}
        </h3>

        {!compact && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {action.summary_ai.split('.').slice(0, 2).join('.')}.
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {action.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs capitalize">
                {cat.replace('_', ' ')}
              </Badge>
            ))}
          </div>

          <button
            className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              toggleSave(action.id)
            }}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>

        {!compact && action.affected_personas.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Affects: {action.affected_personas.map((p) => p.replace('_', ' ')).join(', ')}
          </p>
        )}

        {action.legal_challenges.length > 0 && (
          <p className="text-xs text-amber-600 mt-1">
            {action.legal_challenges.length} legal challenge{action.legal_challenges.length > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
