import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 简单的密码哈希函数
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { email, username, password } = body

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // 简单验证
    if (password.length < 4) {
      return NextResponse.json({ error: 'Password too short' }, { status: 400 })
    }

    // 检查用户是否存在
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    }).catch(() => null)

    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    // 创建用户
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, username, passwordHash },
      select: { id: true, email: true, username: true }
    }).catch((error) => {
      console.error('Create user error:', error)
      return null
    })

    if (!user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // 返回成功，无token
    return NextResponse.json({
      success: true,
      user,
      message: 'Registration successful - No auth required'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
