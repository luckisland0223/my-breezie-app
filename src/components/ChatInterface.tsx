'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getRandomFallback } from '@/config/prompts'
import { type BehavioralImpactScore, calculateBehavioralImpactScore } from '@/lib/behavioralImpactScore'
import { getAuthHeaders } from '@/store/auth'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { format } from 'date-fns'
import { ArrowLeft, ChevronDown, ChevronUp, History, MessageCircle, Plus, Send, Sparkles, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

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

// Chat Bubble Component - Modern chat app style
function ChatBubble({ 
  message, 
  isUser, 
  timestamp, 
  showAvatar = true 
}: { 
  message: string
  isUser: boolean
  timestamp: Date
  showAvatar?: boolean
}) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
      <div className={`flex max-w-[75%] items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for AI messages */}
        {!isUser && showAvatar && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 shadow-sm">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={`relative max-w-full rounded-2xl px-4 py-2.5 ${
          isUser 
            ? "rounded-br-md bg-blue-500 text-white" 
            : "rounded-bl-md border border-gray-200 bg-gray-100 text-gray-800"
        }`}>
          {/* Message Content */}
          <div className="whitespace-pre-line break-words text-sm leading-relaxed">
            {message}
          </div>
          
          {/* Timestamp */}
          <div className={`mt-1.5 text-xs ${
            isUser ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {format(timestamp, 'HH:mm')}
          </div>
          
          {/* Bubble Tail */}
          <div className={`absolute bottom-0 ${
            isUser 
              ? "right-0 translate-x-full transform" 
              : "-translate-x-full left-0 transform"
          }`}>
            <div className={`h-3 w-3 ${
              isUser 
                ? 'bg-blue-500' 
                : "border-gray-200 border-b border-l bg-gray-100"
            }`} style={{
              clipPath: isUser 
                ? 'polygon(0 0, 100% 0, 0 100%)' 
                : 'polygon(100% 0, 0 0, 100% 100%)'
            }} />
          </div>
        </div>
        
        {/* User Avatar - only show for user messages */}
        {isUser && showAvatar && (
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

// Emotion Selection Modal
function EmotionSelectionModal({ 
  isOpen, 
  onClose, 
  onEmotionSelect, 
  title = "How are you feeling?",
  subtitle = "Select the emotion that best describes your current state"
}: {
  isOpen: boolean
  onClose: () => void
  onEmotionSelect: (emotion: EmotionType) => void
  title?: string
  subtitle?: string
}) {
  const emotions: EmotionType[] = [
    'Joy', 'Love', 'Pride', 'Hope', 'Excitement', 'Gratitude', 'Contentment',
    'Sadness', 'Anger', 'Fear', 'Anxiety', 'Shame', 'Guilt', 'Envy',
    'Surprise', 'Disgust', 'Boredom', 'Confusion', 'Loneliness', 'Frustration', 'Other'
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center font-semibold text-xl">{title}</DialogTitle>
          <p className="text-center text-gray-600">{subtitle}</p>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-3 gap-3">
            {emotions.map((emotion) => (
              <Button
                key={emotion}
                variant="outline"
                onClick={() => {
                  onEmotionSelect(emotion)
                  onClose()
                }}
                className="flex h-16 flex-col items-center justify-center gap-2 p-3 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="text-2xl">{getEmotionEmoji(emotion)}</div>
                <span className="font-medium text-xs">{emotion}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to get emotion emoji
function getEmotionEmoji(emotion: EmotionType): string {
  const emojiMap: Record<EmotionType, string> = {
    'Joy': '😊',
    'Love': '🥰',
    'Pride': '😌',
    'Hope': '🤗',
    'Excitement': '🤩',
    'Gratitude': '🙏',
    'Contentment': '😌',
    'Sadness': '😢',
    'Anger': '😠',
    'Fear': '😨',
    'Anxiety': '😰',
    'Shame': '😳',
    'Guilt': '😞',
    'Envy': '😒',
    'Surprise': '😲',
    'Disgust': '🤢',
    'Boredom': '😐',
    'Confusion': '😕',
    'Loneliness': '🥺',
    'Frustration': '😤',
    'Other': '🤔'
  }
  return emojiMap[emotion] || '🤔'
}

export function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [aiResponse, setAiResponse] = useState('')
  const [lastUserMessage, setLastUserMessage] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('Other')
  const [conversationEnded, setConversationEnded] = useState(false)
  const [representativeEmotion, setRepresentativeEmotion] = useState<EmotionType | null>(null)
  const [scoreDetails, setScoreDetails] = useState<BehavioralImpactScore | null>(null)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [showEmotionModal, setShowEmotionModal] = useState(false)
  const [emotionModalConfig, setEmotionModalConfig] = useState<{
    title: string
    subtitle: string
    onSelect: (emotion: EmotionType) => void
  } | null>(null)

  const [isFirstMessage, setIsFirstMessage] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [conversationText, setConversationText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentSession = useEmotionStore((state) => state.currentSession)
  const startChatSession = useEmotionStore((state) => state.startChatSession)
  const addMessage = useEmotionStore((state) => state.addMessage)
  const endChatSession = useEmotionStore((state) => state.endChatSession)
  const addEmotionRecord = useEmotionStore((state) => state.addEmotionRecord)

  // Helper function to generate conversation summary
  const generateConversationSummary = (messages: any[]) => {
    const userMessages = messages.filter(msg => msg.role === 'user')
    if (userMessages.length === 0) return 'No conversation content'
    
    const topics = userMessages.map(msg => {
      const content = msg.content.toLowerCase()
      if (content.includes('work') || content.includes('job')) return 'work'
      if (content.includes('family') || content.includes('relationship')) return 'relationships'
      if (content.includes('health') || content.includes('sick')) return 'health'
      if (content.includes('school') || content.includes('study')) return 'education'
      if (content.includes('money') || content.includes('financial')) return 'finances'
      if (content.includes('future') || content.includes('plan')) return 'future planning'
      return 'personal thoughts'
    })
    
    const uniqueTopics = [...new Set(topics)]
    const firstMessage = userMessages[0].content.substring(0, 100) + (userMessages[0].content.length > 100 ? '...' : '')
    
    return `Discussed: ${uniqueTopics.join(', ')}. Started with: "${firstMessage}"`
  }

  // Helper function to save conversation emotion record
  const saveConversationEmotionRecord = async (
    emotion: EmotionType, 
    behavioralImpact: number, 
    note: string
  ) => {
    try {
      await addEmotionRecord(emotion, behavioralImpact, note, 'chat')
      return true
    } catch (error) {
      console.error('Failed to save emotion record:', error)
      return false
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.messages, aiResponse])

  // Start chat session on mount
  useEffect(() => {
    if (!currentSession) {
      startChatSession('Other')
    }
  }, [currentSession, startChatSession])

  // Handle typewriter completion
  const handleTypewriterComplete = () => {
    setIsTyping(false)
  }

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Enhanced conversation flow handler with comfort detection
  const handleConversationFlow = async (userMessage: string) => {
    const analysis = analyzeUserInput(userMessage)
    const messages = currentSession?.messages || []
    const userMessages = messages.filter(msg => msg.role === 'user')
    
    // Case 1: User specifically asks for comfort only
    if (analysis.needsComfortOnly) {
      return await getComfortOnlyResponse(userMessage)
    }
    
    // Case 2: User directly states emotion - skip emotion selection
    if (analysis.hasDirectEmotion && analysis.detectedEmotion) {
      setSelectedEmotion(analysis.detectedEmotion)
      
      if (analysis.hasStoryContext) {
        return await getStoryBasedResponse(userMessage, analysis.detectedEmotion, analysis.needsComfortOnly)
      } else {
        return "I can sense you're feeling " + analysis.detectedEmotion.toLowerCase() + ". What happened? I'm here to listen."
      }
    }
    
    // Case 3: User describes emotions without direct statement
    if (userMessages.length === 0 && !analysis.hasDirectEmotion) {
      if (analysis.hasStoryContext) {
        const response = await getNormalResponse(userMessage)
        if (isAskingAboutFeelings(response)) {
          // Show emotion selection modal
          setEmotionModalConfig({
            title: "How are you feeling?",
            subtitle: "I'd like to understand your emotional state better. Please select the emotion that best describes how you're feeling right now.",
            onSelect: (emotion: EmotionType) => {
              setSelectedEmotion(emotion)
              // Continue conversation with selected emotion
              handleEmotionSelected(emotion, userMessage)
            }
          })
          setShowEmotionModal(true)
        }
        return response
      }
      return await getNormalResponse(userMessage)
    }
    
    // Case 4: Ongoing conversation
    return await getNormalResponse(userMessage)
  }

  // Handle emotion selection from modal
  const handleEmotionSelected = async (emotion: EmotionType, userMessage: string) => {
    setSelectedEmotion(emotion)
    // Continue conversation with the selected emotion
    const response = await getStoryBasedResponse(userMessage, emotion, false)
    // Update AI response
    setAiResponse(response)
    setIsTyping(false)
  }

  // Show emotion selection modal
  const showEmotionSelection = (title: string, subtitle: string, onSelect: (emotion: EmotionType) => void) => {
    setEmotionModalConfig({ title, subtitle, onSelect })
    setShowEmotionModal(true)
  }

  // Check if AI is asking about feelings
  const isAskingAboutFeelings = (response: string): boolean => {
    const feelingKeywords = ['feeling', 'emotion', 'mood', 'how are you', 'what\'s wrong', 'upset', 'sad', 'angry', 'worried']
    return feelingKeywords.some(keyword => response.toLowerCase().includes(keyword))
  }

  // Analyze user input for emotion and context
  const analyzeUserInput = (input: string) => {
    const lowerInput = input.toLowerCase()
    const emotions: EmotionType[] = ['Joy', 'Sadness', 'Anger', 'Fear', 'Anxiety', 'Love', 'Pride', 'Shame', 'Guilt', 'Envy', 'Hope', 'Excitement', 'Boredom', 'Confusion', 'Gratitude', 'Loneliness', 'Frustration', 'Contentment', 'Surprise', 'Disgust']
    
    const detectedEmotion = emotions.find(emotion => lowerInput.includes(emotion.toLowerCase()))
    const hasStoryContext = lowerInput.length > 20 || lowerInput.includes('because') || lowerInput.includes('when') || lowerInput.includes('happened')
    const needsComfortOnly = lowerInput.includes('comfort') || lowerInput.includes('support') || lowerInput.includes('listen')
    
    return {
      hasDirectEmotion: !!detectedEmotion,
      detectedEmotion: detectedEmotion as EmotionType,
      hasStoryContext,
      needsComfortOnly
    }
  }

  const getStoryBasedResponse = async (userMessage: string, emotion: EmotionType, needsComfortOnly?: boolean): Promise<string> => {
    try {
      const messages = currentSession?.messages || []
      const instructions = needsComfortOnly 
        ? "User shared their story but needs comfort only - no advice. Focus on deep emotional validation and support."
        : "The user has shared both their emotion and story context. Prioritize emotional validation first, then engage thoughtfully with their situation."
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userMessage,
          emotion,
          engagementLevel: detectEmotionalEngagement(userMessage, messages.filter(m => m.role === 'user')),
          responseInstructions: instructions,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      return getRandomFallback('chatError')
    }
  }

  const getNormalResponse = async (userMessage: string): Promise<string> => {
    try {
      const messages = currentSession?.messages || []
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userMessage,
          emotion: selectedEmotion || 'Other',
          engagementLevel: detectEmotionalEngagement(userMessage, messages.filter(m => m.role === 'user')),
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      return getRandomFallback('chatError')
    }
  }

  // Detect emotional engagement level
  const detectEmotionalEngagement = (userMessage: string, userMessages: any[]): 'high' | 'medium' | 'normal' => {
    const messageLength = userMessage.length
    const wordCount = userMessage.split(/\s+/).length
    const sentenceCount = userMessage.split(/[.!?]+/).filter(Boolean).length
    
    const isLongMessage = messageLength > 100
    const isVeryLongMessage = messageLength > 300
    const hasEmotionalContent = /(feel|emotion|upset|happy|sad|angry|worried|excited|scared)/i.test(userMessage)
    const hasHighEngagementMarkers = /(really|very|extremely|so much|deeply|truly)/i.test(userMessage)
    const hasMultipleRecentMessages = userMessages.length >= 3
    const emotionalWordCount = (userMessage.match(/(feel|emotion|upset|happy|sad|angry|worried|excited|scared|love|hate|fear|joy|sadness|anger|anxiety|hope|pride|shame|guilt|envy|gratitude|loneliness|frustration|contentment|surprise|disgust|boredom|confusion)/gi) || []).length
    
    const hasMultipleSentences = sentenceCount > 3
    const hasDetailedContent = sentenceCount > 5 || wordCount > 40
    
    if (isVeryLongMessage || hasDetailedContent || 
        (isLongMessage && hasEmotionalContent) || 
        (hasMultipleRecentMessages && hasHighEngagementMarkers) ||
        (hasMultipleSentences && emotionalWordCount >= 3)) {
      return 'high'
    }
    
    if (hasEmotionalContent || hasHighEngagementMarkers || isLongMessage || wordCount > 15) {
      return 'medium'
    }
    
    return 'normal'
  }

  const getComfortOnlyResponse = async (userMessage: string): Promise<string> => {
    try {
      const messages = currentSession?.messages || []
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userMessage,
          emotion: selectedEmotion || 'Other',
          engagementLevel: 'high',
          responseInstructions: "User specifically requested comfort and support only. Focus entirely on emotional validation, empathy, and comfort. Do not provide advice, suggestions, or problem-solving. Just be there emotionally.",
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      return getRandomFallback('chatError')
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    const sanitizedMessage = inputValue.trim()
    if (!sanitizedMessage) return
    
    const userMessage = sanitizedMessage
    setInputValue('')
    setLastUserMessage(userMessage)
    setIsTyping(true)
    setAiResponse('')
    setIsFirstMessage(false)

    // Add user message to chat
    addMessage(userMessage, 'user')
    setConversationText(prev => prev + ' ' + userMessage)

    try {
      const aiMessage = await handleConversationFlow(userMessage)
      setAiResponse(aiMessage)
      addMessage(aiMessage, 'assistant')
    } catch (error) {
      console.error('Chat error:', error)
      const fallbackMessage = getRandomFallback('chatError')
      setAiResponse(fallbackMessage)
      addMessage(fallbackMessage, 'assistant')
    } finally {
      setIsTyping(false)
    }
  }

  const handleBackToJourney = () => {
    if (currentSession?.messages && currentSession.messages.filter(msg => msg.role === 'user').length > 0) {
      // Show confirmation dialog
      if (confirm('You have unsaved conversation. Are you sure you want to leave?')) {
        onBack()
      }
    } else {
      onBack()
    }
  }

  const handleCompleteSession = async () => {
    if (!currentSession?.messages) return

    const userMessages = currentSession.messages.filter(msg => msg.role === 'user')
    if (userMessages.length === 0) return

    // Calculate behavioral impact score
    const behavioralScore = calculateBehavioralImpactScore(
      selectedEmotion || 'Other',
      5, // Default intensity
      userMessages.map(msg => msg.content).join(' ')
    )

    // Determine which emotion to save
    let emotionToSave: EmotionType = 'Other'
    if (representativeEmotion && representativeEmotion !== 'Other') {
      emotionToSave = representativeEmotion
    } else if (selectedEmotion && selectedEmotion !== 'Other') {
      emotionToSave = selectedEmotion
    } else {
      // Try to detect emotion from conversation
      const repEmotion = detectRepresentativeEmotion(userMessages.map(msg => msg.content))
      if (repEmotion && repEmotion !== 'Other') {
        emotionToSave = repEmotion
      }
    }

    try {
      const { useAuthStore } = await import('@/store/auth')
      const token = useAuthStore.getState().token
      if (!token) {
        const payload = {
          emotion: emotionToSave,
          behavioralImpact: behavioralScore.overall_score,
          note: conversationText,
          recordType: 'chat',
          conversationSummary: currentSession?.messages ? generateConversationSummary(currentSession.messages) : undefined,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending-emotion', JSON.stringify(payload))
          window.location.href = '/login'
          return
        }
      }
    } catch {}

    const saved = await saveConversationEmotionRecord(emotionToSave, behavioralScore.overall_score, conversationText)
    setScoreDetails(behavioralScore)
    setShowScoreDialog(true)
    
    endChatSession()
    onBack()
  }

  // Detect representative emotion from conversation
  const detectRepresentativeEmotion = (messages: string[]): EmotionType => {
    const emotionKeywords: Record<EmotionType, string[]> = {
      'Joy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic'],
      'Sadness': ['sad', 'unhappy', 'depressed', 'down', 'miserable', 'hopeless'],
      'Anger': ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated'],
      'Fear': ['scared', 'afraid', 'terrified', 'worried', 'anxious', 'nervous'],
      'Anxiety': ['anxious', 'worried', 'nervous', 'stressed', 'tense'],
      'Love': ['love', 'loving', 'caring', 'affectionate', 'warm'],
      'Pride': ['proud', 'accomplished', 'achievement', 'success'],
      'Shame': ['ashamed', 'embarrassed', 'guilty', 'regret'],
      'Guilt': ['guilty', 'remorseful', 'regretful', 'ashamed'],
      'Envy': ['envious', 'jealous', 'covetous', 'resentful'],
      'Hope': ['hope', 'hopeful', 'optimistic', 'positive', 'future'],
      'Excitement': ['excited', 'thrilled', 'enthusiastic', 'eager'],
      'Boredom': ['bored', 'uninterested', 'apathetic', 'dull'],
      'Confusion': ['confused', 'puzzled', 'uncertain', 'unsure'],
      'Gratitude': ['grateful', 'thankful', 'appreciative', 'blessed'],
      'Loneliness': ['lonely', 'isolated', 'alone', 'solitary'],
      'Frustration': ['frustrated', 'annoyed', 'irritated', 'exasperated'],
      'Contentment': ['content', 'satisfied', 'fulfilled', 'peaceful'],
      'Surprise': ['surprised', 'shocked', 'amazed', 'astonished'],
      'Disgust': ['disgusted', 'repulsed', 'revolted', 'appalled'],
      'Other': []
    }

    const text = messages.join(' ').toLowerCase()
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return emotion as EmotionType
      }
    }
    return 'Other'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-white/20 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToJourney}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Journey
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Chat with Breezie</span>
            </div>
            
            <div className="flex w-32 justify-end">
              {currentSession?.messages && currentSession.messages.filter(msg => msg.role === 'user').length > 0 ? (
                <Button 
                  onClick={handleCompleteSession}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800"
                  size="sm"
                >
                  Complete & Save
                </Button>
              ) : (
                <div className="w-4" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Chat Messages Area */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
          <div className="p-6">
            <div className="mb-6 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-800 text-lg">Breezie</span>
                <div className="text-gray-500 text-sm">Your AI companion for emotional support</div>
              </div>
            </div>
            
            {/* Messages Container */}
            <div className="max-h-[600px] min-h-[400px] overflow-y-auto">
              {currentSession?.messages && currentSession.messages.length > 0 ? (
                <div className="py-4">
                  {currentSession.messages.map((message, index) => {
                    const prevMessage = index > 0 ? currentSession.messages[index - 1] : null;
                    const nextMessage = index < currentSession.messages.length - 1 ? currentSession.messages[index + 1] : null;
                    
                    // Show avatar for first message, or when role changes
                    const showAvatar = index === 0 || message.role !== prevMessage?.role;
                    
                    // Add spacing between different users
                    const addSpacing = nextMessage && message.role !== nextMessage.role;
                    
                    return (
                      <div key={index}>
                        <ChatBubble
                          message={message.content}
                          isUser={message.role === 'user'}
                          timestamp={message.timestamp}
                          showAvatar={showAvatar}
                        />
                        {addSpacing && <div className="h-4" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="text-lg">Ready to start our conversation...</p>
                  <p className="mt-2 text-sm">I'm here to listen and support you</p>
                </div>
              )}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="mb-3 flex justify-start px-4">
                  <div className="flex items-end gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600 shadow-sm">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="relative rounded-2xl rounded-bl-md border border-gray-200 bg-gray-100 px-4 py-2.5">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.1s' }} />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-gray-500 text-sm">Breezie is typing...</span>
                      </div>
                      
                      {/* Bubble Tail */}
                      <div className="-translate-x-full absolute bottom-0 left-0 transform">
                        <div className="h-3 w-3 border-gray-200 border-b border-l bg-gray-100" style={{
                          clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* User Input Area */}
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="p-4 sm:p-6">
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-800">You</span>
                <div className="text-gray-400 text-xs">Share your thoughts and feelings</div>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                Online
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="max-h-[200px] min-h-[60px] w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 pr-16 text-base placeholder-gray-400 shadow-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isTyping}
              />
              <div className="absolute right-3 bottom-3">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  className="h-10 w-10 rounded-full border-0 bg-gradient-to-r from-blue-500 to-blue-600 p-0 text-white shadow-sm transition-all duration-200 hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 text-center text-gray-400 text-xs sm:text-left">
              Press Enter to send, Shift + Enter for new line
            </div>
          </div>
        </div>

        {/* Conversation History Button */}
        {currentSession?.messages && currentSession.messages.length > 1 && (
          <div className="mt-6 flex justify-center">
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-gray-300 hover:bg-white"
                >
                  <History className="h-4 w-4" />
                  <span className="font-medium">
                    View Conversation History ({currentSession.messages.length - 1} messages)
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-2xl overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Conversation History
                  </DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  <div className="py-4">
                    {currentSession.messages.slice(1).map((message, index) => {
                      const prevMessage = index > 0 ? currentSession.messages.slice(1)[index - 1] : null;
                      const nextMessage = index < currentSession.messages.slice(1).length - 1 ? currentSession.messages.slice(1)[index + 1] : null;
                      
                      // Show avatar for first message, or when role changes
                      const showAvatar = index === 0 || message.role !== prevMessage?.role;
                      
                      // Add spacing between different users
                      const addSpacing = nextMessage && message.role !== nextMessage.role;
                      
                      return (
                        <div key={index}>
                          <ChatBubble
                            message={message.content}
                            isUser={message.role === 'user'}
                            timestamp={message.timestamp}
                            showAvatar={showAvatar}
                          />
                          {addSpacing && <div className="h-4" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Emotion Selection Modal */}
      {emotionModalConfig && (
        <EmotionSelectionModal
          isOpen={showEmotionModal}
          onClose={() => setShowEmotionModal(false)}
          onEmotionSelect={emotionModalConfig.onSelect}
          title={emotionModalConfig.title}
          subtitle={emotionModalConfig.subtitle}
        />
      )}

      {/* Score Details Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Behavioral Impact Analysis</DialogTitle>
          </DialogHeader>
          {scoreDetails && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border p-4">
                <div className="text-gray-700">Overall Score</div>
                <div className="font-bold text-2xl">{scoreDetails.overall_score}/10 <span className="font-medium text-base text-gray-500">({scoreDetails.risk_level})</span></div>
                <div className="mt-1 text-gray-600">Action tendency: {scoreDetails.action_tendency}</div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="mb-1 font-medium">Emotional Intensity</div>
                  <div>Intensity: {scoreDetails.intensity.intensity}/10</div>
                  <div>Level: {scoreDetails.intensity.level}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="mb-1 font-medium">Emotional Focus</div>
                  <div>Type: {scoreDetails.focus.type}</div>
                  <div>Score: {scoreDetails.focus.score}/10</div>
                  <div className="mt-1 text-gray-600">{scoreDetails.focus.description}</div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 font-medium">Cognitive Appraisal</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Controllability: {scoreDetails.appraisal.controllability}/10</div>
                  <div>Threat vs Challenge: {scoreDetails.appraisal.threat_vs_challenge}/10</div>
                  <div>Coping Potential: {scoreDetails.appraisal.coping_potential}/10</div>
                  <div>Goal Relevance: {scoreDetails.appraisal.goal_relevance}/10</div>
                </div>
              </div>
              {scoreDetails.recommendations.length > 0 && (
                <div className="rounded-lg border p-4">
                  <div className="mb-2 font-medium">Recommendations</div>
                  <ul className="list-disc space-y-1 pl-5 text-gray-700">
                    {scoreDetails.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}