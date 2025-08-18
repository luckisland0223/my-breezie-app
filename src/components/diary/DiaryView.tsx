"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen,
  Plus,
  Calendar,
  Heart,
  Smile,
  Meh,
  Frown,
  Sun,
  Cloud,
  CloudRain,
  Edit3,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// 情绪选项
const emotionOptions = [
  { emoji: "😊", label: "开心", value: "happy", color: "bg-yellow-100 border-yellow-300 text-yellow-800" },
  { emoji: "😌", label: "平静", value: "calm", color: "bg-green-100 border-green-300 text-green-800" },
  { emoji: "😐", label: "一般", value: "neutral", color: "bg-gray-100 border-gray-300 text-gray-800" },
  { emoji: "😔", label: "难过", value: "sad", color: "bg-blue-100 border-blue-300 text-blue-800" },
  { emoji: "😰", label: "焦虑", value: "anxious", color: "bg-red-100 border-red-300 text-red-800" },
  { emoji: "😴", label: "疲惫", value: "tired", color: "bg-purple-100 border-purple-300 text-purple-800" },
];

// 日记条目类型定义
interface DiaryEntry {
  id: number;
  date: string;
  time: string;
  emotion: string;
  title: string;
  content: string;
  tags: string[];
  weather: string;
  rating: number;
}

// 空的日记数据 - 使用真实用户数据
const sampleDiaryEntries: DiaryEntry[] = [];

export function DiaryView() {
  const [diaryEntries, setDiaryEntries] = useState(sampleDiaryEntries);
  const [isWriting, setIsWriting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    emotion: "",
    title: "",
    content: "",
    tags: "",
    weather: "sunny",
    rating: 5
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("");

  const handleSaveEntry = () => {
    if (!newEntry.title || !newEntry.content || !newEntry.emotion) return;

    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]!,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      emotion: newEntry.emotion,
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      weather: newEntry.weather,
      rating: newEntry.rating
    };

    setDiaryEntries([entry, ...diaryEntries]);
    setNewEntry({ emotion: "", title: "", content: "", tags: "", weather: "sunny", rating: 5 });
    setIsWriting(false);
  };

  const getEmotionInfo = (emotion: string) => {
    return emotionOptions.find(opt => opt.value === emotion) || emotionOptions[0]!;
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const filteredEntries = diaryEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmotion = !filterEmotion || entry.emotion === filterEmotion;
    return matchesSearch && matchesEmotion;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-apple-title">
          <span className="gradient-text-apple">情绪日记</span>
        </h1>
        <p className="text-xl text-apple-body max-w-2xl mx-auto">
          记录你的情绪历程，回顾内心的成长轨迹
        </p>
      </div>

      {/* Action Bar */}
      <div
        className="flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索日记..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-apple pl-10"
            />
          </div>
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-apple-md bg-white dark:bg-gray-800 text-apple-body"
          >
            <option value="">所有情绪</option>
            {emotionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <Button
          onClick={() => setIsWriting(true)}
          className="btn-apple-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          写日记
        </Button>
      </div>

      {/* Write New Entry Modal */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsWriting(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-gray-900 rounded-apple-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-apple-title">写新日记</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWriting(false)}
                    className="btn-apple-secondary"
                  >
                    ✕
                  </Button>
                </div>

                {/* Emotion Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-apple-title">今天的心情</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {emotionOptions.map((emotion) => (
                      <button
                        key={emotion.value}
                        onClick={() => setNewEntry({ ...newEntry, emotion: emotion.value })}
                        className={`p-3 rounded-apple-lg border-2 transition-all duration-200 ${
                          newEntry.emotion === emotion.value 
                            ? `${emotion.color} ring-2 ring-blue-500` 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{emotion.emoji}</div>
                        <div className="text-xs font-medium">{emotion.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-apple-title">标题</label>
                  <Input
                    placeholder="给这篇日记起个标题..."
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    className="input-apple"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-apple-title">内容</label>
                  <Textarea
                    placeholder="写下你的想法和感受..."
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    rows={6}
                    className="input-apple resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-apple-title">标签</label>
                  <Input
                    placeholder="用逗号分隔，如：工作,开心,成长"
                    value={newEntry.tags}
                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                    className="input-apple"
                  />
                </div>

                {/* Weather & Rating */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-apple-title">天气</label>
                    <select
                      value={newEntry.weather}
                      onChange={(e) => setNewEntry({ ...newEntry, weather: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple-md bg-white dark:bg-gray-800 text-apple-body"
                    >
                      <option value="sunny">☀️ 晴天</option>
                      <option value="cloudy">☁️ 多云</option>
                      <option value="rainy">🌧️ 雨天</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-apple-title">心情评分</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={newEntry.rating}
                        onChange={(e) => setNewEntry({ ...newEntry, rating: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-lg font-bold text-apple-title w-8">{newEntry.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveEntry}
                    className="btn-apple-primary flex-1"
                    disabled={!newEntry.title || !newEntry.content || !newEntry.emotion}
                  >
                    保存日记
                  </Button>
                  <Button
                    onClick={() => setIsWriting(false)}
                    variant="outline"
                    className="btn-apple-secondary"
                  >
                    取消
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diary Entries */}
      <div className="space-y-6">
        {filteredEntries.length === 0 ? (
          <div
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-apple-title mb-2">还没有日记</h3>
            <p className="text-apple-body mb-6">开始记录你的情绪历程吧</p>
            <Button onClick={() => setIsWriting(true)} className="btn-apple-primary">
              <Plus className="w-4 h-4 mr-2" />
              写第一篇日记
            </Button>
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const emotionInfo = getEmotionInfo(entry.emotion);
            return (
              <div
                key={entry.id}
              >
                <Card className="card-apple rounded-apple-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="spacing-apple-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-apple-md ${emotionInfo.color} flex items-center space-x-2`}>
                          <span className="text-lg">{emotionInfo.emoji}</span>
                          <span className="text-sm font-medium">{emotionInfo.label}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-apple-caption">
                          <Calendar className="w-4 h-4" />
                          <span>{entry.date} {entry.time}</span>
                        </div>
                        {getWeatherIcon(entry.weather)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(entry.rating / 2) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-apple-title">{entry.rating}/10</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-apple-title">{entry.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="spacing-apple-lg">
                    <p className="text-apple-body leading-relaxed mb-4">{entry.content}</p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
