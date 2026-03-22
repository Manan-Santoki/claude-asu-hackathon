import { insforge } from '@/lib/insforge'

export interface Comment {
  id: string
  content_type: 'bill' | 'action'
  content_id: string
  parent_id: string | null
  user_id: string
  user_name: string
  is_anonymous: boolean
  body: string
  created_at: string
  updated_at: string
  replies?: Comment[]
}

// ---------------------------------------------------------------------------
// Fetch comments for a piece of content
// ---------------------------------------------------------------------------

export async function getComments(
  contentType: 'bill' | 'action',
  contentId: string
): Promise<Comment[]> {
  try {
    const { data, error } = await insforge.database
      .from('comments')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return nestComments((data as Comment[]) ?? [])
  } catch (err) {
    console.warn('Failed to fetch comments:', err)
    return []
  }
}

// ---------------------------------------------------------------------------
// Add a comment
// ---------------------------------------------------------------------------

export async function addComment(params: {
  content_type: 'bill' | 'action'
  content_id: string
  parent_id?: string | null
  user_id: string
  user_name: string
  is_anonymous: boolean
  body: string
}): Promise<Comment | null> {
  try {
    const { data, error } = await insforge.database
      .from('comments')
      .insert({
        content_type: params.content_type,
        content_id: params.content_id,
        parent_id: params.parent_id ?? null,
        user_id: params.user_id,
        user_name: params.user_name,
        is_anonymous: params.is_anonymous,
        body: params.body,
      })
      .select()
      .single()

    if (error) throw error
    return data as Comment
  } catch (err) {
    console.warn('Failed to add comment:', err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Delete a comment
// ---------------------------------------------------------------------------

export async function deleteComment(id: string): Promise<boolean> {
  try {
    const { error } = await insforge.database
      .from('comments')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    console.warn('Failed to delete comment:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Edit a comment
// ---------------------------------------------------------------------------

export async function editComment(id: string, body: string): Promise<boolean> {
  try {
    const { error } = await insforge.database
      .from('comments')
      .update({ body, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (err) {
    console.warn('Failed to edit comment:', err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Nest flat comments into a tree (top-level + replies)
// ---------------------------------------------------------------------------

function nestComments(flat: Comment[]): Comment[] {
  const map = new Map<string, Comment>()
  const roots: Comment[] = []

  for (const c of flat) {
    map.set(c.id, { ...c, replies: [] })
  }

  for (const c of flat) {
    const node = map.get(c.id)!
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
