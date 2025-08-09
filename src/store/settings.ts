'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Encryption utilities for secure local storage
const ENCRYPTION_KEY = 'breezie-secure-key-2024'

function encryptData(data: string): string {
  try {
    // Simple encryption for demo - in production use proper encryption
    const encrypted = btoa(unescape(encodeURIComponent(data + ENCRYPTION_KEY)))
    return encrypted
  } catch {
    return data
  }
}

function decryptData(encryptedData: string): string {
  try {
    const decrypted = decodeURIComponent(escape(atob(encryptedData)))
    return decrypted.replace(ENCRYPTION_KEY, '')
  } catch {
    return encryptedData
  }
}

interface SettingsState {
  // Remove client-side API key storage for security
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'zh' | 'auto'
  notificationsEnabled: boolean
  dataEncryption: boolean
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: 'en' | 'zh' | 'auto') => void
  setNotifications: (enabled: boolean) => void
  setDataEncryption: (enabled: boolean) => void
  reset: () => void
}

// Secure storage implementation
const secureStorage = {
  getItem: (name: string) => {
    const item = localStorage.getItem(name)
    if (!item) return null
    try {
      const parsed = JSON.parse(item)
      if (parsed.encrypted) {
        return JSON.stringify({
          ...parsed,
          state: JSON.parse(decryptData(parsed.state))
        })
      }
      return item
    } catch {
      return item
    }
  },
  setItem: (name: string, value: string) => {
    try {
      const parsed = JSON.parse(value)
      const encrypted = {
        ...parsed,
        encrypted: true,
        state: encryptData(JSON.stringify(parsed.state))
      }
      localStorage.setItem(name, JSON.stringify(encrypted))
    } catch {
      localStorage.setItem(name, value)
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name)
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'auto',
      notificationsEnabled: true,
      dataEncryption: true,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotifications: (enabled) => set({ notificationsEnabled: enabled }),
      setDataEncryption: (enabled) => set({ dataEncryption: enabled }),
      reset: () => set({ 
        theme: 'system', 
        language: 'auto', 
        notificationsEnabled: true,
        dataEncryption: true 
      }),
    }),
    {
      name: 'breezie-settings',
      storage: createJSONStorage(() => secureStorage),
      version: 2,
      partialize: (state) => ({ 
        theme: state.theme, 
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
        dataEncryption: state.dataEncryption
      }),
    }
  )
)

