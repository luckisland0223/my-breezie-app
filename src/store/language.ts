import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 语言类型定义
export type Language = 'en' | 'zh'

// 翻译内容
export const translations = {
  en: {
    // App general
    appName: 'Breezie',
    appSubtitle: 'Emotional Wellness Assistant',
    
    // Navigation
    home: 'Home',
    analytics: 'Analytics',
    settings: 'Settings',
    
    // Welcome section
    welcomeBack: 'Welcome back!',
    welcomeMessage: 'How are you feeling today? Breezie is here to accompany you and help you better understand and manage your emotions.',
    
    // Statistics
    totalRecords: 'Total Records',
    thisWeek: 'This Week',
    primaryEmotion: 'Primary Emotion',
    mostFrequentEmotion: 'is your most frequent emotion recently',
    
    // Quick actions
    quickStart: 'Quick Start',
    viewAnalytics: 'View Emotion Analytics',
    analyzePatterns: 'Analyze your emotional patterns',
    startConversation: 'Start Conversation',
    chatWithBreezie: 'Chat with Breezie',
    
    // Emotions
    emotions: {
      Joy: 'Joy',
      Sadness: 'Sadness',
      Anger: 'Anger',
      Fear: 'Fear',
      Surprise: 'Surprise',
      Disgust: 'Disgust',
      Complex: 'Complex'
    },
    
    // Emotion descriptions
    emotionDescriptions: {
      Joy: 'Feeling happy, content, or excited about something',
      Sadness: 'Feeling down, melancholy, or experiencing loss',
      Anger: 'Feeling frustrated, irritated, or upset about a situation',
      Fear: 'Feeling anxious, worried, or concerned about something',
      Surprise: 'Feeling amazed, startled, or caught off guard',
      Disgust: 'Feeling repulsed, revolted, or strongly disliking something',
      Complex: 'Experiencing a mix of different emotions or feeling conflicted'
    },
    
    // Emotion selector
    howFeeling: 'How are you feeling right now?',
    selectEmotion: 'Select the emotion that best describes your current state',
    confirmEmotion: 'Confirm Emotion',
    
    // Chat interface
    typeMessage: 'Type your message...',
    send: 'Send',
    endConversation: 'End Conversation',
    conversationEnded: 'Conversation ended, emotion record saved successfully',
    
    // Calendar
    emotionCalendar: 'Emotion Calendar',
    noEmotionRecords: 'No emotion records yet. Start your first conversation to generate the chart!',
    emotionDistribution: 'Emotion Distribution Chart',
    totalRecordsChart: 'Total Records',
    emotionAnalysis: 'Emotion Analysis',
    mostFrequentEmotionChart: 'Most frequent emotion',
    
    // Settings
    language: 'Language',
    english: 'English',
    chinese: 'Simplified Chinese',
    
    // Common
    loading: 'Loading...',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  
  zh: {
    // 应用通用
    appName: 'Breezie',
    appSubtitle: '情感健康助手',
    
    // 导航
    home: '首页',
    analytics: '分析',
    settings: '设置',
    
    // 欢迎区域
    welcomeBack: '欢迎回来！',
    welcomeMessage: '你今天感觉如何？Breezie在这里陪伴你，帮助你更好地理解和管理你的情绪。',
    
    // 统计数据
    totalRecords: '总记录数',
    thisWeek: '本周记录',
    primaryEmotion: '主要情绪',
    mostFrequentEmotion: '是你最近最频繁的情绪',
    
    // 快捷操作
    quickStart: '快速开始',
    viewAnalytics: '查看情绪分析',
    analyzePatterns: '分析你的情绪模式',
    startConversation: '开始对话',
    chatWithBreezie: '与Breezie聊天',
    
    // 情绪类型
    emotions: {
      Joy: '快乐',
      Sadness: '悲伤',
      Anger: '愤怒',
      Fear: '恐惧',
      Surprise: '惊讶',
      Disgust: '厌恶',
      Complex: '复杂'
    },
    
    // 情绪描述
    emotionDescriptions: {
      Joy: '感到快乐、满足或对某事感到兴奋',
      Sadness: '感到沮丧、忧郁或经历失落',
      Anger: '对某种情况感到沮丧、恼怒或不安',
      Fear: '对某事感到焦虑、担心或关切',
      Surprise: '感到惊讶、震惊或措手不及',
      Disgust: '感到反感、厌恶或强烈不喜欢某事',
      Complex: '体验多种不同情绪的混合或感到矛盾'
    },
    
    // 情绪选择器
    howFeeling: '你现在感觉如何？',
    selectEmotion: '选择最能描述你当前状态的情绪',
    confirmEmotion: '确认情绪',
    
    // 聊天界面
    typeMessage: '输入你的消息...',
    send: '发送',
    endConversation: '结束对话',
    conversationEnded: '对话已结束，情绪记录已成功保存',
    
    // 日历
    emotionCalendar: '情绪日历',
    noEmotionRecords: '还没有情绪记录，开始第一次对话来生成图表吧！',
    emotionDistribution: '情绪分布图',
    totalRecordsChart: '总记录',
    emotionAnalysis: '情绪分析',
    mostFrequentEmotionChart: '最常出现的情绪',
    
    // 设置
    language: '语言',
    english: 'English',
    chinese: '简体中文',
    
    // 通用
    loading: '加载中...',
    close: '关闭',
    cancel: '取消',
    confirm: '确认'
  }
}

// 语言Store接口
interface LanguageState {
  currentLanguage: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// 创建语言Store
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      
      setLanguage: (language: Language) => {
        set({ currentLanguage: language })
      },
      
      t: (key: string) => {
        const { currentLanguage } = get()
        const keys = key.split('.')
        let value: any = translations[currentLanguage]
        
        for (const k of keys) {
          value = value?.[k]
        }
        
        return value || key
      }
    }),
    {
      name: 'language-storage',
    }
  )
)
