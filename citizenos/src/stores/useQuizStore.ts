import { create } from 'zustand'
import {
  type QuizQuestion,
  type MatchResult,
  getQuizQuestions,
  submitQuiz,
} from '../api/quiz'
import { insforge } from '@/lib/insforge'

// ---------------------------------------------------------------------------
// Persistence helpers — quiz results stored in InsForge DB
// ---------------------------------------------------------------------------

function getUserId(): string | null {
  try {
    // Try to get auth user id from insforge session
    const session = (insforge as any)?.auth?.session?.()
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

// Also persist to localStorage as a fast fallback
function saveToLocalStorage(answers: Record<string, number>, matches: MatchResult[], hasCompleted: boolean) {
  try {
    localStorage.setItem('citizenos_quiz', JSON.stringify({ answers, matches, hasCompleted, ts: Date.now() }))
  } catch { /* ignore */ }
}

function loadFromLocalStorage(): { answers: Record<string, number>; matches: MatchResult[]; hasCompleted: boolean } | null {
  try {
    const raw = localStorage.getItem('citizenos_quiz')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function saveToDb(answers: Record<string, number>, matches: MatchResult[], hasCompleted: boolean) {
  const userId = getUserId() ?? 'anonymous'
  try {
    // Upsert: update if exists, insert if not
    const { data: existing } = await insforge.database
      .from('quiz_results')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existing && (existing as unknown[]).length > 0) {
      await insforge.database
        .from('quiz_results')
        .update({ answers, matches, has_completed: hasCompleted, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    } else {
      await insforge.database
        .from('quiz_results')
        .insert({ user_id: userId, answers, matches, has_completed: hasCompleted })
    }
  } catch (err) {
    console.warn('Failed to save quiz results to DB:', err)
  }
}

async function loadFromDb(): Promise<{ answers: Record<string, number>; matches: MatchResult[]; hasCompleted: boolean } | null> {
  const userId = getUserId() ?? 'anonymous'
  try {
    const { data, error } = await insforge.database
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .limit(1)

    if (error || !data || (data as unknown[]).length === 0) return null
    const row = (data as Record<string, unknown>[])[0]
    return {
      answers: (row.answers ?? {}) as Record<string, number>,
      matches: (row.matches ?? []) as MatchResult[],
      hasCompleted: Boolean(row.has_completed),
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface QuizState {
  // Data
  questions: QuizQuestion[]
  answers: Record<string, number>
  currentStep: number
  matches: MatchResult[]
  selectedCandidateIds: string[]

  // Loading states
  isLoading: boolean
  isSubmitting: boolean
  hasCompleted: boolean
  isRestored: boolean

  // Actions
  fetchQuestions: () => Promise<void>
  setAnswer: (axis: string, value: number) => void
  nextStep: () => void
  prevStep: () => void
  submitQuiz: () => Promise<void>
  resetQuiz: () => void
  toggleCandidateForCompare: (id: string) => void
  clearCompare: () => void
  restoreQuiz: () => Promise<void>
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  questions: [],
  answers: {},
  currentStep: 0,
  matches: [],
  selectedCandidateIds: [],
  isLoading: false,
  isSubmitting: false,
  hasCompleted: false,
  isRestored: false,

  restoreQuiz: async () => {
    // Try localStorage first (fast), then DB
    const local = loadFromLocalStorage()
    if (local && local.hasCompleted) {
      set({
        answers: local.answers,
        matches: local.matches,
        hasCompleted: local.hasCompleted,
        isRestored: true,
      })
      return
    }

    // Try DB
    const dbData = await loadFromDb()
    if (dbData && dbData.hasCompleted) {
      set({
        answers: dbData.answers,
        matches: dbData.matches,
        hasCompleted: dbData.hasCompleted,
        isRestored: true,
      })
      // Also cache in localStorage for faster next load
      saveToLocalStorage(dbData.answers, dbData.matches, dbData.hasCompleted)
      return
    }

    set({ isRestored: true })
  },

  fetchQuestions: async () => {
    set({ isLoading: true })
    try {
      const questions = await getQuizQuestions()
      set({ questions, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  setAnswer: (axis, value) => {
    set((state) => ({
      answers: { ...state.answers, [axis]: value },
    }))
  },

  nextStep: () => {
    const { currentStep, questions } = get()
    if (currentStep < questions.length - 1) {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  submitQuiz: async () => {
    const { answers } = get()
    set({ isSubmitting: true })
    try {
      const matches = await submitQuiz(answers)
      set({
        matches,
        isSubmitting: false,
        hasCompleted: true,
      })

      // Persist to both localStorage and DB
      saveToLocalStorage(answers, matches, true)
      saveToDb(answers, matches, true) // fire-and-forget
    } catch {
      set({ isSubmitting: false })
    }
  },

  resetQuiz: () => {
    set({
      answers: {},
      currentStep: 0,
      matches: [],
      selectedCandidateIds: [],
      hasCompleted: false,
      isSubmitting: false,
    })
    // Clear persisted data
    try { localStorage.removeItem('citizenos_quiz') } catch { /* ignore */ }
    const userId = getUserId() ?? 'anonymous'
    Promise.resolve(
      insforge.database
        .from('quiz_results')
        .delete()
        .eq('user_id', userId)
    ).catch(() => {})
  },

  toggleCandidateForCompare: (id) => {
    set((state) => {
      const ids = state.selectedCandidateIds
      if (ids.includes(id)) {
        return { selectedCandidateIds: ids.filter((i) => i !== id) }
      }
      if (ids.length >= 2) {
        return { selectedCandidateIds: [ids[1], id] }
      }
      return { selectedCandidateIds: [...ids, id] }
    })
  },

  clearCompare: () => {
    set({ selectedCandidateIds: [] })
  },
}))
