"use client";

import { useState } from "react";
import { 
  User, 
  Shield, 
  Database, 
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Heart,
  Save
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
 

import { Alert, AlertDescription } from "@/components/ui/alert";

import { useMoodStore, getAllEmotions, emotionScores } from "@/store/mood";
import { toast } from "sonner";

// 已移除外观与语言设置

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
  
  // 设置页不再包含密钥输入
  
  // 本地状态
  const [userName, setUserName] = useState("情绪疏导用户");
  const [userEmail, setUserEmail] = useState("");
  // 已移除外观与语言设置
  

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

  // 生成演示数据（最近30天）
  const handleSeedDemoData = () => {
    const { addMoodRecord, updateDailyStats } = useMoodStore.getState();
    const emotions = getAllEmotions();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${da}`;
    };
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = fmt(d);
      // 随机决定当天是否活跃
      const active = Math.random() < 0.8;
      if (!active) { continue; }
      // 情绪选择 1-3 个
      const emotionCount = 1 + Math.floor(Math.random() * 3);
      for (let e = 0; e < emotionCount; e++) {
        const pick = emotions[Math.floor(Math.random() * emotions.length)];
        if (!pick) continue;
        const value = (emotionScores as Record<string, number>)[pick.key] || 5;
        addMoodRecord({
          date: dateStr,
          type: 'emotion_select',
          value,
          weight: 1.0,
          source: pick.key,
          note: `demo: ${pick.label}`,
        });
      }
      // 对话分析 1-4 次
      const convCount = 1 + Math.floor(Math.random() * 4);
      for (let c = 0; c < convCount; c++) {
        const score = 4 + Math.floor(Math.random() * 5); // 4-8
        addMoodRecord({
          date: dateStr,
          type: 'chat_analysis',
          value: score,
          weight: 2.0,
          source: 'ai_analysis',
          note: 'demo chat',
        });
      }
      updateDailyStats(dateStr);
    }
    toast.success("已生成最近30天的演示数据");
  };

  // 重置设置
  const handleResetSettings = () => {
    if (confirm("确定要重置所有设置吗？")) {
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
      <div
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-apple-title">
          <span className="gradient-text-apple">个人设置</span>
        </h1>
        <p className="text-xl text-apple-body max-w-2xl mx-auto">
          自定义你的Breezie体验，管理数据和隐私设置
        </p>
      </div>

      {/* 集成设置页面 */}
      <div
        className="space-y-8"
      >
        {/* 个人信息设置 */}
        <div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <div className="flex justify-end">
                <Button className="btn-apple-primary">
                  <Save className="w-4 h-4 mr-2" />
                  保存更改
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DeepSeek 设置区块移除（服务器读取环境变量） */}

        {/* 外观和语言卡片已删除 */}

        {/* 隐私与数据设置 */}
        <div>
          <Card className="card-apple">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>隐私与数据</span>
              </CardTitle>
              <CardDescription>
                仅保留必要的隐私选项
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 隐私设置（仅三项） */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>隐私设置</span>
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label>数据收集</Label>
                      <p className="text-xs text-apple-caption">允许收集匿名使用数据</p>
                    </div>
                    <Switch
                      checked={privacy.dataCollection}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataCollection: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label>使用分析</Label>
                      <p className="text-xs text-apple-caption">帮助我们了解功能使用</p>
                    </div>
                    <Switch
                      checked={privacy.analytics}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analytics: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <Label>崩溃报告</Label>
                      <p className="text-xs text-apple-caption">自动发送崩溃报告</p>
                    </div>
                    <Switch
                      checked={privacy.crashReports}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, crashReports: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 数据管理和统计 */}
        <div>
          <Card className="card-apple">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <span>数据管理和统计</span>
              </CardTitle>
              <CardDescription>
                查看使用统计，管理你的情绪数据
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 使用统计 */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>使用统计</span>
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getTotalConversations()}</div>
                    <div className="text-sm text-apple-caption">总对话数</div>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{getContinuousDays()}</div>
                    <div className="text-sm text-apple-caption">连续天数</div>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{moodRecords.length}</div>
                    <div className="text-sm text-apple-caption">情绪记录</div>
                  </div>
                  <div className="text-center space-y-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{Object.keys(dailyStats).length}</div>
                    <div className="text-sm text-apple-caption">活跃天数</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 数据操作 */}
              <div className="space-y-4">
                <Label className="text-base font-medium">数据操作</Label>
                
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
                  <Button onClick={handleSeedDemoData} className="btn-apple-primary">
                    生成演示数据（30天）
                  </Button>
                </div>
              </div>

              <Separator />

              {/* 危险操作 */}
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
