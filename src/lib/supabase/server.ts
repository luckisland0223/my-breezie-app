import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getDbConfig, validateDbConfig } from '@/config/database'
import { useSupabaseStore } from '@/store/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  // First try to get from config file
  const fileConfig = getDbConfig()
  let supabaseUrl = ''
  let supabaseAnonKey = ''
  
  if (validateDbConfig(fileConfig)) {
    supabaseUrl = fileConfig.url
    supabaseAnonKey = fileConfig.anonKey
  } else {
    // Otherwise try to get from store (if available in server environment)
    try {
      const storeConfig = useSupabaseStore.getState().config
      if (storeConfig.isConfigured) {
        supabaseUrl = storeConfig.url
        supabaseAnonKey = storeConfig.anonKey
      }
    } catch (error) {
      // Store may not be available in server environment, this is normal
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