// BillBreaker API client — Congress.gov live API with mock fallback
// Uses the Congress.gov v3 API for real bill data

import { useDataSourceStore } from '@/stores/useDataSourceStore'
const setSource = (s: 'live' | 'demo' | 'loading') => useDataSourceStore.getState().setSource('bills', s)

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
// Congress.gov API helpers
// ---------------------------------------------------------------------------

const CONGRESS_BASE = 'https://api.congress.gov/v3'
const CURRENT_CONGRESS = 119

function getApiKey(): string {
  return import.meta.env.VITE_CONGRESS_GOV_API_KEY ?? ''
}

// Simple in-memory cache to avoid redundant network calls
const cache = new Map<string, { data: unknown; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function congressFetch<T>(path: string): Promise<T> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Missing VITE_CONGRESS_GOV_API_KEY')
  }

  const separator = path.includes('?') ? '&' : '?'
  const url = `${CONGRESS_BASE}${path}${separator}api_key=${apiKey}&format=json`

  const cached = cache.get(url)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Congress.gov API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  cache.set(url, { data, ts: Date.now() })
  return data as T
}

// ---------------------------------------------------------------------------
// Mapping Congress.gov responses to our Bill interface
// ---------------------------------------------------------------------------

function inferStatus(raw: Record<string, unknown>): Bill['status'] {
  const latestAction = ((raw.latestAction as Record<string, unknown>)?.text ?? '') as string
  const lower = latestAction.toLowerCase()

  // Check from most advanced status to least
  if (lower.includes('became public law') || lower.includes('became law')
    || lower.includes('signed by president') || lower.includes('signed by the president')) return 'enacted'
  if (lower.includes('vetoed') || lower.includes('pocket veto')) return 'vetoed'
  if (lower.includes('presented to president') || lower.includes('presented to the president')
    || lower.includes('sent to the president') || lower.includes('to the president')
    || lower.includes('resolving differences') || lower.includes('conference report')) return 'enacted' // effectively about to be enacted
  if (lower.includes('passed senate') || lower.includes('passed the senate')
    || lower.includes('agreed to in senate') || lower.includes('senate agreed')
    || lower.includes('received in the house')) return 'passed_senate'
  if (lower.includes('passed house') || lower.includes('passed the house')
    || lower.includes('agreed to in house') || lower.includes('received in the senate')
    || lower.includes('on passage') && lower.includes('passed')) return 'passed_house'
  if (lower.includes('placed on') || lower.includes('ordered to be reported')
    || lower.includes('reported by') || lower.includes('calendar')) return 'in_committee'
  if (lower.includes('committee') || lower.includes('referred to')
    || lower.includes('subcommittee') || lower.includes('hearings')) return 'in_committee'
  return 'introduced'
}

function inferCategories(raw: Record<string, unknown>): string[] {
  const title = ((raw.title ?? '') as string).toLowerCase()
  const cats: string[] = []

  const mapping: Record<string, string[]> = {
    healthcare: ['health', 'medic', 'drug', 'insulin', 'pharma', 'hospital', 'patient'],
    education: ['education', 'school', 'student', 'university', 'college', 'pell'],
    economy: ['tax', 'econom', 'business', 'trade', 'financ', 'budget', 'appropriat', 'employment', 'wage', 'loan'],
    immigration: ['immigra', 'border', 'asylum', 'visa', 'citizen'],
    security: ['secur', 'defense', 'militar', 'weapon', 'firearm', 'gun'],
    climate: ['climate', 'energy', 'emission', 'clean', 'environment', 'pollut'],
    technology: ['tech', 'cyber', 'artificial intelligence', ' ai ', 'digital', 'data'],
    housing: ['housing', 'homeless', 'rent', 'mortgage'],
    veterans: ['veteran'],
    family: ['child', 'family', 'parent'],
    tax: ['tax', 'irs', 'internal revenue'],
  }

  for (const [cat, keywords] of Object.entries(mapping)) {
    if (keywords.some((kw) => title.includes(kw))) {
      cats.push(cat)
    }
  }

  return cats.length > 0 ? cats : ['general']
}

function mapCongressBill(raw: Record<string, unknown>): Bill {
  const billType = ((raw.type ?? '') as string).toLowerCase()
  const billNumber = Number(raw.number) || 0
  const congress = Number(raw.congress) || CURRENT_CONGRESS
  const id = `${billType}-${billNumber}`

  const latestAction = (raw.latestAction ?? {}) as Record<string, unknown>
  const latestActionDate = (latestAction.actionDate ?? latestAction.date ?? '') as string
  const latestActionText = (latestAction.text ?? '') as string

  const sponsors = (raw.sponsors ?? []) as Record<string, unknown>[]
  const sponsor = sponsors.length > 0 ? sponsors[0] : {} as Record<string, unknown>
  const sponsorFirstName = (sponsor.firstName ?? '') as string
  const sponsorLastName = (sponsor.lastName ?? '') as string
  const sponsorParty = (sponsor.party ?? '') as string
  const sponsorState = (sponsor.state ?? '') as string

  const title = (raw.title ?? 'Untitled Bill') as string
  const shortTitle = title.length > 80 ? title.slice(0, 77) + '...' : title

  const introducedDate = (raw.introducedDate ?? '') as string

  const policyArea = (raw.policyArea ?? {}) as Record<string, unknown>
  const policyAreaName = (policyArea.name ?? '') as string

  // Construct a reasonable congress.gov web URL
  const typeSlug = billType === 'hr' ? 'house-bill'
    : billType === 's' ? 'senate-bill'
    : billType === 'hjres' ? 'house-joint-resolution'
    : billType === 'sjres' ? 'senate-joint-resolution'
    : billType === 'hconres' ? 'house-concurrent-resolution'
    : billType === 'sconres' ? 'senate-concurrent-resolution'
    : billType === 'hres' ? 'house-resolution'
    : billType === 'sres' ? 'senate-resolution'
    : 'bill'

  const webUrl = `https://www.congress.gov/bill/${congress}th-congress/${typeSlug}/${billNumber}`

  const status = inferStatus(raw)

  const categories = policyAreaName
    ? [policyAreaName.toLowerCase().replace(/\s+/g, '_')]
    : inferCategories(raw)

  const sponsorPrefix = billType === 's' || billType === 'sjres' || billType === 'sconres' || billType === 'sres'
    ? 'Sen.'
    : 'Rep.'
  const sponsorName = sponsorFirstName
    ? `${sponsorPrefix} ${sponsorFirstName} ${sponsorLastName}`
    : ''

  return {
    id,
    bill_id: `${billType}${billNumber}-${congress}`,
    bill_type: billType,
    bill_number: billNumber,
    congress,
    title,
    short_title: shortTitle,
    sponsor_name: sponsorName,
    sponsor_party: sponsorParty,
    sponsor_state: sponsorState,
    summary_raw: (raw.summary as string) ?? '',
    summary_ai: '',
    impact_story: '',
    status,
    status_detail: latestActionText,
    categories,
    introduced_date: introducedDate,
    last_action_date: latestActionDate,
    congress_url: webUrl,
    full_text: '',
    impact_personas: {},
    state_relevance: sponsorState ? [sponsorState] : [],
    ai_processed: false,
  }
}

/** Map a bill from the /bill/{congress}/{type}/{number} detail endpoint */
function mapCongressBillDetail(raw: Record<string, unknown>): Bill {
  // The detail endpoint has a slightly different shape: sponsors is fully nested, etc.
  return mapCongressBill(raw)
}

// ---------------------------------------------------------------------------
// Fallback mock data
// ---------------------------------------------------------------------------

const FALLBACK_BILLS: Bill[] = [
  {
    id: 'hr-1234',
    bill_id: 'hr1234-119',
    bill_type: 'hr',
    bill_number: 1234,
    congress: 119,
    title: 'Affordable Insulin Now Act',
    short_title: 'Affordable Insulin Now Act',
    sponsor_name: 'Rep. Angie Craig',
    sponsor_party: 'D',
    sponsor_state: 'MN',
    summary_raw:
      'To amend the Public Health Service Act and the Employee Retirement Income Security Act of 1974 to establish requirements with respect to cost-sharing for insulin products.',
    summary_ai:
      'This bill caps the out-of-pocket cost of insulin at $35 per month for all insured Americans. It requires health insurers and pharmacy benefit managers to pass manufacturer rebates through to patients, and creates a temporary affordability program for uninsured individuals. The Congressional Budget Office estimates 7.4 million Americans would save an average of $800 per year on insulin costs.',
    impact_story:
      'Maria, a Type 1 diabetic in Phoenix, currently spends $297 per month on insulin. Under this bill, her cost drops to $35 — saving her family over $3,100 a year. For the 1.3 million uninsured diabetics, a new federal affordability program would provide insulin at reduced cost until broader coverage solutions are implemented.',
    status: 'passed_house',
    status_detail: 'Passed the House 232-193 on March 31, 2026. Referred to Senate HELP Committee.',
    categories: ['healthcare', 'economy'],
    introduced_date: '2026-01-15',
    last_action_date: '2026-03-18',
    congress_url: 'https://www.congress.gov/bill/119th-congress/house-bill/1234',
    full_text: 'Full text would appear here from the Congress.gov API...',
    impact_personas: {
      student:
        'College students on parent plans keep the $35 cap until age 26. Campus health centers could also access the affordability program for uninsured students.',
      veteran:
        'Veterans using VA healthcare already receive discounted insulin, but those with private insurance through employers would see costs capped at $35/month.',
      small_business:
        'Small business owners providing health insurance would see lower pharmacy costs. The bill may reduce group plan premiums by 1-3% in plans with high diabetic enrollment.',
      parent:
        'Parents of children with Type 1 diabetes would see immediate savings. A family with two diabetic children could save over $6,200 per year.',
      senior:
        'Medicare Part D already has a $35 insulin cap from the Inflation Reduction Act, but seniors on Medicare Advantage or Medigap plans would gain new protections.',
      immigrant:
        'Lawful permanent residents with employer insurance benefit equally. Undocumented immigrants are not eligible for the uninsured affordability program.',
    },
    state_relevance: ['AZ', 'TX', 'FL', 'MN', 'OH', 'PA'],
    ai_processed: true,
  },
  {
    id: 'hr-5678',
    bill_id: 'hr5678-119',
    bill_type: 'hr',
    bill_number: 5678,
    congress: 119,
    title: 'Securing America\'s Border Act of 2026',
    short_title: 'Secure Border Act',
    sponsor_name: 'Rep. Mario Diaz-Balart',
    sponsor_party: 'R',
    sponsor_state: 'FL',
    summary_raw:
      'To provide for improvements to the border security of the United States, and for other purposes.',
    summary_ai:
      'This bill allocates $14.3 billion for border security over five years, including funding for physical barriers, surveillance technology, and 18,000 new Border Patrol agents. It mandates E-Verify for all employers within two years and creates a new visa tracking system. The bill also expedites asylum processing timelines from an average of 4.3 years to 6 months and increases immigration judge positions by 150.',
    impact_story:
      'Carlos, a restaurant owner in El Paso, has struggled to find workers while his community faces overcrowded shelters. This bill would require him to use E-Verify for all new hires within two years, potentially disrupting his workforce. Meanwhile, the faster asylum processing could reduce shelter overcrowding in border cities by 60%, easing pressure on local schools and hospitals.',
    status: 'in_committee',
    status_detail: 'In House Judiciary Committee. Markup scheduled for April 2026.',
    categories: ['immigration', 'security'],
    introduced_date: '2026-02-10',
    last_action_date: '2026-03-12',
    congress_url: 'https://www.congress.gov/bill/119th-congress/house-bill/5678',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'International students would face new visa tracking requirements. DACA recipients are not addressed by this bill, leaving their status unchanged.',
      veteran:
        'Veterans with border security experience would be given hiring preference for the 18,000 new Border Patrol positions.',
      small_business:
        'All employers must implement E-Verify within 24 months. Estimated compliance cost is $400-$1,200 per business for system setup and training.',
      parent:
        'Families in border communities could see reduced overcrowding in schools and clinics. Parents of mixed-status families face no new penalties under this bill.',
      senior:
        'Minimal direct impact. Some seniors in border communities may see changes in local healthcare availability.',
      immigrant:
        'Asylum seekers would face faster 6-month processing deadlines. Legal immigrants are unaffected. Undocumented workers face increased employer verification.',
    },
    state_relevance: ['TX', 'AZ', 'CA', 'NM', 'FL'],
    ai_processed: true,
  },
  {
    id: 's-910',
    bill_id: 's910-119',
    bill_type: 's',
    bill_number: 910,
    congress: 119,
    title: 'Student Loan Relief and Education Affordability Act',
    short_title: 'Student Loan Relief Act',
    sponsor_name: 'Sen. Elizabeth Warren',
    sponsor_party: 'D',
    sponsor_state: 'MA',
    summary_raw:
      'To provide for student loan forgiveness, reform income-driven repayment, and increase Pell Grant funding.',
    summary_ai:
      'This bill cancels up to $50,000 in federal student loan debt for borrowers earning under $125,000 annually, affecting roughly 36 million Americans. It reforms income-driven repayment to cap payments at 5% of discretionary income (down from 10%) and doubles the maximum Pell Grant to $14,000. The estimated cost is $620 billion over 10 years, funded partly by a proposed 2% surtax on incomes over $10 million.',
    impact_story:
      'Jasmine graduated from ASU with $38,000 in student debt and earns $52,000 as a first-year teacher. Under this bill, her entire loan balance would be forgiven, freeing up $340 per month. For current students, the doubled Pell Grant could cover tuition at most community colleges entirely.',
    status: 'introduced',
    status_detail: 'Introduced in Senate. Referred to Committee on Health, Education, Labor, and Pensions.',
    categories: ['education', 'economy'],
    introduced_date: '2026-03-01',
    last_action_date: '2026-03-01',
    congress_url: 'https://www.congress.gov/bill/119th-congress/senate-bill/910',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Current students benefit from doubled Pell Grants (up to $14,000) and reformed repayment. Graduates with existing loans up to $50,000 may see full forgiveness if income is below $125,000.',
      veteran:
        'Veterans using GI Bill benefits are largely unaffected, but those who took supplemental federal loans would be eligible for forgiveness.',
      small_business:
        'Small business owners with personal student debt qualify for forgiveness. Freed-up income could boost small business formation by an estimated 3%.',
      parent:
        'Parent PLUS loan borrowers are eligible for the $50,000 forgiveness. Parents earning under $125,000 with PLUS loans averaging $28,000 could see full cancellation.',
      senior:
        'About 3.5 million borrowers over 60 still carry student debt. Seniors on fixed incomes below $125,000 would benefit from forgiveness.',
      immigrant:
        'Lawful permanent residents with federal student loans are eligible. Non-citizens without permanent residency are not eligible for federal student aid.',
    },
    state_relevance: ['MA', 'AZ', 'CA', 'NY', 'PA', 'OH', 'MI'],
    ai_processed: true,
  },
  {
    id: 'hr-3456',
    bill_id: 'hr3456-119',
    bill_type: 'hr',
    bill_number: 3456,
    congress: 119,
    title: 'Clean Energy Transition and Jobs Act',
    short_title: 'Clean Energy Jobs Act',
    sponsor_name: 'Rep. Kathy Castor',
    sponsor_party: 'D',
    sponsor_state: 'FL',
    summary_raw:
      'To accelerate the transition to clean energy, create jobs in renewable energy sectors, and reduce greenhouse gas emissions.',
    summary_ai:
      'This bill invests $240 billion over 10 years in clean energy infrastructure, targeting a 50% reduction in greenhouse gas emissions by 2035. It creates a Clean Energy Corps employing 300,000 workers for solar, wind, and grid modernization projects. Tax credits for residential solar are extended through 2036, and a new $15 billion fund supports coal and fossil fuel communities transitioning to clean energy economies. Electric vehicle tax credits are expanded to $10,000 for vehicles under $45,000.',
    impact_story:
      'In Navajo County, Arizona, the closure of coal plants left 1,200 workers unemployed. This bill\'s $15 billion transition fund would bring a 500MW solar farm and battery facility, creating 800 permanent jobs. Homeowners like David in Tucson could save $6,200 on a rooftop solar installation through expanded tax credits.',
    status: 'in_committee',
    status_detail: 'In House Energy and Commerce Committee. Hearings held Feb 28, 2026.',
    categories: ['climate', 'economy', 'energy'],
    introduced_date: '2026-01-28',
    last_action_date: '2026-02-28',
    congress_url: 'https://www.congress.gov/bill/119th-congress/house-bill/3456',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'The Clean Energy Corps prioritizes hiring ages 18-30. Students in STEM fields gain access to paid fellowships and apprenticeships in renewable energy.',
      veteran:
        'Veterans receive hiring preference for Clean Energy Corps positions. The bill allocates $500 million for veteran-specific clean energy training.',
      small_business:
        'Small businesses gain enhanced tax credits for energy-efficient upgrades (up to 45% of costs). Clean energy contractors see expanded market opportunities.',
      parent:
        'Families save on electricity through residential solar credits and reduced utility costs. The bill targets a 20% reduction in average household energy bills by 2032.',
      senior:
        'Low-income seniors qualify for free weatherization and energy efficiency upgrades. The bill funds $2 billion for senior housing energy retrofits.',
      immigrant:
        'All legal residents qualify for residential solar tax credits. Clean Energy Corps positions are open to work-authorized immigrants.',
    },
    state_relevance: ['AZ', 'FL', 'TX', 'CA', 'NV', 'NM', 'WV', 'PA'],
    ai_processed: true,
  },
  {
    id: 's-2222',
    bill_id: 's2222-119',
    bill_type: 's',
    bill_number: 2222,
    congress: 119,
    title: 'Small Business Tax Relief and Simplification Act',
    short_title: 'Small Biz Tax Relief Act',
    sponsor_name: 'Sen. Tim Scott',
    sponsor_party: 'R',
    sponsor_state: 'SC',
    summary_raw:
      'To amend the Internal Revenue Code to simplify tax filing for small businesses and provide targeted tax relief.',
    summary_ai:
      'This bill raises the Small Business Administration size standard for tax benefits from 500 to 1,000 employees, expands the Section 179 deduction to $2 million, and creates a simplified quarterly filing system for businesses with under $5 million in revenue. It makes the 20% qualified business income deduction permanent and introduces a new 10% tax credit for businesses hiring in Opportunity Zones. Estimated 10-year cost: $185 billion.',
    impact_story:
      'Rosa owns a bakery in San Antonio with 12 employees. Currently she spends 80 hours a year on tax compliance. This bill\'s simplified quarterly filing would cut that to 20 hours. The permanent QBI deduction saves her $8,400 annually, enough to hire a part-time employee. Across Texas, 620,000 small businesses would benefit.',
    status: 'passed_senate',
    status_detail: 'Passed Senate 71-29 with bipartisan support. Sent to House Ways and Means Committee.',
    categories: ['tax', 'economy'],
    introduced_date: '2025-11-15',
    last_action_date: '2026-03-10',
    congress_url: 'https://www.congress.gov/bill/119th-congress/senate-bill/2222',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Student entrepreneurs and freelancers benefit from simplified filing. Those running side businesses while in school see reduced compliance burden.',
      veteran:
        'Veteran-owned small businesses gain enhanced Opportunity Zone credits (15% instead of 10%). The bill includes a dedicated SBA liaison for veteran entrepreneurs.',
      small_business:
        'Direct beneficiary. Permanent 20% QBI deduction, $2M Section 179 expensing, simplified filing, and expanded SBA size standards. Average annual tax savings of $6,000-$15,000 for businesses under $5M revenue.',
      parent:
        'Parents running home businesses or freelancing benefit from simplified quarterly filing and the permanent QBI deduction.',
      senior:
        'Retirees with small business income or consulting work see simplified filing. No changes to Social Security taxation.',
      immigrant:
        'Immigrant-owned businesses (13% of all US small businesses) benefit equally from all provisions. No citizenship requirements for tax benefits.',
    },
    state_relevance: ['TX', 'FL', 'CA', 'SC', 'GA', 'AZ', 'NY'],
    ai_processed: true,
  },
  {
    id: 'hr-7890',
    bill_id: 'hr7890-119',
    bill_type: 'hr',
    bill_number: 7890,
    congress: 119,
    title: 'Veterans Mental Health and Suicide Prevention Act',
    short_title: 'Veterans Mental Health Act',
    sponsor_name: 'Rep. Mike Bost',
    sponsor_party: 'R',
    sponsor_state: 'IL',
    summary_raw:
      'To improve mental health care and suicide prevention programs for veterans.',
    summary_ai:
      'This bill expands VA mental health services with $3.1 billion in new funding, including 5,000 additional mental health professionals, 24/7 crisis centers in every state, and a peer support program pairing new veterans with mentors. It extends combat-era mental health eligibility from 5 to 15 years after discharge and mandates same-week appointments for veterans in crisis. The bill also funds research into PTSD treatments and creates a grant program for veteran-focused nonprofits.',
    impact_story:
      'Jake served two tours in Afghanistan and waited 47 days for his first VA mental health appointment. Under this bill, veterans in crisis would be seen within the same week. The peer mentor program would connect Jake with other veterans who understand his experience — the VA estimates this alone could reduce veteran suicides by 20%.',
    status: 'enacted',
    status_detail: 'Signed into law by the President on February 28, 2026.',
    categories: ['healthcare', 'veterans'],
    introduced_date: '2025-09-20',
    last_action_date: '2026-02-28',
    congress_url: 'https://www.congress.gov/bill/119th-congress/house-bill/7890',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Student veterans at universities gain access to embedded VA counselors on campuses with 500+ veteran students.',
      veteran:
        'Primary beneficiary. Same-week crisis appointments, peer mentors, 15-year extended eligibility, and $3.1B in expanded services. Every VA facility will add mental health capacity.',
      small_business:
        'Veteran-owned businesses can access new employee assistance programs through VA partnerships. Minimal direct business impact otherwise.',
      parent:
        'Military families gain access to family counseling programs. Children of veterans can receive therapy through the expanded VA family services.',
      senior:
        'Older veterans from Vietnam and Gulf War eras gain expanded PTSD treatment access. The 15-year eligibility extension helps late-presenting cases.',
      immigrant:
        'Non-citizen veterans who served in the US military are fully eligible for all expanded benefits.',
    },
    state_relevance: ['IL', 'TX', 'CA', 'FL', 'VA', 'NC', 'AZ', 'GA'],
    ai_processed: true,
  },
  {
    id: 's-555',
    bill_id: 's555-119',
    bill_type: 's',
    bill_number: 555,
    congress: 119,
    title: 'AI Transparency and Accountability Act',
    short_title: 'AI Accountability Act',
    sponsor_name: 'Sen. Mark Warner',
    sponsor_party: 'D',
    sponsor_state: 'VA',
    summary_raw:
      'To establish standards for artificial intelligence transparency, accountability, and consumer protection.',
    summary_ai:
      'This bill creates the first comprehensive federal framework for AI regulation. It requires companies deploying AI systems in hiring, lending, healthcare, and criminal justice to conduct bias audits and publish transparency reports. A new Office of AI Policy within the FTC would enforce compliance. The bill mandates watermarking of AI-generated content, requires disclosure when consumers interact with AI, and creates a $500 million fund for AI safety research. Penalties for non-compliance range from $10,000 to $50,000 per violation.',
    impact_story:
      'When Priya applied for a mortgage in Atlanta, she was denied by an AI system with no explanation. Under this bill, lenders using AI must explain decisions in plain language and conduct annual bias audits. The transparency requirements mean 145 million Americans who interact with AI systems yearly would know when they\'re talking to a bot and have the right to human review.',
    status: 'in_committee',
    status_detail: 'In Senate Commerce Committee. Bipartisan negotiations ongoing.',
    categories: ['technology', 'economy'],
    introduced_date: '2026-02-05',
    last_action_date: '2026-03-15',
    congress_url: 'https://www.congress.gov/bill/119th-congress/senate-bill/555',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Students gain protections against AI bias in college admissions. AI tutoring platforms must disclose their AI nature. Research funding creates new academic opportunities.',
      veteran:
        'Veterans interacting with AI-powered VA systems gain transparency rights. AI used in veteran benefit determinations must be auditable.',
      small_business:
        'Businesses using AI tools for hiring must conduct bias audits. Compliance costs estimated at $2,000-$10,000/year for small businesses. Exemptions exist for companies under 50 employees.',
      parent:
        'Children under 16 receive enhanced protections from AI profiling. Parents gain the right to opt children out of AI-driven educational assessments.',
      senior:
        'Seniors targeted by AI-driven scams gain new protections. Healthcare AI used in treatment decisions for Medicare patients must be transparent.',
      immigrant:
        'AI systems used in immigration processing must meet bias audit standards. Applicants have the right to human review of AI-assisted decisions.',
    },
    state_relevance: ['VA', 'CA', 'WA', 'NY', 'TX', 'MA'],
    ai_processed: true,
  },
  {
    id: 'hr-4321',
    bill_id: 'hr4321-119',
    bill_type: 'hr',
    bill_number: 4321,
    congress: 119,
    title: 'Childcare for Working Families Act',
    short_title: 'Childcare for Working Families Act',
    sponsor_name: 'Rep. Rosa DeLauro',
    sponsor_party: 'D',
    sponsor_state: 'CT',
    summary_raw:
      'To ensure that working families have access to affordable, high-quality childcare.',
    summary_ai:
      'This bill caps childcare costs at 7% of household income for families earning up to 150% of state median income. It creates a federal-state partnership investing $45 billion annually to expand childcare slots by 3 million and raise childcare worker wages to at least $15/hour. The bill establishes universal pre-K for all 3- and 4-year-olds, funded through a 0.5% payroll tax increase split between employers and employees. Estimated to save the average family $8,600 per year on childcare.',
    impact_story:
      'Michelle in Columbus, Ohio pays $1,400/month for her two kids\' daycare — more than her rent. Under this bill, her costs would drop to $630/month based on her $54,000 salary. Her daycare provider, who earns $12.50/hour, would see a raise to at least $15/hour, helping reduce the 40% annual turnover rate that disrupts children\'s care.',
    status: 'introduced',
    status_detail: 'Introduced and referred to House Education and Workforce Committee.',
    categories: ['family', 'economy', 'education'],
    introduced_date: '2026-03-10',
    last_action_date: '2026-03-10',
    congress_url: 'https://www.congress.gov/bill/119th-congress/house-bill/4321',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Student parents gain access to subsidized campus childcare. The bill funds 500 new campus childcare centers at community colleges and universities.',
      veteran:
        'Military families and veteran households qualify for enhanced childcare subsidies. Existing DoD childcare programs would be expanded.',
      small_business:
        'Businesses with under 50 employees are exempt from the payroll tax increase for 3 years. Small businesses can claim a tax credit for providing on-site childcare.',
      parent:
        'Primary beneficiary. Childcare capped at 7% of income, universal pre-K for 3-4 year olds, higher quality standards, and 3 million new childcare slots.',
      senior:
        'Grandparents as primary caregivers qualify for childcare subsidies. The bill also creates intergenerational care centers combining senior and child programs.',
      immigrant:
        'All families with work-authorized members qualify regardless of immigration status. The bill adds multilingual support requirements for childcare providers.',
    },
    state_relevance: ['CT', 'OH', 'CA', 'NY', 'FL', 'TX', 'IL', 'PA'],
    ai_processed: true,
  },
  {
    id: 's-1776',
    bill_id: 's1776-119',
    bill_type: 's',
    bill_number: 1776,
    congress: 119,
    title: 'Second Amendment Protection and Community Safety Act',
    short_title: 'Community Safety Act',
    sponsor_name: 'Sen. John Cornyn',
    sponsor_party: 'R',
    sponsor_state: 'TX',
    summary_raw:
      'To strengthen background check systems, improve school safety, and protect Second Amendment rights.',
    summary_ai:
      'This bill strengthens the National Instant Criminal Background Check System (NICS) by requiring states to upload mental health and criminal records within 30 days or lose 5% of federal law enforcement grants. It funds $2 billion for school safety upgrades including hardened entries, panic buttons, and school resource officers. The bill creates a national crisis intervention order framework (red flag law) with due process protections and preempts state assault weapon bans. It also establishes a $300 million community violence intervention grant program.',
    impact_story:
      'After a shooting threat at Westwood High in Scottsdale, the school had no panic alert system and waited 8 minutes for police. This bill would fund school safety upgrades so every classroom has a panic button linked directly to law enforcement, cutting response time to under 2 minutes. Meanwhile, the strengthened background check system would have flagged the suspect, who had an unreported mental health commitment.',
    status: 'passed_senate',
    status_detail: 'Passed Senate 62-38. Sent to House Judiciary Committee.',
    categories: ['security', 'education'],
    introduced_date: '2025-12-01',
    last_action_date: '2026-03-05',
    congress_url: 'https://www.congress.gov/bill/119th-congress/senate-bill/1776',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Students benefit from $2 billion in school safety upgrades. Every school would have crisis alert systems and trained resource officers.',
      veteran:
        'Veterans with service-connected PTSD are specifically exempted from automatic firearm restrictions. The bill requires individual adjudication.',
      small_business:
        'Gun shop owners face updated NICS compliance requirements. FFLs see streamlined transfer processes with the modernized background check system.',
      parent:
        'Parents gain peace of mind from school safety investments. The crisis intervention framework allows families to petition for temporary firearm removal from at-risk individuals.',
      senior:
        'Senior gun owners are unaffected in rights. Seniors in high-crime areas benefit from the $300M community violence intervention grants.',
      immigrant:
        'Legal permanent residents retain existing firearm rights. Non-immigrant visa holders face no changes to current federal firearms restrictions.',
    },
    state_relevance: ['TX', 'AZ', 'FL', 'GA', 'OH', 'PA', 'VA', 'SC'],
    ai_processed: true,
  },
  {
    id: 'hr-9999',
    bill_id: 'hr9999-119',
    bill_type: 'hr',
    bill_number: 9999,
    congress: 119,
    title: 'Housing Affordability and Homelessness Reduction Act',
    short_title: 'Housing Affordability Act',
    sponsor_name: 'Rep. Maxine Waters',
    sponsor_party: 'D',
    sponsor_state: 'CA',
    summary_raw:
      'To address the national housing affordability crisis and reduce homelessness through investment in affordable housing construction and rental assistance.',
    summary_ai:
      'This bill invests $150 billion over 10 years to build 2 million affordable housing units and expand rental assistance to all eligible families (currently only 1 in 4 eligible families receives help). It creates a new renter\'s tax credit of up to $5,000 for households spending more than 30% of income on rent, incentivizes local zoning reform with $10 billion in grants, and funds Housing First programs to reduce chronic homelessness by 50%. The bill also establishes a $20 billion first-time homebuyer down payment assistance program.',
    impact_story:
      'In Maricopa County, Arizona, 45,000 families are on the Section 8 waiting list with an average wait of 3 years. This bill would eliminate the waitlist within 5 years and provide immediate relief through the renter\'s tax credit. For aspiring homeowners like James, a teacher in Tempe, the $25,000 down payment assistance could make buying a starter home possible for the first time.',
    status: 'introduced',
    status_detail: 'Introduced and referred to House Financial Services Committee.',
    categories: ['housing', 'economy'],
    introduced_date: '2026-03-15',
    last_action_date: '2026-03-15',
    congress_url: 'https://www.congress.gov/bill/119th-congress/house-bill/9999',
    full_text: 'Full text would appear here...',
    impact_personas: {
      student:
        'Students in high-cost areas benefit from the renter\'s tax credit. The bill funds 200,000 affordable units near universities and colleges.',
      veteran:
        'Homeless veterans (estimated 35,000) are prioritized in Housing First programs. The bill doubles HUD-VASH vouchers and adds veteran-specific transitional housing.',
      small_business:
        'Affordable housing construction creates demand for local contractors. The bill includes set-asides for small and minority-owned construction firms.',
      parent:
        'Families with children are prioritized for rental assistance expansion. The $25,000 down payment program targets families earning 80-120% of area median income.',
      senior:
        'Low-income seniors are prioritized for affordable housing units. The bill funds 300,000 units of senior-accessible affordable housing.',
      immigrant:
        'Legal permanent residents qualify for rental assistance and the renter\'s tax credit. Mixed-status families can access benefits through eligible household members.',
    },
    state_relevance: ['CA', 'AZ', 'NY', 'FL', 'TX', 'WA', 'CO', 'NV'],
    ai_processed: true,
  },
]

// In-memory store of all bills we've fetched (live + fallback), keyed by id
const billStore = new Map<string, Bill>()

// In-memory saved bills (simulates user's saved list)
let savedBillIds = new Set<string>()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Parse a bill id like "hr-1234" into { type: "hr", number: 1234 } */
function parseBillId(billId: string): { type: string; number: number } | null {
  const match = billId.match(/^([a-z]+)-(\d+)$/)
  if (!match) return null
  return { type: match[1], number: parseInt(match[2], 10) }
}

// ---------------------------------------------------------------------------
// State-based bill fetching: get members → get their sponsored bills
// ---------------------------------------------------------------------------

const stateBillsCache = new Map<string, { data: Bill[]; ts: number }>()
const STATE_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function parseCongressMemberName(raw: string): { first: string; last: string; display: string } {
  // Congress.gov returns "Last, First" or "Last, First Middle"
  const parts = raw.split(',').map(s => s.trim())
  if (parts.length >= 2) {
    const last = parts[0]
    const first = parts[1].split(' ')[0]
    return { first, last, display: `${first} ${last}` }
  }
  return { first: raw, last: '', display: raw }
}

function parseCongressParty(partyName: string): string {
  const p = partyName.toLowerCase()
  if (p.startsWith('dem')) return 'D'
  if (p.startsWith('rep')) return 'R'
  return 'I'
}

async function fetchBillsByState(stateCode: string): Promise<Bill[]> {
  // Check cache first
  const cached = stateBillsCache.get(stateCode)
  if (cached && Date.now() - cached.ts < STATE_CACHE_TTL) {
    return cached.data
  }

  // Step 1: Get current members from this state
  // Congress.gov v3 requires path-based state filter: /member/congress/{congress}/{stateCode}
  const memberData = await congressFetch<{ members: Record<string, unknown>[] }>(
    `/member/congress/${CURRENT_CONGRESS}/${stateCode}?limit=50`
  )
  const members = memberData.members ?? []
  if (members.length === 0) throw new Error('No members found for state')

  // Step 2: For each member, get their sponsored legislation (parallel, limit to first 8 members)
  const memberSlice = members.slice(0, 8)
  const allBills: Bill[] = []
  const seen = new Set<string>()

  await Promise.all(
    memberSlice.map(async (m) => {
      const bioguideId = (m.bioguideId ?? '') as string
      if (!bioguideId) return

      // Congress.gov returns name as "Last, First" format
      const nameStr = (m.name ?? '') as string
      const { display: sponsorName } = parseCongressMemberName(nameStr)
      const partyCode = parseCongressParty((m.partyName ?? '') as string)

      // Determine title prefix from terms
      const terms = m.terms as { item?: { chamber?: string }[] } | undefined
      const chamber = terms?.item?.[0]?.chamber ?? ''
      const prefix = chamber === 'Senate' ? 'Sen.' : 'Rep.'

      try {
        const legData = await congressFetch<{ sponsoredLegislation: Record<string, unknown>[] }>(
          `/member/${bioguideId}/sponsored-legislation?limit=10&sort=updateDate+desc`
        )
        const bills = legData.sponsoredLegislation ?? []
        for (const raw of bills) {
          const bill = mapCongressBill(raw)
          if (seen.has(bill.id)) continue
          seen.add(bill.id)
          // Enrich with sponsor info from the member data
          bill.sponsor_name = `${prefix} ${sponsorName}`
          bill.sponsor_party = partyCode
          bill.sponsor_state = stateCode
          bill.state_relevance = [stateCode]
          allBills.push(bill)
        }
      } catch {
        // Skip this member on error
      }
    })
  )

  // Sort by latest action date
  allBills.sort((a, b) =>
    new Date(b.last_action_date || '').getTime() - new Date(a.last_action_date || '').getTime()
  )

  stateBillsCache.set(stateCode, { data: allBills, ts: Date.now() })
  return allBills
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

  // Try live API first
  setSource('loading')
  try {
    let liveBills: Bill[]

    if (filters.state) {
      // State filter: get members from that state, then their sponsored legislation
      liveBills = await fetchBillsByState(filters.state)
    } else {
      // No state filter: get latest national bills
      const offset = (page - 1) * pageSize
      const data = await congressFetch<{ bills: Record<string, unknown>[]; pagination?: Record<string, unknown> }>(
        `/bill?limit=50&offset=${offset}&sort=updateDate+desc`
      )
      liveBills = (data.bills ?? []).map((raw) => mapCongressBill(raw))
    }

    // Store all fetched bills for later detail lookups
    for (const b of liveBills) {
      billStore.set(b.id, b)
    }

    // Apply remaining client-side filters
    if (filters.category) {
      liveBills = liveBills.filter((b) => b.categories.includes(filters.category!))
    }
    if (filters.status) {
      liveBills = liveBills.filter((b) => b.status === filters.status)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      liveBills = liveBills.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.short_title.toLowerCase().includes(q) ||
          b.sponsor_name.toLowerCase().includes(q)
      )
    }

    // Paginate client-side after filtering
    const total = liveBills.length
    const start = (page - 1) * pageSize
    const paged = liveBills.slice(start, start + pageSize)

    setSource('live')
    return { bills: paged, total, page, pageSize }
  } catch (_err) {
    // Fallback to mock data
    console.warn('Congress.gov API unavailable, using fallback data:', _err)
    setSource('demo')
  }

  // Fallback path
  await delay(400)

  let filtered = [...FALLBACK_BILLS]

  if (filters.state) {
    filtered = filtered.filter((b) => b.state_relevance.includes(filters.state!))
  }
  if (filters.category) {
    filtered = filtered.filter((b) => b.categories.includes(filters.category!))
  }
  if (filters.status) {
    filtered = filtered.filter((b) => b.status === filters.status)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.short_title.toLowerCase().includes(q) ||
        b.summary_ai.toLowerCase().includes(q) ||
        b.sponsor_name.toLowerCase().includes(q)
    )
  }

  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return { bills: paged, total: filtered.length, page, pageSize }
}

export async function getBillDetail(billId: string): Promise<Bill | null> {
  // Handle "latest" — fetch the most recent bill
  if (billId === 'latest') {
    try {
      const data = await congressFetch<{ bills: Record<string, unknown>[] }>(
        '/bill?limit=1&sort=updateDate+desc'
      )
      const rawBills = data.bills ?? []
      if (rawBills.length > 0) {
        const bill = mapCongressBill(rawBills[0])
        billStore.set(bill.id, bill)
        return bill
      }
    } catch (_err) {
      console.warn('Congress.gov API unavailable for latest bill, using fallback:', _err)
    }

    // Fallback: return most recent mock bill
    const sorted = [...FALLBACK_BILLS].sort(
      (a, b) => new Date(b.last_action_date).getTime() - new Date(a.last_action_date).getTime()
    )
    return sorted[0] ?? null
  }

  // Try live API for a specific bill
  const parsed = parseBillId(billId)
  if (parsed) {
    try {
      const data = await congressFetch<{ bill: Record<string, unknown> }>(
        `/bill/${CURRENT_CONGRESS}/${parsed.type}/${parsed.number}`
      )
      if (data.bill) {
        const bill = mapCongressBillDetail(data.bill)
        billStore.set(bill.id, bill)
        return bill
      }
    } catch (_err) {
      console.warn(`Congress.gov API unavailable for bill ${billId}, trying store/fallback:`, _err)
    }
  }

  // Check in-memory store (may have been fetched via getBills)
  const stored = billStore.get(billId)
  if (stored) return stored

  // Fallback to mock data
  return FALLBACK_BILLS.find((b) => b.id === billId) ?? null
}

export async function getBillImpact(
  billId: string,
  personas: string[]
): Promise<Record<string, string>> {
  // Check if we have a fallback bill with rich impact data first
  const fallbackBill = FALLBACK_BILLS.find((b) => b.id === billId)
  if (fallbackBill && Object.keys(fallbackBill.impact_personas).length > 0) {
    await delay(300)
    const result: Record<string, string> = {}
    for (const p of personas) {
      result[p] = fallbackBill.impact_personas[p] ?? 'No specific impact analysis available for this persona.'
    }
    return result
  }

  // For live API bills without impact data, check the bill store
  const storedBill = billStore.get(billId)
  if (storedBill && Object.keys(storedBill.impact_personas).length > 0) {
    const result: Record<string, string> = {}
    for (const p of personas) {
      result[p] = storedBill.impact_personas[p] ?? 'No specific impact analysis available for this persona.'
    }
    return result
  }

  // Generate sensible defaults for live API bills
  const bill = storedBill ?? (await getBillDetail(billId))
  const result: Record<string, string> = {}
  for (const p of personas) {
    result[p] = bill
      ? `Impact analysis for the "${bill.short_title}" on ${p}s is not yet available. This bill is categorized under ${bill.categories.join(', ')}.`
      : 'No specific impact analysis available for this persona.'
  }
  return result
}

export async function getBillStory(billId: string): Promise<string> {
  // Check fallback bills for rich story data
  const fallbackBill = FALLBACK_BILLS.find((b) => b.id === billId)
  if (fallbackBill && fallbackBill.impact_story) {
    await delay(300)
    return fallbackBill.impact_story
  }

  // Check the bill store
  const storedBill = billStore.get(billId)
  if (storedBill && storedBill.impact_story) {
    return storedBill.impact_story
  }

  // For live API bills, return a sensible default
  const bill = storedBill ?? (await getBillDetail(billId))
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
  await delay(800)

  // Try to find the bill from any source
  const bill = FALLBACK_BILLS.find((b) => b.id === billId)
    ?? billStore.get(billId)
    ?? null

  if (!bill) return { response: 'Sorry, I could not find that bill.' }

  const lowerMsg = message.toLowerCase()

  // Simple keyword-based responses for demo
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
  await delay(200)
  savedBillIds.add(billId)
}

export async function unsaveBill(billId: string): Promise<void> {
  await delay(200)
  savedBillIds.delete(billId)
}

export async function getSavedBills(): Promise<Bill[]> {
  await delay(300)
  const results: Bill[] = []
  for (const id of savedBillIds) {
    // Check fallback first, then bill store
    const fallback = FALLBACK_BILLS.find((b) => b.id === id)
    const stored = billStore.get(id)
    const bill = fallback ?? stored
    if (bill) results.push(bill)
  }
  return results
}

export function getSavedBillIdsSync(): Set<string> {
  return new Set(savedBillIds)
}

export async function getRepsVoted(
  billId: string
): Promise<{ name: string; party: string; position: string; memberId: string }[]> {
  await delay(400)

  const bill = FALLBACK_BILLS.find((b) => b.id === billId) ?? billStore.get(billId)
  if (!bill) return []

  // Only return vote records for bills that have passed at least one chamber
  if (bill.status === 'introduced' || bill.status === 'in_committee') return []

  // Mock reps based on state relevance
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

  // Return a subset based on bill type
  if (bill.bill_type === 'hr') {
    return mockVotes.filter((v) => v.name.startsWith('Rep.'))
  }
  if (bill.bill_type === 's') {
    return mockVotes.filter((v) => v.name.startsWith('Sen.'))
  }
  return mockVotes
}
