'use client'

import { useEffect } from 'react'
import { type ReactNode } from 'react'
import { useAuthStore } from '@/store/auth'
import { useSupabaseStore } from '@/store/supabase'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { setSession, setLoading } = useAuthStore()
  const { isReady } = useSupabaseStore()

  useEffect(() => {
    if (!isReady()) {
      setLoading(false)
      return
    }

    let mounted = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        const client = getSupabaseClient()

        // Get initial session
        const { data: { session }, error } = await client.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else if (mounted) {
          setSession(session)
        }

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange(
          async (event, session) => {
            if (mounted) {
              console.log('Auth state change:', event, session?.user?.email)
              setSession(session)
              
              // Handle different auth events
              switch (event) {
                case 'SIGNED_IN':
                  console.log('User signed in')
                  break
                case 'SIGNED_OUT':
                  console.log('User signed out')
                  break
                case 'TOKEN_REFRESHED':
                  console.log('Token refreshed')
                  break
                case 'USER_UPDATED':
                  console.log('User updated')
                  break
              }
            }
          }
        )

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const cleanup = initializeAuth()

    return () => {
      mounted = false
      cleanup.then(cleanupFn => cleanupFn && cleanupFn())
    }
  }, [isReady, setSession, setLoading])

  return <>{children}</>
}