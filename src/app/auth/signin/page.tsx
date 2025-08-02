'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth'
import { Cloud, Key, LogIn, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SignIn() {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setGoogleClientId } = useAuthStore()

  const handleGoogleSignIn = async () => {
    if (!clientId || !clientSecret) {
      toast.error('Please enter both Google Client ID and Client Secret')
      return
    }

    setIsLoading(true)
    
    try {
      // Store the client ID for later use
      setGoogleClientId(clientId)
      
      // Set configuration dynamically
      const response = await fetch('/api/auth/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          clientSecret,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to configure authentication')
      }

      // Wait a bit for config to be set
      await new Promise(resolve => setTimeout(resolve, 500))

      // Initiate Google sign-in
      const result = await signIn('google', {
        callbackUrl: '/',
        redirect: true,
      })

      if (result?.error) {
        toast.error('Sign in failed: ' + result.error)
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Breezie</h1>
          </div>
          <CardTitle>Sign In to Your Account</CardTitle>
          <p className="text-gray-600">
            Enter your Google OAuth credentials to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Google Client ID</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientId"
                type="text"
                placeholder="Your Google Client ID"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientSecret">Google Client Secret</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="clientSecret"
                type="password"
                placeholder="Your Google Client Secret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
            <p className="font-medium mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              How to get Google OAuth credentials:
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <Link href="https://console.cloud.google.com" target="_blank" className="underline font-medium">Google Cloud Console</Link></li>
              <li>Create or select a project</li>
              <li>Navigate to "APIs & Services" → "Credentials"</li>
              <li>Click "Create Credentials" → "OAuth client ID"</li>
              <li>Choose "Web application" as application type</li>
              <li>Add <code className="px-1 py-0.5 bg-blue-100 rounded">http://localhost:3000</code> to authorized origins</li>
              <li>Add <code className="px-1 py-0.5 bg-blue-100 rounded">http://localhost:3000/api/auth/callback/google</code> to redirect URIs</li>
              <li>Copy the Client ID and Client Secret</li>
            </ol>
          </div>

          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading || !clientId || !clientSecret}
            className="w-full"
          >
            {isLoading ? (
              'Signing in...'
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in with Google
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <Link href="/" className="hover:underline">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}