'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEmotionStore } from '@/store/emotion'
import type { EmotionType } from '@/store/emotion'
import { Send, ArrowLeft, MessageCircle, User, Sparkles, History, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { EmotionSelectionDialog } from './EmotionSelectionDialog'
import { calculateBehavioralImpactScore } from '@/lib/behavioralImpactScore'
import { getRandomResponse } from '@/config/emotionResponses'
import { emotionConfig } from '@/config/emotionConfig'
import { getRandomFallback } from '@/config/prompts'
// Removed suggestion imports - simplified flow
import DOMPurify from 'dompurify'

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
  const [aiResponse, setAiResponse] = useState(`Hello! I'm Breezie, your emotional wellness companion.
I'm here to listen and support you through whatever you're experiencing today.
Whether you're feeling happy, stressed, confused, or anything in between, this is a safe space to share.
What would you like to talk about?`)
  const [lastUserMessage, setLastUserMessage] = useState('')
  const [showEmotionSelection, setShowEmotionSelection] = useState(false)
  const [showInlineEmotions, setShowInlineEmotions] = useState(false)
  const [suggestedEmotions, setSuggestedEmotions] = useState<EmotionType[]>([])
  const [hasInitialMessage, setHasInitialMessage] = useState(true)
  const [conversationText, setConversationText] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('Other')
  const [conversationEnded, setConversationEnded] = useState(false)
  const [representativeEmotion, setRepresentativeEmotion] = useState<EmotionType | null>(null)

  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const [showMoreEmotions, setShowMoreEmotions] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  // Simplified state management - removed all suggestion-related states
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
    if (!currentSession) {
      const welcomeMessage = `Hello! I'm Breezie, your emotional wellness companion.
I'm here to listen and support you through whatever you're experiencing today.
Whether you're feeling happy, stressed, confused, or anything in between, this is a safe space to share.
What would you like to talk about?`
      
      startChatSession('Other') // Start with a default emotion
      addMessage(welcomeMessage, 'assistant')
    }
  }, [currentSession, startChatSession, addMessage])

  const handleTypewriterComplete = () => {
    // Typewriter animation completed
  }

  // New simplified conversation flow logic
  const analyzeUserInput = (userMessage: string) => {
    const hasDirectEmotion = detectDirectEmotionStatement(userMessage)
    const hasStoryContext = detectStoryContext(userMessage)
    
    return {
      hasDirectEmotion,
      hasStoryContext,
      detectedEmotion: hasDirectEmotion
    }
  }

  const detectStoryContext = (message: string): boolean => {
    const storyIndicators = [
      'happened', 'today', 'yesterday', 'this morning', 'last night', 'at work', 'at home',
      'my boss', 'my friend', 'my partner', 'my family', 'someone', 'situation', 'problem',
      'issue', 'when I', 'so I', 'then I', 'because', 'since', 'after', 'before',
      'meeting', 'conversation', 'argument', 'fight', 'discussion', 'event', 'experience'
    ]
    
    const lowerMessage = message.toLowerCase()
    return storyIndicators.some(indicator => lowerMessage.includes(indicator))
  }

  // New conversation flow handler
  const handleConversationFlow = async (userMessage: string) => {
    const analysis = analyzeUserInput(userMessage)
    const messages = currentSession?.messages || []
    const userMessages = messages.filter(msg => msg.role === 'user')
    
    // Case 1: User directly states emotion - skip emotion selection
    if (analysis.hasDirectEmotion && analysis.detectedEmotion) {
      setSelectedEmotion(analysis.detectedEmotion)
      
      if (analysis.hasStoryContext) {
        // Has both emotion and story - start conversation about the story
        return await getStoryBasedResponse(userMessage, analysis.detectedEmotion)
      } else {
        // Only emotion mentioned - ask what happened
        return "I can sense you're feeling " + analysis.detectedEmotion.toLowerCase() + ". What happened? I'm here to listen."
      }
    }
    
    // Case 2: User describes emotions without direct statement
    if (userMessages.length === 0 && !analysis.hasDirectEmotion) {
      if (analysis.hasStoryContext) {
        // Has story but no emotion - show emotion selection
        setTimeout(() => {
          const extractedEmotions = extractEmotionsFromText(userMessage)
          setSuggestedEmotions(extractedEmotions)
          setShowInlineEmotions(true)
        }, 1000)
      }
      // Continue with normal conversation
      return await getNormalResponse(userMessage)
    }
    
      // Case 3: Ongoing conversation
  return await getNormalResponse(userMessage)
}

const getStoryBasedResponse = async (userMessage: string, emotion: EmotionType): Promise<string> => {
  try {
    const messages = currentSession?.messages || []
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        emotion,
        responseInstructions: "The user has shared both their emotion and story context. Engage with their specific situation and provide empathetic, thoughtful responses about their experience.",
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
      return data.response
    } else {
      throw new Error('Failed to get response')
    }
  } catch (error) {
    return getRandomFallback('chatError')
  }
}

  // Removed all suggestion-related functions - simplified flow

  // Detect if user directly states their emotion (e.g., "I'm feeling sad", "I'm angry")
  const detectDirectEmotionStatement = (text: string): EmotionType | null => {
    const lowerText = text.toLowerCase()
    
    // Direct emotion statement patterns
    const emotionPatterns: Record<string, EmotionType[]> = {
      // Sadness patterns
      'sad': ['Sadness'],
      'depressed': ['Sadness'],
      'down': ['Sadness'],
      'upset': ['Sadness'],
      'heartbroken': ['Sadness'],
      'miserable': ['Sadness'],
      
      // Anger patterns
      'angry': ['Anger'],
      'mad': ['Anger'],
      'furious': ['Anger'],
      'pissed': ['Anger'],
      'irritated': ['Anger'],
      'annoyed': ['Anger'],
      
      // Anxiety patterns
      'anxious': ['Anxiety'],
      'worried': ['Anxiety'],
      'nervous': ['Anxiety'],
      'stressed': ['Anxiety'],
      'overwhelmed': ['Anxiety'],
      'panicked': ['Anxiety'],
      
      // Fear patterns
      'scared': ['Fear'],
      'afraid': ['Fear'],
      'terrified': ['Fear'],
      'frightened': ['Fear'],
      
      // Joy patterns
      'happy': ['Joy'],
      'joyful': ['Joy'],
      'excited': ['Excitement'],
      'thrilled': ['Excitement'],
      'elated': ['Joy'],
      'cheerful': ['Joy'],
      
      // Love patterns
      'in love': ['Love'],
      'loving': ['Love'],
      
      // Other emotions
      'confused': ['Confusion'],
      'frustrated': ['Frustration'],
      'lonely': ['Loneliness'],
      'proud': ['Pride'],
      'ashamed': ['Shame'],
      'guilty': ['Guilt'],
      'grateful': ['Gratitude'],
      'hopeful': ['Hope'],
      'content': ['Contentment'],
      'bored': ['Boredom'],
      'jealous': ['Envy'],
      'envious': ['Envy'],
      'disgusted': ['Disgust']
    }
    
    // Look for direct statements like "I'm feeling X", "I feel X", "I'm X"
    const directStatementPatterns = [
      /i'?m feeling (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/,
      /i feel (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/,
      /i'?m (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/,
      /feeling (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/,
      /i am (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/,
      /currently (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/,
      /right now i'?m (very |really |so |extremely |quite |pretty )?(.*?)(?:\s|$|\.|\,|\!|\?)/
    ]
    
    for (const pattern of directStatementPatterns) {
      const match = lowerText.match(pattern)
      if (match) {
        const emotionWord = match[2]?.trim()
        if (emotionWord && emotionPatterns[emotionWord]) {
          return emotionPatterns[emotionWord][0] || null
        }
        
        // Check for partial matches
        for (const [keyword, emotions] of Object.entries(emotionPatterns)) {
          if (emotionWord?.includes(keyword) || keyword.includes(emotionWord || '')) {
            return emotions[0] || null
          }
        }
      }
    }
    
    return null
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
      'Anxiety': ['anxious', 'nervous', 'worried', 'stressed', 'tense', 'overwhelmed', 'panic', 'peer pressure', 'pressure from', 'feel pressured', 'forced to', 'have to fit in', 'everyone expects', 'social pressure'],
      'Pride': ['proud', 'accomplished', 'satisfied', 'achievement', 'success', 'pleased with'],
      'Shame': ['ashamed', 'embarrassed', 'guilty', 'humiliated', 'mortified'],
      'Envy': ['jealous', 'envious', 'wish i had', 'want what'],
      'Guilt': ['guilty', 'regretful', 'sorry', 'remorse', 'shouldn\'t have'],
      'Boredom': ['bored', 'tired', 'uninterested', 'dull', 'monotonous', 'nothing to do'],
      'Confusion': ['confused', 'puzzled', 'uncertain', 'don\'t understand', 'unclear', 'don\'t know what to do', 'mixed feelings'],
      'Gratitude': ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate'],
      'Loneliness': ['lonely', 'isolated', 'alone', 'disconnected', 'missing', 'left out', 'don\'t belong'],
      'Frustration': ['frustrated', 'annoyed', 'impatient', 'stuck', 'blocked', 'can\'t handle', 'too much'],
      'Contentment': ['content', 'peaceful', 'satisfied', 'calm', 'serene', 'at ease']
    }

    // Contextual patterns that indicate specific emotions
    const contextualPatterns: Partial<Record<EmotionType, string[]>> = {
      'Anxiety': [
        'peer pressure', 'social pressure', 'pressure from friends', 'pressure from family',
        'everyone is doing', 'have to fit in', 'don\'t want to be left out',
        'what will people think', 'afraid of judgment', 'worried about fitting in'
      ],
      'Frustration': [
        'peer pressure', 'being pushed to', 'forced into', 'don\'t want to but',
        'tired of people telling me', 'sick of expectations'
      ],
      'Confusion': [
        'don\'t know if i should', 'not sure what\'s right', 'mixed about',
        'torn between', 'conflicted about'
      ],
      'Loneliness': [
        'feel left out', 'don\'t fit in', 'everyone else', 'i\'m the only one',
        'nobody understands'
      ]
    }

    const detectedEmotions: EmotionType[] = []
    
    // First pass: Contextual pattern matching (higher priority)
    for (const [emotion, patterns] of Object.entries(contextualPatterns)) {
      if (patterns) {
        for (const pattern of patterns) {
          if (lowerText.includes(pattern)) {
            detectedEmotions.push(emotion as EmotionType)
            break
          }
        }
      }
    }
    
    // Second pass: Direct keyword matching
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords && !detectedEmotions.includes(emotion as EmotionType)) {
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
      
      // Add context-specific emotions with improved peer pressure detection
      if (lowerText.includes('peer pressure') || lowerText.includes('social pressure') || lowerText.includes('pressure from')) {
        contextualEmotions.push('Anxiety', 'Frustration', 'Confusion', 'Loneliness')
      }
      if (lowerText.includes('fit in') || lowerText.includes('left out') || lowerText.includes('don\'t belong')) {
        contextualEmotions.push('Anxiety', 'Loneliness', 'Sadness', 'Confusion')
      }
      if (lowerText.includes('everyone is') || lowerText.includes('everyone else') || lowerText.includes('what will people think')) {
        contextualEmotions.push('Anxiety', 'Fear', 'Confusion')
      }
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

  // Detect emotional engagement level
  const detectEmotionalEngagement = (userMessage: string, userMessages: any[]): 'high' | 'medium' | 'normal' => {
    const messageLength = userMessage.length
    const recentMessages = userMessages.slice(-3) // Look at last 3 messages
    
    // High engagement indicators
    const highEngagementIndicators = [
      // Emotional intensity markers
      'really', 'so', 'very', 'extremely', 'totally', 'completely', 'absolutely',
      // Repetitive expressions
      '!!!', '...', '??', 
      // Emotional outpouring markers
      'just', 'i mean', 'you know', 'like', 'honestly', 'seriously',
      // Urgency markers
      'need to', 'have to', 'can\'t', 'don\'t know what to do'
    ]
    
    const emotionalWords = [
      'feel', 'feeling', 'felt', 'emotion', 'heart', 'soul', 'mind',
      'crying', 'tears', 'upset', 'happy', 'sad', 'angry', 'scared',
      'love', 'hate', 'worried', 'excited', 'nervous', 'overwhelmed'
    ]
    
    const lowerMessage = userMessage.toLowerCase()
    const highEngagementCount = highEngagementIndicators.filter(indicator => lowerMessage.includes(indicator)).length
    const emotionalWordCount = emotionalWords.filter(word => lowerMessage.includes(word)).length
    
    // High engagement criteria
    const isLongMessage = messageLength > 200
    const hasMultipleRecentMessages = recentMessages.length >= 2
    const hasHighEngagementMarkers = highEngagementCount >= 3
    const hasEmotionalContent = emotionalWordCount >= 2
    const hasMultipleSentences = userMessage.split(/[.!?]+/).length > 3
    
    if ((isLongMessage && hasEmotionalContent) || 
        (hasMultipleRecentMessages && hasHighEngagementMarkers) ||
        (hasMultipleSentences && emotionalWordCount >= 3)) {
      return 'high'
    }
    
    if (hasEmotionalContent || hasHighEngagementMarkers || messageLength > 100) {
      return 'medium'
    }
    
    return 'normal'
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    // Sanitize user input to prevent XSS attacks
    const sanitizedMessage = DOMPurify.sanitize(inputValue.trim())
    if (!sanitizedMessage) return // Reject empty or invalid input
    
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
      // Use new simplified conversation flow
      const aiMessage = await handleConversationFlow(userMessage)
      setAiResponse(aiMessage)
      addMessage(aiMessage, 'assistant')
      setConversationText(prev => prev + ' ' + aiMessage)
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
    // Update selected emotion (but don't save to records yet - only save on Complete & Save)
    setSelectedEmotion(emotion)
    
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
    
    // Emotion selected but not saved to records yet - will save on Complete & Save
  }

  const handleInlineEmotionSelect = async (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setShowInlineEmotions(false)
    setShowMoreEmotions(false)
    setIsTyping(true)
    
    // Emotion selected but not saved to records yet - will save on Complete & Save
    
    try {
      // Get personalized AI response based on user's story and selected emotion
      const messages = currentSession?.messages || []
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      // Removed suggestion generation - simplified flow
    }
    
    // Emotion recorded silently in handleInlineEmotionSelect
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
        // No user messages, exit without saving
        handleBackToJourney()
        return
      }

      // Select representative emotion before ending session
      const repEmotion = selectRepresentativeEmotion()
      setRepresentativeEmotion(repEmotion)
      
      // Save emotion record (either selected emotion or representative emotion)
      const emotionToSave = selectedEmotion && selectedEmotion !== 'Other' ? selectedEmotion : repEmotion
      const behavioralScore = calculateBehavioralImpactScore(emotionToSave, 5, conversationText)
      const saved = await saveConversationEmotionRecord(emotionToSave, behavioralScore.overall_score, conversationText)
      
      // Emotion record saved silently - no disruptive notifications
      
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
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
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
                <div className="text-sm text-gray-500">Feeling first, healing follows</div>
              </div>
            </div>
            
            {/* AI Response - Dynamic Height Container with Preset Sizes */}
            <div className="text-gray-800 leading-relaxed text-lg min-h-[200px] max-h-[500px] overflow-y-auto border border-gray-100 rounded-2xl p-4 bg-gray-50/30">
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
                    {/* Show initial welcome message immediately, use typewriter for subsequent messages */}
                    {isFirstMessage ? (
                      <div className="whitespace-pre-line">{aiResponse}</div>
                    ) : (
                      <TypewriterText 
                        text={aiResponse} 
                        onComplete={handleTypewriterComplete}
                      />
                    )}
                  </div>
                  

                  

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

        {/* User Input Area - Hidden when emotions are showing */}
        {!showInlineEmotions && (
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
                  placeholder="Share what's on your mind... I'm here to listen 💙"
                  className="w-full h-40 p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-gray-400 transition-all duration-200"
                  disabled={isTyping}
                  autoFocus
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Online
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowEmotionSelection(true)}
                      variant="outline"
                      className="border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      disabled={isTyping}
                    >
                      <Sparkles className="w-4 h-4" />
                      Choose Emotion
                    </Button>
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
          </div>
        )}



        {/* Removed suggestion interface - simplified flow */}

        {/* Emotion Selection Interface - Show when triggered or when emotions are suggested */}
        {(showInlineEmotions && suggestedEmotions.length > 0) && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-lg">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">How are you feeling?</h3>
                <p className="text-gray-600">Based on what you've shared, I can sense these emotions. Which one feels most true to you right now?</p>
                <p className="text-sm text-gray-500 mt-1">Choose one to help me understand you better</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {suggestedEmotions.map((emotion) => {
                  const config = emotionConfig[emotion]
                  return (
                    <button
                      key={emotion}
                      onClick={() => handleInlineEmotionSelect(emotion)}
                      className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 min-w-[90px]"
                      disabled={isTyping}
                    >
                      <span className="text-3xl mb-2">{config.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{emotion}</span>
                    </button>
                  )
                })}
              </div>

              {/* More Emotions Dropdown */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowMoreEmotions(!showMoreEmotions)}
                  className="w-full flex items-center justify-center gap-2 p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  disabled={isTyping}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {showMoreEmotions ? 'Show less emotions' : 'Don\'t see your emotion? Show more options'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMoreEmotions ? 'rotate-180' : ''}`} />
                </button>

                {showMoreEmotions && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {Object.entries(emotionConfig)
                        .filter(([emotion]) => !suggestedEmotions.includes(emotion as EmotionType))
                        .map(([emotion, config]) => (
                          <button
                            key={emotion}
                            onClick={() => handleInlineEmotionSelect(emotion as EmotionType)}
                            className="flex flex-col items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-white transition-all duration-200"
                            disabled={isTyping}
                          >
                            <span className="text-2xl mb-1">{config.emoji}</span>
                            <span className="text-xs font-medium text-gray-700 text-center">{emotion}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => {
                    setShowInlineEmotions(false)
                    setShowMoreEmotions(false)
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                  disabled={isTyping}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversation History Modal */}
        {currentSession?.messages && currentSession.messages.length > 1 && (
          <div className="flex justify-center">
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200"
                >
                  <History className="w-4 h-4" />
                  <span className="font-medium">
                    Conversation History ({currentSession.messages.length - 1} messages)
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Conversation History
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh] pr-2">
                  <div className="space-y-4">
                    {currentSession.messages.slice(1).map((message, index) => ( // Skip first welcome message
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm px-4 py-3 rounded-2xl ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {message.role === 'user' ? (
                              <User className="w-3 h-3 opacity-80" />
                            ) : (
                              <MessageCircle className="w-3 h-3 opacity-80" />
                            )}
                            <span className="text-xs font-medium opacity-80">
                              {message.role === 'user' ? 'You' : 'Breezie'}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {format(message.timestamp, 'MMM d, HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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