import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SponsoredBill } from '@/api/reps'

const statusColors: Record<string, string> = {
  introduced: 'bg-gray-100 text-gray-700',
  in_committee: 'bg-blue-100 text-blue-700',
  passed_house: 'bg-green-100 text-green-700',
  passed_senate: 'bg-green-100 text-green-700',
  enacted: 'bg-emerald-100 text-emerald-700',
  vetoed: 'bg-red-100 text-red-700',
}

interface BillsSponsoredProps {
  bills: SponsoredBill[]
}

export default function BillsSponsored({ bills }: BillsSponsoredProps) {
  const navigate = useNavigate()

  if (bills.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bills Sponsored</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No sponsored bills found.</p>
        </CardContent>
      </Card>
    )
  }

  function billIdToPath(billId: string): string {
    const match = billId.match(/^(hr|s|hjres|sjres)(\d+)/)
    if (match) return `${match[1]}-${match[2]}`
    return billId
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Bills Sponsored</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {bills.map((bill) => (
            <div
              key={bill.bill_id}
              className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/bill/${billIdToPath(bill.bill_id)}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-primary hover:underline">
                  {bill.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground uppercase">{bill.bill_id}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {bill.role}
                  </Badge>
                  <Badge className={`text-xs ${statusColors[bill.status] ?? ''}`}>
                    {bill.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {(() => { const d = new Date(bill.introduced_date); return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); })()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
