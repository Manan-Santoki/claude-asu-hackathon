import { create } from 'zustand'
import {
  type QuizQuestion,
  type MatchResult,
  getQuizQuestions,
  submitQuiz,
} from '../api/quiz'

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

  // Actions
  fetchQuestions: () => Promise<void>
  setAnswer: (axis: string, value: number) => void
  nextStep: () => void
  prevStep: () => void
  submitQuiz: () => Promise<void>
  resetQuiz: () => void
  toggleCandidateForCompare: (id: string) => void
  clearCompare: () => void
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
