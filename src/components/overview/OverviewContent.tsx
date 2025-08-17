"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Clock,
  MessageCircle,
  Target,
  Zap,
  Sun,
  Moon,
  Star,
  Activity,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMoodStore, emotionCategories, getAllEmotions } from "@/store/mood";

// 情绪类型定义 - 使用更精致的渐变色和Apple风格
const emotionTypes = {
  happy: { 
    emoji: "😊", 
    label: "开心", 
    bgColor: "bg-gradient-to-br from-yellow-100 to-orange-100", 
    borderColor: "border-yellow-200/60",
    textColor: "text-yellow-600",
    shadowColor: "shadow-yellow-100"
  },
  calm: { 
    emoji: "😌", 
    label: "平静", 
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-100", 
    borderColor: "border-emerald-200/60",
    textColor: "text-emerald-600",
    shadowColor: "shadow-emerald-100"
  },
  neutral: { 
    emoji: "😐", 
    label: "一般", 
    bgColor: "bg-gradient-to-br from-slate-50 to-gray-100", 
    borderColor: "border-slate-200/60",
    textColor: "text-slate-500",
    shadowColor: "shadow-slate-100"
  },
  sad: { 
    emoji: "😔", 
    label: "难过", 
    bgColor: "bg-gradient-to-br from-blue-50 to-sky-100", 
    borderColor: "border-blue-200/60",
    textColor: "text-blue-500",
    shadowColor: "shadow-blue-100"
  },
  anxious: { 
    emoji: "😰", 
    label: "焦虑", 
    bgColor: "bg-gradient-to-br from-red-50 to-rose-100", 
    borderColor: "border-red-200/60",
    textColor: "text-red-500",
    shadowColor: "shadow-red-100"
  },
  tired: { 
    emoji: "😴", 
    label: "疲惫", 
    bgColor: "bg-gradient-to-br from-purple-50 to-violet-100", 
    borderColor: "border-purple-200/60",
    textColor: "text-purple-500",
    shadowColor: "shadow-purple-100"
  },
};

// 生成真实的情绪日历数据 - 从 mood store 获取
const generateMoodCalendar = (getDailyStats: (date: string) => any) => {
  // 使用当前日期
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const moodData = [];
  const allEmotions = getAllEmotions();

  // 生成本月的情绪数据 - 从真实数据获取
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = day === currentDate.getDate() && 
                    currentMonth === new Date().getMonth() && 
                    currentYear === new Date().getFullYear();
    
    // 获取该日期的情绪数据
    const dateString = date.toISOString().split('T')[0];
    const dailyStats = dateString ? getDailyStats(dateString) : null;
    
    let emotion = null;
    let intensity = 0;
    let hasData = false;
    
    if (dailyStats && dailyStats.dominantEmotion) {
      // 从 emotion categories 中找到对应的情绪
      const emotionData = allEmotions.find(e => e.key === dailyStats.dominantEmotion);
      if (emotionData) {
        // 将 emotion key 映射到 emotionTypes 的 key
        const mappedEmotion = mapEmotionToType(emotionData.key);
        if (mappedEmotion && emotionTypes[mappedEmotion as keyof typeof emotionTypes]) {
          emotion = mappedEmotion;
          intensity = Math.round(dailyStats.averageScore);
          hasData = true;
        }
      }
    }
    
    moodData.push({
      day,
      date,
      emotion,
      intensity,
      hasData,
      isToday
    });
  }

  return { moodData, startDayOfWeek, currentMonth, currentYear };
};

// 将 mood store 的情绪 key 映射到 emotionTypes 的 key
const mapEmotionToType = (emotionKey: string): string | null => {
  const mapping: Record<string, string> = {
    'happy': 'happy',
    'joyful': 'happy',
    'content': 'calm',
    'peaceful': 'calm',
    'calm': 'calm',
    'neutral': 'neutral',
    'contemplative': 'neutral',
    'tired': 'tired',
    'sad': 'sad',
    'lonely': 'sad',
    'disappointed': 'sad',
    'anxious': 'anxious',
    'worried': 'anxious',
    'stressed': 'anxious',
    'frustrated': 'anxious',
    'angry': 'anxious',
    'overwhelmed': 'anxious',
    'depressed': 'sad',
    'hopeless': 'sad',
    // 复杂情绪的映射
    'nostalgic': 'neutral',
    'jealous': 'anxious',
    'guilty': 'sad',
    'embarrassed': 'neutral',
    'confused': 'neutral',
    'surprised': 'happy',
    'shocked': 'anxious',
    'relieved': 'calm'
  };
  
  return mapping[emotionKey] || null;
};

const goals = [
  { title: "情绪稳定", current: 78, target: 85, improvement: "+12%" },
  { title: "压力管理", current: 65, target: 80, improvement: "+18%" },
  { title: "睡眠质量", current: 72, target: 85, improvement: "+8%" },
  { title: "社交信心", current: 58, target: 75, improvement: "+15%" },
];

const recentActivities = [
  { type: "聊天", time: "2小时前", description: "与AI助手进行了深度情绪探讨", icon: MessageCircle, color: "text-blue-500" },
  { type: "记录", time: "昨天", description: "记录了一次积极的情绪体验", icon: Heart, color: "text-red-500" },
  { type: "分析", time: "2天前", description: "查看了本周的情绪趋势分析", icon: BarChart3, color: "text-green-500" },
  { type: "目标", time: "3天前", description: "更新了个人成长目标", icon: Target, color: "text-purple-500" },
];

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export function OverviewContent() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const { getDailyStats } = useMoodStore();
  const { moodData, startDayOfWeek, currentMonth, currentYear } = generateMoodCalendar(getDailyStats);

  const handleDateClick = (dayData: any) => {
    if (dayData.hasData) {
      setSelectedDate(selectedDate === dayData.day ? null : dayData.day);
    }
  };

  const selectedDayData = moodData.find(day => day.day === selectedDate);
  const selectedEmotion = selectedDayData?.emotion
    ? emotionTypes[selectedDayData.emotion as keyof typeof emotionTypes]
    : undefined;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-apple-title">
          <span className="gradient-text-apple">数据概览</span>
        </h1>
        <p className="text-xl text-apple-body max-w-2xl mx-auto">
          深入了解你的情绪变化和心理健康状态
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: "今日情绪", value: "8.2", suffix: "/10", icon: Heart, color: "text-red-500", bg: "from-red-50 to-pink-50" },
          { label: "本月平均", value: "7.5", suffix: "/10", icon: TrendingUp, color: "text-green-500", bg: "from-green-50 to-emerald-50" },
          { label: "总对话数", value: "43", suffix: "次", icon: MessageCircle, color: "text-blue-500", bg: "from-blue-50 to-cyan-50" },
          { label: "连续天数", value: "12", suffix: "天", icon: Calendar, color: "text-purple-500", bg: "from-purple-50 to-pink-50" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.3 + index * 0.1, 
              duration: 0.5, 
              ease: [0.16, 1, 0.3, 1] 
            }}

          >
            <Card className={`card-apple rounded-apple-lg bg-gradient-to-br ${stat.bg} dark:from-gray-800/60 dark:to-gray-700/60 hover:shadow-xl transition-all duration-300`}>
              <CardContent className="spacing-apple-lg text-center">
                <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
                <div className="text-3xl font-bold text-apple-title text-gray-900 dark:text-white mb-1">
                  {stat.value}
                  <span className="text-lg text-apple-caption ml-1">{stat.suffix}</span>
                </div>
                <div className="text-sm text-apple-caption">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Emotion Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="card-apple rounded-apple-lg">
          <CardHeader className="spacing-apple-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-apple-title flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-500" />
                  情绪日历
                </CardTitle>
                <CardDescription className="text-apple-body text-lg mt-2">
                  本月每日情绪状态一览
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="btn-apple-secondary">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-lg font-semibold text-apple-title min-w-[120px] text-center">
                  {currentYear}年{monthNames[currentMonth]}
                </span>
                <Button variant="ghost" size="sm" className="btn-apple-secondary">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="spacing-apple-lg">
            {/* Calendar Grid */}
            <div className="space-y-4">
              {/* Week Header */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-apple-caption py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-3">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} className="w-16 h-16" />
                ))}
                
                {/* Month days */}
                {moodData.map((dayData, index) => {
                  const emotion = dayData.emotion ? emotionTypes[dayData.emotion as keyof typeof emotionTypes] : null;
                  const isSelected = selectedDate === dayData.day;
                  
    return (
                    <motion.div
                      key={dayData.day}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: 0.7 + index * 0.02, 
                        duration: 0.3, 
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                      whileTap={dayData.hasData ? { scale: 0.95 } : {}}
                      className="w-16 h-16"
                    >
                      <button
                        onClick={() => handleDateClick(dayData)}
                        disabled={!dayData.hasData}
                        className={[
                          "w-full h-full rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group",
                          dayData.hasData 
                            ? [emotion?.bgColor, emotion?.borderColor, emotion?.shadowColor, "hover:shadow-md cursor-pointer backdrop-blur-sm"].filter(Boolean).join(" ")
                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 cursor-not-allowed opacity-40",
                          isSelected ? "ring-2 ring-blue-400/60 shadow-lg scale-105" : "",
                          dayData.isToday ? "ring-2 ring-blue-500/80 shadow-blue-200/50" : ""
                        ].filter(Boolean).join(" ")}
                      >
                        {/* 日期数字 */}
                        <div className={[
                          "text-xs font-medium mb-0.5",
                          emotion?.textColor || "text-gray-400",
                          dayData.isToday ? "font-bold" : ""
                        ].filter(Boolean).join(" ")}>
                          {dayData.day}
                        </div>
                        
                        {/* 表情符号 */}
                        {emotion && (
                          <div className="text-xl leading-none transform group-hover:scale-110 transition-transform duration-200">
                            {emotion.emoji}
                          </div>
                        )}
                        
                        {/* 今日标记 */}
                        {dayData.isToday && (
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-gray-900 shadow-sm" />
                        )}
                        
                        {/* 选中状态的微光效果 */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-2xl" />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Info */}
            {selectedEmotion && selectedDayData && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 p-6 rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/50 dark:from-gray-800/80 dark:to-blue-900/20 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-5">
                    <div className={`
                      w-16 h-16 rounded-2xl border flex items-center justify-center shadow-md
                      ${selectedEmotion.bgColor}
                      ${selectedEmotion.borderColor}
                    `}>
                      <span className="text-3xl">
                        {selectedEmotion.emoji}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-apple-title mb-1">
                        {currentMonth + 1}月{selectedDayData.day}日
                      </h3>
                      <p className={`text-base font-medium ${selectedEmotion.textColor}`}>
                        {selectedEmotion.label}
                      </p>
                      <p className="text-sm text-apple-caption mt-1">
                        点击其他日期查看更多情绪记录
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-apple-title mb-1">
                      {selectedDayData.intensity}<span className="text-lg text-apple-caption">/10</span>
                    </div>
                    <div className="text-sm text-apple-caption">情绪强度</div>
                    <div className="mt-2 flex justify-end">
                      <div className="flex space-x-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < selectedDayData.intensity 
                                ? (selectedEmotion.bgColor.includes('yellow') ? 'bg-yellow-400'
                                : selectedEmotion.bgColor.includes('emerald') ? 'bg-emerald-400'
                                : selectedEmotion.bgColor.includes('slate') ? 'bg-slate-400'
                                : selectedEmotion.bgColor.includes('blue') ? 'bg-blue-400'
                                : selectedEmotion.bgColor.includes('red') ? 'bg-red-400'
                                : 'bg-purple-400')
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Emotion Legend */}
            <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <h4 className="text-lg font-semibold text-apple-title mb-6">情绪图例</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(emotionTypes).map(([key, emotion]) => (
                  <div key={key} className="flex items-center space-x-3 group">
                    <div className={`
                      w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-md
                      ${emotion.bgColor} ${emotion.borderColor} ${emotion.shadowColor}
                    `}>
                      <span className="text-sm">{emotion.emoji}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${emotion.textColor}`}>{emotion.label}</span>
                      <span className="text-xs text-apple-caption">{key}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="card-apple rounded-apple-lg h-full">
            <CardHeader className="spacing-apple-lg">
              <CardTitle className="text-2xl text-apple-title flex items-center gap-3">
                <Target className="w-6 h-6 text-green-500" />
                成长目标
              </CardTitle>
              <CardDescription className="text-apple-body text-lg">
                个人发展进度追踪
              </CardDescription>
            </CardHeader>
            <CardContent className="spacing-apple-lg">
              <div className="space-y-6">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.9 + index * 0.1, 
                      duration: 0.5, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-apple-title">{goal.title}</h4>
                      <Badge className="bg-green-500 text-white">
                        {goal.improvement}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-apple-caption">
                        <span>当前: {goal.current}%</span>
                        <span>目标: {goal.target}%</span>
                      </div>
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-2 bg-gray-200 dark:bg-gray-700"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="card-apple rounded-apple-lg h-full">
            <CardHeader className="spacing-apple-lg">
              <CardTitle className="text-2xl text-apple-title flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-500" />
                最近活动
              </CardTitle>
              <CardDescription className="text-apple-body text-lg">
                你的最新互动记录
              </CardDescription>
            </CardHeader>
            <CardContent className="spacing-apple-lg">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.9 + index * 0.1, 
                      duration: 0.5, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="flex items-start space-x-4 p-4 rounded-apple-md bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <div className={`p-2 rounded-apple-sm bg-white dark:bg-gray-800 shadow-sm`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-apple-title">{activity.type}</h4>
                        <span className="text-xs text-apple-caption">{activity.time}</span>
                      </div>
                      <p className="text-sm text-apple-body">{activity.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
        </div>
    );
}