'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()
  const { setUser, setSession } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = getSupabaseClient()
        
        // 获取OAuth回调后的session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          toast.error('Login failed')
          router.push('/')
          return
        }

        if (session?.user) {
          // 获取或创建用户profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile不存在，创建一个
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                user_name: session.user.user_metadata?.full_name || 
                          session.user.user_metadata?.name || 
                          session.user.email?.split('@')[0] || 
                          'user_' + Date.now()
              }])

            if (insertError) {
              console.error('Profile creation error:', insertError)
            }
          }

          // 设置用户状态
          const user = {
            id: session.user.id,
            email: session.user.email,
            user_name: profile?.user_name || 
                      session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      session.user.email?.split('@')[0] || 
                      'user_' + Date.now(),
            avatar_url: session.user.user_metadata?.avatar_url || profile?.avatar_url,
          }

          setUser(user)
          setSession(session)
          
          // 保存到localStorage
          localStorage.setItem('breezie_current_user', JSON.stringify(user))
          localStorage.setItem('breezie_session', JSON.stringify(session))

          toast.success('Login successful!')
          router.push('/')
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Login processing failed')
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router, setUser, setSession])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mb-4"></div>
        <p>Processing login...</p>
      </div>
    </div>
  )
}