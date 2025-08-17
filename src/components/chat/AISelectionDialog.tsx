'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AI_MODELS, type AIModel } from '@/lib/ai-service';
import { useSettingsStore } from '@/store/settings';
import { Sparkles, Brain } from 'lucide-react';

interface AISelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelectionDialog({ open, onOpenChange }: AISelectionDialogProps) {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const { setSelectedModel: saveSelectedModel } = useSettingsStore();

  const handleConfirm = () => {
    if (selectedModel) {
      saveSelectedModel(selectedModel);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              欢迎来到 Breezie
            </DialogTitle>
            <DialogDescription className="text-base mt-2 text-apple-caption">
              请选择你的AI助手，开始你的情绪疏导之旅
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="text-sm font-medium text-apple-title mb-3">选择你的AI助手：</div>
          
          <div className="grid gap-3">
            {Object.entries(AI_MODELS).map(([key, model]) => (
              <motion.div
                key={key}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => setSelectedModel(key as AIModel)}
              >
                <Card className={`transition-all duration-200 ${
                  selectedModel === key
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{model.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-apple-title">{model.name}</h3>
                          {selectedModel === key && (
                            <Badge className="bg-blue-500 text-white text-xs">已选择</Badge>
                          )}
                        </div>
                        <p className="text-sm text-apple-caption mt-1">{model.description}</p>
                        
                        {/* 特色标签 */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {key === 'gemini' && (
                            <>
                              <Badge variant="outline" className="text-xs">Google技术</Badge>
                              <Badge variant="outline" className="text-xs">多语言理解</Badge>
                            </>
                          )}
                          {key === 'deepseek' && (
                            <>
                              <Badge variant="outline" className="text-xs">中文优化</Badge>
                              <Badge variant="outline" className="text-xs">深度理解</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-2">
              <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">智能切换</p>
                <p>如果当前AI遇到问题，系统会自动切换到另一个AI，确保服务不中断。你也可以随时在设置中更换AI助手。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            onClick={handleConfirm}
            disabled={!selectedModel}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
          >
            开始使用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
