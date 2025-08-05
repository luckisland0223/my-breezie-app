import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getAllUserEmotionRecords, createQuickEmotionCheck, createConversationEmotionRecord } from '@/lib/supabase/database-split'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const records = await getAllUserEmotionRecords(userId)

    return NextResponse.json({
      success: true,
      records
    })

  } catch (error) {
    console.error('Get emotions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      emotion,
      intensity,
      note,
      emotionEvaluation,
      polarityAnalysis
    } = await request.json()

    if (!userId || !emotion || !intensity) {
      return NextResponse.json(
        { error: 'User ID, emotion, and intensity are required' },
        { status: 400 }
      )
    }

    // Default to quick check if no specific type is provided
    const record = await createQuickEmotionCheck({
      user_id: userId,
      emotion,
      intensity: parseInt(intensity),
      timestamp: new Date().toISOString()
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Failed to create emotion record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record
    })

  } catch (error) {
    console.error('Create emotion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}