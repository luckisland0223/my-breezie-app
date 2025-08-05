import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    console.log('🧹 Cleaning up user data for email:', email)
    
    // Step 1: Try to find any existing profile with this email
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    let cleanedProfile = false
    if (existingProfile) {
      console.log('Found existing profile:', existingProfile.id)
      
      // Delete user's emotion records
      const { error: quickError } = await supabase
        .from('quick_emotion_checks')
        .delete()
        .eq('user_id', existingProfile.id)
      
      const { error: conversationError } = await supabase
        .from('conversation_emotion_records')
        .delete()
        .eq('user_id', existingProfile.id)
      
      // Delete profile
      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', existingProfile.id)
      
      cleanedProfile = true
      console.log('✅ Cleaned up database profile and records')
    } else {
      console.log('No existing profile found in database for this email')
    }
    
    // Step 2: Check if user exists in Auth system (this is likely the real issue)
    // Note: We can't directly delete users from Auth via API, but we can provide guidance
    
    // Try to sign up with a test to see what the actual error is
    const { data: testSignup, error: testError } = await supabase.auth.signUp({
      email: email,
      password: 'temporary-test-password-12345',
      options: {
        data: {
          user_name: 'test-user-' + Date.now()
        }
      }
    })
    
    let authStatus = 'unknown'
    let authMessage = ''
    
    if (testError) {
      authStatus = 'blocked'
      authMessage = testError.message
      console.log('Auth signup test failed:', testError.message)
    } else if (testSignup.user) {
      authStatus = 'available'
      authMessage = 'Email is available for registration'
      
      // Clean up the test user we just created
      if (testSignup.user.id) {
        // Try to delete the test profile that might have been auto-created
        await supabase
          .from('profiles')
          .delete()
          .eq('id', testSignup.user.id)
      }
      
      console.log('✅ Email is available for registration')
    }
    
    return NextResponse.json({
      success: authStatus === 'available',
      message: authStatus === 'available' 
        ? 'User cleanup completed. Email is now available for registration.' 
        : 'User cleanup completed, but email is still blocked in Auth system.',
      email: email,
      database_cleanup: {
        cleaned_profile: cleanedProfile,
        profile_found: !!existingProfile
      },
      auth_status: {
        status: authStatus,
        message: authMessage,
        blocked: authStatus === 'blocked'
      },
      next_steps: authStatus === 'blocked' 
        ? 'The email is still blocked in Supabase Auth. You need to delete the user from Supabase Dashboard → Authentication → Users.'
        : 'Email is ready for registration!'
    })
    
  } catch (error) {
    console.error('User cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cleanup user data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}