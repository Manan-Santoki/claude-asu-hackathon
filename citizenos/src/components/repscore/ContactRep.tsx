import { useState } from 'react'
import { Mail, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useRepStore } from '@/stores/useRepStore'

interface ContactRepProps {
  memberId: string
  repName: string
  prefilledBillId?: string
}

export default function ContactRep({ memberId, repName, prefilledBillId }: ContactRepProps) {
  const [concern, setConcern] = useState('')
  const { contactEmail, isContactLoading, generateContactEmail, clearContactEmail } = useRepStore()

  const handleGenerate = () => {
    if (!concern.trim() && !prefilledBillId) return
    generateContactEmail(memberId, prefilledBillId, concern)
  }

  const handleCopy = () => {
    if (!contactEmail) return
    const text = `Subject: ${contactEmail.subject}\n\n${contactEmail.body}`
    navigator.clipboard.writeText(text)
    toast.success('Email copied to clipboard')
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Contact {repName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!contactEmail ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                What is your concern?
              </label>
              <Input
                placeholder="e.g., I'm concerned about rising insulin costs..."
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
              />
            </div>
            {isContactLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <Button onClick={handleGenerate} disabled={!concern.trim() && !prefilledBillId}>
                Generate Email
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
              <p className="text-sm font-medium border rounded px-2 py-1.5 bg-muted/30">
                {contactEmail.subject}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
              <pre className="text-sm whitespace-pre-wrap border rounded p-3 bg-muted/30 max-h-60 overflow-y-auto font-sans">
                {contactEmail.body}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <a href={contactEmail.mailto_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Open in Email
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy
              </Button>
              <Button size="sm" variant="ghost" onClick={clearContactEmail}>
                Write New
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
