import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 无认证的情绪记录API - 使用用户ID参数
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId parameter required' }, { status: 400 })
    }

    const records = await prisma.emotionRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        emotion: true,
        behavioralImpact: true,
        note: true,
        recordType: true,
        createdAt: true
      }
    }).catch((error) => {
      console.error('Get emotions error:', error)
      return []
    })

    return NextResponse.json({
      success: true,
      data: records,
      total: records.length
    })

  } catch (error) {
    console.error('Get emotions error:', error)
    return NextResponse.json({ error: 'Failed to get records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { userId, emotion, behavioralImpact, note, recordType } = body

    if (!userId || !emotion || !note) {
      return NextResponse.json({ error: 'userId, emotion, and note required' }, { status: 400 })
    }

    // 清理输入
    const cleanEmotion = String(emotion).trim().slice(0, 50)
    const cleanNote = String(note).trim().slice(0, 500)
    const cleanImpact = Math.max(1, Math.min(10, Number(behavioralImpact) || 5))
    const cleanType = String(recordType || 'quick_check').trim()

    const record = await prisma.emotionRecord.create({
      data: {
        userId: String(userId),
        emotion: cleanEmotion,
        behavioralImpact: cleanImpact,
        note: cleanNote,
        recordType: cleanType
      },
      select: {
        id: true,
        emotion: true,
        behavioralImpact: true,
        note: true,
        recordType: true,
        createdAt: true
      }
    }).catch((error) => {
      console.error('Create emotion error:', error)
      return null
    })

    if (!record) {
      return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: record,
      message: 'Emotion record created'
    })

  } catch (error) {
    console.error('Create emotion error:', error)
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 })
  }
}
