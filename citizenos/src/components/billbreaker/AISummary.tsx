import { useState } from 'react'
import { Sparkles, FileText, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useBillStore } from '@/stores/useBillStore'

export default function AISummary() {
  const { selectedBill } = useBillStore()
  const [showOriginal, setShowOriginal] = useState(false)

  if (!selectedBill) return null

  const hasAI = !!selectedBill.summary_ai
  const hasRaw = !!selectedBill.summary_raw
  const hasBothSummaries = hasAI && hasRaw

  // Determine which text to show
  let text: string
  if (hasAI && !showOriginal) {
    text = selectedBill.summary_ai
  } else if (hasRaw) {
    text = selectedBill.summary_raw
  } else {
    text = ''
  }

  // Split summary by ## headers for structured rendering
  const renderFormattedText = (content: string) => {
    // Handle bullet-point lines within sections
    const sections = content.split(/(?=## )/)

    if (sections.length <= 1) {
      // No headers — render as paragraphs
      return content.split('\n\n').map((para, i) => {
        // Check if the paragraph has bullet points
        const lines = para.split('\n')
        const hasBullets = lines.some(l => l.startsWith('- '))
        if (hasBullets) {
          return (
            <ul key={i} className="list-disc list-inside space-y-1">
              {lines.map((line, j) => {
                const bulletContent = line.startsWith('- ') ? line.slice(2) : line
                return bulletContent.trim() ? (
                  <li key={j} className="text-sm leading-relaxed text-muted-foreground">
                    {bulletContent}
                  </li>
                ) : null
              })}
            </ul>
          )
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {para}
          </p>
        )
      })
    }

    return sections.map((section, i) => {
      const lines = section.trim().split('\n')
      const headerMatch = lines[0]?.match(/^## (.+)/)

      if (headerMatch) {
        const bodyLines = lines.slice(1)
        const hasBullets = bodyLines.some(l => l.trim().startsWith('- '))

        return (
          <div key={i} className="space-y-1.5">
            <h4 className="text-sm font-semibold text-foreground">{headerMatch[1]}</h4>
            {hasBullets ? (
              <ul className="list-disc list-inside space-y-1">
                {bodyLines.map((line, j) => {
                  const trimmed = line.trim()
                  if (!trimmed) return null
                  const bulletContent = trimmed.startsWith('- ') ? trimmed.slice(2) : trimmed
                  return bulletContent.trim() ? (
                    <li key={j} className="text-sm leading-relaxed text-muted-foreground">
                      {bulletContent}
                    </li>
                  ) : null
                })}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {bodyLines.join(' ').trim()}
              </p>
            )}
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

  // No summary available at all
  if (!hasAI && !hasRaw) {
    return (
      <Card>
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Summary</CardTitle>
            <Badge
              variant="secondary"
              className="gap-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              <Info className="h-3 w-3" />
              Unavailable
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Summary not yet available for this bill. Check back later or read the full text on Congress.gov.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Determine label and badge for the current view
  const isShowingAI = hasAI && !showOriginal
  const titleLabel = isShowingAI ? 'AI Summary' : hasAI ? 'Original Summary' : 'Congressional Summary'

  return (
    <Card>
      <CardHeader className="relative">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{titleLabel}</CardTitle>
          {isShowingAI ? (
            <Badge
              variant="secondary"
              className="gap-1 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
            >
              <Sparkles className="h-3 w-3" />
              AI Generated
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="gap-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            >
              <FileText className="h-3 w-3" />
              Congressional Summary
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="space-y-3">
          {renderFormattedText(text)}
        </div>

        {hasBothSummaries && (
          <>
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
