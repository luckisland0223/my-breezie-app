import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIModel } from '@/lib/ai-service';

interface SettingsState {
  // AI模型设置
  selectedModel: AIModel | null; // 允许为空，默认使用DeepSeek
  geminiApiKey: string;
  deepseekApiKey: string;
  
  // 方法
  setSelectedModel: (model: AIModel) => void;
  setGeminiApiKey: (key: string) => void;
  setDeepSeekApiKey: (key: string) => void;
  getCurrentApiKey: () => string;
  isCurrentModelConfigured: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 默认值 - DeepSeek为默认模型
      selectedModel: 'deepseek',
      geminiApiKey: '',
      deepseekApiKey: '',
      
      // 方法实现
      setSelectedModel: (model: AIModel) => set({ selectedModel: model }),
      setGeminiApiKey: (key: string) => set({ geminiApiKey: key }),
      setDeepSeekApiKey: (key: string) => set({ deepseekApiKey: key }),
      
      getCurrentApiKey: () => {
        const state = get();
        if (!state.selectedModel) return '';
        switch (state.selectedModel) {
          case 'gemini':
            return state.geminiApiKey;
          case 'deepseek':
            return state.deepseekApiKey;
          default:
            return '';
        }
      },
      
      isCurrentModelConfigured: () => {
        const state = get();
        if (!state.selectedModel) return true; // DeepSeek是默认的，总是可用
        const currentKey = state.getCurrentApiKey();
        return currentKey.length > 0;
      },
    }),
    {
      name: 'breezie-settings',
    }
  )
);
