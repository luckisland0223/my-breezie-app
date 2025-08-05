/**
 * 情绪上下文配置
 * 为不同情绪提供上下文指导，而非固定模板
 */

import type { EmotionType } from '@/store/emotion'

export const EMOTION_CONTEXTS = {
  version: "1.0.0",
  lastUpdated: "2025-01-27",
  
  contexts: {
    'Anger': {
      description: "User may be experiencing anger or frustration",
      guidance: "Listen for what triggered this feeling. Acknowledge the intensity while helping them process what's underneath.",
      focusAreas: ["triggers", "underlying needs", "healthy expression"]
    },
    
    'Sadness': {
      description: "User may be experiencing sadness or grief", 
      guidance: "Create space for their sadness. Sometimes people need to feel heard before they can feel better.",
      focusAreas: ["loss", "disappointment", "need for support"]
    },
    
    'Fear': {
      description: "User may be experiencing fear or anxiety",
      guidance: "Help them feel safe in this conversation. Focus on what they can control and take things step by step.",
      focusAreas: ["safety", "uncertainty", "coping strategies"]
    },
    
    'Joy': {
      description: "User is experiencing positive emotions",
      guidance: "Celebrate with them! Ask what made this moment special and help them savor the good feelings.",
      focusAreas: ["celebration", "gratitude", "sharing happiness"]
    },
    
    'Anxiety': {
      description: "User may be feeling overwhelmed or anxious",
      guidance: "Help ground them in the present moment. Listen for specific worries and help break them down.",
      focusAreas: ["overwhelm", "worry patterns", "grounding techniques"]
    },
    
    'Love': {
      description: "User is experiencing love or deep connection",
      guidance: "Explore what's meaningful about this connection. Help them appreciate and understand these feelings.",
      focusAreas: ["connection", "meaning", "appreciation"]
    },
    
    'Surprise': {
      description: "User experienced something unexpected",
      guidance: "Help them process this new experience. Surprise can bring both excitement and uncertainty.",
      focusAreas: ["adjustment", "processing change", "new perspectives"]
    },
    
    'Disgust': {
      description: "User feels something is wrong or violates their values",
      guidance: "Listen to what feels 'off' to them. This often reflects their values and boundaries.",
      focusAreas: ["values", "boundaries", "what matters to them"]
    },
    
    'Pride': {
      description: "User feels accomplished or proud",
      guidance: "Acknowledge their achievement. Ask about their journey and what this means to them.",
      focusAreas: ["accomplishment", "growth", "self-recognition"]
    },
    
    'Shame': {
      description: "User may be experiencing shame or self-criticism",
      guidance: "Approach with extra gentleness. Help separate actions from self-worth.",
      focusAreas: ["self-compassion", "human imperfection", "healing"]
    },
    
    'Envy': {
      description: "User may be comparing themselves to others",
      guidance: "Explore what they truly want. Envy often shows us our deeper desires.",
      focusAreas: ["desires", "comparison patterns", "self-worth"]
    },
    
    'Guilt': {
      description: "User feels they've done something wrong",
      guidance: "Listen to their conscience. Guilt can motivate positive change when processed healthily.",
      focusAreas: ["responsibility", "making amends", "learning"]
    },
    
    'Hope': {
      description: "User is feeling hopeful about the future",
      guidance: "Nurture this positive feeling. Ask about their vision and what gives them hope.",
      focusAreas: ["future vision", "possibilities", "motivation"]
    },
    
    'Excitement': {
      description: "User is feeling energized and enthusiastic",
      guidance: "Match their energy appropriately. Ask what's energizing them and share their enthusiasm.",
      focusAreas: ["anticipation", "energy", "shared excitement"]
    },
    
    'Boredom': {
      description: "User feels restless or unfulfilled",
      guidance: "Explore what's missing for them. Boredom often signals a need for meaning or change.",
      focusAreas: ["meaning", "engagement", "change needs"]
    },
    
    'Confusion': {
      description: "User feels unclear or uncertain",
      guidance: "Help them explore the confusion without rushing to clarity. Sometimes sitting with uncertainty is helpful.",
      focusAreas: ["uncertainty", "multiple perspectives", "patience"]
    },
    
    'Gratitude': {
      description: "User is feeling thankful or appreciative",
      guidance: "Help them savor this positive feeling. Ask what they're grateful for and why it matters.",
      focusAreas: ["appreciation", "blessings", "positive focus"]
    },
    
    'Loneliness': {
      description: "User feels disconnected or isolated",
      guidance: "Acknowledge how difficult loneliness can be. Help them feel heard and less alone.",
      focusAreas: ["connection", "isolation", "belonging"]
    },
    
    'Frustration': {
      description: "User feels blocked or unable to progress",
      guidance: "Listen to what's not working for them. Help identify what needs to change.",
      focusAreas: ["obstacles", "problem-solving", "change needs"]
    },
    
    'Contentment': {
      description: "User feels peaceful and satisfied",
      guidance: "Help them appreciate this sense of peace. Ask what contributes to this feeling.",
      focusAreas: ["peace", "satisfaction", "well-being"]
    },
    
    'Other': {
      description: "User is experiencing complex or mixed emotions",
      guidance: "Stay curious and open. Help them explore and name what they're feeling without forcing labels.",
      focusAreas: ["exploration", "complexity", "self-awareness"]
    }
  }
} as const

export function getEmotionContext(emotion: EmotionType): string {
  const context = EMOTION_CONTEXTS.contexts[emotion]
  
  if (!context) {
    return EMOTION_CONTEXTS.contexts['Other'].description
  }
  
  return `${context.description}. ${context.guidance}`
}

export function getEmotionGuidance(emotion: EmotionType): string {
  const context = EMOTION_CONTEXTS.contexts[emotion] || EMOTION_CONTEXTS.contexts['Other']
  return context.guidance
}

export function getEmotionFocusAreas(emotion: EmotionType): readonly string[] {
  const context = EMOTION_CONTEXTS.contexts[emotion] || EMOTION_CONTEXTS.contexts['Other']  
  return context.focusAreas
}