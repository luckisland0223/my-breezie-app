'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireEmailVerification?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireEmailVerification = false,
  redirectTo 
}: AuthGuardProps) {
  const router = useRouter()
  const { user, token, loading } = useAuthStore()

  useEffect(() => {
    // Don't check during loading
    if (loading) return

    // If auth is required but user is not logged in
    if (requireAuth && !user) {
      router.push(redirectTo || '/login')
      return
    }

    // If email verification is required but user hasn't verified
    if (requireEmailVerification && user && !user.emailVerified) {
      router.push('/verify-email')
      return
    }

    // If user is logged in but doesn't have a token (shouldn't happen in normal flow)
    if (user && !token) {
      router.push('/verify-email')
      return
    }
  }, [user, token, loading, requireAuth, requireEmailVerification, redirectTo, router])

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // If auth is required but user is not logged in, don't render children
  if (requireAuth && !user) {
    return null
  }

  // If email verification is required but user hasn't verified, don't render children
  if (requireEmailVerification && user && !user.emailVerified) {
    return null
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function RequireAuth({ children, redirectTo }: { children: React.ReactNode; redirectTo?: string }) {
  return (
    <AuthGuard requireAuth={true} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  )
}

export function RequireVerifiedEmail({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={true} requireEmailVerification={true}>
      {children}
    </AuthGuard>
  )
}