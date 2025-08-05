import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import type { EmotionRecord } from '@/store/emotion'

interface UseEmotionRecordsReturn {
  records: EmotionRecord[]
  loading: boolean
  error: string | null
  refreshRecords: () => Promise<void>
}

export function useEmotionRecords(): UseEmotionRecordsReturn {
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isLoggedIn } = useAuthStore()

  const fetchRecords = async () => {
    if (!isLoggedIn || !user?.id) {
      setRecords([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/emotions-split?userId=${user.id}&recordType=all`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch emotion records')
      }

      const data = await response.json()
      
      if (data.success) {
        // Convert database records to EmotionRecord format
        const convertedRecords: EmotionRecord[] = data.records.map((record: any) => ({
          id: record.id,
          emotion: record.emotion,
          behavioralImpact: record.intensity,
          note: record.note || '',
          timestamp: new Date(record.timestamp),
          recordType: record.recordType,
          emotionEvaluation: record.emotion_evaluation,
          polarityAnalysis: record.polarity_analysis
        }))
        
        setRecords(convertedRecords)
      } else {
        throw new Error('Failed to fetch records')
      }
    } catch (err) {
      console.error('Error fetching emotion records:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Keep existing records on error, don't clear them
      setRecords(prev => prev)
    } finally {
      setLoading(false)
    }
  }

  const refreshRecords = async () => {
    await fetchRecords()
  }

  useEffect(() => {
    fetchRecords()
  }, [isLoggedIn, user?.id])

  // Listen for new emotion records
  useEffect(() => {
    const handleNewRecord = () => {
      fetchRecords()
    }

    window.addEventListener('emotionRecordAdded', handleNewRecord)
    
    return () => {
      window.removeEventListener('emotionRecordAdded', handleNewRecord)
    }
  }, [])

  return {
    records,
    loading,
    error,
    refreshRecords
  }
}

// Re-export useEmotionStore for compatibility, but access the store directly
import { useEmotionStore } from '@/store/emotionDatabase'
export { useEmotionStore }