import { NextRequest, NextResponse } from 'next/server'
import { syncUserData } from '@/lib/supabase/database'

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

    const syncResult = await syncUserData(userId)

    if (!syncResult.success) {
      return NextResponse.json(
        { error: 'Failed to sync user data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: syncResult.profile,
        emotionRecords: syncResult.emotionRecords
      }
    })

  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}