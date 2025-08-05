import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getDbConfig, validateDbConfig } from '@/config/database'
import { useSupabaseStore } from '@/store/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  // 首先尝试从配置文件获取
  const fileConfig = getDbConfig()
  let supabaseUrl = ''
  let supabaseAnonKey = ''
  
  if (validateDbConfig(fileConfig)) {
    supabaseUrl = fileConfig.url
    supabaseAnonKey = fileConfig.anonKey
  } else {
    // 否则尝试从store获取（如果在服务器环境中可用）
    try {
      const storeConfig = useSupabaseStore.getState().config
      if (storeConfig.isConfigured) {
        supabaseUrl = storeConfig.url
        supabaseAnonKey = storeConfig.anonKey
      }
    } catch (error) {
      // 在服务器环境中store可能不可用，这是正常的
    }
  }
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be configured in src/config/database.ts')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}