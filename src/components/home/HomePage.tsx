"use client";

import { useState, useEffect } from "react";
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
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>('basic'); // 默认选中基本情绪
  const [showActionDialog, setShowActionDialog] = useState(false);
  
  // 获取所有情绪数据
  const allEmotions = getAllEmotions();

  
  // 按分类组织情绪数据
  const emotionsByCategory = Object.keys(categoryLabels).reduce((acc, category) => {
    acc[category] = allEmotions.filter(emotion => emotion.category === category);

    return acc;
  }, {} as Record<string, typeof allEmotions>);
  
  // 获取情绪数据
  const {
    recordEmotionSelect
  } = useMoodStore();



  // 处理情绪选择（仅选择，不立即保存）
  const handleEmotionSelect = (emotionKey: string) => {
    setSelectedEmotion(emotionKey);
  };

  // 确认情绪选择
  const handleConfirmEmotion = () => {
    if (!selectedEmotion) return;
    
    // 找到选择的情绪信息
    const selectedEmotionData = allEmotions.find(e => e.key === selectedEmotion);
    
    // 记录情绪选择到状态管理
    recordEmotionSelect(selectedEmotion as any, `用户在首页选择了${selectedEmotionData?.label}情绪`);
    
    // 显示成功提示
    const emotionLabel = selectedEmotionData?.label || '情绪';
    toast.success(`已记录你的${emotionLabel}状态`, {
      description: "你的情绪数据已保存，继续保持记录习惯吧！",
      duration: 3000,
    });

    // 不再自动跳转，而是显示询问选项
    setShowActionDialog(true);
  };

  // 处理用户选择的后续行动
  const handleActionChoice = (action: 'diary' | 'chat' | 'stay') => {
    setShowActionDialog(false);
    setSelectedEmotion(null);
    
    if (action === 'diary') {
      router.push('/diary');
    } else if (action === 'chat') {
      router.push('/chat');
    }
    // 如果选择 'stay'，则什么都不做，留在当前页面
  };

  // 处理分类选择
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // 获取分类中的所有情绪
  const getVisibleEmotions = (category: string) => {
    const emotions = emotionsByCategory[category] || [];

    return emotions;
  };

  const getEmotionFeedback = (emotionKey: string) => {
    const selectedEmotionData = allEmotions.find(e => e.key === emotionKey);
    if (!selectedEmotionData) return "已记录你的情绪状态";
    
    const { category, score, label } = selectedEmotionData;
    
    if (category === 'positive') {
      return `${label}是很美好的感受 ✨`;
    } else if (category === 'negative') {
      return `我理解你现在${label}的感受 💙`;
    } else if (category === 'neutral') {
      return `${label}是一种很真实的状态 🌿`;
    } else if (category === 'complex') {
      return `${label}是复杂的情感体验 🤗`;
    }
    
    return "已记录你的情绪状态";
  };

  return (
    <div className="space-y-16 max-w-6xl mx-auto">
      {/* Hero Section - 更简洁的欢迎区域 */}
      <section className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
          <Heart className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-apple-title mb-6">
          <span className="gradient-text-apple">你好，朋友</span>
        </h1>
        
        <p className="text-xl text-apple-body max-w-2xl mx-auto leading-relaxed">
          欢迎来到你的情绪疏导空间。在这里，每一种感受都被理解，每一次成长都被记录。
        </p>
      </section>

      {/* Enhanced Emotion Selection - 分类情绪选择 */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-apple-title mb-4">今天的你感觉如何？</h2>
          <p className="text-lg text-apple-body">选择一个最贴近你现在心情的情绪</p>
        </div>





        {/* 分类选择器 */}
        <div className="max-w-6xl mx-auto mb-8 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {Object.entries(categoryLabels).map(([category, categoryData]) => {
              const emotions = emotionsByCategory[category] || [];
              if (emotions.length === 0) return null;
              
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                    selectedCategory === category 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-lg' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{categoryData.icon}</span>
                  <span className="font-medium">{categoryData.label}</span>
                </button>
              );
            })}
          </div>

          {/* 情绪网格 */}
          {selectedCategory && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-center gap-4">
                {getVisibleEmotions(selectedCategory).map((emotion) => (
                  <button
                    key={emotion.key}
                    onClick={() => handleEmotionSelect(emotion.key)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedEmotion === emotion.key 
                        ? 'ring-4 ring-blue-500/30 shadow-lg border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : (() => {
                            const categoryData = categoryLabels[emotion.category as keyof typeof categoryLabels];
                            return `${categoryData?.bgColor || 'bg-gray-50'} border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600`;
                          })()
                    } group min-h-[100px] min-w-[100px] flex flex-col items-center justify-center`}
                  >
                    <div className="text-3xl mb-2">{emotion.emoji}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      {emotion.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {emotion.score}分
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* 选择确认 */}
        {selectedEmotion && (
          <div className="text-center max-w-lg mx-auto">
            {(() => {
              const selectedEmotionData = allEmotions.find(e => e.key === selectedEmotion);
              
              return (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-6xl mb-4">
                    {selectedEmotionData?.emoji}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedEmotionData?.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    {selectedEmotionData?.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleConfirmEmotion}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      确认记录
                    </Button>
                    <Button 
                      onClick={() => setSelectedEmotion(null)}
                      variant="outline"
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300"
                    >
                      重新选择
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* Quick Actions - 主要功能入口 */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-apple-title mb-4">开始你的情绪之旅</h2>
          <p className="text-lg text-apple-body">选择一个方式，开始探索和管理你的情绪</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <div
              key={action.title}

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
            </div>
          ))}
        </div>
      </section>



      {/* Motivational Footer */}
      <section className="text-center py-16">
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
      </section>

      {/* 询问后续行动的对话框 */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
              情绪已记录 ✨
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400 mt-2">
              接下来你想要做什么？
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              onClick={() => handleActionChoice('diary')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              写日记记录今天
            </Button>
            
            <Button 
              onClick={() => handleActionChoice('chat')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-xl text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              和AI助手聊聊
            </Button>
            
            <Button 
              onClick={() => handleActionChoice('stay')}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-xl text-base font-medium transition-all duration-300"
            >
              暂时不需要，继续浏览
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}