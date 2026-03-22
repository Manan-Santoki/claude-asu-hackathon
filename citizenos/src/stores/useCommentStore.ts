import { create } from 'zustand'
import {
  type Comment,
  getComments,
  addComment,
  deleteComment,
  editComment,
} from '@/api/comments'

interface CommentState {
  comments: Comment[]
  isLoading: boolean

  fetchComments: (contentType: 'bill' | 'action', contentId: string) => Promise<void>
  postComment: (params: {
    content_type: 'bill' | 'action'
    content_id: string
    parent_id?: string | null
    user_id: string
    user_name: string
    is_anonymous: boolean
    body: string
  }) => Promise<boolean>
  removeComment: (id: string) => Promise<boolean>
  updateComment: (id: string, body: string) => Promise<boolean>
  clear: () => void
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  isLoading: false,

  fetchComments: async (contentType, contentId) => {
    set({ isLoading: true })
    try {
      const comments = await getComments(contentType, contentId)
      set({ comments, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  postComment: async (params) => {
    const result = await addComment(params)
    if (result) {
      // Refetch to get properly nested tree
      await get().fetchComments(params.content_type, params.content_id)
      return true
    }
    return false
  },

  removeComment: async (id) => {
    const ok = await deleteComment(id)
    if (ok) {
      // Remove from local state (handles nested)
      set((state) => ({
        comments: removeFromTree(state.comments, id),
      }))
    }
    return ok
  },

  updateComment: async (id, body) => {
    const ok = await editComment(id, body)
    if (ok) {
      set((state) => ({
        comments: updateInTree(state.comments, id, body),
      }))
    }
    return ok
  },

  clear: () => set({ comments: [], isLoading: false }),
}))

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

function removeFromTree(comments: Comment[], id: string): Comment[] {
  return comments
    .filter((c) => c.id !== id)
    .map((c) => ({
      ...c,
      replies: c.replies ? removeFromTree(c.replies, id) : [],
    }))
}

function updateInTree(comments: Comment[], id: string, body: string): Comment[] {
  return comments.map((c) => {
    if (c.id === id) return { ...c, body, updated_at: new Date().toISOString() }
    return {
      ...c,
      replies: c.replies ? updateInTree(c.replies, id, body) : [],
    }
  })
}
