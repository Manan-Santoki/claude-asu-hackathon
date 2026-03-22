import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, CheckSquare, Vote, FileText, Phone, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageWrapper from '@/components/layout/PageWrapper'
import RepHeader from './RepHeader'
import ScoreGauges from './ScoreGauges'
import PromiseTracker from './PromiseTracker'
import VotingRecord from './VotingRecord'
import BillsSponsored from './BillsSponsored'
import ContactRep from './ContactRep'
import InTheNews from '@/components/shared/InTheNews'
import { useRepStore } from '@/stores/useRepStore'

interface SectionProps {
  icon: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

function Section({ icon: Icon, title, subtitle, children, className = '' }: SectionProps) {
  return (
    <section className={`rounded-2xl bg-card border border-border/50 overflow-hidden ${className}`}>
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </section>
  )
}

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
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      </PageWrapper>
    )
  }

  if (!selectedRep) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">Representative not found</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">The requested profile could not be loaded.</p>
          <Button variant="outline" onClick={() => navigate('/reps')} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Representatives
          </Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 -ml-2 text-muted-foreground hover:text-foreground group"
        onClick={() => navigate('/reps')}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Reps
      </Button>

      <div className="space-y-6">
        <RepHeader rep={selectedRep} />

        {/* In The News */}
        <Section icon={Newspaper} title="In The News" subtitle={`Recent coverage of ${selectedRep.name}`}>
          <InTheNews personId={selectedRep.member_id} personName={selectedRep.name} />
        </Section>

        {/* Score Gauges */}
        <Section icon={BarChart3} title="Accountability Scores" subtitle="Performance metrics and ratings">
          <ScoreGauges scores={scores} isLoading={isScoreLoading} />
        </Section>

        {/* Promise Tracker */}
        <Section icon={CheckSquare} title="Promise Tracker" subtitle="Campaign pledges vs. actions taken">
          <PromiseTracker promises={promises} isLoading={isPromisesLoading} />
        </Section>

        {/* Voting Record */}
        <Section icon={Vote} title="Voting Record">
          <VotingRecord
            votes={votes}
            totalVotes={totalVotes}
            isLoading={isVotesLoading}
            onLoadMore={() => {
              if (memberId) fetchVotes(memberId, votePage + 1)
            }}
          />
        </Section>

        {/* Bills Sponsored */}
        <Section icon={FileText} title="Bills Sponsored">
          <BillsSponsored bills={sponsoredBills} />
        </Section>

        {/* Contact */}
        <Section icon={Phone} title="Contact Representative">
          <ContactRep memberId={selectedRep.member_id} repName={selectedRep.name} />
        </Section>
      </div>
    </PageWrapper>
  )
}
