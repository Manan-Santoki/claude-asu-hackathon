// RepScore API client — live Congress.gov + Google Civic enrichment, mock fallback
// Uses Congress.gov v3 API and Google Civic Information API

import { useDataSourceStore } from '@/stores/useDataSourceStore'
const setRepSource = (s: 'live' | 'demo' | 'loading') => useDataSourceStore.getState().setSource('reps', s)

// ---------------------------------------------------------------------------
// Interfaces (unchanged)
// ---------------------------------------------------------------------------

export interface Representative {
  id: string
  member_id: string
  name: string
  first_name: string
  last_name: string
  party: 'D' | 'R' | 'I'
  state_code: string
  district: string | null
  chamber: 'senate' | 'house'
  title: string
  in_office: boolean
  photo_url: string
  phone: string
  email: string
  website: string
  office_address: string
  social_links: { twitter?: string; facebook?: string; youtube?: string }
  votes_with_party_pct: number
  missed_votes_pct: number
  bills_sponsored: number
  bills_cosponsored: number
  next_election: string
}

export interface RepVote {
  id: string
  member_id: string
  bill_id: string
  vote_id: string
  vote_date: string
  vote_position: 'Yes' | 'No' | 'Not Voting' | 'Present'
  vote_question: string
  vote_description: string
  result: string
}

export interface CampaignPromise {
  id: string
  member_id: string
  promise_text: string
  category: string
  source_url: string
  status: 'kept' | 'broken' | 'in_progress' | 'not_yet_addressed'
  evidence: string
  related_vote_ids: string[]
}

export interface RepScores {
  member_id: string
  promise_alignment_score: number
  promises_kept: number
  promises_broken: number
  promises_in_progress: number
  promises_not_addressed: number
  party_loyalty_score: number
  attendance_score: number
  overall_accountability_score: number
}

export interface ContactEmailResult {
  subject: string
  body: string
  mailto_link: string
}

export interface SponsoredBill {
  bill_id: string
  title: string
  status: string
  introduced_date: string
  role: 'sponsor' | 'cosponsor'
}

// ---------------------------------------------------------------------------
// Congress.gov API helpers
// ---------------------------------------------------------------------------

const CONGRESS_BASE = 'https://api.congress.gov/v3'
const CURRENT_CONGRESS = 119

function getCongressApiKey(): string {
  return import.meta.env.VITE_CONGRESS_GOV_API_KEY ?? ''
}

function getGoogleCivicApiKey(): string {
  return import.meta.env.VITE_GOOGLE_CIVIC_API_KEY ?? ''
}

/** Typed fetch wrapper for Congress.gov v3 API */
async function congressFetch<T>(path: string): Promise<T> {
  const apiKey = getCongressApiKey()
  if (!apiKey) throw new Error('Missing VITE_CONGRESS_GOV_API_KEY')

  const separator = path.includes('?') ? '&' : '?'
  const url = `${CONGRESS_BASE}${path}${separator}api_key=${apiKey}&format=json`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Congress.gov API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Google Civic API helper
// ---------------------------------------------------------------------------

interface CivicOfficial {
  name: string
  party?: string
  phones?: string[]
  emails?: string[]
  urls?: string[]
  channels?: { type: string; id: string }[]
  address?: { line1: string; city: string; state: string; zip: string }[]
}

interface CivicResponse {
  officials: CivicOfficial[]
}

/** In-memory cache so we don't call Google Civic repeatedly for the same state */
const civicCache: Record<string, CivicOfficial[]> = {}

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia', AS: 'American Samoa', GU: 'Guam', MP: 'Northern Mariana Islands',
  PR: 'Puerto Rico', VI: 'Virgin Islands',
}

async function fetchCivicOfficials(stateCode: string): Promise<CivicOfficial[]> {
  if (civicCache[stateCode]) return civicCache[stateCode]

  const apiKey = getGoogleCivicApiKey()
  if (!apiKey) return []

  const stateName = STATE_NAMES[stateCode.toUpperCase()] ?? stateCode
  const url = `https://www.googleapis.com/civicinfo/v2/representatives?address=${encodeURIComponent(stateName)}&key=${apiKey}`

  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data: CivicResponse = await res.json()
    civicCache[stateCode] = data.officials ?? []
    return civicCache[stateCode]
  } catch {
    return []
  }
}

function findCivicMatch(officials: CivicOfficial[], firstName: string, lastName: string): CivicOfficial | undefined {
  const lastLower = lastName.toLowerCase()
  const firstLower = firstName.toLowerCase()
  return officials.find((o) => {
    const nameLower = o.name.toLowerCase()
    return nameLower.includes(lastLower) && nameLower.includes(firstLower)
  })
}

// ---------------------------------------------------------------------------
// Mapping: Congress.gov member -> Representative
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapParty(partyName: string | undefined): 'D' | 'R' | 'I' {
  if (!partyName) return 'I'
  const p = partyName.toLowerCase()
  if (p.startsWith('democrat')) return 'D'
  if (p.startsWith('republican')) return 'R'
  return 'I'
}

function mapChamber(chamber: string | undefined): 'senate' | 'house' {
  if (!chamber) return 'house'
  return chamber.toLowerCase().includes('senate') ? 'senate' : 'house'
}

function mapCongressMember(raw: any, enrichment?: CivicOfficial): Representative {
  const bioguideId: string = raw.bioguideId ?? raw.member?.bioguideId ?? ''
  const firstName: string = raw.firstName ?? raw.member?.firstName ?? ''
  const lastName: string = raw.lastName ?? raw.member?.lastName ?? ''
  const fullName: string = raw.name ?? raw.member?.name ?? `${firstName} ${lastName}`
  const partyName: string = raw.partyName ?? raw.member?.partyName ?? ''
  const state: string = raw.state ?? raw.member?.state ?? ''
  const district: number | null = raw.district ?? raw.member?.district ?? null
  const chamber: string = raw.terms?.item?.[0]?.chamber ?? raw.member?.terms?.item?.[0]?.chamber ?? ''
  const depiction = raw.depiction ?? raw.member?.depiction ?? {}
  const url: string = raw.url ?? raw.member?.url ?? ''

  const resolvedChamber = mapChamber(chamber)
  const stateCode = typeof state === 'string' ? state : ''

  // Determine next election year based on chamber
  const currentYear = new Date().getFullYear()
  let nextElection = ''
  if (resolvedChamber === 'senate') {
    // Senate terms are 6 years; approximate next election
    const remainder = currentYear % 6
    const nextSenateYear = currentYear + (6 - (remainder % 6)) % 6 || currentYear
    nextElection = String(nextSenateYear % 2 === 0 ? nextSenateYear : nextSenateYear + 1)
  } else {
    // House members face election every 2 years
    nextElection = currentYear % 2 === 0 ? String(currentYear) : String(currentYear + 1)
  }

  // Enrichment from Google Civic API
  const phone = enrichment?.phones?.[0] ?? ''
  const email = enrichment?.emails?.[0] ?? ''
  const civicUrl = enrichment?.urls?.[0] ?? ''
  const civicAddress = enrichment?.address?.[0]
  const officeAddress = civicAddress
    ? `${civicAddress.line1}, ${civicAddress.city}, ${civicAddress.state} ${civicAddress.zip}`
    : ''

  const socialLinks: { twitter?: string; facebook?: string; youtube?: string } = {}
  if (enrichment?.channels) {
    for (const ch of enrichment.channels) {
      const t = ch.type.toLowerCase()
      if (t === 'twitter') socialLinks.twitter = ch.id
      else if (t === 'facebook') socialLinks.facebook = ch.id
      else if (t === 'youtube') socialLinks.youtube = ch.id
    }
  }

  return {
    id: bioguideId,
    member_id: bioguideId,
    name: fullName,
    first_name: firstName,
    last_name: lastName,
    party: mapParty(partyName),
    state_code: stateCode,
    district: district != null ? `${stateCode}-${district}` : null,
    chamber: resolvedChamber,
    title: resolvedChamber === 'senate' ? 'Senator' : 'Representative',
    in_office: true,
    photo_url: depiction?.imageUrl ?? `https://bioguide.congress.gov/bioguide/photo/${bioguideId.charAt(0)}/${bioguideId}.jpg`,
    phone,
    email,
    website: url || civicUrl,
    office_address: officeAddress,
    social_links: socialLinks,
    votes_with_party_pct: 0,
    missed_votes_pct: 0,
    bills_sponsored: 0,
    bills_cosponsored: 0,
    next_election: nextElection,
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Mock data (fallback)
// ---------------------------------------------------------------------------

const MOCK_REPS: Representative[] = [
  {
    id: 'rep-1',
    member_id: 'S001217',
    name: 'Elizabeth Warren',
    first_name: 'Elizabeth',
    last_name: 'Warren',
    party: 'D',
    state_code: 'MA',
    district: null,
    chamber: 'senate',
    title: 'Senator',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/W/W000817.jpg',
    phone: '(202) 224-4543',
    email: 'senator@warren.senate.gov',
    website: 'https://www.warren.senate.gov',
    office_address: '309 Hart Senate Office Building, Washington, DC 20510',
    social_links: { twitter: 'SenWarren', facebook: 'senatorelizabethwarren' },
    votes_with_party_pct: 96.2,
    missed_votes_pct: 2.1,
    bills_sponsored: 42,
    bills_cosponsored: 187,
    next_election: '2030',
  },
  {
    id: 'rep-2',
    member_id: 'C001098',
    name: 'Ted Cruz',
    first_name: 'Ted',
    last_name: 'Cruz',
    party: 'R',
    state_code: 'TX',
    district: null,
    chamber: 'senate',
    title: 'Senator',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/C/C001098.jpg',
    phone: '(202) 224-5922',
    email: 'senator@cruz.senate.gov',
    website: 'https://www.cruz.senate.gov',
    office_address: '127A Russell Senate Office Building, Washington, DC 20510',
    social_links: { twitter: 'SenTedCruz', facebook: 'SenatorTedCruz' },
    votes_with_party_pct: 92.8,
    missed_votes_pct: 4.3,
    bills_sponsored: 38,
    bills_cosponsored: 142,
    next_election: '2030',
  },
  {
    id: 'rep-3',
    member_id: 'S001191',
    name: 'Kyrsten Sinema',
    first_name: 'Kyrsten',
    last_name: 'Sinema',
    party: 'I',
    state_code: 'AZ',
    district: null,
    chamber: 'senate',
    title: 'Senator',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/S/S001191.jpg',
    phone: '(202) 224-4521',
    email: 'senator@sinema.senate.gov',
    website: 'https://www.sinema.senate.gov',
    office_address: '317 Hart Senate Office Building, Washington, DC 20510',
    social_links: { twitter: 'SenatorSinema', facebook: 'SenatorSinema' },
    votes_with_party_pct: 54.6,
    missed_votes_pct: 3.7,
    bills_sponsored: 28,
    bills_cosponsored: 96,
    next_election: '2028',
  },
  {
    id: 'rep-4',
    member_id: 'K000377',
    name: 'Mark Kelly',
    first_name: 'Mark',
    last_name: 'Kelly',
    party: 'D',
    state_code: 'AZ',
    district: null,
    chamber: 'senate',
    title: 'Senator',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/K/K000377.jpg',
    phone: '(202) 224-2235',
    email: 'senator@kelly.senate.gov',
    website: 'https://www.kelly.senate.gov',
    office_address: '516 Hart Senate Office Building, Washington, DC 20510',
    social_links: { twitter: 'SenMarkKelly', facebook: 'SenMarkKelly' },
    votes_with_party_pct: 88.4,
    missed_votes_pct: 1.9,
    bills_sponsored: 31,
    bills_cosponsored: 154,
    next_election: '2028',
  },
  {
    id: 'rep-5',
    member_id: 'G000574',
    name: 'Ruben Gallego',
    first_name: 'Ruben',
    last_name: 'Gallego',
    party: 'D',
    state_code: 'AZ',
    district: 'AZ-3',
    chamber: 'house',
    title: 'Representative',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/G/G000574.jpg',
    phone: '(202) 225-4065',
    email: 'rep@gallego.house.gov',
    website: 'https://gallego.house.gov',
    office_address: '1114 Longworth HOB, Washington, DC 20515',
    social_links: { twitter: 'RepRubenGallego', facebook: 'RepRubenGallego' },
    votes_with_party_pct: 94.1,
    missed_votes_pct: 2.5,
    bills_sponsored: 24,
    bills_cosponsored: 198,
    next_election: '2026',
  },
  {
    id: 'rep-6',
    member_id: 'S001183',
    name: 'David Schweikert',
    first_name: 'David',
    last_name: 'Schweikert',
    party: 'R',
    state_code: 'AZ',
    district: 'AZ-1',
    chamber: 'house',
    title: 'Representative',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/S/S001183.jpg',
    phone: '(202) 225-2190',
    email: 'rep@schweikert.house.gov',
    website: 'https://schweikert.house.gov',
    office_address: '2039 Rayburn HOB, Washington, DC 20515',
    social_links: { twitter: 'RepDavid', facebook: 'RepDavidSchweikert' },
    votes_with_party_pct: 91.3,
    missed_votes_pct: 5.2,
    bills_sponsored: 18,
    bills_cosponsored: 87,
    next_election: '2026',
  },
  {
    id: 'rep-7',
    member_id: 'B001302',
    name: 'Andy Biggs',
    first_name: 'Andy',
    last_name: 'Biggs',
    party: 'R',
    state_code: 'AZ',
    district: 'AZ-5',
    chamber: 'house',
    title: 'Representative',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/B/B001302.jpg',
    phone: '(202) 225-2635',
    email: 'rep@biggs.house.gov',
    website: 'https://biggs.house.gov',
    office_address: '1318 Longworth HOB, Washington, DC 20515',
    social_links: { twitter: 'RepAndyBiggsAZ', facebook: 'RepAndyBiggs' },
    votes_with_party_pct: 78.5,
    missed_votes_pct: 3.1,
    bills_sponsored: 32,
    bills_cosponsored: 112,
    next_election: '2026',
  },
  {
    id: 'rep-8',
    member_id: 'S001211',
    name: 'Greg Stanton',
    first_name: 'Greg',
    last_name: 'Stanton',
    party: 'D',
    state_code: 'AZ',
    district: 'AZ-4',
    chamber: 'house',
    title: 'Representative',
    in_office: true,
    photo_url: 'https://bioguide.congress.gov/bioguide/photo/S/S001211.jpg',
    phone: '(202) 225-9888',
    email: 'rep@stanton.house.gov',
    website: 'https://stanton.house.gov',
    office_address: '128 Cannon HOB, Washington, DC 20515',
    social_links: { twitter: 'RepGregStanton', facebook: 'RepGregStanton' },
    votes_with_party_pct: 95.7,
    missed_votes_pct: 1.4,
    bills_sponsored: 19,
    bills_cosponsored: 165,
    next_election: '2026',
  },
]

const MOCK_VOTES: RepVote[] = [
  // Warren
  { id: 'v1', member_id: 'S001217', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v2', member_id: 'S001217', bill_id: 's555-119', vote_id: 'roll-356', vote_date: '2026-03-10', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'AI Transparency and Accountability Act', result: 'Pending' },
  { id: 'v3', member_id: 'S001217', bill_id: 's2222-119', vote_id: 'roll-312', vote_date: '2026-02-28', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Small Business Tax Relief and Simplification Act', result: 'Passed' },
  // Cruz
  { id: 'v4', member_id: 'C001098', bill_id: 'hr5678-119', vote_id: 'roll-388', vote_date: '2026-03-12', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Securing America\'s Border Act', result: 'Pending' },
  { id: 'v5', member_id: 'C001098', bill_id: 's1776-119', vote_id: 'roll-367', vote_date: '2026-03-05', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Second Amendment Protection and Community Safety Act', result: 'Passed' },
  { id: 'v6', member_id: 'C001098', bill_id: 's2222-119', vote_id: 'roll-312', vote_date: '2026-02-28', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Small Business Tax Relief and Simplification Act', result: 'Passed' },
  { id: 'v7', member_id: 'C001098', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v8', member_id: 'C001098', bill_id: 's555-119', vote_id: 'roll-356', vote_date: '2026-03-10', vote_position: 'No', vote_question: 'On Passage', vote_description: 'AI Transparency and Accountability Act', result: 'Pending' },
  // Sinema
  { id: 'v9', member_id: 'S001191', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v10', member_id: 'S001191', bill_id: 's1776-119', vote_id: 'roll-367', vote_date: '2026-03-05', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Community Safety Act', result: 'Passed' },
  { id: 'v11', member_id: 'S001191', bill_id: 's2222-119', vote_id: 'roll-312', vote_date: '2026-02-28', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Small Biz Tax Relief Act', result: 'Passed' },
  // Kelly
  { id: 'v12', member_id: 'K000377', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v13', member_id: 'K000377', bill_id: 'hr7890-119', vote_id: 'roll-295', vote_date: '2026-02-20', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Veterans Mental Health Act', result: 'Passed' },
  { id: 'v14', member_id: 'K000377', bill_id: 's2222-119', vote_id: 'roll-312', vote_date: '2026-02-28', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Small Biz Tax Relief Act', result: 'Passed' },
  { id: 'v15', member_id: 'K000377', bill_id: 's555-119', vote_id: 'roll-356', vote_date: '2026-03-10', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'AI Accountability Act', result: 'Pending' },
  // Gallego
  { id: 'v16', member_id: 'G000574', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v17', member_id: 'G000574', bill_id: 'hr7890-119', vote_id: 'roll-295', vote_date: '2026-02-20', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Veterans Mental Health Act', result: 'Passed' },
  { id: 'v18', member_id: 'G000574', bill_id: 'hr3456-119', vote_id: 'roll-340', vote_date: '2026-02-28', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Clean Energy Jobs Act', result: 'Pending' },
  { id: 'v19', member_id: 'G000574', bill_id: 'hr9999-119', vote_id: 'roll-410', vote_date: '2026-03-15', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Housing Affordability Act', result: 'Pending' },
  { id: 'v20', member_id: 'G000574', bill_id: 'hr5678-119', vote_id: 'roll-388', vote_date: '2026-03-12', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Secure Border Act', result: 'Pending' },
  // Schweikert
  { id: 'v21', member_id: 'S001183', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v22', member_id: 'S001183', bill_id: 'hr5678-119', vote_id: 'roll-388', vote_date: '2026-03-12', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Secure Border Act', result: 'Pending' },
  { id: 'v23', member_id: 'S001183', bill_id: 'hr3456-119', vote_id: 'roll-340', vote_date: '2026-02-28', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Clean Energy Jobs Act', result: 'Pending' },
  { id: 'v24', member_id: 'S001183', bill_id: 'hr7890-119', vote_id: 'roll-295', vote_date: '2026-02-20', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Veterans Mental Health Act', result: 'Passed' },
  // Biggs
  { id: 'v25', member_id: 'B001302', bill_id: 'hr5678-119', vote_id: 'roll-388', vote_date: '2026-03-12', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Secure Border Act', result: 'Pending' },
  { id: 'v26', member_id: 'B001302', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v27', member_id: 'B001302', bill_id: 'hr3456-119', vote_id: 'roll-340', vote_date: '2026-02-28', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Clean Energy Jobs Act', result: 'Pending' },
  { id: 'v28', member_id: 'B001302', bill_id: 'hr9999-119', vote_id: 'roll-410', vote_date: '2026-03-15', vote_position: 'No', vote_question: 'On Passage', vote_description: 'Housing Affordability Act', result: 'Pending' },
  // Stanton
  { id: 'v29', member_id: 'S001211', bill_id: 'hr1234-119', vote_id: 'roll-401', vote_date: '2026-03-18', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Affordable Insulin Now Act', result: 'Passed' },
  { id: 'v30', member_id: 'S001211', bill_id: 'hr3456-119', vote_id: 'roll-340', vote_date: '2026-02-28', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Clean Energy Jobs Act', result: 'Pending' },
  { id: 'v31', member_id: 'S001211', bill_id: 'hr4321-119', vote_id: 'roll-415', vote_date: '2026-03-10', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Childcare for Working Families Act', result: 'Pending' },
  { id: 'v32', member_id: 'S001211', bill_id: 'hr7890-119', vote_id: 'roll-295', vote_date: '2026-02-20', vote_position: 'Yes', vote_question: 'On Passage', vote_description: 'Veterans Mental Health Act', result: 'Passed' },
]

const MOCK_PROMISES: CampaignPromise[] = [
  // Warren
  { id: 'p1', member_id: 'S001217', promise_text: 'Cancel up to $50,000 in student loan debt for borrowers earning under $125,000', category: 'education', source_url: 'https://elizabethwarren.com/plans/student-loan-debt', status: 'in_progress', evidence: 'Introduced S.910 (Student Loan Relief Act) in the 119th Congress. Bill is in committee.', related_vote_ids: [] },
  { id: 'p2', member_id: 'S001217', promise_text: 'Implement a 2% wealth tax on fortunes over $50 million', category: 'tax', source_url: 'https://elizabethwarren.com/plans/ultra-millionaire-tax', status: 'not_yet_addressed', evidence: 'No wealth tax legislation introduced in the 119th Congress so far.', related_vote_ids: [] },
  { id: 'p3', member_id: 'S001217', promise_text: 'Break up big tech companies like Amazon, Google, and Facebook', category: 'technology', source_url: 'https://elizabethwarren.com/plans/break-up-big-tech', status: 'in_progress', evidence: 'Co-sponsored the AI Accountability Act (S.555) which creates FTC oversight.', related_vote_ids: ['roll-356'] },
  { id: 'p4', member_id: 'S001217', promise_text: 'Pass universal childcare for families earning up to 200% of poverty level', category: 'family', source_url: 'https://elizabethwarren.com/plans/universal-child-care', status: 'in_progress', evidence: 'Co-sponsored the Childcare for Working Families Act (HR.4321). Bill in committee.', related_vote_ids: [] },
  // Cruz
  { id: 'p5', member_id: 'C001098', promise_text: 'Secure the southern border and finish the border wall', category: 'immigration', source_url: 'https://www.tedcruz.org/issues/border-security/', status: 'in_progress', evidence: 'Voted Yes on the Secure Border Act (HR.5678). Bill passed committee.', related_vote_ids: ['roll-388'] },
  { id: 'p6', member_id: 'C001098', promise_text: 'Protect Second Amendment rights and oppose any new gun restrictions', category: 'gun_policy', source_url: 'https://www.tedcruz.org/issues/second-amendment/', status: 'kept', evidence: 'Voted Yes on Community Safety Act (S.1776) which preempts state assault weapon bans.', related_vote_ids: ['roll-367'] },
  { id: 'p7', member_id: 'C001098', promise_text: 'Cut taxes for working families and simplify the tax code', category: 'tax', source_url: 'https://www.tedcruz.org/issues/jobs-and-opportunity/', status: 'kept', evidence: 'Voted Yes on Small Biz Tax Relief Act (S.2222) making QBI deduction permanent.', related_vote_ids: ['roll-312'] },
  { id: 'p8', member_id: 'C001098', promise_text: 'Repeal the Affordable Care Act and replace with market-based solutions', category: 'healthcare', source_url: 'https://www.tedcruz.org/issues/healthcare/', status: 'broken', evidence: 'No ACA repeal legislation introduced in the 119th Congress. Voted against Affordable Insulin Now Act.', related_vote_ids: ['roll-401'] },
  { id: 'p9', member_id: 'C001098', promise_text: 'Oppose government regulation of artificial intelligence', category: 'technology', source_url: 'https://www.cruz.senate.gov/newsroom/', status: 'kept', evidence: 'Voted No on AI Accountability Act (S.555), opposing new federal AI regulations.', related_vote_ids: ['roll-356'] },
  // Sinema
  { id: 'p10', member_id: 'S001191', promise_text: 'Work across party lines to deliver bipartisan solutions', category: 'government_spending', source_url: 'https://www.sinema.senate.gov/about', status: 'kept', evidence: 'Co-sponsored bipartisan bills. One of the most bipartisan voting records in the Senate.', related_vote_ids: ['roll-367', 'roll-312'] },
  { id: 'p11', member_id: 'S001191', promise_text: 'Lower prescription drug costs for Arizona families', category: 'healthcare', source_url: 'https://www.sinema.senate.gov/priorities', status: 'kept', evidence: 'Voted Yes on the Affordable Insulin Now Act.', related_vote_ids: ['roll-401'] },
  { id: 'p12', member_id: 'S001191', promise_text: 'Invest in Arizona border communities and comprehensive immigration reform', category: 'immigration', source_url: 'https://www.sinema.senate.gov/priorities', status: 'in_progress', evidence: 'Supported elements of the Secure Border Act, pushed for DACA amendments.', related_vote_ids: [] },
  // Kelly
  { id: 'p13', member_id: 'K000377', promise_text: 'Lower prescription drug costs and protect healthcare coverage', category: 'healthcare', source_url: 'https://www.markkelly.com/issues/healthcare', status: 'kept', evidence: 'Voted Yes on the Affordable Insulin Now Act.', related_vote_ids: ['roll-401'] },
  { id: 'p14', member_id: 'K000377', promise_text: 'Secure Arizona border with smart technology and more agents', category: 'immigration', source_url: 'https://www.markkelly.com/issues/border-security', status: 'in_progress', evidence: 'Supported border security funding, pushed for technology-focused amendments.', related_vote_ids: [] },
  { id: 'p15', member_id: 'K000377', promise_text: 'Support veterans and expand access to VA services', category: 'veterans', source_url: 'https://www.markkelly.com/issues/veterans', status: 'kept', evidence: 'Voted Yes on Veterans Mental Health Act (HR.7890), signed into law.', related_vote_ids: ['roll-295'] },
  { id: 'p16', member_id: 'K000377', promise_text: 'Invest in clean water infrastructure for Arizona', category: 'climate', source_url: 'https://www.markkelly.com/issues/water', status: 'not_yet_addressed', evidence: 'No specific clean water infrastructure bill introduced in the 119th Congress.', related_vote_ids: [] },
  { id: 'p17', member_id: 'K000377', promise_text: 'Make housing more affordable for Arizona families', category: 'housing', source_url: 'https://www.markkelly.com/issues/housing', status: 'in_progress', evidence: 'Co-sponsored companion measures to the Housing Affordability Act.', related_vote_ids: [] },
  // Gallego
  { id: 'p18', member_id: 'G000574', promise_text: 'Expand veterans mental health services and reduce veteran suicide', category: 'veterans', source_url: 'https://gallego.house.gov/issues/veterans', status: 'kept', evidence: 'Voted Yes on Veterans Mental Health Act (HR.7890), signed into law.', related_vote_ids: ['roll-295'] },
  { id: 'p19', member_id: 'G000574', promise_text: 'Cap insulin costs at $35 per month for all Americans', category: 'healthcare', source_url: 'https://gallego.house.gov/issues/healthcare', status: 'in_progress', evidence: 'Voted Yes on Affordable Insulin Now Act (HR.1234). Passed House, in Senate committee.', related_vote_ids: ['roll-401'] },
  { id: 'p20', member_id: 'G000574', promise_text: 'Invest in clean energy jobs for Arizona communities', category: 'climate', source_url: 'https://gallego.house.gov/issues/environment', status: 'in_progress', evidence: 'Co-sponsored Clean Energy Jobs Act (HR.3456). In committee.', related_vote_ids: ['roll-340'] },
  { id: 'p21', member_id: 'G000574', promise_text: 'Make housing affordable for working families in Arizona', category: 'housing', source_url: 'https://gallego.house.gov/issues/housing', status: 'in_progress', evidence: 'Co-sponsored Housing Affordability Act (HR.9999).', related_vote_ids: ['roll-410'] },
  // Schweikert
  { id: 'p22', member_id: 'S001183', promise_text: 'Reduce government spending and balance the federal budget', category: 'government_spending', source_url: 'https://schweikert.house.gov/issues', status: 'in_progress', evidence: 'Voted against several spending bills. No balanced budget amendment introduced.', related_vote_ids: [] },
  { id: 'p23', member_id: 'S001183', promise_text: 'Lower taxes for Arizona families and small businesses', category: 'tax', source_url: 'https://schweikert.house.gov/issues/tax-reform', status: 'kept', evidence: 'Voted Yes on Small Biz Tax Relief Act. Advocated for permanent tax cuts.', related_vote_ids: ['roll-312'] },
  { id: 'p24', member_id: 'S001183', promise_text: 'Support innovation and oppose heavy-handed tech regulation', category: 'technology', source_url: 'https://schweikert.house.gov/issues/technology', status: 'kept', evidence: 'Voted against AI Accountability Act. Supports voluntary industry standards.', related_vote_ids: ['roll-356'] },
  { id: 'p25', member_id: 'S001183', promise_text: 'Strengthen border security and enforce immigration laws', category: 'immigration', source_url: 'https://schweikert.house.gov/issues/immigration', status: 'in_progress', evidence: 'Voted Yes on the Secure Border Act (HR.5678).', related_vote_ids: ['roll-388'] },
  // Biggs
  { id: 'p26', member_id: 'B001302', promise_text: 'Secure the border and end illegal immigration', category: 'immigration', source_url: 'https://biggs.house.gov/issues/immigration', status: 'kept', evidence: 'Voted Yes on Secure Border Act (HR.5678). Sponsored additional enforcement amendments.', related_vote_ids: ['roll-388'] },
  { id: 'p27', member_id: 'B001302', promise_text: 'Cut federal spending and reduce the national debt', category: 'government_spending', source_url: 'https://biggs.house.gov/issues/spending', status: 'in_progress', evidence: 'Voted against appropriations bills deemed too costly. Some amendments adopted.', related_vote_ids: [] },
  { id: 'p28', member_id: 'B001302', promise_text: 'Protect gun rights and oppose red flag laws', category: 'gun_policy', source_url: 'https://biggs.house.gov/issues/second-amendment', status: 'broken', evidence: 'Community Safety Act (S.1776) he voted for includes a federal crisis intervention framework (red flag law).', related_vote_ids: ['roll-367'] },
  { id: 'p29', member_id: 'B001302', promise_text: 'Oppose all new federal climate regulations and mandates', category: 'climate', source_url: 'https://biggs.house.gov/issues/energy', status: 'kept', evidence: 'Voted No on Clean Energy Jobs Act (HR.3456). Opposed all climate spending.', related_vote_ids: ['roll-340'] },
  // Stanton
  { id: 'p30', member_id: 'S001211', promise_text: 'Make childcare affordable for working families', category: 'family', source_url: 'https://stanton.house.gov/issues/families', status: 'in_progress', evidence: 'Co-sponsored Childcare for Working Families Act (HR.4321). In committee.', related_vote_ids: ['roll-415'] },
  { id: 'p31', member_id: 'S001211', promise_text: 'Invest in Arizona infrastructure and clean energy jobs', category: 'climate', source_url: 'https://stanton.house.gov/issues/infrastructure', status: 'in_progress', evidence: 'Voted Yes on Clean Energy Jobs Act (HR.3456).', related_vote_ids: ['roll-340'] },
  { id: 'p32', member_id: 'S001211', promise_text: 'Lower healthcare costs for Arizona families', category: 'healthcare', source_url: 'https://stanton.house.gov/issues/healthcare', status: 'kept', evidence: 'Voted Yes on Affordable Insulin Now Act (HR.1234). Passed the House.', related_vote_ids: ['roll-401'] },
]

const MOCK_SPONSORED_BILLS: Record<string, SponsoredBill[]> = {
  S001217: [
    { bill_id: 's910-119', title: 'Student Loan Relief and Education Affordability Act', status: 'introduced', introduced_date: '2026-03-01', role: 'sponsor' },
    { bill_id: 's555-119', title: 'AI Transparency and Accountability Act', status: 'in_committee', introduced_date: '2026-02-05', role: 'cosponsor' },
  ],
  C001098: [
    { bill_id: 's1776-119', title: 'Second Amendment Protection and Community Safety Act', status: 'passed_senate', introduced_date: '2025-12-01', role: 'cosponsor' },
    { bill_id: 's2222-119', title: 'Small Business Tax Relief and Simplification Act', status: 'passed_senate', introduced_date: '2025-11-15', role: 'cosponsor' },
  ],
  G000574: [
    { bill_id: 'hr3456-119', title: 'Clean Energy Transition and Jobs Act', status: 'in_committee', introduced_date: '2026-01-28', role: 'cosponsor' },
    { bill_id: 'hr9999-119', title: 'Housing Affordability and Homelessness Reduction Act', status: 'introduced', introduced_date: '2026-03-15', role: 'cosponsor' },
  ],
  K000377: [
    { bill_id: 'hr7890-119', title: 'Veterans Mental Health and Suicide Prevention Act', status: 'enacted', introduced_date: '2025-09-20', role: 'cosponsor' },
  ],
  S001211: [
    { bill_id: 'hr4321-119', title: 'Childcare for Working Families Act', status: 'introduced', introduced_date: '2026-03-10', role: 'cosponsor' },
    { bill_id: 'hr3456-119', title: 'Clean Energy Transition and Jobs Act', status: 'in_committee', introduced_date: '2026-01-28', role: 'cosponsor' },
  ],
  B001302: [
    { bill_id: 'hr5678-119', title: 'Securing America\'s Border Act of 2026', status: 'in_committee', introduced_date: '2026-02-10', role: 'cosponsor' },
  ],
  S001183: [
    { bill_id: 'hr5678-119', title: 'Securing America\'s Border Act of 2026', status: 'in_committee', introduced_date: '2026-02-10', role: 'cosponsor' },
  ],
}

// ---------------------------------------------------------------------------
// Score computation (unchanged — works with whatever promise data we have)
// ---------------------------------------------------------------------------

function computeScores(memberId: string, reps: Representative[], promises: CampaignPromise[]): RepScores {
  const rep = reps.find((r) => r.member_id === memberId)
  const memberPromises = promises.filter((p) => p.member_id === memberId)

  const kept = memberPromises.filter((p) => p.status === 'kept').length
  const broken = memberPromises.filter((p) => p.status === 'broken').length
  const inProgress = memberPromises.filter((p) => p.status === 'in_progress').length
  const notAddressed = memberPromises.filter((p) => p.status === 'not_yet_addressed').length
  const scored = kept + broken + inProgress
  const promiseAlignment = scored > 0 ? Math.round(((kept * 1.0 + inProgress * 0.5) / scored) * 100) : 0
  const partyLoyalty = rep?.votes_with_party_pct ?? 0
  const attendance = rep ? Math.round(100 - rep.missed_votes_pct) : 0
  const overall = Math.round(promiseAlignment * 0.5 + attendance * 0.3 + partyLoyalty * 0.2)

  return {
    member_id: memberId,
    promise_alignment_score: promiseAlignment,
    promises_kept: kept,
    promises_broken: broken,
    promises_in_progress: inProgress,
    promises_not_addressed: notAddressed,
    party_loyalty_score: partyLoyalty,
    attendance_score: attendance,
    overall_accountability_score: overall,
  }
}

// ---------------------------------------------------------------------------
// Live API: fetch & enrich members
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

async function fetchAndMapMembers(apiPath: string): Promise<Representative[]> {
  const data = await congressFetch<{ members: any[] }>(apiPath)
  const members: any[] = data.members ?? []
  if (members.length === 0) return []

  // Collect unique state codes for Civic enrichment
  const stateCodes = new Set<string>()
  for (const m of members) {
    const sc: string = m.state ?? ''
    if (sc) stateCodes.add(sc)
  }

  // Fetch Civic data for all relevant states in parallel
  const civicByState: Record<string, CivicOfficial[]> = {}
  await Promise.all(
    Array.from(stateCodes).map(async (sc) => {
      civicByState[sc] = await fetchCivicOfficials(sc)
    })
  )

  return members.map((m) => {
    const sc: string = m.state ?? ''
    const firstName: string = m.firstName ?? ''
    const lastName: string = m.lastName ?? ''
    const civic = civicByState[sc] ? findCivicMatch(civicByState[sc], firstName, lastName) : undefined
    return mapCongressMember(m, civic)
  })
}

async function fetchAndMapMemberDetail(bioguideId: string): Promise<Representative> {
  const data = await congressFetch<{ member: any }>(`/member/${bioguideId}`)
  const raw = data.member ?? data

  const sc: string = raw.state ?? ''
  const firstName: string = raw.firstName ?? ''
  const lastName: string = raw.lastName ?? ''

  let civic: CivicOfficial | undefined
  if (sc) {
    const officials = await fetchCivicOfficials(sc)
    civic = findCivicMatch(officials, firstName, lastName)
  }

  // Get sponsored and cosponsored legislation counts
  let sponsoredCount = 0
  let cosponsoredCount = 0
  try {
    const [sponsoredData, cosponsoredData] = await Promise.all([
      congressFetch<{ sponsoredLegislation?: any[]; pagination?: { count?: number } }>(
        `/member/${bioguideId}/sponsored-legislation?limit=1`
      ),
      congressFetch<{ cosponsoredLegislation?: any[]; pagination?: { count?: number } }>(
        `/member/${bioguideId}/cosponsored-legislation?limit=1`
      ),
    ])
    sponsoredCount = sponsoredData.pagination?.count ?? 0
    cosponsoredCount = cosponsoredData.pagination?.count ?? 0
  } catch {
    // counts stay 0
  }

  const rep = mapCongressMember(raw, civic)
  rep.bills_sponsored = sponsoredCount
  rep.bills_cosponsored = cosponsoredCount

  return rep
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Public API functions (signatures unchanged)
// ---------------------------------------------------------------------------

export async function getReps(filters: {
  state?: string
  chamber?: 'senate' | 'house'
  search?: string
} = {}): Promise<Representative[]> {
  setRepSource('loading')
  try {
    // Build Congress.gov query path
    // Congress.gov v3 requires path-based state filter: /member/congress/{congress}/{stateCode}
    let path: string
    if (filters.state) {
      path = `/member/congress/${119}/${encodeURIComponent(filters.state)}?currentMember=true&limit=250`
    } else {
      path = `/member?currentMember=true&limit=250`
    }
    let results = await fetchAndMapMembers(path)

    // Apply chamber filter (Congress.gov doesn't support chamber in query)
    if (filters.chamber) {
      results = results.filter((r) => r.chamber === filters.chamber)
    }

    // Apply search filter
    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.state_code.toLowerCase().includes(q) ||
          r.district?.toLowerCase().includes(q)
      )
    }

    setRepSource('live')
    return results
  } catch (err) {
    console.warn('Congress.gov API failed for getReps, falling back to mock data:', err)
    setRepSource('demo')

    // Fallback to mock data with same filtering logic
    let filtered = [...MOCK_REPS]
    if (filters.state) {
      filtered = filtered.filter((r) => r.state_code === filters.state)
    }
    if (filters.chamber) {
      filtered = filtered.filter((r) => r.chamber === filters.chamber)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.state_code.toLowerCase().includes(q) ||
          r.district?.toLowerCase().includes(q)
      )
    }
    return filtered
  }
}

export async function getRepDetail(memberId: string): Promise<Representative | null> {
  try {
    return await fetchAndMapMemberDetail(memberId)
  } catch (err) {
    console.warn('Congress.gov API failed for getRepDetail, falling back to mock data:', err)
    return MOCK_REPS.find((r) => r.member_id === memberId) ?? null
  }
}

export async function getRepVotes(
  memberId: string,
  page: number = 1
): Promise<{ votes: RepVote[]; total: number; page: number; pageSize: number }> {
  // Congress.gov doesn't expose per-member vote data easily; keep mock fallback
  const allVotes = MOCK_VOTES.filter((v) => v.member_id === memberId)
    .sort((a, b) => new Date(b.vote_date).getTime() - new Date(a.vote_date).getTime())
  const pageSize = 10
  const start = (page - 1) * pageSize
  const paged = allVotes.slice(start, start + pageSize)

  return { votes: paged, total: allVotes.length, page, pageSize }
}

export async function getRepPromises(memberId: string): Promise<CampaignPromise[]> {
  // No public API for campaign promises; use mock data
  return MOCK_PROMISES.filter((p) => p.member_id === memberId)
}

export async function getRepScore(memberId: string): Promise<RepScores> {
  // Try to get the rep from live API for party loyalty / attendance, but promises are always mock
  let reps: Representative[]
  try {
    const detail = await getRepDetail(memberId)
    reps = detail ? [detail] : MOCK_REPS
  } catch {
    reps = MOCK_REPS
  }
  return computeScores(memberId, reps, MOCK_PROMISES)
}

export async function contactRep(
  memberId: string,
  billId?: string,
  concernText?: string
): Promise<ContactEmailResult> {
  // Try live detail first for rep info, fall back to mock
  let rep: Representative | null | undefined
  try {
    rep = await getRepDetail(memberId)
  } catch {
    rep = MOCK_REPS.find((r) => r.member_id === memberId)
  }

  if (!rep) {
    return { subject: '', body: '', mailto_link: '' }
  }

  const subject = billId
    ? `Constituent Concern Regarding Bill ${billId}`
    : `Constituent Concern — ${concernText?.slice(0, 50) ?? 'General Inquiry'}`

  const body = `Dear ${rep.title} ${rep.last_name},

I am a constituent from ${rep.state_code}${rep.district ? `, ${rep.district}` : ''} writing to express my ${billId ? `views regarding ${billId}` : 'concern about an important issue'}.

${concernText ?? 'I would like to understand your position on this matter and how it affects our community.'}

${billId ? `I urge you to carefully consider the impact of this legislation on families in our district. ` : ''}I would appreciate the opportunity to discuss this further and hear your perspective.

Thank you for your service to our community.

Sincerely,
[Your Name]
[Your Address]`

  const mailto_link = `mailto:${rep.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return { subject, body, mailto_link }
}

export async function getRepBills(memberId: string): Promise<SponsoredBill[]> {
  try {
    // Fetch both sponsored and cosponsored legislation in parallel
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [sponsoredData, cosponsoredData] = await Promise.all([
      congressFetch<{ sponsoredLegislation?: any[] }>(
        `/member/${memberId}/sponsored-legislation?limit=20&offset=0`
      ),
      congressFetch<{ cosponsoredLegislation?: any[] }>(
        `/member/${memberId}/cosponsored-legislation?limit=20&offset=0`
      ),
    ])
    /* eslint-enable @typescript-eslint/no-explicit-any */

    const sponsored: SponsoredBill[] = (sponsoredData.sponsoredLegislation ?? []).map((bill: any) => ({
      bill_id: bill.number ? `${(bill.type ?? '').toLowerCase()}${bill.number}-${bill.congress ?? CURRENT_CONGRESS}` : bill.url ?? '',
      title: bill.title ?? bill.latestAction?.text ?? 'Untitled',
      status: bill.latestAction?.text ?? 'unknown',
      introduced_date: bill.introducedDate ?? '',
      role: 'sponsor' as const,
    }))

    const cosponsored: SponsoredBill[] = (cosponsoredData.cosponsoredLegislation ?? []).map((bill: any) => ({
      bill_id: bill.number ? `${(bill.type ?? '').toLowerCase()}${bill.number}-${bill.congress ?? CURRENT_CONGRESS}` : bill.url ?? '',
      title: bill.title ?? bill.latestAction?.text ?? 'Untitled',
      status: bill.latestAction?.text ?? 'unknown',
      introduced_date: bill.introducedDate ?? '',
      role: 'cosponsor' as const,
    }))

    const combined = [...sponsored, ...cosponsored]
    return combined.length > 0 ? combined : (MOCK_SPONSORED_BILLS[memberId] ?? [])
  } catch (err) {
    console.warn('Congress.gov API failed for getRepBills, falling back to mock data:', err)
    return MOCK_SPONSORED_BILLS[memberId] ?? []
  }
}
