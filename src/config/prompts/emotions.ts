/**
 * Emotion context configuration
 * Provide contextual guidance for different emotions, not fixed templates
 */

import type { EmotionType } from '@/store/emotion'

export const EMOTION_CONTEXTS = {
  version: "1.1.0",
  lastUpdated: "2025-01-27",
  
  contexts: {
    'Anger': {
      description: "User may be experiencing anger or frustration",
      guidance: "Acknowledge their anger is valid, then offer ways to process it healthily. Provide comfort and practical steps.",
      focusAreas: ["triggers", "underlying needs", "healthy expression"],
      comfortTechniques: [
        "It's completely understandable to feel angry about this",
        "Your anger is telling you something important",
        "You have every right to feel upset by this situation"
      ],
      practicalSuggestions: [
        "Take a few deep breaths to help your body calm down",
        "Try writing down what happened to help process it",
        "Consider what boundary you might need to set"
      ]
    },
    
    'Sadness': {
      description: "User may be experiencing sadness or grief", 
      guidance: "Offer gentle comfort and acknowledge their pain. Provide emotional support and gentle suggestions for coping.",
      focusAreas: ["loss", "disappointment", "need for support"],
      comfortTechniques: [
        "I'm so sorry you're hurting right now",
        "It's okay to feel sad - these feelings matter",
        "You don't have to go through this alone"
      ],
      practicalSuggestions: [
        "Be extra gentle with yourself today",
        "Maybe reach out to someone who cares about you",
        "It's okay to rest and take things slowly"
      ]
    },
    
    'Fear': {
      description: "User may be experiencing fear or anxiety",
      guidance: "Provide reassurance and grounding techniques. Help them feel safer and more in control.",
      focusAreas: ["safety", "uncertainty", "coping strategies"],
      comfortTechniques: [
        "You're safe right now in this moment",
        "Fear is hard, but you're stronger than you know",
        "These scary feelings will pass"
      ],
      practicalSuggestions: [
        "Try the 5-4-3-2-1 grounding technique",
        "Focus on what you can control right now",
        "Take one small step at a time"
      ]
    },
    
    'Joy': {
      description: "User is experiencing positive emotions",
      guidance: "Celebrate with them! Ask what made this moment special and help them savor the good feelings.",
      focusAreas: ["celebration", "gratitude", "sharing happiness"],
      comfortTechniques: [
        "I'm so happy to hear this good news!",
        "You deserve these wonderful moments",
        "It's beautiful to see you experiencing joy"
      ],
      practicalSuggestions: [
        "Take a moment to really savor this feeling",
        "Maybe share this happiness with someone you care about",
        "Consider what made this moment so special"
      ]
    },
    
    'Anxiety': {
      description: "User may be feeling overwhelmed or anxious",
      guidance: "Provide immediate comfort and grounding. Offer specific techniques to help them feel more stable and in control.",
      focusAreas: ["overwhelm", "worry patterns", "grounding techniques"],
      comfortTechniques: [
        "Anxiety is so overwhelming, but you're going to be okay",
        "What you're feeling is real and valid",
        "You've gotten through anxious moments before, and you'll get through this one too"
      ],
      practicalSuggestions: [
        "Try taking slow, deep breaths - in for 4, hold for 4, out for 6",
        "Name 3 things you can see, 2 you can hear, 1 you can touch",
        "Remind yourself: this feeling is temporary and will pass"
      ]
    },
    
    'Love': {
      description: "User is experiencing love or deep connection",
      guidance: "Explore what's meaningful about this connection. Help them appreciate and understand these feelings.",
      focusAreas: ["connection", "meaning", "appreciation"],
      comfortTechniques: [
        "Love is such a beautiful and powerful feeling",
        "It's wonderful that you're experiencing this connection",
        "These feelings of love are precious and meaningful"
      ],
      practicalSuggestions: [
        "Take time to appreciate this special connection",
        "Consider expressing your feelings appropriately",
        "Cherish these moments of deep connection"
      ]
    },
    
    'Surprise': {
      description: "User experienced something unexpected",
      guidance: "Help them process this new experience. Surprise can bring both excitement and uncertainty.",
      focusAreas: ["adjustment", "processing change", "new perspectives"],
      comfortTechniques: [
        "Unexpected things can feel overwhelming at first",
        "It's natural to need time to process surprises",
        "Your reaction to this surprise makes complete sense"
      ],
      practicalSuggestions: [
        "Take some time to let this news settle in",
        "Consider what this change might mean for you",
        "It's okay to feel mixed emotions about unexpected news"
      ]
    },
    
    'Disgust': {
      description: "User feels something is wrong or violates their values",
      guidance: "Listen to what feels 'off' to them. This often reflects their values and boundaries.",
      focusAreas: ["values", "boundaries", "what matters to them"],
      comfortTechniques: [
        "Your instincts about what feels wrong are valid",
        "It's important to honor your values and boundaries",
        "You have every right to feel uncomfortable about this"
      ],
      practicalSuggestions: [
        "Trust your instincts about what doesn't feel right",
        "Consider what boundary you might need to set",
        "Think about what would feel more aligned with your values"
      ]
    },
    
    'Pride': {
      description: "User feels accomplished or proud",
      guidance: "Acknowledge their achievement. Ask about their journey and what this means to them.",
      focusAreas: ["accomplishment", "growth", "self-recognition"],
      comfortTechniques: [
        "You should absolutely feel proud of this accomplishment",
        "Your hard work and effort have really paid off",
        "This achievement is something to celebrate"
      ],
      practicalSuggestions: [
        "Take a moment to really acknowledge what you've achieved",
        "Consider sharing this success with someone who matters to you",
        "Reflect on the journey that brought you to this moment"
      ]
    },
    
    'Shame': {
      description: "User may be experiencing shame or self-criticism",
      guidance: "Offer extra gentleness and counter the harsh self-criticism. Help them see their inherent worth.",
      focusAreas: ["self-compassion", "human imperfection", "healing"],
      comfortTechniques: [
        "You are still worthy of love and compassion, no matter what",
        "Everyone makes mistakes - you're not alone in being human",
        "Your worth isn't defined by this one thing"
      ],
      practicalSuggestions: [
        "Try speaking to yourself like you would a good friend",
        "Remember three things you like about yourself",
        "Focus on what you can learn rather than punishing yourself"
      ]
    },
    
    'Envy': {
      description: "User may be comparing themselves to others",
      guidance: "Explore what they truly want. Envy often shows us our deeper desires.",
      focusAreas: ["desires", "comparison patterns", "self-worth"],
      comfortTechniques: [
        "Envy is a natural human feeling, and it's okay to acknowledge it",
        "These feelings can actually help you understand what you truly want",
        "You're not a bad person for feeling this way"
      ],
      practicalSuggestions: [
        "Try to identify what specifically you're envying",
        "Consider if there's a way to work toward what you want",
        "Focus on your own unique journey and progress"
      ]
    },
    
    'Guilt': {
      description: "User feels they've done something wrong",
      guidance: "Listen to their conscience. Guilt can motivate positive change when processed healthily.",
      focusAreas: ["responsibility", "making amends", "learning"],
      comfortTechniques: [
        "Guilt shows that you have a good conscience and care about doing right",
        "Everyone makes mistakes - it's part of being human",
        "You can learn and grow from this experience"
      ],
      practicalSuggestions: [
        "Consider if there's a way to make things right",
        "Learn what you can from this situation",
        "Be kind to yourself while taking responsibility"
      ]
    },
    
    'Hope': {
      description: "User is feeling hopeful about the future",
      guidance: "Nurture this positive feeling. Ask about their vision and what gives them hope.",
      focusAreas: ["future vision", "possibilities", "motivation"],
      comfortTechniques: [
        "Hope is such a powerful and beautiful feeling",
        "Your optimism about the future is inspiring",
        "It's wonderful that you can see positive possibilities ahead"
      ],
      practicalSuggestions: [
        "Hold onto this hopeful feeling when things get tough",
        "Consider what small steps you can take toward your vision",
        "Share your hope with others who might need encouragement"
      ]
    },
    
    'Excitement': {
      description: "User is feeling energized and enthusiastic",
      guidance: "Match their energy appropriately. Ask what's energizing them and share their enthusiasm.",
      focusAreas: ["anticipation", "energy", "shared excitement"],
      comfortTechniques: [
        "Your excitement is contagious and wonderful!",
        "It's so good to see you feeling energized and enthusiastic",
        "These moments of pure excitement are precious"
      ],
      practicalSuggestions: [
        "Channel this energy into action toward what excites you",
        "Share your enthusiasm with people who will celebrate with you",
        "Remember this feeling when you need motivation later"
      ]
    },
    
    'Boredom': {
      description: "User feels restless or unfulfilled",
      guidance: "Explore what's missing for them. Boredom often signals a need for meaning or change.",
      focusAreas: ["meaning", "engagement", "change needs"],
      comfortTechniques: [
        "Boredom can actually be a signal that you're ready for something new",
        "It's okay to feel restless when things aren't fulfilling you",
        "This feeling might be pointing you toward what you really need"
      ],
      practicalSuggestions: [
        "Consider what would feel meaningful or engaging to you right now",
        "Try something small and new today",
        "Think about what aspects of your life could use a refresh"
      ]
    },
    
    'Confusion': {
      description: "User feels unclear or uncertain",
      guidance: "Help them explore the confusion without rushing to clarity. Sometimes sitting with uncertainty is helpful.",
      focusAreas: ["uncertainty", "multiple perspectives", "patience"],
      comfortTechniques: [
        "It's okay not to have all the answers right now",
        "Confusion often comes before clarity - you're in a process",
        "You don't have to figure everything out immediately"
      ],
      practicalSuggestions: [
        "Try writing down what you're thinking to help organize your thoughts",
        "Talk through your confusion with someone you trust",
        "Give yourself permission to sit with uncertainty for now"
      ]
    },
    
    'Gratitude': {
      description: "User is feeling thankful or appreciative",
      guidance: "Help them savor this positive feeling. Ask what they're grateful for and why it matters.",
      focusAreas: ["appreciation", "blessings", "positive focus"],
      comfortTechniques: [
        "Gratitude is such a healing and beautiful feeling",
        "Your appreciation for life's gifts is touching",
        "These moments of thankfulness are so important"
      ],
      practicalSuggestions: [
        "Take time to really savor what you're grateful for",
        "Consider expressing your gratitude to someone who matters",
        "Let this feeling of appreciation fill your heart"
      ]
    },
    
    'Loneliness': {
      description: "User feels disconnected or isolated",
      guidance: "Offer warm companionship in this moment. Acknowledge their pain and provide connection.",
      focusAreas: ["connection", "isolation", "belonging"],
      comfortTechniques: [
        "You're not alone - I'm here with you right now",
        "Loneliness is one of the hardest feelings, and I'm sorry you're experiencing it",
        "Your need for connection is completely human and understandable"
      ],
      practicalSuggestions: [
        "Maybe reach out to one person who cares about you",
        "Consider doing something kind for yourself today",
        "Remember that this feeling of disconnection is temporary"
      ]
    },
    
    'Frustration': {
      description: "User feels blocked or unable to progress",
      guidance: "Validate their frustration and help them find a way forward. Offer practical problem-solving support.",
      focusAreas: ["obstacles", "problem-solving", "change needs"],
      comfortTechniques: [
        "Frustration is so exhausting - it makes sense you're feeling this way",
        "You're working hard and it's okay to feel stuck sometimes",
        "This situation is difficult, not you"
      ],
      practicalSuggestions: [
        "Maybe take a step back and try a different approach",
        "Focus on one small thing you can control",
        "Sometimes talking it through helps find new solutions"
      ]
    },
    
    'Contentment': {
      description: "User feels peaceful and satisfied",
      guidance: "Help them appreciate this sense of peace. Ask what contributes to this feeling.",
      focusAreas: ["peace", "satisfaction", "well-being"],
      comfortTechniques: [
        "This sense of contentment is so precious and valuable",
        "You've found a moment of peace, and that's beautiful",
        "This feeling of satisfaction shows you're in a good place"
      ],
      practicalSuggestions: [
        "Take time to appreciate this sense of peace you're feeling",
        "Notice what's contributing to this contentment",
        "Let yourself fully enjoy this moment of satisfaction"
      ]
    },
    
    'Other': {
      description: "User is experiencing complex or mixed emotions",
      guidance: "Stay curious and open. Help them explore and name what they're feeling without forcing labels.",
      focusAreas: ["exploration", "complexity", "self-awareness"],
      comfortTechniques: [
        "It's completely normal to feel complex or mixed emotions",
        "You don't have to have it all figured out right now",
        "Your feelings are valid even if they're complicated"
      ],
      practicalSuggestions: [
        "Take time to sit with these feelings without judging them",
        "Try to identify the different emotions you're experiencing",
        "It's okay to feel multiple things at once"
      ]
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

export function getComfortTechniques(emotion: EmotionType): readonly string[] {
  const context = EMOTION_CONTEXTS.contexts[emotion]
  return context?.comfortTechniques || []
}

export function getPracticalSuggestions(emotion: EmotionType): readonly string[] {
  const context = EMOTION_CONTEXTS.contexts[emotion]
  return context?.practicalSuggestions || []
}

export function getEmotionSupport(emotion: EmotionType): string {
  const context = EMOTION_CONTEXTS.contexts[emotion] || EMOTION_CONTEXTS.contexts['Other']
  const comfort = getComfortTechniques(emotion)
  const practical = getPracticalSuggestions(emotion)
  
  let supportText = `${context.description}. ${context.guidance}`
  
  if (comfort.length > 0) {
    supportText += `\n\nComfort approaches: ${comfort.join(', ')}`
  }
  
  if (practical.length > 0) {
    supportText += `\n\nPractical suggestions: ${practical.join(', ')}`
  }
  
  return supportText
}