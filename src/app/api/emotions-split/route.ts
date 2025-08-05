import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllUserEmotionRecords,
  getAllUserEmotionRecordsByDateRange,
  createQuickEmotionCheck,
  createConversationEmotionRecord,
  createEmotionRecord  // 兼容性函数
} from '@/lib/supabase/database-split'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const recordType = searchParams.get('recordType') // 'quick', 'conversation', 'all'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let records

    if (startDate && endDate) {
      // 按日期范围查询
      records = await getAllUserEmotionRecordsByDateRange(userId, startDate, endDate)
    } else {
      // 查询所有记录
      records = await getAllUserEmotionRecords(userId)
    }

    // 根据记录类型过滤
    if (recordType && recordType !== 'all') {
      if (recordType === 'quick') {
        records = records.filter(r => r.recordType === 'quick_check')
      } else if (recordType === 'conversation') {
        records = records.filter(r => r.recordType === 'conversation')
      }
    }

    return NextResponse.json({
      success: true,
      records,
      totalCount: records.length,
      quickCheckCount: records.filter(r => r.recordType === 'quick_check').length,
      conversationCount: records.filter(r => r.recordType === 'conversation').length
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
    const body = await request.json()
    const {
      userId,
      recordType, // 'quick_check' | 'conversation'
      emotion,
      intensity,
      note,
      conversationText,
      behavioralImpactScore,
      emotionEvaluation,
      polarityAnalysis
    } = body

    if (!userId || !emotion || !recordType) {
      return NextResponse.json(
        { error: 'User ID, emotion, and recordType are required' },
        { status: 400 }
      )
    }

    let record

    if (recordType === 'quick_check') {
      // 创建快速情绪检查记录
      if (!intensity || intensity < 1 || intensity > 10) {
        return NextResponse.json(
          { error: 'Intensity must be between 1 and 10 for quick checks' },
          { status: 400 }
        )
      }

      const quickRecord = await createQuickEmotionCheck({
        user_id: userId,
        emotion,
        intensity: parseInt(intensity),
        timestamp: new Date().toISOString()
      })

      if (!quickRecord) {
        return NextResponse.json(
          { error: 'Failed to create quick emotion check' },
          { status: 500 }
        )
      }

      record = {
        id: quickRecord.id,
        user_id: quickRecord.user_id,
        emotion: quickRecord.emotion,
        intensity: quickRecord.intensity,
        note: note || `Quick check: ${quickRecord.emotion} at intensity ${quickRecord.intensity}`,
        timestamp: quickRecord.timestamp,
        recordType: 'quick_check',
        created_at: quickRecord.created_at
      }

    } else if (recordType === 'conversation') {
      // 创建对话情绪记录
      if (!conversationText) {
        return NextResponse.json(
          { error: 'Conversation text is required for conversation records' },
          { status: 400 }
        )
      }

      const conversationRecord = await createConversationEmotionRecord({
        user_id: userId,
        emotion,
        behavioral_impact_score: behavioralImpactScore || intensity || 5.0,
        conversation_text: conversationText,
        emotion_evaluation: emotionEvaluation,
        polarity_analysis: polarityAnalysis,
        timestamp: new Date().toISOString()
      })

      if (!conversationRecord) {
        return NextResponse.json(
          { error: 'Failed to create conversation emotion record' },
          { status: 500 }
        )
      }

      record = {
        id: conversationRecord.id,
        user_id: conversationRecord.user_id,
        emotion: conversationRecord.emotion,
        intensity: Math.round(conversationRecord.behavioral_impact_score),
        note: conversationRecord.conversation_text.length > 100 
          ? conversationRecord.conversation_text.substring(0, 100) + '...' 
          : conversationRecord.conversation_text,
        timestamp: conversationRecord.timestamp,
        recordType: 'conversation',
        emotion_evaluation: conversationRecord.emotion_evaluation,
        polarity_analysis: conversationRecord.polarity_analysis,
        conversation_text: conversationRecord.conversation_text,
        created_at: conversationRecord.created_at
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid recordType. Must be "quick_check" or "conversation"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      record
    })

  } catch (error) {
    console.error('Create emotion record API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT endpoint for updating records (optional)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { recordId, userId, recordType, updates } = body

    if (!recordId || !userId || !recordType) {
      return NextResponse.json(
        { error: 'Record ID, User ID, and recordType are required' },
        { status: 400 }
      )
    }

    // 这里可以根据需要实现更新逻辑
    // 由于当前应用主要是创建和读取，暂时返回不支持
    return NextResponse.json(
      { error: 'Record updates not implemented yet' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Update emotion record API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE endpoint for deleting records (optional)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('recordId')
    const userId = searchParams.get('userId')
    const recordType = searchParams.get('recordType')

    if (!recordId || !userId || !recordType) {
      return NextResponse.json(
        { error: 'Record ID, User ID, and recordType are required' },
        { status: 400 }
      )  
    }

    // 这里可以根据需要实现删除逻辑
    // 由于当前应用主要是创建和读取，暂时返回不支持
    return NextResponse.json(
      { error: 'Record deletion not implemented yet' },
      { status: 501 }
    )

  } catch (error) {
    console.error('Delete emotion record API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}