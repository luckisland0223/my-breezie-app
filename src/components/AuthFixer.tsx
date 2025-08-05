'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle, Database, RefreshCw, LogIn } from 'lucide-react'
import { toast } from 'sonner'

interface AuthFixerProps {
  onAuthFixed?: () => void
}

export function AuthFixer({ onAuthFixed }: AuthFixerProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [status, setStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'warning'
    message: string
    details?: string
    action?: string
  }>({ type: 'idle', message: 'Click "Fix Authentication" to diagnose issues' })

  const handleFixAuth = async () => {
    setIsChecking(true)
    
    try {
      const response = await fetch('/api/fix-auth', {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Authentication is working correctly!',
          details: `User: ${data.user.email}, Tables: ${data.tables.join(', ')}`
        })
        toast.success('Authentication fixed successfully!')
        onAuthFixed?.()
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Authentication issue detected',
          details: data.message || data.details,
          action: data.action
        })
        
        if (data.action === 'redirect_to_signin') {
          toast.error('Please sign in again', {
            action: {
              label: 'Sign In',
              onClick: () => window.location.href = '/auth/signin'
            }
          })
        } else if (data.action === 'run_sql_script') {
          toast.error('Database tables missing', {
            description: 'Run the SQL script in Supabase',
            duration: 8000
          })
        }
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to check authentication',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      toast.error('Failed to diagnose authentication issue')
    } finally {
      setIsChecking(false)
    }
  }

  const handleSetupFreshDatabase = async () => {
    setIsChecking(true)
    setStatus({ type: 'idle', message: 'Setting up fresh database...' })
    
    try {
      const response = await fetch('/api/setup-fresh-database', {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus({
          type: 'success',
          message: 'Fresh database setup completed!',
          details: `Created: ${data.tables_created.join(', ')}`
        })
        toast.success('Database setup successful! Try using the app now.', {
          duration: 5000
        })
        onAuthFixed?.()
      } else {
        setStatus({
          type: 'error',
          message: 'Failed to setup database',
          details: data.details || data.error
        })
        toast.error('Database setup failed', {
          description: data.details || data.error
        })
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to setup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      toast.error('Database setup failed')
    } finally {
      setIsChecking(false)
    }
  }

  const handleClearAuth = () => {
    // Clear all auth-related localStorage
    localStorage.removeItem('auth-storage')
    localStorage.removeItem('breezie_current_user')
    localStorage.removeItem('breezie_session')
    
    // Clear any Supabase auth tokens
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key)
      }
    })
    
    toast.success('Authentication data cleared')
    setStatus({ type: 'idle', message: 'Authentication data cleared. Please sign in again.' })
    
    // Redirect to sign in after a short delay
    setTimeout(() => {
      window.location.href = '/auth/signin'
    }, 1500)
  }

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Database className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Authentication Issue
        </CardTitle>
        <CardDescription>
          Diagnose and fix authentication problems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{status.message}</p>
            {status.details && (
              <p className="text-xs text-gray-600 mt-1">{status.details}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleFixAuth}
            disabled={isChecking}
            className="w-full"
            variant="default"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Fix Authentication
              </>
            )}
          </Button>

          <Button
            onClick={handleSetupFreshDatabase}
            disabled={isChecking}
            className="w-full"
            variant="destructive"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Setup Fresh Database
              </>
            )}
          </Button>

          <Button
            onClick={handleClearAuth}
            variant="outline"
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Clear Auth & Sign In Again
          </Button>
        </div>

        {status.action === 'run_sql_script' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Quick Fix Available:</p>
            <p className="text-xs text-yellow-700 mt-1">
              Click "Setup Fresh Database" above to automatically create all required tables, or manually run the <code>create_split_tables.sql</code> script in your Supabase SQL Editor.
            </p>
          </div>
        )}
        
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">⚠️ Fresh Database Setup:</p>
          <p className="text-xs text-red-700 mt-1">
            The red "Setup Fresh Database" button will <strong>delete all existing tables</strong> and create fresh ones. This fixes all database issues but removes existing data.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}