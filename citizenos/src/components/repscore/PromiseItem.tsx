import { useState } from 'react'
import { Check, X, Clock, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CampaignPromise } from '@/api/reps'

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  kept: {
    label: 'Kept',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: <Check className="h-3 w-3" />,
  },
  broken: {
    label: 'Broken',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: <X className="h-3 w-3" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: <Clock className="h-3 w-3" />,
  },
  not_yet_addressed: {
    label: 'TBD',
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: <HelpCircle className="h-3 w-3" />,
  },
}

interface PromiseItemProps {
  promise: CampaignPromise
}

export default function PromiseItem({ promise }: PromiseItemProps) {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[promise.status]

  return (
    <div className="border rounded-lg p-3">
      <div
        className="flex items-start gap-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <p className="text-sm font-medium">{promise.promise_text}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={`text-xs ${config.color} flex items-center gap-1`}
            >
              {config.icon}
              {config.label}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {promise.category.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <button className="mt-1 text-muted-foreground shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Evidence</p>
            <p className="text-sm">{promise.evidence}</p>
          </div>
          {promise.source_url && (
            <a
              href={promise.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline block"
            >
              View source
            </a>
          )}
        </div>
      )}
    </div>
  )
}
