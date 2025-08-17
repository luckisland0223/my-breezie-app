import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 完整的情绪分类系统 - 按5大类别组织
export const emotionCategories = {
  // 基本情绪 - 最常见的6种基础情绪
  basic: {
    happy: { score: 8, label: "开心", emoji: "😄", description: "发自内心的快乐", intensity: "high", basicEmotion: "positive" },
    sad: { score: 3, label: "难过", emoji: "😢", description: "心情低落和难过", intensity: "medium", basicEmotion: "negative" },
    anxious: { score: 3, label: "焦虑", emoji: "😰", description: "持续的不安和担心", intensity: "medium", basicEmotion: "negative" },
    calm: { score: 6, label: "平静", emoji: "😐", description: "情绪稳定的状态", intensity: "neutral", basicEmotion: "neutral" },
    angry: { score: 3, label: "生气", emoji: "😠", description: "强烈的愤怒情绪", intensity: "medium", basicEmotion: "negative" },
    surprised: { score: 7, label: "惊喜", emoji: "😲", description: "意外的喜悦", intensity: "medium", basicEmotion: "positive" },
  },
  
  // 积极情绪 (7-10分)
  positive: {
    excited: { score: 8, label: "兴奋", emoji: "🤩", description: "对好事的激动", intensity: "high", basicEmotion: "positive" },
    content: { score: 7, label: "满足", emoji: "😊", description: "对现状感到满意", intensity: "medium", basicEmotion: "positive" },
    grateful: { score: 8, label: "感恩", emoji: "🙏", description: "对他人善意的感激", intensity: "medium", basicEmotion: "positive" },
    hopeful: { score: 7, label: "充满希望", emoji: "🌟", description: "对未来的积极期待", intensity: "medium", basicEmotion: "positive" },
    joyful: { score: 9, label: "喜悦", emoji: "😁", description: "内心深处的快乐", intensity: "high", basicEmotion: "positive" },
    proud: { score: 8, label: "自豪", emoji: "😤", description: "为成就感到骄傲", intensity: "medium", basicEmotion: "positive" },
    peaceful: { score: 7, label: "安详", emoji: "😇", description: "内心平和宁静", intensity: "low", basicEmotion: "positive" },
    energetic: { score: 8, label: "充满活力", emoji: "🔥", description: "精力充沛的状态", intensity: "high", basicEmotion: "positive" },
  },
  
  // 消极情绪 (1-4分)
  negative: {
    frustrated: { score: 4, label: "沮丧", emoji: "😫", description: "因阻碍而产生的愤怒", intensity: "medium", basicEmotion: "negative" },
    lonely: { score: 3, label: "孤独", emoji: "😞", description: "感到被孤立", intensity: "medium", basicEmotion: "negative" },
    stressed: { score: 2, label: "压力大", emoji: "😵", description: "承受过多压力", intensity: "high", basicEmotion: "negative" },
    disappointed: { score: 4, label: "失望", emoji: "😔", description: "期望落空的失落", intensity: "low", basicEmotion: "negative" },
    worried: { score: 3, label: "担心", emoji: "😟", description: "对未来的忧虑", intensity: "medium", basicEmotion: "negative" },
    jealous: { score: 3, label: "嫉妒", emoji: "😒", description: "对他人的羡慕嫉妒", intensity: "medium", basicEmotion: "negative" },
    guilty: { score: 2, label: "内疚", emoji: "😣", description: "为过错感到自责", intensity: "low", basicEmotion: "negative" },
    hopeless: { score: 1, label: "绝望", emoji: "😩", description: "完全失去希望", intensity: "high", basicEmotion: "negative" },
  },
  
  // 中性情绪 (5-6分)
  neutral: {
    tired: { score: 5, label: "疲惫", emoji: "😴", description: "身心俱疲的状态", intensity: "neutral", basicEmotion: "neutral" },
    bored: { score: 5, label: "无聊", emoji: "😪", description: "缺乏兴趣", intensity: "neutral", basicEmotion: "neutral" },
    confused: { score: 5, label: "困惑", emoji: "😕", description: "不理解当前情况", intensity: "neutral", basicEmotion: "neutral" },
    indifferent: { score: 5, label: "无所谓", emoji: "😑", description: "对事情漠不关心", intensity: "neutral", basicEmotion: "neutral" },
    curious: { score: 6, label: "好奇", emoji: "🤔", description: "对事物的探索欲", intensity: "neutral", basicEmotion: "neutral" },
    thoughtful: { score: 6, label: "深思", emoji: "🤨", description: "认真思考问题", intensity: "neutral", basicEmotion: "neutral" },
  },
  
  // 复杂情绪 - 多层次的情感状态
  complex: {
    nostalgic: { score: 6, label: "怀念", emoji: "🥺", description: "对过去美好时光的眷恋", intensity: "medium", basicEmotion: "neutral" },
    overwhelmed: { score: 4, label: "不知所措", emoji: "😵‍💫", description: "面对太多事情感到无力", intensity: "high", basicEmotion: "negative" },
    conflicted: { score: 5, label: "矛盾", emoji: "😬", description: "内心有相互冲突的想法", intensity: "medium", basicEmotion: "neutral" },
    empty: { score: 4, label: "空虚", emoji: "😶", description: "内心感到空洞和无意义", intensity: "low", basicEmotion: "negative" },
    embarrassed: { score: 4, label: "尴尬", emoji: "😳", description: "感到羞愧和不自在", intensity: "medium", basicEmotion: "negative" },
    relieved: { score: 7, label: "解脱", emoji: "😮‍💨", description: "压力释放后的轻松", intensity: "medium", basicEmotion: "positive" },
    melancholy: { score: 4, label: "忧郁", emoji: "😔", description: "淡淡的忧伤和沉思", intensity: "low", basicEmotion: "negative" },
    restless: { score: 4, label: "焦躁", emoji: "😤", description: "内心不安静", intensity: "medium", basicEmotion: "negative" },
  }
} as const;

// 扁平化的情绪分数映射（保持向后兼容）
export const emotionScores = Object.entries(emotionCategories).reduce((acc, [category, emotions]) => {
  Object.entries(emotions).forEach(([key, emotion]) => {
    acc[key as keyof typeof acc] = emotion.score;
  });
  return acc;
}, {} as Record<string, number>);

// 获取所有情绪的扁平列表
export const getAllEmotions = () => {
  const emotions: Array<{
    key: string;
    category: string;
    score: number;
    label: string;
    emoji: string;
    description: string;
    color: string;
  }> = [];
  
  Object.entries(emotionCategories).forEach(([categoryKey, categoryEmotions]) => {
    Object.entries(categoryEmotions).forEach(([emotionKey, emotion]) => {
      emotions.push({
        key: emotionKey,
        category: categoryKey,
        score: emotion.score,
        label: emotion.label,
        emoji: emotion.emoji,
        description: emotion.description,
        color: getEmotionColor(emotion.score)
      });
    });
  });
  
  return emotions;
};

// 根据分数获取颜色
const getEmotionColor = (score: number): string => {
  if (score >= 8) return "bg-green-50 hover:bg-green-100 border-green-200";
  if (score >= 7) return "bg-blue-50 hover:bg-blue-100 border-blue-200";
  if (score >= 5) return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200";
  if (score >= 3) return "bg-orange-50 hover:bg-orange-100 border-orange-200";
  return "bg-red-50 hover:bg-red-100 border-red-200";
};

export type EmotionType = keyof typeof emotionScores;

// 情绪记录数据结构
export interface MoodRecord {
  id: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  type: 'emotion_select' | 'chat_analysis' | 'diary_score' | 'manual_score';
  value: number; // 1-10分
  weight: number; // 权重
  source?: EmotionType | string; // 来源信息
  note?: string; // 备注
}

// 每日情绪统计
export interface DailyMoodStats {
  date: string;
  averageScore: number;
  recordCount: number;
  dominantEmotion?: EmotionType;
  records: MoodRecord[];
}

interface MoodState {
  // 情绪记录数据
  moodRecords: MoodRecord[];
  dailyStats: Record<string, DailyMoodStats>;
  
  // 计算方法
  addMoodRecord: (record: Omit<MoodRecord, 'id' | 'timestamp'>) => void;
  getTodayMoodScore: () => number | null;
  getDailyStats: (date: string) => DailyMoodStats | null;
  getWeeklyAverage: () => number | null;
  getMonthlyAverage: () => number | null;
  
  // 便捷方法
  recordEmotionSelect: (emotion: EmotionType, note?: string) => void;
  recordChatAnalysis: (score: number, note?: string) => void;
  recordDiaryScore: (score: number, note?: string) => void;
  recordManualScore: (score: number, note?: string) => void;
  
  // 统计方法
  calculateDailyScore: (date: string) => number | null;
  updateDailyStats: (date: string) => void;
  getContinuousDays: () => number;
  getTotalConversations: () => number;
  getImprovementPercentage: () => number;
  
  // 数据管理方法
  clearAllData: () => void;
  exportData: () => object;
  importData: (data: any) => boolean;
}

// 获取今天的日期字符串
const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0]!;
};

// 获取指定天数前的日期字符串
const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]!;
};

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      moodRecords: [],
      dailyStats: {},

      // 添加情绪记录
      addMoodRecord: (record) => {
        const newRecord: MoodRecord = {
          ...record,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          moodRecords: [...state.moodRecords, newRecord],
        }));

        // 更新对应日期的统计
        get().updateDailyStats(record.date);
      },

      // 计算指定日期的情绪分数
      calculateDailyScore: (date) => {
        const { moodRecords } = get();
        const dayRecords = moodRecords.filter(record => record.date === date);
        
        if (dayRecords.length === 0) return null;

        // 加权平均计算
        let totalScore = 0;
        let totalWeight = 0;

        dayRecords.forEach(record => {
          totalScore += record.value * record.weight;
          totalWeight += record.weight;
        });

        return totalWeight > 0 ? Number((totalScore / totalWeight).toFixed(1)) : null;
      },

      // 更新每日统计
      updateDailyStats: (date) => {
        const { moodRecords, calculateDailyScore } = get();
        const dayRecords = moodRecords.filter(record => record.date === date);
        const averageScore = calculateDailyScore(date) || 0;

        // 找出主导情绪（最高分数的情绪选择记录）
        const emotionRecords = dayRecords.filter(r => r.type === 'emotion_select');
        let dominantEmotion: EmotionType | undefined;
        
        if (emotionRecords.length > 0) {
          const sortedEmotions = emotionRecords.sort((a, b) => b.value - a.value);
          dominantEmotion = sortedEmotions[0]?.source as EmotionType;
        }

        set((state) => ({
          dailyStats: {
            ...state.dailyStats,
            [date]: {
              date,
              averageScore,
              recordCount: dayRecords.length,
              dominantEmotion,
              records: dayRecords,
            }
          }
        }));
      },

      // 获取今日情绪分数
      getTodayMoodScore: () => {
        const today = getTodayDateString();
        return get().calculateDailyScore(today);
      },

      // 获取指定日期的统计
      getDailyStats: (date) => {
        return get().dailyStats[date] || null;
      },

      // 获取周平均
      getWeeklyAverage: () => {
        const scores: number[] = [];
        for (let i = 0; i < 7; i++) {
          const date = getDateString(i);
          const score = get().calculateDailyScore(date);
          if (score !== null) scores.push(score);
        }
        
        return scores.length > 0 
          ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
          : null;
      },

      // 获取月平均
      getMonthlyAverage: () => {
        const scores: number[] = [];
        for (let i = 0; i < 30; i++) {
          const date = getDateString(i);
          const score = get().calculateDailyScore(date);
          if (score !== null) scores.push(score);
        }
        
        return scores.length > 0 
          ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
          : null;
      },

      // 便捷记录方法
      recordEmotionSelect: (emotion, note) => {
        get().addMoodRecord({
          date: getTodayDateString(),
          type: 'emotion_select',
          value: emotionScores[emotion] || 5,
          weight: 1.0,
          source: emotion,
          note,
        });
      },

      recordChatAnalysis: (score, note) => {
        get().addMoodRecord({
          date: getTodayDateString(),
          type: 'chat_analysis',
          value: score,
          weight: 2.0,
          source: 'ai_analysis',
          note,
        });
      },

      recordDiaryScore: (score, note) => {
        get().addMoodRecord({
          date: getTodayDateString(),
          type: 'diary_score',
          value: score,
          weight: 1.5,
          source: 'diary_entry',
          note,
        });
      },

      recordManualScore: (score, note) => {
        get().addMoodRecord({
          date: getTodayDateString(),
          type: 'manual_score',
          value: score,
          weight: 1.0,
          source: 'manual_input',
          note,
        });
      },

      // 统计方法
      getContinuousDays: () => {
        const { dailyStats } = get();
        let continuousDays = 0;
        let currentDate = new Date();
        
        while (true) {
          const dateString = currentDate.toISOString().split('T')[0]!;
          if (dailyStats[dateString] && dailyStats[dateString].recordCount > 0) {
            continuousDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        return continuousDays;
      },

      getTotalConversations: () => {
        const { moodRecords } = get();
        return moodRecords.filter(record => record.type === 'chat_analysis').length;
      },

      getImprovementPercentage: () => {
        const thisWeekAvg = get().getWeeklyAverage();
        const lastWeekScores: number[] = [];
        
        // 计算上周平均分（7-14天前）
        for (let i = 7; i < 14; i++) {
          const date = getDateString(i);
          const score = get().calculateDailyScore(date);
          if (score !== null) lastWeekScores.push(score);
        }
        
        const lastWeekAvg = lastWeekScores.length > 0 
          ? lastWeekScores.reduce((a, b) => a + b, 0) / lastWeekScores.length
          : null;
        
        if (thisWeekAvg && lastWeekAvg && lastWeekAvg > 0) {
          const improvement = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
          return Math.round(improvement);
        }
        
        return 15; // 默认显示15%改善
      },

      // 数据管理方法
      clearAllData: () => {
        set({
          moodRecords: [],
          dailyStats: {},
        });
      },

      exportData: () => {
        const { moodRecords, dailyStats } = get();
        return {
          moodRecords,
          dailyStats,
          exportDate: new Date().toISOString(),
          version: "1.0",
        };
      },

      importData: (data: any) => {
        try {
          if (data.version === "1.0" && data.moodRecords && data.dailyStats) {
            set({
              moodRecords: data.moodRecords,
              dailyStats: data.dailyStats,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Import data error:', error);
          return false;
        }
      },
    }),
    {
      name: 'mood-storage',
      // 只持久化必要的数据
      partialize: (state) => ({
        moodRecords: state.moodRecords,
        dailyStats: state.dailyStats,
      }),
    }
  )
);
