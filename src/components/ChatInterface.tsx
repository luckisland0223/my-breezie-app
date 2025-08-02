import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType, PolarityType, EmotionPolarityAnalysis } from '@/store/emotion'
import { Send, ArrowLeft, MessageCircle, User, History, Eye, Sparkles, Heart, Clock } from 'lucide-react'
import { LoadingSpinner } from './LoadingSpinner'
import { toast } from 'sonner'
// 移除预设回复的导入，改为使用动态AI生成
import type { ChatMessage } from '@/lib/openaiService'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ChatInterfaceProps {
  emotion: EmotionType
  onBack: () => void
}

// 动态打字效果组件
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30) // 每30ms显示一个字符
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  useEffect(() => {
    // 重置状态当文本改变时
    setDisplayedText('')
    setCurrentIndex(0)
  }, [text])

  return <span>{displayedText}</span>
}

export function ChatInterface({ emotion, onBack }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiResponse, setAiResponse] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lastUserMessage, setLastUserMessage] = useState('')
  
  const currentSession = useEmotionStore((state) => state.currentSession)
  const startChatSession = useEmotionStore((state) => state.startChatSession)
  const addMessage = useEmotionStore((state) => state.addMessage)
  const endChatSession = useEmotionStore((state) => state.endChatSession)
  const addEmotionRecord = useEmotionStore((state) => state.addEmotionRecord)

  useEffect(() => {
    if (!currentSession) {
      startChatSession(emotion)
      // 添加个性化的AI欢迎消息
      setTimeout(async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMessage: `用户刚刚选择了"${emotion}"这个情绪开始对话。请给出一个温暖、个性化的开场白，让用户感到被理解和欢迎。不要使用模板化的语言。`,
              emotion,
              conversationHistory: []
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            const welcomeResponse = data.response
            setAiResponse(welcomeResponse)
            addMessage(welcomeResponse, 'assistant')
          } else {
            // 如果API失败，使用简单的欢迎语
            const welcomeResponse = `你好，我是Breezie。我注意到你现在感到${emotion}，我在这里陪伴你。想聊聊发生了什么吗？`
            setAiResponse(welcomeResponse)
            addMessage(welcomeResponse, 'assistant')
          }
        } catch (error) {
          // 网络错误时的备用欢迎语
          const welcomeResponse = `你好，我是Breezie。我在这里陪伴你，无论你现在感受如何。想和我分享一下吗？`
          setAiResponse(welcomeResponse)
          addMessage(welcomeResponse, 'assistant')
        }
      }, 500)
    }
  }, [emotion, currentSession, startChatSession, addMessage])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    
    // 保存用户消息用于显示预览
    setLastUserMessage(userMessage)
    
    // 添加用户消息到历史记录
    addMessage(userMessage, 'user')
    
    // 清空输入框，但保持显示状态
    setInputValue('')
    setIsTyping(true)
    setAiResponse('')
    
    try {
      // 构建对话历史
      const conversationHistory: ChatMessage[] = currentSession?.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })) || []
      
      // 调用Gemini API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          emotion,
          conversationHistory
        })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.message || 'API返回错误')
      }
      
      // 设置AI回复并开始打字效果
      setAiResponse(data.response)
      addMessage(data.response, 'assistant')
      
    } catch (error) {
      console.error('Gemini API调用失败:', error)
      
      // API调用失败时的友好回复
      const fallbackResponse = '抱歉，我现在无法连接到AI服务。这可能是因为API密钥无效或网络问题。请联系开发者检查配置。'
      setAiResponse(fallbackResponse)
      addMessage(fallbackResponse, 'assistant')
      
      // 显示错误提示
      toast.error('API调用失败 - 请检查API密钥配置')
    } finally {
      setIsTyping(false)
    }
  }

  // 生成详细的情绪记录描述
  const generateDetailedDescription = (emotion: EmotionType, messages: ChatMessage[]): string => {
    const userMessages = messages.filter(msg => msg.role === 'user')
    const aiMessages = messages.filter(msg => msg.role === 'assistant')
    
    if (userMessages.length === 0) {
      return `经历了${emotion}情绪，但未进行深入交流`
    }
    
    // 分析用户消息的关键词和主题
    const firstUserMessage = userMessages[0]?.content || ''
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || ''
    
    // 根据情绪类型生成更具体的描述
    const emotionContexts = {
      '愤怒': [
        '工作压力导致的情绪波动',
        '人际关系冲突引发的不满',
        '对不公平待遇的愤慨',
        '因为期望落空而产生的愤怒',
        '日常生活中的挫折积累'
      ],
      '悲伤': [
        '对过去美好时光的怀念',
        '面对失去时的内心痛苦',
        '对未来不确定性的担忧',
        '感到孤独和被误解',
        '经历重要关系的变化'
      ],
      '恐惧': [
        '对未知挑战的担心',
        '面临重要决定时的焦虑',
        '担心失败或犯错',
        '对健康或安全的担忧',
        '害怕失去重要的人或事物'
      ],
      '快乐': [
        '取得重要成就后的喜悦',
        '与亲友共度美好时光',
        '发现新的兴趣或机会',
        '克服困难后的成就感',
        '收到好消息时的欣喜'
      ],
      '惊讶': [
        '遇到意想不到的好消息',
        '发现新的可能性或机会',
        '对他人行为的意外反应',
        '生活中突然的转折',
        '学到新知识时的震撼'
      ],
      '厌恶': [
        '对某些行为或态度的反感',
        '面对道德冲突时的不适',
        '对环境或情况的不满',
        '遇到与价值观冲突的事情',
        '对重复性问题的厌倦'
      ],
      '复杂': [
        '面临多重选择的纠结',
        '情感交织下的内心冲突',
        '对复杂情况的深度思考',
        '处理人际关系的微妙平衡',
        '在变化中寻找方向感'
      ]
    }
    
    // 随机选择一个相关的情境描述
    const contexts = emotionContexts[emotion] || ['经历了复杂的情感状态']
    const randomContext = contexts[Math.floor(Math.random() * contexts.length)]
    
    // 分析对话长度和内容深度
    const conversationLength = messages.length
    const hasDeepConversation = conversationLength >= 6
    const hasResolution = aiMessages.some(msg => 
      msg.content.includes('建议') || 
      msg.content.includes('尝试') || 
      msg.content.includes('可以') ||
      msg.content.includes('帮助')
    )
    
    // 生成综合描述
    let description = randomContext
    
    if (hasDeepConversation) {
      description += '，通过深入的自我探索和反思'
    } else {
      description += '，通过初步的情感表达'
    }
    
    if (hasResolution) {
      description += '，获得了有价值的指导和建议'
    } else {
      description += '，完成了基本的情感梳理'
    }
    
    // 根据对话时长添加补充信息
    const conversationDuration = messages.length > 4 ? '深度' : messages.length > 2 ? '适度' : '简短'
    description += `。${conversationDuration}交流，共${Math.ceil(conversationLength / 2)}轮对话`
    
    return description || `经历了${emotion}情绪的基本记录`
  }

  // 情绪极性分析算法
  const analyzeEmotionPolarity = (
    emotion: EmotionType, 
    conversationMessages: ChatMessage[]
  ): EmotionPolarityAnalysis => {
    
    // 基础情绪极性映射
    const emotionPolarityMap: Record<EmotionType, { base: PolarityType; strength: number }> = {
      '快乐': { base: 'positive', strength: 8 },
      '惊讶': { base: 'neutral', strength: 6 },   // 可正可负
      '愤怒': { base: 'negative', strength: 8 },
      '恐惧': { base: 'negative', strength: 7 },
      '悲伤': { base: 'negative', strength: 7 },
      '厌恶': { base: 'negative', strength: 6 },
      '复杂': { base: 'neutral', strength: 5 }
    }
    
    let polarity = emotionPolarityMap[emotion]?.base || 'neutral'
    let strength = emotionPolarityMap[emotion]?.strength || 5
    let confidence = 7 // 基础置信度
    
    // 分析对话内容调整判断
    const userMessages = conversationMessages.filter(msg => msg.role === 'user')
    const aiMessages = conversationMessages.filter(msg => msg.role === 'assistant')
    
    // 积极关键词检测
    const positiveKeywords = ['开心', '高兴', '满足', '成功', '好转', '解决', '感谢', '舒服', '放松', '希望', '乐观', '喜欢', '爱']
    const negativeKeywords = ['痛苦', '难受', '糟糕', '失败', '绝望', '无助', '讨厌', '害怕', '担心', '焦虑', '压力', '孤独', '失望']
    
    const userContent = userMessages.map(m => m.content).join(' ')
    const aiContent = aiMessages.map(m => m.content).join(' ')
    
    const positiveCount = positiveKeywords.filter(word => userContent.includes(word)).length
    const negativeCount = negativeKeywords.filter(word => userContent.includes(word)).length
    
    // 基于对话内容动态调整（特别是中性情绪）
    if (emotion === '惊讶' || emotion === '复杂') {
      if (positiveCount > negativeCount && positiveCount > 0) {
        polarity = 'positive'
        strength = Math.min(strength + 2, 10)
      } else if (negativeCount > positiveCount && negativeCount > 0) {
        polarity = 'negative'
        strength = Math.min(strength + 1, 10)
      }
      confidence = Math.min(confidence + (Math.abs(positiveCount - negativeCount) * 2), 10)
    }
    
    // AI回复质量影响强度评估
    const hasEncouragement = aiMessages.some(msg => 
      msg.content.includes('你做得很好') || 
      msg.content.includes('理解') || 
      msg.content.includes('支持') ||
      msg.content.includes('很好') ||
      msg.content.includes('加油') ||
      msg.content.includes('相信')
    )
    
    const hasComfort = aiMessages.some(msg =>
      msg.content.includes('陪伴') ||
      msg.content.includes('不孤单') ||
      msg.content.includes('一起面对') ||
      msg.content.includes('慢慢来')
    )
    
    // 对话长度影响置信度
    const conversationLength = conversationMessages.length
    if (conversationLength >= 8) {
      confidence = Math.min(confidence + 2, 10) // 长对话提高置信度
    } else if (conversationLength >= 4) {
      confidence = Math.min(confidence + 1, 10)
    }
    
    // 如果有积极的AI回复，可能缓解负面情绪强度
    if (polarity === 'negative' && (hasEncouragement || hasComfort)) {
      strength = Math.max(strength - 1, 1) // 负面情绪通过支持可能减轻
    }
    
    // 确保强度在合理范围内
    strength = Math.max(1, Math.min(10, strength))
    confidence = Math.max(1, Math.min(10, confidence))
    
    return { polarity, strength, confidence }
  }

  const handleEndChat = async () => {
    try {
      // 获取当前会话的消息
      const sessionMessages = currentSession?.messages || []
      
      // 结束会话
      endChatSession()
      
      // 生成详细的情绪记录描述
      const detailedDescription = generateDetailedDescription(emotion, sessionMessages)
      
      // 执行情绪极性分析
      const polarityAnalysis = analyzeEmotionPolarity(emotion, sessionMessages)
      
      // 根据对话内容评估对话效果（重新定义原来的intensity为对话效果）
      const conversationLength = sessionMessages.length
      const hasPositiveResponse = sessionMessages.some((msg: ChatMessage) => 
        msg.role === 'assistant' && (
          msg.content.includes('很好') || 
          msg.content.includes('理解') || 
          msg.content.includes('支持')
        )
      )
      
      // 动态计算对话效果评分（1-10分）
      let conversationEffectiveness = 5 // 默认中等效果
      
      if (conversationLength >= 8) {
        conversationEffectiveness = hasPositiveResponse ? 7 : 6 // 长对话通常有更好的效果
      } else if (conversationLength >= 4) {
        conversationEffectiveness = hasPositiveResponse ? 6 : 5 // 中等对话
      } else {
        conversationEffectiveness = 4 // 短对话效果有限
      }
      
      // 根据情绪极性调整对话效果
      if (polarityAnalysis.polarity === 'positive') {
        conversationEffectiveness = Math.min(conversationEffectiveness + 1, 10) // 积极情绪对话可能效果更好
      } else if (polarityAnalysis.polarity === 'negative') {
        // 消极情绪通过对话可能得到缓解，效果可能更明显
        conversationEffectiveness = Math.min(conversationEffectiveness + 1, 10)
      }
      
      // 添加情绪记录（包含极性分析）
      addEmotionRecord(
        emotion, 
        conversationEffectiveness, 
        detailedDescription,
        undefined, // conversationSummary
        undefined, // emotionEvaluation  
        polarityAnalysis // 新增的极性分析
      )
      
      // 显示成功提示
      toast.success('对话已结束，情绪记录已保存')
      
      onBack()
    } catch (error) {
      console.error('结束对话时出错:', error)
      // 即使分析失败，也要保存基本记录
      endChatSession()
      const sessionMessages = currentSession?.messages || []
      const fallbackDescription = generateDetailedDescription(emotion, sessionMessages)
      // 使用默认的极性分析作为fallback
      const fallbackPolarity: EmotionPolarityAnalysis = {
        polarity: ['快乐'].includes(emotion) ? 'positive' : 
                 ['愤怒', '恐惧', '悲伤', '厌恶'].includes(emotion) ? 'negative' : 'neutral',
        strength: 5,
        confidence: 5
      }
      addEmotionRecord(emotion, 5, fallbackDescription, undefined, undefined, fallbackPolarity)
      toast.success('对话已结束，情绪记录已保存')
      onBack()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTypewriterComplete = () => {
    // 打字完成后保持输入框显示状态
    // showUserInput始终为true，不需要设置
  }

  if (!currentSession) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在初始化对话..." />
      </div>
    )
  }

  const messageCount = currentSession.messages.length

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Breezie 对话</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {emotion}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MessageCircle className="w-3 h-3" />
                  {messageCount} 条消息
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                记录
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  对话记录 - {emotion}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {currentSession.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}>
                          {message.role === 'user' ? <User className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {format(message.timestamp, 'HH:mm:ss', { locale: zhCN })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleEndChat}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <Heart className="w-4 h-4 mr-1" />
            结束对话
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-6">
        {/* AI回复区域 - 上方框 */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-6 min-h-[350px] border border-blue-100 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-gray-800 font-semibold text-lg">Breezie</span>
              <div className="text-sm text-gray-500">AI 情绪助手</div>
            </div>
          </div>
          
          <div className="text-gray-800 leading-relaxed text-lg">
            {isTyping ? (
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-600 font-medium">正在思考中...</span>
              </div>
            ) : aiResponse ? (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <TypewriterText 
                  text={aiResponse} 
                  onComplete={handleTypewriterComplete}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">等待开始对话...</p>
                <p className="text-sm mt-2">Breezie 已准备好倾听你的心声</p>
              </div>
            )}
          </div>
        </div>

        {/* 用户输入区域 - 下方框 */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-gray-800 font-semibold">你的想法</span>
                <div className="text-xs text-gray-400">按 Enter 发送，Shift + Enter 换行</div>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={lastUserMessage || "在这里输入你的想法，分享你的感受..."}
                className="w-full h-28 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-gray-400 transition-all duration-200"
                disabled={isTyping}
                autoFocus
              />
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  在线状态
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  )
} 