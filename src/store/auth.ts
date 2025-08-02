import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  googleClientId: string
  setUser: (user: User | null) => void
  setGoogleClientId: (clientId: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      googleClientId: '',
      
      setUser: (user) => set({ 
        user, 
        isLoggedIn: !!user 
      }),
      
      setGoogleClientId: (clientId) => set({ 
        googleClientId: clientId 
      }),
      
      logout: () => set({ 
        user: null, 
        isLoggedIn: false 
      })
    }),
    {
      name: 'auth-storage',
    }
  )
)