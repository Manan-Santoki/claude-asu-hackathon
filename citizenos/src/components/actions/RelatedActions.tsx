import { Link2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ActionTypeBadge from './ActionTypeBadge'
import { getRelatedActions } from '@/api/actions'
import type { GovernmentAction } from '@/api/actions'

interface RelatedActionsProps {
  actionId: string
}

export default function RelatedActions({ actionId }: RelatedActionsProps) {
  const navigate = useNavigate()
  const related: GovernmentAction[] = getRelatedActions(actionId)

  if (related.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Related Actions</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {related.map((action) => {
          const displayDate = action.effective_date || action.signing_date || action.publication_date

          return (
            <Card
              key={action.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/action/${action.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ActionTypeBadge type={action.action_type} />
                  <Badge variant="outline" className="text-xs">
                    {action.impact_level.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold leading-tight line-clamp-2 mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {action.summary_ai.split('.').slice(0, 1).join('.')}.
                </p>
                {displayDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(displayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
