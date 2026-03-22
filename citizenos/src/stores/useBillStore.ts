import { create } from 'zustand'
import {
  type Bill,
  type ChatMessage,
  type BillImpactResult,
  getBills,
  getBillDetail,
  getBillImpact,
  chatWithBill,
  saveBill,
  unsaveBill,
  getSavedBillIdsSync,
} from '../api/bills'

interface BillFilters {
  state?: string
  category?: string
  status?: string
  search?: string
  page: number
}

interface BillState {
  // Data
  bills: Bill[]
  selectedBill: Bill | null
  chatHistory: ChatMessage[]
  impactResults: BillImpactResult | null
  totalBills: number
  filters: BillFilters
  savedBillIds: Set<string>

  // Loading states
  isLoading: boolean
  isChatLoading: boolean
  isImpactLoading: boolean

  // Actions
  fetchBills: (filters?: Partial<BillFilters>) => Promise<void>
  fetchBillDetail: (billId: string) => Promise<void>
  fetchImpact: (billId: string) => Promise<void>
  sendChatMessage: (billId: string, message: string) => Promise<void>
  toggleSave: (billId: string) => Promise<void>
  clearChat: () => void
  setFilters: (filters: Partial<BillFilters>) => void
  clearSelectedBill: () => void
}

export const useBillStore = create<BillState>((set, get) => ({
  // Initial state
  bills: [],
  selectedBill: null,
  chatHistory: [],
  impactResults: null,
  totalBills: 0,
  filters: { page: 1 },
  savedBillIds: getSavedBillIdsSync(),
  isLoading: false,
  isChatLoading: false,
  isImpactLoading: false,

  fetchBills: async (filters) => {
    const currentFilters = get().filters
    const merged = { ...currentFilters, ...filters }
    const isLoadMore = (merged.page ?? 1) > 1
    set({ isLoading: true, filters: merged })

    try {
      const result = await getBills(merged)
      if (isLoadMore) {
        const existing = get().bills
        set({ bills: [...existing, ...result.bills], totalBills: result.total, isLoading: false })
      } else {
        set({ bills: result.bills, totalBills: result.total, isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  fetchBillDetail: async (billId) => {
    set({ isLoading: true, selectedBill: null, chatHistory: [], impactResults: null })
    try {
      const bill = await getBillDetail(billId)
      set({ selectedBill: bill, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchImpact: async (billId) => {
    set({ isImpactLoading: true })
    try {
      const results = await getBillImpact(billId)
      set({ impactResults: results, isImpactLoading: false })
    } catch {
      set({ isImpactLoading: false })
    }
  },

  sendChatMessage: async (billId, message) => {
    const history = get().chatHistory
    const userMsg: ChatMessage = { role: 'user', content: message }
    set({ chatHistory: [...history, userMsg], isChatLoading: true })

    try {
      const { response } = await chatWithBill(billId, message, [...history, userMsg])
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

  toggleSave: async (billId) => {
    const { savedBillIds } = get()
    const isSaved = savedBillIds.has(billId)

    // Optimistic update
    const next = new Set(savedBillIds)
    if (isSaved) {
      next.delete(billId)
    } else {
      next.add(billId)
    }
    set({ savedBillIds: next })

    try {
      if (isSaved) {
        await unsaveBill(billId)
      } else {
        await saveBill(billId)
      }
    } catch {
      // Revert on failure
      set({ savedBillIds })
    }
  },

  clearChat: () => {
    set({ chatHistory: [] })
  },

  setFilters: (filters) => {
    const current = get().filters
    set({ filters: { ...current, ...filters } })
  },

  clearSelectedBill: () => {
    set({ selectedBill: null, chatHistory: [], impactResults: null })
  },
}))
