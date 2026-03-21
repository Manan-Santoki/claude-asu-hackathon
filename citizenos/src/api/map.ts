export interface StateStats {
  code: string
  billCount: number
  partyControl: 'D' | 'R' | 'split'
  civicScore: number
}

const mockStats: StateStats[] = [
  { code: 'CA', billCount: 42, partyControl: 'D', civicScore: 78 },
  { code: 'TX', billCount: 38, partyControl: 'R', civicScore: 65 },
  { code: 'NY', billCount: 35, partyControl: 'D', civicScore: 82 },
  { code: 'FL', billCount: 31, partyControl: 'R', civicScore: 60 },
  { code: 'IL', billCount: 28, partyControl: 'D', civicScore: 71 },
  { code: 'PA', billCount: 25, partyControl: 'split', civicScore: 68 },
  { code: 'OH', billCount: 22, partyControl: 'R', civicScore: 62 },
  { code: 'GA', billCount: 20, partyControl: 'R', civicScore: 58 },
  { code: 'NC', billCount: 19, partyControl: 'R', civicScore: 59 },
  { code: 'MI', billCount: 18, partyControl: 'D', civicScore: 70 },
  { code: 'AZ', billCount: 17, partyControl: 'split', civicScore: 64 },
  { code: 'WA', billCount: 16, partyControl: 'D', civicScore: 76 },
  { code: 'MA', billCount: 15, partyControl: 'D', civicScore: 85 },
  { code: 'VA', billCount: 14, partyControl: 'split', civicScore: 72 },
  { code: 'CO', billCount: 13, partyControl: 'D', civicScore: 74 },
  { code: 'MN', billCount: 12, partyControl: 'D', civicScore: 80 },
  { code: 'NJ', billCount: 12, partyControl: 'D', civicScore: 69 },
  { code: 'TN', billCount: 11, partyControl: 'R', civicScore: 55 },
  { code: 'IN', billCount: 10, partyControl: 'R', civicScore: 57 },
  { code: 'MO', billCount: 10, partyControl: 'R', civicScore: 56 },
]

export async function getStateStats(): Promise<StateStats[]> {
  return mockStats
}

export function getStatStats(code: string): StateStats | undefined {
  return mockStats.find(s => s.code === code)
}
