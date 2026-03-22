import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Clock, Scale, MessageSquare, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageWrapper from '@/components/layout/PageWrapper'
import { useActionStore } from '@/stores/useActionStore'
import ActionHeader from './ActionHeader'
import ActionTimeline from './ActionTimeline'
import ActionImpactPanel from './ActionImpactPanel'
import ActionChat from './ActionChat'
import LegalChallenges from './LegalChallenges'
import RelatedActions from './RelatedActions'

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="flex items-center gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            {i < 3 && <Skeleton className="h-0.5 flex-1" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-muted/30 p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

interface SectionProps {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
}

function Section({ icon: Icon, title, children, className = '' }: SectionProps) {
  return (
    <section className={`rounded-2xl bg-card border border-border/50 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-6 pt-6 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h2>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </section>
  )
}

export default function ActionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { selectedAction, isLoading, fetchActionDetail, clearSelectedAction } = useActionStore()

  useEffect(() => {
    if (id) {
      fetchActionDetail(id)
    }
    return () => {
      clearSelectedAction()
    }
  }, [id, fetchActionDetail, clearSelectedAction])

  return (
    <PageWrapper>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 -ml-2 text-muted-foreground hover:text-foreground group"
        onClick={() => navigate('/actions')}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Actions
      </Button>

      {isLoading || !selectedAction ? (
        <DetailSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <ActionHeader action={selectedAction} />

          {/* AI Summary — glassmorphism-inspired card */}
          <Section icon={Sparkles} title="AI Summary">
            <p className="text-sm leading-relaxed text-foreground/90">
              {selectedAction.summary_ai}
            </p>
          </Section>

          {/* Timeline */}
          {selectedAction.timeline.length > 0 && (
            <Section icon={Clock} title="Timeline">
              <ActionTimeline events={selectedAction.timeline} />
            </Section>
          )}

          {/* Impact panel */}
          <div className="rounded-2xl bg-muted/30 p-6">
            <ActionImpactPanel actionId={selectedAction.id} />
          </div>

          {/* Legal challenges */}
          {selectedAction.legal_challenges.length > 0 && (
            <Section icon={Scale} title="Legal Challenges">
              <LegalChallenges challenges={selectedAction.legal_challenges} />
            </Section>
          )}

          {/* Chat */}
          <Section icon={MessageSquare} title="Ask About This Action">
            <ActionChat actionId={selectedAction.id} />
          </Section>

          {/* Related actions */}
          <Section icon={Link2} title="Related Actions">
            <RelatedActions actionId={selectedAction.id} />
          </Section>
        </div>
      )}
    </PageWrapper>
  )
}
