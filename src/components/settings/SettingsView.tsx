"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  RotateCcw,
  Heart,
  Save,
  Bot,
  Brain,
  Search
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useMoodStore } from "@/store/mood";
import { useSettingsStore } from "@/store/settings";
import { AI_MODELS } from "@/lib/ai-service";
import type { AIModel } from "@/lib/ai-service";
import { toast } from "sonner";

const themeOptions = [
  { value: "light", label: "浅色模式", icon: Sun },
  { value: "dark", label: "深色模式", icon: Moon },
  { value: "system", label: "跟随系统", icon: Monitor },
];

const languageOptions = [
  { value: "zh-CN", label: "简体中文", flag: "🇨🇳" },
  { value: "en-US", label: "English", flag: "🇺🇸" },
  { value: "ja-JP", label: "日本語", flag: "🇯🇵" },
];

export function SettingsView() {
  const { 
    moodRecords, 
    dailyStats, 
    getContinuousDays, 
    getTotalConversations, 
    clearAllData, 
    exportData, 
    importData 
  } = useMoodStore();
  
  const {
    selectedModel,
    setSelectedModel
  } = useSettingsStore();
  
  // 本地状态
  const [userName, setUserName] = useState("情绪疏导用户");
  const [userEmail, setUserEmail] = useState("");
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("zh-CN");
  

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    moodTracking: true,
    weeklyReport: true,
    soundEnabled: true,
  });
  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    analytics: false,
    crashReports: true,
  });



  // 导出数据
  const handleExportData = () => {
    const data = exportData();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breezie-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("数据导出成功");
  };

  // 导入数据
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (importData(data)) {
          toast.success("数据导入成功");
        } else {
          toast.error("数据格式不兼容，导入失败");
        }
      } catch (error) {
        toast.error("数据格式错误，导入失败");
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入
    event.target.value = '';
  };

  // 清除所有数据
  const handleClearAllData = () => {
    if (confirm("确定要清除所有情绪数据吗？此操作不可恢复。")) {
      clearAllData();
      toast.success("所有数据已清除");
    }
  };

  // 重置设置
  const handleResetSettings = () => {
    if (confirm("确定要重置所有设置吗？")) {
      setTheme("system");
      setLanguage("zh-CN");
      setNotifications({
        dailyReminder: true,
        moodTracking: true,
        weeklyReport: true,
        soundEnabled: true,
      });
      setPrivacy({
        dataCollection: true,
        analytics: false,
        crashReports: true,
      });
      toast.success("设置已重置");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-apple-title">
          <span className="gradient-text-apple">个人设置</span>
        </h1>
        <p className="text-xl text-apple-body max-w-2xl mx-auto">
          自定义你的Breezie体验，管理数据和隐私设置
        </p>
      </motion.div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">账户</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">外观</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">通知</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">数据</span>
            </TabsTrigger>
          </TabsList>

          {/* 账户设置 */}
          <TabsContent value="account" className="space-y-6">
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span>个人信息</span>
                </CardTitle>
                <CardDescription>
                  管理你的个人资料和账户信息
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="请输入用户名"
                    className="input-apple"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="请输入邮箱地址"
                    className="input-apple"
                  />
                </div>
                <div className="flex justify-end">
                  <Button className="btn-apple-primary">
                    <Save className="w-4 h-4 mr-2" />
                    保存更改
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 统计信息 */}
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>使用统计</span>
                </CardTitle>
                <CardDescription>
                  你的Breezie使用情况概览
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{getTotalConversations()}</div>
                    <div className="text-sm text-apple-caption">总对话数</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-green-600">{getContinuousDays()}</div>
                    <div className="text-sm text-apple-caption">连续天数</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-purple-600">{moodRecords.length}</div>
                    <div className="text-sm text-apple-caption">情绪记录</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-orange-600">{Object.keys(dailyStats).length}</div>
                    <div className="text-sm text-apple-caption">活跃天数</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI设置 */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-500" />
                  <span>AI模型设置</span>
                </CardTitle>
                <CardDescription>
                  选择你偏好的AI助手模型
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 模型选择 */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">选择AI模型</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(AI_MODELS).map(([key, model]) => (
                      <motion.div
                        key={key}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedModel === key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedModel(key as AIModel)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{model.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-medium text-apple-title">{model.name}</h3>
                            <p className="text-sm text-apple-caption mt-1">{model.description}</p>
                            {selectedModel === key && (
                              <Badge className="mt-2 bg-blue-500 text-white">当前选择</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* 当前状态 */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-apple-title">当前配置</h4>
                      <p className="text-sm text-apple-caption mt-1">
                        模型: {selectedModel ? AI_MODELS[selectedModel].name : '未选择'} • 
                        状态: {selectedModel ? '已配置（服务器端）' : '未配置'}
                      </p>
                      <p className="text-xs text-apple-caption mt-2">
                        API密钥通过服务器端环境变量管理，确保安全性
                      </p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 外观设置 */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <span>主题设置</span>
                </CardTitle>
                <CardDescription>
                  自定义Breezie的外观和感觉
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>主题模式</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <option.icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>语言设置</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <span>{option.flag}</span>
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通知设置 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  <span>通知偏好</span>
                </CardTitle>
                <CardDescription>
                  管理你希望接收的通知类型
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>每日提醒</Label>
                    <p className="text-sm text-apple-caption">提醒你记录每日情绪</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReminder}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyReminder: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>情绪追踪</Label>
                    <p className="text-sm text-apple-caption">情绪变化趋势通知</p>
                  </div>
                  <Switch
                    checked={notifications.moodTracking}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, moodTracking: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>周报总结</Label>
                    <p className="text-sm text-apple-caption">每周情绪分析报告</p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="flex items-center space-x-2">
                      {notifications.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span>声音通知</span>
                    </Label>
                    <p className="text-sm text-apple-caption">启用通知声音</p>
                  </div>
                  <Switch
                    checked={notifications.soundEnabled}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, soundEnabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-6">
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-indigo-500" />
                  <span>数据管理</span>
                </CardTitle>
                <CardDescription>
                  导出、导入或清除你的情绪数据
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleExportData} className="btn-apple-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    导出数据
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-file"
                    />
                    <Button 
                      onClick={() => document.getElementById('import-file')?.click()}
                      className="btn-apple-secondary w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      导入数据
                    </Button>
                  </div>
                </div>

                <Separator />

                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>危险操作：</strong>以下操作不可恢复，请谨慎操作。
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleClearAllData} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    清除所有数据
                  </Button>
                  
                  <Button onClick={handleResetSettings} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置所有设置
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 隐私设置 */}
            <Card className="card-apple">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>隐私设置</span>
                </CardTitle>
                <CardDescription>
                  控制数据收集和隐私选项
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>数据收集</Label>
                    <p className="text-sm text-apple-caption">允许收集匿名使用数据以改进服务</p>
                  </div>
                  <Switch
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataCollection: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>使用分析</Label>
                    <p className="text-sm text-apple-caption">帮助我们了解功能使用情况</p>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analytics: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>崩溃报告</Label>
                    <p className="text-sm text-apple-caption">自动发送崩溃报告以帮助修复问题</p>
                  </div>
                  <Switch
                    checked={privacy.crashReports}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, crashReports: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>


    </div>
  );
}
