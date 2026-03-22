import { create } from 'zustand'
import {
  type Notification,
  generateNotifications,
  getNotifications,
  getUnreadCount,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
  getPreferences,
  updatePreferences as apiUpdatePreferences,
} from '../api/notifications'
import { useAuthStore } from './useAuthStore'
import { getBills } from '../api/bills'
import { getActions } from '../api/actions'

interface NotifState {
  // Data
  notifications: Notification[]
  unreadCount: number
  preferences: Record<string, boolean>

  // Loading
  isLoading: boolean
  hasGenerated: boolean

  // Actions
  generateFromProfile: () => Promise<void>
  fetchNotifications: (page?: number, unreadOnly?: boolean) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  fetchPreferences: () => Promise<void>
  updatePreferences: (prefs: Record<string, boolean>) => Promise<void>
  startPolling: () => () => void
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: {},
  isLoading: false,
  hasGenerated: false,

  generateFromProfile: async () => {
    const { user, isAuthenticated, profiles, categories, hasCompletedOnboarding } = useAuthStore.getState()

    // Only generate if user is logged in and has completed onboarding
    if (!isAuthenticated || !user || !hasCompletedOnboarding()) return

    // Don't regenerate if already done this session
    if (get().hasGenerated) return

    try {
      // Fetch all content to scan
      const [billResult, actionResult] = await Promise.all([
        getBills({ page: 1 }),
        getActions(),
      ])

      // Run the matching engine
      await generateNotifications(
        user,
        profiles,
        categories,
        billResult.bills,
        actionResult.actions
      )

      // Fetch the generated notifications
      const notifications = await getNotifications()
      const unreadCount = await getUnreadCount()
      set({ notifications, unreadCount, hasGenerated: true })
    } catch {
      // Silently fail — will retry on next poll
    }
  },

  fetchNotifications: async (page = 1, unreadOnly = false) => {
    set({ isLoading: true })

    // Generate on first fetch if not done yet
    if (!get().hasGenerated) {
      await get().generateFromProfile()
    }

    try {
      const notifications = await getNotifications(page, unreadOnly)
      set({ notifications, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    // Generate on first count check if not done yet
    if (!get().hasGenerated) {
      await get().generateFromProfile()
    }

    try {
      const unreadCount = await getUnreadCount()
      set({ unreadCount })
    } catch {
      // silently fail — count will refresh on next poll
    }
  },

  markRead: async (id) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))

    try {
      await apiMarkRead(id)
    } catch {
      // Refetch on failure
      get().fetchNotifications()
      get().fetchUnreadCount()
    }
  },

  markAllRead: async () => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))

    try {
      await apiMarkAllRead()
    } catch {
      get().fetchNotifications()
      get().fetchUnreadCount()
    }
  },

  fetchPreferences: async () => {
    try {
      const preferences = await getPreferences()
      set({ preferences })
    } catch {
      // ignore
    }
  },

  updatePreferences: async (prefs) => {
    // Optimistic update
    set((state) => ({ preferences: { ...state.preferences, ...prefs } }))

    try {
      await apiUpdatePreferences(prefs)
    } catch {
      // Refetch on failure
      get().fetchPreferences()
    }
  },

  startPolling: () => {
    // Fetch immediately
    get().fetchUnreadCount()

    // Poll every 60 seconds
    const interval = setInterval(() => {
      get().fetchUnreadCount()
    }, 60_000)

    // Return cleanup function
    return () => clearInterval(interval)
  },
}))
