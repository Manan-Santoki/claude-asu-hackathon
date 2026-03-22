import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getCandidates, type Candidate } from '@/api/candidates'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import DataSourceBadge from '@/components/shared/DataSourceBadge'

interface Props {
  stateFilter?: string
}

function getPartyColor(party: string): string {
  if (party === 'D') return 'bg-blue-100 text-blue-800'
  if (party === 'R') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

export default function CandidateList({ stateFilter }: Props) {
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [officeFilter, setOfficeFilter] = useState<string>('all')

  useEffect(() => {
    setIsLoading(true)
    getCandidates(stateFilter).then((data) => {
      setCandidates(data)
      setIsLoading(false)
    })
  }, [stateFilter])

  const filtered =
    officeFilter === 'all'
      ? candidates
      : candidates.filter((c) => c.office_sought === officeFilter)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">No candidates found{stateFilter ? ` for ${stateFilter}` : ''}.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataSourceBadge sourceKey="candidates" />
      {!stateFilter && (
        <div className="flex items-center gap-2">
          <Select value={officeFilter} onValueChange={setOfficeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              <SelectItem value="president">President</SelectItem>
              <SelectItem value="senate">Senate</SelectItem>
              <SelectItem value="house">House</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((c) => (
          <Card
            key={c.id}
            className="p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/candidate/${c.id}`)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={c.photo_url} alt={c.name} />
                <AvatarFallback>
                  {c.name.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{c.name}</span>
                  <Badge variant="secondary" className={cn('text-xs', getPartyColor(c.party))}>
                    {c.party}
                  </Badge>
                  {c.incumbent && (
                    <Badge variant="outline" className="text-xs">
                      Incumbent
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {c.office_sought}
                  {c.district ? ` · District ${c.district}` : ''}
                  {' · '}
                  {c.state_code}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
