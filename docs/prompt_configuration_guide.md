# 📋 Prompt配置系统使用指南

## 🎯 **为生产级产品设计的配置管理系统**

基于用户明确的**"真实产品项目"**定位，已完成从演示级到生产级的全面架构升级。

---

## 📂 **配置文件结构**

```
src/config/prompts/
├── index.ts          # 🏠 配置管理中心
├── system.ts         # 🧠 系统基础prompt
├── examples.ts       # 💬 对话示例库  
├── emotions.ts       # 😊 情绪上下文配置
└── fallbacks.ts      # 🛡️ 错误处理回复
```

---

## 🔧 **如何修改Prompt**

### **1. 修改AI基础人格 (`system.ts`)**

```typescript
export const SYSTEM_PROMPT = {
  version: "1.0.0",
  core: `You are Breezie, a warm friend...`,  // 👈 修改基础人格
  
  keyTraits: [
    "You speak naturally...",  // 👈 添加/修改核心特质
    "You're genuinely curious..."
  ],
  
  conversationStyle: [
    "Speak like a caring friend...",  // 👈 调整对话风格
    "React authentically..."
  ]
}
```

**修改后自动生效**：无需重启，配置会在下个API调用时更新。

### **2. 添加对话示例 (`examples.ts`)**

```typescript
export const CONVERSATION_EXAMPLES = {
  naturalResponses: [
    {
      context: "新的场景描述",  // 👈 添加新示例
      example: "新的回复示例", 
      tone: "回应语调"
    }
  ],
  
  responsePatterns: {
    acknowledgment: [
      "新的确认短语"  // 👈 扩展回复模式
    ]
  }
}
```

### **3. 调整情绪处理 (`emotions.ts`)**

```typescript
export const EMOTION_CONTEXTS = {
  contexts: {
    'Anger': {
      description: "用户情绪描述",
      guidance: "AI处理指导",  // 👈 修改处理策略
      focusAreas: ["关注点1", "关注点2"]  // 👈 调整关注领域
    }
  }
}
```

### **4. 更新错误回复 (`fallbacks.ts`)**

```typescript
export const FALLBACK_RESPONSES = {
  apiError: [
    "新的API错误回复"  // 👈 添加更多fallback选项
  ],
  
  chatError: [
    "新的聊天错误回复"
  ]
}
```

---

## 🏗️ **高级配置功能**

### **1. 版本管理**

每个配置文件都有版本号：
```typescript
export const SYSTEM_PROMPT = {
  version: "1.0.0",  // 👈 更新版本号
  lastUpdated: "2025-01-27"  // 👈 更新日期
}
```

### **2. 配置验证**

系统启动时自动验证：
```typescript
// 在 index.ts 中
export function validatePromptConfig(): ConfigValidation {
  // 自动检查配置完整性
  // 报告错误和警告
}
```

### **3. 动态Prompt构造**

```typescript
// 智能组合所有配置
export function buildFullPrompt(
  userMessage: string,
  emotion: EmotionType,
  conversationHistory: Array<{role: 'user' | 'assistant' | 'system'; content: string}>
): string {
  // 自动组合: 系统prompt + 示例 + 情绪上下文 + 对话历史
}
```

---

## 🎛️ **API参数调优**

在 `index.ts` 中调整AI模型参数：

```typescript
export const API_CONFIG = {
  model: 'gemini-pro',
  maxTokens: 600,        // 👈 调整回复长度
  temperature: 0.9,       // 👈 调整创造性 (0-1)
  topP: 0.8,             // 👈 调整多样性 (0-1)  
  topK: 40               // 👈 调整词汇选择范围
} as const
```

**参数说明**：
- **temperature**: 越高越有创造性，但可能不太连贯
- **topP**: 控制回复的多样性
- **topK**: 控制词汇选择的丰富度
- **maxTokens**: 控制回复的最大长度

---

## 📊 **配置监控**

### **启动日志**
```
✅ Prompt configuration loaded successfully (v1.0.0)
❌ Prompt configuration validation failed: [errors]
⚠️  Prompt configuration warnings: [warnings]  
```

### **运行时信息**
```typescript
// 查看当前配置信息
console.log(PROMPT_INFO)
// 输出:
// {
//   version: "1.0.0",
//   components: {
//     system: "1.0.0",
//     examples: "1.0.0", 
//     emotions: "1.0.0",
//     fallbacks: "1.0.0"
//   }
// }
```

---

## 🚀 **最佳实践**

### **1. 配置修改流程**
1. **修改配置文件** → 
2. **测试构建** (`npm run build`) → 
3. **验证对话效果** → 
4. **更新版本号**

### **2. 回复质量优化**
- **添加更多示例**：在 `examples.ts` 中增加不同场景的回复示例
- **细化情绪处理**：在 `emotions.ts` 中为特定情绪添加更精准的指导
- **丰富fallback**：在 `fallbacks.ts` 中增加更多样化的错误回复

### **3. 性能考虑**
- 配置在启动时一次性加载，运行时无IO开销
- Prompt构造经过优化，支持高并发请求
- 类型安全确保配置错误在编译时发现

---

## 🎯 **实际使用效果**

### **配置前（硬编码）**：
```typescript
// 所有prompt都写死在代码里
const systemPrompt = `You are Breezie, a warm friend...` // 大段硬编码
```

### **配置后（生产级）**：
```typescript
// 使用配置化系统
const fullPrompt = buildFullPrompt(userMessage, emotion, conversationHistory)
// 自动组合所有配置，类型安全，版本管理
```

---

## 🛠️ **故障排除**

### **常见问题**：

1. **构建失败**：检查TypeScript类型是否匹配
2. **配置不生效**：确认版本号是否更新
3. **回复质量下降**：检查示例是否充足，情绪配置是否完整

### **调试工具**：
```typescript
// 验证配置
const validation = validatePromptConfig()
console.log(validation)  // 查看错误和警告

// 查看构造的prompt
const prompt = buildFullPrompt("test", "Joy", [])
console.log(prompt)  // 检查prompt组合结果
```

---

**🎉 现在你拥有了企业级的prompt配置管理系统，可以灵活调优AI的行为和回复质量！**