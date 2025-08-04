import type { EmotionType } from '@/store/emotion'

// Emotion configuration with emojis and colors
export const emotionConfig: Record<EmotionType, {
  emoji: string
  color: string
  bgColor: string
  textColor: string
  description: string
}> = {
  'Anger': {
    emoji: '😠',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    textColor: 'text-red-700',
    description: 'Feeling angry or irritated'
  },
  'Disgust': {
    emoji: '🤢',
    color: '#059669',
    bgColor: '#D1FAE5',
    textColor: 'text-green-700',
    description: 'Feeling disgusted or repulsed'
  },
  'Fear': {
    emoji: '😰',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    textColor: 'text-purple-700',
    description: 'Feeling scared or anxious'
  },
  'Joy': {
    emoji: '😊',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: 'text-yellow-700',
    description: 'Feeling happy and joyful'
  },
  'Sadness': {
    emoji: '😢',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    textColor: 'text-blue-700',
    description: 'Feeling sad or down'
  },
  'Surprise': {
    emoji: '😲',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    textColor: 'text-pink-700',
    description: 'Feeling surprised or amazed'
  },
  'Anxiety': {
    emoji: '😟',
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
    textColor: 'text-violet-700',
    description: 'Feeling worried or anxious'
  },
  'Love': {
    emoji: '❤️',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    textColor: 'text-red-600',
    description: 'Feeling love or affection'
  },
  'Pride': {
    emoji: '😎',
    color: '#F97316',
    bgColor: '#FED7AA',
    textColor: 'text-orange-700',
    description: 'Feeling proud or accomplished'
  },
  'Shame': {
    emoji: '😳',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: 'text-gray-700',
    description: 'Feeling ashamed or embarrassed'
  },
  'Envy': {
    emoji: '😒',
    color: '#059669',
    bgColor: '#DCFCE7',
    textColor: 'text-green-600',
    description: 'Feeling envious or jealous'
  },
  'Guilt': {
    emoji: '😔',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    textColor: 'text-indigo-700',
    description: 'Feeling guilty or regretful'
  },
  'Hope': {
    emoji: '🌟',
    color: '#10B981',
    bgColor: '#D1FAE5',
    textColor: 'text-emerald-700',
    description: 'Feeling hopeful or optimistic'
  },
  'Excitement': {
    emoji: '🤩',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    textColor: 'text-amber-700',
    description: 'Feeling excited or enthusiastic'
  },
  'Boredom': {
    emoji: '😴',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    textColor: 'text-gray-600',
    description: 'Feeling bored or uninterested'
  },
  'Confusion': {
    emoji: '😕',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    textColor: 'text-violet-600',
    description: 'Feeling confused or uncertain'
  },
  'Gratitude': {
    emoji: '🙏',
    color: '#059669',
    bgColor: '#ECFDF5',
    textColor: 'text-green-600',
    description: 'Feeling grateful or thankful'
  },
  'Loneliness': {
    emoji: '😞',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    textColor: 'text-gray-600',
    description: 'Feeling lonely or isolated'
  },
  'Frustration': {
    emoji: '😤',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    textColor: 'text-red-600',
    description: 'Feeling frustrated or annoyed'
  },
  'Contentment': {
    emoji: '😌',
    color: '#10B981',
    bgColor: '#F0FDF4',
    textColor: 'text-emerald-600',
    description: 'Feeling content or satisfied'
  },
  'Other': {
    emoji: '🤔',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    textColor: 'text-gray-600',
    description: 'Other emotions not listed'
  }
}

// Helper function to get emotion display text with emoji
export function getEmotionDisplay(emotion: EmotionType): string {
  const config = emotionConfig[emotion]
  return `${config.emoji} ${emotion}`
}

// Helper function to get emotion emoji only
export function getEmotionEmoji(emotion: EmotionType): string {
  return emotionConfig[emotion].emoji
}

// Helper function to get emotion color
export function getEmotionColor(emotion: EmotionType): string {
  return emotionConfig[emotion].color
}

// Helper function to get emotion background color
export function getEmotionBgColor(emotion: EmotionType): string {
  return emotionConfig[emotion].bgColor
}

// Primary emotions for quick selection (most common)
export const primaryEmotions: EmotionType[] = [
  'Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Love', 'Anxiety', 'Excitement'
]

// Secondary emotions for extended selection
export const secondaryEmotions: EmotionType[] = [
  'Pride', 'Shame', 'Guilt', 'Hope', 'Frustration', 'Contentment', 'Loneliness', 'Boredom', 
  'Confusion', 'Gratitude', 'Envy', 'Disgust', 'Other'
]