"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 模拟数据 - 每日心情记录
const moodData: Record<string, { mood: string; emoji: string; color: string; intensity: number }> = {
  "2024-08-01": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 8 },
  "2024-08-02": { mood: "平静", emoji: "😌", color: "bg-green-200", intensity: 7 },
  "2024-08-03": { mood: "焦虑", emoji: "😰", color: "bg-red-200", intensity: 4 },
  "2024-08-04": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 9 },
  "2024-08-05": { mood: "一般", emoji: "😐", color: "bg-gray-200", intensity: 5 },
  "2024-08-06": { mood: "难过", emoji: "😔", color: "bg-blue-200", intensity: 3 },
  "2024-08-07": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 8 },
  "2024-08-08": { mood: "平静", emoji: "😌", color: "bg-green-200", intensity: 7 },
  "2024-08-09": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 8 },
  "2024-08-10": { mood: "疲惫", emoji: "😴", color: "bg-purple-200", intensity: 4 },
  "2024-08-11": { mood: "平静", emoji: "😌", color: "bg-green-200", intensity: 7 },
  "2024-08-12": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 9 },
  "2024-08-13": { mood: "一般", emoji: "😐", color: "bg-gray-200", intensity: 6 },
  "2024-08-14": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 8 },
  "2024-08-15": { mood: "平静", emoji: "😌", color: "bg-green-200", intensity: 7 },
  "2024-08-16": { mood: "开心", emoji: "😊", color: "bg-yellow-200", intensity: 9 },
};

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
const months = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月"
];

export function MoodCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 生成日历格子
  const calendarDays = [];
  const totalDays = 42; // 6周 x 7天

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return moodData[dateStr];
  };

  const getSelectedMoodData = () => {
    if (!selectedDate) return null;
    return moodData[selectedDate];
  };

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          情绪日历
        </CardTitle>
        <CardDescription>
          查看每日的情绪记录和变化趋势
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 月份导航 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h3 className="text-lg font-semibold">
            {year}年 {months[month]}
          </h3>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日历格子 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const dateStr = formatDate(date);
            const mood = getMoodForDate(date);
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDay = isToday(date);

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(mood ? dateStr : null)}
                className={`
                  relative aspect-square p-1 rounded-lg text-sm transition-all duration-200
                  ${isCurrentMonthDay 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-600'
                  }
                  ${isTodayDay 
                    ? 'ring-2 ring-blue-500' 
                    : ''
                  }
                  ${mood 
                    ? `${mood.color} hover:opacity-80 cursor-pointer` 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${selectedDate === dateStr 
                    ? 'ring-2 ring-purple-500' 
                    : ''
                  }
                `}
                disabled={!isCurrentMonthDay}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="font-medium">{date.getDate()}</span>
                  {mood && (
                    <span className="text-lg leading-none">{mood.emoji}</span>
                  )}
                </div>
                {isTodayDay && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 选中日期的详情 */}
        {selectedDate && getSelectedMoodData() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getSelectedMoodData()?.emoji}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedDate).toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    情绪状态：{getSelectedMoodData()?.mood}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                强度: {getSelectedMoodData()?.intensity}/10
              </Badge>
            </div>
          </motion.div>
        )}

        {/* 图例 */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            情绪图例
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-200" />
              <span>😊 开心</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-200" />
              <span>😌 平静</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-gray-200" />
              <span>😐 一般</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-200" />
              <span>😔 难过</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-200" />
              <span>😰 焦虑</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-purple-200" />
              <span>😴 疲惫</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
