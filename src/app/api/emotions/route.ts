import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: list user emotion records (basic pagination)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Math.min(50, Number(searchParams.get('limit') || '20'))
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.emotionRecord.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.emotionRecord.count({ where: { userId: user.userId } })
    ])

    return NextResponse.json({ items, page, limit, total })
  } catch (error: any) {
    console.error('Emotions GET error:', error?.message || error)
    return NextResponse.json({ error: 'Server error', detail: process.env.NODE_ENV === 'development' ? (error?.message || 'unknown') : undefined }, { status: 500 })
  }
}

// POST: create emotion record
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: '未认证' }, { status: 401 })

  try {
    const body = await request.json()
    const { emotion, behavioralImpact, note, recordType, conversationSummary, actualEmotion, actualIntensity, emotionChanged, confidenceLevel, analysis, polarity, polarityStrength, polarityConfidence } = body || {}

    if (!emotion || typeof behavioralImpact !== 'number' || !note) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const created = await prisma.emotionRecord.create({
      data: {
        userId: user.userId,
        emotion,
        behavioralImpact,
        note,
        recordType: recordType || 'chat',
        conversationSummary,
        actualEmotion,
        actualIntensity,
        emotionChanged,
        confidenceLevel,
        analysis,
        polarity,
        polarityStrength,
        polarityConfidence,
      },
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Create emotion error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

