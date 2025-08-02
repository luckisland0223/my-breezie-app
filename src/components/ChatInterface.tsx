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
// Use dynamic AI generation instead of preset responses
import type { ChatMessage } from '@/lib/openaiService'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

interface ChatInterfaceProps {
  emotion: EmotionType
  onBack: () => void
}

// Dynamic typewriter effect component
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30) // Display one character every 30ms
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  useEffect(() => {
    // Reset state when text changes
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
      // Add personalized AI welcome message
      setTimeout(async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMessage: `The user just selected "${emotion}" emotion to start a conversation. Please provide a warm, personalized opening message that makes them feel understood and welcomed. Avoid templated language.`,
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
            // Simple welcome message if API fails
            const welcomeResponse = `Hello, I'm Breezie. I notice you're feeling ${emotion.toLowerCase()} right now, and I'm here to support you. Would you like to share what's happening?`
            setAiResponse(welcomeResponse)
            addMessage(welcomeResponse, 'assistant')
          }
        } catch (error) {
          // Fallback welcome message for network errors
          const welcomeResponse = `Hello, I'm Breezie. I'm here to support you, whatever you're feeling right now. Would you like to share what's on your mind?`
          setAiResponse(welcomeResponse)
          addMessage(welcomeResponse, 'assistant')
        }
      }, 500)
    }
  }, [emotion, currentSession, startChatSession, addMessage])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    
    // Save user message for display preview
    setLastUserMessage(userMessage)
    
    // Add user message to history
    addMessage(userMessage, 'user')
    
    // Clear input but maintain display state
    setInputValue('')
    setIsTyping(true)
    setAiResponse('')
    
    try {
      // Build conversation history
      const conversationHistory: ChatMessage[] = currentSession?.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })) || []
      
      // Call Gemini API
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
        throw new Error(data.message || 'API returned error')
      }
      
      // Set AI response and start typing effect
      setAiResponse(data.response)
      addMessage(data.response, 'assistant')
      
    } catch (error) {
      console.error('Gemini API call failed:', error)
      
      // Friendly response when API call fails
      const fallbackResponse = 'Sorry, I cannot connect to the AI service right now. This might be due to invalid API key or network issues. Please contact the developer to check configuration.'
      setAiResponse(fallbackResponse)
      addMessage(fallbackResponse, 'assistant')
      
      // Show error notification
      toast.error('API call failed - Please check API key configuration')
    } finally {
      setIsTyping(false)
    }
  }

  // Generate detailed emotion record description
  const generateDetailedDescription = (emotion: EmotionType, messages: ChatMessage[]): string => {
    const userMessages = messages.filter(msg => msg.role === 'user')
    const aiMessages = messages.filter(msg => msg.role === 'assistant')
    
    if (userMessages.length === 0) {
      return `Experienced ${emotion.toLowerCase()} emotion but didn't engage in deep conversation`
    }
    
    // Analyze user message keywords and themes
    const firstUserMessage = userMessages[0]?.content || ''
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || ''
    
    // Generate more specific descriptions based on emotion type
    const emotionContexts = {
      'Anger': [
        'Emotional fluctuations due to work stress',
        'Dissatisfaction triggered by interpersonal conflicts',
        'Indignation about unfair treatment',
        'Anger arising from unmet expectations',
        'Accumulation of daily life frustrations'
      ],
      'Sadness': [
        'Nostalgia for better times in the past',
        'Inner pain when facing loss',
        'Worry about future uncertainty',
        'Feelings of loneliness and being misunderstood',
        'Experiencing changes in important relationships'
      ],
      'Fear': [
        'Concerns about unknown challenges',
        'Anxiety when facing important decisions',
        'Worry about failure or making mistakes',
        'Concerns about health or safety',
        'Fear of losing important people or things'
      ],
      'Joy': [
        'Delight after achieving important goals',
        'Wonderful times spent with family and friends',
        'Discovering new interests or opportunities',
        'Sense of accomplishment after overcoming difficulties',
        'Joy when receiving good news'
      ],
      'Surprise': [
        'Encountering unexpectedly good news',
        'Discovering new possibilities or opportunities',
        'Unexpected reactions to others\' behavior',
        'Sudden turns in life',
        'Amazement when learning new knowledge'
      ],
      'Disgust': [
        'Aversion to certain behaviors or attitudes',
        'Discomfort when facing moral conflicts',
        'Dissatisfaction with environment or situations',
        'Encountering things that conflict with values',
        'Weariness of repetitive problems'
      ],
      'Complex': [
        'Struggling with multiple choices',
        'Inner conflicts under intertwined emotions',
        'Deep thinking about complex situations',
        'Delicate balance in handling relationships',
        'Seeking direction amidst changes'
      ]
    }
    
    // Randomly select a relevant context description
    const contexts = emotionContexts[emotion] || ['Experienced complex emotional state']
    const randomContext = contexts[Math.floor(Math.random() * contexts.length)]
    
    // Analyze conversation length and content depth
    const conversationLength = messages.length
    const hasDeepConversation = conversationLength >= 6
    const hasResolution = aiMessages.some(msg => 
      msg.content.includes('suggest') || 
      msg.content.includes('try') || 
      msg.content.includes('can') ||
      msg.content.includes('help')
    )
    
    // Generate comprehensive description
    let description = randomContext
    
    if (hasDeepConversation) {
      description += ', through deep self-exploration and reflection'
    } else {
      description += ', through initial emotional expression'
    }
    
    if (hasResolution) {
      description += ', gaining valuable guidance and advice'
    } else {
      description += ', completing basic emotional processing'
    }
    
    // Add supplementary information based on conversation duration
    const conversationDuration = messages.length > 4 ? 'in-depth' : messages.length > 2 ? 'moderate' : 'brief'
    description += `. ${conversationDuration} exchange, ${Math.ceil(conversationLength / 2)} rounds of conversation`
    
    return description || `Basic record of experiencing ${emotion.toLowerCase()} emotion`
  }

  // Emotion polarity analysis algorithm
  const analyzeEmotionPolarity = (
    emotion: EmotionType, 
    conversationMessages: ChatMessage[]
  ): EmotionPolarityAnalysis => {
    
    // Base emotion polarity mapping
    const emotionPolarityMap: Record<EmotionType, { base: PolarityType; strength: number }> = {
      'Joy': { base: 'positive', strength: 8 },
      'Surprise': { base: 'neutral', strength: 6 },   // Can be positive or negative
      'Anger': { base: 'negative', strength: 8 },
      'Fear': { base: 'negative', strength: 7 },
      'Sadness': { base: 'negative', strength: 7 },
      'Disgust': { base: 'negative', strength: 6 },
      'Complex': { base: 'neutral', strength: 5 }
    }
    
    let polarity = emotionPolarityMap[emotion]?.base || 'neutral'
    let strength = emotionPolarityMap[emotion]?.strength || 5
    let confidence = 7 // Base confidence level
    
    // Analyze conversation content to adjust assessment
    const userMessages = conversationMessages.filter(msg => msg.role === 'user')
    const aiMessages = conversationMessages.filter(msg => msg.role === 'assistant')
    
    // Positive keyword detection
    const positiveKeywords = ['happy', 'glad', 'satisfied', 'success', 'better', 'solved', 'thank', 'comfortable', 'relaxed', 'hope', 'optimistic', 'like', 'love', 'good', 'great', 'amazing', 'wonderful', 'excellent', 'perfect', 'excited', 'delighted']
    const negativeKeywords = ['painful', 'hurt', 'terrible', 'failure', 'desperate', 'helpless', 'hate', 'afraid', 'worry', 'anxious', 'stress', 'lonely', 'disappointed', 'sad', 'angry', 'frustrated', 'upset', 'depressed', 'awful', 'horrible']
    
    const userContent = userMessages.map(m => m.content).join(' ')
    const aiContent = aiMessages.map(m => m.content).join(' ')
    
    const positiveCount = positiveKeywords.filter(word => userContent.toLowerCase().includes(word)).length
    const negativeCount = negativeKeywords.filter(word => userContent.toLowerCase().includes(word)).length
    
    // Dynamically adjust based on conversation content (especially for neutral emotions)
    if (emotion === 'Surprise' || emotion === 'Complex') {
      if (positiveCount > negativeCount && positiveCount > 0) {
        polarity = 'positive'
        strength = Math.min(strength + 2, 10)
      } else if (negativeCount > positiveCount && negativeCount > 0) {
        polarity = 'negative'
        strength = Math.min(strength + 1, 10)
      }
      confidence = Math.min(confidence + (Math.abs(positiveCount - negativeCount) * 2), 10)
    }
    
    // AI response quality affects strength assessment
    const hasEncouragement = aiMessages.some(msg => 
      msg.content.includes('you\'re doing well') || 
      msg.content.includes('understand') || 
      msg.content.includes('support') ||
      msg.content.includes('good job') ||
      msg.content.includes('keep going') ||
      msg.content.includes('believe')
    )
    
    const hasComfort = aiMessages.some(msg =>
      msg.content.includes('accompany') ||
      msg.content.includes('not alone') ||
      msg.content.includes('face together') ||
      msg.content.includes('take your time')
    )
    
    // Conversation length affects confidence
    const conversationLength = conversationMessages.length
    if (conversationLength >= 8) {
      confidence = Math.min(confidence + 2, 10) // Long conversations increase confidence
    } else if (conversationLength >= 4) {
      confidence = Math.min(confidence + 1, 10)
    }
    
    // Positive AI responses may alleviate negative emotion intensity
    if (polarity === 'negative' && (hasEncouragement || hasComfort)) {
      strength = Math.max(strength - 1, 1) // Negative emotions may be alleviated through support
    }
    
    // Ensure strength is within reasonable range
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
        <LoadingSpinner size="lg" text="Initializing conversation..." />
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
              <CardTitle className="text-lg">Breezie Conversation</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {emotion}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MessageCircle className="w-3 h-3" />
                  {messageCount} messages
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
                History
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Conversation History - {emotion}
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
                          {format(message.timestamp, 'HH:mm:ss', { locale: enUS })}
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
            End Conversation
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-6">
        {/* AI response area - top box */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-6 min-h-[350px] border border-blue-100 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-gray-800 font-semibold text-lg">Breezie</span>
              <div className="text-sm text-gray-500">AI Emotional Wellness Assistant</div>
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
                <span className="text-gray-600 font-medium">Thinking...</span>
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
                <p className="text-lg">Waiting to start conversation...</p>
                <p className="text-sm mt-2">Breezie is ready to listen to your thoughts</p>
              </div>
            )}
          </div>
        </div>

        {/* User input area - bottom box */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-gray-800 font-semibold">Your Thoughts</span>
                <div className="text-xs text-gray-400">Press Enter to send, Shift + Enter for new line</div>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={lastUserMessage || "Share your thoughts and feelings here..."}
                className="w-full h-28 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-gray-400 transition-all duration-200"
                disabled={isTyping}
                autoFocus
              />
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Online
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  )
} 