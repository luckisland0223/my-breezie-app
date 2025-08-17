// 心理学理论框架和干预技术
// 为Breezie AI提供科学的心理学知识基础

/**
 * 认知行为疗法(CBT)核心概念
 * 基于Aaron Beck和Albert Ellis的理论
 */
export const CBT_FRAMEWORKS = {
  // ABC模型 (Albert Ellis的理性情绪行为疗法)
  ABC_MODEL: {
    name: "ABC模型",
    description: "分析情绪反应的认知模式",
    components: {
      A: { name: "Activating Event", label: "激发事件", description: "触发情绪的外部事件或情境" },
      B: { name: "Belief", label: "信念", description: "个体对事件的解释、评价和信念" },
      C: { name: "Consequence", label: "结果", description: "由信念产生的情绪和行为后果" }
    },
    intervention: "通过识别和改变不合理信念(B)来改善情绪结果(C)"
  },

  // 认知扭曲类型
  COGNITIVE_DISTORTIONS: {
    "all-or-nothing": { 
      name: "全有或全无思维", 
      description: "非黑即白的极端思维模式",
      example: "我要么完美，要么就是失败者",
      reframe: "成功和失败之间有很多灰色地带，进步比完美更重要"
    },
    "overgeneralization": {
      name: "过度概括",
      description: "从单一事件得出广泛结论",
      example: "这次失败说明我永远不会成功",
      reframe: "一次失败不能定义全部，每次经历都是学习机会"
    },
    "mental-filter": {
      name: "心理过滤",
      description: "只关注负面细节，忽略积极方面",
      example: "虽然收到了很多赞美，但只记得那一个批评",
      reframe: "尝试平衡地看待整体情况，积极和消极都是现实的一部分"
    },
    "catastrophizing": {
      name: "灾难化思维",
      description: "将问题想象得比实际更严重",
      example: "如果我搞砸了这次演讲，我的职业生涯就完了",
      reframe: "即使最坏的情况发生，我也有能力应对和恢复"
    },
    "emotional-reasoning": {
      name: "情绪推理",
      description: "基于感受而非事实做判断",
      example: "我感到愚蠢，所以我一定很愚蠢",
      reframe: "感受不等于事实，情绪会变化，但我的价值不变"
    },
    "should-statements": {
      name: "应该陈述",
      description: "对自己或他人设置不现实的期望",
      example: "我应该总是表现完美",
      reframe: "用'我希望'或'我更愿意'替代'应该'，允许不完美的存在"
    }
  }
} as const;

/**
 * 情绪调节策略
 * 基于James Gross的情绪调节理论
 */
export const EMOTION_REGULATION_STRATEGIES = {
  // 认知重评 (Cognitive Reappraisal)
  COGNITIVE_REAPPRAISAL: {
    name: "认知重评",
    description: "改变对情境的解释来调节情绪",
    techniques: [
      "重新框架：从不同角度看待问题",
      "寻找积极意义：在困难中找到成长机会",
      "时间视角：考虑这件事在一年后是否还重要",
      "他人视角：想象朋友遇到同样情况你会如何建议"
    ],
    适用情绪: ["焦虑", "愤怒", "失望", "沮丧"]
  },

  // 正念接纳 (Mindful Acceptance)
  MINDFUL_ACCEPTANCE: {
    name: "正念接纳",
    description: "不评判地观察和接纳当前的情绪体验",
    techniques: [
      "身体扫描：注意情绪在身体中的感受",
      "呼吸觉察：专注于呼吸来锚定注意力",
      "标记情绪：简单地识别和命名情绪",
      "观察者自我：将自己视为情绪的观察者而非被情绪控制"
    ],
    适用情绪: ["焦虑", "悲伤", "愤怒", "羞耻"]
  },

  // 行为激活 (Behavioral Activation)
  BEHAVIORAL_ACTIVATION: {
    name: "行为激活",
    description: "通过改变行为来影响情绪",
    techniques: [
      "愉悦活动安排：规划能带来满足感的活动",
      "成就活动：设定并完成小目标",
      "社交连接：主动与他人建立联系",
      "身体活动：运动来改善情绪状态"
    ],
    适用情绪: ["抑郁", "孤独", "无聊", "绝望"]
  },

  // 问题解决 (Problem Solving)
  PROBLEM_SOLVING: {
    name: "问题解决",
    description: "系统性地应对可控制的压力源",
    steps: [
      "问题定义：清楚地识别具体问题",
      "目标设定：明确想要达到的结果",
      "方案生成：头脑风暴多种解决方案",
      "方案评估：权衡各种选择的利弊",
      "实施计划：制定具体的行动步骤",
      "评估结果：检查解决方案的效果"
    ],
    适用情绪: ["压力", "焦虑", "沮丧", "不知所措"]
  }
} as const;

/**
 * 放松技术
 * 基于临床心理学实践
 */
export const RELAXATION_TECHNIQUES = {
  DEEP_BREATHING: {
    name: "腹式呼吸",
    description: "通过深度呼吸激活副交感神经系统",
    steps: [
      "找一个舒适的姿势，闭上眼睛",
      "一只手放在胸部，一只手放在腹部",
      "缓慢吸气4秒，感受腹部上升",
      "屏住呼吸4秒",
      "缓慢呼气6秒，感受腹部下降",
      "重复5-10次"
    ],
    duration: "5-10分钟",
    benefits: ["降低焦虑", "减少压力", "改善专注力"]
  },

  PROGRESSIVE_MUSCLE_RELAXATION: {
    name: "渐进性肌肉放松",
    description: "通过紧张和放松肌肉群来释放身体压力",
    steps: [
      "从脚趾开始，紧张肌肉5秒",
      "突然放松，感受放松的感觉",
      "逐步向上：小腿、大腿、臀部、腹部、胸部、手臂、肩膀、颈部、面部",
      "每个肌肉群重复紧张-放松循环",
      "最后全身放松2-3分钟"
    ],
    duration: "15-20分钟",
    benefits: ["减少肌肉紧张", "改善睡眠", "降低整体压力水平"]
  },

  GROUNDING_5_4_3_2_1: {
    name: "5-4-3-2-1接地技术",
    description: "通过感官觉察回到当下，缓解焦虑",
    steps: [
      "5样你能看到的东西",
      "4样你能触摸到的东西",
      "3样你能听到的声音",
      "2样你能闻到的气味",
      "1样你能尝到的味道"
    ],
    duration: "3-5分钟",
    benefits: ["快速缓解焦虑", "重新专注当下", "中断恐慌循环"]
  }
} as const;

/**
 * 积极心理学干预
 * 基于Martin Seligman的PERMA模型
 */
export const POSITIVE_PSYCHOLOGY_INTERVENTIONS = {
  PERMA_MODEL: {
    name: "PERMA幸福模型",
    components: {
      P: { name: "Positive Emotions", label: "积极情绪", description: "培养喜悦、感恩、希望等积极情绪" },
      E: { name: "Engagement", label: "投入", description: "发现并运用个人优势，体验心流状态" },
      R: { name: "Relationships", label: "关系", description: "建立和维护积极的人际关系" },
      M: { name: "Meaning", label: "意义", description: "寻找生活的目的和意义" },
      A: { name: "Achievement", label: "成就", description: "设定并达成有意义的目标" }
    }
  },

  GRATITUDE_PRACTICES: {
    name: "感恩练习",
    techniques: [
      "感恩日记：每天记录3件感恩的事",
      "感恩信：给对你有帮助的人写信",
      "感恩冥想：专注于生活中的美好",
      "感恩分享：与他人分享感恩的事情"
    ],
    benefits: ["提升幸福感", "改善人际关系", "增强心理韧性"]
  },

  STRENGTHS_IDENTIFICATION: {
    name: "优势识别",
    character_strengths: [
      "智慧与知识：创造力、好奇心、判断力、学习热情、洞察力",
      "勇气：勇敢、坚持、诚实、活力",
      "人道：爱、善良、社交智慧",
      "正义：团队合作、公平、领导力",
      "节制：宽恕、谦逊、审慎、自我调节",
      "超越：欣赏美、感恩、希望、幽默、灵性"
    ],
    application: "识别并在日常生活中运用个人优势"
  }
} as const;

/**
 * 危机识别和处理
 * 基于心理急救原则
 */
export const CRISIS_INDICATORS = {
  SUICIDE_RISK_FACTORS: [
    "明确表达自杀想法或计划",
    "感到绝望或无价值",
    "社交孤立和撤回",
    "极端的情绪波动",
    "睡眠和食欲的显著变化",
    "冲动和鲁莽行为",
    "整理个人事务"
  ],

  IMMEDIATE_RESPONSE: {
    assessment: "评估即时危险",
    support: "提供情感支持和验证",
    resources: "连接专业资源",
    safety_planning: "制定安全计划",
    follow_up: "安排后续支持"
  },

  PROFESSIONAL_RESOURCES: {
    crisis_hotlines: [
      "全国心理危机干预热线：400-161-9995",
      "北京危机干预热线：400-161-9995",
      "上海心理援助热线：021-64383562"
    ],
    when_to_refer: [
      "表达自杀或自伤想法",
      "严重的精神健康症状",
      "物质滥用问题",
      "创伤后应激反应",
      "持续的功能障碍"
    ]
  }
} as const;

/**
 * 根据情绪类型获取相应的干预策略
 */
export function getInterventionStrategies(emotion: string, intensity: string) {
  const strategies = [];

  // 基于情绪类型的策略推荐
  const emotionStrategies: Record<string, string[]> = {
    // 焦虑/恐惧族群
    anxiety: ["DEEP_BREATHING", "GROUNDING_5_4_3_2_1", "COGNITIVE_REAPPRAISAL"],
    fear: ["GROUNDING_5_4_3_2_1", "MINDFUL_ACCEPTANCE", "PROGRESSIVE_MUSCLE_RELAXATION"],
    worried: ["PROBLEM_SOLVING", "COGNITIVE_REAPPRAISAL", "DEEP_BREATHING"],
    
    // 悲伤族群
    sadness: ["BEHAVIORAL_ACTIVATION", "MINDFUL_ACCEPTANCE", "GRATITUDE_PRACTICES"],
    grief: ["MINDFUL_ACCEPTANCE", "BEHAVIORAL_ACTIVATION", "STRENGTHS_IDENTIFICATION"],
    lonely: ["BEHAVIORAL_ACTIVATION", "GRATITUDE_PRACTICES", "social_connection"],
    
    // 愤怒族群
    anger: ["DEEP_BREATHING", "COGNITIVE_REAPPRAISAL", "PROGRESSIVE_MUSCLE_RELAXATION"],
    frustrated: ["PROBLEM_SOLVING", "COGNITIVE_REAPPRAISAL", "BEHAVIORAL_ACTIVATION"],
    irritated: ["MINDFUL_ACCEPTANCE", "DEEP_BREATHING", "GROUNDING_5_4_3_2_1"],
    
    // 复合情绪
    overwhelmed: ["PROBLEM_SOLVING", "GROUNDING_5_4_3_2_1", "PROGRESSIVE_MUSCLE_RELAXATION"],
    guilty: ["COGNITIVE_REAPPRAISAL", "MINDFUL_ACCEPTANCE", "self_compassion"],
    shame: ["MINDFUL_ACCEPTANCE", "STRENGTHS_IDENTIFICATION", "COGNITIVE_REAPPRAISAL"]
  };

  return emotionStrategies[emotion] || ["MINDFUL_ACCEPTANCE", "DEEP_BREATHING", "COGNITIVE_REAPPRAISAL"];
}

/**
 * 获取认知重构的问题
 */
export function getCognitiveReframingQuestions(distortion: string) {
  const questions: Record<string, string[]> = {
    "all-or-nothing": [
      "这种情况真的只有两种极端结果吗？",
      "中间地带会是什么样的？",
      "如果朋友遇到同样情况，我会如何看待？"
    ],
    "catastrophizing": [
      "最可能发生的情况是什么？",
      "即使最坏的情况发生，我能如何应对？",
      "一年后回看，这件事会有多重要？"
    ],
    "overgeneralization": [
      "这个结论基于多少证据？",
      "有什么相反的证据吗？",
      "这次经历能代表所有情况吗？"
    ]
  };

  return questions[distortion] || [
    "这个想法有多现实？",
    "有什么证据支持或反对这个想法？",
    "有没有更平衡的看法？"
  ];
}
