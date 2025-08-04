import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ApiKeysState {
  geminiApiKey: string
  setGeminiApiKey: (key: string) => void
  clearApiKeys: () => void
  hasGeminiApiKey: () => boolean
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      geminiApiKey: '',
      
      setGeminiApiKey: (key: string) => {
        set({ geminiApiKey: key.trim() })
      },
      
      clearApiKeys: () => {
        set({ geminiApiKey: '' })
      },
      
      hasGeminiApiKey: () => {
        const { geminiApiKey } = get()
        return geminiApiKey.length > 0
      },
    }),
    {
      name: 'breezie-api-keys',
      // Only persist the API keys, not the functions
      partialize: (state) => ({
        geminiApiKey: state.geminiApiKey,
      }),
    }
  )
)