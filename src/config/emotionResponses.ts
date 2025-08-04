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
  'Anxiety': [
    "I understand you're feeling anxious. This is a very common and natural response.",
    "Anxiety can feel overwhelming, but remember you're not alone. I'm here with you.",
    "When anxiety rises, try focusing on your breathing. Take slow, deep breaths.",
    "Anxiety often signals that something matters to us. What's on your mind?",
    "You're brave for acknowledging these anxious feelings. Let's work through this together.",
    "What would help you feel more grounded right now?"
  ],
  'Love': [
    "Love is one of life's most beautiful emotions. I can feel the warmth in your words.",
    "The love you're experiencing is precious. Tell me more about what brings you this feeling.",
    "Love connects us to what matters most. This feeling is truly special.",
    "Your capacity for love shows your beautiful heart. Cherish this emotion.",
    "Love has the power to transform and heal. How is this love changing you?",
    "This love you feel - it's a gift to both you and those around you."
  ],
  'Pride': [
    "I can sense your pride, and you have every right to feel this way!",
    "Pride in your accomplishments is healthy and well-deserved. Celebrate yourself!",
    "This feeling of pride shows your growth and achievements. You should be proud!",
    "Pride can be a powerful motivator. What achievement is bringing you this feeling?",
    "Your pride reflects your hard work and dedication. This is beautiful to witness.",
    "Take a moment to really savor this pride - you've earned it!"
  ],
  'Shame': [
    "Shame can be incredibly difficult to carry. You're brave for acknowledging it.",
    "Remember that making mistakes is part of being human. You're not alone in this.",
    "Shame often teaches us about our values, even when it's painful.",
    "This feeling of shame shows your conscience and desire to do better.",
    "Let's work together to transform this shame into learning and growth.",
    "What would self-compassion look like for you right now?"
  ],
  'Envy': [
    "Envy is a very human emotion that shows us what we value or desire.",
    "Feeling envious can be uncomfortable, but it also reveals our aspirations.",
    "Envy can actually guide us toward our own goals and dreams.",
    "These feelings of envy are understandable. What do they tell you about what you want?",
    "Let's explore what this envy is teaching you about your own desires.",
    "How might we channel these envious feelings into positive action?"
  ],
  'Guilt': [
    "Guilt shows your moral compass and desire to do right. This is actually a positive trait.",
    "Feeling guilty means you care about your impact on others. That's meaningful.",
    "Guilt can be a teacher, helping us learn and grow from our experiences.",
    "This guilt you're feeling - what is it trying to tell you?",
    "Let's explore how to transform this guilt into positive action and self-forgiveness.",
    "Your guilt shows your empathy and conscientiousness. These are beautiful qualities."
  ],
  'Hope': [
    "Hope is such a powerful and beautiful emotion. I can feel your optimism!",
    "Hope lights the way forward even in difficult times. This feeling is precious.",
    "Your hope shows incredible resilience and strength. Hold onto this feeling.",
    "Hope is the foundation of positive change. What are you hoping for?",
    "This hope you feel - it's a gift that can carry you through anything.",
    "Hope creates possibilities. Tell me more about what's inspiring this feeling."
  ],
  'Excitement': [
    "Your excitement is contagious! I love feeling this energy with you!",
    "Excitement brings such wonderful energy to life. What has you feeling this way?",
    "This excitement shows your enthusiasm for life. It's beautiful to witness!",
    "Excitement is like fuel for the soul. Enjoy every moment of this feeling!",
    "Your excitement lights up everything around you. What's creating this amazing feeling?",
    "This excitement you feel - let it inspire and motivate you forward!"
  ],
  'Boredom': [
    "Boredom can actually be a signal that you're ready for something new or different.",
    "Sometimes boredom is our mind's way of telling us we need a change or challenge.",
    "Boredom can be an opportunity for creativity and self-reflection.",
    "This feeling of boredom - what might it be telling you about what you need?",
    "Let's explore what could bring more engagement and interest into your life.",
    "Boredom sometimes precedes breakthrough moments. What's stirring within you?"
  ],
  'Confusion': [
    "Confusion is often the first step toward clarity. This feeling is completely normal.",
    "When we're confused, it usually means we're processing something complex and important.",
    "Confusion shows that you're thinking deeply about something. That's valuable.",
    "Let's work together to untangle these confusing thoughts and feelings.",
    "Confusion often precedes understanding. What's puzzling you right now?",
    "Sometimes confusion is our mind's way of preparing for new insights."
  ],
  'Gratitude': [
    "Gratitude is one of the most healing and transformative emotions. This is beautiful.",
    "Your gratitude shows a heart that recognizes life's gifts. This is so meaningful.",
    "Gratitude has the power to shift our entire perspective. What are you grateful for?",
    "This feeling of gratitude is precious - it connects you to what truly matters.",
    "Gratitude multiplies joy and creates more reasons to be thankful.",
    "Your grateful heart is a gift to both yourself and those around you."
  ],
  'Loneliness': [
    "Loneliness can feel so heavy. Please know that you're not alone - I'm here with you.",
    "Loneliness is a very human experience that connects us to our need for connection.",
    "Even in loneliness, remember that you have value and deserve companionship.",
    "This feeling of loneliness shows your capacity for connection and love.",
    "Let's explore ways to nurture connection and community in your life.",
    "Loneliness can be temporary, even when it feels overwhelming. You matter."
  ],
  'Frustration': [
    "Frustration often means we care deeply about something. Your feelings are valid.",
    "When frustrated, it's important to step back and breathe. I'm here to support you.",
    "Frustration can be a signal that we need to try a different approach.",
    "This frustration shows your determination and desire for progress.",
    "Let's work together to find constructive ways to channel this frustration.",
    "What's causing this frustration? Sometimes talking it through helps."
  ],
  'Contentment': [
    "Contentment is such a peaceful and valuable emotion. This feeling is precious.",
    "Your contentment shows a heart at peace. This is truly beautiful.",
    "Contentment is often overlooked, but it's one of life's greatest gifts.",
    "This feeling of contentment - savor it and let it nourish your soul.",
    "Contentment brings a deep satisfaction that external things can't provide.",
    "Your contentment is a testament to your inner wisdom and acceptance."
  ],
  'Other': [
    "I can sense you're experiencing something unique. Every emotion is valid and important.",
    "Sometimes our feelings are too complex or specific for simple labels. That's okay.",
    "Your emotional experience is unique to you. Would you like to share more about what you're feeling?",
    "Complex or unnamed emotions are part of the rich tapestry of human experience.",
    "Whatever you're feeling right now, I'm here to listen and understand.",
    "Let's explore together what you're experiencing. Your feelings matter."
  ]
}

// Get random response
export function getRandomResponse(emotion: EmotionType): string {
  const responses = emotionResponses[emotion]
  if (!responses || responses.length === 0) {
    return "I'm here with you, and your feelings are valid."
  }
  const randomIndex = Math.floor(Math.random() * responses.length)
  return responses[randomIndex] || responses[0] || "I'm here with you."
}