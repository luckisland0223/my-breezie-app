import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // 预留用户偏好设置，这里不再存储密钥
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    () => ({
      
    }),
    {
      name: 'breezie-settings',
    }
  )
);
