import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Sync user data from database
async function syncUserDataFromDatabase(userId: string) {
  try {
    // Import the emotion store dynamically to avoid circular dependency
    const { useEmotionStore } = await import('./emotion')
    const loadUserRecordsFromDatabase = useEmotionStore.getState().loadUserRecordsFromDatabase
    
    // Load user-specific emotion records
    await loadUserRecordsFromDatabase(userId)
    
    // Try to sync other data if the API exists
    try {
      const response = await fetch(`/api/sync?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        // Handle other sync data if needed
      }
    } catch (error) {
      // Sync API might not exist, which is fine
    }
  } catch (error) {
    console.error('Failed to sync user data:', error)
  }
}

export interface User {
  id: string
  email?: string
  user_name?: string
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
            user_name: session.user.user_metadata?.user_name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at
          }
          set({ 
            session, 
            user, 
            isLoggedIn: true,
            isLoading: false
          })
          
          // Sync user data from database
          syncUserDataFromDatabase(user.id)
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
      
      logout: async () => {
        // Call logout API
        try {
          await fetch('/api/auth/signout', { method: 'POST' })
        } catch (error) {
    
        }
        
        // Clear local storage
        localStorage.removeItem('breezie_current_user')
        localStorage.removeItem('breezie_session')
        
        set({ 
          user: null, 
          isLoggedIn: false,
          session: null,
          isLoading: false
        })
      },

      initializeAuth: () => {
        try {
          const savedUser = localStorage.getItem('breezie_current_user')
          const savedSession = localStorage.getItem('breezie_session')
          
          if (savedUser && savedSession) {
            const user = JSON.parse(savedUser)
            const session = JSON.parse(savedSession)
            
            // Check if session is still valid (basic check)
            const sessionExpiry = new Date(session.expires_at || session.expires_in)
            const now = new Date()
            
            if (sessionExpiry > now || !session.expires_at) {
              set({ 
                user, 
                session,
                isLoggedIn: true,
                isLoading: false
              })
              
              // Sync data from database
              syncUserDataFromDatabase(user.id)
            } else {
              // Session expired, clear it
              localStorage.removeItem('breezie_current_user')
              localStorage.removeItem('breezie_session')
              set({ isLoading: false })
            }
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
      
          localStorage.removeItem('breezie_current_user')
          localStorage.removeItem('breezie_session')
          set({ isLoading: false })
        }
      },
      
      getDisplayName: () => {
        const { user } = get()
        return user?.user_name || user?.email?.split('@')[0] || 'User'
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