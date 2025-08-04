'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import { getDbConfig, validateDbConfig } from '@/config/database'
import { 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

export function StatusIndicator() {
  const { user, isLoggedIn } = useAuthStore()
  const { isSyncing, syncWithDatabase } = useEmotionStore()
  const [isOnline, setIsOnline] = useState(true)
  const [isDbConfigured, setIsDbConfigured] = useState(false)
  const [syncError, setSyncError] = useState(false)

  useEffect(() => {
    // Check database configuration
    const dbConfig = getDbConfig()
    setIsDbConfigured(validateDbConfig(dbConfig))

    // Check online status
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleQuickSync = async () => {
    if (!user?.id || !isOnline) return
    
    try {
      const success = await syncWithDatabase(user.id)
      if (success) {
        toast.success('Data synced successfully!')
        setSyncError(false)
      } else {
        toast.error('Failed to sync data')
        setSyncError(true)
      }
    } catch (error) {
      console.error('Quick sync error:', error)
      toast.error('Sync failed')
      setSyncError(true)
    }
  }

  // Determine the overall system status
  const getSystemStatus = () => {
    if (!isLoggedIn) {
      return {
        color: 'bg-gray-400',
        icon: CloudOff,
        label: 'Local Mode',
        description: 'Sign in to enable cloud sync'
      }
    }

    if (!isDbConfigured) {
      return {
        color: 'bg-orange-500',
        icon: Settings,
        label: 'Setup Required',
        description: 'Database configuration needed'
      }
    }

    if (!isOnline) {
      return {
        color: 'bg-red-500',
        icon: WifiOff,
        label: 'Offline',
        description: 'No internet connection'
      }
    }

    if (isSyncing) {
      return {
        color: 'bg-blue-500',
        icon: RefreshCw,
        label: 'Syncing',
        description: 'Data sync in progress',
        animate: true
      }
    }

    if (syncError) {
      return {
        color: 'bg-red-500',
        icon: AlertCircle,
        label: 'Sync Error',
        description: 'Click to retry sync'
      }
    }

    return {
      color: 'bg-green-500',
      icon: CheckCircle,
      label: 'All Good',
      description: 'System operating normally'
    }
  }

  const status = getSystemStatus()
  const IconComponent = status.icon

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 relative"
            onClick={syncError ? handleQuickSync : undefined}
            disabled={isSyncing}
          >
            {/* Status dot */}
            <div className={`
              absolute -top-1 -right-1 w-3 h-3 rounded-full ${status.color}
              ${status.animate ? 'animate-pulse' : ''}
            `} />
            
            {/* Icon */}
            <IconComponent 
              className={`
                w-4 h-4 text-gray-600
                ${status.animate ? 'animate-spin' : ''}
              `} 
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end">
          <div className="text-center">
            <div className="font-medium">{status.label}</div>
            <div className="text-xs text-gray-500 mt-1">
              {status.description}
            </div>
            {syncError && (
              <div className="text-xs text-blue-500 mt-1">
                Click to retry
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}