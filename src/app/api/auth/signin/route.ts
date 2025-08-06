import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('Signin attempt for email:', email)

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Creating Supabase client...')
    let supabase
    try {
      supabase = await createClient()
      console.log('Supabase client created successfully')
    } catch (clientError) {
      console.error('Failed to create Supabase client:', clientError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Check if the email exists in the profiles table
    console.log('Checking if email exists in profiles table...')
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, user_name')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (profileError) {
      console.error('Profile check error:', profileError)
      
      if (profileError.code === 'PGRST116') {
        // No rows returned - email not found in profiles
        console.log('Email not found in profiles table:', email)
        return NextResponse.json(
          { error: 'Account not found. This account may have been deleted.' },
          { status: 404 }
        )
      } else if (profileError.message?.includes('relation "public.profiles" does not exist')) {
        console.log('Profiles table does not exist, proceeding with authentication')
      } else {
        // Other database errors - could be permission issues
        console.log('Profile check failed with error, but proceeding with authentication:', profileError)
      }
    } else if (!existingProfile) {
      console.log('Email not found in profiles table:', email)
      return NextResponse.json(
        { error: 'Account not found. This account may have been deleted.' },
        { status: 404 }
      )
    } else {
      console.log('Email found in profiles table, proceeding with authentication')
    }

    // Proceed with authentication
    console.log('Attempting Supabase authentication for email:', email)
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    console.log('Authentication result:', {
      success: !authError,
      hasUser: !!authData?.user,
      hasSession: !!authData?.session,
      error: authError?.message || 'none'
    })

    if (authError) {
      console.error('Signin error details:', authError)
      
      // Handle specific authentication errors
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      } else if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please confirm your email address first' },
          { status: 401 }
        )
      } else {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get complete user profile information
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_name: profile?.user_name || authData.user.user_metadata?.user_name,
        avatar_url: profile?.avatar_url,
      },
      session: authData.session
    })

  } catch (error) {
    console.error('Signin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}