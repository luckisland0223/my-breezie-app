// Database configuration file  
// Users can directly set Supabase configuration here to avoid manual setup steps

export interface DatabaseConfig {
  url: string
  anonKey: string
  isConfigured: boolean
}

// 🔧 Configure your Supabase settings directly here
// Replace the values below with your actual Supabase project information
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  // 📝 Your Supabase project URL
  url: 'https://bfxbqhohgdovkfveafpj.supabase.co',
  
  // 📝 Your Supabase anon public key
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmeGJxaG9oZ2RvdmtmdmVhZnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzI5NTQsImV4cCI6MjA2OTc0ODk1NH0.ys6UGsVQ44DEsiwnm16_8IKlMVrZLrfLMU7t58qbBGE',
  
  // ✅ Configuration completed, enable database connection
  isConfigured: true
}

// 🎯 Quick setup example
// Copy your Supabase information here:
export const QUICK_SETUP_EXAMPLE = {
  // Example URL format:
  url: 'https://abcdefghijk.supabase.co',
  
  // Example API Key format (this is a fake key, please use your own):
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5NzE2MDAsImV4cCI6MTk4NTU0NzYwMH0.example'
}

// 🚀 One-click configuration function
export const getDbConfig = (): DatabaseConfig => {
  // If user has configured above, use user configuration
  if (DEFAULT_DATABASE_CONFIG.isConfigured && 
      DEFAULT_DATABASE_CONFIG.url !== 'https://your-project-id.supabase.co') {
    return DEFAULT_DATABASE_CONFIG
  }
  
  // Otherwise get from localStorage (maintain original configuration functionality)
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
      // Failed to load stored database config
    }
  }
  
  // Return default unconfigured state
  return {
    url: '',
    anonKey: '',
    isConfigured: false
  }
}

// Validate if configuration is complete
export const validateDbConfig = (config: DatabaseConfig): boolean => {
  return !!(
    config.url && 
    config.anonKey && 
    config.url.includes('supabase.co') &&
    config.anonKey.length > 50 // Basic key length check
  )
}