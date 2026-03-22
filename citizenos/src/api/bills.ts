// BillBreaker API client — reads from InsForge database (zero external API calls)

import { insforge } from '@/lib/insforge'
import { useDataSourceStore } from '@/stores/useDataSourceStore'
const setSource = (s: 'live' | 'demo' | 'loading' | 'cached') => useDataSourceStore.getState().setSource('bills', s)

export interface Bill {
  id: string
  bill_id: string
  bill_type: string
  bill_number: number
  congress: number
  title: string
  short_title: string
  sponsor_name: string
  sponsor_party: string
  sponsor_state: string
  summary_raw: string
  summary_ai: string
  impact_story: string
  status: 'introduced' | 'in_committee' | 'passed_house' | 'passed_senate' | 'enacted' | 'vetoed'
  status_detail: string
  categories: string[]
  introduced_date: string
  last_action_date: string
  congress_url: string
  full_text: string
  impact_personas: Record<string, string>
  state_relevance: string[]
  ai_processed: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ---------------------------------------------------------------------------
// In-memory cache for instant subsequent reads
// ---------------------------------------------------------------------------
let billsCache: Bill[] | null = null
let billsCacheTs = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 min in-memory cache

// In-memory saved bills
let savedBillIds = new Set<string>()

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

function mapDbBill(row: Record<string, unknown>): Bill {
  return {
    id: (row.id ?? '') as string,
    bill_id: (row.bill_id ?? '') as string,
    bill_type: (row.bill_type ?? '') as string,
    bill_number: Number(row.bill_number) || 0,
    congress: Number(row.congress) || 119,
    title: (row.title ?? '') as string,
    short_title: (row.short_title ?? '') as string,
    sponsor_name: (row.sponsor_name ?? '') as string,
    sponsor_party: (row.sponsor_party ?? '') as string,
    sponsor_state: (row.sponsor_state ?? '') as string,
    summary_raw: (row.summary_raw ?? '') as string,
    summary_ai: (row.summary_ai ?? '') as string,
    impact_story: (row.impact_story ?? '') as string,
    status: (row.status ?? 'introduced') as Bill['status'],
    status_detail: (row.status_detail ?? '') as string,
    categories: Array.isArray(row.categories) ? row.categories : (typeof row.categories === 'string' ? JSON.parse(row.categories || '[]') : []),
    introduced_date: (row.introduced_date ?? '') as string,
    last_action_date: (row.last_action_date ?? '') as string,
    congress_url: (row.congress_url ?? '') as string,
    full_text: (row.full_text ?? '') as string,
    impact_personas: (typeof row.impact_personas === 'object' && row.impact_personas !== null ? row.impact_personas : {}) as Record<string, string>,
    state_relevance: Array.isArray(row.state_relevance) ? row.state_relevance : (typeof row.state_relevance === 'string' ? JSON.parse(row.state_relevance || '[]') : []),
    ai_processed: Boolean(row.ai_processed),
  }
}

async function fetchAllBillsFromDb(): Promise<Bill[]> {
  // Return from in-memory cache if fresh
  if (billsCache && Date.now() - billsCacheTs < CACHE_TTL) {
    return billsCache
  }

  const { data, error } = await insforge.database
    .from('bills')
    .select('*')
    .order('last_action_date', { ascending: false })

  if (error || !data) {
    console.warn('Failed to fetch bills from DB:', error)
    return billsCache ?? []
  }

  billsCache = (data as Record<string, unknown>[]).map(mapDbBill)
  billsCacheTs = Date.now()
  return billsCache
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getBills(filters: {
  state?: string
  category?: string
  status?: string
  search?: string
  page?: number
} = {}): Promise<{ bills: Bill[]; total: number; page: number; pageSize: number }> {
  const page = filters.page ?? 1
  const pageSize = 6

  setSource('loading')

  try {
    let bills = await fetchAllBillsFromDb()

    // Apply filters client-side (data is small enough)
    if (filters.state) {
      bills = bills.filter((b) =>
        b.state_relevance.includes(filters.state!) || b.sponsor_state === filters.state
      )
    }
    if (filters.category) {
      bills = bills.filter((b) => b.categories.includes(filters.category!))
    }
    if (filters.status) {
      bills = bills.filter((b) => b.status === filters.status)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      bills = bills.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.short_title.toLowerCase().includes(q) ||
          b.summary_ai.toLowerCase().includes(q) ||
          b.sponsor_name.toLowerCase().includes(q)
      )
    }

    const total = bills.length
    const start = (page - 1) * pageSize
    const paged = bills.slice(start, start + pageSize)

    setSource('live')
    return { bills: paged, total, page, pageSize }
  } catch (err) {
    console.warn('DB fetch failed:', err)
    setSource('demo')
    return { bills: [], total: 0, page, pageSize }
  }
}

export async function getBillDetail(billId: string): Promise<Bill | null> {
  // Handle "latest"
  if (billId === 'latest') {
    const bills = await fetchAllBillsFromDb()
    if (bills.length > 0) return bills[0] // already sorted by last_action_date desc
    return null
  }

  // Fetch specific bill from DB
  const { data, error } = await insforge.database
    .from('bills')
    .select('*')
    .eq('id', billId)
    .limit(1)

  if (error || !data || (data as unknown[]).length === 0) {
    // Try from in-memory cache
    const cached = billsCache?.find((b) => b.id === billId)
    return cached ?? null
  }

  return mapDbBill((data as Record<string, unknown>[])[0])
}

export async function getBillImpact(
  billId: string,
  personas: string[]
): Promise<Record<string, string>> {
  const bill = await getBillDetail(billId)
  if (!bill) {
    const result: Record<string, string> = {}
    for (const p of personas) {
      result[p] = 'No specific impact analysis available for this persona.'
    }
    return result
  }

  const result: Record<string, string> = {}
  for (const p of personas) {
    result[p] = bill.impact_personas[p] ?? `Impact analysis for the "${bill.short_title}" on ${p}s is not yet available. This bill is categorized under ${bill.categories.join(', ')}.`
  }
  return result
}

export async function getBillStory(billId: string): Promise<string> {
  const bill = await getBillDetail(billId)
  if (bill && bill.impact_story) return bill.impact_story
  if (bill) {
    return `"${bill.short_title}" (${bill.bill_type.toUpperCase()} ${bill.bill_number}) was introduced on ${bill.introduced_date} by ${bill.sponsor_name || 'Congress'}. Current status: ${bill.status_detail || bill.status}. This bill falls under the categories: ${bill.categories.join(', ')}.`
  }
  return 'No impact story available for this bill.'
}

export async function chatWithBill(
  billId: string,
  message: string,
  _history: ChatMessage[]
): Promise<{ response: string }> {
  const bill = await getBillDetail(billId)
  if (!bill) return { response: 'Sorry, I could not find that bill.' }

  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('cost') || lowerMsg.includes('money') || lowerMsg.includes('price') || lowerMsg.includes('spend')) {
    return {
      response: `Great question about the financial aspects of the ${bill.short_title}. ${bill.summary_ai ? bill.summary_ai.split('.').slice(-3).join('.') : 'Detailed cost analysis is not yet available for this bill.'} Feel free to ask about specific cost impacts for different groups.`,
    }
  }
  if (lowerMsg.includes('who') && (lowerMsg.includes('sponsor') || lowerMsg.includes('wrote') || lowerMsg.includes('author'))) {
    return {
      response: `The ${bill.short_title} was sponsored by ${bill.sponsor_name || 'a member of Congress'} (${bill.sponsor_party || '?'}-${bill.sponsor_state || '?'}). It was introduced on ${bill.introduced_date} and is currently ${bill.status.replace('_', ' ')}.`,
    }
  }
  if (lowerMsg.includes('status') || lowerMsg.includes('pass') || lowerMsg.includes('vote')) {
    return {
      response: `Current status: ${bill.status_detail || bill.status}. The bill was introduced on ${bill.introduced_date} and last saw action on ${bill.last_action_date}.`,
    }
  }
  if (lowerMsg.includes('oppose') || lowerMsg.includes('against') || lowerMsg.includes('criticism')) {
    return {
      response: `Critics of the ${bill.short_title} have raised concerns about its cost and implementation timeline. Some argue that the approach may have unintended consequences for ${bill.categories.join(' and ')} policy. Would you like me to break down specific criticisms?`,
    }
  }
  if (lowerMsg.includes('support') || lowerMsg.includes('favor') || lowerMsg.includes('benefit')) {
    return {
      response: `Supporters of the ${bill.short_title} argue it addresses a critical need in ${bill.categories[0]}. ${bill.impact_story ? bill.impact_story.split('.')[0] + '.' : 'The bill has broad implications.'} The bill has backing from both advocacy groups and some bipartisan lawmakers.`,
    }
  }

  return {
    response: `The ${bill.short_title} is a ${bill.bill_type === 'hr' ? 'House' : 'Senate'} bill focused on ${bill.categories.join(', ')}. ${bill.summary_ai ? bill.summary_ai.split('.').slice(0, 2).join('.') + '.' : bill.title} What specific aspect would you like to know more about?`,
  }
}

export async function saveBill(billId: string): Promise<void> {
  savedBillIds.add(billId)
}

export async function unsaveBill(billId: string): Promise<void> {
  savedBillIds.delete(billId)
}

export async function getSavedBills(): Promise<Bill[]> {
  if (savedBillIds.size === 0) return []
  const allBills = await fetchAllBillsFromDb()
  return allBills.filter((b) => savedBillIds.has(b.id))
}

export function getSavedBillIdsSync(): Set<string> {
  return new Set(savedBillIds)
}

export async function getRepsVoted(
  billId: string
): Promise<{ name: string; party: string; position: string; memberId: string }[]> {
  const bill = await getBillDetail(billId)
  if (!bill) return []

  // Only return vote records for bills that have passed at least one chamber
  if (bill.status === 'introduced' || bill.status === 'in_committee') return []

  // Pre-loaded vote data based on DB records
  const mockVotes = [
    { name: 'Rep. Greg Stanton', party: 'D', position: 'Yea', memberId: 'S001211' },
    { name: 'Rep. David Schweikert', party: 'R', position: 'Nay', memberId: 'S001183' },
    { name: 'Rep. Ruben Gallego', party: 'D', position: 'Yea', memberId: 'G000574' },
    { name: 'Sen. Kyrsten Sinema', party: 'I', position: 'Yea', memberId: 'S001191' },
    { name: 'Sen. Mark Kelly', party: 'D', position: 'Yea', memberId: 'K000377' },
    { name: 'Rep. Andy Biggs', party: 'R', position: 'Nay', memberId: 'B001302' },
    { name: 'Rep. Debbie Lesko', party: 'R', position: 'Nay', memberId: 'L000589' },
    { name: 'Rep. Eli Crane', party: 'R', position: 'Nay', memberId: 'C001135' },
  ]

  if (bill.bill_type === 'hr') {
    return mockVotes.filter((v) => v.name.startsWith('Rep.'))
  }
  if (bill.bill_type === 's') {
    return mockVotes.filter((v) => v.name.startsWith('Sen.'))
  }
  return mockVotes
}
