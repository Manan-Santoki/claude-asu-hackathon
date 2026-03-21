import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Representative } from '@/api/reps'

const partyColors: Record<string, string> = {
  D: 'bg-blue-600 text-white',
  R: 'bg-red-600 text-white',
  I: 'bg-purple-600 text-white',
}

const partyLabels: Record<string, string> = {
  D: 'Democrat',
  R: 'Republican',
  I: 'Independent',
}

interface RepHeaderProps {
  rep: Representative
}

export default function RepHeader({ rep }: RepHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={rep.photo_url} alt={rep.name} />
        <AvatarFallback className="text-2xl font-semibold">
          {rep.first_name[0]}{rep.last_name[0]}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight">
            {rep.title} {rep.name}
          </h1>
          <Badge className={partyColors[rep.party]}>
            {partyLabels[rep.party]}
          </Badge>
          {rep.in_office && (
            <Badge variant="outline" className="border-green-500 text-green-600">
              In Office
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
          <span>{rep.chamber === 'senate' ? 'U.S. Senate' : 'U.S. House of Representatives'}</span>
          <span>{rep.state_code}{rep.district ? ` — ${rep.district}` : ''}</span>
          <span>Next election: {rep.next_election}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
          <span>{rep.bills_sponsored} bills sponsored</span>
          <span>{rep.bills_cosponsored} cosponsored</span>
        </div>

        {(rep.phone || rep.website) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
            {rep.phone && <span className="text-muted-foreground">{rep.phone}</span>}
            {rep.website && (
              <a
                href={rep.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Official Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
