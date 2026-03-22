import { create } from 'zustand'
import { type PersonArticle, getPersonArticles } from '@/api/articles'

interface ArticleState {
  articlesByPerson: Record<string, PersonArticle[]>
  loadingByPerson: Record<string, boolean>
  fetchArticles: (personId: string, personName: string) => Promise<void>
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articlesByPerson: {},
  loadingByPerson: {},

  fetchArticles: async (personId, personName) => {
    // Session-level cache: skip if already fetched
    if (get().articlesByPerson[personId]) return

    set((s) => ({
      loadingByPerson: { ...s.loadingByPerson, [personId]: true },
    }))

    const articles = await getPersonArticles(personId, personName)

    set((s) => ({
      articlesByPerson: { ...s.articlesByPerson, [personId]: articles },
      loadingByPerson: { ...s.loadingByPerson, [personId]: false },
    }))
  },
}))
