"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Heart, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMoodStore, emotionScores } from "@/store/mood";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  emotion?: string;
  isTyping?: boolean;
}

// 将长文本拆分为多个小段，便于分片发送
const splitMessageIntoChunks = (text: string, maxLen = 220): string[] => {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const chunks: string[] = [];
  for (const p of paragraphs) {
    if (p.length <= maxLen) {
      chunks.push(p.trim());
      continue;
    }
    const sentences = p.split(/(?<=[。！？.!?])\s+/);
    let buf = "";
    for (const s of sentences) {
      if ((buf + (buf ? " " : "") + s).length <= maxLen) {
        buf = buf ? buf + " " + s : s;
      } else {
        if (buf) chunks.push(buf.trim());
        buf = s;
      }
    }
    if (buf) chunks.push(buf.trim());
  }
  return chunks.length > 0 ? chunks : [text];
};

// 极简欢迎语
const getWelcomeMessage = (): Message => ({
  id: "welcome",
  content: "嗨！我是 Breezie。今天心情怎么样？",
  role: "assistant",
  timestamp: new Date(),
});

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
  return <div className="whitespace-pre-wrap break-words">{content}</div>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  
  const { recordChatAnalysis } = useMoodStore();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 分片发送：带打字指示器
  const sendMessagesWithDelay = useCallback(async (
    chunks: string[],
    baseTimestamp: Date,
    emotionForFirst?: string
  ) => {
    for (let i = 0; i < chunks.length; i++) {
      const id = `ai-${baseTimestamp.getTime()}-${i}`;
      setTypingMessageId(id);
      // 模拟打字时间：和内容长度相关
      const typingMs = Math.min(1800, 300 + (chunks[i]?.length || 0) * 12);
      await new Promise(r => setTimeout(r, Math.max(350, typingMs)));
      const msg = {
        id,
        content: chunks[i] || "",
        role: "assistant" as const,
        timestamp: new Date(baseTimestamp.getTime() + i * 800),
        emotion: i === 0 ? emotionForFirst : undefined,
      };
      setMessages(prev => [...prev, msg]);
      setTypingMessageId(null);
      if (i < chunks.length - 1) {
        // 两段之间稍作停顿
        await new Promise(r => setTimeout(r, 250));
      }
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    // 服务端读取密钥，此处无需校验

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

    // 立即显示打字指示器，让用户感觉Breezie在思考
    const thinkingMessageId = `thinking-${Date.now()}`;
    setTypingMessageId(thinkingMessageId);

    try {
      // 获取对话历史 - 仅取最近4条
      const conversationHistory = messages.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 并行处理：在API调用的同时，可以做一些预处理工作
      const apiCallPromise = fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory
        }),
      });

      // 在API调用期间，可以做一些预处理（比如准备UI状态等）
      // 这里可以添加一些预处理逻辑，让等待时间更有意义
      
      const response = await apiCallPromise;

      let data: any;
      if (!response.ok) {
        // 尝试读取服务端的错误详情
        try {
          data = await response.json();
          throw new Error(data?.error || `API调用失败 (${response.status})`);
        } catch (_) {
          // 如果不是JSON，退回到状态码
          throw new Error(`API调用失败 (${response.status})`);
        }
      } else {
        data = await response.json();
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const chunks = splitMessageIntoChunks(data.response);
      await sendMessagesWithDelay(chunks, new Date(), data.emotion);
      
    } catch (error) {
      console.error('Error in chat:', error);
      
      // 清除打字指示器
      setTypingMessageId(null);
      
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
      <div 
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
                <span className="text-xs text-gray-500">• DeepSeek</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI状态指示器已移除 - 固定使用DeepSeek */}
      </div>

      {/* Messages Container - Scrollable middle area */}
      <div className="flex-1 overflow-hidden w-full">
        <div className="h-full overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
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
                      {message.role === "assistant" && message.emotion && (
                        <div className="mb-1 -mt-1 text-xs text-gray-500 flex items-center gap-2">
                          {(() => {
                            const meta: Record<string, {label:string;emoji:string}> = {
                              happy: { label: "开心", emoji: "😄" },
                              sad: { label: "难过", emoji: "😢" },
                              anxious: { label: "焦虑", emoji: "😰" },
                              angry: { label: "生气", emoji: "😠" },
                              confused: { label: "困惑", emoji: "😕" },
                              tired: { label: "疲惫", emoji: "😴" },
                              neutral: { label: "平静", emoji: "😐" },
                              surprised: { label: "惊喜", emoji: "😲" },
                            };
                            const key = message.emotion as string;
                            const m = (meta as Record<string, {label:string;emoji:string}>)[key] || { label: key, emoji: "🧠" };
                            return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700">{m.emoji} {m.label}</span>;
                          })()}
                          {!savedIds.has(message.id) && (
                            <button
                              className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                const key = (message.emotion === 'neutral' ? 'calm' : (message.emotion || 'calm')) as string;
                                const score = (emotionScores as Record<string, number>)[key] ?? 5;
                                recordChatAnalysis(score, `AI情绪: ${key}`);
                                setSavedIds(prev => new Set(prev).add(message.id));
                                toast.success("已保存到记录");
                              }}
                            >保存到记录</button>
                          )}
                        </div>
                      )}
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
      <div 
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
      </div>

      {/* AI选择对话框已移除 - 固定使用DeepSeek */}
    </div>
  );
}