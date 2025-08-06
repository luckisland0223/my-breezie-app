/**
 * Emotion-based suggestions for stabilizing negative emotions
 */

import type { EmotionType } from '@/store/emotion'

export interface EmotionSuggestion {
  id: string
  text: string
  category: 'immediate' | 'activity' | 'mindset' | 'social' | 'physical'
  description?: string
}

export const EMOTION_SUGGESTIONS: Record<EmotionType, EmotionSuggestion[]> = {
  'Sadness': [
    { id: 'sad_1', text: 'Take 5 deep breaths and focus on the present moment', category: 'immediate' },
    { id: 'sad_2', text: 'Listen to your favorite uplifting music', category: 'activity' },
    { id: 'sad_3', text: 'Call or message someone you trust', category: 'social' },
    { id: 'sad_4', text: 'Write down 3 things you\'re grateful for today', category: 'mindset' },
    { id: 'sad_5', text: 'Take a short walk outside or by a window', category: 'physical' }
  ],
  'Anger': [
    { id: 'anger_1', text: 'Count to 10 slowly before responding', category: 'immediate' },
    { id: 'anger_2', text: 'Do some physical exercise or stretching', category: 'physical' },
    { id: 'anger_3', text: 'Write down your feelings without judgment', category: 'activity' },
    { id: 'anger_4', text: 'Take a break from the situation if possible', category: 'immediate' },
    { id: 'anger_5', text: 'Practice the 4-7-8 breathing technique', category: 'immediate' }
  ],
  'Anxiety': [
    { id: 'anxiety_1', text: 'Use the 5-4-3-2-1 grounding technique', category: 'immediate' },
    { id: 'anxiety_2', text: 'Break down your worries into smaller, manageable steps', category: 'mindset' },
    { id: 'anxiety_3', text: 'Practice progressive muscle relaxation', category: 'physical' },
    { id: 'anxiety_4', text: 'Talk to someone you trust about your concerns', category: 'social' },
    { id: 'anxiety_5', text: 'Focus on what you can control right now', category: 'mindset' }
  ],
  'Fear': [
    { id: 'fear_1', text: 'Remind yourself that you are safe in this moment', category: 'mindset' },
    { id: 'fear_2', text: 'Practice slow, deep breathing', category: 'immediate' },
    { id: 'fear_3', text: 'Challenge fearful thoughts with facts', category: 'mindset' },
    { id: 'fear_4', text: 'Reach out to a supportive friend or family member', category: 'social' },
    { id: 'fear_5', text: 'Do something that makes you feel grounded', category: 'activity' }
  ],
  'Frustration': [
    { id: 'frustration_1', text: 'Take a 5-minute break from the frustrating task', category: 'immediate' },
    { id: 'frustration_2', text: 'Try approaching the problem from a different angle', category: 'mindset' },
    { id: 'frustration_3', text: 'Do some quick physical movement', category: 'physical' },
    { id: 'frustration_4', text: 'Ask for help or a second opinion', category: 'social' },
    { id: 'frustration_5', text: 'Remind yourself of past challenges you\'ve overcome', category: 'mindset' }
  ],
  'Loneliness': [
    { id: 'loneliness_1', text: 'Reach out to a friend, even with a simple "hello"', category: 'social' },
    { id: 'loneliness_2', text: 'Join an online community or local group', category: 'social' },
    { id: 'loneliness_3', text: 'Practice self-compassion and self-care', category: 'mindset' },
    { id: 'loneliness_4', text: 'Volunteer for a cause you care about', category: 'activity' },
    { id: 'loneliness_5', text: 'Take yourself on a solo adventure', category: 'activity' }
  ],
  'Guilt': [
    { id: 'guilt_1', text: 'Acknowledge the mistake without harsh self-judgment', category: 'mindset' },
    { id: 'guilt_2', text: 'Make amends if possible and appropriate', category: 'social' },
    { id: 'guilt_3', text: 'Learn from the experience and plan differently next time', category: 'mindset' },
    { id: 'guilt_4', text: 'Practice self-forgiveness', category: 'mindset' },
    { id: 'guilt_5', text: 'Talk to someone you trust about your feelings', category: 'social' }
  ],
  'Shame': [
    { id: 'shame_1', text: 'Remember that you are worthy of love and respect', category: 'mindset' },
    { id: 'shame_2', text: 'Challenge negative self-talk with compassionate words', category: 'mindset' },
    { id: 'shame_3', text: 'Connect with someone who accepts you unconditionally', category: 'social' },
    { id: 'shame_4', text: 'Practice a self-care activity that brings you joy', category: 'activity' },
    { id: 'shame_5', text: 'Write yourself a letter of compassion', category: 'activity' }
  ],
  'Envy': [
    { id: 'envy_1', text: 'Focus on your own unique journey and progress', category: 'mindset' },
    { id: 'envy_2', text: 'Practice gratitude for what you have', category: 'mindset' },
    { id: 'envy_3', text: 'Use the feeling as motivation for your own goals', category: 'mindset' },
    { id: 'envy_4', text: 'Limit social media if it triggers comparison', category: 'immediate' },
    { id: 'envy_5', text: 'Celebrate others\' success genuinely', category: 'social' }
  ],
  'Boredom': [
    { id: 'boredom_1', text: 'Try learning something new for 10 minutes', category: 'activity' },
    { id: 'boredom_2', text: 'Do a creative activity like drawing or writing', category: 'activity' },
    { id: 'boredom_3', text: 'Organize or clean a small space', category: 'physical' },
    { id: 'boredom_4', text: 'Reach out to a friend you haven\'t talked to in a while', category: 'social' },
    { id: 'boredom_5', text: 'Go for a walk and observe your surroundings', category: 'physical' }
  ],
  'Confusion': [
    { id: 'confusion_1', text: 'Write down what you know vs. what you don\'t know', category: 'activity' },
    { id: 'confusion_2', text: 'Break the problem into smaller, clearer parts', category: 'mindset' },
    { id: 'confusion_3', text: 'Ask someone for clarification or guidance', category: 'social' },
    { id: 'confusion_4', text: 'Take a break and return with fresh perspective', category: 'immediate' },
    { id: 'confusion_5', text: 'Research or gather more information', category: 'activity' }
  ],
  // Positive emotions - fewer suggestions as they're already in good states
  'Joy': [
    { id: 'joy_1', text: 'Share your happiness with someone you care about', category: 'social' },
    { id: 'joy_2', text: 'Take a moment to savor and appreciate this feeling', category: 'mindset' },
    { id: 'joy_3', text: 'Do something creative to express your joy', category: 'activity' }
  ],
  'Excitement': [
    { id: 'excitement_1', text: 'Channel your energy into something productive', category: 'activity' },
    { id: 'excitement_2', text: 'Share your excitement with friends or family', category: 'social' },
    { id: 'excitement_3', text: 'Plan how to make the most of this positive energy', category: 'mindset' }
  ],
  'Hope': [
    { id: 'hope_1', text: 'Write down your hopes and dreams', category: 'activity' },
    { id: 'hope_2', text: 'Take one small step toward your goal', category: 'activity' },
    { id: 'hope_3', text: 'Share your optimism with someone who needs encouragement', category: 'social' }
  ],
  'Love': [
    { id: 'love_1', text: 'Express your feelings to the person you love', category: 'social' },
    { id: 'love_2', text: 'Do something kind for someone you care about', category: 'social' },
    { id: 'love_3', text: 'Practice self-love and self-care', category: 'mindset' }
  ],
  'Pride': [
    { id: 'pride_1', text: 'Acknowledge your accomplishment and celebrate', category: 'mindset' },
    { id: 'pride_2', text: 'Share your success with supportive people', category: 'social' },
    { id: 'pride_3', text: 'Reflect on the hard work that led to this moment', category: 'mindset' }
  ],
  'Gratitude': [
    { id: 'gratitude_1', text: 'Write a thank-you note to someone who helped you', category: 'social' },
    { id: 'gratitude_2', text: 'Keep a gratitude journal', category: 'activity' },
    { id: 'gratitude_3', text: 'Pay it forward by helping someone else', category: 'social' }
  ],
  'Contentment': [
    { id: 'contentment_1', text: 'Enjoy this peaceful moment fully', category: 'mindset' },
    { id: 'contentment_2', text: 'Reflect on what brings you this sense of peace', category: 'mindset' },
    { id: 'contentment_3', text: 'Share this calm energy with others', category: 'social' }
  ],
  // Neutral emotions
  'Surprise': [
    { id: 'surprise_1', text: 'Take a moment to process what just happened', category: 'immediate' },
    { id: 'surprise_2', text: 'Embrace the unexpected and stay open-minded', category: 'mindset' },
    { id: 'surprise_3', text: 'Share the surprising news with someone', category: 'social' }
  ],
  'Disgust': [
    { id: 'disgust_1', text: 'Remove yourself from the unpleasant situation if possible', category: 'immediate' },
    { id: 'disgust_2', text: 'Focus on something pleasant to reset your mood', category: 'activity' },
    { id: 'disgust_3', text: 'Practice acceptance of things you cannot change', category: 'mindset' }
  ],
  'Other': [
    { id: 'other_1', text: 'Take a moment to identify and name your specific feeling', category: 'mindset' },
    { id: 'other_2', text: 'Practice mindfulness and observe your emotions', category: 'immediate' },
    { id: 'other_3', text: 'Talk to someone about what you\'re experiencing', category: 'social' }
  ]
}

// Define which emotions are considered negative and warrant suggestions
export const NEGATIVE_EMOTIONS: EmotionType[] = [
  'Sadness', 'Anger', 'Anxiety', 'Fear', 'Frustration', 'Loneliness', 
  'Guilt', 'Shame', 'Envy', 'Boredom', 'Confusion'
]

export function isNegativeEmotion(emotion: EmotionType): boolean {
  return NEGATIVE_EMOTIONS.includes(emotion)
}

export function getSuggestionsForEmotion(emotion: EmotionType): EmotionSuggestion[] {
  return EMOTION_SUGGESTIONS[emotion] || EMOTION_SUGGESTIONS['Other']
}

export function getRandomSuggestions(emotion: EmotionType, count: number = 4): EmotionSuggestion[] {
  const allSuggestions = getSuggestionsForEmotion(emotion)
  if (allSuggestions.length <= count) {
    return allSuggestions
  }
  
  // Randomly select suggestions
  const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}