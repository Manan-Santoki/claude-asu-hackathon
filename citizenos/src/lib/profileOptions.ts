export const VISA_OPTIONS = [
  { value: 'us_citizen', label: 'U.S. Citizen' },
  { value: 'green_card', label: 'Green Card (Permanent Resident)' },
  { value: 'f1', label: 'F-1 (Student Visa)' },
  { value: 'f2', label: 'F-2 (Dependent of F-1)' },
  { value: 'j1', label: 'J-1 (Exchange Visitor)' },
  { value: 'j2', label: 'J-2 (Dependent of J-1)' },
  { value: 'h1b', label: 'H-1B (Specialty Occupation)' },
  { value: 'h4', label: 'H-4 (Dependent of H-1B)' },
  { value: 'l1', label: 'L-1 (Intracompany Transfer)' },
  { value: 'o1', label: 'O-1 (Extraordinary Ability)' },
  { value: 'opt', label: 'OPT / STEM OPT' },
  { value: 'cpt', label: 'CPT (Curricular Practical Training)' },
  { value: 'ead', label: 'EAD (Employment Authorization)' },
  { value: 'tn', label: 'TN (NAFTA Professional)' },
  { value: 'e2', label: 'E-2 (Treaty Investor)' },
  { value: 'b1b2', label: 'B-1/B-2 (Visitor)' },
  { value: 'daca', label: 'DACA' },
  { value: 'asylum', label: 'Asylum / Refugee' },
  { value: 'undocumented', label: 'Undocumented' },
  { value: 'other_visa', label: 'Other Visa' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
]

export const EMPLOYMENT_OPTIONS = [
  { value: 'employed_ft', label: 'Employed Full-Time' },
  { value: 'employed_pt', label: 'Employed Part-Time' },
  { value: 'self_employed', label: 'Self-Employed / Business Owner' },
  { value: 'freelance_gig', label: 'Freelance / Gig Worker' },
  { value: 'student', label: 'Student' },
  { value: 'student_working', label: 'Student + Working' },
  { value: 'unemployed', label: 'Unemployed / Job Seeking' },
  { value: 'retired', label: 'Retired' },
  { value: 'military_active', label: 'Active Duty Military' },
  { value: 'military_veteran', label: 'Veteran' },
  { value: 'homemaker', label: 'Homemaker / Caregiver' },
  { value: 'disabled', label: 'Unable to Work / Disability' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
]

export const AGE_OPTIONS = [
  { value: '18_24', label: '18–24' },
  { value: '25_34', label: '25–34' },
  { value: '35_44', label: '35–44' },
  { value: '45_54', label: '45–54' },
  { value: '55_64', label: '55–64' },
  { value: '65_plus', label: '65+' },
  { value: 'prefer_not_say', label: 'Prefer not to say' },
]

export const HOUSEHOLD_OPTIONS = [
  { id: 'parent', label: 'Parent / Guardian' },
  { id: 'caregiver', label: 'Caregiver for elderly / disabled family' },
  { id: 'homeowner', label: 'Homeowner' },
  { id: 'renter', label: 'Renter' },
  { id: 'college_debt', label: 'Student loan debt' },
  { id: 'small_business', label: 'Own / run a small business' },
  { id: 'receives_benefits', label: 'Receive government benefits (SSI, SNAP, Medicaid, etc.)' },
  { id: 'uninsured', label: 'Uninsured / underinsured' },
  { id: 'union_member', label: 'Union member' },
  { id: 'gun_owner', label: 'Gun owner' },
  { id: 'farmer', label: 'Farmer / agricultural worker' },
]

export function getVisaLabel(value?: string): string {
  return VISA_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

export function getEmploymentLabel(value?: string): string {
  return EMPLOYMENT_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

export function getAgeLabel(value?: string): string {
  return AGE_OPTIONS.find((o) => o.value === value)?.label ?? '—'
}

export function getHouseholdLabel(id: string): string {
  return HOUSEHOLD_OPTIONS.find((o) => o.id === id)?.label ?? id
}
