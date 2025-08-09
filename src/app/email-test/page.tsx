'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function EmailTestPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  async function testVerificationEmail() {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      const result = {
        timestamp: new Date().toISOString(),
        type: 'Verification Email',
        email,
        success: response.ok,
        status: response.status,
        data,
        id: Date.now()
      }

      setResults(prev => [result, ...prev])

      if (response.ok) {
        toast.success('Verification email sent successfully!')
      } else {
        toast.error(`Failed to send email: ${data.error}`)
      }
    } catch (error: any) {
      const result = {
        timestamp: new Date().toISOString(),
        type: 'Verification Email',
        email,
        success: false,
        error: error.message,
        id: Date.now()
      }
      setResults(prev => [result, ...prev])
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function testHelloEmail() {
    setLoading(true)
    try {
      const response = await fetch('/api/test-email')
      const data = await response.json()
      
      const result = {
        timestamp: new Date().toISOString(),
        type: 'Hello Email',
        email: 'System Test',
        success: response.ok,
        status: response.status,
        data,
        id: Date.now()
      }

      setResults(prev => [result, ...prev])

      if (response.ok) {
        toast.success('Hello email sent successfully!')
      } else {
        toast.error(`Failed to send email: ${data.error}`)
      }
    } catch (error: any) {
      const result = {
        timestamp: new Date().toISOString(),
        type: 'Hello Email',
        email: 'System Test',
        success: false,
        error: error.message,
        id: Date.now()
      }
      setResults(prev => [result, ...prev])
      toast.error('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Service Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page helps test the email functionality. Use it to verify that emails are being sent correctly.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification Email Test */}
            <div className="space-y-3">
              <Label htmlFor="email">Test Verification Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address to test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button 
                onClick={testVerificationEmail} 
                disabled={loading || !email}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Verification Email
              </Button>
            </div>

            {/* Hello Email Test */}
            <div className="space-y-3">
              <Label>Test System Email</Label>
              <p className="text-sm text-gray-600">
                Sends a hello email to the configured address
              </p>
              <Button 
                onClick={testHelloEmail} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Hello Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{result.type}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Email:</strong> {result.email}</p>
                    {result.status && <p><strong>Status:</strong> {result.status}</p>}
                    {result.data?.id && <p><strong>Email ID:</strong> {result.data.id}</p>}
                    {result.error && (
                      <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                    )}
                    {result.data?.error && (
                      <p className="text-red-600"><strong>API Error:</strong> {result.data.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}