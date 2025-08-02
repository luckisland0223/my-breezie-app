import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SupabaseConfig {
  url: string
  anonKey: string
  isConfigured: boolean
}

interface SupabaseStore {
  config: SupabaseConfig
  setConfig: (url: string, anonKey: string) => void
  clearConfig: () => void
  isReady: () => boolean
}

const defaultConfig: SupabaseConfig = {
  url: '',
  anonKey: '',
  isConfigured: false
}

export const useSupabaseStore = create<SupabaseStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      
      setConfig: (url: string, anonKey: string) => {
        const trimmedUrl = url.trim()
        const trimmedKey = anonKey.trim()
        set({
          config: {
            url: trimmedUrl,
            anonKey: trimmedKey,
            isConfigured: !!(trimmedUrl && trimmedKey)
          }
        })
      },
      
      clearConfig: () => {
        set({ config: defaultConfig })
      },
      
      isReady: () => {
        const { config } = get()
        return config.isConfigured && !!config.url && !!config.anonKey
      }
    }),
    {
      name: 'supabase-config'
    }
  )
)