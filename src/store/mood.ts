import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 基于Plutchik情绪轮理论的科学情绪分类系统
// 参考文献：Plutchik, R. (1980). Emotion: A psychoevolutionary synthesis
export const emotionCategories = {
  // Plutchik八种基本情绪 + 强度变化
  
  // 喜悦情绪族 (Joy Family) - 7-10分
  joy: {
    // 高强度
    ecstasy: { score: 10, label: "狂喜", emoji: "🤩", description: "极度的欢乐和兴奋", intensity: "high", basicEmotion: "joy" },
    joy: { score: 9, label: "喜悦", emoji: "😄", description: "发自内心的快乐", intensity: "medium", basicEmotion: "joy" },
    serenity: { score: 8, label: "宁静", emoji: "😌", description: "平和的快乐状态", intensity: "low", basicEmotion: "joy" },
    // 相关情绪
    elated: { score: 9, label: "兴高采烈", emoji: "🥳", description: "因成功或好消息而极度开心", intensity: "high", basicEmotion: "joy" },
    cheerful: { score: 8, label: "愉快", emoji: "😊", description: "轻松愉悦的心情", intensity: "medium", basicEmotion: "joy" },
    content: { score: 7, label: "满足", emoji: "🙂", description: "对现状感到满意", intensity: "low", basicEmotion: "joy" },
  },
  
  // 信任情绪族 (Trust Family) - 6-9分
  trust: {
    // 高强度
    admiration: { score: 9, label: "钦佩", emoji: "🤩", description: "对他人的深度敬重", intensity: "high", basicEmotion: "trust" },
    trust: { score: 8, label: "信任", emoji: "😌", description: "对他人的信赖", intensity: "medium", basicEmotion: "trust" },
    acceptance: { score: 7, label: "接纳", emoji: "🙂", description: "对现实的接受", intensity: "low", basicEmotion: "trust" },
    // 相关情绪
    confident: { score: 8, label: "自信", emoji: "💪", description: "对自己能力的信任", intensity: "medium", basicEmotion: "trust" },
    secure: { score: 7, label: "安全感", emoji: "🛡️", description: "感到被保护和支持", intensity: "medium", basicEmotion: "trust" },
    grateful: { score: 8, label: "感恩", emoji: "🙏", description: "对他人善意的感激", intensity: "medium", basicEmotion: "trust" },
  },
  
  // 恐惧情绪族 (Fear Family) - 1-5分
  fear: {
    // 高强度
    terror: { score: 1, label: "恐怖", emoji: "😱", description: "极度的恐惧和害怕", intensity: "high", basicEmotion: "fear" },
    fear: { score: 3, label: "恐惧", emoji: "😨", description: "对威胁的强烈担心", intensity: "medium", basicEmotion: "fear" },
    apprehension: { score: 4, label: "忧虑", emoji: "😟", description: "对未来的不安", intensity: "low", basicEmotion: "fear" },
    // 相关情绪
    anxious: { score: 3, label: "焦虑", emoji: "😰", description: "持续的不安和担心", intensity: "medium", basicEmotion: "fear" },
    nervous: { score: 4, label: "紧张", emoji: "😬", description: "面对挑战时的不安", intensity: "medium", basicEmotion: "fear" },
    worried: { score: 4, label: "担心", emoji: "😟", description: "对特定事物的关切", intensity: "low", basicEmotion: "fear" },
  },
  
  // 惊讶情绪族 (Surprise Family) - 5-8分
  surprise: {
    // 高强度
    amazement: { score: 8, label: "惊奇", emoji: "🤯", description: "极度的惊讶和震撼", intensity: "high", basicEmotion: "surprise" },
    surprise: { score: 7, label: "惊讶", emoji: "😲", description: "对意外事件的反应", intensity: "medium", basicEmotion: "surprise" },
    distraction: { score: 6, label: "分心", emoji: "😕", description: "注意力被转移", intensity: "low", basicEmotion: "surprise" },
    // 相关情绪
    confused: { score: 5, label: "困惑", emoji: "😕", description: "不理解当前情况", intensity: "medium", basicEmotion: "surprise" },
    curious: { score: 6, label: "好奇", emoji: "🧐", description: "想要了解更多", intensity: "low", basicEmotion: "surprise" },
    intrigued: { score: 7, label: "着迷", emoji: "🤔", description: "被某事深深吸引", intensity: "medium", basicEmotion: "surprise" },
  },
  
  // 悲伤情绪族 (Sadness Family) - 1-5分
  sadness: {
    // 高强度
    grief: { score: 1, label: "悲痛", emoji: "😭", description: "深度的痛苦和失落", intensity: "high", basicEmotion: "sadness" },
    sadness: { score: 3, label: "悲伤", emoji: "😢", description: "心情低落和难过", intensity: "medium", basicEmotion: "sadness" },
    pensiveness: { score: 4, label: "忧郁", emoji: "😔", description: "沉思中的轻度悲伤", intensity: "low", basicEmotion: "sadness" },
    // 相关情绪
    lonely: { score: 3, label: "孤独", emoji: "😞", description: "感到被孤立和遗弃", intensity: "medium", basicEmotion: "sadness" },
    disappointed: { score: 4, label: "失望", emoji: "😞", description: "期望落空的失落", intensity: "medium", basicEmotion: "sadness" },
    melancholy: { score: 4, label: "忧伤", emoji: "🥺", description: "淡淡的哀愁", intensity: "low", basicEmotion: "sadness" },
  },
  
  // 厌恶情绪族 (Disgust Family) - 2-5分
  disgust: {
    // 高强度
    loathing: { score: 2, label: "厌恶", emoji: "🤮", description: "强烈的反感和排斥", intensity: "high", basicEmotion: "disgust" },
    disgust: { score: 3, label: "反感", emoji: "😒", description: "对某事物的厌恶", intensity: "medium", basicEmotion: "disgust" },
    boredom: { score: 5, label: "无聊", emoji: "😪", description: "缺乏兴趣和刺激", intensity: "low", basicEmotion: "disgust" },
    // 相关情绪
    contempt: { score: 3, label: "轻蔑", emoji: "🙄", description: "对他人的鄙视", intensity: "medium", basicEmotion: "disgust" },
    annoyed: { score: 4, label: "烦恼", emoji: "😤", description: "轻度的不耐烦", intensity: "low", basicEmotion: "disgust" },
    repulsed: { score: 2, label: "排斥", emoji: "🤢", description: "强烈的拒绝感", intensity: "high", basicEmotion: "disgust" },
  },
  
  // 愤怒情绪族 (Anger Family) - 2-6分
  anger: {
    // 高强度
    rage: { score: 2, label: "暴怒", emoji: "😡", description: "极度的愤怒和冲动", intensity: "high", basicEmotion: "anger" },
    anger: { score: 3, label: "愤怒", emoji: "😠", description: "强烈的不满和怒火", intensity: "medium", basicEmotion: "anger" },
    annoyance: { score: 5, label: "恼怒", emoji: "😤", description: "轻度的不满", intensity: "low", basicEmotion: "anger" },
    // 相关情绪
    frustrated: { score: 4, label: "沮丧", emoji: "😫", description: "因阻碍而产生的愤怒", intensity: "medium", basicEmotion: "anger" },
    irritated: { score: 5, label: "烦躁", emoji: "😠", description: "容易被激怒的状态", intensity: "low", basicEmotion: "anger" },
    resentful: { score: 3, label: "怨恨", emoji: "😒", description: "对不公的持续愤怒", intensity: "medium", basicEmotion: "anger" },
  },
  
  // 期待情绪族 (Anticipation Family) - 5-9分
  anticipation: {
    // 高强度
    vigilance: { score: 8, label: "警觉", emoji: "👀", description: "高度的注意和准备", intensity: "high", basicEmotion: "anticipation" },
    anticipation: { score: 7, label: "期待", emoji: "🤗", description: "对未来的积极预期", intensity: "medium", basicEmotion: "anticipation" },
    interest: { score: 6, label: "兴趣", emoji: "🙂", description: "对某事的关注", intensity: "low", basicEmotion: "anticipation" },
    // 相关情绪
    excited: { score: 8, label: "兴奋", emoji: "🤩", description: "对即将到来的好事的激动", intensity: "high", basicEmotion: "anticipation" },
    hopeful: { score: 7, label: "充满希望", emoji: "🌟", description: "对美好未来的期望", intensity: "medium", basicEmotion: "anticipation" },
    eager: { score: 7, label: "渴望", emoji: "😍", description: "强烈的想要得到某物", intensity: "medium", basicEmotion: "anticipation" },
  },
  
  // 复合情绪 (根据Plutchik的情绪轮组合理论)
  complex: {
    // 喜悦+信任=爱
    love: { score: 9, label: "爱", emoji: "❤️", description: "深度的情感连接", intensity: "high", basicEmotion: "complex" },
    // 恐惧+惊讶=敬畏
    awe: { score: 7, label: "敬畏", emoji: "😮", description: "对宏伟事物的敬重", intensity: "medium", basicEmotion: "complex" },
    // 悲伤+厌恶=懊悔
    remorse: { score: 3, label: "懊悔", emoji: "😞", description: "对过去行为的后悔", intensity: "medium", basicEmotion: "complex" },
    // 惊讶+悲伤=失望
    despair: { score: 2, label: "绝望", emoji: "💔", description: "完全失去希望", intensity: "high", basicEmotion: "complex" },
    // 愤怒+厌恶=蔑视
    scorn: { score: 3, label: "蔑视", emoji: "😏", description: "带有优越感的厌恶", intensity: "medium", basicEmotion: "complex" },
    // 期待+喜悦=乐观
    optimism: { score: 8, label: "乐观", emoji: "😊", description: "对未来的积极态度", intensity: "medium", basicEmotion: "complex" },
    // 其他复合情绪
    jealous: { score: 4, label: "嫉妒", emoji: "😒", description: "对他人拥有的东西的渴望和愤怒", intensity: "medium", basicEmotion: "complex" },
    guilty: { score: 3, label: "内疚", emoji: "😳", description: "对错误行为的自我谴责", intensity: "medium", basicEmotion: "complex" },
    shame: { score: 2, label: "羞耻", emoji: "😣", description: "对自我价值的质疑", intensity: "high", basicEmotion: "complex" },
    pride: { score: 8, label: "自豪", emoji: "😤", description: "对成就的满足感", intensity: "medium", basicEmotion: "complex" },
    nostalgia: { score: 6, label: "怀念", emoji: "🥺", description: "对过去美好时光的眷恋", intensity: "low", basicEmotion: "complex" },
    relief: { score: 7, label: "解脱", emoji: "😮‍💨", description: "压力消除后的轻松", intensity: "medium", basicEmotion: "complex" },
  },
  
  // 中性状态
  neutral: {
    calm: { score: 6, label: "平静", emoji: "😐", description: "情绪稳定的状态", intensity: "neutral", basicEmotion: "neutral" },
    indifferent: { score: 5, label: "冷漠", emoji: "😶", description: "对外界缺乏情绪反应", intensity: "neutral", basicEmotion: "neutral" },
    tired: { score: 4, label: "疲惫", emoji: "😴", description: "身心俱疲的状态", intensity: "neutral", basicEmotion: "neutral" },
    contemplative: { score: 6, label: "沉思", emoji: "🤔", description: "深入思考的状态", intensity: "neutral", basicEmotion: "neutral" },
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
