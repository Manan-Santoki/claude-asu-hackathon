import { create } from 'zustand'
import {
  type Representative,
  type RepVote,
  type CampaignPromise,
  type RepScores,
  type ContactEmailResult,
  type SponsoredBill,
  getReps,
  getRepDetail,
  getRepVotes,
  getRepPromises,
  getRepScore,
  contactRep,
  getRepBills,
} from '../api/reps'

interface RepFilters {
  state?: string
  chamber?: 'senate' | 'house'
  search?: string
  sortBy?: 'alignment' | 'loyalty' | 'attendance'
}

interface RepState {
  // Data
  reps: Representative[]
  selectedRep: Representative | null
  votes: RepVote[]
  totalVotes: number
  votePage: number
  promises: CampaignPromise[]
  scores: RepScores | null
  sponsoredBills: SponsoredBill[]
  contactEmail: ContactEmailResult | null
  filters: RepFilters

  // Loading states
  isLoading: boolean
  isVotesLoading: boolean
  isPromisesLoading: boolean
  isScoreLoading: boolean
  isContactLoading: boolean

  // Actions
  fetchReps: (filters?: Partial<RepFilters>) => Promise<void>
  fetchRepDetail: (memberId: string) => Promise<void>
  fetchVotes: (memberId: string, page?: number) => Promise<void>
  fetchPromises: (memberId: string) => Promise<void>
  fetchScore: (memberId: string) => Promise<void>
  fetchSponsoredBills: (memberId: string) => Promise<void>
  generateContactEmail: (memberId: string, billId?: string, concern?: string) => Promise<void>
  setFilters: (filters: Partial<RepFilters>) => void
  clearSelectedRep: () => void
  clearContactEmail: () => void
}

export const useRepStore = create<RepState>((set, get) => ({
  // Initial state
  reps: [],
  selectedRep: null,
  votes: [],
  totalVotes: 0,
  votePage: 1,
  promises: [],
  scores: null,
  sponsoredBills: [],
  contactEmail: null,
  filters: {},
  isLoading: false,
  isVotesLoading: false,
  isPromisesLoading: false,
  isScoreLoading: false,
  isContactLoading: false,

  fetchReps: async (filters) => {
    const currentFilters = get().filters
    const merged = { ...currentFilters, ...filters }
    set({ isLoading: true, filters: merged })

    try {
      let reps = await getReps(merged)

      // Client-side sorting
      const sortBy = merged.sortBy
      if (sortBy) {
        reps = [...reps].sort((a, b) => {
          if (sortBy === 'loyalty') return b.votes_with_party_pct - a.votes_with_party_pct
          if (sortBy === 'attendance') return a.missed_votes_pct - b.missed_votes_pct
          return 0 // alignment sort requires score computation — handled in component
        })
      }

      set({ reps, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchRepDetail: async (memberId) => {
    set({
      isLoading: true,
      selectedRep: null,
      votes: [],
      totalVotes: 0,
      votePage: 1,
      promises: [],
      scores: null,
      sponsoredBills: [],
      contactEmail: null,
    })

    try {
      const rep = await getRepDetail(memberId)
      set({ selectedRep: rep, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchVotes: async (memberId, page = 1) => {
    set({ isVotesLoading: true })
    try {
      const result = await getRepVotes(memberId, page)
      set({
        votes: page === 1 ? result.votes : [...get().votes, ...result.votes],
        totalVotes: result.total,
        votePage: page,
        isVotesLoading: false,
      })
    } catch {
      set({ isVotesLoading: false })
    }
  },

  fetchPromises: async (memberId) => {
    set({ isPromisesLoading: true })
    try {
      const promises = await getRepPromises(memberId)
      set({ promises, isPromisesLoading: false })
    } catch {
      set({ isPromisesLoading: false })
    }
  },

  fetchScore: async (memberId) => {
    set({ isScoreLoading: true })
    try {
      const scores = await getRepScore(memberId)
      set({ scores, isScoreLoading: false })
    } catch {
      set({ isScoreLoading: false })
    }
  },

  fetchSponsoredBills: async (memberId) => {
    try {
      const bills = await getRepBills(memberId)
      set({ sponsoredBills: bills })
    } catch {
      // silent fail
    }
  },

  generateContactEmail: async (memberId, billId, concern) => {
    set({ isContactLoading: true })
    try {
      const result = await contactRep(memberId, billId, concern)
      set({ contactEmail: result, isContactLoading: false })
    } catch {
      set({ isContactLoading: false })
    }
  },

  setFilters: (filters) => {
    const current = get().filters
    set({ filters: { ...current, ...filters } })
  },

  clearSelectedRep: () => {
    set({
      selectedRep: null,
      votes: [],
      totalVotes: 0,
      votePage: 1,
      promises: [],
      scores: null,
      sponsoredBills: [],
      contactEmail: null,
    })
  },

  clearContactEmail: () => {
    set({ contactEmail: null })
  },
}))
