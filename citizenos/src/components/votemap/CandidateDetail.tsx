import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { POLICY_AXES } from '@/lib/policyAxes'
import {
  getCandidateDetail,
  getCandidatePositions,
  type Candidate,
  type CandidatePosition,
} from '@/api/candidates'
import ReputationCard from './ReputationCard'
import { ArrowLeft, ExternalLink, MapPin, Briefcase } from 'lucide-react'

function getPartyColor(party: string): string {
  if (party === 'D') return 'bg-blue-100 text-blue-800'
  if (party === 'R') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

function getPartyName(party: string): string {
  if (party === 'D') return 'Democrat'
  if (party === 'R') return 'Republican'
  return party
}

function ScoreBar({ score }: { score: number }) {
  // -2 to +2 mapped to 0-100%
  const pct = ((score + 2) / 4) * 100
  const color =
    score >= 1 ? 'bg-blue-500' : score >= 0 ? 'bg-gray-400' : 'bg-red-400'

  return (
    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
      {/* Fill from center */}
      {score >= 0 ? (
        <div
          className={cn('absolute top-0 bottom-0 rounded-r', color)}
          style={{ left: '50%', width: `${(pct - 50)}%` }}
        />
      ) : (
        <div
          className={cn('absolute top-0 bottom-0 rounded-l', color)}
          style={{ right: '50%', width: `${(50 - pct)}%` }}
        />
      )}
    </div>
  )
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [positions, setPositions] = useState<CandidatePosition[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    Promise.all([getCandidateDetail(id), getCandidatePositions(id)]).then(
      ([cand, pos]) => {
        setCandidate(cand)
        setPositions(pos)
        setIsLoading(false)
      }
    )
  }, [id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 text-center">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const axisMap = new Map(POLICY_AXES.map((a) => [a.id, a]))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </Button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={candidate.photo_url} alt={candidate.name} />
            <AvatarFallback className="text-lg">
              {candidate.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{candidate.name}</h1>
              <Badge variant="secondary" className={cn('text-sm', getPartyColor(candidate.party))}>
                {getPartyName(candidate.party)}
              </Badge>
              {candidate.incumbent && (
                <Badge variant="outline">Incumbent</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 capitalize">
                <Briefcase className="h-3.5 w-3.5" />
                {candidate.office_sought}
                {candidate.district ? ` · District ${candidate.district}` : ''}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {candidate.state_code}
              </span>
            </div>
            <p className="text-sm mt-3">{candidate.bio}</p>
            <a
              href={candidate.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              Campaign Website
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Card>

      {/* Policy Positions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Policy Positions</h2>
        <div className="space-y-4">
          {positions.map((pos) => {
            const axis = axisMap.get(pos.axis)
            return (
              <div key={pos.axis}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {axis?.label ?? pos.axis}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {pos.score > 0 ? '+' : ''}
                    {pos.score}
                  </span>
                </div>
                <ScoreBar score={pos.score} />
                <p className="text-xs text-muted-foreground mt-1">
                  {pos.summary}
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      <Separator />

      {/* Reputation */}
      <ReputationCard candidateId={candidate.id} />
    </div>
  )
}
