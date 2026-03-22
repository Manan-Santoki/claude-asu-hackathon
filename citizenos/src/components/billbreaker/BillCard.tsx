import { useNavigate } from 'react-router-dom'
import { Bookmark, Calendar, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBillStore } from '@/stores/useBillStore'
import { getCategoryById } from '@/lib/categories'
import type { Bill } from '@/api/bills'

const STATUS_CONFIG: Record<
  Bill['status'],
  { label: string; color: string }
> = {
  introduced: { label: 'Introduced', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_committee: { label: 'In Committee', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  passed_house: { label: 'Passed House', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  passed_senate: { label: 'Passed Senate', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  enacted: { label: 'Enacted', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  vetoed: { label: 'Vetoed', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
}

const PARTY_COLOR: Record<string, string> = {
  D: 'text-blue-600 dark:text-blue-400',
  R: 'text-red-600 dark:text-red-400',
  I: 'text-purple-600 dark:text-purple-400',
}

interface BillCardProps {
  bill: Bill
}

export default function BillCard({ bill }: BillCardProps) {
  const navigate = useNavigate()
  const { savedBillIds, toggleSave } = useBillStore()
  const isSaved = savedBillIds.has(bill.id)
  const statusCfg = STATUS_CONFIG[bill.status]

  const handleClick = () => {
    navigate(`/bill/${bill.id}`)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleSave(bill.id)
  }

  const dateStr = bill.introduced_date || bill.last_action_date
  const parsedDate = dateStr ? new Date(dateStr) : null
  const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent'

  const billIdDisplay =
    bill.bill_type === 'hr'
      ? `H.R. ${bill.bill_number}`
      : bill.bill_type === 's'
        ? `S. ${bill.bill_number}`
        : bill.bill_id

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30"
      onClick={handleClick}
    >
      <CardContent className="flex flex-col gap-3">
        {/* Top row: bill ID + status + save */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-muted-foreground">{billIdDisplay}</span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}
            >
              {statusCfg.label}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleSave}
              aria-label={isSaved ? 'Unsave bill' : 'Save bill'}
            >
              <Bookmark
                className={`h-4 w-4 transition-colors ${
                  isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {bill.short_title}
        </h3>

        {/* Summary preview */}
        {bill.summary_ai && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {bill.summary_ai.replace(/^##\s+.+\n\n/, '').replace(/\n/g, ' ').replace(/- /g, '').trim()}
          </p>
        )}

        {/* Category badges */}
        <div className="flex flex-wrap gap-1.5">
          {bill.categories.map((catId) => {
            const cat = getCategoryById(catId)
            return (
              <Badge key={catId} variant="secondary" className="text-[10px] px-1.5 py-0">
                {cat?.label ?? catId}
              </Badge>
            )
          })}
        </div>

        {/* Footer: sponsor + date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1 truncate">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{bill.sponsor_name}</span>
            <span className={`font-semibold ${PARTY_COLOR[bill.sponsor_party] ?? ''}`}>
              ({bill.sponsor_party})
            </span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
