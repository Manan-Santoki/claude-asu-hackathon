const API_BASE = import.meta.env.VITE_INSFORGE_API_BASE_URL || ''

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token')
}

export async function insforgeGet<T>(path: string): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function insforgePost<T>(path: string, body: unknown): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function insforgePut<T>(path: string, body: unknown): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function insforgeDelete<T>(path: string): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
