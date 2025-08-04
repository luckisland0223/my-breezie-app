'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotionDatabase'
import { useAuthStore } from '@/store/auth'
import type { EmotionType } from '@/store/emotion'
import { Send, ArrowLeft, MessageCircle, User, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { EmotionSelectionDialog } from './EmotionSelectionDialog'
import { calculateBehavioralImpactScore } from '@/lib/behavioralImpactScore'
import { getRandomResponse } from '@/config/emotionResponses'
import { emotionConfig } from '@/config/emotionConfig'

interface ChatInterfaceProps {
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
      }, 30)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, onComplete])

  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
  }, [text])

  return <span>{displayedText}</span>
}

export function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [lastUserMessage, setLastUserMessage] = useState('')
  const [showEmotionSelection, setShowEmotionSelection] = useState(false)
  const [showInlineEmotions, setShowInlineEmotions] = useState(false)
  const [suggestedEmotions, setSuggestedEmotions] = useState<EmotionType[]>([])
  const [hasInitialMessage, setHasInitialMessage] = useState(false)
  const [conversationText, setConversationText] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('Other')
  const [conversationEnded, setConversationEnded] = useState(false)
  const [representativeEmotion, setRepresentativeEmotion] = useState<EmotionType | null>(null)

  const { user } = useAuthStore()
  const currentSession = useEmotionStore((state) => state.currentSession)
  const startChatSession = useEmotionStore((state) => state.startChatSession)
  const addChatMessage = useEmotionStore((state) => state.addChatMessage)
  const endChatSession = useEmotionStore((state) => state.endChatSession)
  const addEmotionRecord = useEmotionStore((state) => state.addEmotionRecord)

  // Initialize conversation with welcome message
  useEffect(() => {
    if (!hasInitialMessage && !currentSession) {
      const welcomeMessage = user?.user_name 
        ? `你好 ${user.user_name}！我是Breezie，你的情感健康陪伴者。我在这里倾听和支持你，无论你今天经历着什么。现在你的心情怎么样？有什么想和我聊的吗？`
        : `你好！我是Breezie，你的情感健康陪伴者。我在这里倾听和支持你，陪伴你度过生活中的各种感受。今天想和我分享什么呢？`
      
      startChatSession('Other') // Start with a default emotion
      setAiResponse(welcomeMessage)
      addChatMessage({ content: welcomeMessage, role: 'assistant' })
      setHasInitialMessage(true)
    }
  }, [hasInitialMessage, currentSession, startChatSession, addChatMessage, user?.user_name])

  const handleTypewriterComplete = () => {
    // Typewriter animation completed
  }

  // Extract potential emotions from user text
  const extractEmotionsFromText = (text: string): EmotionType[] => {
    const lowerText = text.toLowerCase()
    const emotionKeywords: Partial<Record<EmotionType, string[]>> = {
      'Anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated', '愤怒', '生气', '恼火', '火大'],
      'Disgust': ['disgusted', 'grossed', 'repulsed', '恶心', '厌恶', '反感'],
      'Fear': ['scared', 'afraid', 'terrified', 'anxious', 'worried', '害怕', '恐惧', '担心', '焦虑'],
      'Joy': ['happy', 'joyful', 'excited', 'cheerful', 'glad', '开心', '快乐', '高兴', '兴奋'],
      'Sadness': ['sad', 'depressed', 'down', 'upset', 'hurt', '难过', '悲伤', '沮丧', '伤心'],
      'Surprise': ['surprised', 'shocked', 'amazed', 'astonished', '惊讶', '震惊', '吃惊'],
      'Love': ['love', 'adore', 'care', 'affection', '爱', '喜欢', '关心', '爱情'],
      'Hope': ['trust', 'confident', 'secure', 'hopeful', '信任', '相信', '安全感', '希望'],
      'Excitement': ['excited', 'eager', 'looking forward', '期待', '兴奋', '盼望'],
      'Anxiety': ['anxious', 'nervous', 'worried', 'stressed', '焦虑', '紧张', '担心', '压力'],
      'Pride': ['proud', 'accomplished', 'satisfied', '骄傲', '自豪', '满意'],
      'Shame': ['ashamed', 'embarrassed', 'guilty', '羞愧', '尴尬', '内疚'],
      'Envy': ['jealous', 'envious', '嫉妒', '羡慕'],
      'Guilt': ['guilty', 'regretful', 'sorry', '内疚', '后悔', '抱歉'],
      'Boredom': ['bored', 'tired', 'uninterested', '无聊', '疲倦', '没兴趣'],
      'Confusion': ['confused', 'puzzled', 'uncertain', '困惑', '迷惑', '不确定'],
      'Gratitude': ['grateful', 'thankful', 'appreciative', '感激', '感谢', '欣赏'],
      'Loneliness': ['lonely', 'isolated', 'alone', '孤独', '寂寞', '独自'],
      'Frustration': ['frustrated', 'annoyed', 'impatient', '沮丧', '恼火', '不耐烦'],
      'Contentment': ['content', 'peaceful', 'satisfied', '满足', '平静', '满意']
    }

    const detectedEmotions: EmotionType[] = []
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords) {
        for (const keyword of keywords) {
          if (lowerText.includes(keyword)) {
            detectedEmotions.push(emotion as EmotionType)
            break
          }
        }
      }
    }

    // Remove duplicates
    const uniqueEmotions = [...new Set(detectedEmotions)]
    
    // If we have few or no emotions detected, enrich with contextually relevant suggestions
    if (uniqueEmotions.length < 3) {
      const commonEmotions: EmotionType[] = ['Joy', 'Sadness', 'Anxiety', 'Hope', 'Contentment', 'Confusion', 'Excitement']
      const additionalEmotions = commonEmotions.filter(emotion => !uniqueEmotions.includes(emotion))
      
      // Add contextual emotions based on text sentiment
      if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('工作')) {
        additionalEmotions.unshift('Frustration', 'Pride', 'Anxiety')
      }
      if (lowerText.includes('family') || lowerText.includes('friend') || lowerText.includes('家人') || lowerText.includes('朋友')) {
        additionalEmotions.unshift('Love', 'Gratitude', 'Loneliness')
      }
      if (lowerText.includes('future') || lowerText.includes('plan') || lowerText.includes('未来') || lowerText.includes('计划')) {
        additionalEmotions.unshift('Hope', 'Anxiety', 'Excitement')
      }
      
      // Combine detected and additional emotions
      const allSuggestions = [...uniqueEmotions, ...additionalEmotions].slice(0, 5)
      
      // Ensure we always have at least 3 suggestions
      while (allSuggestions.length < 3 && allSuggestions.length < commonEmotions.length) {
        const remaining = commonEmotions.filter(emotion => !allSuggestions.includes(emotion))
        if (remaining.length > 0 && remaining[0]) {
          allSuggestions.push(remaining[0])
        } else {
          break
        }
      }
      
      return allSuggestions.slice(0, 5)
    }

    // Return 3-5 unique emotions
    return uniqueEmotions.slice(0, 5)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setLastUserMessage(userMessage)
    setIsTyping(true)
    setAiResponse('')

    // Add user message to chat
    addChatMessage({ content: userMessage, role: 'user' })
    setConversationText(prev => prev + ' ' + userMessage)

    // Check if this is the first user message to show emotion selection
    const messages = currentSession?.messages || []
    const userMessages = messages.filter(msg => msg.role === 'user')
    
    try {
      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          emotion: selectedEmotion || 'Other',
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = data.response
        setAiResponse(aiMessage)
        addChatMessage({ content: aiMessage, role: 'assistant' })
        setConversationText(prev => prev + ' ' + aiMessage)

        // Show inline emotion selection after first exchange (user message + AI response)
        if (userMessages.length === 0) {
          setTimeout(() => {
            // Extract emotions from user message and AI response
            const extractedEmotions = extractEmotionsFromText(userMessage + ' ' + aiMessage)
            setSuggestedEmotions(extractedEmotions)
            setShowInlineEmotions(true)
          }, 3000) // Show after AI response is complete and user has read it
        }
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Sorry, I had trouble responding. Please try again.')
      const fallbackResponse = "I apologize, but I'm having trouble connecting right now. Please try sending your message again."
      setAiResponse(fallbackResponse)
      addChatMessage({ content: fallbackResponse, role: 'assistant' })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmotionSelect = (emotion: EmotionType, intensity: number) => {
    // Update selected emotion
    setSelectedEmotion(emotion)
    
    // Calculate behavioral impact score
    const behavioralScore = calculateBehavioralImpactScore(emotion, intensity, conversationText)
    
    // Create emotion record
    addEmotionRecord(emotion, behavioralScore.overall_score, conversationText)
    
    // Get emotion-specific response
    const emotionResponse = getRandomResponse(emotion)
    setAiResponse(emotionResponse)
    addChatMessage({ content: emotionResponse, role: 'assistant' })
    
    // Update session emotion
    if (currentSession) {
      // Note: You might want to add a method to update session emotion
      // For now, we'll just continue with the conversation
    }
    
    setShowEmotionSelection(false)
    toast.success(`Emotion recorded: ${emotion} (Behavioral Impact Score: ${behavioralScore.overall_score}/10)`)
  }

  const handleInlineEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setShowInlineEmotions(false)
    
    // Calculate behavioral impact score
    const behavioralScore = calculateBehavioralImpactScore(emotion, 5, conversationText)
    
    // Create emotion record
    addEmotionRecord(emotion, behavioralScore.overall_score, conversationText)
    
    // Create caring and guiding response based on emotion
    const emotionResponses: Record<EmotionType, string> = {
      'Anger': '我能感受到你的愤怒，这种情绪一定让你很难受。让我们一起深呼吸，慢慢释放这种压力。你愿意告诉我更多关于让你愤怒的事情吗？',
      'Sadness': '我感受到了你内心的悲伤。悲伤是一种很重要的情绪，它让我们意识到什么对我们真正重要。你不必独自承受，我会一直陪伴在你身边。',
      'Fear': '我理解你现在的恐惧和不安。感到害怕是很正常的，这说明你很在乎。让我们一步一步来，我会和你一起面对这些担忧。',
      'Joy': '看到你的快乐真的很棒！这种积极的能量很珍贵，让我们好好享受这个美好的时刻。是什么让你感到如此开心呢？',
      'Anxiety': '我能感受到你的焦虑和担忧。这种不安的感觉确实很难受，但你很勇敢主动寻求支持。让我们一起找到让你平静下来的方法。',
      'Love': '爱是一种美好而强大的情感。我能感受到你心中的温暖。这种爱的感觉真的很宝贵，想和我分享更多关于这种感受吗？',
      'Surprise': '看起来发生了一些意想不到的事情。惊讶可能会带来很多复杂的感受。慢慢来，告诉我发生了什么让你感到惊讶的事情。',
      'Disgust': '我能理解你现在的反感和厌恶。当某些事情违背了我们的价值观时，我们自然会有这种反应。这种感受是有意义的。',
      'Pride': '我为你感到骄傲！这种成就感是你努力的结果。你应该为自己感到自豪，告诉我更多关于这个让你骄傲的时刻吧。',
      'Shame': '我能感受到你的羞愧感，这一定很痛苦。请记住，每个人都会犯错，这不会定义你的价值。你很勇敢与我分享这些感受。',
      'Envy': '嫉妒是一种很人性化的情感，说明你有自己的渴望和需求。让我们一起探索这种感受背后真正想要的是什么。',
      'Guilt': '内疚感说明你有一颗善良的心。虽然这种感受很沉重，但它也显示了你的道德感。我们可以一起处理这些复杂的感受。',
      'Hope': '希望是一束珍贵的光芒。即使在困难中，你仍然怀有希望，这真的很了不起。告诉我，是什么让你保持希望的？',
      'Excitement': '我能感受到你的兴奋和期待！这种积极的能量很感染人。是什么让你如此兴奋？我想和你一起分享这种喜悦。',
      'Boredom': '无聊有时候是我们内心在寻求更有意义事物的信号。也许我们可以一起探索什么能重新点燃你的兴趣和热情。',
      'Confusion': '感到困惑和迷茫是很正常的。生活有时确实很复杂。让我们慢慢梳理，我会帮你找到更清晰的方向。',
      'Gratitude': '感恩是一种美好的情感，它能温暖我们的心。看到你怀有感激之心真的很美好。是什么让你感到特别感激呢？',
      'Loneliness': '我能感受到你的孤独感。这种感觉真的很难受，但请记住你并不孤单。我在这里陪伴你，我们可以一起度过这段时光。',
      'Frustration': '我理解你的挫败感。当事情不如预期时，这种感受是很自然的。让我们一起看看是什么让你感到挫败，也许能找到新的方向。',
      'Contentment': '满足感是一种珍贵的平静。在这个忙碌的世界里，能感到内心平静真的很难得。珍惜这种美好的感受吧。',
      'Other': '虽然很难用一个词来形容你现在的感受，但我能感受到你内心的复杂。无论是什么情感，我都愿意倾听和陪伴你。'
    }
    
    const supportiveResponse = emotionResponses[emotion] || emotionResponses['Other']
    const newResponse = aiResponse + "\n\n" + supportiveResponse
    setAiResponse(newResponse)
    addChatMessage({ content: supportiveResponse, role: 'assistant' })
    
    toast.success(`已记录你的感受：${emotion}`)
  }

  const handleSkipEmotion = () => {
    setShowEmotionSelection(false)
    const skipResponse = "没关系的！如果你愿意的话，随时都可以和我分享你的感受。让我们继续聊天吧，还有什么想和我分享的吗？"
    setAiResponse(skipResponse)
    addChatMessage({ content: skipResponse, role: 'assistant' })
    toast.success("已跳过情绪选择")
  }

  // Select representative emotion for the conversation
  const selectRepresentativeEmotion = (): EmotionType => {
    if (!currentSession?.messages) return selectedEmotion ?? 'Other'
    
    const userMessages = currentSession.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ')
    
    const detectedEmotions = extractEmotionsFromText(userMessages + ' ' + conversationText)
    
    // If we have a selected emotion from user, prioritize it
    if (selectedEmotion && selectedEmotion !== 'Other') {
      return selectedEmotion as EmotionType
    }
    
    // Otherwise, return the first detected emotion
    return detectedEmotions.length > 0 ? detectedEmotions[0]! : 'Other'
  }

  const handleEndSession = () => {
    if (currentSession) {
      // Select representative emotion before ending session
      const repEmotion = selectRepresentativeEmotion()
      setRepresentativeEmotion(repEmotion)
      
      // If no emotion was selected during conversation, create a record with representative emotion
      if (!selectedEmotion || selectedEmotion === 'Other') {
        const behavioralScore = calculateBehavioralImpactScore(repEmotion, 5, conversationText)
        addEmotionRecord(repEmotion, behavioralScore.overall_score, conversationText)
        toast.success(`对话已保存，代表情绪：${repEmotion}`)
      }
      
      endChatSession()
    }
    onBack()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={handleEndSession}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journey
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Chat with Breezie</span>
            </div>
            
            <div className="w-20"></div> {/* Spacer for balance */}
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* AI Response Area */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* AI Avatar and Info */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-gray-800 font-semibold text-lg">Breezie</span>
                <div className="text-sm text-gray-500">AI Emotional Wellness Assistant</div>
              </div>
            </div>
            
            {/* AI Response - Fixed Height Container */}
            <div className="text-gray-800 leading-relaxed text-lg min-h-[300px] max-h-[500px] overflow-y-auto">
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
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <TypewriterText 
                      text={aiResponse} 
                      onComplete={handleTypewriterComplete}
                    />
                  </div>
                  
                  {/* Inline Emotion Selection */}
                  {showInlineEmotions && suggestedEmotions.length > 0 && (
                    <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/50">
                      <div className="text-center mb-4">
                        <p className="text-gray-700 font-medium mb-2">根据你的分享，我感受到了这些情绪，哪个最符合你现在的感受？</p>
                        <p className="text-sm text-gray-600">选择一个来帮助我更好地理解你</p>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-3 mb-4">
                        {suggestedEmotions.map((emotion) => {
                          const config = emotionConfig[emotion]
                          return (
                            <button
                              key={emotion}
                              onClick={() => handleInlineEmotionSelect(emotion)}
                              className="flex flex-col items-center p-3 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-white/70 transition-all duration-200 min-w-[80px]"
                            >
                              <span className="text-2xl mb-1">{config.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{emotion}</span>
                            </button>
                          )
                        })}
                      </div>
                      
                      <div className="text-center">
                        <button
                          onClick={() => setShowInlineEmotions(false)}
                          className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                          稍后再说
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Ready to start our conversation...</p>
                  <p className="text-sm mt-2">I'm here to listen and support you</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Input Area */}
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

        {/* Chat History */}
        {currentSession?.messages && currentSession.messages.length > 1 && (
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation History</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {currentSession.messages.slice(1).map((message, index) => ( // Skip first welcome message
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(message.timestamp, 'HH:mm:ss')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emotion Selection Dialog */}
      {showEmotionSelection && (
        <EmotionSelectionDialog
          onEmotionSelect={handleEmotionSelect}
          onSkip={handleSkipEmotion}
          userName={user?.user_name}
        />
      )}
    </div>
  )
}