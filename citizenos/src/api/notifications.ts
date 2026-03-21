// Notification API client — mock data layer
// Replace mock implementations with real API calls when backend is ready

export interface Notification {
  id: string
  bill_id: string
  type: 'bill_alert' | 'status_change' | 'rep_voted'
  title: string
  message: string
  impact_level: 'high' | 'medium' | 'low'
  read: boolean
  created_at: string
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    bill_id: 'hr-1234',
    type: 'status_change',
    title: 'Affordable Insulin Now Act passed the House',
    message:
      'The Affordable Insulin Now Act (HR 1234) passed the House 232-193 and has been referred to the Senate HELP Committee. This bill caps insulin costs at $35/month.',
    impact_level: 'high',
    read: false,
    created_at: '2026-03-18T14:30:00Z',
  },
  {
    id: 'notif-2',
    bill_id: 's-2222',
    type: 'rep_voted',
    title: 'Sen. Mark Kelly voted on Small Biz Tax Relief Act',
    message:
      'Your senator Mark Kelly (D-AZ) voted Yea on the Small Business Tax Relief and Simplification Act (S 2222), which passed 71-29.',
    impact_level: 'medium',
    read: false,
    created_at: '2026-03-10T10:15:00Z',
  },
  {
    id: 'notif-3',
    bill_id: 'hr-7890',
    type: 'status_change',
    title: 'Veterans Mental Health Act signed into law',
    message:
      'The Veterans Mental Health and Suicide Prevention Act (HR 7890) was signed into law on February 28. This expands VA mental health services with $3.1 billion in new funding.',
    impact_level: 'high',
    read: false,
    created_at: '2026-02-28T16:00:00Z',
  },
  {
    id: 'notif-4',
    bill_id: 'hr-9999',
    type: 'bill_alert',
    title: 'New bill: Housing Affordability Act',
    message:
      'A new bill affecting Arizona has been introduced: the Housing Affordability and Homelessness Reduction Act (HR 9999). It proposes $150B for affordable housing and renter tax credits up to $5,000.',
    impact_level: 'medium',
    read: true,
    created_at: '2026-03-15T09:00:00Z',
  },
  {
    id: 'notif-5',
    bill_id: 's-1776',
    type: 'rep_voted',
    title: 'Sen. Kyrsten Sinema voted on Community Safety Act',
    message:
      'Your senator Kyrsten Sinema (I-AZ) voted Yea on the Second Amendment Protection and Community Safety Act (S 1776), which passed 62-38.',
    impact_level: 'medium',
    read: true,
    created_at: '2026-03-05T11:45:00Z',
  },
  {
    id: 'notif-6',
    bill_id: 's-555',
    type: 'bill_alert',
    title: 'AI Accountability Act update — bipartisan negotiations',
    message:
      'The AI Transparency and Accountability Act (S 555) is seeing renewed bipartisan negotiations in the Senate Commerce Committee. This bill would create the first federal AI regulatory framework.',
    impact_level: 'low',
    read: true,
    created_at: '2026-03-15T08:00:00Z',
  },
]

let preferences: Record<string, boolean> = {
  bill_alerts: true,
  status_changes: true,
  rep_votes: true,
  high_impact_only: false,
  email_digest: false,
  push_notifications: true,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getNotifications(
  page: number = 1,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  await delay(300)

  let filtered = [...MOCK_NOTIFICATIONS]
  if (unreadOnly) {
    filtered = filtered.filter((n) => !n.read)
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const pageSize = 10
  const start = (page - 1) * pageSize
  return filtered.slice(start, start + pageSize)
}

export async function getUnreadCount(): Promise<number> {
  await delay(100)
  return MOCK_NOTIFICATIONS.filter((n) => !n.read).length
}

export async function markRead(id: string): Promise<void> {
  await delay(200)
  const notif = MOCK_NOTIFICATIONS.find((n) => n.id === id)
  if (notif) notif.read = true
}

export async function markAllRead(): Promise<void> {
  await delay(200)
  MOCK_NOTIFICATIONS.forEach((n) => {
    n.read = true
  })
}

export async function getPreferences(): Promise<Record<string, boolean>> {
  await delay(200)
  return { ...preferences }
}

export async function updatePreferences(prefs: Record<string, boolean>): Promise<void> {
  await delay(200)
  preferences = { ...preferences, ...prefs }
}
