import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { POLICY_AXES } from '@/lib/policyAxes'
import type { MatchResult } from '@/api/quiz'

interface Props {
  matches: MatchResult[]
}

function getPartyColor(party: string): string {
  if (party === 'D') return 'bg-blue-100 text-blue-800'
  if (party === 'R') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

function ScoreMarker({ score, color }: { score: number; color: string }) {
  // score is -2 to +2, map to 0-100%
  const pct = ((score + 2) / 4) * 100
  return (
    <div
      className={cn('absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm', color)}
      style={{ left: `${pct}%`, marginLeft: '-6px' }}
    />
  )
}

export default function CandidateCompare({ matches }: Props) {
  const [leftId, setLeftId] = useState(matches[0]?.candidate.id ?? '')
  const [rightId, setRightId] = useState(matches[1]?.candidate.id ?? '')

  const left = matches.find((m) => m.candidate.id === leftId)
  const right = matches.find((m) => m.candidate.id === rightId)

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <Select value={leftId} onValueChange={setLeftId}>
          <SelectTrigger>
            <SelectValue placeholder="Select candidate" />
          </SelectTrigger>
          <SelectContent>
            {matches.map((m) => (
              <SelectItem key={m.candidate.id} value={m.candidate.id}>
                {m.candidate.name} ({m.score}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={rightId} onValueChange={setRightId}>
          <SelectTrigger>
            <SelectValue placeholder="Select candidate" />
          </SelectTrigger>
          <SelectContent>
            {matches.map((m) => (
              <SelectItem key={m.candidate.id} value={m.candidate.id}>
                {m.candidate.name} ({m.score}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {left && right && (
        <Card className="p-4 sm:p-6">
          {/* Candidate headers */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
            {[left, right].map((m) => (
              <div key={m.candidate.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={m.candidate.photo_url} alt={m.candidate.name} />
                  <AvatarFallback>
                    {m.candidate.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{m.candidate.name}</span>
                    <Badge variant="secondary" className={cn('text-xs', getPartyColor(m.candidate.party))}>
                      {m.candidate.party}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {m.candidate.office_sought} &middot; {m.score}% match
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Policy axis comparison */}
          <div className="space-y-4">
            {POLICY_AXES.map((axis) => {
              const lbd = left.axis_breakdown[axis.id]
              const rbd = right.axis_breakdown[axis.id]
              if (!lbd || !rbd) return null

              return (
                <div key={axis.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">{axis.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      -2 &nbsp;&nbsp; -1 &nbsp;&nbsp; 0 &nbsp;&nbsp; +1 &nbsp;&nbsp; +2
                    </span>
                  </div>
                  <div className="relative h-4 bg-muted rounded-full">
                    {/* Scale markers */}
                    {[0, 25, 50, 75, 100].map((pct) => (
                      <div
                        key={pct}
                        className="absolute top-0 bottom-0 w-px bg-background/50"
                        style={{ left: `${pct}%` }}
                      />
                    ))}
                    <ScoreMarker score={lbd.candidate} color="bg-amber-500" />
                    <ScoreMarker score={rbd.candidate} color="bg-violet-500" />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span className="text-amber-600">
                      {left.candidate.name.split(' ')[1]}: {lbd.candidate > 0 ? '+' : ''}{lbd.candidate}
                    </span>
                    <span className="text-violet-600">
                      {right.candidate.name.split(' ')[1]}: {rbd.candidate > 0 ? '+' : ''}{rbd.candidate}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
