import { create } from 'zustand'
import type { User } from '@/api/auth'
import * as authApi from '@/api/auth'

interface AuthState {
  user: User | null
  profiles: string[]
  categories: string[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  setProfiles: (profiles: string[]) => void
  setCategories: (categories: string[]) => void
  loadProfile: () => Promise<void>
  saveOnboarding: (stateCode: string, zipCode: string, profiles: string[], categories: string[]) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profiles: [],
  categories: [],
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const user = await authApi.login(email, password)
    const profile = await authApi.getProfile()
    set({
      user,
      isAuthenticated: true,
      profiles: profile?.profiles || [],
      categories: profile?.categories || [],
    })
  },

  signup: async (email, password, name) => {
    const user = await authApi.signup(email, password, name)
    set({ user, isAuthenticated: true, profiles: [], categories: [] })
  },

  logout: async () => {
    await authApi.logout()
    set({ user: null, isAuthenticated: false, profiles: [], categories: [] })
  },

  setProfiles: (profiles) => set({ profiles }),
  setCategories: (categories) => set({ categories }),

  loadProfile: async () => {
    set({ isLoading: true })
    const profile = await authApi.getProfile()
    if (profile) {
      set({
        user: profile.user,
        profiles: profile.profiles,
        categories: profile.categories,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      set({ isLoading: false })
    }
  },

  saveOnboarding: async (stateCode, zipCode, profiles, categories) => {
    await authApi.saveOnboarding(stateCode, zipCode, profiles, categories)
    const profile = await authApi.getProfile()
    if (profile) {
      set({
        user: profile.user,
        profiles: profile.profiles,
        categories: profile.categories,
      })
    }
  },
}))
