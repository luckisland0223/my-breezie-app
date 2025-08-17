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
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 情绪分类的中文标签
const categoryLabels = {
  basic: { label: "基本情绪", icon: "🎯", color: "text-blue-600", bgColor: "bg-blue-50" },
  positive: { label: "积极情绪", icon: "🌟", color: "text-green-600", bgColor: "bg-green-50" },
  neutral: { label: "中性情绪", icon: "⚖️", color: "text-gray-600", bgColor: "bg-gray-50" },
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

export function HomePage() {
  const router = useRouter();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // 获取所有情绪数据
  const allEmotions = getAllEmotions();
  
  // 按分类组织情绪数据
  const emotionsByCategory = Object.keys(categoryLabels).reduce((acc, category) => {
    acc[category] = allEmotions.filter(emotion => emotion.category === category);
    return acc;
  }, {} as Record<string, typeof allEmotions>);
  
  // 每个分类默认显示的情绪数量
  const DEFAULT_VISIBLE_COUNT = 4;
  
  // 获取情绪数据
  const {
    recordEmotionSelect
  } = useMoodStore();



  // 处理情绪选择
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

  // 处理分类选择
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // 处理分类展开/折叠
  const toggleCategoryExpansion = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 获取分类中可见的情绪
  const getVisibleEmotions = (category: string) => {
    const emotions = emotionsByCategory[category] || [];
    const isExpanded = expandedCategories.has(category);
    return isExpanded ? emotions : emotions.slice(0, DEFAULT_VISIBLE_COUNT);
  };

  // 检查分类是否有更多情绪
  const hasMoreEmotions = (category: string) => {
    const emotions = emotionsByCategory[category] || [];
    return emotions.length > DEFAULT_VISIBLE_COUNT;
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





        {/* 分类情绪选择器 */}
        <div className="max-w-4xl mx-auto space-y-6 mb-8">
          {Object.entries(categoryLabels).map(([category, categoryData]) => {
            const emotions = emotionsByCategory[category] || [];
            const visibleEmotions = getVisibleEmotions(category);
            const hasMore = hasMoreEmotions(category);
            const isExpanded = expandedCategories.has(category);
            
            if (emotions.length === 0) return null;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                  selectedCategory === category 
                    ? `${categoryData.bgColor} border-current shadow-lg` 
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                {/* 分类标题 */}
                <div 
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{categoryData.icon}</span>
                    <h3 className={`text-lg font-semibold ${categoryData.color}`}>
                      {categoryData.label}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {emotions.length}个
                    </Badge>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      selectedCategory === category ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                
                {/* 情绪网格 */}
                {selectedCategory === category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {visibleEmotions.map((emotion) => (
                        <button
                          key={emotion.key}
                          onClick={() => handleEmotionSelect(emotion.key)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedEmotion === emotion.key 
                              ? 'ring-4 ring-blue-500/30 shadow-lg border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          } group`}
                        >
                          <div className="text-2xl mb-1">{emotion.emoji}</div>
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {emotion.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {emotion.score}分
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* 展开/折叠按钮 */}
                    {hasMore && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleCategoryExpansion(category)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>收起</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>查看更多 ({emotions.length - DEFAULT_VISIBLE_COUNT}个)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        
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