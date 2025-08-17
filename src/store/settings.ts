import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // AI模型选择功能已移除，固定使用DeepSeek
  // 保留API密钥字段以防需要迁移旧数据
  geminiApiKey: string;
  deepseekApiKey: string;
  
  // 方法
  setGeminiApiKey: (key: string) => void;
  setDeepSeekApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 默认值
      geminiApiKey: '',
      deepseekApiKey: '',
      
      // 方法实现
      setGeminiApiKey: (key: string) => set({ geminiApiKey: key }),
      setDeepSeekApiKey: (key: string) => set({ deepseekApiKey: key }),
    }),
    {
      name: 'breezie-settings',
    }
  )
);
