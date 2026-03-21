import { setAuthToken, clearAuthToken } from './insforge'

export interface User {
  id: string
  email: string
  name: string
  state_code?: string
  zip_code?: string
}

const USERS_KEY = 'citizenos_users'
const CURRENT_USER_KEY = 'citizenos_current_user'
const PROFILES_KEY = 'citizenos_profiles'
const CATEGORIES_KEY = 'citizenos_categories'

function getUsers(): Record<string, { user: User; password: string }> {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? JSON.parse(raw) : {}
}

function saveUsers(users: Record<string, { user: User; password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export async function signup(email: string, password: string, name: string): Promise<User> {
  const users = getUsers()
  if (users[email]) throw new Error('User already exists')
  const user: User = { id: crypto.randomUUID(), email, name }
  users[email] = { user, password }
  saveUsers(users)
  const token = btoa(JSON.stringify({ email, id: user.id }))
  setAuthToken(token)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

export async function login(email: string, password: string): Promise<User> {
  const users = getUsers()
  const entry = users[email]
  if (!entry || entry.password !== password) throw new Error('Invalid credentials')
  const token = btoa(JSON.stringify({ email, id: entry.user.id }))
  setAuthToken(token)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(entry.user))
  return entry.user
}

export async function logout() {
  clearAuthToken()
  localStorage.removeItem(CURRENT_USER_KEY)
}

export async function getProfile(): Promise<{ user: User; profiles: string[]; categories: string[] } | null> {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) return null
  const user: User = JSON.parse(raw)
  const profiles: string[] = JSON.parse(localStorage.getItem(`${PROFILES_KEY}_${user.id}`) || '[]')
  const categories: string[] = JSON.parse(localStorage.getItem(`${CATEGORIES_KEY}_${user.id}`) || '[]')
  return { user, profiles, categories }
}

export async function saveOnboarding(stateCode: string, zipCode: string, profiles: string[], categories: string[]) {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) throw new Error('Not authenticated')
  const user: User = JSON.parse(raw)
  user.state_code = stateCode
  user.zip_code = zipCode
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  const users = getUsers()
  if (users[user.email]) {
    users[user.email].user = user
    saveUsers(users)
  }
  localStorage.setItem(`${PROFILES_KEY}_${user.id}`, JSON.stringify(profiles))
  localStorage.setItem(`${CATEGORIES_KEY}_${user.id}`, JSON.stringify(categories))
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function hasCompletedOnboarding(): boolean {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) return false
  const user: User = JSON.parse(raw)
  return !!user.state_code
}
