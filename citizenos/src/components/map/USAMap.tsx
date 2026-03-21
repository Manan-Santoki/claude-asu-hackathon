import { useState, useMemo, useCallback } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import PageWrapper from '@/components/layout/PageWrapper'
import StatePanel from '@/components/map/StatePanel'
import MapLegend from '@/components/map/MapLegend'
import MapControls from '@/components/map/MapControls'
import { useMapStore } from '@/stores/useMapStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getStateByFips } from '@/lib/states'
import { type StateStats } from '@/api/map'

const GEO_URL = '/us-states-topo.json'

// Mock stats keyed by state code for quick lookup
const MOCK_STATS: Record<string, StateStats> = {
  CA: { code: 'CA', billCount: 42, partyControl: 'D', civicScore: 78 },
  TX: { code: 'TX', billCount: 38, partyControl: 'R', civicScore: 65 },
  NY: { code: 'NY', billCount: 35, partyControl: 'D', civicScore: 82 },
  FL: { code: 'FL', billCount: 31, partyControl: 'R', civicScore: 60 },
  IL: { code: 'IL', billCount: 28, partyControl: 'D', civicScore: 71 },
  PA: { code: 'PA', billCount: 25, partyControl: 'split', civicScore: 68 },
  OH: { code: 'OH', billCount: 22, partyControl: 'R', civicScore: 62 },
  GA: { code: 'GA', billCount: 20, partyControl: 'R', civicScore: 58 },
  NC: { code: 'NC', billCount: 19, partyControl: 'R', civicScore: 59 },
  MI: { code: 'MI', billCount: 18, partyControl: 'D', civicScore: 70 },
  AZ: { code: 'AZ', billCount: 17, partyControl: 'split', civicScore: 64 },
  WA: { code: 'WA', billCount: 16, partyControl: 'D', civicScore: 76 },
  MA: { code: 'MA', billCount: 15, partyControl: 'D', civicScore: 85 },
  VA: { code: 'VA', billCount: 14, partyControl: 'split', civicScore: 72 },
  CO: { code: 'CO', billCount: 13, partyControl: 'D', civicScore: 74 },
  MN: { code: 'MN', billCount: 12, partyControl: 'D', civicScore: 80 },
  NJ: { code: 'NJ', billCount: 12, partyControl: 'D', civicScore: 69 },
  TN: { code: 'TN', billCount: 11, partyControl: 'R', civicScore: 55 },
  IN: { code: 'IN', billCount: 10, partyControl: 'R', civicScore: 57 },
  MO: { code: 'MO', billCount: 10, partyControl: 'R', civicScore: 56 },
}

const MAX_BILL_COUNT = 42

function getStateFill(
  stateCode: string,
  colorMode: string,
  homeState?: string
): string {
  const stats = MOCK_STATS[stateCode]

  if (colorMode === 'bill_activity') {
    if (!stats) return '#eff6ff' // very light blue for states with no data
    const intensity = stats.billCount / MAX_BILL_COUNT
    // Light blue (#bfdbfe) to dark blue (#1e40af)
    const r = Math.round(191 - intensity * 161) // 191 -> 30
    const g = Math.round(219 - intensity * 155) // 219 -> 64
    const b = Math.round(254 - intensity * 79)  // 254 -> 175
    return `rgb(${r}, ${g}, ${b})`
  }

  if (colorMode === 'party_control') {
    if (!stats) return '#d1d5db'
    if (stats.partyControl === 'D') return '#3b82f6'
    if (stats.partyControl === 'R') return '#ef4444'
    return '#8b5cf6'
  }

  if (colorMode === 'civic_score') {
    if (!stats) return '#dcfce7'
    const intensity = stats.civicScore / 100
    const r = Math.round(187 - intensity * 166) // 187 -> 21
    const g = Math.round(247 - intensity * 119) // 247 -> 128
    const b = Math.round(208 - intensity * 147) // 208 -> 61
    return `rgb(${r}, ${g}, ${b})`
  }

  return '#d1d5db'
}

export default function USAMap() {
  const colorMode = useMapStore((s) => s.colorMode)
  const setSelectedState = useMapStore((s) => s.setSelectedState)
  const setHoveredState = useMapStore((s) => s.setHoveredState)
  const hoveredState = useMapStore((s) => s.hoveredState)
  const user = useAuthStore((s) => s.user)
  const homeState = user?.state_code

  const [tooltipContent, setTooltipContent] = useState('')
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleClick = useCallback(
    (fips: string) => {
      const state = getStateByFips(fips)
      if (state) {
        setSelectedState(state.code)
      }
    },
    [setSelectedState]
  )

  const handleMouseEnter = useCallback(
    (fips: string) => {
      const state = getStateByFips(fips)
      if (state) {
        setHoveredState(state.code)
        const stats = MOCK_STATS[state.code]
        const billCount = stats?.billCount ?? 0
        setTooltipContent(`${state.name} — ${billCount} bills active`)
      }
    },
    [setHoveredState]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredState(null)
    setTooltipContent('')
  }, [setHoveredState])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (tooltipContent) {
        setTooltipPos({ x: e.clientX, y: e.clientY })
      }
    },
    [tooltipContent]
  )

  return (
    <PageWrapper className="!px-0 !py-0 !max-w-none">
      <div
        className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-muted/30"
        onMouseMove={handleMouseMove}
      >
        <MapControls />
        <MapLegend />

        <ComposableMap
          projection="geoAlbersUsa"
          className="h-full w-full"
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const fips = geo.id as string
                  const state = getStateByFips(fips)
                  const stateCode = state?.code ?? ''
                  const isHovered = hoveredState === stateCode
                  const isHome = homeState === stateCode
                  const fill = getStateFill(stateCode, colorMode, homeState)

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClick(fips)}
                      onMouseEnter={() => handleMouseEnter(fips)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        default: {
                          fill,
                          stroke: isHome ? '#f59e0b' : '#ffffff',
                          strokeWidth: isHome ? 1.5 : 0.5,
                          opacity: 1,
                          cursor: 'pointer',
                          outline: 'none',
                        },
                        hover: {
                          fill,
                          stroke: isHome ? '#f59e0b' : '#1e293b',
                          strokeWidth: isHome ? 2 : 1.2,
                          opacity: 0.85,
                          cursor: 'pointer',
                          outline: 'none',
                        },
                        pressed: {
                          fill,
                          stroke: '#0f172a',
                          strokeWidth: 1.5,
                          opacity: 0.75,
                          cursor: 'pointer',
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltipContent && (
          <div
            className="pointer-events-none fixed z-50 rounded-md border bg-background px-3 py-1.5 text-sm shadow-lg"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y - 30,
            }}
          >
            {tooltipContent}
          </div>
        )}

        <StatePanel />
      </div>
    </PageWrapper>
  )
}
