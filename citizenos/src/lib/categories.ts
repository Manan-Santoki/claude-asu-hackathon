export interface Category {
  id: string
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'immigration', label: 'Immigration' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'economy', label: 'Economy' },
  { id: 'tax', label: 'Tax' },
  { id: 'climate', label: 'Climate & Energy' },
  { id: 'gun_policy', label: 'Gun Policy' },
  { id: 'criminal_justice', label: 'Criminal Justice' },
  { id: 'foreign_policy', label: 'Foreign Policy' },
  { id: 'social_issues', label: 'Social Issues' },
  { id: 'government_spending', label: 'Government Spending' },
  { id: 'veterans', label: 'Veterans' },
  { id: 'housing', label: 'Housing' },
  { id: 'technology', label: 'Technology' },
  { id: 'labor', label: 'Labor' },
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id)
}
