import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIModel } from '@/lib/ai-service';

interface SettingsState {
  // AI模型设置
  selectedModel: AIModel | null; // 允许为空，表示未选择
  hasSelectedInitialModel: boolean; // 是否已完成首次AI选择
  geminiApiKey: string;
  deepseekApiKey: string;
  
  // 方法
  setSelectedModel: (model: AIModel) => void;
  setInitialModelSelected: () => void; // 标记已完成首次选择
  setGeminiApiKey: (key: string) => void;
  setDeepSeekApiKey: (key: string) => void;
  getCurrentApiKey: () => string;
  isCurrentModelConfigured: () => boolean;
  getAvailableModels: () => AIModel[]; // 获取可用的AI模型列表
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 默认值
      selectedModel: null, // 初始时未选择AI
      hasSelectedInitialModel: false, // 初始时未完成首次选择
      geminiApiKey: '',
      deepseekApiKey: '',
      
      // 方法实现
      setSelectedModel: (model: AIModel) => set({ 
        selectedModel: model,
        hasSelectedInitialModel: true // 选择模型时自动标记为已完成首次选择
      }),
      setInitialModelSelected: () => set({ hasSelectedInitialModel: true }),
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
        if (!state.selectedModel) return false;
        const currentKey = state.getCurrentApiKey();
        return currentKey.length > 0;
      },
      
      getAvailableModels: (): AIModel[] => {
        return ['gemini', 'deepseek'];
      },
    }),
    {
      name: 'breezie-settings',
    }
  )
);
