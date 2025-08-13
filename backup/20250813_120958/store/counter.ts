/**
 * @description This is just an example, you can delete or refactor it at any time
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CounterState {
  count: number
  increment: () => boolean
  decrement: () => boolean
  reset: () => void
}

export const useCounterStore = create<CounterState>()(
  persist(
    (set, get) => ({
      count: 0,
      increment: () => {
        const currentCount = get().count
        if (currentCount < 10) {
          set({ count: currentCount + 1 })
          return true
        }
        return false
      },
      decrement: () => {
        const currentCount = get().count
        if (currentCount > 0) {
          set({ count: currentCount - 1 })
          return true
        }
        return false
      },
      reset: () => set({ count: 0 }),
    }),
    {
      name: 'counter-storage',
    }
  )
) 