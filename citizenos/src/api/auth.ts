import { insforge } from '@/lib/insforge'

export interface User {
  id: string
  email: string
  name: string
  state_code?: string
  zip_code?: string
  visa_status?: string
  employment_status?: string
  age_group?: string
  household?: string[]
  onboarding_completed?: boolean
}

// ---------------------------------------------------------------------------
// Helpers — map InsForge user to our User interface
// ---------------------------------------------------------------------------

function mapUser(insforgeUser: { id: string; email: string; profile?: Record<string, unknown> | null }): User {
  const profile = insforgeUser.profile ?? {}
  return {
    id: insforgeUser.id,
    email: insforgeUser.email,
    name: (profile.name as string) ?? '',
    state_code: (profile.state_code as string) ?? undefined,
    zip_code: (profile.zip_code as string) ?? undefined,
    visa_status: (profile.visa_status as string) ?? undefined,
    employment_status: (profile.employment_status as string) ?? undefined,
    age_group: (profile.age_group as string) ?? undefined,
    household: (profile.household as string[]) ?? undefined,
    onboarding_completed: (profile.onboarding_completed as boolean) ?? false,
  }
}

// ---------------------------------------------------------------------------
// Auth API — backed by InsForge
// ---------------------------------------------------------------------------

export async function signup(email: string, password: string, name: string): Promise<User> {
  const { data, error } = await insforge.auth.signUp({ email, password, name })
  if (error) throw new Error(error.message ?? 'Signup failed')
  if (!data?.user) throw new Error('Signup failed — no user returned')
  return mapUser(data.user)
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await insforge.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message ?? 'Invalid credentials')
  if (!data?.user) throw new Error('Login failed — no user returned')
  return mapUser(data.user)
}

export async function loginWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/dashboard`
  const { error } = await insforge.auth.signInWithOAuth({
    provider: 'google',
    redirectTo,
  })
  if (error) throw new Error(error.message ?? 'Google sign-in failed')
}

export async function loginWithGitHub(): Promise<void> {
  const redirectTo = `${window.location.origin}/dashboard`
  const { error } = await insforge.auth.signInWithOAuth({
    provider: 'github',
    redirectTo,
  })
  if (error) throw new Error(error.message ?? 'GitHub sign-in failed')
}

export async function logout() {
  await insforge.auth.signOut()
}

export async function getProfile(): Promise<{ user: User; profiles: string[]; categories: string[] } | null> {
  try {
    // Restore session first (handles OAuth code exchange + cookie refresh)
    const { data: sessionData } = await insforge.auth.getCurrentSession()
    if (!sessionData?.session?.user) return null

    const raw = sessionData.session.user as { id: string; email: string; profile?: Record<string, unknown> | null }
    const user = mapUser(raw)
    const profile = raw.profile ?? {}
    const profiles: string[] = (profile.personas as string[]) ?? []
    const categories: string[] = (profile.categories as string[]) ?? []

    return { user, profiles, categories }
  } catch {
    return null
  }
}

export interface OnboardingData {
  state_code: string
  zip_code: string
  personas: string[]
  categories: string[]
  visa_status?: string
  employment_status?: string
  age_group?: string
  household?: string[]
}

export async function saveOnboarding(data: OnboardingData) {
  const { error } = await insforge.auth.setProfile({
    ...data,
    onboarding_completed: true,
  })
  if (error) throw new Error(error.message ?? 'Failed to save onboarding')
}
