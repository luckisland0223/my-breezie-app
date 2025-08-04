import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  created_at?: string
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  session: any | null
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: any) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initializeAuth: () => void
  
  // Helpers
  getDisplayName: () => string
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      session: null,
      
      setUser: (user) => set({ 
        user, 
        isLoggedIn: !!user 
      }),
      
      setSession: (session) => {
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at
          }
          set({ 
            session, 
            user, 
            isLoggedIn: true,
            isLoading: false
          })
        } else {
          set({ 
            session: null, 
            user: null, 
            isLoggedIn: false,
            isLoading: false
          })
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      logout: () => set({ 
        user: null, 
        isLoggedIn: false,
        session: null,
        isLoading: false
      }),

      initializeAuth: () => {
        try {
          const savedUser = localStorage.getItem('breezie_current_user')
          if (savedUser) {
            const user = JSON.parse(savedUser)
            set({ 
              user, 
              isLoggedIn: true,
              isLoading: false
            })
          }
        } catch (error) {
          console.error('Failed to initialize auth from localStorage:', error)
          set({ isLoading: false })
        }
      },
      
      getDisplayName: () => {
        const { user } = get()
        return user?.full_name || user?.email?.split('@')[0] || 'User'
      },
      
      isAuthenticated: () => {
        const { user, session } = get()
        return !!(user && session)
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn,
        session: state.session
      }),
    }
  )
)