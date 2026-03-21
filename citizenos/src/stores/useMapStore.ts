import { create } from 'zustand'

export type ColorMode = 'bill_activity' | 'party_control' | 'civic_score'

interface MapState {
  selectedState: string | null
  hoveredState: string | null
  colorMode: ColorMode
  setSelectedState: (stateCode: string | null) => void
  setHoveredState: (stateCode: string | null) => void
  setColorMode: (mode: ColorMode) => void
  clearSelection: () => void
}

export const useMapStore = create<MapState>((set) => ({
  selectedState: null,
  hoveredState: null,
  colorMode: 'bill_activity',

  setSelectedState: (stateCode) => set({ selectedState: stateCode }),
  setHoveredState: (stateCode) => set({ hoveredState: stateCode }),
  setColorMode: (mode) => set({ colorMode: mode }),
  clearSelection: () => set({ selectedState: null, hoveredState: null }),
}))
