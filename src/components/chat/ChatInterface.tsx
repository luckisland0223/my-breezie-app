"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Heart, Sparkles, ArrowLeft, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { AI_MODELS, type AIModel } from "@/lib/ai-service";
import { useSettingsStore } from "@/store/settings";
import { AISelectionDialog } from "./AISelectionDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  emotion?: string;
  isTyping?: boolean;
}

// 将长消息按照内容逻辑层次分割成多个消息的函数
const splitMessageIntoChunks = (content: string): string[] => {
  // 首先按照双换行符分割段落
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  
  const chunks: string[] = [];
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    
    // 如果段落较短（小于200字符），直接作为一个chunk
    if (trimmedParagraph.length <= 200) {
      chunks.push(trimmedParagraph);
      continue;
    }
    
    // 对于较长的段落，尝试按逻辑分割
    // 1. 先尝试按分号、冒号等逻辑分隔符分割
    const logicalSections = trimmedParagraph.split(/[；：;:]\s*/).filter(s => s.trim());
    
    if (logicalSections.length > 1) {
      let currentChunk = "";
      
      for (const section of logicalSections) {
        const sectionWithPunctuation = section + (section.match(/[；：;:]$/) ? '' : '；');
        
        // 如果加上这个部分后长度合适，就合并
        if (currentChunk.length + sectionWithPunctuation.length <= 300 && currentChunk.length > 0) {
          currentChunk += sectionWithPunctuation;
        } else {
          // 保存当前chunk（如果不为空）
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = sectionWithPunctuation;
        }
      }
      
      // 添加最后一个chunk
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    } else {
      // 2. 如果没有逻辑分隔符，按句子分割
      const sentences = trimmedParagraph.split(/(?<=[。！？.!?])\s+/).filter(s => s.trim());
      
      if (sentences.length > 1) {
        let currentChunk = "";
        
        for (const sentence of sentences) {
          // 如果加上这个句子后长度合适，就合并
          if (currentChunk.length + sentence.length <= 250 && currentChunk.length > 0) {
            currentChunk += " " + sentence;
          } else {
            // 保存当前chunk（如果不为空）
            if (currentChunk.trim()) {
              chunks.push(currentChunk.trim());
            }
            currentChunk = sentence;
          }
        }
        
        // 添加最后一个chunk
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
      } else {
        // 3. 如果是单个长句，保持完整
        chunks.push(trimmedParagraph);
      }
    }
  }
  
  // 如果没有分割出任何内容，返回原始内容
  return chunks.length > 0 ? chunks : [content];
};

// 动态生成个性化欢迎消息
const getWelcomeMessage = (): Message => {
  // 导入对话记忆系统
  const { generatePersonalizedOpener } = require('@/lib/conversation-memory');
  
  // 生成个性化开场白
  const personalizedContent = generatePersonalizedOpener();
  
  return {
    id: "welcome",
    content: personalizedContent,
    role: "assistant",
    timestamp: new Date(),
  };
};

// 打字动画组件
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center space-x-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md max-w-20"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

// 消息内容渲染组件，支持markdown格式
function MessageContent({ content }: { content: string }) {
  // 处理粗体文本 **text** 或 ***text***
  const processContent = (text: string) => {
    // 替换 ***text*** 为粗体
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-current">$1</strong>');
    // 替换 **text** 为粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-current">$1</strong>');
    
    // 处理列表项，将 * 开头的行转换为项目符号
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('* ')) {
        const content = trimmedLine.substring(2);
        return `<div class="flex items-start space-x-2 my-2"><span class="text-blue-500 font-bold mt-0.5">•</span><span>${content}</span></div>`;
      }
      return line;
    });
    
    return processedLines.join('\n');
  };

  const processedContent = processContent(content);

  return (
    <div 
      className="message-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [showAISelection, setShowAISelection] = useState(false);
  const [currentUsedModel, setCurrentUsedModel] = useState<AIModel | null>(null);
  const [modelSwitched, setModelSwitched] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  
  // 获取AI设置
  const { selectedModel, hasSelectedInitialModel, setSelectedModel } = useSettingsStore();

  // 检查是否需要显示AI选择对话框
  useEffect(() => {
    if (!hasSelectedInitialModel) {
      setShowAISelection(true);
    }
  }, [hasSelectedInitialModel]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 模拟AI逐条发送消息的函数
  const sendMessagesWithDelay = useCallback(async (messageChunks: string[], baseTimestamp: Date) => {
    for (let i = 0; i < messageChunks.length; i++) {
      const chunk = messageChunks[i];
      if (!chunk) continue; // 跳过空内容
      
      const messageId = `ai-${baseTimestamp.getTime()}-${i}`;
      
      // 显示打字指示器
      if (i === 0) {
        setTypingMessageId(messageId);
        await new Promise(resolve => setTimeout(resolve, 800)); // 打字延迟
      }
      
      // 添加消息
      const newMessage: Message = {
        id: messageId,
        content: chunk,
        role: "assistant",
        timestamp: new Date(baseTimestamp.getTime() + i * 2000),
      };
      
      setMessages(prev => [...prev, newMessage]);
      setTypingMessageId(null);
      
      // 消息间延迟（除了最后一条）
      if (i < messageChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800)); // 1.2-2秒随机延迟
        setTypingMessageId(`ai-${baseTimestamp.getTime()}-${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, 600 + chunk.length * 20)); // 根据长度调整打字时间
      }
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // 检查是否已选择AI模型
    if (!selectedModel) {
      setShowAISelection(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);
    setModelSwitched(false);

    try {
      // 获取对话历史
      const conversationHistory = [
        { role: 'user', content: currentInput },
        ...messages.slice(-10).map(msg => ({ // 只取最近10条消息作为上下文
          role: msg.role,
          content: msg.content
        }))
      ];

      // 通过API路由调用AI服务
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory,
          model: selectedModel
        }),
      });

      if (!response.ok) {
        throw new Error('API调用失败');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // 更新当前使用的模型和切换状态
      setCurrentUsedModel(data.usedModel);
      setModelSwitched(data.switchedModel);
      
      // 如果模型被自动切换，显示通知
      if (data.switchedModel && data.usedModel && selectedModel) {
        const usedModelName = AI_MODELS[data.usedModel as AIModel].name;
        const originalModelName = AI_MODELS[selectedModel].name;
        toast.info(`${originalModelName} 暂时不可用，已自动切换到 ${usedModelName}`);
        
        // 可选：自动更新用户的首选模型
        setSelectedModel(data.usedModel);
      }
      
      // 将AI响应分割成多个消息块
      const messageChunks = splitMessageIntoChunks(data.response);
      
      // 逐条发送消息
      await sendMessagesWithDelay(messageChunks, new Date());
      
    } catch (error) {
      console.error('Error in chat:', error);
      
      // 显示具体的错误信息
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      toast.error(`AI服务错误: ${errorMsg}`);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，我现在遇到了技术问题：${errorMsg}。请稍后再试，或联系管理员检查服务器配置。`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTypingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 flex flex-col">
      {/* Header - Fixed at top */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-12 h-12 ring-2 ring-purple-500/20">
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Heart className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Breezie AI</h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-green-600 dark:text-green-400">情绪疏导助手 • 在线</p>
                {currentUsedModel && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {AI_MODELS[currentUsedModel].name}
                    </span>
                    {modelSwitched && (
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* AI状态指示器 */}
        {modelSwitched && (
          <Alert className="mx-6 mt-2 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              原AI模型暂时不可用，已自动切换到 {currentUsedModel && AI_MODELS[currentUsedModel].name}
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      {/* Messages Container - Scrollable middle area */}
      <div className="flex-1 overflow-hidden w-full">
        <div className="h-full overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.16, 1, 0.3, 1],
                      delay: index * 0.05 
                    }}
                    className={cn(
                      "flex items-end space-x-3",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-8 h-8 ring-2 ring-purple-500/20">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-sm" />
                      </div>
                    )}

                    <div className={cn(
                      "max-w-[70%] px-4 py-3 rounded-3xl shadow-lg",
                      message.role === "user" 
                        ? "bg-[#6366f1] text-white rounded-br-md" 
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border border-gray-200/50 dark:border-gray-700/50"
                    )}>
                      <div className="text-base leading-relaxed whitespace-pre-wrap">
                        <MessageContent content={message.content} />
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-8 h-8 ring-2 ring-blue-500/20">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-sm" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* 打字指示器 */}
                {typingMessageId && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-end space-x-3 justify-start"
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8 ring-2 ring-purple-500/20">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-sm" />
                    </div>
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 w-full px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50"
      >
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="分享你的感受..."
                className="resize-none rounded-3xl border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 min-h-[52px] max-h-32 py-4 px-6 pr-14"
                disabled={isLoading}
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 mb-2 flex-shrink-0"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* AI选择对话框 */}
      <AISelectionDialog 
        open={showAISelection} 
        onOpenChange={setShowAISelection}
      />
    </div>
  );
}