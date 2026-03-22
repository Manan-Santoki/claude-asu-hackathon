import { insforge } from '@/lib/insforge'
import { useDataSourceStore } from '@/stores/useDataSourceStore'

const setMapSource = (s: 'live' | 'demo' | 'loading') =>
  useDataSourceStore.getState().setSource('map', s)

export interface StateStats {
  code: string
  billCount: number
  partyControl: 'D' | 'R' | 'split'
  civicScore: number
}

// ---------------------------------------------------------------------------
// DB row shape (matches state_stats table)
// ---------------------------------------------------------------------------

interface StateStatsRow {
  code: string
  state_name: string
  bill_count: number
  party_control: string
  civic_score: number
  updated_at: string
}

// ---------------------------------------------------------------------------
// In-memory cache (populated from DB on first load)
// ---------------------------------------------------------------------------

let cachedStats: StateStats[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 min client-side cache (DB is the source of truth)

function isCacheValid(): boolean {
  return cachedStats !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS
}

// ---------------------------------------------------------------------------
// Fetch all state stats from the database
// ---------------------------------------------------------------------------

export async function getStateStats(): Promise<StateStats[]> {
  if (isCacheValid()) return cachedStats!

  setMapSource('loading')
  try {
    const { data, error } = await insforge.database
      .from('state_stats')
      .select('code, bill_count, party_control, civic_score')
      .order('bill_count', { ascending: false })

    if (error || !data || data.length === 0) {
      throw new Error(error?.message ?? 'No data returned')
    }

    const rows = data as StateStatsRow[]
    const stats: StateStats[] = rows.map((r) => ({
      code: r.code,
      billCount: r.bill_count,
      partyControl: r.party_control as 'D' | 'R' | 'split',
      civicScore: r.civic_score,
    }))

    cachedStats = stats
    cacheTimestamp = Date.now()
    setMapSource('live')
    return stats
  } catch (err) {
    console.warn('Failed to fetch state stats from DB:', err)
    setMapSource('demo')
    return cachedStats ?? []
  }
}

// ---------------------------------------------------------------------------
// Get stats for a single state (from cache)
// ---------------------------------------------------------------------------

export function getStatStats(code: string): StateStats | undefined {
  if (!cachedStats) return undefined
  return cachedStats.find((s) => s.code === code)
}
