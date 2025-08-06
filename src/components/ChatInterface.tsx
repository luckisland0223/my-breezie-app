'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { Send, ArrowLeft, MessageCircle, User, Sparkles, History, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { EmotionSelectionDialog } from './EmotionSelectionDialog'
import { calculateBehavioralImpactScore } from '@/lib/behavioralImpactScore'
import { getRandomResponse } from '@/config/emotionResponses'
import { emotionConfig } from '@/config/emotionConfig'
import { getRandomFallback } from '@/config/prompts'

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
  const [showConversationHistory, setShowConversationHistory] = useState(false)
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
    
    // Create a concise summary of the conversation
    const topics = userMessages.map(msg => {
      const content = msg.content.toLowerCase()
      // Extract key topics/themes
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

  // Helper function to save conversation emotion record locally
  const saveConversationEmotionRecord = (
    emotion: EmotionType, 
    behavioralImpactScore: number, 
    conversationText: string,
    emotionEvaluation?: any,
    polarityAnalysis?: any
  ) => {
    try {
      // Generate conversation summary for chat records
      const conversationSummary = currentSession?.messages ? generateConversationSummary(currentSession.messages) : undefined
      
      // Save to local store with conversation summary
      addEmotionRecord(emotion, behavioralImpactScore, conversationText, 'chat', emotionEvaluation, polarityAnalysis, undefined, conversationSummary)
      return true
    } catch (error: any) {
            toast.error('Failed to save conversation record')
      return false
    }
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, isTyping, aiResponse])

  // Initialize conversation with welcome message
  useEffect(() => {
    if (!hasInitialMessage && !currentSession) {
      const welcomeMessage = `Hello! I'm Breezie, your emotional wellness companion. I'm here to listen and support you through whatever you're experiencing today. What would you like to talk about?`
      
      startChatSession('Other') // Start with a default emotion
      setAiResponse(welcomeMessage)
      addMessage(welcomeMessage, 'assistant')
      setHasInitialMessage(true)
    }
  }, [hasInitialMessage, currentSession, startChatSession, addMessage])

  const handleTypewriterComplete = () => {
    // Typewriter animation completed
  }

  // Extract potential emotions from user text with improved sentiment analysis
  const extractEmotionsFromText = (text: string): EmotionType[] => {
    const lowerText = text.toLowerCase()
    
    // Enhanced emotion keywords with better coverage
    const emotionKeywords: Partial<Record<EmotionType, string[]>> = {
      'Anger': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'rage', 'annoyed', 'pissed'],
      'Disgust': ['disgusted', 'grossed', 'repulsed', 'sick of', 'revolting', 'disgusting'],
      'Fear': ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'frightened', 'panic', 'dread'],
      'Joy': ['happy', 'joyful', 'excited', 'cheerful', 'glad', 'delighted', 'thrilled', 'amazing', 'wonderful', 'fantastic', 'great', 'awesome', 'love it', 'fun', 'enjoy'],
      'Sadness': ['sad', 'depressed', 'down', 'upset', 'hurt', 'crying', 'tears', 'miserable', 'heartbroken'],
      'Surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected', 'wow', 'incredible'],
      'Love': ['love', 'adore', 'care', 'affection', 'cherish', 'treasure', 'devoted'],
      'Hope': ['hopeful', 'optimistic', 'confident', 'trust', 'believe', 'positive', 'looking forward'],
      'Excitement': ['excited', 'eager', 'thrilled', 'can\'t wait', 'pumped', 'enthusiastic', 'anticipating'],
      'Anxiety': ['anxious', 'nervous', 'worried', 'stressed', 'tense', 'overwhelmed', 'panic'],
      'Pride': ['proud', 'accomplished', 'satisfied', 'achievement', 'success', 'pleased with'],
      'Shame': ['ashamed', 'embarrassed', 'guilty', 'humiliated', 'mortified'],
      'Envy': ['jealous', 'envious', 'wish i had', 'want what'],
      'Guilt': ['guilty', 'regretful', 'sorry', 'remorse', 'shouldn\'t have'],
      'Boredom': ['bored', 'tired', 'uninterested', 'dull', 'monotonous', 'nothing to do'],
      'Confusion': ['confused', 'puzzled', 'uncertain', 'don\'t understand', 'unclear'],
      'Gratitude': ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate'],
      'Loneliness': ['lonely', 'isolated', 'alone', 'disconnected', 'missing'],
      'Frustration': ['frustrated', 'annoyed', 'impatient', 'stuck', 'blocked'],
      'Contentment': ['content', 'peaceful', 'satisfied', 'calm', 'serene', 'at ease']
    }

    const detectedEmotions: EmotionType[] = []
    
    // First pass: Direct keyword matching
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
    
    // Sentiment analysis to determine overall tone
    const positiveIndicators = [
      'happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'awesome', 'love', 'enjoy', 
      'fun', 'good', 'nice', 'perfect', 'brilliant', 'excellent', 'thrilled', 'delighted', 'glad',
      'amusement park', 'vacation', 'party', 'celebration', 'success', 'achievement', 'win'
    ]
    
    const negativeIndicators = [
      'sad', 'angry', 'frustrated', 'worried', 'scared', 'upset', 'hurt', 'disappointed', 'stressed',
      'anxious', 'depressed', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'problem', 'issue'
    ]
    
    const positiveCount = positiveIndicators.filter(indicator => lowerText.includes(indicator)).length
    const negativeCount = negativeIndicators.filter(indicator => lowerText.includes(indicator)).length
    
    // Determine sentiment bias
    const isPositive = positiveCount > negativeCount
    const isNegative = negativeCount > positiveCount
    
    // If we have few emotions detected, add contextually appropriate suggestions
    if (uniqueEmotions.length < 3) {
      const contextualEmotions: EmotionType[] = []
      
      // Add context-specific emotions
      if (lowerText.includes('amusement park') || lowerText.includes('vacation') || lowerText.includes('party')) {
        contextualEmotions.push('Excitement', 'Joy', 'Hope')
      }
      if (lowerText.includes('work') || lowerText.includes('job')) {
        if (isPositive) {
          contextualEmotions.push('Pride', 'Contentment', 'Hope')
        } else {
          contextualEmotions.push('Frustration', 'Anxiety', 'Boredom')
        }
      }
      if (lowerText.includes('family') || lowerText.includes('friend') || lowerText.includes('relationship')) {
        if (isPositive) {
          contextualEmotions.push('Love', 'Gratitude', 'Joy')
        } else {
          contextualEmotions.push('Loneliness', 'Sadness', 'Frustration')
        }
      }
      if (lowerText.includes('future') || lowerText.includes('plan') || lowerText.includes('tomorrow')) {
        if (isPositive) {
          contextualEmotions.push('Hope', 'Excitement', 'Joy')
        } else {
          contextualEmotions.push('Anxiety', 'Fear', 'Confusion')
        }
      }
      
      // Add sentiment-based fallback emotions
      if (isPositive && contextualEmotions.length === 0) {
        contextualEmotions.push('Joy', 'Hope', 'Excitement', 'Contentment', 'Gratitude')
      } else if (isNegative && contextualEmotions.length === 0) {
        contextualEmotions.push('Sadness', 'Anxiety', 'Frustration', 'Confusion')
      } else if (contextualEmotions.length === 0) {
        // Neutral sentiment - suggest balanced emotions
        contextualEmotions.push('Contentment', 'Hope', 'Confusion', 'Gratitude')
      }
      
      // Filter out emotions already detected and combine
      const additionalEmotions = contextualEmotions.filter(emotion => !uniqueEmotions.includes(emotion))
      const allSuggestions = [...uniqueEmotions, ...additionalEmotions].slice(0, 5)
      
      // Ensure we have at least 3 suggestions
      if (allSuggestions.length < 3) {
        const neutralEmotions: EmotionType[] = ['Hope', 'Contentment', 'Gratitude', 'Confusion']
        const remaining = neutralEmotions.filter(emotion => !allSuggestions.includes(emotion))
        allSuggestions.push(...remaining.slice(0, 3 - allSuggestions.length))
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
    addMessage(userMessage, 'user')
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
        credentials: 'include',
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
        addMessage(aiMessage, 'assistant')
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
      toast.error('Sorry, I had trouble responding. Please try again.')
      const fallbackResponse = getRandomFallback('chatError')
      setAiResponse(fallbackResponse)
      addMessage(fallbackResponse, 'assistant')
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

  const handleEmotionSelect = async (emotion: EmotionType, intensity: number) => {
    // Update selected emotion
    setSelectedEmotion(emotion)
    
    // Calculate behavioral impact score
    const behavioralScore = calculateBehavioralImpactScore(emotion, intensity, conversationText)
    
    // Save locally
    const saved = saveConversationEmotionRecord(emotion, behavioralScore.overall_score, conversationText)
    
    // Get emotion-specific response
    const emotionResponse = getRandomResponse(emotion)
    setAiResponse(emotionResponse)
    addMessage(emotionResponse, 'assistant')
    
    // Update session emotion
    if (currentSession) {
      // Note: You might want to add a method to update session emotion
      // For now, we'll just continue with the conversation
    }
    
    setShowEmotionSelection(false)
    
    if (saved) {
      toast.success(`${emotion} emotion recorded successfully! Impact score: ${behavioralScore.overall_score}/10`, {
        duration: 4000
      })
    } else {
      toast.warning(`${emotion} emotion saved locally (database sync failed)`, {
        duration: 5000,
        action: {
          label: 'Retry',
          onClick: () => {
            // Can add retry logic here
          }
        }
      })
    }
  }

  const handleInlineEmotionSelect = async (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setShowInlineEmotions(false)
    setIsTyping(true)
    
    // Calculate behavioral impact score
    const behavioralScore = calculateBehavioralImpactScore(emotion, 5, conversationText)
    
    // Save locally
    const saved = saveConversationEmotionRecord(emotion, behavioralScore.overall_score, conversationText)
    
    if (saved) {
      toast.success(`${emotion} emotion recorded successfully!`, {
        duration: 3000
      })
    } else {
      toast.warning(`${emotion} emotion saved locally (database sync failed)`, {
        duration: 4000
      })
    }
    
    try {
      // Get personalized AI response based on user's story and selected emotion
      const messages = currentSession?.messages || []
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userMessage: `Now that the user has selected "${emotion}" as their main emotion, provide a follow-up response that goes deeper into this feeling. Don't repeat what you already said, but offer new support, ask different questions, or explore this emotion from a fresh angle. Build on the conversation naturally.`,
          emotion: emotion,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        const personalizedResponse = data.response
        const newResponse = aiResponse + "\n\n" + personalizedResponse
        setAiResponse(newResponse)
        addMessage(personalizedResponse, 'assistant')
      } else {
        throw new Error('Failed to get personalized response')
      }
    } catch (error) {
      
      // Use configured fallback response
      const fallbackResponse = getRandomFallback('emotionSelectionError')
      const newResponse = aiResponse + "\n\n" + fallbackResponse
      setAiResponse(newResponse)
      addMessage(fallbackResponse, 'assistant')
    } finally {
      setIsTyping(false)
    }
    
    toast.success(`Emotion recorded: ${emotion}`)
  }

  const handleSkipEmotion = () => {
    setShowEmotionSelection(false)
    const skipResponse = "No worries at all! What else is going on with you?"
    setAiResponse(skipResponse)
    addMessage(skipResponse, 'assistant')
    toast.success("Emotion selection skipped")
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

      // Simple exit, don't save any records
  const handleBackToJourney = () => {
    if (currentSession) {
      endChatSession()
    }
    onBack()
  }

      // Complete and save conversation record
  const handleCompleteSession = async () => {
    if (currentSession) {
      // Check if there's actual conversation content
      const userMessages = currentSession.messages?.filter(msg => msg.role === 'user') || []
      
      if (userMessages.length === 0) {
        // No user messages, show notification without saving
        toast.info('No conversation to save')
        handleBackToJourney()
        return
      }

      // Select representative emotion before ending session
      const repEmotion = selectRepresentativeEmotion()
      setRepresentativeEmotion(repEmotion)
      
      // If no emotion was selected during conversation, create a record with representative emotion
      if (!selectedEmotion || selectedEmotion === 'Other') {
        const behavioralScore = calculateBehavioralImpactScore(repEmotion, 5, conversationText)
        const saved = await saveConversationEmotionRecord(repEmotion, behavioralScore.overall_score, conversationText)
        
        if (saved) {
          toast.success(`Conversation saved with representative emotion: ${repEmotion}`)
        } else {
          toast.success(`Conversation saved locally with emotion: ${repEmotion} (Cloud sync failed)`)
        }
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
            {/* Left: Back button */}
            <Button 
              variant="ghost" 
              onClick={handleBackToJourney}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journey
            </Button>
            
            {/* Center: Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Chat with Breezie</span>
            </div>
            
            {/* Right: Complete & Save button (only show if there's conversation content) */}
            <div className="w-32 flex justify-end">
              {currentSession?.messages && currentSession.messages.filter(msg => msg.role === 'user').length > 0 ? (
                <Button 
                  onClick={handleCompleteSession}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                  size="sm"
                >
                  Complete & Save
                </Button>
              ) : (
                <div className="w-4">{/* Placeholder for balance */}</div>
              )}
            </div>
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
            
            {/* AI Response - Dynamic Height Container */}
            <div className="text-gray-800 leading-relaxed text-lg border border-gray-100 rounded-2xl p-4 bg-gray-50/30">
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
                        <p className="text-gray-700 font-medium mb-2">Based on what you've shared, I can sense these emotions. Which one feels most true to you right now?</p>
                        <p className="text-sm text-gray-600">Choose one to help me understand you better</p>
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
                          Maybe later
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
                className="w-full h-40 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-gray-400 transition-all duration-200"
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

        {/* Conversation History Button */}
        {currentSession?.messages && currentSession.messages.length > 1 && (
          <div className="space-y-4">
            {/* Toggle Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200"
              >
                <History className="w-4 h-4" />
                <span className="font-medium">
                  Conversation History ({currentSession.messages.length - 1} messages)
                </span>
                {showConversationHistory ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Collapsible History */}
            {showConversationHistory && (
              <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg animate-in slide-in-from-top-2 duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
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
        )}
      </div>

      {/* Emotion Selection Dialog */}
      {showEmotionSelection && (
        <EmotionSelectionDialog
          onEmotionSelect={handleEmotionSelect}
          onSkip={handleSkipEmotion}
        />
      )}
    </div>
  )
}