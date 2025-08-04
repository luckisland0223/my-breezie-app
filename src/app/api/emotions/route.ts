import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'
import { createEmotionRecord, getUserEmotionRecords } from '@/lib/supabase/database'

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

    const records = await getUserEmotionRecords(userId)

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
      conversationSummary,
      emotionEvaluation,
      polarityAnalysis
    } = await request.json()

    if (!userId || !emotion || !intensity) {
      return NextResponse.json(
        { error: 'User ID, emotion, and intensity are required' },
        { status: 400 }
      )
    }

    const record = await createEmotionRecord({
      user_id: userId,
      emotion,
      intensity,
      note,
      timestamp: new Date().toISOString(),
      conversation_summary: conversationSummary,
      emotion_evaluation: emotionEvaluation,
      polarity_analysis: polarityAnalysis
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