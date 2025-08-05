'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Smartphone, 
  Laptop, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database,
  Users,
  MessageCircle,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
  sync_data?: {
    user_id: string
    profile: any
    quick_checks: {
      count: number
      records: any[]
      error: string | null
    }
    conversations: {
      count: number
      records: any[]
      error: string | null
    }
    errors: {
      profile: string | null
      quick_checks: string | null
      conversations: string | null
    }
  }
}

export function CrossDeviceSyncTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testCredentials, setTestCredentials] = useState({ email: '', password: '' })
  const [testResults, setTestResults] = useState<{
    auth?: TestResult
    dataCreation?: TestResult
    syncVerification?: TestResult
  }>({})

  const runTest = async (action: string, credentials?: { email: string; password: string }) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/test-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          ...credentials
        })
      })
      
      const result = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [action === 'test_auth' ? 'auth' : action === 'create_test_data' ? 'dataCreation' : 'syncVerification']: result
      }))
      
      if (result.success) {
        toast.success(`${action} completed successfully`)
      } else {
        toast.error(`${action} failed: ${result.error}`)
      }
      
      return result
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      setTestResults(prev => ({
        ...prev,
        [action === 'test_auth' ? 'auth' : action === 'create_test_data' ? 'dataCreation' : 'syncVerification']: errorResult
      }))
      
      toast.error(`${action} failed`)
      return errorResult
    } finally {
      setIsLoading(false)
    }
  }

  const runFullSyncTest = async () => {
    if (!testCredentials.email || !testCredentials.password) {
      toast.error('Please enter email and password for testing')
      return
    }
    
    toast.info('Starting comprehensive cross-device sync test...')
    
    // Step 1: Test authentication
    const authResult = await runTest('test_auth', testCredentials)
    if (!authResult.success) {
      toast.error('Authentication failed - cannot continue test')
      return
    }
    
    // Step 2: Create test data
    const dataResult = await runTest('create_test_data')
    if (!dataResult.success) {
      toast.error('Data creation failed - sync test incomplete')
      return
    }
    
    // Step 3: Verify sync (simulate accessing from another device)
    const syncResult = await runTest('verify_sync')
    
    if (authResult.success && dataResult.success && syncResult.success) {
      toast.success('🎉 Cross-device sync test completed successfully!', {
        duration: 5000
      })
    } else {
      toast.error('Cross-device sync test completed with issues')
    }
  }

  const getStatusIcon = (result?: TestResult) => {
    if (!result) return <RefreshCw className="h-4 w-4 text-gray-400" />
    return result.success 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (result?: TestResult) => {
    if (!result) return <Badge variant="secondary">Not Started</Badge>
    return result.success 
      ? <Badge variant="default" className="bg-green-500">Success</Badge>
      : <Badge variant="destructive">Failed</Badge>
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Cross-Device Sync Test
        </CardTitle>
        <CardDescription>
          Test that emotion records sync properly across different devices when using the same account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Test Credentials */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-3">Test Credentials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="email"
              placeholder="Test email"
              value={testCredentials.email}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Test password"
              value={testCredentials.password}
              onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
        </div>

        {/* Test Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={runFullSyncTest}
            disabled={isLoading || !testCredentials.email || !testCredentials.password}
            className="flex-1 min-w-[200px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Run Full Sync Test
              </>
            )}
          </Button>
          
          <Button
            onClick={() => runTest('verify_sync')}
            disabled={isLoading}
            variant="outline"
          >
            <Laptop className="h-4 w-4 mr-2" />
            Verify Sync Only
          </Button>
        </div>

        <Separator />

        {/* Test Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>
          
          {/* Authentication Test */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.auth)}
              <div>
                <p className="font-medium">1. Authentication Test</p>
                <p className="text-sm text-gray-600">Verify user can sign in with credentials</p>
              </div>
            </div>
            {getStatusBadge(testResults.auth)}
          </div>
          
          {testResults.auth && (
            <div className="ml-6 p-3 bg-white border rounded text-sm">
              <p><strong>Message:</strong> {testResults.auth.message}</p>
              {testResults.auth.data && (
                <div className="mt-2">
                  <p><strong>User ID:</strong> {testResults.auth.data.user?.id}</p>
                  <p><strong>Email:</strong> {testResults.auth.data.user?.email}</p>
                  <p><strong>Profile:</strong> {testResults.auth.data.profile ? 'Found' : 'Missing'}</p>
                </div>
              )}
              {testResults.auth.error && (
                <p className="text-red-600 mt-2"><strong>Error:</strong> {testResults.auth.error}</p>
              )}
            </div>
          )}

          {/* Data Creation Test */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.dataCreation)}
              <div>
                <p className="font-medium">2. Data Creation Test</p>
                <p className="text-sm text-gray-600">Create test emotion records in split tables</p>
              </div>
            </div>
            {getStatusBadge(testResults.dataCreation)}
          </div>
          
          {testResults.dataCreation && (
            <div className="ml-6 p-3 bg-white border rounded text-sm">
              <p><strong>Message:</strong> {testResults.dataCreation.message}</p>
              {testResults.dataCreation.data && (
                <div className="mt-2 space-y-1">
                  <p><strong>Test ID:</strong> {testResults.dataCreation.data.test_id}</p>
                  <p><strong>Quick Check:</strong> {testResults.dataCreation.data.quick_check ? 'Created' : 'Failed'}</p>
                  <p><strong>Conversation:</strong> {testResults.dataCreation.data.conversation ? 'Created' : 'Failed'}</p>
                  {testResults.dataCreation.data.quick_error && (
                    <p className="text-red-600"><strong>Quick Check Error:</strong> {testResults.dataCreation.data.quick_error}</p>
                  )}
                  {testResults.dataCreation.data.conversation_error && (
                    <p className="text-red-600"><strong>Conversation Error:</strong> {testResults.dataCreation.data.conversation_error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sync Verification Test */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(testResults.syncVerification)}
              <div>
                <p className="font-medium">3. Cross-Device Sync Verification</p>
                <p className="text-sm text-gray-600">Verify data can be retrieved from another device</p>
              </div>
            </div>
            {getStatusBadge(testResults.syncVerification)}
          </div>
          
          {testResults.syncVerification && (
            <div className="ml-6 p-3 bg-white border rounded text-sm">
              <p><strong>Message:</strong> {testResults.syncVerification.message}</p>
              {testResults.syncVerification.sync_data && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium">Profile</p>
                      <p className="text-xs">{testResults.syncVerification.sync_data.profile ? 'Found' : 'Missing'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">Quick Checks</p>
                      <p className="text-xs">{testResults.syncVerification.sync_data.quick_checks.count} records</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="font-medium">Conversations</p>
                      <p className="text-xs">{testResults.syncVerification.sync_data.conversations.count} records</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Instructions */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-2">✅ How Cross-Device Sync Works:</h3>
          <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
            <li>User signs in on Device A → Records emotions</li>
            <li>Data is saved to Supabase with user_id</li>
            <li>User signs in on Device B with same account</li>
            <li>App loads all records for that user_id</li>
            <li>Both devices show the same emotion history</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}