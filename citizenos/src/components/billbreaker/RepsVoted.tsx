import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepsVoted } from '@/api/bills'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'

const PARTY_COLORS: Record<string, string> = {
  D: 'bg-blue-500 text-white',
  R: 'bg-red-500 text-white',
  I: 'bg-purple-500 text-white',
}

const VOTE_COLORS: Record<string, string> = {
  Yea: 'text-emerald-600 dark:text-emerald-400',
  Nay: 'text-red-600 dark:text-red-400',
}

interface RepsVotedProps {
  billId: string
}

export default function RepsVoted({ billId }: RepsVotedProps) {
  const navigate = useNavigate()
  const [reps, setReps] = useState<
    { name: string; party: string; position: string; memberId: string }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    getRepsVoted(billId)
      .then((data) => {
        if (!cancelled) setReps(data)
      })
      .catch(() => {
        if (!cancelled) setReps([])
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [billId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voting Record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (reps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Voting Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Voting record not available yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4" />
          Voting Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {reps.map((rep) => (
            <button
              key={rep.memberId}
              onClick={() => navigate(`/rep/${rep.memberId}`)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {rep.name.split(' ').pop()?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{rep.name}</p>
                  <Badge
                    className={`mt-0.5 px-1.5 py-0 text-[10px] ${PARTY_COLORS[rep.party] ?? 'bg-gray-500 text-white'}`}
                  >
                    {rep.party === 'D'
                      ? 'Democrat'
                      : rep.party === 'R'
                        ? 'Republican'
                        : 'Independent'}
                  </Badge>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${VOTE_COLORS[rep.position] ?? 'text-muted-foreground'}`}
              >
                {rep.position}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
