import { createClient } from '@supabase/supabase-js'
import { useSupabaseStore } from '@/store/supabase'
import { getDbConfig, validateDbConfig } from '@/config/database'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  // First try to get from config file
  const fileConfig = getDbConfig()
  
  // If file config is available, use file config
  if (validateDbConfig(fileConfig)) {
    if (!supabaseClient) {
      supabaseClient = createClient(fileConfig.url, fileConfig.anonKey)
    }
    return supabaseClient
  }
  
  // Otherwise use store config (original method)
  const { config } = useSupabaseStore.getState()
  
  if (!config.isConfigured) {
    throw new Error('Supabase not configured. Please configure your Supabase URL and API Key in src/config/database.ts file or in the settings page.')
  }
  
  // Create new client if it doesn't exist or config changed
  if (!supabaseClient) {
    supabaseClient = createClient(config.url, config.anonKey)
  }
  
  return supabaseClient
}

// Reset client when configuration changes
export function resetSupabaseClient() {
  supabaseClient = null
}

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.from('profiles').select('count').limit(1)
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means table doesn't exist, which is acceptable
      throw error
    }
    
    return { success: true, message: 'Supabase connection successful!' }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Connection failed: ${error.message}` 
    }
  }
}