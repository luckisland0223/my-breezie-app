import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try to get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Clear any stale auth cookies
      const response = NextResponse.json({
        success: false,
        error: 'Authentication expired',
        action: 'redirect_to_signin',
        message: 'Please sign in again to continue'
      }, { status: 401 })
      
      // Clear auth cookies
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      
      return response
    }
    
    // Check if required tables exist
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'quick_emotion_checks', 'conversation_emotion_records'])

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection issue',
        details: tableError.message,
        action: 'check_database_setup'
      }, { status: 503 })
    }

    const existingTables = tables?.map(t => t.table_name) || []
    const requiredTables = ['profiles', 'quick_emotion_checks', 'conversation_emotion_records']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))

    if (missingTables.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Database tables missing',
        missingTables,
        action: 'run_sql_script',
        message: `Missing tables: ${missingTables.join(', ')}. Please run the create_split_tables.sql script in your Supabase SQL Editor.`
      }, { status: 503 })
    }

    // Everything looks good
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      tables: existingTables,
      message: 'Authentication and database are working correctly'
    })

  } catch (error) {
    console.error('Auth fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}