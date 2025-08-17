"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Target,
  Brain,
  Heart,
  Clock,
  Zap
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 空的数据数组 - 使用真实用户数据
const moodTrendData: Array<{ date: string; mood: number; sessions: number }> = [];

// 空的情绪分布数据 - 使用真实用户数据
const emotionDistribution: Array<{ name: string; value: number; color: string }> = [];

// 颜色方案已移除 - 等待真实用户数据

// 空的数据数组 - 使用真实用户数据
const weeklyActivity: Array<{ day: string; conversations: number; duration: number }> = [];

const improvementAreas: Array<{ area: string; current: number; target: number; improvement: string }> = [];

const insights: Array<{ icon: any; title: string; description: string; type: string }> = [];

export function AnalyticsView() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  
  // 使用空数组作为默认值
  const currentEmotionData = emotionDistribution;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-apple-title">
          <span className="gradient-text-apple">分析统计</span>
        </h1>
        <p className="text-xl text-apple-body max-w-2xl mx-auto">
          深入了解你的情绪变化和心理健康趋势
        </p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center gap-3 mt-6"
        >
          {["week", "month", "quarter"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "btn-apple-primary" : "btn-apple-secondary"}
            >
              {period === "week" ? "本周" : period === "month" ? "本月" : "本季度"}
            </Button>
          ))}
        </motion.div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="card-apple rounded-apple-lg bg-gradient-to-r from-blue-50/60 to-purple-50/60 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/30 dark:border-blue-800/30">
          <CardHeader className="spacing-apple-lg">
            <CardTitle className="flex items-center gap-3 text-2xl text-apple-title">
              <Brain className="w-6 h-6 text-blue-600" />
              AI 智能洞察
            </CardTitle>
            <CardDescription className="text-apple-body text-lg">
              基于你的数据分析生成的个性化见解
            </CardDescription>
          </CardHeader>
          <CardContent className="spacing-apple-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.4 + index * 0.1, 
                    duration: 0.5, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}

                  className="card-apple rounded-apple-md spacing-apple-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-apple-sm bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      <insight.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-semibold text-apple-title text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-apple-body leading-relaxed">
                        {insight.description}
                      </p>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1">
                        {insight.type === "pattern" ? "模式分析" : 
                         insight.type === "achievement" ? "成就解锁" : "个性建议"}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Tabs defaultValue="trends" className="space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <TabsList className="grid w-full grid-cols-4 card-apple rounded-apple-lg p-2 shadow-lg max-w-2xl mx-auto">
              <TabsTrigger value="trends" className="rounded-apple-md text-apple-body font-medium">情绪趋势</TabsTrigger>
              <TabsTrigger value="distribution" className="rounded-apple-md text-apple-body font-medium">情绪分布</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-apple-md text-apple-body font-medium">活动统计</TabsTrigger>
              <TabsTrigger value="improvement" className="rounded-apple-md text-apple-body font-medium">改善追踪</TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="trends">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="card-apple rounded-apple-lg shadow-xl">
                <CardHeader className="spacing-apple-lg">
                  <CardTitle className="flex items-center gap-3 text-2xl text-apple-title">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    情绪趋势分析
                  </CardTitle>
                  <CardDescription className="text-apple-body text-lg">
                    你的情绪变化趋势和对话频率
                  </CardDescription>
                </CardHeader>
                <CardContent className="spacing-apple-lg">
                  <div className="h-96 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(20px)'
                          }}
                          labelStyle={{ color: '#374151', fontWeight: '600' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fill="url(#moodGradient)"
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="distribution">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {/* 颜色方案选择器已移除 - 等待真实数据 */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 大号饼图 */}
                <Card className="card-apple rounded-apple-lg shadow-xl">
                  <CardHeader className="spacing-apple-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl text-apple-title">
                      <Heart className="w-6 h-6 text-red-500" />
                      情绪分布图
                    </CardTitle>
                    <CardDescription className="text-apple-body text-lg">
                      各种情绪的占比分析
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="spacing-apple-lg">
                    <div className="h-96 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            {currentEmotionData.map((entry, index) => (
                              <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: entry.color, stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: entry.color, stopOpacity: 0.8 }} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={currentEmotionData}
                            cx="50%"
                            cy="50%"
                            outerRadius={140}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            labelLine={false}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth={2}
                          >
                            {currentEmotionData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#gradient-${index})`}
                                style={{
                                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                                }}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: 'none', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                              backdropFilter: 'blur(20px)'
                            }}
                            labelStyle={{ color: '#374151', fontWeight: '600' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* 情绪详细分析 */}
                <Card className="card-apple rounded-apple-lg shadow-xl">
                  <CardHeader className="spacing-apple-lg">
                    <CardTitle className="text-2xl text-apple-title">情绪详细分析</CardTitle>
                    <CardDescription className="text-apple-body text-lg">
                      每种情绪的具体数据和趋势
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="spacing-apple-lg">
                    <div className="space-y-4">
                      {currentEmotionData.map((emotion, index) => (
                        <motion.div 
                          key={emotion.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="group p-5 rounded-2xl bg-gradient-to-r from-white/80 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-700/50 hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div 
                                  className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center"
                                  style={{ backgroundColor: emotion.color }}
                                >
                                  <span className="text-white font-bold text-lg">
                                    {emotion.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="absolute -inset-1 rounded-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                                     style={{ backgroundColor: emotion.color, filter: 'blur(4px)' }} />
                              </div>
                              <div>
                                <span className="font-bold text-lg text-apple-title">{emotion.name}</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${emotion.value}%` }}
                                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                      className="h-full rounded-full"
                                      style={{ backgroundColor: emotion.color }}
                                    />
                                  </div>
                                  <span className="text-xs text-apple-caption">{emotion.value}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-apple-title">{emotion.value}%</div>
                              <div className="text-sm text-apple-caption">
                                {Math.round(emotion.value * 0.43)} 次记录
                              </div>
                              <div className="text-xs text-apple-caption mt-1">
                                较上月 {Math.random() > 0.5 ? '+' : '-'}{Math.floor(Math.random() * 10)}%
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* 情绪分析总结 */}
                    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/30 dark:border-blue-800/30">
                      <h4 className="font-bold text-lg text-apple-title mb-3">📊 分析洞察</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-apple-title">主导情绪：</span>
                          <span className="text-apple-body ml-2">
                            {currentEmotionData.reduce((prev, current) => 
                              prev.value > current.value ? prev : current
                            ).name} ({currentEmotionData.reduce((prev, current) => 
                              prev.value > current.value ? prev : current
                            ).value}%)
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-apple-title">情绪稳定性：</span>
                          <span className="text-apple-body ml-2">
                            {currentEmotionData.filter(e => ['开心', '平静'].includes(e.name))
                              .reduce((sum, e) => sum + e.value, 0) > 50 ? '良好' : '需关注'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="activity">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="card-apple rounded-apple-lg shadow-xl">
                <CardHeader className="spacing-apple-lg">
                  <CardTitle className="flex items-center gap-3 text-2xl text-apple-title">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    每周活动统计
                  </CardTitle>
                  <CardDescription className="text-apple-body text-lg">
                    对话次数和时长分析
                  </CardDescription>
                </CardHeader>
                <CardContent className="spacing-apple-lg">
                  <div className="h-96 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyActivity} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                        <XAxis 
                          dataKey="day" 
                          stroke="#6b7280" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            backdropFilter: 'blur(20px)'
                          }}
                          labelStyle={{ color: '#374151', fontWeight: '600' }}
                        />
                        <Bar dataKey="conversations" fill="#3b82f6" name="对话次数" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="duration" fill="#8b5cf6" name="时长(分钟)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="improvement">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="card-apple rounded-apple-lg shadow-xl">
                <CardHeader className="spacing-apple-lg">
                  <CardTitle className="flex items-center gap-3 text-2xl text-apple-title">
                    <Target className="w-6 h-6 text-green-600" />
                    改善追踪
                  </CardTitle>
                  <CardDescription className="text-apple-body text-lg">
                    各个方面的进步情况
                  </CardDescription>
                </CardHeader>
                <CardContent className="spacing-apple-lg">
                  <div className="space-y-6">
                    {improvementAreas.map((area, index) => (
                      <motion.div
                        key={area.area}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="p-6 rounded-apple-lg bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/20 dark:to-blue-900/20"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-apple-title">{area.area}</h4>
                          <Badge className="bg-green-500 text-white px-3 py-1">
                            {area.improvement}
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-apple-caption">
                            <span>当前: {area.current}%</span>
                            <span>目标: {area.target}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(area.current / area.target) * 100}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full shadow-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}