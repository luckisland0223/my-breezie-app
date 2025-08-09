import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string | null
  subscriptionTier: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error?: string | null
  register: (payload: { email: string; username: string; password: string }) => Promise<boolean>
  login: (payload: { email: string; password: string }) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  async register(payload) {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        let errorMessage = data.error || 'Registration failed'
        if (res.status === 409) {
          errorMessage = 'Email or username already exists'
        }
        throw new Error(errorMessage)
      }
      set({ user: data.user, token: data.token, loading: false })
      return true
    } catch (e: any) {
      set({ error: e.message, loading: false })
      return false
    }
  },

  async login(payload) {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      set({ user: data.user, token: data.token, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  logout() {
    set({ user: null, token: null })
  },
}), { name: 'auth-storage' }))

// Helper to build auth header when available
export function getAuthHeaders(): HeadersInit {
  try {
    // dynamic import of state to avoid SSR issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useAuthStore: store } = require('./auth') as typeof import('./auth')
    const token = store.getState().token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

// Save pending emotion record after successful auth
export async function processPendingSave(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem('pending-emotion')
    if (!raw) return false
    const payload = JSON.parse(raw)
    const token = useAuthStore.getState().token
    if (!token) return false
    const res = await fetch('/api/emotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      localStorage.removeItem('pending-emotion')
      return true
    }
    return false
  } catch {
    return false
  }
}

