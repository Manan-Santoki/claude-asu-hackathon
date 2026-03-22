import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronRight } from 'lucide-react'
import type { Representative } from '@/api/reps'

const partyConfig: Record<string, { badge: string; label: string; scoreColor: string }> = {
  D: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    label: 'Democrat',
    scoreColor: 'from-blue-500 to-blue-600',
  },
  R: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    label: 'Republican',
    scoreColor: 'from-red-500 to-red-600',
  },
  I: {
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    label: 'Independent',
    scoreColor: 'from-purple-500 to-purple-600',
  },
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBarColor(score: number): string {
  if (score >= 70) return 'from-emerald-500 to-teal-500'
  if (score >= 40) return 'from-amber-500 to-orange-500'
  return 'from-red-500 to-rose-500'
}

interface RepCardProps {
  rep: Representative
  score?: number
  compact?: boolean
}

export default function RepCard({ rep, score, compact }: RepCardProps) {
  const navigate = useNavigate()
  const party = partyConfig[rep.party] ?? partyConfig.I

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-0.5 cursor-pointer border border-border/50"
      onClick={() => navigate(`/rep/${rep.member_id}`)}
    >
      <CardContent className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start gap-4">
          {/* Avatar with party-colored ring — from Stitch grayscale hover pattern */}
          <div className="relative shrink-0">
            <Avatar className={`${compact ? 'h-12 w-12' : 'h-16 w-16'} ring-2 ring-border group-hover:ring-primary/30 transition-all duration-500`}>
              <AvatarImage
                src={rep.photo_url}
                alt={rep.name}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                {rep.first_name[0]}{rep.last_name[0]}
              </AvatarFallback>
            </Avatar>
            {/* Chamber indicator */}
            <span className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${party.badge}`}>
              {rep.party}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Name + party */}
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className={`font-bold truncate group-hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
                {rep.title === 'Senator' ? 'Sen.' : 'Rep.'} {rep.name}
              </h3>
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              {rep.chamber === 'senate' ? 'Senator' : 'Representative'} — {rep.state_code}
              {rep.district ? `, District ${rep.district}` : ''}
            </p>

            {/* Stats row — pill style from Stitch */}
            {!compact && (
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  Party loyalty {rep.votes_with_party_pct}%
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  Attendance {Math.round(100 - rep.missed_votes_pct)}%
                </span>
              </div>
            )}
          </div>

          {/* Score with progress bar — from Stitch trust score pattern */}
          {score !== undefined && (
            <div className="flex flex-col items-end gap-1.5 shrink-0 min-w-[72px]">
              <div className="flex items-baseline gap-0.5">
                <span className={`text-2xl font-black ${getScoreColor(score)}`}>{score}</span>
                <span className="text-xs font-medium text-muted-foreground">%</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getScoreBarColor(score)} transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Score</span>
            </div>
          )}
        </div>

        {/* Bottom action hint */}
        {!compact && (
          <div className="flex items-center justify-end mt-3 pt-3 border-t border-border/50">
            <span className="text-xs font-semibold text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
              View Profile
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
