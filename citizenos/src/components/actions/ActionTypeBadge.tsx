import { Badge } from '@/components/ui/badge'
import type { ActionType } from '@/api/actions'

const typeConfig: Record<ActionType, { label: string; color: string }> = {
  bill: { label: 'Bill', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  executive_order: { label: 'Exec Order', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  proclamation: { label: 'Proclamation', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  memorandum: { label: 'Memo', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  final_rule: { label: 'Rule', color: 'bg-teal-100 text-teal-700 border-teal-300' },
  proposed_rule: { label: 'Proposed Rule', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  court_ruling: { label: 'Court Ruling', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  agency_action: { label: 'Agency Action', color: 'bg-gray-100 text-gray-600 border-gray-300' },
}

interface ActionTypeBadgeProps {
  type: ActionType
  className?: string
}

export default function ActionTypeBadge({ type, className }: ActionTypeBadgeProps) {
  const config = typeConfig[type] ?? { label: type, color: '' }
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.color} ${className ?? ''}`}>
      {config.label}
    </Badge>
  )
}
