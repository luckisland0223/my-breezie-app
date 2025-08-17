"use client";

import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  Target, 
  BookOpen, 
  Shield, 
  Lightbulb,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 心理学理论基础展示组件
export function PsychologyInfo() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 标题部分 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <Brain className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Breezie的科学基础
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          基于权威心理学理论，为您提供科学、专业的情绪健康支持
        </p>
      </motion.div>

      <Tabs defaultValue="theories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="theories">理论基础</TabsTrigger>
          <TabsTrigger value="classification">情绪分类</TabsTrigger>
          <TabsTrigger value="interventions">干预技术</TabsTrigger>
          <TabsTrigger value="safety">安全保障</TabsTrigger>
        </TabsList>

        {/* 理论基础 */}
        <TabsContent value="theories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6 text-purple-500" />
                    <CardTitle>Plutchik情绪轮理论</CardTitle>
                  </div>
                  <CardDescription>
                    Robert Plutchik (1980) 的情绪进化理论
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    八种基本情绪及其强度变化，为情绪识别和分类提供科学框架。
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { emotion: "喜悦", color: "bg-yellow-100 text-yellow-800" },
                      { emotion: "信任", color: "bg-green-100 text-green-800" },
                      { emotion: "恐惧", color: "bg-red-100 text-red-800" },
                      { emotion: "惊讶", color: "bg-orange-100 text-orange-800" },
                      { emotion: "悲伤", color: "bg-blue-100 text-blue-800" },
                      { emotion: "厌恶", color: "bg-purple-100 text-purple-800" },
                      { emotion: "愤怒", color: "bg-pink-100 text-pink-800" },
                      { emotion: "期待", color: "bg-indigo-100 text-indigo-800" }
                    ].map((item, index) => (
                      <Badge key={index} className={`${item.color} text-xs`}>
                        {item.emotion}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-blue-500" />
                    <CardTitle>认知行为疗法(CBT)</CardTitle>
                  </div>
                  <CardDescription>
                    Aaron Beck & Albert Ellis 的认知理论
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    通过识别和改变不合理的思维模式来改善情绪状态。
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">ABC模型：事件-信念-结果</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">认知扭曲识别与重构</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">行为激活与问题解决</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-red-500" />
                    <CardTitle>情绪调节理论</CardTitle>
                  </div>
                  <CardDescription>
                    James Gross 的情绪调节过程模型
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    系统性的情绪调节策略，帮助用户有效管理情绪体验。
                  </p>
                  <div className="space-y-2">
                    {[
                      "认知重评",
                      "正念接纳", 
                      "行为激活",
                      "问题解决"
                    ].map((strategy, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <CardTitle>积极心理学</CardTitle>
                  </div>
                  <CardDescription>
                    Martin Seligman 的PERMA幸福模型
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    关注优势、意义和幸福感的提升，促进心理健康的积极发展。
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "积极情绪", desc: "P - Positive Emotions" },
                      { label: "投入", desc: "E - Engagement" },
                      { label: "关系", desc: "R - Relationships" },
                      { label: "意义", desc: "M - Meaning" },
                      { label: "成就", desc: "A - Achievement" }
                    ].map((item, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-gray-500 ml-2">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* 情绪分类 */}
        <TabsContent value="classification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-500" />
                <span>科学的情绪分类体系</span>
              </CardTitle>
              <CardDescription>
                基于Plutchik情绪轮理论的多维度情绪识别系统
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    category: "喜悦族群",
                    color: "border-yellow-200 bg-yellow-50",
                    emotions: ["狂喜", "喜悦", "宁静", "兴高采烈", "愉快", "满足"],
                    icon: "😊"
                  },
                  {
                    category: "信任族群", 
                    color: "border-green-200 bg-green-50",
                    emotions: ["钦佩", "信任", "接纳", "自信", "安全感", "感恩"],
                    icon: "🤝"
                  },
                  {
                    category: "恐惧族群",
                    color: "border-red-200 bg-red-50", 
                    emotions: ["恐怖", "恐惧", "忧虑", "焦虑", "紧张", "担心"],
                    icon: "😨"
                  },
                  {
                    category: "惊讶族群",
                    color: "border-orange-200 bg-orange-50",
                    emotions: ["惊奇", "惊讶", "分心", "困惑", "好奇", "着迷"], 
                    icon: "😲"
                  },
                  {
                    category: "悲伤族群",
                    color: "border-blue-200 bg-blue-50",
                    emotions: ["悲痛", "悲伤", "忧郁", "孤独", "失望", "忧伤"],
                    icon: "😢"
                  },
                  {
                    category: "厌恶族群",
                    color: "border-purple-200 bg-purple-50",
                    emotions: ["厌恶", "反感", "无聊", "轻蔑", "烦恼", "排斥"],
                    icon: "😒"
                  },
                  {
                    category: "愤怒族群", 
                    color: "border-pink-200 bg-pink-50",
                    emotions: ["暴怒", "愤怒", "恼怒", "沮丧", "烦躁", "怨恨"],
                    icon: "😠"
                  },
                  {
                    category: "期待族群",
                    color: "border-indigo-200 bg-indigo-50",
                    emotions: ["警觉", "期待", "兴趣", "兴奋", "充满希望", "渴望"],
                    icon: "🤗"
                  }
                ].map((group, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 ${group.color}`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-2xl">{group.icon}</span>
                      <h3 className="font-semibold text-sm">{group.category}</h3>
                    </div>
                    <div className="space-y-1">
                      {group.emotions.map((emotion, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs mr-1 mb-1">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 干预技术 */}
        <TabsContent value="interventions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "认知重构技术",
                icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
                description: "识别和改变不合理的思维模式",
                techniques: [
                  "ABC模型分析",
                  "认知扭曲识别",
                  "苏格拉底式提问",
                  "证据检验法"
                ]
              },
              {
                title: "情绪调节策略", 
                icon: <Heart className="w-6 h-6 text-red-500" />,
                description: "科学的情绪管理和调节方法",
                techniques: [
                  "认知重评",
                  "正念接纳",
                  "行为激活",
                  "问题解决"
                ]
              },
              {
                title: "放松技术",
                icon: <Brain className="w-6 h-6 text-blue-500" />,
                description: "基于生理心理学的放松方法",
                techniques: [
                  "腹式呼吸法",
                  "渐进性肌肉放松",
                  "5-4-3-2-1接地技术",
                  "正念冥想"
                ]
              },
              {
                title: "积极心理学干预",
                icon: <TrendingUp className="w-6 h-6 text-green-500" />,
                description: "提升幸福感和心理韧性",
                techniques: [
                  "感恩练习",
                  "优势识别",
                  "意义建构",
                  "社交连接"
                ]
              }
            ].map((intervention, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {intervention.icon}
                      <CardTitle className="text-lg">{intervention.title}</CardTitle>
                    </div>
                    <CardDescription>{intervention.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {intervention.techniques.map((technique, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{technique}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* 安全保障 */}
        <TabsContent value="safety" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-green-500" />
                    <CardTitle>专业边界与伦理</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">明确角色定位</h4>
                        <p className="text-xs text-gray-600">AI助手，不替代专业心理治疗</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">保密性保护</h4>
                        <p className="text-xs text-gray-600">所有对话本地存储，保护隐私</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">非评判态度</h4>
                        <p className="text-xs text-gray-600">接纳所有情绪，提供安全空间</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    <CardTitle>危机识别与处理</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">风险信号识别</h4>
                        <p className="text-xs text-gray-600">自伤、自杀想法的及时识别</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">专业资源连接</h4>
                        <p className="text-xs text-gray-600">引导用户寻求专业帮助</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Heart className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">持续支持</h4>
                        <p className="text-xs text-gray-600">在专业治疗过程中提供补充支持</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-500" />
                <span>专业资源</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">危机干预热线</h4>
                  <div className="text-xs space-y-1">
                    <p>全国心理危机干预热线</p>
                    <p className="font-mono">400-161-9995</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">何时寻求专业帮助</h4>
                  <div className="text-xs space-y-1">
                    <p>• 持续的功能障碍</p>
                    <p>• 严重的情绪困扰</p>
                    <p>• 自伤或自杀想法</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">专业治疗类型</h4>
                  <div className="text-xs space-y-1">
                    <p>• 心理咨询师</p>
                    <p>• 临床心理学家</p>
                    <p>• 精神科医生</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
