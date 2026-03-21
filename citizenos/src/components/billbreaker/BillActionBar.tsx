import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBillStore } from '@/stores/useBillStore'
import { Button } from '@/components/ui/button'
import { Heart, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface BillActionBarProps {
  billId: string
}

export default function BillActionBar({ billId }: BillActionBarProps) {
  const navigate = useNavigate()
  const savedBillIds = useBillStore((s) => s.savedBillIds)
  const toggleSave = useBillStore((s) => s.toggleSave)
  const isSaved = savedBillIds.has(billId)

  const handleSave = useCallback(() => {
    toggleSave(billId)
  }, [billId, toggleSave])

  const handleContactRep = useCallback(() => {
    navigate('/reps', { state: { billId } })
  }, [navigate, billId])

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/bill/${billId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Failed to copy link')
    }
  }, [billId])

  return (
    <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Button
          variant={isSaved ? 'default' : 'outline'}
          size="sm"
          onClick={handleSave}
          className="gap-1.5"
        >
          <Heart
            className={`size-4 ${isSaved ? 'fill-current' : ''}`}
          />
          {isSaved ? 'Saved' : 'Save'}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5"
          >
            <Share2 className="size-4" />
            Share
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleContactRep}
          >
            Contact My Rep
          </Button>
        </div>
      </div>
    </div>
  )
}
