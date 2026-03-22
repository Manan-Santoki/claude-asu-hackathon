import { create } from 'zustand'
import type { User, OnboardingData } from '@/api/auth'
import * as authApi from '@/api/auth'

interface AuthState {
  user: User | null
  profiles: string[]
  categories: string[]
  isAuthenticated: boolean
  isLoading: boolean
  requiresEmailVerification: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGitHub: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  setProfiles: (profiles: string[]) => void
  setCategories: (categories: string[]) => void
  loadProfile: () => Promise<void>
  saveOnboarding: (data: OnboardingData) => Promise<void>
  hasCompletedOnboarding: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profiles: [],
  categories: [],
  isAuthenticated: false,
  isLoading: true,
  requiresEmailVerification: false,

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

  loginWithGoogle: async () => {
    // This triggers a redirect — browser navigates away
    await authApi.loginWithGoogle()
  },

  loginWithGitHub: async () => {
    await authApi.loginWithGitHub()
  },

  signup: async (email, password, name) => {
    const user = await authApi.signup(email, password, name)
    // InsForge may require email verification
    const profile = await authApi.getProfile()
    if (profile) {
      set({
        user,
        isAuthenticated: true,
        profiles: profile.profiles,
        categories: profile.categories,
        requiresEmailVerification: false,
      })
    } else {
      // Email verification required — user exists but no session yet
      set({ user, requiresEmailVerification: true })
    }
  },

  logout: async () => {
    await authApi.logout()
    set({ user: null, isAuthenticated: false, profiles: [], categories: [], requiresEmailVerification: false })
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

  hasCompletedOnboarding: () => {
    const { user } = get()
    return !!user?.onboarding_completed
  },

  saveOnboarding: async (data) => {
    await authApi.saveOnboarding(data)
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
