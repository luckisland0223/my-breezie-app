import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotionDatabase'
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
              userMessage: `The user selected "${emotion}" as their current emotion and wants to start a conversation with you. Please provide a direct, warm opening that invites them to share what's happening. Don't use phrases like "I understand" or "I can understand you" - instead, ask them to tell you about their situation or what brought them to feel this way. Be natural and conversational, as if a caring friend is asking them to open up.`,
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

  // Generate detailed emotion record description based on actual conversation content
  const generateDetailedDescription = (emotion: EmotionType, messages: ChatMessage[]): string => {
    const userMessages = messages.filter(msg => msg.role === 'user')
    const aiMessages = messages.filter(msg => msg.role === 'assistant')
    
    if (userMessages.length === 0) {
      return `Experienced ${emotion.toLowerCase()} emotion but didn't engage in deep conversation`
    }
    
    // Analyze conversation content for keywords and themes
    const allUserContent = userMessages.map(msg => msg.content.toLowerCase()).join(' ')
    const firstMessage = userMessages[0]?.content || ''
    const lastMessage = userMessages[userMessages.length - 1]?.content || ''
    
    // Extract key topics and themes from user messages
    const extractMainTheme = (content: string): string => {
      // Work-related keywords
      if (content.includes('work') || content.includes('job') || content.includes('boss') || 
          content.includes('colleague') || content.includes('office') || content.includes('career')) {
        return 'work-related challenges'
      }
      
      // Relationship keywords
      if (content.includes('friend') || content.includes('family') || content.includes('partner') || 
          content.includes('relationship') || content.includes('love') || content.includes('breakup')) {
        return 'interpersonal relationships'
      }
      
      // Health/anxiety keywords
      if (content.includes('health') || content.includes('sick') || content.includes('tired') || 
          content.includes('stress') || content.includes('anxious') || content.includes('worry')) {
        return 'health and wellbeing concerns'
      }
      
      // Achievement keywords
      if (content.includes('success') || content.includes('achievement') || content.includes('goal') || 
          content.includes('accomplished') || content.includes('proud') || content.includes('win')) {
        return 'personal achievements'
      }
      
      // Future/decision keywords
      if (content.includes('future') || content.includes('decision') || content.includes('choice') || 
          content.includes('plan') || content.includes('uncertain') || content.includes('change')) {
        return 'life decisions and future planning'
      }
      
      // Financial keywords
      if (content.includes('money') || content.includes('financial') || content.includes('expensive') || 
          content.includes('budget') || content.includes('salary') || content.includes('cost')) {
        return 'financial concerns'
      }
      
      // Learning/growth keywords
      if (content.includes('learn') || content.includes('study') || content.includes('skill') || 
          content.includes('education') || content.includes('knowledge') || content.includes('growth')) {
        return 'personal development'
      }
      
      // Default to generic emotional state
      return 'personal emotional experiences'
    }
    
    // Generate personalized description based on actual conversation
    const mainTheme = extractMainTheme(allUserContent)
    let description = `${emotion} experienced in relation to ${mainTheme}`
    
    // Add conversation insights
    const conversationLength = messages.length
    const hasProgress = lastMessage.toLowerCase() !== firstMessage.toLowerCase()
    
    // Analyze conversation progression
    if (conversationLength >= 8) {
      description += ', explored through extensive dialogue and self-reflection'
    } else if (conversationLength >= 4) {
      description += ', discussed in meaningful conversation'
    } else {
      description += ', briefly expressed and acknowledged'
    }
    
    // Check for resolution indicators
    const hasPositiveResolution = userMessages.some(msg => 
      msg.content.toLowerCase().includes('better') || 
      msg.content.toLowerCase().includes('helpful') || 
      msg.content.toLowerCase().includes('thank') ||
      msg.content.toLowerCase().includes('understand') ||
      msg.content.toLowerCase().includes('clear')
    )
    
    const hasAdviceGiven = aiMessages.some(msg => 
      msg.content.includes('suggest') || 
      msg.content.includes('try') || 
      msg.content.includes('recommend') ||
      msg.content.includes('consider')
    )
    
    if (hasPositiveResolution) {
      description += '. Session concluded with improved understanding and clarity'
    } else if (hasAdviceGiven) {
      description += '. Received guidance and practical suggestions for moving forward'
    } else if (hasProgress) {
      description += '. Engaged in emotional processing and validation'
    } else {
      description += '. Initial emotional expression and support received'
    }
    
    // Add conversation metadata
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
    description += ` (${conversationLength} exchanges at ${timestamp})`
    
    return description
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
      // Get current session messages
      const sessionMessages = currentSession?.messages || []
      
      // End session
      endChatSession()
      
      // Generate detailed emotion record description
      const detailedDescription = generateDetailedDescription(emotion, sessionMessages)
      
      // Perform emotion polarity analysis
      const polarityAnalysis = analyzeEmotionPolarity(emotion, sessionMessages)
      
      // Evaluate conversation effectiveness based on dialogue content (redefining original intensity as conversation effectiveness)
      const conversationLength = sessionMessages.length
      const hasPositiveResponse = sessionMessages.some((msg: ChatMessage) => 
        msg.role === 'assistant' && (
          msg.content.includes('very good') || 
          msg.content.includes('understand') || 
          msg.content.includes('support')
        )
      )
      
      // Dynamically calculate conversation effectiveness score (1-10 points)
      let conversationEffectiveness = 5 // Default medium effectiveness
      
      if (conversationLength >= 8) {
        conversationEffectiveness = hasPositiveResponse ? 7 : 6 // Long conversations usually have better effectiveness
      } else if (conversationLength >= 4) {
        conversationEffectiveness = hasPositiveResponse ? 6 : 5 // Medium conversations
      } else {
        conversationEffectiveness = 4 // Short conversations have limited effectiveness
      }
      
      // Adjust conversation effectiveness based on emotion polarity
      if (polarityAnalysis.polarity === 'positive') {
        conversationEffectiveness = Math.min(conversationEffectiveness + 1, 10) // Positive emotions may lead to more effective conversations
      } else if (polarityAnalysis.polarity === 'negative') {
        // Negative emotions may be alleviated through conversation, effects may be more noticeable
        conversationEffectiveness = Math.min(conversationEffectiveness + 1, 10)
      }
      
      // Add emotion record (including polarity analysis)
      addEmotionRecord(
        emotion, 
        conversationEffectiveness, 
        detailedDescription,
        undefined, // conversationSummary
        undefined, // emotionEvaluation  
        polarityAnalysis // New polarity analysis
      )
      
      // Show success message
      toast.success('Conversation ended, emotion record saved successfully')
      
      onBack()
    } catch (error) {
      console.error('Error ending conversation:', error)
      // Save basic record even if analysis fails
      endChatSession()
      const sessionMessages = currentSession?.messages || []
      const fallbackDescription = generateDetailedDescription(emotion, sessionMessages)
      // Use default polarity analysis as fallback
      const fallbackPolarity: EmotionPolarityAnalysis = {
        polarity: ['Joy'].includes(emotion) ? 'positive' : 
                 ['Anger', 'Fear', 'Sadness', 'Disgust'].includes(emotion) ? 'negative' : 'neutral',
        strength: 5,
        confidence: 5
      }
      addEmotionRecord(emotion, 5, fallbackDescription, undefined, undefined, fallbackPolarity)
      toast.success('Conversation ended, emotion record saved successfully')
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
    // Keep input field visible after typing completion
    // showUserInput is always true, no need to set
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