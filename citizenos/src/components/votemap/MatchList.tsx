import type { MatchResult } from '@/api/quiz'
import MatchCard from './MatchCard'

interface Props {
  matches: MatchResult[]
}

export default function MatchList({ matches }: Props) {
  if (matches.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No matches found. Try answering more questions.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match, i) => (
        <MatchCard key={match.candidate.id} match={match} rank={i + 1} />
      ))}
    </div>
  )
}
