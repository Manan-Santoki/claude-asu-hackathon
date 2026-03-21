import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { POLICY_AXES } from '@/lib/policyAxes'
import type { MatchResult } from '@/api/quiz'
import { useNavigate } from 'react-router-dom'

interface Props {
  match: MatchResult
  rank: number
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-50 border-green-200'
  if (score >= 60) return 'bg-yellow-50 border-yellow-200'
  if (score >= 40) return 'bg-orange-50 border-orange-200'
  return 'bg-red-50 border-red-200'
}

function getPartyColor(party: string): string {
  if (party === 'D') return 'bg-blue-100 text-blue-800'
  if (party === 'R') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

export default function MatchCard({ match, rank }: Props) {
  const navigate = useNavigate()
  const { candidate, score, axis_breakdown } = match

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/candidate/${candidate.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Rank + Avatar */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-muted-foreground">
            #{rank}
          </span>
          <Avatar className="h-12 w-12">
            <AvatarImage src={candidate.photo_url} alt={candidate.name} />
            <AvatarFallback>
              {candidate.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm truncate">
              {candidate.name}
            </h3>
            <Badge variant="secondary" className={cn('text-xs', getPartyColor(candidate.party))}>
              {candidate.party}
            </Badge>
            {candidate.incumbent && (
              <Badge variant="outline" className="text-xs">
                Incumbent
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {candidate.office_sought} &middot; {candidate.state_code}
            {candidate.district ? `-${candidate.district}` : ''}
          </p>

          {/* Mini axis bars */}
          <div className="mt-2 grid grid-cols-5 gap-1">
            {POLICY_AXES.slice(0, 10).map((axis) => {
              const bd = axis_breakdown[axis.id]
              if (!bd) return null
              // 0 = perfect match, 4 = worst
              const alignment = 1 - bd.diff / 4
              return (
                <div key={axis.id} className="flex flex-col items-center" title={`${axis.label}: ${Math.round(alignment * 100)}% aligned`}>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        alignment >= 0.75 ? 'bg-green-500' : alignment >= 0.5 ? 'bg-yellow-500' : 'bg-red-400'
                      )}
                      style={{ width: `${alignment * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-0.5 truncate w-full text-center">
                    {axis.label.slice(0, 4)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Score */}
        <div
          className={cn(
            'flex flex-col items-center justify-center rounded-lg border px-3 py-2 min-w-[60px]',
            getScoreBg(score)
          )}
        >
          <span className={cn('text-lg font-bold', getScoreColor(score))}>
            {score}%
          </span>
          <span className="text-[10px] text-muted-foreground">match</span>
        </div>
      </div>
    </Card>
  )
}
