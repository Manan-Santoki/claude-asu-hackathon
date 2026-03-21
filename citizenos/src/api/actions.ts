// Government Actions API client — mock data layer
// Replace mock implementations with real Federal Register API calls when backend is ready

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
// Mock data
// ---------------------------------------------------------------------------

const MOCK_ACTIONS: GovernmentAction[] = [
  {
    id: 'act-1',
    action_id: 'proc-10923',
    action_type: 'proclamation',
    title: 'Adjusting Nonimmigrant Worker Admission Programs — H-1B $100,000 Supplemental Fee',
    summary_raw: 'Presidential Proclamation establishing a supplemental fee of $100,000 for certain H-1B specialty occupation worker petitions.',
    summary_ai: 'This proclamation requires employers to pay a $100,000 supplemental fee for each H-1B visa petition when the worker is outside the US or requires consular processing. The fee took effect September 21, 2025. Key exemption: F-1 students already in the US who change status to H-1B are NOT required to pay this fee. The fee is in addition to existing filing costs of $2,000-$10,000. Courts have upheld the fee as of December 2025, but appeals are pending.',
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
      visa_holder: 'If you are applying for an H-1B from outside the US, your employer must now pay a $100,000 supplemental fee per petition. This is on top of existing filing fees. If you are currently in the US on an F-1 student visa and changing status to H-1B, you are EXEMPT from this fee.',
      small_business: 'Small businesses sponsoring H-1B workers from abroad now face $100,000+ per petition. This may make it cost-prohibitive for smaller firms to hire foreign talent. Companies with under 25 employees are NOT exempt — the fee applies equally regardless of company size.',
      student: 'International students on F-1 visas who apply for H-1B through change of status (from within the US) are EXEMPT from the $100K fee. However, if you leave the US and need consular processing, the fee applies. This creates a strong incentive to stay in the US during the transition.',
    },
    impact_story: 'Priya is a software engineer in Hyderabad who received an H-1B offer from a startup in Austin. Under the new proclamation, her employer must pay $100,000 just for the visa petition — on top of $4,000 in existing fees. The 15-person startup had budgeted $15,000 for immigration costs. Meanwhile, Raj, an F-1 student at ASU, can convert to H-1B without the supplemental fee because he\'s already in the US. The two-tier system has fundamentally changed who can access H-1B sponsorship.',
    ai_processed: true,
    related_action_ids: ['act-2', 'act-3'],
    legal_challenges: [
      { case_name: 'ITServe Alliance v. DHS', court: 'U.S. District Court, D.C.', status: 'upheld', ruling_date: '2025-12-19', summary: 'Judge Howell granted government\'s motion for summary judgment, upholding the $100K fee as within presidential authority.' },
      { case_name: 'NASSCOM v. USCIS', court: 'U.S. District Court, S.D.N.Y.', status: 'pending', summary: 'Challenge filed by Indian IT industry association arguing the fee is arbitrary and violates the Administrative Procedure Act. Hearing scheduled March 2026.' },
    ],
    timeline: [
      { date: '2025-09-19', label: 'Signed by President', completed: true },
      { date: '2025-09-21', label: 'Effective — fee collection begins', completed: true },
      { date: '2025-10-15', label: 'First legal challenge filed', completed: true },
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
    summary_ai: 'This agency rule changes how H-1B lottery winners are selected. Instead of random selection, workers offered higher wages get more lottery entries. Level 4 wage earners (highest) get 4 entries (61% selection odds, up from 29%). Level 1 wage earners (entry-level) get 1 entry, dramatically reducing their chances. This means experienced, higher-paid workers are far more likely to get H-1B visas than entry-level hires, fundamentally shifting who employers can realistically sponsor.',
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
      visa_holder: 'If you are an entry-level H-1B applicant (Level 1 wage), your lottery odds drop significantly. Higher-paid applicants at Level 4 get 4x the lottery entries, giving them a 61% chance vs. your ~15%. Consider negotiating a higher salary to improve your odds.',
      small_business: 'Small businesses that typically hire entry-level H-1B workers face much lower lottery success rates. You may need to offer higher wages (Level 3-4) to improve odds, increasing labor costs by 30-50% for sponsored roles.',
      student: 'New graduates entering the H-1B lottery at entry-level wages face dramatically lower selection odds. The wage-based system favors experienced hires. OPT/STEM OPT extension becomes even more critical as a bridge.',
    },
    impact_story: 'Tech company XYZ in Phoenix offered $85,000 to a new graduate — a Level 1 wage. Under the old random lottery, they had a 29% chance. Under the new rule, that drops to about 15%. Meanwhile, a competing offer at $165,000 (Level 4) has a 61% chance. The new system effectively prices out startups and smaller companies from the H-1B market.',
    ai_processed: true,
    related_action_ids: ['act-1'],
    legal_challenges: [],
    timeline: [
      { date: '2025-08-01', label: 'Proposed rule published', completed: true },
      { date: '2025-09-30', label: 'Public comment period closed', completed: true },
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
    summary_ai: 'USCIS now reviews social media profiles for all visa applicants and immigration benefit requests — not just the select categories previously screened. The vetting specifically looks for "anti-American" and "antisemitic" activity, which officials say will be "an overwhelmingly negative factor" in discretionary decisions. All H-1B, H-4, F, M, and J visa applicants are instructed to set social media profiles to public. This affects millions of visa holders and applicants annually.',
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
      visa_holder: 'Your social media profiles are now reviewed as part of any USCIS benefit request. You are instructed to set profiles to public. Posts deemed "anti-American" or "antisemitic" will be a strongly negative factor in any discretionary decision. This applies to H-1B, H-4, and all other visa categories.',
      student: 'International students on F-1 and M-1 visas are subject to expanded social media vetting. The State Department reviews social media during visa interviews, and USCIS reviews during benefit applications like OPT. Set profiles to public before applying.',
    },
    impact_story: 'Ahmed, a PhD student at MIT, had his OPT application delayed by 3 months while USCIS reviewed his social media. A post criticizing US foreign policy was flagged for manual review. His advisor says the uncertainty is driving international students to consider Canada and the UK instead.',
    ai_processed: true,
    related_action_ids: ['act-1'],
    legal_challenges: [
      { case_name: 'ACLU v. DHS', court: 'U.S. District Court, N.D. Cal.', status: 'pending', summary: 'First Amendment challenge arguing that vetting social media for political views violates free speech rights. Preliminary hearing held Feb 2026.' },
    ],
    timeline: [
      { date: '2025-08-01', label: 'Memorandum signed', completed: true },
      { date: '2025-08-19', label: 'USCIS begins expanded vetting', completed: true },
      { date: '2025-12-15', label: 'State Dept extends to all H-1B applicants', completed: true },
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
    summary_ai: 'This executive order created the Department of Government Efficiency (DOGE), tasked with cutting federal spending, modernizing IT, and eliminating regulations. DOGE personnel gained access to agency information systems and began terminating contracts, facilitating mass layoffs, and reorganizing agencies. By early 2026, DOGE actions have affected USAID, HHS, SSA, Education, and GSA — cutting services that millions of Americans depend on, from Social Security processing to student loan management to veterans\' benefits.',
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
      senior: 'SSA staffing cuts are creating delays in Social Security benefit processing. Some field offices have reduced hours. If you\'re applying for benefits or need assistance, expect longer wait times. The SSA phone line wait times have increased from an average of 12 minutes to over 40 minutes.',
      veteran: 'VA has seen contract cancellations affecting telehealth services and some mental health programs. While the Veterans Mental Health Act added funding, DOGE cuts are reducing the staff available to deliver those services. Check with your local VA facility for service availability.',
      student: 'The Department of Education is being reorganized. Six programs are being transferred to other agencies. Student loan servicing may be affected. If you\'re in an income-driven repayment plan, monitor your servicer for any changes to processing.',
      healthcare_worker: 'HHS contract cancellations have affected public health research grants and some CDC programs. Hospital reporting requirements may change as agencies are reorganized.',
      small_business: 'SBA processing times for loans have increased. Some small business assistance programs have been defunded or transferred. Check SBA.gov for current program availability.',
    },
    impact_story: 'Margaret, 72, in Scottsdale relies on Social Security for 80% of her income. When she needed to update her direct deposit information, she waited 2 hours and 15 minutes on the SSA phone line — up from 12 minutes a year ago. Her local SSA field office in Tempe now closes at 2 PM instead of 4 PM due to staffing cuts.',
    ai_processed: true,
    related_action_ids: ['act-5'],
    legal_challenges: [
      { case_name: 'AFGE v. DOGE', court: 'U.S. District Court, D.C.', status: 'pending', summary: 'Federal employee unions challenging mass layoffs as violating civil service protections.' },
      { case_name: 'State of California v. DOGE', court: 'U.S. District Court, N.D. Cal.', status: 'blocked', ruling_date: '2026-01-15', summary: 'Court temporarily blocked certain DOGE contract cancellations affecting Medicaid processing.' },
    ],
    timeline: [
      { date: '2025-01-20', label: 'Executive order signed', completed: true },
      { date: '2025-02-15', label: 'DOGE begins agency access', completed: true },
      { date: '2025-03-01', label: 'First round of contract cancellations', completed: true },
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
    summary_ai: 'The Department of Education is being dismantled through six interagency transfer agreements. Student loan servicing operations are moving to Treasury. Special education oversight goes to HHS. Vocational education transfers to Labor. Pell Grant administration moves to Treasury. This affects 45 million student loan borrowers, 7.5 million students with disabilities, and every university receiving federal financial aid. Processing delays are expected during the transition.',
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
    status_detail: 'Transfers underway. Student loan servicing transition to Treasury ongoing. Expect processing delays through mid-2026.',
    categories: ['education', 'government_spending'],
    affected_personas: ['student', 'parent'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      student: 'Your student loan servicer may change as operations transfer to Treasury. Income-driven repayment recertification timelines may be extended. FAFSA processing may see delays. Monitor StudentAid.gov for updates.',
      parent: 'Parent PLUS loan servicing is part of the transfer. If you\'re applying for financial aid, the FAFSA processing timeline may extend from 3-5 days to 2-4 weeks during the transition period.',
    },
    impact_story: 'The financial aid office at ASU is seeing a 300% increase in student inquiries about loan servicing. Director Sarah Chen says: "Students don\'t know who to call. Their servicer changed, their login doesn\'t work, and recertification deadlines are being missed because the new system isn\'t ready."',
    ai_processed: true,
    related_action_ids: ['act-4'],
    legal_challenges: [
      { case_name: 'NEA v. Department of Education', court: 'U.S. District Court, D.C.', status: 'pending', summary: 'Teachers\' unions challenging transfers as exceeding executive authority without Congressional approval.' },
    ],
    timeline: [
      { date: '2025-05-15', label: 'Interagency agreements announced', completed: true },
      { date: '2025-07-01', label: 'Transfers begin', completed: true },
      { date: '2025-10-01', label: 'Student loan servicing transition starts', completed: true },
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
    summary_raw: 'Presidential proclamation modifying and expanding the US travel ban, updating the lists of countries subject to entry restrictions.',
    summary_ai: 'This proclamation expands the US travel ban to cover nationals from 19 countries, effective January 1, 2026. Full entry suspension applies to Afghanistan, Burma, Chad, Republic of Congo, Equatorial Guinea, Eritrea, Haiti, Iran, Libya, Somalia, Sudan, and Yemen. Partial suspension (certain visa categories only) applies to Burundi, Cuba, Laos, Sierra Leone, Togo, Turkmenistan, and Venezuela. Existing valid visas are not immediately revoked, but renewals may be denied.',
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
      visa_holder: 'If you are a national of one of the 19 listed countries, you may be unable to obtain new visas or renew existing ones depending on your country and visa category. Existing valid visas are not immediately revoked. Check with an immigration attorney for your specific situation.',
      student: 'International students from affected countries may face visa renewal challenges. If you are currently in the US on a valid F-1, your status is not immediately affected, but leaving and re-entering may be restricted. Universities are providing guidance.',
    },
    impact_story: 'Fatima, a PhD candidate at the University of Michigan from Yemen, planned to visit her family during winter break. Under the expanded ban, she cannot re-enter the US if she leaves. She hasn\'t seen her family in 3 years. Her university\'s international student office is advising all students from affected countries to remain in the US.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [
      { case_name: 'IRAP v. Trump', court: 'U.S. Court of Appeals, 4th Circuit', status: 'pending', summary: 'Challenge arguing the expanded ban exceeds presidential authority and discriminates based on nationality.' },
    ],
    timeline: [
      { date: '2025-12-16', label: 'Proclamation signed', completed: true },
      { date: '2026-01-01', label: 'Ban takes effect', completed: true },
      { date: '2026-01-20', label: 'Legal challenges filed', completed: true },
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
    summary_raw: 'Executive order imposing reciprocal tariffs on over 60 countries to boost US manufacturing.',
    summary_ai: 'This executive order imposed "reciprocal tariffs" on imports from over 60 countries, with rates ranging from 10% to 50% depending on the country. China faces an effective tariff rate of 145% on most goods. The tariffs apply to consumer electronics, clothing, auto parts, food imports, building materials, and industrial supplies. The administration projects $600 billion in annual tariff revenue but economists estimate consumer prices will rise 2-4% on average, costing the typical American household $1,500-$3,800 per year in higher prices.',
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
    status_detail: 'In effect. Some country-specific rates adjusted through bilateral negotiations. China tariffs escalated.',
    categories: ['economy', 'trade', 'government_spending'],
    affected_personas: ['small_business', 'parent', 'senior', 'gig_worker'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      small_business: 'Businesses importing goods face 10-50% higher input costs. Retailers, restaurants, and manufacturers are most affected. Small businesses lack the buying power to absorb tariffs and are passing costs to consumers. Average small business cost increase estimated at $12,000-$45,000/year.',
      parent: 'Consumer prices are rising across categories. Clothing, toys, electronics, and food are all affected. The typical family of four may see $2,000-$3,800 in additional annual costs. Children\'s products from China face the highest tariff rates.',
      senior: 'Fixed-income seniors are disproportionately affected by price increases. Prescription drugs manufactured abroad may see price increases. Household goods and food prices have risen 3-5% since tariffs took effect.',
      gig_worker: 'Independent contractors who purchase supplies and equipment face higher costs. Delivery drivers see increased vehicle maintenance costs due to tariffed auto parts. These costs are not reimbursable for most gig workers.',
    },
    impact_story: 'Rosa\'s bakery in San Antonio imports specialty chocolate from Belgium and vanilla from Madagascar. Tariffs have increased her ingredient costs by 28%. She raised cupcake prices from $4 to $5, and lost 15% of her customers. Meanwhile, her competitor who uses domestic ingredients gained market share. Rosa is considering switching suppliers but domestic alternatives cost 20% more than her pre-tariff imports.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [
      { case_name: 'U.S. Chamber of Commerce v. USTR', court: 'U.S. Court of International Trade', status: 'pending', summary: 'Business groups challenging tariff authority arguing it exceeds the scope of IEEPA.' },
    ],
    timeline: [
      { date: '2025-04-02', label: '"Liberation Day" — tariffs announced', completed: true },
      { date: '2025-04-09', label: 'Tariffs take effect', completed: true },
      { date: '2025-07-01', label: 'China tariffs escalated to 145%', completed: true },
      { date: '2025-10-15', label: 'Some bilateral negotiations begin', completed: true },
      { date: '2026-03-01', label: 'Court of International Trade challenge', completed: false },
    ],
    source_url: 'https://www.whitehouse.gov/presidential-actions/',
    source_api: 'federal_register',
  },
  {
    id: 'act-8',
    action_id: 'court-harvard-funding',
    action_type: 'court_ruling',
    title: 'Court Blocks Administration\'s Freeze on Harvard Research Grants',
    summary_raw: 'U.S. District Court in Boston ruled that the administration\'s actions against Harvard University violated the First Amendment and APA.',
    summary_ai: 'A federal judge in Boston ruled that freezing and canceling over $2 billion in Harvard University research grants was unconstitutional. The court found the actions violated the First Amendment (academic freedom), Title VI, and the Administrative Procedure Act. This ruling has implications for all universities facing similar federal funding threats. The government has appealed, and the case is being watched as a test of executive power over higher education funding.',
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
    status_detail: 'Ruling stands. Government has appealed to First Circuit. Grants temporarily restored.',
    categories: ['education', 'government_spending'],
    affected_personas: ['student', 'healthcare_worker'],
    impact_level: 'medium',
    state_relevance: ['MA', 'CA', 'NY', 'CT', 'PA', 'IL'],
    impact_personas: {
      student: 'If your university has faced federal funding threats, this ruling provides legal precedent for protection. Research assistantships funded by federal grants are more secure following this decision. However, the appeal creates ongoing uncertainty.',
      healthcare_worker: 'NIH-funded medical research at universities is protected by this ruling. Ongoing clinical trials that were at risk of losing funding can continue. But the appeal means this could change.',
    },
    impact_story: 'Dr. Chen\'s cancer research lab at Harvard had its $4.2 million NIH grant frozen overnight. Three postdocs were told to stop working. After the court ruling, funding was restored, but the 3-month interruption set the research back by a year. Similar labs at Columbia, Stanford, and MIT watched closely.',
    ai_processed: true,
    related_action_ids: ['act-4'],
    legal_challenges: [],
    timeline: [
      { date: '2025-06-01', label: 'Administration freezes Harvard grants', completed: true },
      { date: '2025-07-15', label: 'Harvard files lawsuit', completed: true },
      { date: '2025-09-03', label: 'Court rules in Harvard\'s favor', completed: true },
      { date: '2025-09-15', label: 'Government appeals to First Circuit', completed: true },
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
    summary_raw: 'Executive order establishing a National Center for Warrior Independence to support veteran transition and self-sufficiency.',
    summary_ai: 'This executive order creates a National Center for Warrior Independence within the VA to help veterans transition to civilian life. It directs the VA to streamline disability claims processing (targeting 90-day average from current 150+ days), expands telehealth access to rural veterans, and creates partnerships with employers for veteran hiring. The order also directs a review of all VA programs for efficiency and consolidation.',
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
    status_detail: 'National Center established. Claims processing target not yet met (current avg: 120 days, down from 150).',
    categories: ['veterans', 'healthcare', 'labor'],
    affected_personas: ['veteran'],
    impact_level: 'medium',
    state_relevance: [],
    impact_personas: {
      veteran: 'Disability claims processing is being accelerated — target is 90 days average, down from 150+. Currently at 120 days average. Telehealth access is expanding, especially for rural veterans. New employer partnerships are being established for transition support. The National Center for Warrior Independence is now operational.',
    },
    impact_story: 'Jake, a Marine veteran in rural Arizona, waited 8 months for his disability claim to be processed. Under the new streamlined system, recent claims are being processed in 4 months on average. Jake can now also access VA mental health counseling via telehealth instead of driving 90 minutes to the nearest VA facility.',
    ai_processed: true,
    related_action_ids: [],
    legal_challenges: [],
    timeline: [
      { date: '2025-05-09', label: 'Executive order signed', completed: true },
      { date: '2025-07-01', label: 'National Center established', completed: true },
      { date: '2025-10-01', label: 'Claims processing reforms begin', completed: true },
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
    summary_raw: 'Proposed rule from Department of Labor revising the test for determining independent contractor status under the FLSA.',
    summary_ai: 'The Department of Labor proposes a new 6-factor "economic reality" test for classifying workers as independent contractors vs. employees. The proposed rule would make it harder for companies to classify workers as independent contractors by weighing factors like the degree of control, opportunity for profit/loss, and permanency of the relationship. This could reclassify millions of gig workers (Uber, DoorDash, Instacart drivers, freelancers) as employees, entitling them to minimum wage, overtime, and benefits. The public comment period is open through April 2026.',
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
    status_detail: 'Public comment period open through April 30, 2026. 45,000 comments received so far.',
    categories: ['labor', 'economy'],
    affected_personas: ['gig_worker', 'small_business'],
    impact_level: 'high',
    state_relevance: [],
    impact_personas: {
      gig_worker: 'If finalized, you may be reclassified as an employee. This means you\'d gain minimum wage protections, overtime pay, workers\' comp, and potentially employer-provided benefits. However, you may lose scheduling flexibility. You can submit a public comment to share your views — the comment period is open through April 30, 2026.',
      small_business: 'If you use independent contractors, the new test may require reclassifying them as employees. This could increase labor costs 20-30% per worker (taxes, benefits, workers\' comp). Review your contractor relationships now. Submit a public comment to share business impact.',
    },
    impact_story: 'Maria drives for DoorDash and Uber in Mesa, AZ, earning $1,800/month on her own schedule while caring for her two kids. As an employee, she\'d gain health insurance and guaranteed minimum wage — but might lose the ability to set her own hours. She\'s one of 59 million Americans in the gig economy watching this rule.',
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

let savedActionIds = new Set<string>()

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getActions(filters: {
  type?: ActionType | 'all'
  category?: string
  persona?: string
  state?: string
  search?: string
  page?: number
} = {}): Promise<{ actions: GovernmentAction[]; total: number; page: number; pageSize: number }> {
  await delay(400)

  let filtered = [...MOCK_ACTIONS]

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((a) => a.action_type === filters.type)
  }
  if (filters.category) {
    filtered = filtered.filter((a) => a.categories.includes(filters.category!))
  }
  if (filters.persona) {
    filtered = filtered.filter((a) => a.affected_personas.includes(filters.persona!))
  }
  if (filters.state) {
    filtered = filtered.filter(
      (a) => a.state_relevance.length === 0 || a.state_relevance.includes(filters.state!)
    )
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary_ai.toLowerCase().includes(q) ||
        a.categories.some((c) => c.includes(q))
    )
  }

  // Sort by most recent
  filtered.sort((a, b) => {
    const dateA = a.effective_date || a.signing_date || a.publication_date
    const dateB = b.effective_date || b.signing_date || b.publication_date
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const page = filters.page ?? 1
  const pageSize = 10
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return { actions: paged, total: filtered.length, page, pageSize }
}

export async function getActionDetail(actionId: string): Promise<GovernmentAction | null> {
  await delay(300)
  return MOCK_ACTIONS.find((a) => a.id === actionId) ?? null
}

export async function getActionImpact(
  actionId: string,
  personas: string[]
): Promise<Record<string, string>> {
  await delay(500)
  const action = MOCK_ACTIONS.find((a) => a.id === actionId)
  if (!action) return {}

  const result: Record<string, string> = {}
  for (const p of personas) {
    result[p] = action.impact_personas[p] ?? 'No specific impact analysis available for this persona.'
  }
  return result
}

export async function getActionStory(actionId: string): Promise<string> {
  await delay(400)
  const action = MOCK_ACTIONS.find((a) => a.id === actionId)
  return action?.impact_story ?? 'No impact story available.'
}

export async function chatWithAction(
  actionId: string,
  message: string,
  _history: ChatMessage[]
): Promise<{ response: string }> {
  await delay(800)

  const action = MOCK_ACTIONS.find((a) => a.id === actionId)
  if (!action) return { response: 'Sorry, I could not find that action.' }

  const lowerMsg = message.toLowerCase()

  if (lowerMsg.includes('affect') || lowerMsg.includes('impact') || lowerMsg.includes('apply to me')) {
    return {
      response: `The ${action.title} primarily affects ${action.affected_personas.join(', ')} personas. ${action.summary_ai.split('.').slice(0, 2).join('.')}. Would you like to know about a specific aspect?`,
    }
  }
  if (lowerMsg.includes('exempt') || lowerMsg.includes('exception') || lowerMsg.includes('not apply')) {
    return {
      response: `Good question about exemptions. ${action.summary_ai.split('.').filter(s => s.toLowerCase().includes('exempt') || s.toLowerCase().includes('not')).join('.') || 'The specific exemptions depend on your situation. Could you tell me more about your circumstances?'}`,
    }
  }
  if (lowerMsg.includes('status') || lowerMsg.includes('when') || lowerMsg.includes('effective') || lowerMsg.includes('date')) {
    return {
      response: `Current status: ${action.status_detail}. ${action.effective_date ? `This took effect on ${new Date(action.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.` : ''} ${action.legal_challenges.length > 0 ? `There are ${action.legal_challenges.length} active legal challenge(s) that could affect its status.` : ''}`,
    }
  }
  if (lowerMsg.includes('legal') || lowerMsg.includes('court') || lowerMsg.includes('challenge') || lowerMsg.includes('lawsuit')) {
    if (action.legal_challenges.length === 0) {
      return { response: 'There are no known legal challenges to this action at this time.' }
    }
    const challenges = action.legal_challenges.map(c => `${c.case_name} (${c.court}): ${c.summary}`).join('\n\n')
    return { response: `There are ${action.legal_challenges.length} legal challenge(s):\n\n${challenges}` }
  }
  if (lowerMsg.includes('what can i do') || lowerMsg.includes('options') || lowerMsg.includes('action')) {
    return {
      response: `Here are steps you can consider:\n\n1. Stay informed — track this action in CitizenOS for updates\n2. Contact your representative — share how this affects you\n3. ${action.action_type === 'proposed_rule' ? 'Submit a public comment during the comment period' : 'Follow any legal challenges that may change the status'}\n4. Consult with a relevant professional (immigration attorney, tax advisor, etc.) for your specific situation`,
    }
  }

  return {
    response: `This ${action.action_type.replace('_', ' ')} — "${action.title}" — ${action.summary_ai.split('.').slice(0, 2).join('.')}. What would you like to know specifically?`,
  }
}

export async function saveAction(actionId: string): Promise<void> {
  await delay(200)
  savedActionIds.add(actionId)
}

export async function unsaveAction(actionId: string): Promise<void> {
  await delay(200)
  savedActionIds.delete(actionId)
}

export async function getSavedActions(): Promise<GovernmentAction[]> {
  await delay(300)
  return MOCK_ACTIONS.filter((a) => savedActionIds.has(a.id))
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
  await delay(400)

  let feed = [...MOCK_ACTIONS]

  // Personalize feed
  if (options.personas && options.personas.length > 0) {
    feed = feed.filter((a) =>
      a.affected_personas.some((p) => options.personas!.includes(p))
    )
  }
  if (options.categories && options.categories.length > 0) {
    feed = feed.filter((a) =>
      a.categories.some((c) => options.categories!.includes(c))
    )
  }
  if (options.state) {
    feed = feed.filter(
      (a) => a.state_relevance.length === 0 || a.state_relevance.includes(options.state!)
    )
  }

  // Sort by recency and impact
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
  const action = MOCK_ACTIONS.find((a) => a.id === actionId)
  if (!action) return []
  return MOCK_ACTIONS.filter((a) => action.related_action_ids.includes(a.id))
}
