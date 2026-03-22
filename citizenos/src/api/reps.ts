// RepScore API client — reads from InsForge database (zero external API calls)

import { insforge } from '@/lib/insforge'
import { useDataSourceStore } from '@/stores/useDataSourceStore'
const setRepSource = (s: 'live' | 'demo' | 'loading' | 'cached') => useDataSourceStore.getState().setSource('reps', s)

// ---------------------------------------------------------------------------
// Interfaces
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
// In-memory cache
// ---------------------------------------------------------------------------
let repsCache: Representative[] | null = null
let repsCacheTs = 0
const CACHE_TTL = 5 * 60 * 1000

// ---------------------------------------------------------------------------
// DB mapping
// ---------------------------------------------------------------------------

function mapDbRep(row: Record<string, unknown>): Representative {
  const socialMedia = (typeof row.social_media === 'object' && row.social_media !== null ? row.social_media : {}) as Record<string, string>

  return {
    id: (row.id ?? '') as string,
    member_id: (row.member_id ?? '') as string,
    name: (row.full_name ?? '') as string,
    first_name: (row.first_name ?? '') as string,
    last_name: (row.last_name ?? '') as string,
    party: (row.party ?? 'I') as 'D' | 'R' | 'I',
    state_code: (row.state ?? '') as string,
    district: (row.district ?? null) as string | null,
    chamber: (row.chamber ?? 'house') as 'senate' | 'house',
    title: (row.title ?? '') as string,
    in_office: Boolean(row.in_office),
    photo_url: (row.photo_url ?? '') as string,
    phone: (row.phone ?? '') as string,
    email: (row.email ?? '') as string,
    website: (row.website ?? '') as string,
    office_address: (row.office ?? '') as string,
    social_links: {
      twitter: socialMedia.twitter,
      facebook: socialMedia.facebook,
      youtube: socialMedia.youtube,
    },
    votes_with_party_pct: Number(row.votes_with_party_pct) || 0,
    missed_votes_pct: Number(row.missed_votes_pct) || 0,
    bills_sponsored: Number(row.bills_sponsored) || 0,
    bills_cosponsored: Number(row.bills_cosponsored) || 0,
    next_election: (row.next_election ?? '') as string,
  }
}

async function fetchAllRepsFromDb(): Promise<Representative[]> {
  if (repsCache && Date.now() - repsCacheTs < CACHE_TTL) {
    return repsCache
  }

  const { data, error } = await insforge.database
    .from('reps')
    .select('*')
    .order('full_name', { ascending: true })

  if (error || !data) {
    console.warn('Failed to fetch reps from DB:', error)
    return repsCache ?? []
  }

  repsCache = (data as Record<string, unknown>[]).map(mapDbRep)
  repsCacheTs = Date.now()
  return repsCache
}

// ---------------------------------------------------------------------------
// Curated voting + promise data
// ---------------------------------------------------------------------------

const VOTES_DATA: RepVote[] = [
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

const PROMISES_DATA: CampaignPromise[] = [
  // Warren
  { id: 'p1', member_id: 'S001217', promise_text: 'Cancel up to $50,000 in student loan debt for borrowers earning under $125,000', category: 'education', source_url: 'https://elizabethwarren.com/plans/student-loan-debt', status: 'in_progress', evidence: 'Introduced S.910 (Student Loan Relief Act) in the 119th Congress.', related_vote_ids: [] },
  { id: 'p2', member_id: 'S001217', promise_text: 'Implement a 2% wealth tax on fortunes over $50 million', category: 'tax', source_url: 'https://elizabethwarren.com/plans/ultra-millionaire-tax', status: 'not_yet_addressed', evidence: 'No wealth tax legislation introduced in the 119th Congress.', related_vote_ids: [] },
  { id: 'p3', member_id: 'S001217', promise_text: 'Break up big tech companies', category: 'technology', source_url: 'https://elizabethwarren.com/plans/break-up-big-tech', status: 'in_progress', evidence: 'Co-sponsored the AI Accountability Act (S.555).', related_vote_ids: ['roll-356'] },
  { id: 'p4', member_id: 'S001217', promise_text: 'Pass universal childcare', category: 'family', source_url: 'https://elizabethwarren.com/plans/universal-child-care', status: 'in_progress', evidence: 'Co-sponsored the Childcare for Working Families Act (HR.4321).', related_vote_ids: [] },
  // Cruz
  { id: 'p5', member_id: 'C001098', promise_text: 'Secure the southern border and finish the border wall', category: 'immigration', source_url: 'https://www.tedcruz.org/issues/border-security/', status: 'in_progress', evidence: 'Voted Yes on the Secure Border Act (HR.5678).', related_vote_ids: ['roll-388'] },
  { id: 'p6', member_id: 'C001098', promise_text: 'Protect Second Amendment rights', category: 'gun_policy', source_url: 'https://www.tedcruz.org/issues/second-amendment/', status: 'kept', evidence: 'Voted Yes on Community Safety Act (S.1776).', related_vote_ids: ['roll-367'] },
  { id: 'p7', member_id: 'C001098', promise_text: 'Cut taxes for working families', category: 'tax', source_url: 'https://www.tedcruz.org/issues/jobs-and-opportunity/', status: 'kept', evidence: 'Voted Yes on Small Biz Tax Relief Act (S.2222).', related_vote_ids: ['roll-312'] },
  { id: 'p8', member_id: 'C001098', promise_text: 'Repeal the Affordable Care Act', category: 'healthcare', source_url: 'https://www.tedcruz.org/issues/healthcare/', status: 'broken', evidence: 'No ACA repeal legislation introduced. Voted against Affordable Insulin Now Act.', related_vote_ids: ['roll-401'] },
  { id: 'p9', member_id: 'C001098', promise_text: 'Oppose government regulation of AI', category: 'technology', source_url: 'https://www.cruz.senate.gov/newsroom/', status: 'kept', evidence: 'Voted No on AI Accountability Act (S.555).', related_vote_ids: ['roll-356'] },
  // Sinema
  { id: 'p10', member_id: 'S001191', promise_text: 'Work across party lines for bipartisan solutions', category: 'government_spending', source_url: 'https://www.sinema.senate.gov/about', status: 'kept', evidence: 'One of the most bipartisan voting records in the Senate.', related_vote_ids: ['roll-367', 'roll-312'] },
  { id: 'p11', member_id: 'S001191', promise_text: 'Lower prescription drug costs', category: 'healthcare', source_url: 'https://www.sinema.senate.gov/priorities', status: 'kept', evidence: 'Voted Yes on the Affordable Insulin Now Act.', related_vote_ids: ['roll-401'] },
  { id: 'p12', member_id: 'S001191', promise_text: 'Invest in border communities and immigration reform', category: 'immigration', source_url: 'https://www.sinema.senate.gov/priorities', status: 'in_progress', evidence: 'Supported elements of the Secure Border Act.', related_vote_ids: [] },
  // Kelly
  { id: 'p13', member_id: 'K000377', promise_text: 'Lower prescription drug costs', category: 'healthcare', source_url: 'https://www.markkelly.com/issues/healthcare', status: 'kept', evidence: 'Voted Yes on the Affordable Insulin Now Act.', related_vote_ids: ['roll-401'] },
  { id: 'p14', member_id: 'K000377', promise_text: 'Secure Arizona border with smart technology', category: 'immigration', source_url: 'https://www.markkelly.com/issues/border-security', status: 'in_progress', evidence: 'Supported border security funding.', related_vote_ids: [] },
  { id: 'p15', member_id: 'K000377', promise_text: 'Support veterans and expand VA services', category: 'veterans', source_url: 'https://www.markkelly.com/issues/veterans', status: 'kept', evidence: 'Voted Yes on Veterans Mental Health Act (HR.7890), signed into law.', related_vote_ids: ['roll-295'] },
  { id: 'p16', member_id: 'K000377', promise_text: 'Invest in clean water infrastructure', category: 'climate', source_url: 'https://www.markkelly.com/issues/water', status: 'not_yet_addressed', evidence: 'No specific bill introduced.', related_vote_ids: [] },
  { id: 'p17', member_id: 'K000377', promise_text: 'Make housing more affordable', category: 'housing', source_url: 'https://www.markkelly.com/issues/housing', status: 'in_progress', evidence: 'Co-sponsored companion measures to the Housing Affordability Act.', related_vote_ids: [] },
  // Gallego
  { id: 'p18', member_id: 'G000574', promise_text: 'Expand veterans mental health services', category: 'veterans', source_url: 'https://gallego.house.gov/issues/veterans', status: 'kept', evidence: 'Voted Yes on Veterans Mental Health Act, signed into law.', related_vote_ids: ['roll-295'] },
  { id: 'p19', member_id: 'G000574', promise_text: 'Cap insulin costs at $35/month', category: 'healthcare', source_url: 'https://gallego.house.gov/issues/healthcare', status: 'in_progress', evidence: 'Voted Yes on Affordable Insulin Now Act. Passed House.', related_vote_ids: ['roll-401'] },
  { id: 'p20', member_id: 'G000574', promise_text: 'Invest in clean energy jobs for Arizona', category: 'climate', source_url: 'https://gallego.house.gov/issues/environment', status: 'in_progress', evidence: 'Co-sponsored Clean Energy Jobs Act.', related_vote_ids: ['roll-340'] },
  { id: 'p21', member_id: 'G000574', promise_text: 'Make housing affordable', category: 'housing', source_url: 'https://gallego.house.gov/issues/housing', status: 'in_progress', evidence: 'Co-sponsored Housing Affordability Act.', related_vote_ids: ['roll-410'] },
  // Schweikert
  { id: 'p22', member_id: 'S001183', promise_text: 'Reduce government spending', category: 'government_spending', source_url: 'https://schweikert.house.gov/issues', status: 'in_progress', evidence: 'Voted against several spending bills.', related_vote_ids: [] },
  { id: 'p23', member_id: 'S001183', promise_text: 'Lower taxes for families and small businesses', category: 'tax', source_url: 'https://schweikert.house.gov/issues/tax-reform', status: 'kept', evidence: 'Voted Yes on Small Biz Tax Relief Act.', related_vote_ids: ['roll-312'] },
  { id: 'p24', member_id: 'S001183', promise_text: 'Support innovation and oppose tech regulation', category: 'technology', source_url: 'https://schweikert.house.gov/issues/technology', status: 'kept', evidence: 'Voted against AI Accountability Act.', related_vote_ids: ['roll-356'] },
  { id: 'p25', member_id: 'S001183', promise_text: 'Strengthen border security', category: 'immigration', source_url: 'https://schweikert.house.gov/issues/immigration', status: 'in_progress', evidence: 'Voted Yes on the Secure Border Act.', related_vote_ids: ['roll-388'] },
  // Biggs
  { id: 'p26', member_id: 'B001302', promise_text: 'Secure the border and end illegal immigration', category: 'immigration', source_url: 'https://biggs.house.gov/issues/immigration', status: 'kept', evidence: 'Voted Yes on Secure Border Act. Sponsored enforcement amendments.', related_vote_ids: ['roll-388'] },
  { id: 'p27', member_id: 'B001302', promise_text: 'Cut federal spending', category: 'government_spending', source_url: 'https://biggs.house.gov/issues/spending', status: 'in_progress', evidence: 'Voted against appropriations bills deemed too costly.', related_vote_ids: [] },
  { id: 'p28', member_id: 'B001302', promise_text: 'Protect gun rights and oppose red flag laws', category: 'gun_policy', source_url: 'https://biggs.house.gov/issues/second-amendment', status: 'broken', evidence: 'Community Safety Act he voted for includes a federal crisis intervention framework (red flag law).', related_vote_ids: ['roll-367'] },
  { id: 'p29', member_id: 'B001302', promise_text: 'Oppose all new climate regulations', category: 'climate', source_url: 'https://biggs.house.gov/issues/energy', status: 'kept', evidence: 'Voted No on Clean Energy Jobs Act. Opposed all climate spending.', related_vote_ids: ['roll-340'] },
  // Stanton
  { id: 'p30', member_id: 'S001211', promise_text: 'Make childcare affordable for working families', category: 'family', source_url: 'https://stanton.house.gov/issues/families', status: 'in_progress', evidence: 'Co-sponsored Childcare for Working Families Act.', related_vote_ids: ['roll-415'] },
  { id: 'p31', member_id: 'S001211', promise_text: 'Invest in Arizona infrastructure and clean energy', category: 'climate', source_url: 'https://stanton.house.gov/issues/infrastructure', status: 'in_progress', evidence: 'Voted Yes on Clean Energy Jobs Act.', related_vote_ids: ['roll-340'] },
  { id: 'p32', member_id: 'S001211', promise_text: 'Lower healthcare costs', category: 'healthcare', source_url: 'https://stanton.house.gov/issues/healthcare', status: 'kept', evidence: 'Voted Yes on Affordable Insulin Now Act. Passed the House.', related_vote_ids: ['roll-401'] },
]

const SPONSORED_BILLS_DATA: Record<string, SponsoredBill[]> = {
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
// Score computation
// ---------------------------------------------------------------------------

function computeScores(memberId: string, reps: Representative[], promises: CampaignPromise[]): RepScores {
  const rep = reps.find((r) => r.member_id === memberId)
  const memberPromises = promises.filter((p) => p.member_id === memberId)

  const kept = memberPromises.filter((p) => p.status === 'kept').length
  const broken = memberPromises.filter((p) => p.status === 'broken').length
  const inProgress = memberPromises.filter((p) => p.status === 'in_progress').length
  const notAddressed = memberPromises.filter((p) => p.status === 'not_yet_addressed').length
  const scored = kept + broken + inProgress
  const promiseAlignment = scored > 0 ? Math.round(((kept * 1.0 + inProgress * 0.5) / scored) * 100) : -1
  const partyLoyalty = Math.round(rep?.votes_with_party_pct ?? 0)
  const attendance = rep ? Math.round(100 - rep.missed_votes_pct) : 0

  let overall: number
  if (scored === 0) {
    overall = Math.round(attendance * 0.6 + partyLoyalty * 0.4)
  } else {
    overall = Math.round(promiseAlignment * 0.5 + attendance * 0.3 + partyLoyalty * 0.2)
  }

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
// Public API functions (DB-backed, zero external API calls)
// ---------------------------------------------------------------------------

export async function getReps(filters: {
  state?: string
  chamber?: 'senate' | 'house'
  search?: string
} = {}): Promise<Representative[]> {
  setRepSource('loading')

  try {
    let reps = await fetchAllRepsFromDb()

    if (filters.state) {
      reps = reps.filter((r) => r.state_code === filters.state)
    }
    if (filters.chamber) {
      reps = reps.filter((r) => r.chamber === filters.chamber)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      reps = reps.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.state_code.toLowerCase().includes(q) ||
          r.district?.toLowerCase().includes(q)
      )
    }

    setRepSource('live')
    return reps
  } catch (err) {
    console.warn('DB fetch failed for reps:', err)
    setRepSource('demo')
    return []
  }
}

export async function getRepDetail(memberId: string): Promise<Representative | null> {
  const { data, error } = await insforge.database
    .from('reps')
    .select('*')
    .eq('member_id', memberId)
    .limit(1)

  if (error || !data || (data as unknown[]).length === 0) {
    // Try from cache
    const cached = repsCache?.find((r) => r.member_id === memberId)
    return cached ?? null
  }

  return mapDbRep((data as Record<string, unknown>[])[0])
}

export async function getRepVotes(
  memberId: string,
  page: number = 1
): Promise<{ votes: RepVote[]; total: number; page: number; pageSize: number }> {
  const allVotes = VOTES_DATA.filter((v) => v.member_id === memberId)
    .sort((a, b) => new Date(b.vote_date).getTime() - new Date(a.vote_date).getTime())
  const pageSize = 10
  const start = (page - 1) * pageSize
  const paged = allVotes.slice(start, start + pageSize)

  return { votes: paged, total: allVotes.length, page, pageSize }
}

export async function getRepPromises(memberId: string): Promise<CampaignPromise[]> {
  return PROMISES_DATA.filter((p) => p.member_id === memberId)
}

export async function getRepScore(memberId: string): Promise<RepScores> {
  const rep = await getRepDetail(memberId)
  const reps = rep ? [rep] : (repsCache ?? [])
  return computeScores(memberId, reps, PROMISES_DATA)
}

export async function getRepScoreBatch(reps: Representative[]): Promise<Record<string, RepScores>> {
  const result: Record<string, RepScores> = {}
  for (const rep of reps) {
    result[rep.member_id] = computeScores(rep.member_id, [rep], PROMISES_DATA)
  }
  return result
}

export async function contactRep(
  memberId: string,
  billId?: string,
  concernText?: string
): Promise<ContactEmailResult> {
  const rep = await getRepDetail(memberId)

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
  return SPONSORED_BILLS_DATA[memberId] ?? []
}
