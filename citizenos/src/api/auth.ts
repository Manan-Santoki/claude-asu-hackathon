import { insforge } from '@/lib/insforge'

export interface User {
  id: string
  email: string
  name: string
  state_code?: string
  zip_code?: string
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
    const { data, error } = await insforge.auth.getCurrentUser()
    if (error || !data?.user) return null

    const user = mapUser(data.user)
    const profile = (data.user as { profile?: Record<string, unknown> | null }).profile ?? {}
    const profiles: string[] = (profile.personas as string[]) ?? []
    const categories: string[] = (profile.categories as string[]) ?? []

    return { user, profiles, categories }
  } catch {
    return null
  }
}

export async function saveOnboarding(stateCode: string, zipCode: string, profiles: string[], categories: string[]) {
  const { error } = await insforge.auth.setProfile({
    state_code: stateCode,
    zip_code: zipCode,
    personas: profiles,
    categories,
  })
  if (error) throw new Error(error.message ?? 'Failed to save onboarding')
}
