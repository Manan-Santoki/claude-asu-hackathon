import { useEffect, useState } from 'react'
import { MessageSquare, Reply, Trash2, Pencil, Eye, EyeOff, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCommentStore } from '@/stores/useCommentStore'
import type { Comment } from '@/api/comments'

interface CommentSectionProps {
  contentType: 'bill' | 'action'
  contentId: string
}

export default function CommentSection({ contentType, contentId }: CommentSectionProps) {
  const { comments, isLoading, fetchComments, clear } = useCommentStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    fetchComments(contentType, contentId)
    return () => clear()
  }, [contentType, contentId, fetchComments, clear])

  const totalCount = countComments(comments)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Discussion {totalCount > 0 && <span className="text-muted-foreground font-normal">({totalCount})</span>}
        </h2>
      </div>

      {/* New comment form */}
      {isAuthenticated ? (
        <CommentForm contentType={contentType} contentId={contentId} />
      ) : (
        <p className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
          Sign in to join the discussion.
        </p>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              contentType={contentType}
              contentId={contentId}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Comment form (new comment or reply)
// ---------------------------------------------------------------------------

function CommentForm({
  contentType,
  contentId,
  parentId,
  onCancel,
  autoFocus,
}: {
  contentType: 'bill' | 'action'
  contentId: string
  parentId?: string
  onCancel?: () => void
  autoFocus?: boolean
}) {
  const user = useAuthStore((s) => s.user)
  const postComment = useCommentStore((s) => s.postComment)
  const [body, setBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return null

  const handleSubmit = async () => {
    const trimmed = body.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    const ok = await postComment({
      content_type: contentType,
      content_id: contentId,
      parent_id: parentId ?? null,
      user_id: user.id,
      user_name: user.name,
      is_anonymous: isAnonymous,
      body: trimmed,
    })
    setIsSubmitting(false)

    if (ok) {
      setBody('')
      setIsAnonymous(false)
      onCancel?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-1">
        <AvatarFallback>
          {isAnonymous ? '?' : user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={parentId ? 'Write a reply...' : 'Share your thoughts...'}
          autoFocus={autoFocus}
          rows={parentId ? 2 : 3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isAnonymous ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Posting anonymously
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Posting as {user.name}
              </>
            )}
          </button>
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={handleSubmit}
              disabled={!body.trim() || isSubmitting}
            >
              <Send className="h-3 w-3" />
              {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single comment with threaded replies
// ---------------------------------------------------------------------------

function CommentThread({
  comment,
  contentType,
  contentId,
  depth,
}: {
  comment: Comment
  contentType: 'bill' | 'action'
  contentId: string
  depth: number
}) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const removeComment = useCommentStore((s) => s.removeComment)
  const updateComment = useCommentStore((s) => s.updateComment)

  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editBody, setEditBody] = useState(comment.body)
  const [isExpanded, setIsExpanded] = useState(false)

  const isOwner = user?.id === comment.user_id
  const displayName = comment.is_anonymous ? 'Anonymous' : comment.user_name
  const initials = comment.is_anonymous ? '?' : comment.user_name.charAt(0).toUpperCase()
  const timeAgo = getRelativeTime(comment.created_at)
  const wasEdited = comment.updated_at !== comment.created_at

  const handleDelete = async () => {
    await removeComment(comment.id)
  }

  const handleEditSave = async () => {
    const trimmed = editBody.trim()
    if (!trimmed || trimmed === comment.body) {
      setIsEditing(false)
      return
    }
    const ok = await updateComment(comment.id, trimmed)
    if (ok) setIsEditing(false)
  }

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}>
      <div className="flex gap-3 py-3">
        <Avatar size="sm" className="mt-0.5">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {wasEdited && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-1.5 space-y-2">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={2}
                autoFocus
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-6 text-xs" onClick={handleEditSave}>
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    setIsEditing(false)
                    setEditBody(comment.body)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <CommentBody body={comment.body} isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-1.5">
              {isAuthenticated && depth < 3 && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                >
                  {showReplyForm ? <X className="h-3 w-3" /> : <Reply className="h-3 w-3" />}
                  {showReplyForm ? 'Cancel' : 'Reply'}
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5 rounded hover:bg-muted"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                contentType={contentType}
                contentId={contentId}
                parentId={comment.id}
                onCancel={() => setShowReplyForm(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              contentType={contentType}
              contentId={contentId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Comment body with show more / show less
// ---------------------------------------------------------------------------

const WORD_LIMIT = 50

function CommentBody({
  body,
  isExpanded,
  onToggle,
}: {
  body: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const words = body.split(/\s+/)
  const isLong = words.length > WORD_LIMIT

  if (!isLong) {
    return <p className="text-sm mt-1 whitespace-pre-wrap break-words">{body}</p>
  }

  const truncated = words.slice(0, WORD_LIMIT).join(' ') + '...'

  return (
    <div className="mt-1">
      <p className="text-sm whitespace-pre-wrap break-words">
        {isExpanded ? body : truncated}
      </p>
      <button
        onClick={onToggle}
        className="text-xs text-primary hover:underline mt-0.5"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countComments(comments: Comment[]): number {
  let count = 0
  for (const c of comments) {
    count += 1
    if (c.replies) count += countComments(c.replies)
  }
  return count
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)

  if (diffSec < 60) return 'just now'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}
