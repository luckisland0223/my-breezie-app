'use client'

import { useEffect } from 'react'
import { type ReactNode } from 'react'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, setLoading } = useAuthStore()

  useEffect(() => {
    // Initialize authentication from localStorage on app start
    setLoading(true)
    
    // Small delay to ensure localStorage is available
    const timer = setTimeout(() => {
      initializeAuth()
    }, 100)

    return () => clearTimeout(timer)
  }, [initializeAuth, setLoading])

  return <>{children}</>
}