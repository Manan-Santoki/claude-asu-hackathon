import { useState, useRef, useEffect, useCallback } from 'react'
import { useBillStore } from '@/stores/useBillStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Send, Bot, User, MessageSquare } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  'Does this affect my taxes?',
  'When does this take effect?',
  'Who supports this?',
]

interface BillChatProps {
  billId: string
}

export default function BillChat({ billId }: BillChatProps) {
  const chatHistory = useBillStore((s) => s.chatHistory)
  const isChatLoading = useBillStore((s) => s.isChatLoading)
  const sendChatMessage = useBillStore((s) => s.sendChatMessage)

  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory, isChatLoading])

  const handleSend = useCallback(
    (message?: string) => {
      const text = message ?? input.trim()
      if (!text || isChatLoading) return
      sendChatMessage(billId, text)
      setInput('')
      inputRef.current?.focus()
    },
    [input, billId, isChatLoading, sendChatMessage]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div className="flex flex-col rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessageSquare className="size-4 text-primary" />
        <span className="text-sm font-semibold">Ask about this bill</span>
      </div>

      {/* Messages area */}
      <ScrollArea className="h-80">
        <div ref={scrollRef} className="flex flex-col gap-3 overflow-y-auto p-4 h-80">
          {chatHistory.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <Bot className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about this bill
              </p>
            </div>
          )}

          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                {msg.role === 'user' ? (
                  <User className="size-3.5 text-muted-foreground" />
                ) : (
                  <Bot className="size-3.5 text-primary" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isChatLoading && (
            <div className="flex gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="size-3.5 text-primary" />
              </div>
              <div className="rounded-2xl bg-muted px-3.5 py-2.5">
                <div className="flex gap-1">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggested questions */}
      {chatHistory.length === 0 && (
        <div className="flex flex-wrap gap-2 border-t px-4 py-3">
          {SUGGESTED_QUESTIONS.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="xs"
              onClick={() => handleSend(q)}
              className="text-xs"
            >
              {q}
            </Button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t px-4 py-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question..."
          disabled={isChatLoading}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
        <Button
          size="icon-sm"
          variant="default"
          onClick={() => handleSend()}
          disabled={!input.trim() || isChatLoading}
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
