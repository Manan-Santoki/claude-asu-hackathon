// Personalization engine — maps user profile to relevant content
// This module determines which bills and actions are relevant to a user
// based on their visa status, employment, household, location, and interests.

import type { User } from '@/api/auth'

// ---------------------------------------------------------------------------
// Profile → keyword/category relevance mapping
// ---------------------------------------------------------------------------

// Maps visa statuses to the categories and keywords they care about
const VISA_RELEVANCE: Record<string, { categories: string[]; keywords: string[] }> = {
  f1: { categories: ['immigration', 'education'], keywords: ['student visa', 'f-1', 'opt', 'cpt', 'international student', 'tuition', 'student loan', 'stem opt', 'work authorization'] },
  f2: { categories: ['immigration'], keywords: ['f-2', 'dependent visa', 'immigration'] },
  j1: { categories: ['immigration', 'education'], keywords: ['j-1', 'exchange visitor', 'cultural exchange', 'work authorization'] },
  j2: { categories: ['immigration'], keywords: ['j-2', 'dependent', 'immigration'] },
  h1b: { categories: ['immigration', 'labor', 'economy'], keywords: ['h-1b', 'h1b', 'specialty occupation', 'visa fee', 'work visa', 'immigration reform', 'uscis', 'labor certification'] },
  h4: { categories: ['immigration', 'labor'], keywords: ['h-4', 'dependent', 'ead', 'work authorization', 'immigration'] },
  l1: { categories: ['immigration', 'labor'], keywords: ['l-1', 'intracompany', 'transfer', 'work visa'] },
  o1: { categories: ['immigration', 'labor'], keywords: ['o-1', 'extraordinary ability', 'immigration'] },
  opt: { categories: ['immigration', 'education', 'labor'], keywords: ['opt', 'stem opt', 'practical training', 'f-1', 'work authorization', 'ead'] },
  cpt: { categories: ['immigration', 'education'], keywords: ['cpt', 'curricular practical training', 'f-1'] },
  ead: { categories: ['immigration', 'labor'], keywords: ['ead', 'employment authorization', 'work permit'] },
  tn: { categories: ['immigration', 'labor', 'foreign_policy'], keywords: ['tn', 'nafta', 'usmca', 'trade'] },
  e2: { categories: ['immigration', 'economy'], keywords: ['e-2', 'treaty investor', 'investment visa'] },
  daca: { categories: ['immigration', 'education', 'labor'], keywords: ['daca', 'dreamer', 'deferred action', 'immigration reform'] },
  asylum: { categories: ['immigration'], keywords: ['asylum', 'refugee', 'immigration', 'humanitarian'] },
  undocumented: { categories: ['immigration'], keywords: ['undocumented', 'immigration reform', 'deportation', 'sanctuary'] },
  green_card: { categories: ['immigration'], keywords: ['green card', 'permanent resident', 'naturalization', 'citizenship'] },
}

const EMPLOYMENT_RELEVANCE: Record<string, { categories: string[]; keywords: string[] }> = {
  employed_ft: { categories: ['labor', 'tax', 'healthcare'], keywords: ['employee', 'workplace', 'benefits', 'wage'] },
  employed_pt: { categories: ['labor', 'healthcare'], keywords: ['part-time', 'benefits', 'wage', 'gig'] },
  self_employed: { categories: ['economy', 'tax'], keywords: ['small business', 'self-employed', 'freelance', 'tax deduction', 'business owner'] },
  freelance_gig: { categories: ['labor', 'economy'], keywords: ['gig worker', 'freelance', 'independent contractor', 'classification', 'benefits'] },
  student: { categories: ['education'], keywords: ['student', 'tuition', 'student loan', 'financial aid', 'pell grant', 'college'] },
  student_working: { categories: ['education', 'labor'], keywords: ['student', 'tuition', 'work-study', 'part-time', 'student loan'] },
  unemployed: { categories: ['labor', 'economy'], keywords: ['unemployment', 'job', 'workforce', 'training', 'benefits'] },
  retired: { categories: ['healthcare', 'economy'], keywords: ['retirement', 'social security', 'medicare', 'pension', '401k'] },
  military_active: { categories: ['veterans', 'foreign_policy'], keywords: ['military', 'defense', 'active duty', 'deployment'] },
  military_veteran: { categories: ['veterans', 'healthcare'], keywords: ['veteran', 'va', 'military', 'gi bill', 'ptsd'] },
  homemaker: { categories: ['healthcare', 'education'], keywords: ['caregiver', 'childcare', 'family leave'] },
  disabled: { categories: ['healthcare'], keywords: ['disability', 'ada', 'ssi', 'ssdi', 'accessibility'] },
}

const HOUSEHOLD_RELEVANCE: Record<string, { categories: string[]; keywords: string[] }> = {
  parent: { categories: ['education', 'healthcare', 'tax'], keywords: ['child', 'parent', 'childcare', 'child tax credit', 'school', 'family'] },
  caregiver: { categories: ['healthcare'], keywords: ['caregiver', 'elderly', 'home health', 'medicaid', 'long-term care'] },
  homeowner: { categories: ['housing', 'tax'], keywords: ['homeowner', 'mortgage', 'property tax', 'housing'] },
  renter: { categories: ['housing'], keywords: ['renter', 'rent', 'tenant', 'eviction', 'housing affordability'] },
  college_debt: { categories: ['education', 'economy'], keywords: ['student loan', 'student debt', 'loan forgiveness', 'repayment', 'interest rate'] },
  small_business: { categories: ['economy', 'tax'], keywords: ['small business', 'sba', 'business tax', 'payroll'] },
  receives_benefits: { categories: ['government_spending', 'healthcare'], keywords: ['snap', 'medicaid', 'ssi', 'social security', 'benefits', 'welfare'] },
  uninsured: { categories: ['healthcare'], keywords: ['uninsured', 'insurance', 'aca', 'marketplace', 'coverage'] },
  union_member: { categories: ['labor'], keywords: ['union', 'collective bargaining', 'nlrb', 'labor rights'] },
  gun_owner: { categories: ['gun_policy'], keywords: ['gun', 'firearm', 'second amendment', 'background check'] },
  farmer: { categories: ['economy', 'climate'], keywords: ['farm', 'agriculture', 'usda', 'crop', 'subsidy'] },
}

const AGE_RELEVANCE: Record<string, { categories: string[]; keywords: string[] }> = {
  '18_24': { categories: ['education'], keywords: ['student', 'young adult', 'college'] },
  '25_34': { categories: ['housing', 'labor'], keywords: ['first-time buyer', 'student loan', 'career'] },
  '65_plus': { categories: ['healthcare', 'economy'], keywords: ['senior', 'medicare', 'social security', 'retirement'] },
}

// ---------------------------------------------------------------------------
// Core matching
// ---------------------------------------------------------------------------

export interface UserRelevance {
  categories: string[]
  keywords: string[]
  personas: string[]
}

/** Build a relevance profile from the user's onboarding data */
export function buildUserRelevance(user: User, profiles: string[], categories: string[]): UserRelevance {
  const allCategories = new Set<string>(categories)
  const allKeywords = new Set<string>()
  const allPersonas = new Set<string>(profiles)

  // Visa
  if (user.visa_status && VISA_RELEVANCE[user.visa_status]) {
    const r = VISA_RELEVANCE[user.visa_status]
    r.categories.forEach((c) => allCategories.add(c))
    r.keywords.forEach((k) => allKeywords.add(k))
  }

  // Employment
  if (user.employment_status && EMPLOYMENT_RELEVANCE[user.employment_status]) {
    const r = EMPLOYMENT_RELEVANCE[user.employment_status]
    r.categories.forEach((c) => allCategories.add(c))
    r.keywords.forEach((k) => allKeywords.add(k))
  }

  // Household
  if (user.household) {
    for (const h of user.household) {
      if (HOUSEHOLD_RELEVANCE[h]) {
        const r = HOUSEHOLD_RELEVANCE[h]
        r.categories.forEach((c) => allCategories.add(c))
        r.keywords.forEach((k) => allKeywords.add(k))
      }
    }
  }

  // Age
  if (user.age_group && AGE_RELEVANCE[user.age_group]) {
    const r = AGE_RELEVANCE[user.age_group]
    r.categories.forEach((c) => allCategories.add(c))
    r.keywords.forEach((k) => allKeywords.add(k))
  }

  return {
    categories: [...allCategories],
    keywords: [...allKeywords],
    personas: [...allPersonas],
  }
}

/** Score how relevant a piece of content is to the user (0–100) */
export function scoreRelevance(
  relevance: UserRelevance,
  content: {
    categories: string[]
    title: string
    summary: string
    affected_personas?: string[]
    impact_level?: string
    state_relevance?: string[]
  },
  userState?: string
): number {
  let score = 0

  // Category overlap (max 40 pts)
  const catOverlap = content.categories.filter((c) => relevance.categories.includes(c)).length
  score += Math.min(catOverlap * 15, 40)

  // Keyword match in title+summary (max 30 pts)
  const text = `${content.title} ${content.summary}`.toLowerCase()
  let keywordHits = 0
  for (const kw of relevance.keywords) {
    if (text.includes(kw.toLowerCase())) keywordHits++
  }
  score += Math.min(keywordHits * 10, 30)

  // Persona match (max 15 pts)
  if (content.affected_personas) {
    const personaOverlap = content.affected_personas.filter((p) => relevance.personas.includes(p)).length
    score += Math.min(personaOverlap * 8, 15)
  }

  // State relevance (5 pts)
  if (userState && content.state_relevance && content.state_relevance.includes(userState)) {
    score += 5
  }

  // Impact level bonus (max 10 pts)
  if (content.impact_level === 'high') score += 10
  else if (content.impact_level === 'medium') score += 5

  return Math.min(score, 100)
}

/** Build a short reason why this content is relevant to the user */
export function buildRelevanceReason(
  relevance: UserRelevance,
  content: {
    categories: string[]
    title: string
    summary: string
    affected_personas?: string[]
  }
): string {
  const reasons: string[] = []

  const text = `${content.title} ${content.summary}`.toLowerCase()

  // Check keyword matches for a human-readable reason
  for (const kw of relevance.keywords) {
    if (text.includes(kw.toLowerCase())) {
      reasons.push(kw)
      if (reasons.length >= 2) break
    }
  }

  if (reasons.length > 0) {
    return `Relevant to you: ${reasons.join(', ')}`
  }

  // Fall back to category match
  const matchedCats = content.categories.filter((c) => relevance.categories.includes(c))
  if (matchedCats.length > 0) {
    return `Matches your interest in ${matchedCats.join(', ')}`
  }

  return 'May be relevant to you'
}
