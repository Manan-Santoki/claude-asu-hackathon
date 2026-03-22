import { Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

const PARTY_BADGE: Record<string, { label: string; className: string }> = {
  D: { label: 'Democrat', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  R: { label: 'Republican', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  I: { label: 'Independent', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
}

interface BillHeaderProps {
  bill: Bill
}

export default function BillHeader({ bill }: BillHeaderProps) {
  const statusCfg = STATUS_CONFIG[bill.status]
  const partyCfg = PARTY_BADGE[bill.sponsor_party]

  const billNumber =
    bill.bill_type === 'hr'
      ? `H.R. ${bill.bill_number}`
      : bill.bill_type === 's'
        ? `S. ${bill.bill_number}`
        : bill.bill_id

  const dateStr = bill.introduced_date || bill.last_action_date
  const parsedDate = dateStr ? new Date(dateStr) : null
  const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recent'

  return (
    <div className="flex flex-col gap-4">
      {/* Bill number + status */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-mono font-semibold text-muted-foreground">
          {billNumber}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}
        >
          {statusCfg.label}
        </span>
      </div>

      {/* Full title */}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {bill.title}
      </h1>

      {/* Sponsor + party */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="font-medium text-foreground">{bill.sponsor_name}</span>
          <span className="text-muted-foreground">({bill.sponsor_state})</span>
        </span>
        {partyCfg && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${partyCfg.className}`}
          >
            {partyCfg.label}
          </span>
        )}
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Introduced {formattedDate}</span>
      </div>

      {/* Category badges */}
      <div className="flex flex-wrap gap-2">
        {bill.categories.map((catId) => {
          const cat = getCategoryById(catId)
          return (
            <Badge key={catId} variant="secondary">
              {cat?.label ?? catId}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
