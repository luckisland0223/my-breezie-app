'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getDbConfig, validateDbConfig } from '@/config/database'
import { CheckCircle, AlertCircle, Settings, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DatabaseConfigStatus() {
  const [config, setConfig] = useState(getDbConfig())
  const [isConfigured, setIsConfigured] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const dbConfig = getDbConfig()
    setConfig(dbConfig)
    setIsConfigured(validateDbConfig(dbConfig))
  }, [])

  if (isConfigured) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Database Configured</strong> - Cloud storage and sync enabled
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Database Not Configured
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700 text-sm">
          Currently using local storage mode. To enable cloud storage and cross-device sync, please configure Supabase database.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://github.com/luckisland0223/my-breezie-app/blob/main/docs/quick_code_setup.md', '_blank')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Setup Guide
          </Button>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-600 font-medium mb-2">Configuration Status:</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Supabase URL:</span>
              <Badge variant={config.supabaseUrl ? "default" : "destructive"}>
                {config.supabaseUrl ? "Set" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>API Key:</span>
              <Badge variant={config.supabaseAnonKey ? "default" : "destructive"}>
                {config.supabaseAnonKey ? "Set" : "Missing"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}