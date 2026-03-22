import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Representative } from '@/api/reps'

const partyColors: Record<string, string> = {
  D: 'bg-blue-600 text-white',
  R: 'bg-red-600 text-white',
  I: 'bg-purple-600 text-white',
}

interface RepCardProps {
  rep: Representative
  score?: number
  compact?: boolean
}

export default function RepCard({ rep, score, compact }: RepCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/rep/${rep.member_id}`)}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-3">
          <Avatar className={compact ? 'h-10 w-10' : 'h-14 w-14'}>
            <AvatarImage src={rep.photo_url} alt={rep.name} />
            <AvatarFallback className="text-sm font-semibold">
              {rep.first_name[0]}{rep.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {rep.title === 'Senator' ? 'Sen.' : 'Rep.'} {rep.name}
              </h3>
              <Badge className={`shrink-0 text-xs ${partyColors[rep.party]}`}>
                {rep.party}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              {rep.chamber === 'senate' ? 'Senator' : 'Representative'} — {rep.state_code}
              {rep.district ? `, ${rep.district}` : ''}
            </p>

            {!compact && (
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span>Party loyalty: {Math.round(rep.votes_with_party_pct * 10) / 10}%</span>
                <span>Attendance: {Math.round(100 - rep.missed_votes_pct)}%</span>
              </div>
            )}
          </div>

          {score !== undefined && (
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  score >= 70
                    ? 'border-green-500 text-green-600'
                    : score >= 40
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-red-500 text-red-600'
                }`}
              >
                {score}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">Score</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
