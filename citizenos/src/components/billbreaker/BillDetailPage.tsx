import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Users, MessageSquare, Vote, Target, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageWrapper from '@/components/layout/PageWrapper'
import { useBillStore } from '@/stores/useBillStore'
import BillHeader from './BillHeader'
import StatusTimeline from './StatusTimeline'
import AISummary from './AISummary'
import PersonaSelector from './PersonaSelector'
import ImpactPanel from './ImpactPanel'
import ImpactStory from './ImpactStory'
import BillChat from './BillChat'
import RepsVoted from './RepsVoted'
import BillActionBar from './BillActionBar'

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            {i < 4 && <Skeleton className="h-0.5 flex-1" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-muted/30 p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="rounded-2xl bg-muted/30 p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

interface SectionProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

function Section({ icon: Icon, title, children, className = '', noPadding }: SectionProps) {
  return (
    <section className={`rounded-2xl bg-card border border-border/50 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
      <div className={noPadding ? '' : 'px-6 pb-6'}>{children}</div>
    </section>
  )
}

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedBill, isLoading, fetchBillDetail, clearSelectedBill } = useBillStore()

  useEffect(() => {
    if (id) {
      fetchBillDetail(id)
    }
    return () => {
      clearSelectedBill()
    }
  }, [id, fetchBillDetail, clearSelectedBill])

  return (
    <PageWrapper>
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 -ml-2 text-muted-foreground hover:text-foreground group"
        onClick={() => navigate('/bill')}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Bills
      </Button>

      {isLoading || !selectedBill ? (
        <DetailSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Bill header */}
          <BillHeader bill={selectedBill} />

          {/* Status timeline */}
          <Section icon={BookOpen} title="Legislative Progress">
            <StatusTimeline status={selectedBill.status} />
            {selectedBill.status_detail && (
              <p className="text-xs text-muted-foreground mt-4">
                {selectedBill.status_detail}
              </p>
            )}
          </Section>

          {/* AI Summary */}
          <Section icon={Sparkles} title="AI Summary">
            <AISummary />
          </Section>

          {/* Persona impact section */}
          <Section icon={Target} title="How Does This Affect You?">
            <PersonaSelector billId={selectedBill.id} />
            <div className="mt-4">
              <ImpactPanel />
            </div>
          </Section>

          {/* Impact story */}
          <div className="rounded-2xl bg-muted/30 p-6">
            <ImpactStory billId={selectedBill.id} />
          </div>

          {/* Chat */}
          <Section icon={MessageSquare} title="Ask About This Bill">
            <BillChat billId={selectedBill.id} />
          </Section>

          {/* Reps who voted */}
          <Section icon={Vote} title="How Your Reps Voted">
            <RepsVoted billId={selectedBill.id} />
          </Section>

          {/* Action bar */}
          <Section icon={Users} title="Take Action">
            <BillActionBar billId={selectedBill.id} />
          </Section>
        </div>
      )}
    </PageWrapper>
  )
}
