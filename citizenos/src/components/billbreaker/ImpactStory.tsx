import { useState, useCallback } from 'react'
import { useBillStore } from '@/stores/useBillStore'
import { getBillStory } from '@/api/bills'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ImpactStoryProps {
  billId: string
}

export default function ImpactStory({ billId }: ImpactStoryProps) {
  const selectedBill = useBillStore((s) => s.selectedBill)
  const [isOpen, setIsOpen] = useState(false)
  const [story, setStory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = useCallback(async () => {
    if (!isOpen) {
      // Expanding: fetch story if not cached
      if (selectedBill?.impact_story) {
        setStory(selectedBill.impact_story)
      } else if (!story) {
        setIsLoading(true)
        try {
          const result = await getBillStory(billId)
          setStory(result)
        } catch {
          setStory('Unable to load impact story.')
        } finally {
          setIsLoading(false)
        }
      }
    }
    setIsOpen((prev) => !prev)
  }, [isOpen, selectedBill, story, billId])

  return (
    <div className="rounded-lg border bg-card">
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/50"
      >
        <span className="text-sm font-semibold">
          How this affects your day
        </span>
        {isOpen ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </Button>

      {isOpen && (
        <div className="border-t px-4 py-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-sm italic leading-relaxed text-foreground/80">
              {story}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
