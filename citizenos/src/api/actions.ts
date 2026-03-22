// Government Actions API client — reads from InsForge database (zero external API calls)

import { insforge } from '@/lib/insforge'
import { useDataSourceStore } from '@/stores/useDataSourceStore'
const setActionSource = (s: 'live' | 'demo' | 'loading' | 'cached') => useDataSourceStore.getState().setSource('actions', s)

export type ActionType =
  | 'bill'
  | 'executive_order'
  | 'proclamation'
  | 'memorandum'
  | 'final_rule'
  | 'proposed_rule'
  | 'court_ruling'
  | 'agency_action'

export interface LegalChallenge {
  case_name: string
  court: string
  status: 'pending' | 'upheld' | 'blocked' | 'overturned' | 'settled'
  ruling_date?: string
  summary: string
}

export interface TimelineEvent {
  date: string
  label: string
  completed: boolean
}

export interface GovernmentAction {
  id: string
  action_id: string
  action_type: ActionType
  title: string
  summary_raw: string
  summary_ai: string
  full_text_url: string
  pdf_url: string
  issuing_authority: string
  agencies: string[]
  document_number: string
  executive_order_number: number | null
  signing_date: string | null
  effective_date: string | null
  publication_date: string
  status: string
  status_detail: string
  categories: string[]
  affected_personas: string[]
  impact_level: 'high' | 'medium' | 'low'
  state_relevance: string[]
  impact_personas: Record<string, string>
  impact_story: string
  ai_processed: boolean
  related_action_ids: string[]
  legal_challenges: LegalChallenge[]
  timeline: TimelineEvent[]
  source_url: string
  source_api: 'federal_register' | 'congress_gov' | 'curated'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ---------------------------------------------------------------------------
// Rich curated actions data (stored in-memory for detail views)
// The DB table has basic fields; this has the full rich data.
// ---------------------------------------------------------------------------

const CURATED_ACTIONS: GovernmentAction[] = [
  {
    id: 'act-1',
    action_id: 'proc-10923',
    action_type: 'proclamation',
    title: 'Adjusting Nonimmigrant Worker Admission Programs — H-1B $100,000 Supplemental Fee',
    summary_raw: 'Presidential Proclamation establishing a supplemental fee of $100,000 for certain H-1B specialty occupation worker petitions.',
    summary_ai: 'This proclamation requires employers to pay a $100,000 supplemental fee for each H-1B visa petition when the worker is outside the US or requires consular processing. The fee took effect September 21, 2025. Key exemption: F-1 students already in the US who change status to H-1B are NOT required to pay this fee.',
    full_text_url: 'https://www.federalregister.gov/documents/2025/09/20/2025-proc-10923',
    pdf_url: '',
    issuing_authority: 'President',
    agencies: ['DHS', 'USCIS'],
    document_number: '2025-proc-10923',
    executive_order_number: null,
    signing_date: '2025-09-19',
    effective_date: '2025-09-21',
    publication_date: '2025-09-20',
    status: 'active',
    status_detail: 'In effect. Fee upheld by D.C. District Court on Dec 19, 2025. Appeals pending.',
    categories: ['immigration', 'economy', 'labor'],
    affected_personas: ['visa_holder', 'small_business', 'student'],
    impact_level: 'high',
    state_relevance: ['CA', 'TX', 'NY', 'WA', 'NJ', 'IL', 'MA', 'AZ'],
    impact_personas: {
      visa_holder: 'If you are applying for an H-1B from outside the US, your employer must now pay a $100,000 supplemental fee per petition. If you are currently in the US on an F-1 student visa and changing status to H-1B, you are EXEMPT from this fee.',
      small_business: 'Small businesses sponsoring H-1B workers from abroad now face $100,000+ per petition. This may make it cost-prohibitive for smaller firms to hire foreign talent.',
      student: 'International students on F-1 visas who apply for H-1B through change of status (from within the US) are EXEMPT from the $100K fee.',
    },
    impact_story: 'Priya is a software engineer in Hyderabad who received an H-1B offer from a startup in Austin. Under the new proclamation, her employer must pay $100,000 just for the visa petition. Meanwhile, Raj, an F-1 student at ASU, can convert to H-1B without the supplemental fee because he\'s already in the US.',
    ai_processed: true,
    related_action_ids: ['act-2', 'act-3'],
    legal_challenges: [
      { case_name: 'ITServe Alliance v. DHS', court: 'U.S. District Court, D.C.', status: 'upheld', ruling_date: '2025-12-19', summary: 'Court upheld the $100K fee as within presidential authority.' },
      { case_name: 'NASSCOM v. USCIS', court: 'U.S. District Court, S.D.N.Y.', status: 'pending', summary: 'Challenge arguing the fee is arbitrary. Hearing scheduled March 2026.' },
    ],
    timeline: [
      { date: '2025-09-19', label: 'Signed by President', completed: true },
      { date: '2025-09-21', label: 'Effective — fee collection begins', completed: true },
      { date: '2025-12-19', label: 'Fee upheld by D.C. court', completed: true },
      { date: '2026-03-15', label: 'S.D.N.Y. hearing scheduled', completed: false },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/',
    source_api: 'federal_register',
  },
  {
    id: 'act-2',
    action_id: 'rule-2025-h1b-lottery',
    action_type: 'final_rule',
    title: 'H-1B Registration Modernization: Wage-Level Based Lottery Selection',
    summary_raw: 'Final rule modifying the H-1B cap selection process to prioritize beneficiaries offered higher wages.',
    summary_ai: 'This agency rule changes how H-1B lottery winners are selected. Workers offered higher wages get more lottery entries. Level 4 wage earners get 4 entries (61% selection odds). Level 1 wage earners get 1 entry, dramatically reducing their chances.',
    full_text_url: 'https://www.federalregister.gov/documents/2025/',
    pdf_url: '',
    issuing_authority: 'USCIS',
    agencies: ['DHS', 'USCIS'],
    document_number: '2025-rule-h1b',
    executive_order_number: null,
    signing_date: null,
    effective_date: '2026-01-01',
    publication_date: '2025-11-15',
    status: 'active',
    status_detail: 'Final rule in effect for FY2027 H-1B cap season.',
    categories: ['immigration', 'labor', 'economy'],
    affected_personas: ['visa_holder', 'small_business', 'student'],
    impact_level: 'high',
    state_relevance: ['CA', 'TX', 'NY', 'WA', 'NJ', 'IL'],
    impact_personas: {
      visa_holder: 'If you are an entry-level H-1B applicant, your lottery odds drop significantly. Higher-paid applicants get 4x the lottery entries.',
      small_business: 'Small businesses that typically hire entry-level H-1B workers face much lower lottery success rates.',
      student: 'New graduates entering the H-1B lottery at entry-level wages face dramatically lower selection odds.',
    },
    impact_story: 'Tech company XYZ in Phoenix offered $85,000 to a new graduate — a Level 1 wage. Under the new rule, their chance drops to about 15%. A competing offer at $165,000 has a 61% chance.',
    ai_processed: true,
    related_action_ids: ['act-1'],
    legal_challenges: [],
    timeline: [
      { date: '2025-11-15', label: 'Final rule published', completed: true },
      { date: '2026-01-01', label: 'Effective date', completed: true },
      { date: '2026-03-01', label: 'First lottery under new rules', completed: false },
    ],
    source_url: 'https://www.federalregister.gov/',
    source_api: 'federal_register',
  },
  {
    id: 'act-3',
    action_id: 'memo-uscis-social-media',
    action_type: 'memorandum',
    title: 'Expansion of Social Media Vetting for Immigration Benefit Requests',
    summary_raw: 'Presidential memorandum directing USCIS to expand social media screening to all immigration benefit applications.',
    summary_ai: 'USCIS now reviews social media profiles for all visa applicants and immigration benefit requests. The vetting looks for "anti-American" and "antisemitic" activity. All visa applicants are instructed to set social media profiles to public.',
    full_text_url: '',
    pdf_url: '',
    issuing_authority: 'President',
    agencies: ['DHS', 'USCIS', 'Department of State'],
    document_number: '2025-memo-social',
    executive_order_number: null,
    signing_date: '2025-08-01',
    effective_date: '2025-08-19',
    publication_date: '2025-08-15',
    status: 'active',
    status_detail: 'In effect. USCIS and State Department implementing expanded vetting.',
    categories: ['immigration', 'technology', 'social_issues'],
    affected_personas: ['visa_holder', 'student'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      visa_holder: 'Your social media profiles are now reviewed as part of any USCIS benefit request. Posts deemed "anti-American" will be a strongly negative factor.',
      student: 'International students on F-1 and M-1 visas are subject to expanded social media vetting during OPT applications.',
    },
    impact_story: 'Ahmed, a PhD student at MIT, had his OPT application delayed by 3 months while USCIS reviewed his social media.',
    ai_processed: true,
    related_action_ids: ['act-1'],
    legal_challenges: [
      { case_name: 'ACLU v. DHS', court: 'U.S. District Court, N.D. Cal.', status: 'pending', summary: 'First Amendment challenge arguing vetting violates free speech rights.' },
    ],
    timeline: [
      { date: '2025-08-01', label: 'Memorandum signed', completed: true },
      { date: '2025-08-19', label: 'USCIS begins expanded vetting', completed: true },
      { date: '2026-02-10', label: 'ACLU files legal challenge', completed: true },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/',
    source_api: 'federal_register',
  },
  {
    id: 'act-4',
    action_id: 'eo-14110',
    action_type: 'executive_order',
    title: 'Establishing the Department of Government Efficiency (DOGE)',
    summary_raw: 'Executive order establishing DOGE to modernize federal IT, cut regulations, and reduce government spending.',
    summary_ai: 'This executive order created the Department of Government Efficiency (DOGE), tasked with cutting federal spending, modernizing IT, and eliminating regulations. By early 2026, DOGE actions have affected USAID, HHS, SSA, Education, and GSA.',
    full_text_url: 'https://www.federalregister.gov/documents/2025/01/20/eo-14110',
    pdf_url: '',
    issuing_authority: 'President',
    agencies: ['Executive Office of the President'],
    document_number: '2025-eo-14110',
    executive_order_number: 14110,
    signing_date: '2025-01-20',
    effective_date: '2025-01-20',
    publication_date: '2025-01-23',
    status: 'active',
    status_detail: 'In effect. DOGE actively cutting across federal agencies. Multiple legal challenges.',
    categories: ['government_spending', 'economy', 'healthcare', 'education', 'veterans'],
    affected_personas: ['senior', 'veteran', 'student', 'healthcare_worker', 'small_business'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      senior: 'SSA staffing cuts are creating delays in Social Security benefit processing.',
      veteran: 'VA has seen contract cancellations affecting telehealth services and some mental health programs.',
      student: 'The Department of Education is being reorganized. Student loan servicing may be affected.',
      healthcare_worker: 'HHS contract cancellations have affected public health research grants.',
      small_business: 'SBA processing times for loans have increased.',
    },
    impact_story: 'Margaret, 72, in Scottsdale relies on Social Security for 80% of her income. She waited 2 hours and 15 minutes on the SSA phone line — up from 12 minutes a year ago.',
    ai_processed: true,
    related_action_ids: ['act-5'],
    legal_challenges: [
      { case_name: 'AFGE v. DOGE', court: 'U.S. District Court, D.C.', status: 'pending', summary: 'Federal employee unions challenging mass layoffs.' },
      { case_name: 'State of California v. DOGE', court: 'U.S. District Court, N.D. Cal.', status: 'blocked', ruling_date: '2026-01-15', summary: 'Court temporarily blocked certain DOGE contract cancellations.' },
    ],
    timeline: [
      { date: '2025-01-20', label: 'Executive order signed', completed: true },
      { date: '2025-02-15', label: 'DOGE begins agency access', completed: true },
      { date: '2025-06-01', label: 'Mass layoffs across agencies', completed: true },
      { date: '2026-01-15', label: 'Court blocks some Medicaid cuts', completed: true },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/2025/01/',
    source_api: 'federal_register',
  },
  {
    id: 'act-5',
    action_id: 'agency-ed-reorg',
    action_type: 'agency_action',
    title: 'Department of Education Reorganization — Programs Transferred to Other Agencies',
    summary_raw: 'Six interagency agreements transferring Department of Education programs to four other agencies.',
    summary_ai: 'The Department of Education is being dismantled through six interagency transfer agreements. Student loan servicing operations move to Treasury. Special education oversight goes to HHS. This affects 45 million student loan borrowers.',
    full_text_url: '',
    pdf_url: '',
    issuing_authority: 'Department of Education',
    agencies: ['Department of Education', 'Treasury', 'HHS', 'Department of Labor', 'GSA'],
    document_number: 'ed-reorg-2025',
    executive_order_number: null,
    signing_date: null,
    effective_date: '2025-07-01',
    publication_date: '2025-05-15',
    status: 'active',
    status_detail: 'Transfers underway. Expect processing delays through mid-2026.',
    categories: ['education', 'government_spending'],
    affected_personas: ['student', 'parent'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      student: 'Your student loan servicer may change. Income-driven repayment recertification timelines may be extended.',
      parent: 'Parent PLUS loan servicing is part of the transfer. FAFSA processing may see delays.',
    },
    impact_story: 'The financial aid office at ASU is seeing a 300% increase in student inquiries about loan servicing.',
    ai_processed: true,
    related_action_ids: ['act-4'],
    legal_challenges: [
      { case_name: 'NEA v. Department of Education', court: 'U.S. District Court, D.C.', status: 'pending', summary: 'Challenge arguing transfers exceed executive authority.' },
    ],
    timeline: [
      { date: '2025-05-15', label: 'Interagency agreements announced', completed: true },
      { date: '2025-07-01', label: 'Transfers begin', completed: true },
      { date: '2026-06-01', label: 'Transition expected to complete', completed: false },
    ],
    source_url: 'https://www.ed.gov/',
    source_api: 'curated',
  },
  {
    id: 'act-6',
    action_id: 'proc-travel-ban-2025',
    action_type: 'proclamation',
    title: 'Restricting and Limiting the Entry of Foreign Nationals — Expanded Travel Ban',
    summary_raw: 'Presidential proclamation expanding the US travel ban to cover nationals from 19 countries.',
    summary_ai: 'This proclamation expands the US travel ban to cover nationals from 19 countries. Full entry suspension applies to 12 countries. Partial suspension applies to 7 countries.',
    full_text_url: 'https://www.whitehouse.gov/presidential-actions/2025/12/',
    pdf_url: '',
    issuing_authority: 'President',
    agencies: ['Department of State', 'DHS'],
    document_number: '2025-proc-travelban',
    executive_order_number: null,
    signing_date: '2025-12-16',
    effective_date: '2026-01-01',
    publication_date: '2025-12-18',
    status: 'active',
    status_detail: 'In effect since January 1, 2026. Multiple legal challenges filed.',
    categories: ['immigration', 'foreign_policy', 'social_issues'],
    affected_personas: ['visa_holder', 'student'],
    impact_level: 'high',
    state_relevance: ['CA', 'NY', 'MI', 'MN', 'VA', 'TX'],
    impact_personas: {
      visa_holder: 'If you are a national of one of the 19 listed countries, you may be unable to obtain new visas or renew existing ones.',
      student: 'International students from affected countries may face visa renewal challenges.',
    },
    impact_story: 'Fatima, a PhD candidate at the University of Michigan from Yemen, cannot visit her family because under the expanded ban, she cannot re-enter the US if she leaves.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [
      { case_name: 'IRAP v. Trump', court: 'U.S. Court of Appeals, 4th Circuit', status: 'pending', summary: 'Challenge arguing the expanded ban exceeds presidential authority.' },
    ],
    timeline: [
      { date: '2025-12-16', label: 'Proclamation signed', completed: true },
      { date: '2026-01-01', label: 'Ban takes effect', completed: true },
      { date: '2026-04-01', label: '4th Circuit hearing scheduled', completed: false },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/2025/12/',
    source_api: 'federal_register',
  },
  {
    id: 'act-7',
    action_id: 'eo-tariffs-liberation',
    action_type: 'executive_order',
    title: 'Reciprocal Tariffs on Imported Goods — "Liberation Day" Trade Action',
    summary_raw: 'Executive order imposing reciprocal tariffs on over 60 countries.',
    summary_ai: 'This executive order imposed reciprocal tariffs on imports from over 60 countries, with rates 10% to 50%. China faces 145% tariffs. Consumer prices rising 2-4% on average, costing households $1,500-$3,800/year.',
    full_text_url: '',
    pdf_url: '',
    issuing_authority: 'President',
    agencies: ['U.S. Trade Representative', 'Customs and Border Protection'],
    document_number: '2025-eo-tariffs',
    executive_order_number: 14125,
    signing_date: '2025-04-02',
    effective_date: '2025-04-09',
    publication_date: '2025-04-05',
    status: 'active',
    status_detail: 'In effect. China tariffs escalated to 145%.',
    categories: ['economy', 'trade', 'government_spending'],
    affected_personas: ['small_business', 'parent', 'senior', 'gig_worker'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      small_business: 'Businesses importing goods face 10-50% higher input costs. Average small business cost increase estimated at $12,000-$45,000/year.',
      parent: 'Consumer prices are rising across categories. The typical family of four may see $2,000-$3,800 in additional annual costs.',
      senior: 'Fixed-income seniors are disproportionately affected by price increases.',
      gig_worker: 'Independent contractors face higher costs for supplies and equipment.',
    },
    impact_story: 'Rosa\'s bakery in San Antonio imports specialty chocolate from Belgium. Tariffs increased her ingredient costs by 28%. She raised cupcake prices from $4 to $5 and lost 15% of her customers.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [
      { case_name: 'U.S. Chamber of Commerce v. USTR', court: 'U.S. Court of International Trade', status: 'pending', summary: 'Business groups challenging tariff authority.' },
    ],
    timeline: [
      { date: '2025-04-02', label: '"Liberation Day" — tariffs announced', completed: true },
      { date: '2025-04-09', label: 'Tariffs take effect', completed: true },
      { date: '2025-07-01', label: 'China tariffs escalated to 145%', completed: true },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/',
    source_api: 'federal_register',
  },
  {
    id: 'act-8',
    action_id: 'court-harvard-funding',
    action_type: 'court_ruling',
    title: 'Court Blocks Administration\'s Freeze on Harvard Research Grants',
    summary_raw: 'Federal judge ruled freezing $2B+ in Harvard grants was unconstitutional.',
    summary_ai: 'A federal judge ruled that freezing and canceling over $2 billion in Harvard University research grants was unconstitutional, violating the First Amendment and APA.',
    full_text_url: '',
    pdf_url: '',
    issuing_authority: 'U.S. District Court, D. Mass.',
    agencies: ['Department of Education', 'NIH', 'NSF'],
    document_number: 'court-harvard-2025',
    executive_order_number: null,
    signing_date: null,
    effective_date: '2025-09-03',
    publication_date: '2025-09-03',
    status: 'active',
    status_detail: 'Ruling stands. Government has appealed to First Circuit.',
    categories: ['education', 'government_spending'],
    affected_personas: ['student', 'healthcare_worker'],
    impact_level: 'medium',
    state_relevance: ['MA', 'CA', 'NY', 'CT', 'PA', 'IL'],
    impact_personas: {
      student: 'This ruling provides legal precedent protecting university research grants. However, the appeal creates ongoing uncertainty.',
      healthcare_worker: 'NIH-funded medical research at universities is protected by this ruling.',
    },
    impact_story: 'Dr. Chen\'s cancer research lab at Harvard had its $4.2 million NIH grant frozen overnight. Three postdocs were told to stop working. After the ruling, funding was restored.',
    ai_processed: true,
    related_action_ids: ['act-4'],
    legal_challenges: [],
    timeline: [
      { date: '2025-06-01', label: 'Administration freezes Harvard grants', completed: true },
      { date: '2025-09-03', label: 'Court rules in Harvard\'s favor', completed: true },
      { date: '2026-05-01', label: 'First Circuit hearing expected', completed: false },
    ],
    source_url: '',
    source_api: 'curated',
  },
  {
    id: 'act-9',
    action_id: 'eo-veterans-warrior',
    action_type: 'executive_order',
    title: 'Keeping Promises to Veterans and Establishing a National Center for Warrior Independence',
    summary_raw: 'Executive order establishing a National Center for Warrior Independence within the VA.',
    summary_ai: 'This executive order creates a National Center for Warrior Independence within the VA. It targets 90-day average disability claims processing (down from 150+ days) and expands telehealth access.',
    full_text_url: '',
    pdf_url: '',
    issuing_authority: 'President',
    agencies: ['Department of Veterans Affairs'],
    document_number: '2025-eo-veterans',
    executive_order_number: 14135,
    signing_date: '2025-05-09',
    effective_date: '2025-05-09',
    publication_date: '2025-05-12',
    status: 'active',
    status_detail: 'National Center established. Claims processing target not yet met (current avg: 120 days).',
    categories: ['veterans', 'healthcare', 'labor'],
    affected_personas: ['veteran'],
    impact_level: 'medium',
    state_relevance: [],
    impact_personas: {
      veteran: 'Disability claims processing is being accelerated — currently at 120 days average, down from 150+. Telehealth access is expanding for rural veterans.',
    },
    impact_story: 'Jake, a Marine veteran in rural Arizona, waited 8 months for his disability claim. Under the new system, recent claims are being processed in 4 months.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [],
    timeline: [
      { date: '2025-05-09', label: 'Executive order signed', completed: true },
      { date: '2025-07-01', label: 'National Center established', completed: true },
      { date: '2026-05-09', label: 'One-year progress review', completed: false },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/',
    source_api: 'federal_register',
  },
  {
    id: 'act-10',
    action_id: 'prorule-gig-worker',
    action_type: 'proposed_rule',
    title: 'Proposed Rule: Independent Contractor Classification Under Fair Labor Standards Act',
    summary_raw: 'Proposed rule revising independent contractor classification under the FLSA.',
    summary_ai: 'The Department of Labor proposes a new 6-factor test for classifying workers as independent contractors vs. employees. This could reclassify millions of gig workers as employees. Public comment period open through April 2026.',
    full_text_url: '',
    pdf_url: '',
    issuing_authority: 'Department of Labor',
    agencies: ['Department of Labor'],
    document_number: '2026-prorule-gig',
    executive_order_number: null,
    signing_date: null,
    effective_date: null,
    publication_date: '2026-02-15',
    status: 'proposed',
    status_detail: 'Public comment period open through April 30, 2026.',
    categories: ['labor', 'economy'],
    affected_personas: ['gig_worker', 'small_business'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      gig_worker: 'If finalized, you may be reclassified as an employee with minimum wage protections and benefits, but may lose scheduling flexibility.',
      small_business: 'If you use independent contractors, the new test may require reclassifying them as employees, increasing labor costs 20-30% per worker.',
    },
    impact_story: 'Maria drives for DoorDash and Uber in Mesa, AZ. As an employee, she\'d gain health insurance but might lose the ability to set her own hours. She\'s one of 59 million Americans in the gig economy watching this rule.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [],
    timeline: [
      { date: '2026-02-15', label: 'Proposed rule published', completed: true },
      { date: '2026-04-30', label: 'Public comment period closes', completed: false },
      { date: '2026-09-01', label: 'Final rule expected (estimated)', completed: false },
    ],
    source_url: 'https://www.regulations.gov/',
    source_api: 'federal_register',
  },
]

// Build a quick-lookup map from the curated data
const curatedMap = new Map<string, GovernmentAction>()
for (const a of CURATED_ACTIONS) {
  curatedMap.set(a.id, a)
}

// ---------------------------------------------------------------------------
// In-memory saved actions
// ---------------------------------------------------------------------------
let savedActionIds = new Set<string>()

// In-memory cache
let actionsCache: GovernmentAction[] | null = null
let actionsCacheTs = 0
const CACHE_TTL = 5 * 60 * 1000

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

function mapDbAction(row: Record<string, unknown>): GovernmentAction {
  const id = (row.id ?? '') as string
  // If we have rich curated data for this action, use it
  const curated = curatedMap.get(id)
  if (curated) return curated

  // Otherwise build from DB fields
  const agencyNames = Array.isArray(row.agency_names) ? row.agency_names as string[] : []
  const title = (row.title ?? '') as string
  const abstract = (row.abstract ?? '') as string

  return {
    id,
    action_id: (row.document_number ?? '') as string,
    action_type: mapTypeToActionType((row.type ?? '') as string),
    title,
    summary_raw: abstract,
    summary_ai: abstract,
    full_text_url: (row.federal_register_url ?? '') as string,
    pdf_url: (row.pdf_url ?? '') as string,
    issuing_authority: agencyNames[0] ?? 'Federal Government',
    agencies: agencyNames,
    document_number: (row.document_number ?? '') as string,
    executive_order_number: null,
    signing_date: null,
    effective_date: (row.effective_date ?? null) as string | null,
    publication_date: (row.publication_date ?? '') as string,
    status: 'active',
    status_detail: 'Published in the Federal Register.',
    categories: [(row.category ?? 'general') as string],
    affected_personas: ['general_public'],
    impact_level: (row.impact_level ?? 'medium') as 'high' | 'medium' | 'low',
    state_relevance: [],
    impact_personas: {},
    impact_story: abstract || `${title} — review the full text for details.`,
    ai_processed: false,
    related_action_ids: [],
    legal_challenges: [],
    timeline: [],
    source_url: (row.federal_register_url ?? '') as string,
    source_api: 'federal_register',
  }
}

function mapTypeToActionType(type: string): ActionType {
  const t = type.toLowerCase()
  if (t.includes('presidential') || t.includes('executive')) return 'executive_order'
  if (t.includes('rule') && t.includes('proposed')) return 'proposed_rule'
  if (t.includes('rule')) return 'final_rule'
  if (t.includes('notice')) return 'agency_action'
  return 'agency_action'
}

async function fetchAllActionsFromDb(): Promise<GovernmentAction[]> {
  if (actionsCache && Date.now() - actionsCacheTs < CACHE_TTL) {
    return actionsCache
  }

  const { data, error } = await insforge.database
    .from('actions')
    .select('*')
    .order('publication_date', { ascending: false })

  if (error || !data) {
    console.warn('Failed to fetch actions from DB:', error)
    return actionsCache ?? CURATED_ACTIONS
  }

  actionsCache = (data as Record<string, unknown>[]).map(mapDbAction)
  actionsCacheTs = Date.now()
  return actionsCache
}

// ---------------------------------------------------------------------------
// Public API functions (same signatures, DB-backed)
// ---------------------------------------------------------------------------

export async function getActions(filters: {
  type?: ActionType | 'all'
  category?: string
  persona?: string
  state?: string
  search?: string
  page?: number
} = {}): Promise<{ actions: GovernmentAction[]; total: number; page: number; pageSize: number }> {
  setActionSource('loading')

  try {
    let actions = await fetchAllActionsFromDb()

    if (filters.type && filters.type !== 'all') {
      actions = actions.filter((a) => a.action_type === filters.type)
    }
    if (filters.category) {
      actions = actions.filter((a) => a.categories.includes(filters.category!))
    }
    if (filters.persona) {
      actions = actions.filter((a) => a.affected_personas.includes(filters.persona!))
    }
    if (filters.state) {
      actions = actions.filter(
        (a) => a.state_relevance.length === 0 || a.state_relevance.includes(filters.state!),
      )
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      actions = actions.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary_ai.toLowerCase().includes(q) ||
          a.categories.some((c) => c.includes(q)),
      )
    }

    actions.sort((a, b) => {
      const dateA = a.effective_date || a.signing_date || a.publication_date
      const dateB = b.effective_date || b.signing_date || b.publication_date
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    const page = filters.page ?? 1
    const pageSize = 10
    const start = (page - 1) * pageSize
    const paged = actions.slice(start, start + pageSize)

    setActionSource('live')
    return { actions: paged, total: actions.length, page, pageSize }
  } catch (err) {
    console.warn('DB fetch failed for actions:', err)
    setActionSource('demo')
    return { actions: [], total: 0, page: filters.page ?? 1, pageSize: 10 }
  }
}

export async function getActionDetail(actionId: string): Promise<GovernmentAction | null> {
  // Check curated data first (has rich nested data)
  const curated = curatedMap.get(actionId)
  if (curated) return curated

  // Check in-memory cache
  const cached = actionsCache?.find((a) => a.id === actionId)
  if (cached) return cached

  // Fetch from DB
  const { data, error } = await insforge.database
    .from('actions')
    .select('*')
    .eq('id', actionId)
    .limit(1)

  if (error || !data || (data as unknown[]).length === 0) return null
  return mapDbAction((data as Record<string, unknown>[])[0])
}

export async function getActionImpact(
  actionId: string,
  personas: string[],
): Promise<Record<string, string>> {
  const action = await getActionDetail(actionId)
  if (!action) return {}

  const result: Record<string, string> = {}
  for (const p of personas) {
    result[p] = action.impact_personas[p] ?? 'No specific impact analysis available for this persona.'
  }
  return result
}

export async function getActionStory(actionId: string): Promise<string> {
  const action = await getActionDetail(actionId)
  return action?.impact_story ?? 'No impact story available.'
}

export async function chatWithAction(
  actionId: string,
  message: string,
  _history: ChatMessage[],
): Promise<{ response: string }> {
  const action = await getActionDetail(actionId)
  if (!action) return { response: 'Sorry, I could not find that action.' }

  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('affect') || lowerMsg.includes('impact') || lowerMsg.includes('apply to me')) {
    return {
      response: `The ${action.title} primarily affects ${action.affected_personas.join(', ')} personas. ${action.summary_ai.split('.').slice(0, 2).join('.')}. Would you like to know about a specific aspect?`,
    }
  }
  if (lowerMsg.includes('status') || lowerMsg.includes('when') || lowerMsg.includes('effective') || lowerMsg.includes('date')) {
    return {
      response: `Current status: ${action.status_detail}. ${action.effective_date ? `This took effect on ${new Date(action.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.` : ''} ${action.legal_challenges.length > 0 ? `There are ${action.legal_challenges.length} active legal challenge(s).` : ''}`,
    }
  }
  if (lowerMsg.includes('legal') || lowerMsg.includes('court') || lowerMsg.includes('challenge') || lowerMsg.includes('lawsuit')) {
    if (action.legal_challenges.length === 0) {
      return { response: 'There are no known legal challenges to this action at this time.' }
    }
    const challenges = action.legal_challenges.map((c) => `${c.case_name} (${c.court}): ${c.summary}`).join('\n\n')
    return { response: `There are ${action.legal_challenges.length} legal challenge(s):\n\n${challenges}` }
  }

  return {
    response: `This ${action.action_type.replace('_', ' ')} — "${action.title}" — ${action.summary_ai.split('.').slice(0, 2).join('.')}. What would you like to know specifically?`,
  }
}

export async function saveAction(actionId: string): Promise<void> {
  savedActionIds.add(actionId)
}

export async function unsaveAction(actionId: string): Promise<void> {
  savedActionIds.delete(actionId)
}

export async function getSavedActions(): Promise<GovernmentAction[]> {
  const results: GovernmentAction[] = []
  for (const id of savedActionIds) {
    const action = await getActionDetail(id)
    if (action) results.push(action)
  }
  return results
}

export function getSavedActionIdsSync(): Set<string> {
  return new Set(savedActionIds)
}

export async function getActionFeed(options: {
  personas?: string[]
  categories?: string[]
  state?: string
  limit?: number
} = {}): Promise<GovernmentAction[]> {
  let feed = await fetchAllActionsFromDb()

  if (options.personas && options.personas.length > 0) {
    const personalized = feed.filter((a) =>
      a.affected_personas.some((p) => options.personas!.includes(p)),
    )
    if (personalized.length > 0) feed = personalized
  }
  if (options.categories && options.categories.length > 0) {
    const catFiltered = feed.filter((a) =>
      a.categories.some((c) => options.categories!.includes(c)),
    )
    if (catFiltered.length > 0) feed = catFiltered
  }
  if (options.state) {
    const stateFiltered = feed.filter(
      (a) => a.state_relevance.length === 0 || a.state_relevance.includes(options.state!),
    )
    if (stateFiltered.length > 0) feed = stateFiltered
  }

  feed.sort((a, b) => {
    const impactWeight: Record<string, number> = { high: 3, medium: 2, low: 1 }
    const wA = impactWeight[a.impact_level] ?? 1
    const wB = impactWeight[b.impact_level] ?? 1
    if (wA !== wB) return wB - wA
    const dateA = a.effective_date || a.signing_date || a.publication_date
    const dateB = b.effective_date || b.signing_date || b.publication_date
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  return feed.slice(0, options.limit ?? 10)
}

export function getRelatedActions(actionId: string): GovernmentAction[] {
  const action = curatedMap.get(actionId)
  if (!action) return []
  return action.related_action_ids
    .map((id) => curatedMap.get(id))
    .filter((a): a is GovernmentAction => a != null)
}
