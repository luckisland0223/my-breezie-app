import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Basic username validation
    if (username.length < 2) {
      return NextResponse.json(
        { available: false, error: 'Username must be at least 2 characters long' },
        { status: 200 }
      )
    }

    if (username.length > 30) {
      return NextResponse.json(
        { available: false, error: 'Username must be less than 30 characters' },
        { status: 200 }
      )
    }

    // Only allow letters, numbers, underscores and hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 200 }
      )
    }

    const supabase = getSupabaseClient()

    // Check if username exists
    const { data, error } = await supabase
      .from('profiles')
      .select('user_name')
      .eq('user_name', username)
      .maybeSingle()

    if (error) {
      console.error('Username check error:', error)
      return NextResponse.json(
        { error: 'Failed to check username availability' },
        { status: 500 }
      )
    }

    const available = !data
    return NextResponse.json({
      available,
      message: available ? 'Username is available' : 'Username is already taken'
    })

  } catch (error) {
    console.error('Check username API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}