import { create } from 'zustand'

export type DataSourceStatus = 'live' | 'demo' | 'loading' | 'idle'

export type DataSourceKey =
  | 'bills'
  | 'actions'
  | 'reps'
  | 'candidates'
  | 'articles'
  | 'map'

interface DataSourceState {
  sources: Record<DataSourceKey, DataSourceStatus>
  setSource: (key: DataSourceKey, status: DataSourceStatus) => void
}

export const useDataSourceStore = create<DataSourceState>((set) => ({
  sources: {
    bills: 'idle',
    actions: 'idle',
    reps: 'idle',
    candidates: 'idle',
    articles: 'idle',
    map: 'idle',
  },

  setSource: (key, status) =>
    set((state) => ({
      sources: { ...state.sources, [key]: status },
    })),
}))
