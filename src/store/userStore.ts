import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  registeredAt: string
}

interface UserState {
  user: User | null
  isRegistered: boolean
  register: (email: string, name: string) => void
  logout: () => void
  getUser: () => User | null
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isRegistered: false,
      register: (email: string, name: string) => {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          registeredAt: new Date().toISOString()
        }
        set({ user: newUser, isRegistered: true })
      },
      logout: () => {
        set({ user: null, isRegistered: false })
      },
      getUser: () => get().user
    }),
    {
      name: 'breezie-user-storage'
    }
  )
)
