export interface Persona {
  id: string
  label: string
  icon: string
  description: string
}

export const PERSONAS: Persona[] = [
  { id: 'student', label: 'Student', icon: 'GraduationCap', description: 'College or graduate student' },
  { id: 'veteran', label: 'Veteran', icon: 'Shield', description: 'Military veteran or active duty' },
  { id: 'visa_holder', label: 'Visa Holder', icon: 'Globe', description: 'Non-citizen visa holder' },
  { id: 'small_business', label: 'Small Business Owner', icon: 'Store', description: 'Owns or operates a small business' },
  { id: 'senior', label: 'Senior Citizen', icon: 'Heart', description: 'Age 65 or older' },
  { id: 'parent', label: 'Parent', icon: 'Users', description: 'Parent or guardian of children' },
  { id: 'healthcare_worker', label: 'Healthcare Worker', icon: 'Stethoscope', description: 'Works in healthcare industry' },
  { id: 'gig_worker', label: 'Gig Worker', icon: 'Briefcase', description: 'Freelance or gig economy worker' },
]

export function getPersonaById(id: string): Persona | undefined {
  return PERSONAS.find(p => p.id === id)
}
