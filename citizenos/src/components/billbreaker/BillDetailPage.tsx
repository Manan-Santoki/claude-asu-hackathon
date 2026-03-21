import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
      {/* Header skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Timeline skeleton */}
      <div className="flex items-center gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            {i < 4 && <Skeleton className="h-0.5 flex-1" />}
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div className="rounded-xl border p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Impact skeleton */}
      <div className="rounded-xl border p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
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
        className="mb-4 gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {isLoading || !selectedBill ? (
        <DetailSkeleton />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Bill header */}
          <BillHeader bill={selectedBill} />

          {/* Status timeline */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
              Legislative Progress
            </h2>
            <StatusTimeline status={selectedBill.status} />
            {selectedBill.status_detail && (
              <p className="text-xs text-muted-foreground mt-4">
                {selectedBill.status_detail}
              </p>
            )}
          </div>

          {/* AI Summary */}
          <AISummary />

          <Separator />

          {/* Persona impact section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">How does this affect you?</h2>
            <PersonaSelector />
            <ImpactPanel />
          </div>

          {/* Impact story */}
          <ImpactStory />

          <Separator />

          {/* Chat */}
          <BillChat />

          <Separator />

          {/* Reps who voted */}
          <RepsVoted />

          {/* Action bar */}
          <BillActionBar />
        </div>
      )}
    </PageWrapper>
  )
}
