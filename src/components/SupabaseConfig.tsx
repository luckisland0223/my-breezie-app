'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useSupabaseStore } from '@/store/supabase'
import { testSupabaseConnection, resetSupabaseClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Database, CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react'

export function SupabaseConfig() {
  const { config, setConfig, clearConfig, isReady } = useSupabaseStore()
  const [url, setUrl] = useState(config.url)
  const [anonKey, setAnonKey] = useState(config.anonKey)
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      toast.error('Please provide both Supabase URL and API Key')
      return
    }

    setIsLoading(true)
    
    try {
      // Save configuration
      setConfig(url, anonKey)
      resetSupabaseClient() // Reset client to use new config
      
      toast.success('Supabase configuration saved!')
    } catch (error) {
      toast.error('Failed to save configuration')
      console.error('Configuration save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!isReady()) {
      toast.error('Please save configuration first')
      return
    }

    setIsTesting(true)
    
    try {
      const result = await testSupabaseConnection()
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Connection test failed')
      console.error('Connection test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const handleClear = () => {
    clearConfig()
    setUrl('')
    setAnonKey('')
    resetSupabaseClient()
    toast.success('Configuration cleared')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Configuration
          {isReady() ? (
            <Badge variant="default" className="ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              <XCircle className="h-3 w-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How to get your Supabase configuration:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to your <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="h-3 w-3" /></a></li>
            <li>Select your project</li>
            <li>Go to Settings → API</li>
            <li>Copy the "Project URL" and "anon public" API Key</li>
            <li>Make sure you've created the database tables using the provided SQL script</li>
          </ol>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="supabase-url">Supabase Project URL</Label>
            <Input
              id="supabase-url"
              type="url"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="supabase-key">Supabase Anon Key</Label>
            <Input
              id="supabase-key"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Button>
          
          {isReady() && (
            <Button 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              <Database className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
          )}
          
          {isReady() && (
            <Button 
              variant="destructive" 
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Success Message */}
        {isReady() && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">
              <CheckCircle className="h-4 w-4 inline mr-2" />
              Configuration Complete!
            </h3>
            <p className="text-sm text-green-800">
              You can now use email authentication. Make sure your database tables are created using the provided SQL script.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}