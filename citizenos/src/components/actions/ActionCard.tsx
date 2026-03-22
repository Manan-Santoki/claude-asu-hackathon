import { useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ActionTypeBadge from './ActionTypeBadge'
import { useActionStore } from '@/stores/useActionStore'
import type { GovernmentAction } from '@/api/actions'

const impactConfig: Record<string, { border: string; badge: string; text: string }> = {
  high: {
    border: 'border-l-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
    text: 'HIGH',
  },
  medium: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
    text: 'MEDIUM',
  },
  low: {
    border: 'border-l-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
    text: 'LOW',
  },
}

interface ActionCardProps {
  action: GovernmentAction
  compact?: boolean
}

export default function ActionCard({ action, compact }: ActionCardProps) {
  const navigate = useNavigate()
  const { savedActionIds, toggleSave } = useActionStore()
  const isSaved = savedActionIds.has(action.id)
  const impact = impactConfig[action.impact_level] ?? impactConfig.low

  const displayDate = action.effective_date || action.signing_date || action.publication_date

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 cursor-pointer border-l-4 ${impact.border}`}
      onClick={() => navigate(`/action/${action.id}`)}
    >
      <CardContent className={compact ? 'p-4' : 'p-5'}>
        {/* Top row: type + impact + date */}
        <div className="flex items-center gap-2 mb-3">
          <ActionTypeBadge type={action.action_type} />
          <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0 ${impact.badge}`}>
            {impact.text}
          </Badge>
          <span className="ml-auto text-[11px] text-muted-foreground font-medium shrink-0">
            {displayDate && new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 className={`font-bold leading-snug mb-2 group-hover:text-primary transition-colors ${compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-3'}`}>
          {action.title}
        </h3>

        {/* Summary */}
        {!compact && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {action.summary_ai.split('.').slice(0, 2).join('.')}.
          </p>
        )}

        {/* Categories + bookmark */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {action.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full capitalize"
              >
                {cat.replace('_', ' ')}
              </span>
            ))}
          </div>

          <button
            className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            onClick={(e) => {
              e.stopPropagation()
              toggleSave(action.id)
            }}
            aria-label={isSaved ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Affected personas */}
        {!compact && action.affected_personas.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
            <span className="font-semibold">Affects:</span>{' '}
            {action.affected_personas.map((p) => p.replace('_', ' ')).join(', ')}
          </p>
        )}

        {/* Legal challenges */}
        {action.legal_challenges.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <AlertTriangle className="h-3 w-3" />
            {action.legal_challenges.length} legal challenge{action.legal_challenges.length > 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
