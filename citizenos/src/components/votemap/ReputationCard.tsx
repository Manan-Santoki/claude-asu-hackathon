import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getCandidateReputation, type CandidateReputation } from '@/api/candidates'
import FundingChart from './FundingChart'
import {
  Shield,
  AlertTriangle,
  ThumbsUp,
  DollarSign,
} from 'lucide-react'

interface Props {
  candidateId: string
}

function getSentimentColor(s: string): string {
  if (s === 'positive') return 'text-green-600 bg-green-50'
  if (s === 'negative') return 'text-red-600 bg-red-50'
  if (s === 'mixed') return 'text-yellow-600 bg-yellow-50'
  return 'text-gray-600 bg-gray-50'
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600'
  if (score >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

export default function ReputationCard({ candidateId }: Props) {
  const [rep, setRep] = useState<CandidateReputation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    getCandidateReputation(candidateId).then((data) => {
      setRep(data)
      setIsLoading(false)
    })
  }, [candidateId])

  if (isLoading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    )
  }

  if (!rep) {
    return (
      <Card className="p-6 text-center text-muted-foreground text-sm">
        Reputation data not available.
      </Card>
    )
  }

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Shield className="h-5 w-5" />
        Reputation & Funding
      </h2>

      {/* Score + Sentiment */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Reputation</p>
          <p className={cn('text-2xl font-bold', getScoreColor(rep.reputation_score))}>
            {rep.reputation_score}
          </p>
          <p className="text-xs text-muted-foreground">/100</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Transparency</p>
          <p className={cn('text-2xl font-bold', getScoreColor(rep.funding_transparency))}>
            {rep.funding_transparency}
          </p>
          <p className="text-xs text-muted-foreground">/100</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Small Donors</p>
          <p className="text-2xl font-bold">{rep.small_donor_pct}%</p>
          <p className="text-xs text-muted-foreground">of total</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Media</p>
          <Badge className={cn('capitalize', getSentimentColor(rep.media_sentiment))}>
            {rep.media_sentiment}
          </Badge>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm italic">{rep.ai_summary}</p>
      </div>

      {/* Funding */}
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
          <DollarSign className="h-4 w-4" />
          Funding Overview
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          Total raised:{' '}
          <span className="font-semibold text-foreground">
            ${(rep.total_raised / 1_000_000).toFixed(1)}M
          </span>
        </p>
        <FundingChart donors={rep.top_donors} />
      </div>

      {/* Endorsements */}
      {rep.endorsements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <ThumbsUp className="h-4 w-4" />
            Endorsements
          </h3>
          <div className="flex flex-wrap gap-2">
            {rep.endorsements.map((e) => (
              <Badge key={e} variant="secondary" className="text-xs">
                {e}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Controversy flags */}
      {rep.controversy_flags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            Flags ({rep.controversy_flags.length})
          </h3>
          <div className="space-y-2">
            {rep.controversy_flags.map((flag, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg border p-3',
                  flag.severity === 'high'
                    ? 'border-red-200 bg-red-50'
                    : flag.severity === 'medium'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-gray-200 bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{flag.title}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs capitalize',
                      flag.severity === 'high'
                        ? 'text-red-600'
                        : flag.severity === 'medium'
                          ? 'text-amber-600'
                          : 'text-gray-600'
                    )}
                  >
                    {flag.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {flag.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
