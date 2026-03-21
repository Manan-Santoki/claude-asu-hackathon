import { Scale, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { LegalChallenge } from '@/api/actions'

const statusConfig: Record<LegalChallenge['status'], { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
  upheld: { label: 'Upheld', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  overturned: { label: 'Overturned', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  settled: { label: 'Settled', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle2 },
}

interface LegalChallengesProps {
  challenges: LegalChallenge[]
}

export default function LegalChallenges({ challenges }: LegalChallengesProps) {
  if (challenges.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-amber-600" />
        <h2 className="text-lg font-semibold">Legal Challenges</h2>
        <Badge variant="outline" className="text-xs">
          {challenges.length}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {challenges.map((challenge, index) => {
          const config = statusConfig[challenge.status]
          const StatusIcon = config.icon

          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {challenge.case_name}
                  </CardTitle>
                  <Badge variant="outline" className={`shrink-0 text-xs ${config.color}`}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {challenge.court}
                </p>
                <p className="text-sm leading-relaxed">
                  {challenge.summary}
                </p>
                {challenge.ruling_date && (
                  <p className="text-xs text-muted-foreground">
                    Ruling: {new Date(challenge.ruling_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {challenges.some((c) => c.status === 'pending') && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Pending legal challenges may change the status or enforcement of this action.
          </p>
        </div>
      )}
    </div>
  )
}
