'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEmotionStore } from '@/store/emotion'
import { useAuthStore } from '@/store/auth'
import type { EmotionType } from '@/store/emotion'
import { toast } from 'sonner'
import { 
  Send, 
  ArrowLeft, 
  Heart, 
  Sparkles, 
  MessageCircle, 
  CheckCircle, 
  History,
  RefreshCw,
  Zap,
  Moon,
  Sun,
  Brain,
  Smile,
  Frown,
  X,
  RotateCcw,
  Save
} from 'lucide-react'
import { CloudLogo, CloudLogoText } from '@/components/ui/CloudLogo'

type MoodType = 'positive' | 'negative'
type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  emotion?: EmotionType
}

type Suggestion = {
  id: string
  title: string
  description: string
  category: 'immediate' | 'daily' | 'long-term'
}

interface PremiumChatInterfaceProps {
  onBack: () => void
}

export function PremiumChatInterface({ onBack }: PremiumChatInterfaceProps) {
  // Core chat state
  const [currentUserMessage, setCurrentUserMessage] = useState('')
  const [currentBreezieMessage, setCurrentBreezieMessage] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  // Session and mood state
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [chatStarted, setChatStarted] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [rightPanelMode, setRightPanelMode] = useState<'mood_selection' | 'emotions' | 'suggestions' | 'welcome'>('mood_selection')
  
  // UI state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [dislikedSuggestions, setDislikedSuggestions] = useState<string[]>([])
  
  // Store hooks
  const currentSession = useEmotionStore((state) => state.currentSession)
  const addMessage = useEmotionStore((state) => state.addMessage)
  const endChatSession = useEmotionStore((state) => state.endChatSession)
  const startChatSession = useEmotionStore((state) => state.startChatSession)
  const { user, token } = useAuthStore()
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Welcome message effect
  useEffect(() => {
    if (chatStarted && selectedMood && !currentBreezieMessage) {
      const welcomeMessage = getWelcomeMessageByMood(selectedMood)
      setCurrentBreezieMessage(welcomeMessage)
      setRightPanelMode('welcome')
    }
  }, [chatStarted, selectedMood, currentBreezieMessage])

  // Auto-focus input when chat starts
  useEffect(() => {
    if (chatStarted && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [chatStarted])

  const getWelcomeMessageByMood = (mood: MoodType): string => {
    if (mood === 'positive') {
      return "I can sense there's something wonderful you'd like to share! ✨ Your positive energy is already brightening my day. I'm here to celebrate these beautiful moments with you and help you savor every bit of joy you're experiencing. What's bringing this lovely feeling into your heart today? 💙"
    } else {
      return "I can feel that you might be carrying something heavy in your heart right now 💙 Please know that this is a completely safe space where every feeling you have is valid and important. I'm here to hold space for whatever you're experiencing - no judgment, just pure care and understanding. Take your time, and share whatever feels right for you. What's been weighing on your mind today? 🌸"
    }
  }

  const handleMoodSelection = (mood: MoodType) => {
    setSelectedMood(mood)
    setChatStarted(true)
    
    if (!currentSession) {
      startChatSession('Other') // Start with default emotion, will be updated when user selects
    }
    
    toast.success(`Mood selected: ${mood === 'positive' ? 'Positive' : 'Negative'} emotions`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const detectEmotionalEngagement = (message: string): 'high' | 'medium' | 'normal' => {
    const wordCount = message.trim().split(/\s+/).length
    const sentenceCount = message.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    const emotionalWords = /\b(feel|feeling|felt|emotion|heart|soul|pain|hurt|joy|happy|sad|angry|afraid|love|hate|excited|nervous|worried|anxious|depressed|overwhelmed|grateful|blessed|broken|healing|hope|hopeless|amazing|terrible|wonderful|awful|beautiful|ugly|perfect|disaster)\b/gi
    const emotionalMatches = (message.match(emotionalWords) || []).length
    
    const storyIndicators = /\b(today|yesterday|this morning|this evening|earlier|happened|experience|situation|moment|time when|remember when|story|event)\b/gi
    const storyMatches = (message.match(storyIndicators) || []).length
    
    if (wordCount >= 80 || sentenceCount >= 7 || (emotionalMatches >= 5 && wordCount >= 40)) {
      return 'high'
    }
    if (wordCount >= 40 || sentenceCount >= 4 || (emotionalMatches >= 3 && wordCount >= 20)) {
      return 'medium'
    }
    return 'normal'
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return
    
    const userMessage = inputValue.trim()
    setCurrentUserMessage(userMessage)
    setInputValue('')
    setIsTyping(true)
    
    // Add to history
    const userChatMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      emotion: selectedEmotion || undefined
    }
    setChatHistory(prev => [...prev, userChatMessage])
    
    // Detect engagement level
    const engagementLevel = detectEmotionalEngagement(userMessage)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          emotion: selectedEmotion,
          conversationHistory: chatHistory,
          engagementLevel,
          mood: selectedMood,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                break
              }
              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  accumulatedResponse += parsed.content
                  setCurrentBreezieMessage(accumulatedResponse)
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Add Breezie's response to history
      const breezieMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: accumulatedResponse,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, breezieMessage])
      
      // Show emotion selection if not already selected
      if (!selectedEmotion) {
        setRightPanelMode('emotions')
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      const fallbackMessage = "I'm having trouble connecting right now, but I want you to know that I'm here for you. Your feelings matter deeply to me, and I'm listening with my whole heart. 💙"
      setCurrentBreezieMessage(fallbackMessage)
      
      const breezieMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackMessage,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, breezieMessage])
      
      toast.error('Connection issue - please try again')
    } finally {
      setIsTyping(false)
    }
  }

  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setRightPanelMode('suggestions')
    toast.success(`Emotion selected: ${emotion}`)
  }

  const handleNewConversation = () => {
    setCurrentUserMessage('')
    setCurrentBreezieMessage('')
    setInputValue('')
    setSelectedEmotion(null)
    setRightPanelMode('welcome')
  }

  const handleSaveAndComplete = () => {
    if (currentSession) {
      if (currentUserMessage && currentBreezieMessage) {
        const finalNote = `Chat completed. Last exchange: User: "${currentUserMessage}" | Breezie: "${currentBreezieMessage.substring(0, 100)}..."`
        addMessage(finalNote, 'assistant')
      }
      
      endChatSession()
      toast.success('Conversation saved successfully!')
      onBack()
    }
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  const emotions: EmotionType[] = [
    'Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Disgust',
    'Love', 'Excitement', 'Anxiety', 'Hope', 'Frustration', 'Contentment',
    'Loneliness', 'Gratitude', 'Guilt', 'Pride', 'Shame', 'Boredom',
    'Envy', 'Other'
  ]

  // Premium right panel renderer
  const renderRightPanel = () => {
    if (showHistory) {
      return (
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <History className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Conversation History</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">No conversation history yet</p>
                <p className="text-xs text-gray-400 mt-1">Start chatting to build your history</p>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div key={message.id} className={`glass-subtle rounded-xl p-4 ${
                  message.role === 'user' ? 'border-l-4 border-blue-400' : 'border-l-4 border-purple-400'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white'}>
                        {message.role === 'user' ? (user?.email?.[0]?.toUpperCase() || 'U') : 'B'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm text-gray-700">
                          {message.role === 'user' ? (user?.email || 'You') : 'Breezie'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {message.content}
                  </p>
                </div>
              ))
            )}
          </div>
          
          {chatHistory.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => {
                  setChatHistory([])
                  toast.success('Chat history cleared')
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </div>
          )}
        </div>
      )
    }

    switch (rightPanelMode) {
      case 'mood_selection':
        return (
          <div className="p-6 h-full flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float shadow-xl">
                <CloudLogo size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">How are you feeling today?</h3>
              <p className="text-gray-600 text-sm">
                Help me understand your general mood so I can provide better support
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => handleMoodSelection('positive')}
                className="w-full h-16 glass-subtle hover:bg-green-50 border-green-200 text-left justify-start space-x-4 group transition-all duration-300"
                variant="outline"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sun className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Positive Emotions</div>
                  <div className="text-sm text-gray-500">Joy, excitement, gratitude, love...</div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleMoodSelection('negative')}
                className="w-full h-16 glass-subtle hover:bg-blue-50 border-blue-200 text-left justify-start space-x-4 group transition-all duration-300"
                variant="outline"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Moon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Difficult Emotions</div>
                  <div className="text-sm text-gray-500">Sadness, anxiety, anger, stress...</div>
                </div>
              </Button>
            </div>
            
            <div className="mt-8 p-4 glass-subtle rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-700">Why mood selection?</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Understanding your general emotional state helps me provide more personalized and effective support tailored to what you're experiencing.
              </p>
            </div>
          </div>
        )

      case 'emotions':
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Select Your Emotion</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {emotions.map((emotion) => (
                  <Button
                    key={emotion}
                    onClick={() => handleEmotionSelect(emotion)}
                    variant={selectedEmotion === emotion ? "default" : "outline"}
                    className={`h-auto p-3 text-left justify-start transition-all duration-200 ${
                      selectedEmotion === emotion 
                        ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-lg' 
                        : 'glass-subtle hover:shadow-md hover:scale-105'
                    }`}
                  >
                    <span className="text-sm font-medium">{emotion}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRightPanelMode('welcome')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Chat
              </Button>
            </div>
          </div>
        )

      case 'suggestions':
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Personalized Suggestions</h3>
            </div>
            
            {selectedEmotion && (
              <div className="mb-4">
                <Badge variant="secondary" className="glass-subtle">
                  Current emotion: {selectedEmotion}
                </Badge>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="glass-subtle hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800 text-sm">{suggestion.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={selectedSuggestions.includes(suggestion.id) ? "default" : "outline"}
                        onClick={() => {
                          setSelectedSuggestions(prev => 
                            prev.includes(suggestion.id) 
                              ? prev.filter(id => id !== suggestion.id)
                              : [...prev, suggestion.id]
                          )
                        }}
                        className="flex-1"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {selectedSuggestions.includes(suggestion.id) ? 'Selected' : 'Select'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDislikedSuggestions(prev => [...prev, suggestion.id])
                          toast.success('Feedback noted')
                        }}
                        disabled={dislikedSuggestions.includes(suggestion.id)}
                      >
                        👎
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 space-y-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setRightPanelMode('emotions')}
              >
                Update My Emotion
              </Button>
              
              <Button
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-200 border-0"
                onClick={handleSaveAndComplete}
                disabled={!currentSession || (!currentUserMessage && !currentBreezieMessage)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Complete Session
              </Button>
            </div>
          </div>
        )

      case 'welcome':
      default:
        return (
          <div className="p-6 h-full flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow shadow-xl">
                <CloudLogo size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to <CloudLogoText size="md" />
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                I'm here to provide emotional support and guidance. Share what's on your mind, and I'll help you process your feelings with care and understanding.
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-700">Safe Space</span>
                </div>
                <p className="text-sm text-gray-600">
                  Express yourself freely in a judgment-free environment
                </p>
              </div>
              
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="font-medium text-gray-700">Personalized Support</span>
                </div>
                <p className="text-sm text-gray-600">
                  AI-powered responses tailored to your emotional needs
                </p>
              </div>
              
              <div className="glass-subtle rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-gray-700">Practical Guidance</span>
                </div>
                <p className="text-sm text-gray-600">
                  Actionable suggestions when you're ready for them
                </p>
              </div>
            </div>
            
            {currentSession && (currentUserMessage || currentBreezieMessage || chatHistory.length > 0) && (
              <Button
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-200 border-0"
                onClick={handleSaveAndComplete}
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Complete Session
              </Button>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen gradient-surface">
      {/* Premium Header */}
      <header className="glass border-b-0 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <CloudLogo size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-bold">
                    <CloudLogoText size="md" /> Chat
                  </h1>
                  <p className="text-xs text-gray-500">Feeling first, healing follows</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedMood && (
                <Badge className={`glass-subtle ${selectedMood === 'positive' ? 'border-green-200' : 'border-blue-200'}`}>
                  {selectedMood === 'positive' ? (
                    <>
                      <Sun className="w-3 h-3 mr-1" />
                      Positive
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3 mr-1" />
                      Difficult
                    </>
                  )}
                </Badge>
              )}
              
              {selectedEmotion && (
                <Badge className="glass-subtle border-purple-200">
                  <Heart className="w-3 h-3 mr-1" />
                  {selectedEmotion}
                </Badge>
              )}
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Premium Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Breezie's Premium Message Frame */}
            <div className="glass rounded-2xl p-6 shadow-lg border-l-4 border-purple-400">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white text-lg font-bold">
                    B
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">Breezie</span>
                    <Badge variant="secondary" className="text-xs">AI Companion</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Your emotional support assistant</p>
                </div>
                {isTyping && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
              
              <div className="min-h-[140px] max-h-[400px] overflow-y-auto">
                {isTyping ? (
                  <div className="flex items-center space-x-3 text-gray-500">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span className="text-sm italic">Breezie is thinking deeply about your message...</span>
                  </div>
                ) : currentBreezieMessage ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {currentBreezieMessage}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm italic">Waiting for your message...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* User's Premium Message Frame */}
            <div className="glass rounded-2xl p-6 shadow-lg border-l-4 border-blue-400">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">
                      {user?.email || 'You'}
                    </span>
                    <Badge variant="outline" className="text-xs">You</Badge>
                  </div>
                  <p className="text-xs text-gray-500">Share your thoughts and feelings</p>
                </div>
              </div>
              
              <div className="min-h-[140px] max-h-[400px] relative">
                {!chatStarted ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm italic">Please select your mood to start the conversation 💙</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share what's on your mind... Express yourself freely here."
                      className="w-full h-full pr-16 border-none resize-none focus:outline-none text-gray-800 leading-relaxed bg-transparent focus:ring-0 focus:border-transparent"
                      disabled={isTyping}
                    />
                    <div className="absolute bottom-3 right-3">
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex justify-center space-x-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                className="glass-subtle hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>New Topic</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleHistory}
                className="glass-subtle hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>History ({chatHistory.length})</span>
              </Button>

              <Button
                size="sm"
                onClick={handleSaveAndComplete}
                className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 border-0"
                disabled={!currentSession || (!currentUserMessage && !currentBreezieMessage)}
              >
                <Save className="w-4 h-4" />
                <span>Save & Complete</span>
              </Button>
            </div>
          </div>

          {/* Premium Status Bar */}
          <div className="glass-subtle border-t-0 px-6 py-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Connected & Secure</span>
                </div>
                {chatHistory.length > 0 && (
                  <span>• {chatHistory.length} messages exchanged</span>
                )}
              </div>
              <span>Press Enter to send • Shift + Enter for new line</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Premium Dynamic Content */}
        <div className="w-96 glass border-l-0 shadow-xl">
          {renderRightPanel()}
        </div>
      </div>
    </div>
  )
}
