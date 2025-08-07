'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingsState {
  apiBaseUrl: string
  apiKey: string
  setApiBaseUrl: (url: string) => void
  setApiKey: (key: string) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiBaseUrl: '',
      apiKey: '',
      setApiBaseUrl: (url) => set({ apiBaseUrl: url.trim() }),
      setApiKey: (key) => set({ apiKey: key.trim() }),
      reset: () => set({ apiBaseUrl: '', apiKey: '' }),
    }),
    {
      name: 'breezie-settings',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ apiBaseUrl: state.apiBaseUrl, apiKey: state.apiKey }),
    }
  )
)

