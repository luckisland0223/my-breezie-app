import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if required tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'quick_emotion_checks', 'conversation_emotion_records'])

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check database tables',
        details: error.message
      }, { status: 500 })
    }

    const existingTables = tables?.map(t => t.table_name) || []
    const requiredTables = ['profiles', 'quick_emotion_checks', 'conversation_emotion_records']
    const missingTables = requiredTables.filter(table => !existingTables.includes(table))

    return NextResponse.json({
      success: true,
      existingTables,
      missingTables,
      allTablesExist: missingTables.length === 0,
      message: missingTables.length === 0 
        ? 'All required tables exist' 
        : `Missing tables: ${missingTables.join(', ')}`
    })

  } catch (error) {
    console.error('Table check error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}