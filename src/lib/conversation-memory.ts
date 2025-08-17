// 对话记忆系统 - 让Breezie记住用户的对话历史和个人信息
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用户个人信息接口
interface UserProfile {
  name?: string;
  age?: number;
  occupation?: string;
  interests: string[];
  personalityTraits: string[];
  importantEvents: Array<{
    date: string;
    event: string;
    emotion: string;
    significance: 'high' | 'medium' | 'low';
  }>;
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'friendly';
    topicInterests: string[];
    avoidTopics: string[];
  };
  relationshipContext: {
    relationshipStatus?: string;
    familySituation?: string;
    socialCircle?: string;
  };
}

// 对话上下文接口
interface ConversationContext {
  recentTopics: Array<{
    topic: string;
    timestamp: string;
    emotionalState: string;
    resolution?: string;
  }>;
  ongoingConcerns: Array<{
    concern: string;
    firstMentioned: string;
    lastDiscussed: string;
    status: 'active' | 'resolved' | 'improving';
    importance: 'high' | 'medium' | 'low';
  }>;
  conversationPatterns: {
    preferredTimeOfDay: string[];
    averageSessionLength: number;
    commonEmotions: string[];
    responsiveTopics: string[];
  };
  milestones: Array<{
    achievement: string;
    date: string;
    celebratedTogether: boolean;
  }>;
}

// 对话记忆状态接口
interface ConversationMemoryState {
  userProfile: UserProfile;
  conversationContext: ConversationContext;
  lastInteraction: string;
  sessionCount: number;
  
  // 用户信息更新方法
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addImportantEvent: (event: UserProfile['importantEvents'][0]) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  
  // 对话上下文更新方法
  addRecentTopic: (topic: ConversationContext['recentTopics'][0]) => void;
  updateOngoingConcern: (concern: ConversationContext['ongoingConcerns'][0]) => void;
  addMilestone: (milestone: ConversationContext['milestones'][0]) => void;
  
  // 对话分析方法
  getPersonalizedGreeting: () => string;
  getContextualQuestions: () => string[];
  getRelevantTopics: () => string[];
  shouldFollowUp: (topic: string) => boolean;
  
  // 记录互动
  recordInteraction: () => void;
  
  // 获取对话历史摘要
  getConversationSummary: () => string;
}

// 个性化问候语生成
const generatePersonalizedGreeting = (profile: UserProfile, context: ConversationContext, sessionCount: number): string => {
  const timeOfDay = new Date().getHours();
  const greetings = [];
  
  // 基于时间的问候
  if (timeOfDay < 12) {
    greetings.push("早上好");
    if (profile.occupation) {
      greetings.push(`今天工作顺利吗？`);
    }
  } else if (timeOfDay < 18) {
    greetings.push("下午好");
    greetings.push("今天过得怎么样？");
  } else {
    greetings.push("晚上好");
    greetings.push("今天累不累？");
  }
  
  // 基于最近话题的问候
  const recentTopic = context.recentTopics[0];
  if (recentTopic && new Date(recentTopic.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000) {
    greetings.push(`上次你提到的${recentTopic.topic}，现在怎么样了？`);
  }
  
  // 基于正在进行的关注点
  const activeConcern = context.ongoingConcerns.find(c => c.status === 'active');
  if (activeConcern) {
    greetings.push(`${activeConcern.concern}的情况有改善吗？`);
  }
  
  // 新用户特殊问候
  if (sessionCount === 1) {
    return "嗨！很高兴认识你，我是Breezie。今天心情怎么样？";
  }
  
  // 返回随机个性化问候
  return greetings[Math.floor(Math.random() * greetings.length)] || "嗨！想聊聊吗？";
};

// 上下文相关问题生成
const generateContextualQuestions = (profile: UserProfile, context: ConversationContext): string[] => {
  const questions = [];
  
  // 基于兴趣的问题
  if (profile.interests.length > 0) {
    const randomInterest = profile.interests[Math.floor(Math.random() * profile.interests.length)];
    questions.push(`最近有在${randomInterest}方面有什么新发现吗？`);
  }
  
  // 基于最近情绪的问题
  const recentEmotions = context.conversationPatterns.commonEmotions;
  if (recentEmotions.includes('stressed') || recentEmotions.includes('anxious')) {
    questions.push("最近压力大吗？要不要聊聊放松的方法？");
  }
  
  // 基于正在进行的关注点
  context.ongoingConcerns.forEach(concern => {
    if (concern.status === 'improving') {
      questions.push(`${concern.concern}现在感觉好些了吗？`);
    }
  });
  
  return questions;
};

// 创建对话记忆存储
export const useConversationMemory = create<ConversationMemoryState>()(
  persist(
    (set, get) => ({
      // 初始状态
      userProfile: {
        interests: [],
        personalityTraits: [],
        importantEvents: [],
        preferences: {
          communicationStyle: 'friendly',
          topicInterests: [],
          avoidTopics: []
        },
        relationshipContext: {}
      },
      
      conversationContext: {
        recentTopics: [],
        ongoingConcerns: [],
        conversationPatterns: {
          preferredTimeOfDay: [],
          averageSessionLength: 0,
          commonEmotions: [],
          responsiveTopics: []
        },
        milestones: []
      },
      
      lastInteraction: '',
      sessionCount: 0,
      
      // 用户信息更新方法
      updateUserProfile: (updates) => {
        set(state => ({
          userProfile: { ...state.userProfile, ...updates }
        }));
      },
      
      addImportantEvent: (event) => {
        set(state => ({
          userProfile: {
            ...state.userProfile,
            importantEvents: [event, ...state.userProfile.importantEvents].slice(0, 20) // 保留最近20个重要事件
          }
        }));
      },
      
      updatePreferences: (preferences) => {
        set(state => ({
          userProfile: {
            ...state.userProfile,
            preferences: { ...state.userProfile.preferences, ...preferences }
          }
        }));
      },
      
      // 对话上下文更新方法
      addRecentTopic: (topic) => {
        set(state => ({
          conversationContext: {
            ...state.conversationContext,
            recentTopics: [topic, ...state.conversationContext.recentTopics].slice(0, 10) // 保留最近10个话题
          }
        }));
      },
      
      updateOngoingConcern: (concern) => {
        set(state => {
          const existingIndex = state.conversationContext.ongoingConcerns.findIndex(
            c => c.concern === concern.concern
          );
          
          let updatedConcerns;
          if (existingIndex >= 0) {
            // 更新现有关注点
            updatedConcerns = [...state.conversationContext.ongoingConcerns];
            updatedConcerns[existingIndex] = { ...updatedConcerns[existingIndex], ...concern };
          } else {
            // 添加新关注点
            updatedConcerns = [concern, ...state.conversationContext.ongoingConcerns].slice(0, 5);
          }
          
          return {
            conversationContext: {
              ...state.conversationContext,
              ongoingConcerns: updatedConcerns
            }
          };
        });
      },
      
      addMilestone: (milestone) => {
        set(state => ({
          conversationContext: {
            ...state.conversationContext,
            milestones: [milestone, ...state.conversationContext.milestones].slice(0, 15)
          }
        }));
      },
      
      // 对话分析方法
      getPersonalizedGreeting: () => {
        const state = get();
        return generatePersonalizedGreeting(
          state.userProfile, 
          state.conversationContext, 
          state.sessionCount
        );
      },
      
      getContextualQuestions: () => {
        const state = get();
        return generateContextualQuestions(state.userProfile, state.conversationContext);
      },
      
      getRelevantTopics: () => {
        const state = get();
        const topics = [
          ...state.userProfile.interests,
          ...state.conversationContext.conversationPatterns.responsiveTopics
        ];
        return [...new Set(topics)]; // 去重
      },
      
      shouldFollowUp: (topic: string) => {
        const state = get();
        const recentTopic = state.conversationContext.recentTopics.find(t => 
          t.topic.includes(topic) && 
          new Date(t.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // 7天内
        );
        return !!recentTopic && !recentTopic?.resolution;
      },
      
      // 记录互动
      recordInteraction: () => {
        set(state => ({
          lastInteraction: new Date().toISOString(),
          sessionCount: state.sessionCount + 1
        }));
      },
      
      // 获取对话历史摘要
      getConversationSummary: () => {
        const state = get();
        const summary = [];
        
        if (state.userProfile.name) {
          summary.push(`用户名: ${state.userProfile.name}`);
        }
        
        if (state.userProfile.interests.length > 0) {
          summary.push(`兴趣: ${state.userProfile.interests.join(', ')}`);
        }
        
        if (state.conversationContext.ongoingConcerns.length > 0) {
          const activeConcerns = state.conversationContext.ongoingConcerns
            .filter(c => c.status === 'active')
            .map(c => c.concern);
          if (activeConcerns.length > 0) {
            summary.push(`当前关注: ${activeConcerns.join(', ')}`);
          }
        }
        
        if (state.conversationContext.recentTopics.length > 0) {
          const recentTopic = state.conversationContext.recentTopics[0]!;
          summary.push(`最近话题: ${recentTopic.topic} (${recentTopic.emotionalState})`);
        }
        
        return summary.join(' | ');
      }
    }),
    {
      name: 'breezie-conversation-memory'
    }
  )
);

// 自动从对话中提取信息的工具函数
export const extractUserInfoFromMessage = (message: string, emotion: string) => {
  const memory = useConversationMemory.getState();
  
  // 提取可能的兴趣
  const interestKeywords = ['喜欢', '爱好', '兴趣', '热爱', '痴迷', '关注'];
  const hasInterestMention = interestKeywords.some(keyword => message.includes(keyword));
  
  if (hasInterestMention) {
    // 这里可以添加更复杂的NLP逻辑来提取具体兴趣
    // 暂时简化处理
  }
  
  // 提取重要事件
  const eventKeywords = ['发生了', '遇到了', '经历了', '今天', '昨天', '最近'];
  const hasEventMention = eventKeywords.some(keyword => message.includes(keyword));
  
  if (hasEventMention && (emotion === 'sad' || emotion === 'happy' || emotion === 'anxious')) {
    memory.addImportantEvent({
      date: new Date().toISOString(),
      event: message.slice(0, 100), // 截取前100个字符作为事件描述
      emotion,
      significance: emotion === 'sad' || emotion === 'anxious' ? 'high' : 'medium'
    });
  }
  
  // 记录话题
  memory.addRecentTopic({
    topic: message.slice(0, 50), // 前50个字符作为话题
    timestamp: new Date().toISOString(),
    emotionalState: emotion
  });
};

// 生成个性化的对话开场白
export const generatePersonalizedOpener = (): string => {
  const memory = useConversationMemory.getState();
  
  // 如果是新用户
  if (memory.sessionCount === 0) {
    return "嗨！我是Breezie，很高兴遇见你。今天心情怎么样？有什么想聊的吗？";
  }
  
  // 如果有未解决的关注点
  const activeConcerns = memory.conversationContext.ongoingConcerns.filter(c => c.status === 'active');
  if (activeConcerns.length > 0) {
    const concernItem = activeConcerns[0]!;
    return `嗨！想起来上次你提到的${concernItem.concern}，现在感觉怎么样了？`;
  }
  
  // 如果有最近的积极里程碑
  const recentMilestone = memory.conversationContext.milestones[0];
  if (recentMilestone && !recentMilestone.celebratedTogether) {
    memory.addMilestone({ ...recentMilestone, celebratedTogether: true });
    return `嗨！我还记得你之前说的${recentMilestone.achievement}，真的为你感到开心！今天过得怎么样？`;
  }
  
  // 默认个性化问候
  return memory.getPersonalizedGreeting();
};
