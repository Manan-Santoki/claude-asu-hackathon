import { useState } from 'react'
import { Sparkles, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useBillStore } from '@/stores/useBillStore'

export default function AISummary() {
  const { selectedBill } = useBillStore()
  const [showOriginal, setShowOriginal] = useState(false)

  if (!selectedBill) return null

  // Build a contextual fallback when no summary is available
  const fallbackSummary = [
    `${selectedBill.title}.`,
    selectedBill.sponsor_name ? `Sponsored by ${selectedBill.sponsor_name} (${selectedBill.sponsor_party}-${selectedBill.sponsor_state}).` : '',
    selectedBill.status_detail ? `Current status: ${selectedBill.status_detail}.` : `Status: ${selectedBill.status.replace(/_/g, ' ')}.`,
    selectedBill.categories.length > 0 ? `Categories: ${selectedBill.categories.join(', ')}.` : '',
    selectedBill.introduced_date ? `Introduced on ${selectedBill.introduced_date}.` : '',
  ].filter(Boolean).join(' ')

  // Fall back gracefully: summary_ai → summary_raw → contextual fallback
  const aiText = selectedBill.summary_ai || selectedBill.summary_raw || fallbackSummary
  const rawText = selectedBill.summary_raw || fallbackSummary
  const text = showOriginal ? rawText : aiText
  const hasSummary = !!(selectedBill.summary_ai || selectedBill.summary_raw)

  // Split summary by ## headers for structured rendering
  const renderFormattedText = (content: string) => {
    const sections = content.split(/(?=## )/)

    if (sections.length <= 1) {
      // No headers — render as paragraphs
      return content.split('\n\n').map((para, i) => (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {para}
        </p>
      ))
    }

    return sections.map((section, i) => {
      const lines = section.trim().split('\n')
      const headerMatch = lines[0]?.match(/^## (.+)/)

      if (headerMatch) {
        return (
          <div key={i} className="space-y-1.5">
            <h4 className="text-sm font-semibold text-foreground">{headerMatch[1]}</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {lines.slice(1).join(' ').trim()}
            </p>
          </div>
        )
      }

      return (
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {section.trim()}
        </p>
      )
    })
  }

  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {showOriginal ? 'Original Summary' : 'AI Summary'}
          </CardTitle>
          {!showOriginal && hasSummary && (
            <Badge
              variant="secondary"
              className="gap-1 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
            >
              <Sparkles className="h-3 w-3" />
              AI Generated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="space-y-3">
          {renderFormattedText(text)}
        </div>

        <Separator />

        <Button
          variant="ghost"
          size="sm"
          className="self-start gap-2 text-xs"
          onClick={() => setShowOriginal(!showOriginal)}
        >
          {showOriginal ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              View AI Summary
            </>
          ) : (
            <>
              <FileText className="h-3.5 w-3.5" />
              View Original
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
