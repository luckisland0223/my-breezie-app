'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import { RefreshCw, Wifi, WifiOff, Cloud, CheckCircle } from 'lucide-react'
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
      } else {
        toast.error('Failed to sync data')
      }
    } catch (error) {
      console.error('Manual sync error:', error)
      toast.error('Sync failed')
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <Badge variant="secondary" className="text-xs">
        <WifiOff className="w-3 h-3 mr-1" />
        Local Mode
      </Badge>
    )
  }

  const formatLastSync = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isOnline ? "default" : "secondary"} 
        className="text-xs"
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3 mr-1" />
            Cloud Sync
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </>
        )}
      </Badge>
      
      {lastSyncTime && (
        <Badge variant="outline" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          {formatLastSync(lastSyncTime)}
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isSyncing || !isOnline}
        className="h-6 px-2"
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}