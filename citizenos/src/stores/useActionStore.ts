import { create } from 'zustand'
import { toast } from 'sonner'
import {
  type GovernmentAction,
  type ActionType,
  type ChatMessage,
  getActions,
  getActionDetail,
  getActionImpact,
  chatWithAction,
  saveAction,
  unsaveAction,
  getSavedActionIdsSync,
  getActionFeed,
} from '../api/actions'

interface ActionFilters {
  type?: ActionType | 'all'
  category?: string
  persona?: string
  state?: string
  search?: string
  page: number
}

interface ActionState {
  // Data
  actions: GovernmentAction[]
  selectedAction: GovernmentAction | null
  chatHistory: ChatMessage[]
  impactResults: Record<string, string>
  totalActions: number
  filters: ActionFilters
  savedActionIds: Set<string>
  feed: GovernmentAction[]

  // Loading states
  isLoading: boolean
  isChatLoading: boolean
  isImpactLoading: boolean
  isFeedLoading: boolean

  // Actions
  fetchActions: (filters?: Partial<ActionFilters>) => Promise<void>
  fetchActionDetail: (actionId: string) => Promise<void>
  fetchImpact: (actionId: string, personas: string[]) => Promise<void>
  sendChatMessage: (actionId: string, message: string) => Promise<void>
  toggleSave: (actionId: string) => Promise<void>
  fetchFeed: (options?: { personas?: string[]; categories?: string[]; state?: string }) => Promise<void>
  clearChat: () => void
  setFilters: (filters: Partial<ActionFilters>) => void
  clearSelectedAction: () => void
}

export const useActionStore = create<ActionState>((set, get) => ({
  // Initial state
  actions: [],
  selectedAction: null,
  chatHistory: [],
  impactResults: {},
  totalActions: 0,
  filters: { page: 1 },
  savedActionIds: getSavedActionIdsSync(),
  feed: [],
  isLoading: false,
  isChatLoading: false,
  isImpactLoading: false,
  isFeedLoading: false,

  fetchActions: async (filters) => {
    const currentFilters = get().filters
    const merged = { ...currentFilters, ...filters }
    set({ isLoading: true, filters: merged })

    try {
      const result = await getActions(merged)
      set({ actions: result.actions, totalActions: result.total, isLoading: false })
    } catch {
      set({ isLoading: false })
      toast.error('Failed to load actions. Using cached data if available.')
    }
  },

  fetchActionDetail: async (actionId) => {
    set({ isLoading: true, selectedAction: null, chatHistory: [], impactResults: {} })
    try {
      const action = await getActionDetail(actionId)
      set({ selectedAction: action, isLoading: false })
    } catch {
      set({ isLoading: false })
      toast.error('Failed to load action details.')
    }
  },

  fetchImpact: async (actionId, personas) => {
    set({ isImpactLoading: true })
    try {
      const results = await getActionImpact(actionId, personas)
      set({ impactResults: results, isImpactLoading: false })
    } catch {
      set({ isImpactLoading: false })
      toast.error('Failed to load impact analysis.')
    }
  },

  sendChatMessage: async (actionId, message) => {
    const history = get().chatHistory
    const userMsg: ChatMessage = { role: 'user', content: message }
    set({ chatHistory: [...history, userMsg], isChatLoading: true })

    try {
      const { response } = await chatWithAction(actionId, message, [...history, userMsg])
      const assistantMsg: ChatMessage = { role: 'assistant', content: response }
      set((state) => ({
        chatHistory: [...state.chatHistory, assistantMsg],
        isChatLoading: false,
      }))
    } catch {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      set((state) => ({
        chatHistory: [...state.chatHistory, errorMsg],
        isChatLoading: false,
      }))
    }
  },

  toggleSave: async (actionId) => {
    const { savedActionIds } = get()
    const isSaved = savedActionIds.has(actionId)
    const next = new Set(savedActionIds)
    if (isSaved) {
      next.delete(actionId)
    } else {
      next.add(actionId)
    }
    set({ savedActionIds: next })

    try {
      if (isSaved) {
        await unsaveAction(actionId)
      } else {
        await saveAction(actionId)
      }
    } catch {
      set({ savedActionIds })
    }
  },

  fetchFeed: async (options) => {
    set({ isFeedLoading: true })
    try {
      const feed = await getActionFeed(options)
      set({ feed, isFeedLoading: false })
    } catch {
      set({ isFeedLoading: false })
    }
  },

  clearChat: () => set({ chatHistory: [] }),

  setFilters: (filters) => {
    const current = get().filters
    set({ filters: { ...current, ...filters } })
  },

  clearSelectedAction: () => {
    set({ selectedAction: null, chatHistory: [], impactResults: {} })
  },
}))
