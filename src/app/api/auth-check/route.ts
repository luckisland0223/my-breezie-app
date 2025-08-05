import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 认证状态检查API - 开始检查...')
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('📊 认证状态详情:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasSession: !!session,
      sessionExpiry: session?.expires_at,
      authError: authError?.message,
      sessionError: sessionError?.message,
      cookies: request.headers.get('cookie') ? 'Present' : 'Missing',
      userAgent: request.headers.get('user-agent')?.slice(0, 50) + '...'
    })

    if (authError) {
      console.error('❌ 认证错误:', authError)
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        code: authError.status,
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    if (!user) {
      console.warn('⚠️ 没有找到用户信息')
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    if (!session) {
      console.warn('⚠️ 没有找到会话信息')
      return NextResponse.json({
        authenticated: false,
        error: 'No active session',
        timestamp: new Date().toISOString()
      }, { status: 401 })
    }

    // 检查会话是否即将过期（15分钟内）
    const now = Date.now() / 1000
    const expiresAt = session.expires_at || 0
    const timeToExpiry = expiresAt - now
    const isExpiringSoon = timeToExpiry < 900 // 15 minutes

    console.log('✅ 认证检查通过')
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        user_name: user.user_metadata?.user_name
      },
      session: {
        expires_at: session.expires_at,
        expires_in: timeToExpiry,
        expires_soon: isExpiringSoon
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('💥 认证检查API错误:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Authentication check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}