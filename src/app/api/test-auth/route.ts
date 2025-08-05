import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if we can get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return NextResponse.json({
        success: false,
        error: 'Auth check failed',
        details: authError.message,
        authenticated: false
      })
    }
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user',
        authenticated: false,
        message: 'Please sign in first'
      })
    }
    
    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile || null,
      profile_error: profileError?.message || null
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}