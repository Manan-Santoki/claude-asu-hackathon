// VoteMap API client — live FEC data with mock fallback
// Uses the FEC API (https://api.open.fec.gov/v1) for candidate and funding data.
// Policy positions are not available from FEC, so mock data is retained for those.

import { useDataSourceStore } from '@/stores/useDataSourceStore'
const setCandSource = (s: 'live' | 'demo' | 'loading') => useDataSourceStore.getState().setSource('candidates', s)

export interface Candidate {
  id: string
  name: string
  party: string
  state_code: string
  district: string | null
  office_sought: 'president' | 'senate' | 'house'
  incumbent: boolean
  photo_url: string
  bio: string
  website: string
}

export interface CandidatePosition {
  axis: string
  score: number
  summary: string
}

export interface CandidateReputation {
  candidate_id: string
  reputation_score: number
  funding_transparency: number
  total_raised: number
  small_donor_pct: number
  top_donors: { name: string; amount: number }[]
  endorsements: string[]
  controversy_flags: { title: string; severity: 'low' | 'medium' | 'high'; summary: string }[]
  media_sentiment: 'positive' | 'neutral' | 'mixed' | 'negative'
  ai_summary: string
}

export interface CandidateCompareResult {
  candidates: Candidate[]
  positions: Record<string, CandidatePosition[]>
  reputations: Record<string, CandidateReputation>
}

// ---------------------------------------------------------------------------
// FEC API helpers
// ---------------------------------------------------------------------------

const FEC_BASE = 'https://api.open.fec.gov/v1'

function getFecApiKey(): string {
  return import.meta.env.VITE_FEC_API_KEY ?? ''
}

/** Generic fetch wrapper for FEC API endpoints. */
async function fecFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getFecApiKey()
  if (!apiKey) {
    throw new Error('FEC API key not configured')
  }

  const url = new URL(`${FEC_BASE}${path}`)
  url.searchParams.set('api_key', apiKey)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`FEC API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// FEC → app type mapping
// ---------------------------------------------------------------------------

interface FECCandidateResult {
  candidate_id: string
  name: string
  party_full: string
  party: string
  state: string
  district: string
  office: string // H, S, P
  office_full: string
  incumbent_challenge: string // I, C, O
  candidate_status: string
}

interface FECCandidateResponse {
  results: FECCandidateResult[]
}

interface FECTotalsResult {
  candidate_id: string
  receipts: number
  individual_contributions: number
  individual_itemized_contributions: number
  individual_unitemized_contributions: number
  other_political_committee_contributions: number
  disbursements: number
  coverage_end_date: string
}

interface FECTotalsResponse {
  results: FECTotalsResult[]
}

interface FECScheduleAResult {
  contributor_name: string
  contribution_receipt_amount: number
  committee_id: string
}

interface FECScheduleAResponse {
  results: FECScheduleAResult[]
}

function mapFECParty(party: string): string {
  const map: Record<string, string> = {
    DEM: 'D',
    REP: 'R',
    LIB: 'L',
    GRE: 'G',
    IND: 'I',
  }
  return map[party] ?? party
}

function mapFECOffice(office: string): 'president' | 'senate' | 'house' {
  switch (office) {
    case 'H':
      return 'house'
    case 'S':
      return 'senate'
    case 'P':
      return 'president'
    default:
      return 'house'
  }
}

/** Convert a raw FEC candidate record into our Candidate interface. */
function mapFECCandidate(raw: FECCandidateResult): Candidate {
  const nameSeed = raw.name.toLowerCase().replace(/[^a-z]/g, '-')
  return {
    id: raw.candidate_id,
    name: formatName(raw.name),
    party: mapFECParty(raw.party),
    state_code: raw.state,
    district: raw.office === 'H' && raw.district ? raw.district : null,
    office_sought: mapFECOffice(raw.office),
    incumbent: raw.incumbent_challenge === 'I',
    photo_url: `https://api.dicebear.com/7.x/personas/svg?seed=${nameSeed}`,
    bio: `${raw.office_full} candidate (${raw.party_full}) from ${raw.state}${raw.district && raw.office === 'H' ? `, district ${raw.district}` : ''}.`,
    website: '',
  }
}

/**
 * FEC names come as "LAST, FIRST MIDDLE". Convert to "First Last".
 */
function formatName(fecName: string): string {
  if (!fecName) return fecName
  const parts = fecName.split(',').map((s) => s.trim())
  if (parts.length < 2) {
    // Already in normal order – just title-case it
    return titleCase(fecName)
  }
  const last = titleCase(parts[0])
  const first = titleCase(parts[1])
  return `${first} ${last}`
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Mock data — retained as fallback
// ---------------------------------------------------------------------------

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-001', name: 'Maria Santos', party: 'D', state_code: 'AZ', district: null,
    office_sought: 'president', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=maria-santos',
    bio: 'Former Governor of Arizona and Harvard Law graduate. Known for bipartisan immigration reform and expanding Medicaid in her state.',
    website: 'https://example.com/santos2026',
  },
  {
    id: 'cand-002', name: 'James Crawford', party: 'R', state_code: 'TX', district: null,
    office_sought: 'president', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=james-crawford',
    bio: 'U.S. Senator from Texas and former Army Colonel. Champions fiscal conservatism and strong national defense.',
    website: 'https://example.com/crawford2026',
  },
  {
    id: 'cand-003', name: 'Priya Sharma', party: 'D', state_code: 'CA', district: null,
    office_sought: 'president', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=priya-sharma',
    bio: 'Tech entrepreneur turned Senator from California. Pioneered AI governance legislation and champions climate action.',
    website: 'https://example.com/sharma2026',
  },
  {
    id: 'cand-004', name: 'Robert Mitchell', party: 'R', state_code: 'OH', district: null,
    office_sought: 'senate', incumbent: true,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=robert-mitchell',
    bio: 'Two-term Senator from Ohio. Former steel industry executive focused on manufacturing jobs and trade policy.',
    website: 'https://example.com/mitchell-oh',
  },
  {
    id: 'cand-005', name: 'Angela Washington', party: 'D', state_code: 'OH', district: null,
    office_sought: 'senate', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=angela-washington',
    bio: 'Ohio State Representative and former public school teacher. Advocates for education funding and criminal justice reform.',
    website: 'https://example.com/washington-oh',
  },
  {
    id: 'cand-006', name: 'David Chen', party: 'D', state_code: 'PA', district: null,
    office_sought: 'senate', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=david-chen',
    bio: 'Philadelphia City Councilmember and community organizer. Son of immigrants, focuses on affordable housing and workers\' rights.',
    website: 'https://example.com/chen-pa',
  },
  {
    id: 'cand-007', name: 'Sarah Thornton', party: 'R', state_code: 'PA', district: null,
    office_sought: 'senate', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah-thornton',
    bio: 'Former U.S. Attorney and anti-corruption advocate. Focused on law enforcement, border security, and reducing government waste.',
    website: 'https://example.com/thornton-pa',
  },
  {
    id: 'cand-008', name: 'Marcus Johnson', party: 'D', state_code: 'GA', district: '5',
    office_sought: 'house', incumbent: true,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=marcus-johnson',
    bio: 'Three-term Congressman from Atlanta. Civil rights attorney who has championed voting rights legislation and police reform.',
    website: 'https://example.com/johnson-ga5',
  },
  {
    id: 'cand-009', name: 'Lisa Kowalski', party: 'R', state_code: 'MI', district: '7',
    office_sought: 'house', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=lisa-kowalski',
    bio: 'Small business owner and former city council member from Grand Rapids. Runs on economic growth and school choice.',
    website: 'https://example.com/kowalski-mi7',
  },
  {
    id: 'cand-010', name: 'Carlos Rivera', party: 'D', state_code: 'AZ', district: '3',
    office_sought: 'house', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=carlos-rivera',
    bio: 'Tucson school board president and former Marine. Focuses on veterans\' issues and border community development.',
    website: 'https://example.com/rivera-az3',
  },
  {
    id: 'cand-011', name: 'Jennifer Park', party: 'D', state_code: 'FL', district: '12',
    office_sought: 'house', incumbent: false,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=jennifer-park',
    bio: 'Emergency room physician from Tampa. Running on healthcare affordability and climate resilience.',
    website: 'https://example.com/park-fl12',
  },
  {
    id: 'cand-012', name: 'William Hayes', party: 'R', state_code: 'FL', district: '12',
    office_sought: 'house', incumbent: true,
    photo_url: 'https://api.dicebear.com/7.x/personas/svg?seed=william-hayes',
    bio: 'Two-term Congressman and former real estate developer. Prioritizes tax cuts, deregulation, and strong border security.',
    website: 'https://example.com/hayes-fl12',
  },
]

const MOCK_POSITIONS: Record<string, CandidatePosition[]> = {
  'cand-001': [
    { axis: 'immigration', score: 1, summary: 'Supports pathway to citizenship for DACA recipients and comprehensive reform with border security funding' },
    { axis: 'healthcare', score: 2, summary: 'Expanded Medicaid as governor; supports public option alongside private insurance' },
    { axis: 'economy', score: 1, summary: 'Favors targeted corporate regulation while supporting small business tax breaks' },
    { axis: 'education', score: 1, summary: 'Supports increased federal funding for public schools and community colleges' },
    { axis: 'climate', score: 2, summary: 'Aggressive clean energy targets; led Arizona\'s transition to 50% renewable by 2030' },
    { axis: 'gun_policy', score: 1, summary: 'Supports universal background checks and red flag laws' },
    { axis: 'criminal_justice', score: 1, summary: 'Supports sentencing reform and increased police accountability' },
    { axis: 'foreign_policy', score: 1, summary: 'Internationalist approach favoring strong alliances and multilateral diplomacy' },
    { axis: 'social_issues', score: 2, summary: 'Strong advocate for LGBTQ+ protections and the Equality Act' },
    { axis: 'gov_spending', score: -1, summary: 'Willing to increase deficit spending for infrastructure and healthcare investments' },
  ],
  'cand-002': [
    { axis: 'immigration', score: -1, summary: 'Prioritizes border security and enforcement; opposes amnesty' },
    { axis: 'healthcare', score: -1, summary: 'Opposes government-run healthcare; supports market-based solutions' },
    { axis: 'economy', score: -2, summary: 'Strong deregulation advocate; wants to cut corporate taxes' },
    { axis: 'education', score: -1, summary: 'Supports school choice and voucher programs' },
    { axis: 'climate', score: -1, summary: 'Supports all-of-the-above energy including fossil fuels' },
    { axis: 'gun_policy', score: -2, summary: 'Strong Second Amendment defender; opposes new restrictions' },
    { axis: 'criminal_justice', score: -1, summary: 'Tough-on-crime stance with support for law enforcement funding' },
    { axis: 'foreign_policy', score: 1, summary: 'Strong military advocate; supports robust defense spending' },
    { axis: 'social_issues', score: -1, summary: 'Supports religious liberty protections; opposes federal social mandates' },
    { axis: 'gov_spending', score: 2, summary: 'Committed to balanced budget; wants to cut discretionary spending 20%' },
  ],
  'cand-003': [
    { axis: 'immigration', score: 2, summary: 'Supports comprehensive reform with path to citizenship and increased H-1B visas' },
    { axis: 'healthcare', score: 2, summary: 'Supports Medicare for All with transition period' },
    { axis: 'economy', score: 2, summary: 'Advocates breaking up tech monopolies and strengthening worker protections' },
    { axis: 'education', score: 2, summary: 'Champions free public college and student debt cancellation' },
    { axis: 'climate', score: 2, summary: 'Green New Deal co-sponsor; wants net-zero by 2040' },
    { axis: 'gun_policy', score: 2, summary: 'Supports assault weapons ban and universal background checks' },
    { axis: 'criminal_justice', score: 2, summary: 'Supports ending cash bail and decriminalizing marijuana' },
    { axis: 'foreign_policy', score: 1, summary: 'Multilateral approach with focus on tech diplomacy' },
    { axis: 'social_issues', score: 2, summary: 'Authored federal LGBTQ+ anti-discrimination legislation' },
    { axis: 'gov_spending', score: -2, summary: 'Supports major new spending funded by wealth tax' },
  ],
  'cand-004': [
    { axis: 'immigration', score: 0, summary: 'Moderate: supports border security with pragmatic path for long-term residents' },
    { axis: 'healthcare', score: -1, summary: 'Prefers private-sector solutions; supports ACA reforms' },
    { axis: 'economy', score: -1, summary: 'Pro-manufacturing tariffs; supports tax incentives for reshoring jobs' },
    { axis: 'education', score: 0, summary: 'Supports vocational training expansion; mixed on federal spending' },
    { axis: 'climate', score: 0, summary: 'Acknowledges climate change; supports gradual transition' },
    { axis: 'gun_policy', score: -1, summary: 'Generally pro-gun; open to background check improvements' },
    { axis: 'criminal_justice', score: 0, summary: 'Supported bipartisan First Step Act; balances reform with enforcement' },
    { axis: 'foreign_policy', score: 1, summary: 'Hawkish on China trade; strong NATO supporter' },
    { axis: 'social_issues', score: 0, summary: 'Libertarian-leaning: personally conservative but opposes federal mandates' },
    { axis: 'gov_spending', score: 1, summary: 'Fiscally conservative but willing to spend on infrastructure' },
  ],
  'cand-005': [
    { axis: 'immigration', score: 1, summary: 'Supports DACA protections and humane border policy' },
    { axis: 'healthcare', score: 2, summary: 'Advocates public option and expansion of community health centers' },
    { axis: 'economy', score: 1, summary: 'Supports raising minimum wage to $17 and strengthening unions' },
    { axis: 'education', score: 2, summary: 'Former teacher; champions increased Title I funding' },
    { axis: 'climate', score: 1, summary: 'Supports clean energy transition with job retraining programs' },
    { axis: 'gun_policy', score: 1, summary: 'Supports universal background checks; advocates school safety' },
    { axis: 'criminal_justice', score: 2, summary: 'Strong reform: ending private prisons, expunging marijuana convictions' },
    { axis: 'foreign_policy', score: 0, summary: 'Domestic focus; supports diplomacy-first approach' },
    { axis: 'social_issues', score: 2, summary: 'Champions Equality Act and anti-discrimination protections' },
    { axis: 'gov_spending', score: -1, summary: 'Supports increased social spending funded by progressive tax reform' },
  ],
  'cand-006': [
    { axis: 'immigration', score: 2, summary: 'Son of immigrants; supports comprehensive reform and expanded refugee admissions' },
    { axis: 'healthcare', score: 1, summary: 'Supports public option and drug price negotiation' },
    { axis: 'economy', score: 2, summary: 'Pro-worker: supports $17 minimum wage and paid family leave' },
    { axis: 'education', score: 1, summary: 'Supports increased Pell grants and trade school funding' },
    { axis: 'climate', score: 2, summary: 'Environmental justice champion; green infrastructure in low-income communities' },
    { axis: 'gun_policy', score: 2, summary: 'Supports assault weapons ban and community violence intervention' },
    { axis: 'criminal_justice', score: 2, summary: 'Advocates ending cash bail and investing in mental health crisis response' },
    { axis: 'foreign_policy', score: 0, summary: 'Focused on domestic policy; human rights-centered foreign policy' },
    { axis: 'social_issues', score: 2, summary: 'Strong civil rights advocate; supports anti-discrimination expansion' },
    { axis: 'gov_spending', score: -2, summary: 'Supports ambitious social spending funded by taxing wealth over $50M' },
  ],
  'cand-007': [
    { axis: 'immigration', score: -1, summary: 'Prioritizes border security; supports merit-based legal immigration' },
    { axis: 'healthcare', score: 0, summary: 'Supports ACA with cost-reduction reforms; opposes single-payer' },
    { axis: 'economy', score: -1, summary: 'Supports reducing regulations and cutting red tape for small businesses' },
    { axis: 'education', score: 0, summary: 'Supports school choice and reducing student loan interest rates' },
    { axis: 'climate', score: 0, summary: 'Supports nuclear energy and natural gas as transition fuels' },
    { axis: 'gun_policy', score: -1, summary: 'Supports Second Amendment; open to strengthening enforcement' },
    { axis: 'criminal_justice', score: 0, summary: 'Former prosecutor; supports both law enforcement and targeted reform' },
    { axis: 'foreign_policy', score: 1, summary: 'Strong on national security; supports allied partnerships' },
    { axis: 'social_issues', score: 0, summary: 'Moderate; supports civil protections but defers to states' },
    { axis: 'gov_spending', score: 1, summary: 'Anti-corruption focus; wants efficiency audits and waste elimination' },
  ],
  'cand-008': [
    { axis: 'immigration', score: 1, summary: 'Supports comprehensive reform and DREAM Act legislation' },
    { axis: 'healthcare', score: 2, summary: 'Supports Medicare for All; focused on eliminating racial health disparities' },
    { axis: 'economy', score: 1, summary: 'Supports raising corporate taxes for community development' },
    { axis: 'education', score: 2, summary: 'Champions HBCUs funding, student debt relief, and universal pre-K' },
    { axis: 'climate', score: 1, summary: 'Supports environmental justice targeting pollution in minority communities' },
    { axis: 'gun_policy', score: 2, summary: 'Authored community violence prevention legislation' },
    { axis: 'criminal_justice', score: 2, summary: 'Civil rights attorney; authored police accountability bills' },
    { axis: 'foreign_policy', score: 0, summary: 'Focused on domestic civil rights; human rights-centered' },
    { axis: 'social_issues', score: 2, summary: 'Voting rights champion; authored Voting Rights Act restoration' },
    { axis: 'gov_spending', score: -1, summary: 'Supports increased community investment through progressive taxation' },
  ],
  'cand-009': [
    { axis: 'immigration', score: -1, summary: 'Supports legal immigration reform; wants stronger E-Verify mandate' },
    { axis: 'healthcare', score: -1, summary: 'Opposes government healthcare expansion; supports HSAs' },
    { axis: 'economy', score: -2, summary: 'Small business champion; wants to eliminate burdensome regulations' },
    { axis: 'education', score: -1, summary: 'Supports school choice, charter schools, and parental control' },
    { axis: 'climate', score: -1, summary: 'Opposes Green New Deal; supports energy independence' },
    { axis: 'gun_policy', score: -2, summary: 'Strong Second Amendment advocate; NRA-endorsed' },
    { axis: 'criminal_justice', score: -1, summary: 'Supports law enforcement; favors mandatory minimums for violent crime' },
    { axis: 'foreign_policy', score: 0, summary: 'America-first trade policy; skeptical of foreign aid' },
    { axis: 'social_issues', score: -1, summary: 'Socially conservative; supports religious liberty protections' },
    { axis: 'gov_spending', score: 2, summary: 'Wants balanced budget amendment; supports spending cuts' },
  ],
  'cand-010': [
    { axis: 'immigration', score: 2, summary: 'Border community advocate; supports earned citizenship path' },
    { axis: 'healthcare', score: 1, summary: 'Supports expanding VA healthcare and community health centers' },
    { axis: 'economy', score: 1, summary: 'Focuses on small business development in border communities' },
    { axis: 'education', score: 2, summary: 'Champions bilingual education funding and teacher pay increases' },
    { axis: 'climate', score: 1, summary: 'Supports solar energy development in Arizona' },
    { axis: 'gun_policy', score: 0, summary: 'Marine veteran; supports responsible ownership with background checks' },
    { axis: 'criminal_justice', score: 1, summary: 'Supports reforms focused on reducing recidivism and veteran courts' },
    { axis: 'foreign_policy', score: 0, summary: 'Focused on US-Mexico relations and border diplomacy' },
    { axis: 'social_issues', score: 1, summary: 'Supports anti-discrimination protections and family unity' },
    { axis: 'gov_spending', score: 0, summary: 'Pragmatic; supports targeted investments in infrastructure and veterans' },
  ],
  'cand-011': [
    { axis: 'immigration', score: 1, summary: 'Supports DACA and humane immigration as a public health issue' },
    { axis: 'healthcare', score: 2, summary: 'ER physician; supports universal coverage and drug price caps' },
    { axis: 'economy', score: 1, summary: 'Supports paid sick leave mandates and healthcare worker protections' },
    { axis: 'education', score: 1, summary: 'Supports medical education debt relief and STEM funding' },
    { axis: 'climate', score: 2, summary: 'Focused on climate-health connection; supports coastal resilience' },
    { axis: 'gun_policy', score: 2, summary: 'Treats gun violence as public health crisis; supports reform' },
    { axis: 'criminal_justice', score: 1, summary: 'Supports mental health crisis response as police alternative' },
    { axis: 'foreign_policy', score: 0, summary: 'Supports global health cooperation and pandemic preparedness' },
    { axis: 'social_issues', score: 1, summary: 'Supports LGBTQ+ healthcare protections and reproductive rights' },
    { axis: 'gov_spending', score: -1, summary: 'Supports increased healthcare/climate spending offset by defense savings' },
  ],
  'cand-012': [
    { axis: 'immigration', score: -2, summary: 'Hardline border security; supports border wall and ending sanctuary cities' },
    { axis: 'healthcare', score: -2, summary: 'Opposes all government healthcare expansion; wants to repeal ACA' },
    { axis: 'economy', score: -2, summary: 'Aggressive deregulation; wants to eliminate capital gains tax' },
    { axis: 'education', score: -2, summary: 'Wants to abolish Department of Education; supports full school choice' },
    { axis: 'climate', score: -2, summary: 'Climate skeptic; opposes environmental regulations' },
    { axis: 'gun_policy', score: -2, summary: 'Opposes all new gun legislation; supports national concealed carry' },
    { axis: 'criminal_justice', score: -2, summary: 'Tough-on-crime; supports mandatory minimums, opposes bail reform' },
    { axis: 'foreign_policy', score: 1, summary: 'Strong military spending advocate; hawkish foreign policy' },
    { axis: 'social_issues', score: -2, summary: 'Social conservative; opposes federal LGBTQ+ protections' },
    { axis: 'gov_spending', score: 2, summary: 'Wants to cut federal spending 25%; eliminate multiple agencies' },
  ],
}

const MOCK_REPUTATIONS: Record<string, CandidateReputation> = {
  'cand-001': {
    candidate_id: 'cand-001', reputation_score: 78, funding_transparency: 85,
    total_raised: 45200000, small_donor_pct: 62,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 12500000 },
      { name: 'Healthcare Workers Union', amount: 2100000 },
      { name: 'Arizona Business PAC', amount: 1800000 },
      { name: 'Clean Energy Alliance', amount: 1200000 },
      { name: 'Education First Fund', amount: 950000 },
    ],
    endorsements: ['Arizona Education Association', 'SEIU', 'League of Conservation Voters', 'Planned Parenthood Action Fund'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'Maria Santos has a strong reputation built on her record as governor. High small-donor percentage indicates broad grassroots support. No significant controversies. Known for bipartisan deal-making.',
  },
  'cand-002': {
    candidate_id: 'cand-002', reputation_score: 71, funding_transparency: 68,
    total_raised: 52800000, small_donor_pct: 38,
    top_donors: [
      { name: 'American Defense PAC', amount: 5200000 },
      { name: 'Texas Energy Coalition', amount: 4100000 },
      { name: 'WinRed Small Donors', amount: 8900000 },
      { name: 'Real Estate Roundtable', amount: 2300000 },
      { name: 'NRA Victory Fund', amount: 1800000 },
    ],
    endorsements: ['NRA', 'Chamber of Commerce', 'Veterans of Foreign Wars', 'National Right to Life'],
    controversy_flags: [
      { title: 'Defense contractor stock trades', severity: 'medium', summary: 'Traded defense stocks while serving on Armed Services Committee; ethics review cleared him but raised questions.' },
    ],
    media_sentiment: 'mixed',
    ai_summary: 'James Crawford has strong institutional backing but lower small-donor support. His military background gives credibility on defense issues. One ethics question around stock trades, though officially cleared.',
  },
  'cand-003': {
    candidate_id: 'cand-003', reputation_score: 82, funding_transparency: 90,
    total_raised: 68500000, small_donor_pct: 71,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 22000000 },
      { name: 'Tech Workers for Change', amount: 3200000 },
      { name: 'Climate Action PAC', amount: 2800000 },
      { name: 'Progressive Democrats of America', amount: 1500000 },
      { name: 'Teachers Union National', amount: 1200000 },
    ],
    endorsements: ['Sunrise Movement', 'Progressive Caucus', 'Sierra Club', 'ACLU', 'Working Families Party'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'Priya Sharma leads in grassroots fundraising with 71% small-donor contributions. Her tech background and clean energy business give her credibility on innovation issues. Strong progressive endorsement portfolio.',
  },
  'cand-004': {
    candidate_id: 'cand-004', reputation_score: 65, funding_transparency: 58,
    total_raised: 18200000, small_donor_pct: 29,
    top_donors: [
      { name: 'Ohio Manufacturing PAC', amount: 3100000 },
      { name: 'Steel Industry Coalition', amount: 2400000 },
      { name: 'Republican Senate Committee', amount: 2200000 },
      { name: 'National Chamber PAC', amount: 1800000 },
      { name: 'WinRed Small Donors', amount: 2100000 },
    ],
    endorsements: ['Ohio Chamber of Commerce', 'Fraternal Order of Police', 'National Association of Manufacturers'],
    controversy_flags: [
      { title: 'Revolving door concerns', severity: 'low', summary: 'Moved directly from steel industry executive role to Senate campaign; critics cite potential conflicts of interest in trade policy votes.' },
    ],
    media_sentiment: 'neutral',
    ai_summary: 'Robert Mitchell has strong industry backing but low small-donor percentage raises grassroots support questions. His moderate voting record makes him competitive in swing-state Ohio.',
  },
  'cand-005': {
    candidate_id: 'cand-005', reputation_score: 76, funding_transparency: 82,
    total_raised: 8500000, small_donor_pct: 58,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 3200000 },
      { name: 'Ohio Education Association', amount: 1100000 },
      { name: 'EMILY\'s List', amount: 950000 },
      { name: 'AFSCME', amount: 720000 },
      { name: 'Ohio Democratic Party', amount: 680000 },
    ],
    endorsements: ['Ohio Education Association', 'EMILY\'s List', 'Ohio AFL-CIO', 'Moms Demand Action'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'Angela Washington has strong education and labor backing with solid grassroots support. As a former teacher, she brings authenticity to education policy. Clean record with no controversies.',
  },
  'cand-006': {
    candidate_id: 'cand-006', reputation_score: 73, funding_transparency: 88,
    total_raised: 6200000, small_donor_pct: 65,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 2800000 },
      { name: 'Progressive Change Campaign', amount: 680000 },
      { name: 'Working Families Party', amount: 520000 },
      { name: 'SEIU Pennsylvania', amount: 480000 },
      { name: 'Asian American Action Fund', amount: 350000 },
    ],
    endorsements: ['Working Families Party', 'SEIU', 'Sunrise Movement Philadelphia', 'Asian American Action Fund'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'David Chen runs a grassroots-powered campaign with high funding transparency. His community organizing background is reflected in strong small-donor support. First-time statewide candidate.',
  },
  'cand-007': {
    candidate_id: 'cand-007', reputation_score: 70, funding_transparency: 72,
    total_raised: 11800000, small_donor_pct: 41,
    top_donors: [
      { name: 'WinRed Small Donors', amount: 2800000 },
      { name: 'Republican Senate Committee', amount: 2100000 },
      { name: 'Law Enforcement PAC', amount: 1500000 },
      { name: 'Pennsylvania Business Council', amount: 1200000 },
      { name: 'Suburban Women for Safety', amount: 850000 },
    ],
    endorsements: ['Fraternal Order of Police PA', 'Pennsylvania Chamber of Commerce', 'Republican Main Street Partnership'],
    controversy_flags: [],
    media_sentiment: 'neutral',
    ai_summary: 'Sarah Thornton\'s prosecutorial background gives her credibility on law enforcement. Moderate positioning appeals to suburban voters. Clean record as former U.S. Attorney.',
  },
  'cand-008': {
    candidate_id: 'cand-008', reputation_score: 80, funding_transparency: 79,
    total_raised: 4200000, small_donor_pct: 55,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 1600000 },
      { name: 'Congressional Black Caucus PAC', amount: 520000 },
      { name: 'NAACP Action Fund', amount: 380000 },
      { name: 'Georgia Democratic Party', amount: 340000 },
      { name: 'Trial Lawyers Association', amount: 290000 },
    ],
    endorsements: ['NAACP', 'Congressional Black Caucus', 'John Lewis Legacy PAC', 'Georgia AFL-CIO'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'Marcus Johnson is well-established with strong civil rights credentials. Three-term incumbent with consistent support from civil rights organizations. No major controversies in his tenure.',
  },
  'cand-009': {
    candidate_id: 'cand-009', reputation_score: 62, funding_transparency: 65,
    total_raised: 2800000, small_donor_pct: 35,
    top_donors: [
      { name: 'WinRed Small Donors', amount: 580000 },
      { name: 'Michigan Small Business PAC', amount: 420000 },
      { name: 'NRA-PVF', amount: 350000 },
      { name: 'National Federation of Independent Business', amount: 310000 },
      { name: 'Michigan Republican Party', amount: 280000 },
    ],
    endorsements: ['NRA', 'NFIB', 'Michigan Chamber of Commerce', 'Right to Life of Michigan'],
    controversy_flags: [
      { title: 'Campaign finance reporting delay', severity: 'low', summary: 'Filed quarterly FEC reports two weeks late in Q2; attributed to new campaign staff learning procedures.' },
    ],
    media_sentiment: 'neutral',
    ai_summary: 'Lisa Kowalski brings small business credibility but has lower fundraising totals as a first-time candidate. Strong conservative endorsements. Minor campaign finance reporting issue.',
  },
  'cand-010': {
    candidate_id: 'cand-010', reputation_score: 74, funding_transparency: 83,
    total_raised: 3100000, small_donor_pct: 60,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 1200000 },
      { name: 'VoteVets Action Fund', amount: 420000 },
      { name: 'Arizona Education Association', amount: 310000 },
      { name: 'Latino Victory Fund', amount: 280000 },
      { name: 'Arizona Democratic Party', amount: 240000 },
    ],
    endorsements: ['VoteVets', 'Latino Victory Fund', 'Arizona Education Association', 'Human Rights Campaign'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'Carlos Rivera combines military service with community roots. Strong grassroots support in border communities. His bilingual campaign outreach has expanded the electorate in AZ-3.',
  },
  'cand-011': {
    candidate_id: 'cand-011', reputation_score: 72, funding_transparency: 86,
    total_raised: 2400000, small_donor_pct: 68,
    top_donors: [
      { name: 'ActBlue Small Donors', amount: 1100000 },
      { name: 'Doctors for America PAC', amount: 320000 },
      { name: 'Giffords PAC', amount: 280000 },
      { name: 'Florida Democratic Party', amount: 220000 },
      { name: 'Climate Action Campaign', amount: 180000 },
    ],
    endorsements: ['Giffords', 'Doctors for America', 'League of Conservation Voters', 'Everytown for Gun Safety'],
    controversy_flags: [],
    media_sentiment: 'positive',
    ai_summary: 'Jennifer Park\'s medical background gives unique credibility on healthcare. High small-donor percentage for a first-time candidate shows grassroots enthusiasm. Clean record.',
  },
  'cand-012': {
    candidate_id: 'cand-012', reputation_score: 55, funding_transparency: 45,
    total_raised: 5600000, small_donor_pct: 22,
    top_donors: [
      { name: 'Florida Real Estate PAC', amount: 1800000 },
      { name: 'National Home Builders Association', amount: 920000 },
      { name: 'Financial Services Roundtable', amount: 780000 },
      { name: 'WinRed Small Donors', amount: 650000 },
      { name: 'Koch Industries PAC', amount: 520000 },
    ],
    endorsements: ['National Association of Realtors', 'Florida Chamber of Commerce', 'Club for Growth'],
    controversy_flags: [
      { title: 'Real estate conflict of interest', severity: 'high', summary: 'Voted on housing deregulation bills while maintaining active real estate investments. Financial disclosures show $2-5M in property holdings that could benefit from legislation he supported.' },
      { title: 'Campaign donor access concerns', severity: 'medium', summary: 'Investigative report showed top donors received private policy briefings not available to constituents.' },
    ],
    media_sentiment: 'negative',
    ai_summary: 'William Hayes has significant fundraising but very low small-donor support (22%), raising questions about who he represents. Multiple controversies around conflicts of interest between his real estate business and legislative votes.',
  },
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function getCandidates(
  state?: string,
  office?: string
): Promise<Candidate[]> {
  setCandSource('loading')
  try {
    const params: Record<string, string> = {
      election_year: '2026',
      sort: '-total_receipts',
      per_page: '20',
    }
    if (state) params.state = state
    if (office) {
      const officeMap: Record<string, string> = { president: 'P', senate: 'S', house: 'H' }
      params.office = officeMap[office] ?? office
    }

    const data = await fecFetch<FECCandidateResponse>('/candidates/search/', params)
    if (data.results && data.results.length > 0) {
      setCandSource('live')
      return data.results.map(mapFECCandidate)
    }
    // If the API returned empty results, fall through to mock
    throw new Error('No FEC results returned')
  } catch {
    setCandSource('demo')
    // Fallback to mock data
    let results = [...MOCK_CANDIDATES]
    if (state) results = results.filter((c) => c.state_code === state)
    if (office) results = results.filter((c) => c.office_sought === office)
    return results
  }
}

export async function getCandidateDetail(id: string): Promise<Candidate | null> {
  try {
    const data = await fecFetch<FECCandidateResponse>(`/candidate/${id}/`)
    if (data.results && data.results.length > 0) {
      return mapFECCandidate(data.results[0])
    }
    throw new Error('No FEC candidate detail returned')
  } catch {
    // Fallback to mock data
    return MOCK_CANDIDATES.find((c) => c.id === id) ?? null
  }
}

export async function getCandidatePositions(
  id: string
): Promise<CandidatePosition[]> {
  // FEC does not provide policy position data.
  // This would require a different data source (e.g., VoteSmart, ISideWith).
  // For now, return mock positions if available, otherwise an empty array.
  return MOCK_POSITIONS[id] ?? []
}

export async function getCandidateReputation(
  id: string
): Promise<CandidateReputation | null> {
  try {
    // Fetch candidate financial totals from FEC
    const totalsData = await fecFetch<FECTotalsResponse>(`/candidate/${id}/totals/`, {
      election_year: '2026',
    })

    if (!totalsData.results || totalsData.results.length === 0) {
      throw new Error('No FEC totals returned')
    }

    const totals = totalsData.results[0]
    const totalRaised = totals.receipts || 0
    const individualContributions = totals.individual_contributions || 0
    const unitemized = totals.individual_unitemized_contributions || 0

    // Unitemized individual contributions are generally small-dollar (<$200)
    const smallDonorPct = individualContributions > 0
      ? Math.round((unitemized / individualContributions) * 100)
      : 0

    // Funding transparency heuristic: higher small-donor % and individual contributions → more transparent
    const individualPct = totalRaised > 0 ? individualContributions / totalRaised : 0
    const fundingTransparency = Math.min(100, Math.round(individualPct * 70 + smallDonorPct * 0.3))

    // Reputation score heuristic based on small donor % and transparency
    const reputationScore = Math.min(100, Math.round(50 + smallDonorPct * 0.3 + fundingTransparency * 0.2))

    // Try to fetch top donors via schedule A (individual contributions)
    let topDonors: { name: string; amount: number }[] = []
    try {
      // We need the candidate's principal committee to query schedule_a.
      // First get the candidate detail to find the principal committee.
      const candidateData = await fecFetch<{ results: Array<{ principal_committees: Array<{ committee_id: string }> }> }>(
        `/candidate/${id}/`,
      )
      const committees = candidateData.results?.[0]?.principal_committees
      if (committees && committees.length > 0) {
        const committeeId = committees[0].committee_id
        const donorData = await fecFetch<FECScheduleAResponse>('/schedules/schedule_a/', {
          committee_id: committeeId,
          sort: '-contribution_receipt_amount',
          per_page: '5',
        })
        if (donorData.results && donorData.results.length > 0) {
          topDonors = donorData.results.map((d) => ({
            name: d.contributor_name || 'Unknown Contributor',
            amount: d.contribution_receipt_amount || 0,
          }))
        }
      }
    } catch {
      // If donor fetch fails, leave topDonors empty — the totals data is still valuable
    }

    return {
      candidate_id: id,
      reputation_score: reputationScore,
      funding_transparency: fundingTransparency,
      total_raised: totalRaised,
      small_donor_pct: smallDonorPct,
      top_donors: topDonors,
      endorsements: [], // FEC does not track endorsements
      controversy_flags: [], // FEC does not track controversies
      media_sentiment: 'neutral', // Would need a different data source
      ai_summary: `Based on FEC filings: raised $${(totalRaised / 1_000_000).toFixed(1)}M total with ${smallDonorPct}% from small donors (unitemized contributions under $200). Funding transparency score: ${fundingTransparency}/100.`,
    }
  } catch {
    // Fallback to mock data
    return MOCK_REPUTATIONS[id] ?? null
  }
}

export async function compareCandidates(
  ids: string[]
): Promise<CandidateCompareResult> {
  // Fetch all candidate data in parallel, composing from other functions
  const [candidateResults, positionResults, reputationResults] = await Promise.all([
    Promise.all(ids.map((id) => getCandidateDetail(id))),
    Promise.all(ids.map((id) => getCandidatePositions(id))),
    Promise.all(ids.map((id) => getCandidateReputation(id))),
  ])

  const candidates: Candidate[] = candidateResults.filter(
    (c): c is Candidate => c !== null,
  )

  const positions: Record<string, CandidatePosition[]> = {}
  const reputations: Record<string, CandidateReputation> = {}

  for (let i = 0; i < ids.length; i++) {
    positions[ids[i]] = positionResults[i]
    const rep = reputationResults[i]
    if (rep) reputations[ids[i]] = rep
  }

  return { candidates, positions, reputations }
}
