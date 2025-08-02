import type { EmotionType } from '@/store/emotion'

// Emotion response configuration
// You can customize response content for each emotion here
export const emotionResponses: Record<EmotionType, string[]> = {
  'Anger': [
    "I understand your anger right now, this emotion is completely normal. Would you like to talk about what happened?",
    "When feeling angry, take a few deep breaths and give yourself time to calm down. I'm here with you.",
    "Your anger is valid. Let's work together to find better ways to handle this.",
    "Anger is a natural protective response, but we can learn to express it more constructively.",
    "I can sense your anger, and this emotion deserves to be heard and understood.",
    "It takes courage to acknowledge anger. What would help you feel more in control right now?"
  ],
  'Disgust': [
    "Feeling disgusted is a natural reaction that helps us identify what's harmful or wrong.",
    "I understand your feelings. Disgust can be really uncomfortable. Would you like to share more?",
    "When facing things that disgust you, maintaining distance and boundaries is important.",
    "Disgust helps us recognize what might be harmful to us - it's a form of self-protection.",
    "Your feelings of disgust are real and valid. I'm here to listen to you.",
    "Sometimes disgust signals that our values or standards are being violated. What feels wrong here?"
  ],
  'Fear': [
    "Fear is one of humanity's most primal emotions - it protects us. I'm here with you.",
    "Feeling afraid is completely normal. Let's face this fear together, step by step.",
    "When afraid, remember to breathe deeply and take it one moment at a time. Everything will be okay.",
    "Fear reminds us to be careful, but it also shows us what's important to us.",
    "Facing fear takes tremendous courage, and you've already shown so much bravery.",
    "What would make you feel safer right now? Let's explore your options together."
  ],
  'Joy': [
    "Seeing you so happy makes me happy too! Can you share what's bringing you such joy?",
    "Joyful feelings are life's most precious gifts. Let's celebrate this moment together!",
    "Your happiness is contagious! I hope this wonderful mood stays with you.",
    "Joy represents life's most beautiful moments. Treasure this feeling.",
    "Your smile is truly beautiful. Keep nurturing this happiness within you!",
    "This joy you're experiencing - how can we help it grow and last even longer?"
  ],
  'Sadness': [
    "I understand your sadness right now. These feelings are real and important.",
    "When we're sad, having someone listen and understand is truly valuable. I'm here with you.",
    "Allowing yourself to feel sadness is an important step in processing emotions.",
    "Sadness is part of the healing process. Don't rush to push it away.",
    "Your sadness is completely valid. I'm here to support you through this difficult time.",
    "What do you need most right now? Sometimes just being heard can make a difference."
  ],
  'Surprise': [
    "Surprise keeps us alert and curious about the world. What caught you off guard?",
    "Surprise is our brain's natural response to new information. This reaction is completely normal.",
    "When facing unexpected situations, staying calm and rational is important. I'm here to support you.",
    "Surprise helps us stay open-minded, which promotes learning and growth.",
    "Unexpected discoveries often bring new possibilities. Let's explore this together.",
    "How are you processing this surprise? Sometimes the unexpected leads to wonderful opportunities."
  ],
  'Complex': [
    "Complex emotions are completely normal - they reflect the richness of our inner lives. What specific feelings are you experiencing?",
    "Anxiety, jealousy, embarrassment, and other complex emotions are all part of the human experience. I'm here to listen.",
    "Complex emotions often need more time to understand and process. This is completely natural.",
    "Having complex emotions shows you're a person of depth - that's something precious.",
    "Let's work together to untangle these complex feelings and find meaning in them.",
    "When emotions feel complicated, it often means something important is happening. What do you think this mixture of feelings is telling you?"
  ]
}

// Emotion intensity responses (adjusted based on user's emotion intensity)
export const intensityResponses: Record<EmotionType, Record<string, string[]>> = {
  'Anger': {
    'high': [
      "I can feel your intense anger - this emotion needs to be taken seriously.",
      "Take deep breaths, go slowly. I'm here with you through this difficult moment.",
      "Your anger is completely valid. Let's find healthy ways to express it together."
    ],
    'medium': [
      "I understand your anger - this emotion is very natural.",
      "Let's work together to find better ways to handle this.",
      "Anger reminds us of what's truly important to us."
    ],
    'low': [
      "Mild anger is normal - it helps us set healthy boundaries.",
      "You're managing your emotions really well.",
      "This level of anger is completely manageable."
    ]
  },
  'Disgust': {
    'high': [
      "Intense feelings of disgust can be really overwhelming. I understand you.",
      "When facing things that disgust you deeply, keeping distance is wise.",
      "This disgust is alerting you to something potentially harmful."
    ],
    'medium': [
      "Disgust is a protective emotion - this is very normal.",
      "I understand your feelings. Would you like to share more?",
      "When dealing with disgust, maintaining boundaries is important."
    ],
    'low': [
      "Mild disgust helps us identify things we don't like.",
      "You're handling these feelings really well.",
      "This level of disgust is completely acceptable."
    ]
  },
  'Fear': {
    'high': [
      "I can feel your intense fear - this must be really frightening.",
      "Breathe deeply. I'm here with you, and everything will be okay.",
      "Fear protects us, but it also reminds us to seek help when needed."
    ],
    'medium': [
      "Fear is a natural protective mechanism - this is very normal.",
      "Let's face this fear together, step by step.",
      "Fear reminds us to be careful, but also shows us what matters to us."
    ],
    'low': [
      "Mild fear helps us stay alert and aware.",
      "You're managing these feelings really well.",
      "This level of fear is completely manageable."
    ]
  },
  'Joy': {
    'high': [
      "Seeing you so joyful makes me excited for you too!",
      "This happiness is truly precious - enjoy every moment of it!",
      "Your joy is contagious! Keep nurturing this wonderful feeling!"
    ],
    'medium': [
      "Seeing you happy makes me happy too!",
      "Joyful feelings are life's most precious gifts.",
      "Your happiness is infectious - keep it going!"
    ],
    'low': [
      "It's nice to see you in good spirits.",
      "Keep nurturing this positive mindset.",
      "This level of joy feels comfortable and sustainable."
    ]
  },
  'Sadness': {
    'high': [
      "I can feel your deep sadness - this must be really painful.",
      "I'm here with you. You don't have to carry this sadness alone.",
      "Sadness is part of the healing process. Allow yourself to feel it."
    ],
    'medium': [
      "I understand your sadness. These feelings are real and important.",
      "When we're sad, having someone listen is truly valuable.",
      "Allowing yourself to feel sadness is an important step in processing."
    ],
    'low': [
      "Mild sadness is normal - it helps us reflect and process.",
      "You're handling these feelings really well.",
      "This level of sadness is completely acceptable."
    ]
  },
  'Surprise': {
    'high': [
      "I can feel your intense surprise - this must be really unexpected!",
      "Take deep breaths and go slowly. I'm here to support you.",
      "Unexpected discoveries often bring new possibilities."
    ],
    'medium': [
      "Surprise keeps us alert and curious about the world.",
      "Surprise is our brain's natural response - this is completely normal.",
      "When facing unexpected situations, staying calm is important."
    ],
    'low': [
      "Mild surprise helps us stay open-minded and adaptable.",
      "You're processing this surprise really well.",
      "This level of surprise can actually be beneficial."
    ]
  },
  'Complex': {
    'high': [
      "I can sense your complex emotions - this must feel really overwhelming.",
      "Complex emotions need more time to understand. I'm here to listen.",
      "Let's work together to untangle these complicated feelings."
    ],
    'medium': [
      "Complex emotions are normal - they show the richness of your inner life.",
      "Anxiety, jealousy, embarrassment - these complex emotions are part of being human.",
      "Complex emotions often need more time to understand and process."
    ],
    'low': [
      "Having complex emotions shows you're a person of depth.",
      "You're handling these complex feelings really well.",
      "This level of emotional complexity is completely understandable."
    ]
  }
}

// Get emotion intensity level
export function getIntensityLevel(intensity: number): 'low' | 'medium' | 'high' {
  if (intensity <= 3) return 'low'
  if (intensity <= 7) return 'medium'
  return 'high'
}

// Get random response
export function getRandomResponse(emotion: EmotionType, intensity?: number): string {
  const responses = emotionResponses[emotion]
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex] || responses[0] || "I'm here with you."
}

// Get intensity-based response
export function getIntensityResponse(emotion: EmotionType, intensity: number): string {
  const level = getIntensityLevel(intensity)
  const responses = intensityResponses[emotion]?.[level] || emotionResponses[emotion]
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex] || responses[0] || "I'm here with you."
} 