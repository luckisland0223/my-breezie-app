// 自然语言响应系统 - 让Breezie的回复更加多样化和人性化

// 情感响应模板
export const EMOTIONAL_RESPONSES = {
  // 开心情绪的响应
  happy: {
    acknowledgment: [
      "哇，听起来你心情很不错呢！",
      "太好了！我也替你开心！",
      "看到你这么开心，我也跟着高兴起来了",
      "这真是个好消息！",
      "你的快乐真的很有感染力呢"
    ],
    followUp: [
      "是什么让你这么开心的？",
      "能跟我分享一下是什么好事吗？",
      "这种快乐的感觉是不是特别棒？",
      "你想把这份快乐保持下去吗？"
    ],
    encouragement: [
      "希望你能一直保持这种好心情！",
      "记住这种感觉，它会是你前进的动力",
      "快乐的时光总是值得珍惜的",
      "你值得拥有所有的快乐"
    ]
  },

  // 悲伤情绪的响应
  sad: {
    acknowledgment: [
      "我能感受到你现在很难过...",
      "听起来你现在很不好受，我陪着你",
      "这确实很让人难过，我理解你的感受",
      "你现在的心情我完全能理解",
      "难过的时候有人陪伴总是好的，我在这里"
    ],
    validation: [
      "难过是很正常的情绪，不要觉得不好意思",
      "每个人都会有低落的时候，这不是你的错",
      "允许自己难过一会儿，这是人之常情",
      "你的感受都是真实有效的"
    ],
    comfort: [
      "虽然现在很难过，但这种感觉会慢慢过去的",
      "我会一直陪在你身边，直到你感觉好一些",
      "你比自己想象的要坚强",
      "给自己一些时间，慢慢来就好"
    ],
    support: [
      "想聊聊是什么让你这么难过吗？",
      "有什么我可以帮你的吗？",
      "要不要试试深呼吸，我陪你一起？",
      "有时候说出来会好受一些"
    ]
  },

  // 焦虑情绪的响应
  anxious: {
    acknowledgment: [
      "我能感觉到你现在有些紧张...",
      "焦虑的感觉确实不好受",
      "你现在是不是感觉心跳有点快？",
      "这种不安的感觉我很理解"
    ],
    immediate: [
      "先深呼吸一下，我们慢慢来",
      "现在试着放松一下肩膀，别那么紧张",
      "把注意力放在呼吸上，吸气...呼气...",
      "你现在是安全的，我陪着你"
    ],
    grounding: [
      "看看周围，告诉我你能看到什么？",
      "感受一下脚踏在地面上的感觉",
      "试着专注于当下这一刻",
      "你现在在哪里？周围是什么样子的？"
    ],
    reassurance: [
      "这种感觉会过去的，你以前也克服过",
      "你比焦虑更强大",
      "一步一步来，不用着急",
      "我们一起面对，你不是一个人"
    ]
  },

  // 愤怒情绪的响应
  angry: {
    acknowledgment: [
      "我能感受到你现在很生气",
      "这种愤怒的感觉一定很难受",
      "看起来有什么事情真的让你很火大",
      "生气是很正常的，每个人都会有这种时候"
    ],
    validation: [
      "你有权利感到愤怒",
      "这种情况确实让人很恼火",
      "你的愤怒是可以理解的",
      "有些事情确实值得生气"
    ],
    calming: [
      "先停下来，深呼吸几次",
      "愤怒的时候很容易冲动，我们先冷静一下",
      "试着放松拳头，释放一些紧张",
      "给自己几分钟时间平复一下"
    ],
    exploration: [
      "是什么让你这么生气的？",
      "这种愤怒背后是不是还有其他感受？",
      "你觉得什么样的解决方式会比较好？",
      "想聊聊具体发生了什么吗？"
    ]
  },

  // 困惑情绪的响应
  confused: {
    acknowledgment: [
      "看起来你现在有些困惑",
      "这种不知道该怎么办的感觉我懂",
      "面对复杂的情况确实容易让人迷茫",
      "困惑的时候想要找到答案是很自然的"
    ],
    clarity: [
      "我们一起理一理思路吧",
      "有时候把问题说出来会更清楚",
      "让我们从最重要的部分开始",
      "一步一步分析，会找到方向的"
    ],
    support: [
      "不用急着找到所有答案",
      "困惑也是成长过程的一部分",
      "我们可以慢慢探索",
      "有我陪你一起想办法"
    ]
  }
};

// 过渡性短语，让对话更自然
export const TRANSITION_PHRASES = [
  "说到这个...",
  "对了...",
  "你知道吗...",
  "我想起来...",
  "顺便问一下...",
  "换个话题...",
  "这让我想到...",
  "不过呢...",
  "话说回来...",
  "其实...",
  "说实话...",
  "我觉得...",
  "在我看来...",
  "如果我没理解错的话...",
  "让我想想..."
];

// 表示理解和共鸣的短语
export const EMPATHY_PHRASES = [
  "我完全理解你的感受",
  "这确实不容易",
  "我能想象你现在的心情",
  "换作是我也会这样想",
  "你的感受很真实",
  "这种情况下有这样的反应很正常",
  "我听到了你内心的声音",
  "你并不孤单",
  "很多人都经历过类似的事情",
  "你的想法很有道理"
];

// 鼓励性短语
export const ENCOURAGEMENT_PHRASES = [
  "你已经做得很好了",
  "你比自己想象的要坚强",
  "这一步很勇敢",
  "我为你感到骄傲",
  "你有能力处理这个问题",
  "相信你自己",
  "你已经走了这么远",
  "每一小步都是进步",
  "你的努力我都看在眼里",
  "你值得拥有美好的事物"
];

// 口语化的连接词
export const CASUAL_CONNECTORS = [
  "然后呢",
  "接下来",
  "所以说",
  "这样的话",
  "那么",
  "总之",
  "反正",
  "不管怎么说",
  "无论如何",
  "话说"
];

// 个人化的表达方式
export const PERSONAL_EXPRESSIONS = {
  sharing: [
    "我有个朋友也遇到过类似的情况...",
    "我记得有一次...",
    "说起这个，我想到...",
    "我以前也有过这种感觉...",
    "这让我想起了一个故事...",
    "我见过很多人都...",
    "从我的经验来看...",
    "我觉得可能是因为..."
  ],
  
  suggestions: [
    "你可以试试这个方法...",
    "也许这样会好一些...",
    "我建议你...",
    "不如我们这样试试看...",
    "有个小技巧可能会帮到你...",
    "我觉得这样做可能会有用...",
    "要不要考虑一下...",
    "你觉得这个想法怎么样..."
  ],

  checking: [
    "你觉得呢？",
    "我说得对吗？",
    "这样说有道理吗？",
    "你同意吗？",
    "感觉怎么样？",
    "这对你有帮助吗？",
    "你明白我的意思吗？",
    "听起来合理吗？"
  ]
};

// 根据情绪生成自然响应
export function generateNaturalResponse(emotion: string, context?: string): string {
  const responses = EMOTIONAL_RESPONSES[emotion as keyof typeof EMOTIONAL_RESPONSES];
  if (!responses) {
    return "我能感受到你现在的情绪，想聊聊吗？";
  }

  const parts = [];
  
  // 添加确认/理解部分
  if (responses.acknowledgment) {
    const randomAck = responses.acknowledgment[Math.floor(Math.random() * responses.acknowledgment.length)];
    parts.push(randomAck);
  }

  // 根据情绪类型添加特定响应
  if (emotion === 'sad' && responses.comfort) {
    const randomComfort = responses.comfort[Math.floor(Math.random() * responses.comfort.length)];
    parts.push(randomComfort);
  } else if (emotion === 'anxious' && responses.immediate) {
    const randomImmediate = responses.immediate[Math.floor(Math.random() * responses.immediate.length)];
    parts.push(randomImmediate);
  } else if (emotion === 'angry' && responses.calming) {
    const randomCalming = responses.calming[Math.floor(Math.random() * responses.calming.length)];
    parts.push(randomCalming);
  }

  // 添加后续问题或支持
  const followUpSections = ['followUp', 'support', 'exploration'];
  const availableSection = followUpSections.find(section => responses[section as keyof typeof responses]);
  
  if (availableSection) {
    const sectionResponses = responses[availableSection as keyof typeof responses] as string[];
    const randomFollowUp = sectionResponses[Math.floor(Math.random() * sectionResponses.length)];
    parts.push(randomFollowUp);
  }

  return parts.join(' ');
}

// 添加自然的过渡和个性化表达
export function addPersonalTouch(response: string, userContext?: any): string {
  const enhanced = [];
  
  // 随机添加过渡短语
  if (Math.random() < 0.3) {
    const transition = TRANSITION_PHRASES[Math.floor(Math.random() * TRANSITION_PHRASES.length)];
    enhanced.push(transition);
  }
  
  enhanced.push(response);
  
  // 随机添加检查理解的短语
  if (Math.random() < 0.4) {
    const checking = PERSONAL_EXPRESSIONS.checking[Math.floor(Math.random() * PERSONAL_EXPRESSIONS.checking.length)];
    enhanced.push(checking);
  }
  
  return enhanced.join(' ');
}

// 生成个性化的建议
export function generatePersonalizedSuggestion(emotion: string, previousSuggestions: string[] = []): string {
  const suggestionStarters = PERSONAL_EXPRESSIONS.suggestions;
  const starter = suggestionStarters[Math.floor(Math.random() * suggestionStarters.length)];
  
  // 根据情绪类型生成具体建议
  const suggestions = {
    anxious: [
      "深呼吸几次，专注于呼气时的放松感",
      "试着做一些轻松的事情，比如听听音乐",
      "把注意力转移到当下能看到的具体事物上",
      "给自己一些温柔的自我对话"
    ],
    sad: [
      "允许自己哭一会儿，这是很正常的",
      "做一些平时喜欢的小事情",
      "和信任的朋友聊聊天",
      "写下现在的感受，有时候表达出来会好一些"
    ],
    angry: [
      "先离开让你生气的环境，给自己一些空间",
      "做一些运动来释放这些能量",
      "写下你的愤怒，然后撕掉纸张",
      "想想这件事一年后还会重要吗"
    ],
    confused: [
      "把所有的想法都写下来，可能会更清楚",
      "和朋友聊聊，有时候外人的视角很有帮助",
      "给自己一些时间，不用急着做决定",
      "先处理最紧急的部分，其他的慢慢来"
    ]
  };
  
  const emotionSuggestions = suggestions[emotion as keyof typeof suggestions] || suggestions.confused;
  
  // 避免重复之前的建议
  const availableSuggestions = emotionSuggestions.filter(s => !previousSuggestions.includes(s));
  const suggestion = availableSuggestions.length > 0 
    ? availableSuggestions[Math.floor(Math.random() * availableSuggestions.length)]
    : emotionSuggestions[Math.floor(Math.random() * emotionSuggestions.length)];
  
  return `${starter}${suggestion}`;
}

// 生成情感共鸣的回应
export function generateEmpathyResponse(): string {
  const empathy = EMPATHY_PHRASES[Math.floor(Math.random() * EMPATHY_PHRASES.length)];
  const encouragement = ENCOURAGEMENT_PHRASES[Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)];
  
  if (Math.random() < 0.6) {
    return empathy;
  } else {
    return `${empathy}。${encouragement}`;
  }
}

// 生成自然的结束语
export function generateNaturalClosing(emotion: string): string {
  const closings = {
    supportive: [
      "我会一直在这里陪着你",
      "有什么需要随时告诉我",
      "你不是一个人在面对这些",
      "记住，我永远支持你"
    ],
    encouraging: [
      "相信你能处理好这件事",
      "你已经很棒了",
      "为你的勇敢感到骄傲",
      "你值得拥有美好的事物"
    ],
    gentle: [
      "慢慢来，不用着急",
      "给自己一些时间",
      "一步一步来就好",
      "你已经做得很好了"
    ]
  };
  
  let closingType = 'supportive';
  if (emotion === 'happy' || emotion === 'confident') {
    closingType = 'encouraging';
  } else if (emotion === 'anxious' || emotion === 'overwhelmed') {
    closingType = 'gentle';
  }
  
  const selectedClosings = closings[closingType as keyof typeof closings];
  return selectedClosings[Math.floor(Math.random() * selectedClosings.length)];
}
