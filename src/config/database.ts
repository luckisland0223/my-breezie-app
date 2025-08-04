// 数据库配置文件
// 用户可以直接在这里设置Supabase配置，避免手动配置步骤

export interface DatabaseConfig {
  url: string
  anonKey: string
  isConfigured: boolean
}

// 🔧 在这里直接配置您的Supabase设置
// 替换下面的值为您的实际Supabase项目信息
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  // 📝 您的Supabase项目URL
  url: 'https://bfxbqhohgdovkfveafpj.supabase.co',
  
  // 📝 您的Supabase anon public 密钥
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeGJxaG9oZ2RvdmtmdmVhZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzI5NTQsImV4cCI6MjA2OTc0ODk1NH0.ys6UGsVQ44DEsiwnm16_8IKlMVrZLrfLMU7t58qbBGE',
  
  // ✅ 配置已完成，启用数据库连接
  isConfigured: true
}

// 🎯 快速配置示例
// 将您的Supabase信息复制到这里：
export const QUICK_SETUP_EXAMPLE = {
  // 示例 URL 格式：
  url: 'https://abcdefghijk.supabase.co',
  
  // 示例 API Key 格式（这是假的密钥，请使用您自己的）：
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5NzE2MDAsImV4cCI6MTk4NTU0NzYwMH0.example'
}

// 🚀 一键配置功能
export const getDbConfig = (): DatabaseConfig => {
  // 如果用户已经在上面配置了，使用用户配置
  if (DEFAULT_DATABASE_CONFIG.isConfigured && 
      DEFAULT_DATABASE_CONFIG.url !== 'https://your-project-id.supabase.co') {
    return DEFAULT_DATABASE_CONFIG
  }
  
  // 否则从localStorage获取（保持原有的配置功能）
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('supabase-config')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.config?.isConfigured) {
          return parsed.config
        }
      }
    } catch (error) {
      console.warn('Failed to load stored database config:', error)
    }
  }
  
  // 返回默认未配置状态
  return {
    url: '',
    anonKey: '',
    isConfigured: false
  }
}

// 验证配置是否完整
export const validateDbConfig = (config: DatabaseConfig): boolean => {
  return !!(
    config.url && 
    config.anonKey && 
    config.url.includes('supabase.co') &&
    config.anonKey.length > 50 // 基本的密钥长度检查
  )
}