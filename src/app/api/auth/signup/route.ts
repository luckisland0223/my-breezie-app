import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { email, password, userName } = await request.json()

    if (!email || !password || !userName) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      )
    }

    // 用户名验证
    if (userName.length < 2 || userName.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 2 and 30 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(userName)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // 检查用户名是否已存在
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_name')
      .eq('user_name', userName)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // 创建用户账户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: userName,
        }
      }
    })

    if (authError) {
      console.error('Signup error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_name: userName,
      },
      session: authData.session
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}