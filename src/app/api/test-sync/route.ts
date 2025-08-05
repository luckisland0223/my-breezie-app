import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()
    
    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action is required (test_auth, create_test_data, verify_sync)'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    if (action === 'test_auth') {
      // Test authentication with provided credentials
      if (!email || !password) {
        return NextResponse.json({
          success: false,
          error: 'Email and password required for auth test'
        }, { status: 400 })
      }
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) {
        return NextResponse.json({
          success: false,
          error: 'Authentication failed',
          details: authError.message
        })
      }
      
      if (!authData.user) {
        return NextResponse.json({
          success: false,
          error: 'No user returned from authentication'
        })
      }
      
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          created_at: authData.user.created_at
        },
        profile: profile || null,
        profile_error: profileError?.message || null
      })
    }
    
    if (action === 'create_test_data') {
      // Create test data for sync testing
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required for data creation'
        })
      }
      
      const timestamp = new Date().toISOString()
      const testId = Date.now()
      
      // Create a quick emotion check
      const { data: quickCheck, error: quickError } = await supabase
        .from('quick_emotion_checks')
        .insert({
          user_id: user.id,
          emotion: 'Joy',
          intensity: 8,
          timestamp: timestamp
        })
        .select()
        .single()
      
      // Create a conversation emotion record
      const { data: conversation, error: conversationError } = await supabase
        .from('conversation_emotion_records')
        .insert({
          user_id: user.id,
          emotion: 'Calm',
          behavioral_impact_score: 7.5,
          conversation_text: `Test conversation for sync verification - ${testId}`,
          emotion_evaluation: {
            actualEmotion: 'Calm',
            actualIntensity: 7.5,
            confidence: 0.9
          },
          polarity_analysis: {
            positive: 0.8,
            negative: 0.1,
            neutral: 0.1
          },
          timestamp: timestamp
        })
        .select()
        .single()
      
      return NextResponse.json({
        success: true,
        message: 'Test data created successfully',
        data: {
          quick_check: quickCheck || null,
          conversation: conversation || null,
          quick_error: quickError?.message || null,
          conversation_error: conversationError?.message || null,
          test_id: testId,
          user_id: user.id
        }
      })
    }
    
    if (action === 'verify_sync') {
      // Verify that data can be retrieved (simulating another device)
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json({
          success: false,
          error: 'Authentication required for sync verification'
        })
      }
      
      // Get all user's quick emotion checks
      const { data: quickChecks, error: quickError } = await supabase
        .from('quick_emotion_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Get all user's conversation records
      const { data: conversations, error: conversationError } = await supabase
        .from('conversation_emotion_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      return NextResponse.json({
        success: true,
        message: 'Sync verification completed',
        sync_data: {
          user_id: user.id,
          profile: profile || null,
          quick_checks: {
            count: quickChecks?.length || 0,
            records: quickChecks || [],
            error: quickError?.message || null
          },
          conversations: {
            count: conversations?.length || 0,
            records: conversations || [],
            error: conversationError?.message || null
          },
          errors: {
            profile: profileError?.message || null,
            quick_checks: quickError?.message || null,
            conversations: conversationError?.message || null
          }
        }
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: test_auth, create_test_data, or verify_sync'
    }, { status: 400 })
    
  } catch (error) {
    console.error('Sync test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}