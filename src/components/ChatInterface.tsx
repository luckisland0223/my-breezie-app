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
import { calculateBehavioralImpactScore, type BehavioralImpactScore } from '@/lib/behavioralImpactScore'
import { getRandomFallback } from '@/config/prompts'
import { getAuthHeaders } from '@/store/auth'
// Removed suggestion imports - simplified flow


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
  const [showInlineEmotions, setShowInlineEmotions] = useState(false)
  const [conversationText, setConversationText] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('Other')
  const [conversationEnded, setConversationEnded] = useState(false)
  const [representativeEmotion, setRepresentativeEmotion] = useState<EmotionType | null>(null)
  const [scoreDetails, setScoreDetails] = useState<BehavioralImpactScore | null>(null)
  const [showScoreDialog, setShowScoreDialog] = useState(false)

  const [isFirstMessage, setIsFirstMessage] = useState(false)
  const [showMoreEmotions, setShowMoreEmotions] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showInlineEmotionButtons, setShowInlineEmotionButtons] = useState(false)
  const [selectedInlineEmotion, setSelectedInlineEmotion] = useState<EmotionType | null>(null)
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

  // Helper function to save conversation emotion record
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
      
      // If not logged in, stash payload and redirect to auth when user presses Complete & Save elsewhere
      // Otherwise, store will call API and persist remotely
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

  // Initialize session with welcoming message
  useEffect(() => {
    if (!currentSession) {
      startChatSession('Other')
      // Add a welcoming message from Breezie after a short delay
      setTimeout(async () => {
        try {
          const welcomeMessage = await handleWelcomeMessage()
          if (welcomeMessage) {
            setAiResponse(welcomeMessage)
            addMessage(welcomeMessage, 'assistant')
          }
        } catch (error) {
          // If welcome message fails, use a simple fallback
          const fallbackWelcome = "Hello! I'm Breezie, so nice to meet you 😊 How has your day been going? Is there anything you'd like to share with me?"
          setAiResponse(fallbackWelcome)
          addMessage(fallbackWelcome, 'assistant')
        }
      }, 500)
    }
  }, [currentSession, startChatSession])

  const handleTypewriterComplete = () => {
    // Typewriter animation completed
  }

  // Generate welcoming message from Breezie
  const handleWelcomeMessage = async (): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          userMessage: "User just entered the chat, this is the first conversation",
          emotion: 'Other',
          engagementLevel: 'normal',
          conversationHistory: [],
          responseInstructions: "This is the user's first time entering the chat. Please warmly and enthusiastically welcome the user, ask how their day has been, what happened today. Be warm and caring, let the user feel genuine care."
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.response
      } else {
        throw new Error('Failed to get welcome message')
      }
    } catch (error) {
      // Return fallback welcome message
      return "Hello! I'm Breezie, so nice to meet you 😊 How has your day been going? Is there anything you'd like to share with me? Whether it's something happy or troubling, I'm here to listen 💙"
    }
  }

  // Enhanced conversation flow logic with comfort detection
  const analyzeUserInput = (userMessage: string) => {
    const hasDirectEmotion = detectDirectEmotionStatement(userMessage)
    const hasStoryContext = detectStoryContext(userMessage)
    const needsComfortOnly = detectComfortRequest(userMessage)
    
    return {
      hasDirectEmotion,
      hasStoryContext,
      detectedEmotion: hasDirectEmotion,
      needsComfortOnly
    }
  }

  // Detect when user specifically asks for comfort/emotional support only
  const detectComfortRequest = (message: string): boolean => {
    const lowerMessage = message.toLowerCase()
    const comfortRequestIndicators = [
      'comfort me', 'just comfort', 'need comfort', 'want comfort',
      'just listen', 'don\'t give advice', 'no advice', 'don\'t suggest',
      'just be here', 'just understand', 'hold space',
      'don\'t try to fix', 'don\'t solve', 'just support',
      'need someone to listen', 'need emotional support',
      'feel heard', 'validate me', 'acknowledge my pain'
    ]
    
    return comfortRequestIndicators.some(indicator => lowerMessage.includes(indicator))
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

  const isAskingAboutFeelings = (aiResponse: string): boolean => {
    const feelingQuestions = [
      'how are you feeling',
      'what are you feeling',
      'how do you feel',
      'what do you feel',
      'what feelings',
      'what emotions',
      'how does that make you feel',
      'what kinds of feelings',
      'what kinds of emotions',
      'feelings are coming up',
      'emotions are coming up',
      'feeling right now',
      'current mood',
      'your mood',
      'emotionally'
    ]
    
    const lowerResponse = aiResponse.toLowerCase()
    return feelingQuestions.some(question => lowerResponse.includes(question))
  }

  // Comfort-only response for when user explicitly asks for comfort
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
          engagementLevel: 'high', // Always high engagement for comfort requests
          responseInstructions: "CRITICAL: User has explicitly asked for comfort/emotional support only. DO NOT give any advice, suggestions, or solutions. Focus ENTIRELY on deep emotional validation, empathy, and comfort. Use varied, profound language to avoid repetition. Make them feel truly heard and supported.",
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
        throw new Error('Failed to get comfort response')
      }
    } catch (error) {
      return getRandomFallback('chatError')
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
        // Has both emotion and story - start conversation about the story
        return await getStoryBasedResponse(userMessage, analysis.detectedEmotion, analysis.needsComfortOnly)
      } else {
        // Only emotion mentioned - ask what happened
        return "I can sense you're feeling " + analysis.detectedEmotion.toLowerCase() + ". What happened? I'm here to listen."
      }
    }
    
    // Case 3: User describes emotions without direct statement
    if (userMessages.length === 0 && !analysis.hasDirectEmotion) {
      if (analysis.hasStoryContext) {
        // Has story but no emotion - get response and check if it asks about feelings
        const response = await getNormalResponse(userMessage)
        // Check if AI is asking about feelings/emotions to show buttons
        if (isAskingAboutFeelings(response)) {
          setTimeout(() => {
            setShowInlineEmotionButtons(true)
          }, 1500) // Show emotion buttons after AI responds
        }
        return response
      }
      // Continue with normal conversation
      return await getNormalResponse(userMessage)
    }
    
      // Case 4: Ongoing conversation
  return await getNormalResponse(userMessage)
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
    // Prefer streaming; fallback to JSON
    const streamed = await getStreamedResponse(userMessage)
    if (streamed && streamed !== getRandomFallback('chatError')) return streamed

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

// Streamed response helper (SSE over fetch)
const getStreamedResponse = async (userMessage: string): Promise<string> => {
  const messages = currentSession?.messages || []
  try {
    const res = await fetch('/api/chat?stream=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        userMessage,
        emotion: selectedEmotion || 'Other',
        engagementLevel: detectEmotionalEngagement(userMessage, messages.filter(m => m.role === 'user')),
        conversationHistory: messages.map(msg => ({ role: msg.role, content: msg.content })),
        stream: true,
      }),
    })

    if (!res.ok || !res.body) {
      throw new Error('Streaming failed')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let done = false
    let buffer = ''
    let accumulated = ''

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload) continue
          try {
            const json = JSON.parse(payload)
            if (json?.text) {
              accumulated += json.text
              setAiResponse(prev => (prev ? prev + json.text : json.text))
            }
          } catch {
            // ignore
          }
        }
      }
    }

    if (!accumulated) {
      // fallback to JSON response body if stream yielded nothing
      try {
        const data = await res.clone().json()
        if (data?.response) return data.response as string
      } catch {}
    }
    return accumulated || getRandomFallback('chatError')
  } catch (e) {
    return getRandomFallback('chatError')
  }
}

  // Handle inline emotion selection
  const handleInlineEmotionClick = (emotion: EmotionType) => {
    setSelectedInlineEmotion(emotion)
    setSelectedEmotion(emotion)
    setShowInlineEmotionButtons(false)
    
    // Save emotion record immediately when user selects emotion
    saveConversationEmotionRecord(emotion, 5, conversationText)
    const emotionMessage = `I'm feeling ${emotion.toLowerCase()}`
    addMessage(emotionMessage, 'user')
    handleEmotionAcknowledgment(emotion)
  }

  const handleEmotionAcknowledgment = async (emotion: EmotionType) => {
    setIsTyping(true)
    try {
      const response = await getNormalResponse(`I'm feeling ${emotion.toLowerCase()}`)
      setAiResponse(response)
      addMessage(response, 'assistant')
    } catch (error) {
      const fallback = `I understand you're feeling ${emotion.toLowerCase()}. Tell me more about what's going on.`
      setAiResponse(fallback)
      addMessage(fallback, 'assistant')
    } finally {
      setIsTyping(false)
    }
  }

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

  // Detect emotional engagement level with enhanced long message detection
  const detectEmotionalEngagement = (userMessage: string, userMessages: any[]): 'high' | 'medium' | 'normal' => {
    const messageLength = userMessage.length
    const recentMessages = userMessages.slice(-3) // Look at last 3 messages
    const wordCount = userMessage.split(/\s+/).length
    const sentenceCount = userMessage.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    
    // High engagement indicators
    const highEngagementIndicators = [
      // Emotional intensity markers
      'really', 'so', 'very', 'extremely', 'totally', 'completely', 'absolutely',
      // Repetitive expressions
      '!!!', '...', '??', 
      // Emotional outpouring markers
      'just', 'i mean', 'you know', 'like', 'honestly', 'seriously',
      // Urgency markers
      'need to', 'have to', 'can\'t', 'don\'t know what to do',
      // Story telling markers
      'today', 'yesterday', 'happened', 'then', 'after that', 'because', 'since'
    ]
    
    const emotionalWords = [
      'feel', 'feeling', 'felt', 'emotion', 'heart', 'soul', 'mind',
      'crying', 'tears', 'upset', 'happy', 'sad', 'angry', 'scared',
      'love', 'hate', 'worried', 'excited', 'nervous', 'overwhelmed'
    ]
    
    const lowerMessage = userMessage.toLowerCase()
    const highEngagementCount = highEngagementIndicators.filter(indicator => lowerMessage.includes(indicator)).length
    const emotionalWordCount = emotionalWords.filter(word => lowerMessage.includes(word)).length
    
    // Enhanced criteria for long messages
    const isVeryLongMessage = messageLength > 300 || wordCount > 50
    const isLongMessage = messageLength > 150 || wordCount > 25
    const hasMultipleRecentMessages = recentMessages.length >= 2
    const hasHighEngagementMarkers = highEngagementCount >= 3
    const hasEmotionalContent = emotionalWordCount >= 2
    const hasMultipleSentences = sentenceCount > 3
    const hasDetailedContent = sentenceCount > 5 || wordCount > 40
    
    // Very high engagement for users sharing a lot
    if (isVeryLongMessage || hasDetailedContent || 
        (isLongMessage && hasEmotionalContent) || 
        (hasMultipleRecentMessages && hasHighEngagementMarkers) ||
        (hasMultipleSentences && emotionalWordCount >= 3)) {
      return 'high'
    }
    
    // Medium engagement for moderate sharing
    if (hasEmotionalContent || hasHighEngagementMarkers || isLongMessage || wordCount > 15) {
      return 'medium'
    }
    
    return 'normal'
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return

    // Sanitize user input to prevent XSS attacks
    const sanitizedMessage = inputValue.trim()
    if (!sanitizedMessage) return // Reject empty or invalid input
    
    const userMessage = sanitizedMessage
    setInputValue('')
    setLastUserMessage(userMessage)
    setIsTyping(true)
    setAiResponse('')
    setIsFirstMessage(false)

    // Add user message to chat (include emotion if selected)
    let messageToSend = userMessage
    if (selectedInlineEmotion) {
      messageToSend = `[Feeling: ${selectedInlineEmotion}] ${userMessage}`
      setSelectedInlineEmotion(null) // Clear after using
    }
    
    addMessage(userMessage, 'user') // Show clean message to user
    setConversationText(prev => prev + ' ' + userMessage)

    try {
      // Use new simplified conversation flow with emotion context
      const aiMessage = await handleConversationFlow(messageToSend)
      setAiResponse(aiMessage)
      addMessage(aiMessage, 'assistant')
      setConversationText(prev => prev + ' ' + aiMessage)
      
      // Check if AI is asking about feelings to show emotion buttons
      if (isAskingAboutFeelings(aiMessage)) {
        setTimeout(() => {
          setShowInlineEmotionButtons(true)
        }, 1500) // Show emotion buttons after AI responds
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
    // Update selected emotion and save record immediately
    setSelectedEmotion(emotion)
    
    // Save emotion record immediately when user selects emotion
    saveConversationEmotionRecord(emotion, intensity, conversationText)
    
    // Simplified: ask model normally with context
    const response = await getNormalResponse(`I'm feeling ${emotion.toLowerCase()}`)
    setAiResponse(response)
    addMessage(response, 'assistant')
    
    // Update session emotion
    if (currentSession) {
      // Note: You might want to add a method to update session emotion
      // For now, we'll just continue with the conversation
    }
    
    // Emotion record saved immediately
  }

  const handleInlineEmotionSelect = async (emotion: EmotionType) => {
    setSelectedEmotion(emotion)
    setShowInlineEmotions(false)
    setShowMoreEmotions(false)
    setIsTyping(true)
    
    // Save emotion record immediately when user selects emotion
    saveConversationEmotionRecord(emotion, 5, conversationText)
    
    try {
      // Get personalized AI response based on user's story and selected emotion
      const messages = currentSession?.messages || []
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
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
    }
    
    // Emotion recorded silently in handleInlineEmotionSelect
  }

  const handleSkipEmotion = () => {
    const skipResponse = "No worries at all! What else is going on with you?"
    setAiResponse(skipResponse)
    addMessage(skipResponse, 'assistant')
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
      // Estimate intensity (simple heuristic) and compute detailed score
      const estimateIntensity = (text: string): number => {
        const lower = text.toLowerCase()
        let score = 5
        const strong = ['very', 'really', 'so', 'extremely', 'can\'t', 'overwhelmed', 'furious', 'terrified']
        const mild = ['a bit', 'somewhat', 'kind of']
        score += (lower.match(/!/g)?.length || 0) * 0.5
        score += strong.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0)
        score -= mild.reduce((acc, w) => acc + (lower.includes(w) ? 0.5 : 0), 0)
        return Math.max(1, Math.min(10, Math.round(score)))
      }
      const intensity = estimateIntensity(conversationText)
      const behavioralScore = calculateBehavioralImpactScore(emotionToSave, intensity, conversationText)

      // If not logged in, stash payload and redirect to login
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
            // redirect to login
            window.location.href = '/login'
            return
          }
        }
      } catch {}

      const saved = await saveConversationEmotionRecord(emotionToSave, behavioralScore.overall_score, conversationText)
      // Show detailed score dialog
      setScoreDetails(behavioralScore)
      setShowScoreDialog(true)
      
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
                  
                  {/* Simplified chat: no inline emotion buttons */}

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

        {/* User Input Area - Editable Message Box */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg">
          <div className="p-4 sm:p-6">
            {/* Simple header without button */}
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-gray-800 font-semibold">You</span>
                <div className="text-xs text-gray-400">Share your thoughts</div>
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Online
              </div>
            </div>
            
            {/* Input area with integrated send button */}
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Your message will appear here..."
                className="w-full min-h-[120px] max-h-[300px] p-4 pr-16 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base placeholder-gray-400 transition-all duration-200 bg-gray-50/30"
                disabled={isTyping}
                autoFocus
              />
              {/* Send button positioned inside the textarea */}
              <div className="absolute bottom-3 right-3">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-400 text-center sm:text-left">
              Press Enter to send, Shift + Enter for new line
            </div>
          </div>
        </div>



        {/* Removed suggestion interface - simplified flow */}

        {/* Removed old emotion selection interface - using inline buttons in chat now */}

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

      {/* Removed popup emotion selection dialog - using inline buttons instead */}
      {/* Score Details Dialog */}
      <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Behavioral Impact Breakdown</DialogTitle>
          </DialogHeader>
          {scoreDetails && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg border p-4">
                <div className="text-gray-700">Overall Score</div>
                <div className="text-2xl font-bold">{scoreDetails.overall_score}/10 <span className="text-base font-medium text-gray-500">({scoreDetails.risk_level})</span></div>
                <div className="text-gray-600 mt-1">Action tendency: {scoreDetails.action_tendency}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-1">Emotional Intensity</div>
                  <div>Intensity: {scoreDetails.intensity.intensity}/10</div>
                  <div>Level: {scoreDetails.intensity.level}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-1">Emotional Focus</div>
                  <div>Type: {scoreDetails.focus.type}</div>
                  <div>Score: {scoreDetails.focus.score}/10</div>
                  <div className="text-gray-600 mt-1">{scoreDetails.focus.description}</div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="font-medium mb-2">Cognitive Appraisal</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Controllability: {scoreDetails.appraisal.controllability}/10</div>
                  <div>Threat vs Challenge: {scoreDetails.appraisal.threat_vs_challenge}/10</div>
                  <div>Coping Potential: {scoreDetails.appraisal.coping_potential}/10</div>
                  <div>Goal Relevance: {scoreDetails.appraisal.goal_relevance}/10</div>
                </div>
              </div>
              {scoreDetails.recommendations.length > 0 && (
                <div className="rounded-lg border p-4">
                  <div className="font-medium mb-2">Recommendations</div>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
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