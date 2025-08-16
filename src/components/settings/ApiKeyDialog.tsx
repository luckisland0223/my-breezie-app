"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, Eye, EyeOff, ExternalLink, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettingsStore } from "@/store/settings";
import { toast } from "sonner";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyDialog({ open, onOpenChange }: ApiKeyDialogProps) {
  const { geminiApiKey, setGeminiApiKey } = useSettingsStore();
  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!inputKey.trim()) {
      toast.error("请输入API密钥");
      return;
    }

    setIsValidating(true);
    try {
      // 这里可以添加API密钥验证逻辑
      setGeminiApiKey(inputKey.trim());
      toast.success("API密钥已保存");
      onOpenChange(false);
    } catch (error) {
      toast.error("API密钥验证失败");
    } finally {
      setIsValidating(false);
    }
  };

  const steps = [
    {
      step: 1,
      title: "访问 Google AI Studio",
      description: "点击下方链接访问Google AI Studio获取免费API密钥"
    },
    {
      step: 2,
      title: "创建API密钥",
      description: "在控制台中创建新的API密钥，复制密钥内容"
    },
    {
      step: 3,
      title: "输入密钥",
      description: "将API密钥粘贴到下方输入框中并保存"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            设置 Gemini API 密钥
          </DialogTitle>
          <DialogDescription>
            为了使用AI情绪疏导功能，您需要设置Google Gemini API密钥。这是完全免费的，密钥将安全保存在您的浏览器本地。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 获取步骤 */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="text-lg">获取免费API密钥</CardTitle>
              <CardDescription>
                按照以下步骤获取您的Gemini API密钥
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  打开 Google AI Studio
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API密钥输入 */}
          <div className="space-y-4">
            <Label htmlFor="api-key" className="text-sm font-medium">
              Gemini API 密钥
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="输入您的Gemini API密钥..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              API密钥将安全保存在您的浏览器本地存储中，不会上传到任何服务器
            </p>
          </div>

          {/* 当前状态 */}
          {geminiApiKey && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">API密钥已设置</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  密钥以 {geminiApiKey.substring(0, 8)}... 开头
                </p>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={isValidating || !inputKey.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isValidating ? "验证中..." : "保存设置"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
