'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { 
  Send, 
  ArrowLeft, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle,
  Sparkles,
  User,
  Bot,
  CheckCircle,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/store/auth'
import { getRandomFallback } from '@/config/prompts'

interface NewChatInterfaceProps {
  onBack: () => void
}

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface Suggestion {
  id: string
  title: string
  description: string
  category: 'immediate' | 'daily' | 'longterm'
  liked?: boolean
  disliked?: boolean
}

type RightPanelMode = 'mood_selection' | 'welcome' | 'emotions' | 'suggestions' | 'analysis'

type MoodType = 'positive' | 'negative' | null

const EMOTIONS: { id: EmotionType; label: string; color: string; emoji: string }[] = [
  { id: 'Joy', label: 'Joy', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '😊' },
  { id: 'Sadness', label: 'Sadness', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '😢' },
  { id: 'Anger', label: 'Anger', color: 'bg-red-100 border-red-300 text-red-800', emoji: '😠' },
  { id: 'Fear', label: 'Fear', color: 'bg-purple-100 border-purple-300 text-purple-800', emoji: '😰' },
  { id: 'Anxiety', label: 'Anxiety', color: 'bg-orange-100 border-orange-300 text-orange-800', emoji: '😟' },
  { id: 'Love', label: 'Love', color: 'bg-pink-100 border-pink-300 text-pink-800', emoji: '💕' },
  { id: 'Hope', label: 'Hope', color: 'bg-green-100 border-green-300 text-green-800', emoji: '🌟' },
  { id: 'Excitement', label: 'Excitement', color: 'bg-cyan-100 border-cyan-300 text-cyan-800', emoji: '🎉' },
  { id: 'Confusion', label: 'Confusion', color: 'bg-gray-100 border-gray-300 text-gray-800', emoji: '🤔' },
  { id: 'Other', label: 'Other', color: 'bg-slate-100 border-slate-300 text-slate-800', emoji: '💭' },
]

export function NewChatInterface({ onBack }: NewChatInterfaceProps) {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  // Right panel state
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('mood_selection')
  const [selectedMood, setSelectedMood] = useState<MoodType>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showEmotionPrompt, setShowEmotionPrompt] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Store integration
  const currentSession = useEmotionStore((state) => state.currentSession)
  const startChatSession = useEmotionStore((state) => state.startChatSession)
  const addMessage = useEmotionStore((state) => state.addMessage)
  const endChatSession = useEmotionStore((state) => state.endChatSession)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Initialize session and welcome message based on mood selection
  useEffect(() => {
    if (!currentSession && chatStarted && selectedMood) {
      startChatSession('Other')
      // Add mood-specific welcome message
      setTimeout(() => {
        const welcomeContent = getWelcomeMessageByMood(selectedMood)
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          content: welcomeContent,
          role: 'assistant',
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
        addMessage(welcomeMessage.content, 'assistant')
        setRightPanelMode('welcome')
      }, 500)
    }
  }, [currentSession, startChatSession, addMessage, chatStarted, selectedMood])

  // Get mood-specific welcome message
  const getWelcomeMessageByMood = (mood: MoodType): string => {
    if (mood === 'positive') {
      return "Your joy and positive energy are so beautiful to witness 💕 I'm Breezie, and I'm here to celebrate and nurture the wonderful feelings you're experiencing. Your happiness matters deeply to me, and I want to help you savor and understand these precious moments 🌟 What's bringing light to your heart today? I'm here to share in your positivity and help you explore these beautiful emotions 😊✨"
    } else if (mood === 'negative') {
      return "Your heart and the difficult feelings you're carrying matter so deeply to me 💕 I'm Breezie, and I'm here to hold space for your pain and provide the comfort you deserve. You're so brave for reaching out, and I want you to know that whatever you're going through, you don't have to face it alone 🤗 What's weighing on your heart right now? I'm here to listen with all the gentleness and understanding you need 💙"
    }
    return "Your heart and feelings matter so deeply to me 💕 I'm Breezie, and I'm here to hold space for everything you're experiencing. You deserve to feel heard, seen, and cared for in this moment 🌟"
  }

  // Handle mood selection
  const handleMoodSelection = (mood: MoodType) => {
    setSelectedMood(mood)
    setChatStarted(true)
  }

  // Detect when to show emotion selection
  const shouldShowEmotions = (message: string): boolean => {
    const emotionTriggers = [
      'how are you feeling', 'what are you feeling', 'how do you feel',
      'what emotions', 'your emotions', 'feeling right now'
    ]
    return emotionTriggers.some(trigger => message.toLowerCase().includes(trigger))
  }

  // Generate suggestions based on emotion and conversation
  const generateSuggestions = async (emotion: EmotionType, conversationContext: string): Promise<Suggestion[]> => {
    // This would typically call an API, but for now we'll generate based on emotion
    const baseSuggestions: Partial<Record<EmotionType, Suggestion[]>> = {
      'Anxiety': [
        {
          id: '1',
          title: 'Deep Breathing Exercise',
          description: 'Try the 4-7-8 breathing technique to calm your nervous system',
          category: 'immediate'
        },
        {
          id: '2', 
          title: 'Grounding Technique',
          description: 'Use the 5-4-3-2-1 method: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
          category: 'immediate'
        },
        {
          id: '3',
          title: 'Daily Mindfulness',
          description: 'Set aside 10 minutes each day for mindfulness meditation',
          category: 'daily'
        }
      ],
      'Sadness': [
        {
          id: '4',
          title: 'Gentle Self-Care',
          description: 'Take a warm bath, listen to soothing music, or do something nurturing for yourself',
          category: 'immediate'
        },
        {
          id: '5',
          title: 'Connect with Support',
          description: 'Reach out to a trusted friend or family member',
          category: 'immediate'
        },
        {
          id: '6',
          title: 'Journaling Practice',
          description: 'Write about your feelings for 5-10 minutes each day',
          category: 'daily'
        }
      ],
      'Anger': [
        {
          id: '7',
          title: 'Physical Release',
          description: 'Go for a brisk walk or do some physical exercise to release tension',
          category: 'immediate'
        },
        {
          id: '8',
          title: 'Cool Down Time',
          description: 'Take 10 deep breaths and count to 10 before responding',
          category: 'immediate'
        }
      ],
      'Fear': [
        {
          id: '10',
          title: 'Safety Check',
          description: 'Remind yourself that you are safe in this moment',
          category: 'immediate'
        },
        {
          id: '11',
          title: 'Face Your Fears Gradually',
          description: 'Take small steps toward what scares you when you feel ready',
          category: 'longterm'
        }
      ],
      'Joy': [
        {
          id: '12',
          title: 'Savor the Moment',
          description: 'Take time to fully experience and appreciate this positive feeling',
          category: 'immediate'
        },
        {
          id: '13',
          title: 'Share Your Joy',
          description: 'Tell someone about what\'s making you happy',
          category: 'immediate'
        }
      ],
      'Love': [
        {
          id: '14',
          title: 'Express Gratitude',
          description: 'Let the people you love know how much they mean to you',
          category: 'immediate'
        },
        {
          id: '15',
          title: 'Acts of Kindness',
          description: 'Show love through small, thoughtful gestures',
          category: 'daily'
        }
      ],
      'Hope': [
        {
          id: '16',
          title: 'Vision Board',
          description: 'Create a visual representation of your hopes and dreams',
          category: 'longterm'
        },
        {
          id: '17',
          title: 'Small Steps',
          description: 'Take one small action toward what you\'re hoping for',
          category: 'immediate'
        }
      ],
      'Excitement': [
        {
          id: '18',
          title: 'Channel Your Energy',
          description: 'Use this excitement to take action on something important to you',
          category: 'immediate'
        },
        {
          id: '19',
          title: 'Plan Ahead',
          description: 'Make plans to sustain this positive energy',
          category: 'daily'
        }
      ],
      'Other': [
        {
          id: '9',
          title: 'Check In With Yourself',
          description: 'Take a moment to acknowledge how you\'re feeling right now',
          category: 'immediate'
        },
        {
          id: '20',
          title: 'Mindful Awareness',
          description: 'Practice being present with whatever emotions arise',
          category: 'daily'
        }
      ]
    }

    return baseSuggestions[emotion] || baseSuggestions['Other'] || []
  }

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    addMessage(userMessage.content, 'user')
    setInputValue('')
    setIsTyping(true)

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userMessage: userMessage.content,
          emotion: selectedEmotion || 'Other',
          mood: selectedMood,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
        addMessage(assistantMessage.content, 'assistant')

        // Check if we should show emotion selection
        if (shouldShowEmotions(data.response) && !selectedEmotion) {
          setRightPanelMode('emotions')
          setShowEmotionPrompt(true)
        }
        
        // If emotion is selected and we have enough context, show suggestions
        if (selectedEmotion && messages.length > 2) {
          const newSuggestions = await generateSuggestions(selectedEmotion, 
            messages.map(m => m.content).join(' ')
          )
          setSuggestions(newSuggestions)
          setRightPanelMode('suggestions')
        }

      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      toast.error('Sorry, I had trouble responding. Please try again.')
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getRandomFallback('chatError'),
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle emotion selection
  const handleEmotionSelect = async (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setShowEmotionPrompt(false)
    
    // Generate suggestions based on selected emotion
    const newSuggestions = await generateSuggestions(emotion, 
      messages.map(m => m.content).join(' ')
    )
    setSuggestions(newSuggestions)
    setRightPanelMode('suggestions')
    
    toast.success(`Selected emotion: ${emotion}`)
  }

  // Handle suggestion feedback
  const handleSuggestionLike = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId 
        ? { ...s, liked: !s.liked, disliked: false }
        : s
    ))
  }

  const handleSuggestionDislike = (suggestionId: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === suggestionId 
        ? { ...s, disliked: !s.disliked, liked: false }
        : s
    ))
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Render right panel content
  const renderRightPanel = () => {
    switch (rightPanelMode) {
      case 'mood_selection':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How are you feeling today?</h2>
            <p className="text-gray-600 mb-8 max-w-sm">
              To provide you with the most caring and personalized support, let me know the general mood you're experiencing right now.
            </p>
            
            <div className="space-y-4 w-full max-w-sm">
              <Button
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => handleMoodSelection('positive')}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">😊</span>
                  <div className="text-left">
                    <div className="font-semibold">Positive Emotions</div>
                    <div className="text-sm opacity-90">Happy, excited, grateful, hopeful</div>
                  </div>
                </div>
              </Button>
              
              <Button
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => handleMoodSelection('negative')}
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">😔</span>
                  <div className="text-left">
                    <div className="font-semibold">Difficult Emotions</div>
                    <div className="text-sm opacity-90">Sad, anxious, angry, confused</div>
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="mt-8 text-xs text-gray-500 max-w-xs">
              Don't worry about being exact - this just helps me understand how to best support you 💙
            </div>
          </div>
        )

      case 'welcome':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Breezie</h2>
            <p className="text-gray-600 mb-6">
              I'm here to provide emotional support and guidance. Share what's on your mind, and I'll help you process your feelings.
            </p>
            <div className="space-y-3 w-full max-w-sm">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>Safe space for sharing</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>Personalized support</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4" />
                <span>Practical suggestions</span>
              </div>
            </div>
          </div>
        )

      case 'emotions':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">How are you feeling?</h3>
              <p className="text-gray-600 text-sm">
                Select the emotion that best matches what you're experiencing right now.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {EMOTIONS.map((emotion) => (
                <Button
                  key={emotion.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 border-2 transition-all hover:scale-105 ${
                    selectedEmotion === emotion.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleEmotionSelect(emotion.id)}
                >
                  <span className="text-2xl">{emotion.emoji}</span>
                  <span className="font-medium text-sm">{emotion.label}</span>
                </Button>
              ))}
            </div>

            {selectedEmotion && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Selected: <span className="font-semibold">{selectedEmotion}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  I'll tailor my responses to support you with this emotion.
                </p>
              </div>
            )}
          </div>
        )

      case 'suggestions':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Suggestions for You</h3>
              <p className="text-gray-600 text-sm">
                Based on our conversation, here are some personalized suggestions. Let me know what resonates with you.
              </p>
            </div>

            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-blue-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{suggestion.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={suggestion.liked ? "default" : "outline"}
                        onClick={() => handleSuggestionLike(suggestion.id)}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-xs">Helpful</span>
                      </Button>
                      <Button
                        size="sm"
                        variant={suggestion.disliked ? "destructive" : "outline"}
                        onClick={() => handleSuggestionDislike(suggestion.id)}
                        className="flex items-center space-x-1"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span className="text-xs">Not for me</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setRightPanelMode('emotions')}
            >
              Update My Emotion
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Panel - Chat */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-800">Breezie</h1>
                <p className="text-xs text-gray-500">Your emotional wellness companion</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {selectedMood && (
              <Badge className={`${
                selectedMood === 'positive' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {selectedMood === 'positive' ? '😊 Positive' : '😔 Seeking Support'}
              </Badge>
            )}
            {selectedEmotion && (
              <Badge className="bg-purple-100 text-purple-800">
                {selectedEmotion}
              </Badge>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gray-200' 
                    : 'bg-gradient-to-br from-blue-400 to-purple-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {!chatStarted ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                Please select your mood to start the conversation 💙
              </p>
            </div>
          ) : (
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  className="min-h-[60px] max-h-[120px] resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  disabled={isTyping}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="h-[60px] px-6 bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Dynamic Content */}
      <div className="w-96 bg-white border-l border-gray-200">
        {renderRightPanel()}
      </div>
    </div>
  )
}