"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMoodStore, getAllEmotions } from "@/store/mood";

// 本地日期格式工具
const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

export function AnalyticsView() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showAllEmotions, setShowAllEmotions] = useState(false);
  const { moodRecords, getDailyStats, calculateDailyScore } = useMoodStore();

  // 区间日期
  const rangeDates = useMemo(() => {
    const now = new Date();
    const days = 30;
    const arr: Date[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      arr.push(d);
    }
    return arr;
  }, []);

  // 情绪趋势（按天）
  const moodTrendData = useMemo(() => {
    return rangeDates.map((d) => {
      const ds = fmt(d);
      const stats = getDailyStats(ds);
      const sessions = stats ? (stats.records || []).filter((r: any) => r.type === 'chat_analysis').length : 0;
      return {
        date: ds.slice(5),
        mood: calculateDailyScore(ds) || 0,
        sessions,
      };
    });
  }, [rangeDates, getDailyStats, calculateDailyScore]);

  // 情绪分布（区间）
  const emotionDistribution = useMemo(() => {
    const all = getAllEmotions();
    const keyToMeta = new Map(all.map(e => [e.key, e]));
    const start = fmt(rangeDates[0] || new Date());
    const end = fmt(rangeDates[rangeDates.length - 1] || new Date());
    const byKey: Record<string, number> = {};
    for (const r of moodRecords) {
      const ds = fmt(new Date(r.timestamp));
      if (ds >= start && ds <= end && r.type === 'emotion_select' && r.source) {
        const key = String(r.source);
        byKey[key] = (byKey[key] || 0) + 1;
      }
    }
    const total = Object.values(byKey).reduce((a, b) => a + b, 0) || 1;
    // 类别固定颜色
    const categoryColor: Record<string, string> = {
      basic: '#38bdf8',    // 天蓝
      positive: '#22c55e', // 绿色
      neutral: '#94a3b8',  // 石板灰
      negative: '#f97316', // 橙红
      complex: '#a855f7',  // 紫色
    };
    const categoryOrder: Record<string, number> = {
      positive: 0,
      neutral: 1,
      basic: 2,
      complex: 3,
      negative: 4,
    };
    const items = Object.entries(byKey).map(([key, count]) => {
      const meta = keyToMeta.get(key);
      const name = meta?.label || key;
      const category = meta?.category || 'neutral';
      const color = categoryColor[category] || '#64748b';
      return {
        name,
        value: Math.round((count / total) * 100),
        color,
        category,
        emoji: meta?.emoji || '🙂',
        _order: categoryOrder[category] ?? 99,
      };
    });
    // 同一类别靠在一起：按类别顺序排序；同类别内按占比降序
    items.sort((a: any, b: any) => a._order - b._order || b.value - a.value);
    return items as Array<{ name: string; value: number; color: string; category: string; emoji: string }>;
  }, [moodRecords, rangeDates]);

  // 类别中文名与图标
  const categoryNames: Record<string, string> = {
    positive: '积极',
    neutral: '中性',
    basic: '基础',
    complex: '复杂',
    negative: '消极',
  };
  const categoryEmojis: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    basic: '🌈',
    complex: '🧩',
    negative: '⚠️',
  };

  // 聚合为“类别分布”用于饼图与简化列表
  const categoryDistribution = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of emotionDistribution) {
      totals[e.category] = (totals[e.category] || 0) + e.value;
    }
    const list = Object.entries(totals).map(([category, value]) => ({
      category,
      name: categoryNames[category] || category,
      value: Math.round(value),
      color: ((): string => {
        const map: Record<string, string> = {
          basic: '#38bdf8',
          positive: '#22c55e',
          neutral: '#94a3b8',
          negative: '#f97316',
          complex: '#a855f7',
        };
        return map[category] || '#64748b';
      })(),
    }));
    list.sort((a, b) => b.value - a.value);
    return list as Array<{ category: string; name: string; value: number; color: string }>;
  }, [emotionDistribution]);

  // 分组的全部情绪（用于弹窗详细）
  const emotionsByCategory = useMemo(() => {
    const groups: Record<string, Array<{ name: string; value: number; color: string; category: string; emoji?: string }>> = {};
    for (const e of emotionDistribution) {
      if (!groups[e.category]) groups[e.category] = [];
      groups[e.category].push(e as any);
    }
    Object.values(groups).forEach(arr => arr.sort((a, b) => b.value - a.value));
    return groups;
  }, [emotionDistribution]);

  // 每周活动（最近7天）
  const weeklyActivity = useMemo(() => {
    const last7: Date[] = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); last7.push(d); }
    const weekNames = ['周日','周一','周二','周三','周四','周五','周六'];
    return last7.map((d) => {
      const ds = fmt(d);
      const stats = getDailyStats(ds);
      const conversations = stats ? (stats.records || []).filter((r: any) => r.type === 'chat_analysis').length : 0;
      const duration = conversations * 3; // 估算
      return { day: weekNames[d.getDay()], conversations, duration };
    });
  }, [getDailyStats]);

  // 活动统计汇总（最近30天）
  const activitySummary = useMemo(() => {
    const start = fmt(rangeDates[0] || new Date());
    const end = fmt(rangeDates[rangeDates.length - 1] || new Date());
    // 生成日期->是否有记录
    const dayMap: Record<string, number> = {};
    for (const d of rangeDates) {
      dayMap[fmt(d)] = 0;
    }
    let totalConversations = 0;
    for (const r of moodRecords) {
      if (r.type !== 'chat_analysis') continue;
      const ds = fmt(new Date(r.timestamp));
      if (ds >= start && ds <= end) {
        totalConversations += 1;
        if (dayMap[ds] !== undefined) dayMap[ds] += 1;
      }
    }
    const activeDays = Object.values(dayMap).filter(c => c > 0).length;
    const avgPerDay = Math.round((totalConversations / rangeDates.length) * 10) / 10;
    // 最长连续天数
    let longest = 0; let current = 0;
    for (const d of rangeDates) {
      const ds = fmt(d);
      if ((dayMap[ds] || 0) > 0) { current += 1; longest = Math.max(longest, current); } else { current = 0; }
    }
    const bestDay = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0];
    return {
      totalConversations,
      avgPerDay,
      activeDays,
      longestStreak: longest,
      peakDay: bestDay && bestDay[1] > 0 ? bestDay[0] : null,
    };
  }, [moodRecords, rangeDates]);

  // 改善追踪
  const improvementAreas = useMemo(() => {
    const len = moodTrendData.length;
    if (len < 7) return [] as Array<{ area: string; current: number; target: number; improvement: string }>;
    const thisAvg = Math.round((moodTrendData.slice(-7).reduce((a, b) => a + b.mood, 0) / 7) * 10) / 10;
    const prevAvg = len >= 14 ? (moodTrendData.slice(-14, -7).reduce((a, b) => a + b.mood, 0) / 7) : 0;
    const improve = prevAvg ? Math.round(((thisAvg - prevAvg) / prevAvg) * 100) : 0;
    const positiveRate = emotionDistribution
      .filter(e => ["开心","安详","满足","平静","喜悦"].some(n => e.name.includes(n)))
      .reduce((a, b) => a + b.value, 0);
    // 坚持度（最近30天有记录的天数）
    const adherence = Math.round((activitySummary.activeDays / rangeDates.length) * 100);
    // 情绪稳定性（分数波动越小越好）
    const scores = moodTrendData.map(m => m.mood).filter(n => n > 0);
    let stability = 0;
    if (scores.length > 1) {
      const mean = scores.reduce((a,b)=>a+b,0) / scores.length;
      const variance = scores.reduce((a,b)=> a + Math.pow(b-mean,2), 0) / (scores.length - 1);
      const sd = Math.sqrt(variance);
      // 假设最大波动 ~3，将其映射到 0-100 稳定度
      stability = Math.max(0, Math.min(100, Math.round((1 - (sd / 3)) * 100)));
    }
    return [
      { area: '平均得分', current: Math.round(thisAvg), target: 8, improvement: `${improve >= 0 ? '+' : ''}${improve}%` },
      { area: '积极情绪占比', current: positiveRate, target: 60, improvement: positiveRate >= 60 ? '达标' : '提升中' },
      { area: '坚持度（打卡天数）', current: adherence, target: 80, improvement: adherence >= 80 ? '良好' : '继续保持' },
      { area: '情绪稳定性', current: stability, target: 70, improvement: stability >= 70 ? '稳定' : '波动偏大' },
    ];
  }, [moodTrendData, emotionDistribution, activitySummary.activeDays, rangeDates.length]);

  // 洞察
  const insights = useMemo(() => {
    const items: Array<{ icon: any; title: string; description: string; type: string }> = [];
    if (emotionDistribution.length > 0) {
      const top = emotionDistribution.reduce((p, c) => (c.value > p.value ? c : p));
      items.push({ icon: Heart, title: `主导情绪：${top.name}`, description: `最近更常出现「${top.name}」。留意触发情境并记录。`, type: 'pattern' });
    }
    if (improvementAreas.length > 0) {
      const avg = improvementAreas.find(i => i.area === '平均得分');
      if (avg) items.push({ icon: TrendingUp, title: `平均得分 ${avg.current}/10`, description: `较上期 ${avg.improvement}。持续稳定作息与记录。`, type: 'achievement' });
    }
    // 积极情绪占比
    const positiveRate = emotionDistribution
      .filter(e => ['开心','安详','满足','平静','喜悦'].some(n => e.name.includes(n)))
      .reduce((a, b) => a + b.value, 0);
    items.push({ icon: Heart, title: `积极情绪占比 ${positiveRate}%`, description: positiveRate >= 60 ? '状态良好，继续保持正向活动。' : '可尝试安排放松/运动等提升情绪的活动。', type: 'ratio' });
    // 坚持度
    const adherence = Math.round((activitySummary.activeDays / rangeDates.length) * 100);
    items.push({ icon: Calendar, title: `坚持度 ${adherence}%`, description: `最近 ${activitySummary.activeDays} 天有记录，最长连续 ${activitySummary.longestStreak} 天。`, type: 'consistency' });
    // 稳定性
    const stabilityItem = improvementAreas.find(i => i.area === '情绪稳定性');
    if (stabilityItem) items.push({ icon: Brain, title: `情绪稳定性 ${stabilityItem.current}%`, description: stabilityItem.current >= 70 ? '波动较小，整体稳定。' : '波动偏大，建议规律作息与情绪记录。', type: 'stability' });
    // 峰值日
    if (activitySummary.peakDay) items.push({ icon: Zap, title: `活跃峰值日 ${String(activitySummary.peakDay).slice(5)}`, description: '这一天互动最频繁，可回顾当天的情绪与事件。', type: 'activity' });
    return items;
  }, [emotionDistribution, improvementAreas, activitySummary, rangeDates.length]);

  const currentEmotionData = emotionDistribution;

  // 精选 4-5 个条目，尽可能覆盖不同类别
  const detailedEmotionData = useMemo(() => {
    const source = currentEmotionData || [];
    if (source.length <= 5) return source;
    const sortedByValue = [...source].sort((a: any, b: any) => b.value - a.value);
    const selected: any[] = [];
    const usedNames = new Set<string>();
    const usedCategories = new Set<string>();
    const targetCount = Math.min(5, Math.max(4, sortedByValue.length));

    for (const item of sortedByValue) {
      if (!usedCategories.has(item.category)) {
        selected.push(item);
        usedCategories.add(item.category);
        usedNames.add(item.name);
        if (selected.length >= targetCount) break;
      }
    }
    if (selected.length < targetCount) {
      for (const item of sortedByValue) {
        if (!usedNames.has(item.name)) {
          selected.push(item);
          usedNames.add(item.name);
          if (selected.length >= targetCount) break;
        }
      }
    }
    return selected;
  }, [currentEmotionData]);

  // 图表仅展示每个类别占比最大的情绪
  const chartEmotionData = useMemo(() => {
    const byCategory: Record<string, { name: string; value: number; color: string; category: string; emoji: string }> = {};
    for (const item of currentEmotionData) {
      const existing = byCategory[item.category];
      if (!existing || item.value > existing.value) {
        byCategory[item.category] = item as any;
      }
    }
    return Object.values(byCategory).filter(e => e.value > 0).sort((a, b) => b.value - a.value);
  }, [currentEmotionData]);

  // 用于决定哪些切片展示文字标签：仅各类别占比最大的情绪
  const topLabelKeys = useMemo(() => {
    return new Set(chartEmotionData.map(e => `${e.category}__${e.name}`));
  }, [chartEmotionData]);

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
        {/* 已移除周/月/季度切换，默认展示最近30天 */}
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
              {insights.length > 0 ? insights.map((insight, index) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="card-apple rounded-apple-md spacing-apple-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-apple-sm bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                      <insight.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-apple-title text-gray-900 dark:text-white text-lg">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-apple-body leading-relaxed font-medium">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">暂无分析洞察</h4>
                  <p className="text-sm text-gray-500">继续使用应用，我们将为您生成个性化的情绪分析报告</p>
                </div>
              )}
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
        <Tabs defaultValue="trends" className="space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-white/70 dark:bg-gray-800/70 p-1.5 text-gray-500 dark:text-gray-400 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-w-fit">
              <TabsTrigger 
                value="trends" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 gap-2 min-w-[120px]"
              >
                <TrendingUp className="w-4 h-4" />
                情绪趋势
              </TabsTrigger>
              <TabsTrigger 
                value="distribution" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 gap-2 min-w-[120px]"
              >
                <Heart className="w-4 h-4" />
                情绪分布
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 gap-2 min-w-[120px]"
              >
                <BarChart3 className="w-4 h-4" />
                活动统计
              </TabsTrigger>
              <TabsTrigger 
                value="improvement" 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 gap-2 min-w-[120px]"
              >
                <Target className="w-4 h-4" />
                改善追踪
              </TabsTrigger>
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
                    你的情绪变化趋势
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

              <div className="space-y-8">
                {/* 大号饼图 */}
                <Card className="card-apple rounded-apple-lg shadow-xl">
                  <CardHeader className="spacing-apple-lg">
                    <CardTitle className="flex items-center gap-3 text-2xl text-apple-title">
                      <Heart className="w-6 h-6 text-red-500" />
                      情绪类别分布
                    </CardTitle>
                    <CardDescription className="text-apple-body text-lg">
                      展示五大情绪类别（积极/中性/基础/复杂/消极）的占比；仅为每个类别的代表情绪显示标签
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="spacing-apple-lg">
                    <div className="h-96 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            {currentEmotionData.length > 0 && currentEmotionData.map((entry, index) => (
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
                            label={({ name, percent, payload }) => {
                              const key = `${payload.category}__${name}`;
                              if (topLabelKeys.has(key)) {
                                const cat = payload.category as string;
                                const catName = categoryNames[cat] || cat;
                                return `${catName}：${name} ${((percent || 0) * 100).toFixed(0)}%`;
                              }
                              return '';
                            }}
                            labelLine={false}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth={2}
                          >
                            {currentEmotionData.length > 0 && currentEmotionData.map((entry, index) => (
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
                    <div className="flex items-center justify-between">
                      <div>
                    <CardTitle className="text-2xl text-apple-title">情绪类别概览</CardTitle>
                    <CardDescription className="text-apple-body text-lg">
                      按类别查看占比与代表情绪
                    </CardDescription>
                      </div>
                      {currentEmotionData.length > detailedEmotionData.length && (
                        <Button variant="outline" onClick={() => setShowAllEmotions(true)} className="rounded-xl">
                          查看全部
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="spacing-apple-lg">
                    <div className="space-y-4">
                      {categoryDistribution.length > 0 ? (showAllEmotions ? categoryDistribution : categoryDistribution).map((cat, index) => (
                        <motion.div 
                          key={cat.category}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="group p-5 rounded-2xl bg-gradient-to-r from-white/80 to-gray-50/50 dark:from-gray-800/80 dark:to-gray-700/50 hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div 
                                  className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center text-xl"
                                  style={{ backgroundColor: cat.color }}
                                >
                                  <span className="text-white">
                                    {categoryEmojis[cat.category] || '🙂'}
                                  </span>
                                </div>
                                <div className="absolute -inset-1 rounded-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"
                                     style={{ backgroundColor: cat.color, filter: 'blur(4px)' }} />
                              </div>
                              <div>
                                <span className="font-bold text-lg text-apple-title">{cat.name}</span>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-apple-caption">{cat.value}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-apple-title">{cat.value}%</div>
                              <div className="text-sm text-apple-caption">
                                类别占比
                              </div>
                              <div className="text-xs text-apple-caption mt-1">
                                点击查看该类别所有情绪
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-12">
                          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">暂无情绪数据</h4>
                          <p className="text-sm text-gray-500">开始记录您的情绪，我们将为您生成详细的分析报告</p>
                        </div>
                      )}
                    </div>
                    
                    {/* 已移除情绪分析洞察总结，根据需求仅保留类别列表与弹窗 */}
                  </CardContent>
                </Card>

                {/* 查看全部弹窗（按类别展开全部情绪） */}
                <Dialog open={showAllEmotions} onOpenChange={setShowAllEmotions}>
                  <DialogContent className="sm:max-w-2xl rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>全部情绪</DialogTitle>
                      <DialogDescription>最近 30 天各类别内的情绪占比</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto space-y-6 pr-1">
                      {Object.entries(emotionsByCategory).map(([category, list]) => (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center gap-2 px-1">
                            <span className="text-lg">{categoryEmojis[category] || '🙂'}</span>
                            <span className="font-semibold text-apple-title">{categoryNames[category] || category}</span>
                          </div>
                          <div className="space-y-2">
                            {list.map((emotion, idx) => (
                              <div key={`${category}-${emotion.name}-${idx}`} className="p-3 rounded-xl border bg-white/70 dark:bg-gray-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: emotion.color }}>
                                    <span className="text-white">{emotion.emoji || '🙂'}</span>
                                  </div>
                                  <div className="font-medium text-apple-title">{emotion.name}</div>
                                </div>
                                <div className="text-sm font-semibold text-apple-title">{emotion.value}%</div>
                              </div>
                            ))}
                        </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
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
                    {improvementAreas.length > 0 ? improvementAreas.map((area, index) => {
                      const percent = Math.min(100, (area.current / area.target) * 100);
                      const completed = percent >= 100;
                      return (
                      <motion.div
                        key={area.area}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className={`p-6 rounded-apple-lg ${completed ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' : 'bg-gradient-to-r from-green-50/80 to-blue-50/80 dark:from-green-900/20 dark:to-blue-900/20'}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-apple-title">{area.area}</h4>
                          {completed ? (
                            <Badge className="bg-emerald-500 text-white px-3 py-1">已完成</Badge>
                          ) : (
                            <Badge className="bg-green-500 text-white px-3 py-1">{area.improvement}</Badge>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-apple-caption">
                            <span>当前: {area.current}%</span>
                            <span>目标: {area.target}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                              className={`${completed ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-green-500 to-blue-500'} h-3 rounded-full shadow-sm`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}) : (
                      <div className="text-center py-12">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">暂无改善数据</h4>
                        <p className="text-sm text-gray-500">继续使用应用，我们将为您生成个性化的改善建议</p>
                      </div>
                    )}
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