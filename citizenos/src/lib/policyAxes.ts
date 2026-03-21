export interface PolicyAxis {
  id: string
  label: string
  question: string
  description: string
}

export const POLICY_AXES: PolicyAxis[] = [
  { id: 'immigration', label: 'Immigration', question: 'The government should provide a path to citizenship for undocumented immigrants', description: 'Immigration policy and border security' },
  { id: 'healthcare', label: 'Healthcare', question: 'The government should provide universal healthcare coverage', description: 'Healthcare access and insurance policy' },
  { id: 'economy', label: 'Economy', question: 'The government should increase regulations on large corporations', description: 'Economic regulation and corporate policy' },
  { id: 'education', label: 'Education', question: 'Public college tuition should be free for all Americans', description: 'Education funding and accessibility' },
  { id: 'climate', label: 'Climate & Energy', question: 'The US should prioritize renewable energy over fossil fuels', description: 'Climate change and energy policy' },
  { id: 'gun_policy', label: 'Gun Policy', question: 'There should be stricter background checks for gun purchases', description: 'Gun control and Second Amendment rights' },
  { id: 'criminal_justice', label: 'Criminal Justice', question: 'The criminal justice system needs major reform to address racial disparities', description: 'Criminal justice reform and policing' },
  { id: 'foreign_policy', label: 'Foreign Policy', question: 'The US should take a more active role in international affairs', description: 'Foreign policy and international relations' },
  { id: 'social_issues', label: 'Social Issues', question: 'The government should protect LGBTQ+ rights through federal legislation', description: 'Social policy and civil rights' },
  { id: 'gov_spending', label: 'Government Spending', question: 'The government should reduce the national debt even if it means cutting programs', description: 'Government spending and fiscal policy' },
]
