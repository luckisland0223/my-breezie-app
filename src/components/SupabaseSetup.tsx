'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useSupabaseStore } from '@/store/supabase'
import { testSupabaseConnection } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Settings, Database, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function SupabaseSetup() {
  const { config, setConfig, isReady } = useSupabaseStore()
  const [url, setUrl] = useState(config.url)
  const [anonKey, setAnonKey] = useState(config.anonKey)
  const [showKey, setShowKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      toast.error('Please provide both URL and API key')
      return
    }

    // Basic URL validation
    try {
      new URL(url.trim())
    } catch {
      toast.error('Please provide a valid URL')
      return
    }

    setConfig(url.trim(), anonKey.trim())
    toast.success('Supabase configuration saved!')
  }

  const handleTest = async () => {
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
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Supabase Configuration
          {isReady() ? (
            <Badge variant="default" className="ml-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabase-url">Supabase URL</Label>
          <Input
            id="supabase-url"
            type="url"
            placeholder="https://your-project.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabase-key">Supabase Anon Key</Label>
          <div className="relative">
            <Input
              id="supabase-key"
              type={showKey ? 'text' : 'password'}
              placeholder="Your public anon key"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTest} 
            disabled={!isReady() || isTesting}
          >
            {isTesting ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Test Connection
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></li>
            <li>Copy your project URL and anon key from Settings → API</li>
            <li>Run the SQL schema from <code>docs/database_schema.sql</code> in your SQL editor</li>
            <li>Enter the credentials above and test the connection</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}