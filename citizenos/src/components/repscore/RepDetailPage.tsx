import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import PageWrapper from '@/components/layout/PageWrapper'
import RepHeader from './RepHeader'
import ScoreGauges from './ScoreGauges'
import PromiseTracker from './PromiseTracker'
import VotingRecord from './VotingRecord'
import BillsSponsored from './BillsSponsored'
import ContactRep from './ContactRep'
import InTheNews from '@/components/shared/InTheNews'
import { useRepStore } from '@/stores/useRepStore'

export default function RepDetailPage() {
  const { memberId } = useParams<{ memberId: string }>()
  const navigate = useNavigate()
  const {
    selectedRep,
    votes,
    totalVotes,
    votePage,
    promises,
    scores,
    sponsoredBills,
    isLoading,
    isVotesLoading,
    isPromisesLoading,
    isScoreLoading,
    fetchRepDetail,
    fetchVotes,
    fetchPromises,
    fetchScore,
    fetchSponsoredBills,
  } = useRepStore()

  useEffect(() => {
    if (!memberId) return
    fetchRepDetail(memberId)
    fetchVotes(memberId)
    fetchPromises(memberId)
    fetchScore(memberId)
    fetchSponsoredBills(memberId)
  }, [memberId, fetchRepDetail, fetchVotes, fetchPromises, fetchScore, fetchSponsoredBills])

  if (isLoading && !selectedRep) {
    return (
      <PageWrapper>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </PageWrapper>
    )
  }

  if (!selectedRep) {
    return (
      <PageWrapper>
        <p className="text-muted-foreground">Representative not found.</p>
        <Button variant="ghost" className="mt-2" onClick={() => navigate('/reps')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Representatives
        </Button>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate('/reps')}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Reps
      </Button>

      <div className="space-y-6">
        <RepHeader rep={selectedRep} />

        <Separator />

        <InTheNews personId={selectedRep.member_id} personName={selectedRep.name} />

        <ScoreGauges scores={scores} isLoading={isScoreLoading} />

        <PromiseTracker promises={promises} isLoading={isPromisesLoading} />

        <VotingRecord
          votes={votes}
          totalVotes={totalVotes}
          isLoading={isVotesLoading}
          onLoadMore={() => {
            if (memberId) fetchVotes(memberId, votePage + 1)
          }}
        />

        <BillsSponsored bills={sponsoredBills} />

        <ContactRep memberId={selectedRep.member_id} repName={selectedRep.name} />
      </div>
    </PageWrapper>
  )
}
