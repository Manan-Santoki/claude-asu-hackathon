import { create } from 'zustand'
import type { DemoPersona, DemoStep } from '@/lib/demoScripts'
import { DEMO_PERSONAS } from '@/lib/demoScripts'

export type DemoPhase = 'email' | 'picker' | 'playing' | 'cta'

interface DemoState {
  // Mode
  isActive: boolean
  phase: DemoPhase

  // Persona
  selectedPersona: DemoPersona | null
  completedPersonas: string[]

  // Sequence playback
  currentStepIndex: number
  isAutoPlaying: boolean
  playbackSpeed: 'normal' | 'fast'

  // Spotlight
  spotlightTarget: string | null
  narratorText: string

  // Page transition
  isTransitioning: boolean
  transitionLabel: string

  // Animated cursor
  cursorTarget: { x: number; y: number } | null
  cursorVisible: boolean
  cursorClicking: boolean

  // Notification / email
  showNotification: boolean
  notificationData: { title: string; subtitle: string; type: string } | null
  showCheckEmail: boolean
  emailSent: boolean

  // Email
  capturedEmail: string | null

  // Original store snapshots (for restore on exit)
  _originalAuth: { profiles: string[]; categories: string[]; isAuthenticated: boolean; user: unknown } | null
  _originalQuiz: { hasCompleted: boolean; answers: Record<string, number>; matches: unknown[] } | null

  // Actions
  startDemo: () => void
  exitDemo: () => void
  setPhase: (phase: DemoPhase) => void
  selectPersona: (id: string) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  toggleAutoPlay: () => void
  toggleSpeed: () => void
  setSpotlight: (selector: string | null) => void
  setNarrator: (text: string) => void
  captureEmail: (email: string) => void
  switchPersona: () => void
  getCurrentStep: () => DemoStep | null
  getTotalSteps: () => number

  // Transition
  startTransition: (label: string) => void
  endTransition: () => void

  // Cursor
  moveCursor: (x: number, y: number) => void
  clickCursor: () => void
  hideCursor: () => void

  // Notification
  fireNotification: (data: { title: string; subtitle: string; type: string }) => void
  dismissNotification: () => void
  setShowCheckEmail: (show: boolean) => void
  setEmailSent: (sent: boolean) => void

  // Store snapshots
  saveOriginalStores: (auth: DemoState['_originalAuth'], quiz: DemoState['_originalQuiz']) => void
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isActive: false,
  phase: 'email',

  selectedPersona: null,
  completedPersonas: [],

  currentStepIndex: 0,
  isAutoPlaying: true,
  playbackSpeed: 'normal',

  spotlightTarget: null,
  narratorText: '',

  isTransitioning: false,
  transitionLabel: '',

  cursorTarget: null,
  cursorVisible: false,
  cursorClicking: false,

  showNotification: false,
  notificationData: null,
  showCheckEmail: false,
  emailSent: false,

  capturedEmail: null,

  _originalAuth: null,
  _originalQuiz: null,

  startDemo: () => set({
    isActive: true,
    phase: 'email',
    currentStepIndex: 0,
    narratorText: '',
    spotlightTarget: null,
    isTransitioning: false,
    cursorVisible: false,
    showNotification: false,
    showCheckEmail: false,
    emailSent: false,
  }),

  exitDemo: () => set({
    isActive: false,
    phase: 'email',
    selectedPersona: null,
    currentStepIndex: 0,
    isAutoPlaying: true,
    spotlightTarget: null,
    narratorText: '',
    isTransitioning: false,
    transitionLabel: '',
    cursorTarget: null,
    cursorVisible: false,
    cursorClicking: false,
    showNotification: false,
    notificationData: null,
    showCheckEmail: false,
    emailSent: false,
  }),

  setPhase: (phase) => set({ phase }),

  selectPersona: (id) => {
    const persona = DEMO_PERSONAS.find(p => p.id === id)
    if (persona) {
      set({
        selectedPersona: persona,
        phase: 'playing',
        currentStepIndex: 0,
        narratorText: persona.steps[0]?.narrator || '',
        spotlightTarget: null,
        showNotification: false,
        showCheckEmail: false,
        emailSent: false,
      })
    }
  },

  nextStep: () => {
    const { selectedPersona, currentStepIndex, completedPersonas } = get()
    if (!selectedPersona) return
    const total = selectedPersona.steps.length
    if (currentStepIndex < total - 1) {
      const nextIndex = currentStepIndex + 1
      const step = selectedPersona.steps[nextIndex]
      set({
        currentStepIndex: nextIndex,
        narratorText: step?.narrator || '',
        spotlightTarget: null,
        cursorVisible: false,
      })
    } else {
      set({
        phase: 'cta',
        completedPersonas: [...completedPersonas, selectedPersona.id],
        spotlightTarget: null,
        cursorVisible: false,
        showNotification: false,
      })
    }
  },

  prevStep: () => {
    const { selectedPersona, currentStepIndex } = get()
    if (!selectedPersona || currentStepIndex <= 0) return
    const prevIndex = currentStepIndex - 1
    const step = selectedPersona.steps[prevIndex]
    set({
      currentStepIndex: prevIndex,
      narratorText: step?.narrator || '',
      spotlightTarget: null,
      cursorVisible: false,
    })
  },

  goToStep: (index) => {
    const { selectedPersona } = get()
    if (!selectedPersona) return
    const step = selectedPersona.steps[index]
    if (step) {
      set({
        currentStepIndex: index,
        narratorText: step.narrator || '',
        spotlightTarget: null,
        cursorVisible: false,
      })
    }
  },

  toggleAutoPlay: () => set(s => ({ isAutoPlaying: !s.isAutoPlaying })),
  toggleSpeed: () => set(s => ({ playbackSpeed: s.playbackSpeed === 'normal' ? 'fast' : 'normal' })),

  setSpotlight: (selector) => set({ spotlightTarget: selector }),
  setNarrator: (text) => set({ narratorText: text }),
  captureEmail: (email) => set({ capturedEmail: email }),

  switchPersona: () => set({
    phase: 'picker',
    selectedPersona: null,
    currentStepIndex: 0,
    narratorText: '',
    spotlightTarget: null,
    cursorVisible: false,
    showNotification: false,
    showCheckEmail: false,
  }),

  getCurrentStep: () => {
    const { selectedPersona, currentStepIndex } = get()
    if (!selectedPersona) return null
    return selectedPersona.steps[currentStepIndex] || null
  },

  getTotalSteps: () => {
    const { selectedPersona } = get()
    return selectedPersona?.steps.length || 0
  },

  // Transition
  startTransition: (label) => set({ isTransitioning: true, transitionLabel: label }),
  endTransition: () => set({ isTransitioning: false, transitionLabel: '' }),

  // Cursor
  moveCursor: (x, y) => set({ cursorTarget: { x, y }, cursorVisible: true, cursorClicking: false }),
  clickCursor: () => set({ cursorClicking: true }),
  hideCursor: () => set({ cursorVisible: false, cursorClicking: false }),

  // Notification
  fireNotification: (data) => set({ showNotification: true, notificationData: data }),
  dismissNotification: () => set({ showNotification: false, notificationData: null, showCheckEmail: false }),
  setShowCheckEmail: (show) => set({ showCheckEmail: show }),
  setEmailSent: (sent) => set({ emailSent: sent }),

  // Store snapshots
  saveOriginalStores: (auth, quiz) => set({ _originalAuth: auth, _originalQuiz: quiz }),
}))
