import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { RepVote } from '@/api/reps'

const positionColors: Record<string, string> = {
  Yes: 'bg-green-100 text-green-700 border-green-300',
  No: 'bg-red-100 text-red-700 border-red-300',
  'Not Voting': 'bg-gray-100 text-gray-600 border-gray-300',
  Present: 'bg-blue-100 text-blue-600 border-blue-300',
}

interface VotingRecordProps {
  votes: RepVote[]
  totalVotes: number
  isLoading: boolean
  onLoadMore?: () => void
}

export default function VotingRecord({ votes, totalVotes, isLoading, onLoadMore }: VotingRecordProps) {
  const navigate = useNavigate()

  if (isLoading && votes.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Voting Record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (votes.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Voting Record</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No voting record found.</p>
        </CardContent>
      </Card>
    )
  }

  // Extract bill shortname from bill_id for navigation
  function billIdToPath(billId: string): string {
    // e.g. "hr1234-119" → "hr-1234"
    const match = billId.match(/^(hr|s|hjres|sjres)(\d+)/)
    if (match) return `${match[1]}-${match[2]}`
    return billId
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Voting Record <span className="text-sm font-normal text-muted-foreground">({totalVotes} votes)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header row */}
        <div className="hidden sm:grid grid-cols-[80px_1fr_100px_80px_80px] gap-2 px-2 pb-2 text-xs font-medium text-muted-foreground border-b">
          <span>Date</span>
          <span>Bill / Description</span>
          <span>Question</span>
          <span>Position</span>
          <span>Result</span>
        </div>

        <div className="divide-y">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className="grid sm:grid-cols-[80px_1fr_100px_80px_80px] gap-1 sm:gap-2 px-2 py-2 text-sm items-center"
            >
              <span className="text-xs text-muted-foreground">
                {new Date(vote.vote_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span
                className="font-medium text-primary hover:underline cursor-pointer truncate"
                onClick={() => navigate(`/bill/${billIdToPath(vote.bill_id)}`)}
              >
                {vote.vote_description}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {vote.vote_question}
              </span>
              <Badge variant="outline" className={`text-xs w-fit ${positionColors[vote.vote_position]}`}>
                {vote.vote_position}
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:block">{vote.result}</span>
            </div>
          ))}
        </div>

        {votes.length < totalVotes && (
          <div className="mt-3 text-center">
            <Button variant="outline" size="sm" onClick={onLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
