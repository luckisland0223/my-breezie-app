import { createSecureStorage, migrateToEncryptedStorage } from '@/lib/encryptedStorage'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  username: string
  avatarUrl?: string | null
  subscriptionTier: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  error?: string | null
  register: (payload: { email: string; username: string; password: string }) => Promise<boolean>
  login: (payload: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  updateProfile: (updates: Partial<Pick<User, 'username'>>) => void
  isFullyAuthenticated: () => boolean
  isPremiumUser: () => boolean
}

export const useAuthStore = create<AuthState>()(persist((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
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
      
      // Set user and tokens
      set({ 
        user: data.user, 
        token: data.accessToken, 
        refreshToken: data.refreshToken,
        loading: false 
      })
      
      // Migrate to encrypted storage if user and token available
      if (data.user && data.accessToken) {
        try {
          migrateToEncryptedStorage(data.user.id, data.accessToken)
        } catch (error) {
          console.warn('Failed to migrate to encrypted storage:', error)
        }
      }
      
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
      
      // Set user and tokens
      set({ 
        user: data.user, 
        token: data.accessToken, 
        refreshToken: data.refreshToken,
        loading: false 
      })
      
      // Migrate to encrypted storage
      if (data.user && data.accessToken) {
        try {
          migrateToEncryptedStorage(data.user.id, data.accessToken)
        } catch (error) {
          console.warn('Failed to migrate to encrypted storage:', error)
        }
      }
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },

  async logout() {
    const state = get()
    
    // Call logout API to revoke tokens
    if (state.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          }
        })
      } catch (error) {
        console.warn('Logout API call failed:', error)
      }
    }
    
    // Clear encrypted storage if user exists
    if (state.user && state.token) {
      try {
        const secureStorage = createSecureStorage(state.user.id, state.token)
        secureStorage.clear()
      } catch (error) {
        console.warn('Failed to clear encrypted storage:', error)
      }
    }
    
    set({ user: null, token: null, refreshToken: null })
  },
  
  async refreshAuth() {
    const state = get()
    if (!state.refreshToken) return false
    
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.refreshToken })
      })
      
      if (!res.ok) {
        // Refresh failed, clear auth state
        set({ user: null, token: null, refreshToken: null })
        return false
      }
      
      const data = await res.json()
      set({ 
        token: data.accessToken, 
        refreshToken: data.refreshToken 
      })
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      set({ user: null, token: null, refreshToken: null })
      return false
    }
  },

  updateProfile(updates) {
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, ...updates } : null
    }))
  },

  isFullyAuthenticated() {
    const state = get()
    return !!(state.user && state.token)
  },
  
  isPremiumUser() {
    const state = get()
    return state.user?.subscriptionTier === 'pro' || state.user?.subscriptionTier === 'enterprise'
  },
}), { name: 'auth-storage' }))

// Helper to build auth header when available with auto-refresh
export async function getAuthHeaders(): Promise<HeadersInit> {
  let token = useAuthStore.getState().token
  
  // Try to refresh token if not available or expired
  if (!token) {
    const refreshSuccess = await useAuthStore.getState().refreshAuth()
    if (refreshSuccess) {
      token = useAuthStore.getState().token
    }
  }
  
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Synchronous version for backward compatibility
export function getAuthHeadersSync(): HeadersInit {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
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

