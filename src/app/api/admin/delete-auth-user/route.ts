import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint requires service role key to delete users from auth
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      )
    }

    // Get Supabase config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    let targetUserId = userId

    // If only email is provided, find the user ID first
    if (!targetUserId && email) {
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error('Error listing users:', listError)
        return NextResponse.json(
          { error: 'Failed to find user' },
          { status: 500 }
        )
      }

      const user = users.users.find(u => u.email === email)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found in auth system' },
          { status: 404 }
        )
      }
      
      targetUserId = user.id
    }

    console.log('Deleting user from auth system:', targetUserId)

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete user from authentication system' },
        { status: 500 }
      )
    }

    console.log('User successfully deleted from auth system')

    return NextResponse.json({
      success: true,
      message: 'User has been completely removed from the authentication system'
    })

  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}