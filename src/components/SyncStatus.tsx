'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import { RefreshCw, Wifi, WifiOff, Cloud, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function SyncStatus() {
  const { user, isLoggedIn } = useAuthStore()
  const { 
    isSyncing, 
    lastSyncTime, 
    syncWithDatabase,
    loadFromDatabase 
  } = useEmotionStore()
  
  const [isOnline, setIsOnline] = useState(true)
  const [syncError, setSyncError] = useState(false)

  useEffect(() => {
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

  const handleManualSync = async () => {
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
      console.error('Manual sync error:', error)
      toast.error('Sync failed')
      setSyncError(true)
    }
  }

  // Don't show any sync info when not logged in
  if (!isLoggedIn || !user) {
    return null
  }

  // Don't show sync status in normal conditions (online, no errors, not syncing)
  if (isOnline && !syncError && !isSyncing) {
    return null
  }

  const formatLastSync = (date: Date | string) => {
    const now = new Date()
    const syncDate = new Date(date)
    const diffMs = now.getTime() - syncDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  // Only show when user attention is needed: syncing, offline, or error
  return (
    <div className="flex items-center gap-2">
              {/* Syncing status */}
      {isSyncing && (
        <Badge variant="default" className="text-xs">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Syncing...
        </Badge>
      )}
      
              {/* Offline status */}
      {!isOnline && (
        <Badge variant="secondary" className="text-xs">
          <WifiOff className="w-3 h-3 mr-1" />
          Offline
        </Badge>
      )}
      
              {/* Sync error status */}
      {syncError && !isSyncing && (
        <Badge variant="destructive" className="text-xs">
          <AlertCircle className="w-3 h-3 mr-1" />
          Sync Failed
        </Badge>
      )}
      
              {/* Manual sync button - only show when error or offline */}
      {(syncError || !isOnline) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSync}
          disabled={isSyncing || !isOnline}
          className="h-6 px-2"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  )
}