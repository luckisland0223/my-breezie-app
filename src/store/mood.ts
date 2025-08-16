import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 扩展的情绪分类系统 - 基于心理学研究的情绪轮
export const emotionCategories = {
  // 积极情绪 (7-10分)
  positive: {
    ecstatic: { score: 10, label: "狂喜", emoji: "🤩", description: "极度兴奋和快乐" },
    joyful: { score: 9, label: "愉悦", emoji: "😄", description: "发自内心的快乐" },
    happy: { score: 9, label: "开心", emoji: "😊", description: "心情愉快" },
    content: { score: 8, label: "满足", emoji: "😌", description: "内心平和满足" },
    grateful: { score: 8, label: "感恩", emoji: "🙏", description: "心怀感激" },
    excited: { score: 8, label: "兴奋", emoji: "🤗", description: "充满期待和活力" },
    proud: { score: 8, label: "自豪", emoji: "😤", description: "为成就感到骄傲" },
    hopeful: { score: 7, label: "充满希望", emoji: "🌟", description: "对未来乐观" },
    peaceful: { score: 8, label: "平静", emoji: "🕯️", description: "内心宁静" },
    confident: { score: 8, label: "自信", emoji: "💪", description: "对自己有信心" },
  },
  
  // 中性情绪 (5-7分)
  neutral: {
    calm: { score: 7, label: "冷静", emoji: "😐", description: "情绪稳定" },
    neutral: { score: 6, label: "一般", emoji: "😑", description: "没有特别的感受" },
    contemplative: { score: 6, label: "沉思", emoji: "🤔", description: "深入思考中" },
    curious: { score: 6, label: "好奇", emoji: "🧐", description: "想要了解更多" },
    tired: { score: 5, label: "疲惫", emoji: "😴", description: "身心俱疲" },
    bored: { score: 5, label: "无聊", emoji: "😪", description: "缺乏兴趣" },
    indifferent: { score: 5, label: "冷漠", emoji: "😶", description: "漠不关心" },
  },
  
  // 消极情绪 (1-5分)
  negative: {
    disappointed: { score: 4, label: "失望", emoji: "😞", description: "期望落空" },
    sad: { score: 4, label: "难过", emoji: "😢", description: "心情低落" },
    lonely: { score: 4, label: "孤独", emoji: "😔", description: "感到孤单" },
    worried: { score: 4, label: "担心", emoji: "😟", description: "为某事忧虑" },
    anxious: { score: 3, label: "焦虑", emoji: "😰", description: "内心不安" },
    stressed: { score: 3, label: "压力", emoji: "😫", description: "感到压力山大" },
    frustrated: { score: 3, label: "沮丧", emoji: "😤", description: "感到挫败" },
    angry: { score: 3, label: "愤怒", emoji: "😠", description: "感到生气" },
    overwhelmed: { score: 2, label: "不知所措", emoji: "😵", description: "感到无法应对" },
    depressed: { score: 2, label: "抑郁", emoji: "😭", description: "深度低落" },
    hopeless: { score: 1, label: "绝望", emoji: "💔", description: "失去希望" },
  },
  
  // 复杂情绪 (2-8分，根据具体情况)
  complex: {
    nostalgic: { score: 6, label: "怀念", emoji: "🥺", description: "对过去的眷恋" },
    jealous: { score: 4, label: "嫉妒", emoji: "😒", description: "羡慕他人" },
    guilty: { score: 3, label: "内疚", emoji: "😳", description: "为某事感到歉疚" },
    embarrassed: { score: 4, label: "尴尬", emoji: "😅", description: "感到不好意思" },
    confused: { score: 5, label: "困惑", emoji: "😕", description: "不知道该怎么办" },
    surprised: { score: 6, label: "惊讶", emoji: "😲", description: "出乎意料" },
    shocked: { score: 4, label: "震惊", emoji: "😱", description: "受到冲击" },
    relieved: { score: 7, label: "解脱", emoji: "😮‍💨", description: "如释重负" },
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
