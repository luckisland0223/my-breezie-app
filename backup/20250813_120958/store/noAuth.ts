import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NoAuthUser {
  id: string
  email: string
  username: string
}

interface NoAuthState {
  user: NoAuthUser | null
  loading: boolean
  error: string | null
  
  // Actions
  register: (email: string, username: string, password: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  isLoggedIn: () => boolean
}

export const useNoAuth = create<NoAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      register: async (email: string, username: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch('/api/no-auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Registration failed')
          }

          if (data.success && data.user) {
            set({ 
              user: data.user, 
              loading: false, 
              error: null 
            })
            return true
          } else {
            throw new Error('Invalid response')
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed'
          set({ error: message, loading: false })
          return false
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await fetch('/api/no-auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Login failed')
          }

          if (data.success && data.user) {
            set({ 
              user: data.user, 
              loading: false, 
              error: null 
            })
            return true
          } else {
            throw new Error('Invalid response')
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message, loading: false })
          return false
        }
      },

      logout: () => {
        set({ user: null, error: null })
      },

      clearError: () => {
        set({ error: null })
      },

      isLoggedIn: () => {
        const state = get()
        return !!state.user
      }
    }),
    {
      name: 'no-auth-storage'
    }
  )
)

// 无认证情绪记录管理
interface EmotionState {
  emotions: any[]
  loading: boolean
  
  loadEmotions: (userId: string) => Promise<void>
  createEmotion: (userId: string, emotion: string, impact: number, note: string) => Promise<boolean>
}

export const useNoAuthEmotions = create<EmotionState>((set, get) => ({
  emotions: [],
  loading: false,

  loadEmotions: async (userId: string) => {
    set({ loading: true })
    try {
      const response = await fetch(`/api/no-auth/emotions?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        set({ emotions: data.data, loading: false })
      } else {
        set({ emotions: [], loading: false })
      }
    } catch (error) {
      console.error('Load emotions error:', error)
      set({ emotions: [], loading: false })
    }
  },

  createEmotion: async (userId: string, emotion: string, impact: number, note: string) => {
    try {
      const response = await fetch('/api/no-auth/emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          emotion,
          behavioralImpact: impact,
          note,
          recordType: 'quick_check'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // 重新加载情绪记录
        get().loadEmotions(userId)
        return true
      }
      return false
    } catch (error) {
      console.error('Create emotion error:', error)
      return false
    }
  }
}))

// 无认证聊天管理
interface ChatState {
  messages: Array<{id: string, content: string, isUser: boolean, timestamp: Date}>
  loading: boolean
  
  sendMessage: (message: string, emotion?: string) => Promise<void>
  clearMessages: () => void
}

export const useNoAuthChat = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,

  sendMessage: async (message: string, emotion = 'Other') => {
    const userMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    }
    
    set(state => ({ 
      messages: [...state.messages, userMessage],
      loading: true 
    }))

    try {
      const response = await fetch('/api/no-auth/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: message, emotion })
      })

      const data = await response.json()
      
      if (data.success && data.response) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date()
        }
        
        set(state => ({ 
          messages: [...state.messages, aiMessage],
          loading: false 
        }))
      } else {
        throw new Error('No response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date()
      }
      
      set(state => ({ 
        messages: [...state.messages, errorMessage],
        loading: false 
      }))
    }
  },

  clearMessages: () => {
    set({ messages: [] })
  }
}))
