'use client'

import { useEffect } from 'react'
import { type ReactNode } from 'react'
import { useAuthStore } from '@/store/auth'

interface AuthProviderProps {
  children: ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    // Initialize authentication from localStorage immediately
    // No loading state needed for localStorage check
    initializeAuth()
  }, [initializeAuth])

  return <>{children}</>
}