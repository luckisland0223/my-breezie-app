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
    
    // Try to find any existing profile with this email
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
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
      
      console.log('✅ Cleaned up user data')
    } else {
      console.log('No existing profile found for this email')
    }
    
    return NextResponse.json({
      success: true,
      message: 'User cleanup completed. You can now register with this email.',
      email: email,
      cleaned_profile: !!existingProfile
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