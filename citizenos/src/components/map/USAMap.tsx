import { useState, useEffect, useCallback, useRef } from 'react'
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
import { getStateStats, type StateStats } from '@/api/map'
import DataSourceBadge from '@/components/shared/DataSourceBadge'

const GEO_URL = '/us-states-topo.json'

function getStateFill(
  stateCode: string,
  colorMode: string,
  statsMap: Record<string, StateStats>,
  maxBills: number,
  _homeState?: string
): string {
  const stats = statsMap[stateCode]

  if (colorMode === 'bill_activity') {
    if (!stats) return '#eff6ff'
    const intensity = maxBills > 0 ? stats.billCount / maxBills : 0
    const r = Math.round(191 - intensity * 161)
    const g = Math.round(219 - intensity * 155)
    const b = Math.round(254 - intensity * 79)
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
    const r = Math.round(187 - intensity * 166)
    const g = Math.round(247 - intensity * 119)
    const b = Math.round(208 - intensity * 147)
    return `rgb(${r}, ${g}, ${b})`
  }

  return '#d1d5db'
}

export default function USAMap() {
  const colorMode = useMapStore((s) => s.colorMode)
  const setSelectedState = useMapStore((s) => s.setSelectedState)
  const user = useAuthStore((s) => s.user)
  const homeState = user?.state_code

  const [tooltipContent, setTooltipContent] = useState('')
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Stats from DB
  const [statsMap, setStatsMap] = useState<Record<string, StateStats>>({})
  const [maxBills, setMaxBills] = useState(1)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    getStateStats().then((stats) => {
      const map: Record<string, StateStats> = {}
      let max = 0
      for (const s of stats) {
        map[s.code] = s
        if (s.billCount > max) max = s.billCount
      }
      setStatsMap(map)
      setMaxBills(max || 1)
    })
  }, [])

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
        const stats = statsMap[state.code]
        const billCount = stats?.billCount ?? 0
        setTooltipContent(
          `${state.name} — ${billCount.toLocaleString()} bills this year`
        )
      }
    },
    [statsMap]
  )

  const handleMouseLeave = useCallback(() => {
    setTooltipContent('')
  }, [])

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
        className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-300 dark:bg-slate-900"
        onMouseMove={handleMouseMove}
      >
        <MapControls />
        <MapLegend />
        <div className="absolute top-3 left-3 z-10">
          <DataSourceBadge sourceKey="map" />
        </div>

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
                  const isHome = homeState === stateCode
                  const fill = getStateFill(
                    stateCode,
                    colorMode,
                    statsMap,
                    maxBills,
                    homeState
                  )

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
