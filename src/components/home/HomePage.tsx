"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMoodStore, emotionCategories, getAllEmotions } from "@/store/mood";
import { toast } from "sonner";
import { 
  MessageCircle, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  BarChart3,
  BookOpen,
  Zap,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 情绪分类的中文标签
const categoryLabels = {
  positive: { label: "积极情绪", icon: "🌟", color: "text-green-600", bgColor: "bg-green-50" },
  neutral: { label: "中性情绪", icon: "⚖️", color: "text-blue-600", bgColor: "bg-blue-50" },
  negative: { label: "消极情绪", icon: "🌧️", color: "text-orange-600", bgColor: "bg-orange-50" },
  complex: { label: "复杂情绪", icon: "🌈", color: "text-purple-600", bgColor: "bg-purple-50" },
};

const quickActions = [
  {
    title: "觉得糟糕？",
    subtitle: "开始对话",
    description: "与AI助手分享你的困扰，获得专业的情绪疏导",
    icon: MessageCircle,
    href: "/chat",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    title: "心情还好？",
    subtitle: "记录日记",
    description: "记录今天的美好瞬间，保存珍贵的情感回忆",
    icon: BookOpen,
    href: "/diary",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20"
  },
  {
    title: "想要了解自己？",
    subtitle: "查看分析",
    description: "深入分析情绪变化趋势，发现内心的成长轨迹",
    icon: BarChart3,
    href: "/analytics",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50 dark:bg-green-900/20"
  }
];

// 移除静态数据，改为动态获取

export function HomePage() {
  const router = useRouter();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAllEmotions, setShowAllEmotions] = useState(false);
  
  // 获取所有情绪数据
  const allEmotions = getAllEmotions();
  
  // 获取情绪数据
  const {
    getTodayMoodScore,
    getContinuousDays,
    getTotalConversations,
    getImprovementPercentage,
    recordEmotionSelect
  } = useMoodStore();

  // 动态统计数据
  const [todayStats, setTodayStats] = useState([
    { label: "今日心情", value: "—", icon: Heart, color: "text-red-500" },
    { label: "连续记录", value: "—", icon: Calendar, color: "text-blue-500" },
    { label: "总对话", value: "—", icon: MessageCircle, color: "text-green-500" },
    { label: "情绪改善", value: "—", icon: TrendingUp, color: "text-purple-500" }
  ]);

  // 更新统计数据
  const updateStats = () => {
    const todayScore = getTodayMoodScore();
    const continuousDays = getContinuousDays();
    const totalConversations = getTotalConversations();
    const improvement = getImprovementPercentage();

    setTodayStats([
      { 
        label: "今日心情", 
        value: todayScore ? `${todayScore}` : "—", 
        icon: Heart, 
        color: "text-red-500" 
      },
      { 
        label: "连续记录", 
        value: `${continuousDays}天`, 
        icon: Calendar, 
        color: "text-blue-500" 
      },
      { 
        label: "总对话", 
        value: `${totalConversations}次`, 
        icon: MessageCircle, 
        color: "text-green-500" 
      },
      { 
        label: "情绪改善", 
        value: improvement > 0 ? `+${improvement}%` : `${improvement}%`, 
        icon: TrendingUp, 
        color: improvement >= 0 ? "text-green-500" : "text-red-500" 
      }
    ]);
  };

  // 组件挂载时更新数据
  useEffect(() => {
    updateStats();
  }, [getTodayMoodScore, getContinuousDays, getTotalConversations, getImprovementPercentage]);

  // 监听 selectedEmotion 变化，当选择情绪后更新数据
  useEffect(() => {
    if (selectedEmotion) {
      updateStats();
    }
  }, [selectedEmotion, getTodayMoodScore, getContinuousDays, getTotalConversations, getImprovementPercentage]);

  const handleEmotionSelect = (emotionKey: string) => {
    setSelectedEmotion(emotionKey);
    
    // 找到选择的情绪信息
    const selectedEmotionData = allEmotions.find(e => e.key === emotionKey);
    
    // 记录情绪选择到状态管理
    recordEmotionSelect(emotionKey as any, `用户在首页选择了${selectedEmotionData?.label}情绪`);
    
    // 显示成功提示
    const emotionLabel = selectedEmotionData?.label || '情绪';
    toast.success(`已记录你的${emotionLabel}状态`, {
      description: "你的情绪数据已保存，继续保持记录习惯吧！",
      duration: 3000,
    });
  };

  const getEmotionFeedback = (emotionKey: string) => {
    const selectedEmotionData = allEmotions.find(e => e.key === emotionKey);
    if (!selectedEmotionData) return "感谢你分享你的感受";
    
    const { category, score, label } = selectedEmotionData;
    
    if (category === 'positive') {
      return `太棒了！${label}是很美好的感受 ✨`;
    } else if (category === 'negative') {
      return `我理解你现在${label}的感受，记得要照顾好自己 💙`;
    } else if (category === 'neutral') {
      return `${label}也是一种很真实的状态 🌿`;
    } else if (category === 'complex') {
      return `${label}是很复杂的情感，我会陪伴你一起理解 🤗`;
    }
    
    return "感谢你分享你的感受";
  };

  return (
    <div className="space-y-16 max-w-6xl mx-auto">
      {/* Hero Section - 更简洁的欢迎区域 */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center py-16"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl"
        >
          <Heart className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-6xl font-bold text-apple-title mb-6"
        >
          <span className="gradient-text-apple">你好，朋友</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl text-apple-body max-w-2xl mx-auto leading-relaxed"
        >
          欢迎来到你的情绪疏导空间。在这里，每一种感受都被理解，每一次成长都被记录。
        </motion.p>
      </motion.section>

      {/* Enhanced Emotion Selection - 分类情绪选择 */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-apple-title mb-4">今天的你感觉如何？</h2>
          <p className="text-lg text-apple-body">选择一个最贴近你现在心情的情绪</p>
        </div>

        {/* 情绪分类选择器 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
              selectedCategory === null 
                ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            基本情绪
          </motion.button>
          
          {Object.entries(categoryLabels).map(([categoryKey, categoryData], index) => (
            <motion.button
              key={categoryKey}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + (index + 1) * 0.1, duration: 0.5 }}
              onClick={() => setSelectedCategory(categoryKey)}
              className={`px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                selectedCategory === categoryKey 
                  ? `${categoryData.bgColor} ${categoryData.color} border-current shadow-lg` 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <span className="mr-2">{categoryData.icon}</span>
              {categoryData.label}
            </motion.button>
          ))}
        </div>

        {/* 显示更多情绪按钮 */}
        <div className="text-center mb-6">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            onClick={() => setShowAllEmotions(!showAllEmotions)}
            className="px-6 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 font-medium"
          >
            {showAllEmotions ? (
              <>
                <ChevronUp className="w-4 h-4 inline mr-2" />
                收起情绪选项
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 inline mr-2" />
                显示更多情绪 ({allEmotions.length}个)
              </>
            )}
          </motion.button>
        </div>

        {/* 情绪网格 */}
        <motion.div 
          layout
          className={`grid gap-4 max-w-6xl mx-auto mb-8 ${
            showAllEmotions 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' 
              : 'grid-cols-3 md:grid-cols-6'
          }`}
        >
          {(showAllEmotions 
            ? allEmotions.filter(emotion => 
                selectedCategory === null || emotion.category === selectedCategory
              )
            : allEmotions
                .filter(emotion => selectedCategory === null || emotion.category === selectedCategory)
                .slice(0, 12)
          ).map((emotion, index) => (
            <motion.button
              key={emotion.key}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: selectedEmotion === emotion.key ? 1.05 : 1,
                transition: { 
                  delay: index * 0.05,
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1] 
                }
              }}

              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] }
              }}
              onClick={() => handleEmotionSelect(emotion.key)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 ${emotion.color} ${
                selectedEmotion === emotion.key ? 'ring-4 ring-blue-500/30 shadow-xl' : 'shadow-md'
              } group relative overflow-hidden`}
            >
              {/* 情绪分数标签 */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Badge variant="secondary" className="text-xs bg-white/80 text-gray-700">
                  {emotion.score}分
                </Badge>
              </div>
              
              <div className="text-3xl mb-2">{emotion.emoji}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {emotion.label}
              </div>
              {showAllEmotions && (
                <div className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {emotion.description}
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
        
        {/* 选择反馈 */}
        {selectedEmotion && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-md mx-auto"
          >
            {(() => {
              const selectedEmotionData = allEmotions.find(e => e.key === selectedEmotion);
              const categoryData = selectedEmotionData ? categoryLabels[selectedEmotionData.category as keyof typeof categoryLabels] : null;
              
              return (
                <div className={`p-6 rounded-2xl border ${
                  categoryData ? `${categoryData.bgColor} border-current` : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`font-medium text-lg mb-3 ${
                    categoryData ? categoryData.color : 'text-blue-700'
                  }`}>
                    {getEmotionFeedback(selectedEmotion)}
                  </p>
                  <div className={`text-sm ${
                    categoryData ? categoryData.color : 'text-blue-600'
                  } opacity-70`}>
                    <p>评分已更新：{selectedEmotionData?.label} = {selectedEmotionData?.score}分</p>
                    <p className="mt-1">分类：{categoryData?.label}</p>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </motion.section>

      {/* Quick Actions - 主要功能入口 */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-apple-title mb-4">开始你的情绪之旅</h2>
          <p className="text-lg text-apple-body">选择一个方式，开始探索和管理你的情绪</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.9 + index * 0.1, 
                duration: 0.6, 
                ease: [0.16, 1, 0.3, 1] 
              }}

            >
              <Card 
                className="h-full card-apple rounded-3xl hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 overflow-hidden"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <action.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-medium text-apple-caption mb-2">{action.title}</h3>
                    <h4 className="text-2xl font-bold text-apple-title mb-4">{action.subtitle}</h4>
                    <p className="text-apple-body text-base leading-relaxed">{action.description}</p>
                  </div>
                  <Button 
                    className="btn-apple-primary group-hover:shadow-xl transition-all duration-300 rounded-full px-8"
                    size="lg"
                  >
                    立即开始
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Today's Stats - 简化的统计信息 */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-apple-title mb-4">你的成长轨迹</h2>
          <p className="text-lg text-apple-body">看看你在情绪管理路上的进步</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {todayStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 1.1 + index * 0.1, 
                duration: 0.5, 
                ease: [0.16, 1, 0.3, 1] 
              }}

            >
              <Card className="card-apple rounded-2xl hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-6 text-center">
                  <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                  <div className="text-3xl font-bold text-apple-title mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-apple-caption font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Motivational Footer */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center py-16"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-current mx-1" />
            ))}
          </div>
          <h3 className="text-2xl font-bold text-apple-title mb-4">每一天都是新的开始</h3>
          <p className="text-lg text-apple-body leading-relaxed">
            记住，情绪管理是一个持续的过程。每一次记录、每一次对话、每一次反思，都在让你变得更好。
            你已经在这条路上了，继续前进吧！
          </p>
        </div>
      </motion.section>
    </div>
  );
}