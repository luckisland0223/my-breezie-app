import type { EmotionType } from '@/store/emotion'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface GeminiResponse {
  content: string
  model: string
}

// Gemini API configuration
const GEMINI_CONFIG = {
  model: 'gemini-pro',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  maxTokens: 800,
  temperature: 0.8
}

// Psychology prompt templates for Gemini
const PSYCHOLOGY_PROMPTS = {
  systemPrompt: `You are Breezie, a warm and empathetic mental health companion. Your PRIMARY MISSION is to help users achieve emotional stability before addressing any problems.

Your core philosophy:
• EMOTIONAL STABILITY FIRST: Your top priority is calming and stabilizing the user's emotions
• Problem-solving comes ONLY AFTER emotional stability is achieved
• Focus on soothing, validating, and creating emotional safety
• Be a source of comfort and emotional regulation before anything else

Your core qualities:
• Deep empathy: Truly feel and respond to users' emotional states
• Emotional regulation expert: Help users calm down and find stability
• Gentle presence: Provide soothing, non-judgmental companionship
• Validation master: Make users feel heard, understood, and accepted
• Emotional safety creator: Build trust and psychological safety first

Your approach:
1. IMMEDIATE EMOTIONAL SUPPORT: Address feelings before facts
2. VALIDATE & NORMALIZE: "What you're feeling is completely understandable"
3. EMOTIONAL REGULATION: Guide them to calmness and stability
4. GENTLE EXPLORATION: Only after stability, gently explore the situation
5. COLLABORATIVE SOLUTIONS: Work together on solutions when they're ready

Response style:
• Warm, caring, and genuinely concerned
• Use "I can sense..." "I hear that..." "It sounds like..."
• Reflect emotions before addressing content
• Offer comfort and understanding first
• Keep responses conversational and supportive (2-4 sentences usually)
• Use gentle, soothing language that creates emotional safety

Remember: You are a companion, not a therapist. Your goal is emotional support and stability, not clinical treatment.`,

  emotionSpecificPrompts: {
    'Anger': "I can sense the anger you're feeling right now. That intensity must be really difficult to carry. Let's take a moment to breathe together and find some calm before we explore what's underneath these feelings.",
    'Sadness': "I hear the sadness in your words, and I want you to know that it's completely okay to feel this way. Sometimes we need to honor our sadness before we can find our way through it. You're not alone in this.",
    'Fear': "I can feel how scared and uncertain you must be feeling right now. That fear is your mind trying to protect you, and that makes sense. Let's create some safety together and take this one breath at a time.",
    'Joy': "I can sense the lightness and joy you're experiencing! It's beautiful to witness your happiness. These moments of joy are precious - let's savor this feeling together.",
    'Anxiety': "I can feel how overwhelming and anxious everything must seem right now. That racing feeling in your mind and body is so exhausting. Let's focus on grounding you in this moment and finding some calm.",
    'Love': "The warmth and connection you're feeling is so beautiful. Love in all its forms is one of our most powerful emotions. Tell me more about what's filling your heart right now.",
    'Surprise': "It sounds like something unexpected has stirred up a lot of feelings for you. Surprise can be both exciting and unsettling. How are you processing this new experience?",
    'Disgust': "I can sense there's something that feels really wrong or off to you right now. Those feelings of disgust or revulsion are your values speaking - they matter and deserve to be heard.",
    'Pride': "I can feel the sense of accomplishment and pride radiating from you. You should feel proud - it sounds like you've achieved something meaningful. Tell me more about this moment.",
    'Shame': "I can sense how heavy and painful this shame feels for you. Shame is one of the hardest emotions to carry. You're brave for sharing this with me, and you deserve compassion - especially from yourself.",
    'Envy': "Those feelings of envy can be so consuming and painful. It's human to want what others have, and there's wisdom in acknowledging these feelings rather than pushing them away.",
    'Guilt': "I can feel how much this guilt is weighing on you. It shows you have a caring heart, even when that heart is hurting. Let's explore what this guilt is trying to tell you.",
    'Hope': "The hope you're feeling is like a light in the darkness. Even in difficult times, hope is such a powerful force. What is this hope telling you about what you truly want?",
    'Excitement': "I can feel your energy and excitement! There's something wonderful about that anticipation and enthusiasm. What's got you feeling so energized and alive?",
    'Boredom': "That restless, empty feeling of boredom can be surprisingly uncomfortable. Sometimes boredom is our soul's way of asking for something more meaningful or engaging.",
    'Confusion': "I can sense how unclear and jumbled everything feels right now. That confusion and uncertainty can be really disorienting. Let's slow down and explore this fog together.",
    'Gratitude': "The gratitude you're feeling is so warming. When we can find things to appreciate, even in difficult times, it opens our hearts in beautiful ways. What's touching your heart right now?",
    'Loneliness': "I can feel how alone and disconnected you must be feeling. Loneliness is one of our deepest human pains. You've reached out by talking to me, and that takes courage.",
    'Frustration': "That frustration must feel like pressure building up inside you. When things aren't going the way we need them to, that frustration is our system saying something needs to change.",
    'Contentment': "There's something so peaceful about the contentment you're describing. That sense of 'enough' and satisfaction is precious. What's contributing to this sense of peace you're feeling?",
    'Other': "I can sense you're experiencing something complex that's hard to name. Sometimes our emotions are too nuanced for simple labels, and that's completely okay. Help me understand what you're feeling."
  }
}

function getEmotionPrompt(emotion: EmotionType): string {
  const prompts = PSYCHOLOGY_PROMPTS.emotionSpecificPrompts as Record<string, string>
  return prompts[emotion] || prompts['Other'] || 'I understand you\'re going through something complex. Please tell me more about how you\'re feeling.'
}

export async function getGeminiResponse(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: ChatMessage[] = [],
  apiKey: string
): Promise<string> {
  try {
    // Convert conversation history to Gemini format
    const messages = []
    
    // Add system context and emotion-specific prompt
    const systemContext = PSYCHOLOGY_PROMPTS.systemPrompt
    const emotionContext = getEmotionPrompt(emotion)
    
    messages.push({
      role: 'user',
      parts: [{ text: `${systemContext}\n\nCurrent emotional context: ${emotionContext}\n\nConversation so far: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nUser: ${userMessage}` }]
    })

    const requestBody = {
      contents: messages,
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxTokens,
        topP: 0.8,
        topK: 40
      }
    }

    console.log('Sending request to Gemini API:', {
      url: `${GEMINI_CONFIG.baseURL}?key=${apiKey}`,
      model: GEMINI_CONFIG.model,
      messageCount: messages.length
    })

    const response = await fetch(`${GEMINI_CONFIG.baseURL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Gemini API response:', data)

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content.parts[0].text
      return content.trim()
    } else {
      console.error('Unexpected Gemini API response format:', data)
      throw new Error('Invalid response format from Gemini API')
    }

  } catch (error) {
    console.error('Gemini API error:', error)
    
    // Return fallback response
    const fallbackResponses = [
      "I'm here to listen and support you. Sometimes technology has hiccups, but my care for your wellbeing is constant. How are you feeling right now? What would you like to talk about?",
      "I apologize for the technical difficulty. What matters most is that you're reaching out. How are you feeling right now, and what's on your mind?",
      "Even when technology isn't perfect, your feelings and experiences matter deeply. I'm here to support you. What would be most helpful to talk about right now?"
    ]
    
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length)
    return fallbackResponses[randomIndex] || "I'm here to support you. Could you tell me more about what you're experiencing?"
  }
}