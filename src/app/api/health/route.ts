import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    
    
    const supabase = getSupabaseClient()
    

    // Check basic connection
    
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (connectionError) {
      
      
      // Special handling for table not exists
      if (connectionError.code === 'PGRST116' || connectionError.message?.includes('does not exist')) {
        return NextResponse.json({
          status: 'error',
          message: 'Database connection successful, but tables do not exist',
          issue: 'missing_tables',
          solution: 'Please run the database setup script to create the required tables',
          connectionError: {
            code: connectionError.code,
            message: connectionError.message,
            details: connectionError.details,
            hint: connectionError.hint
          }
        }, { status: 503 })
      }

      // Other connection errors
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        issue: 'connection_failed',
        solution: 'Please check your Supabase configuration in src/config/database.ts',
        connectionError: {
          code: connectionError.code,
          message: connectionError.message,
          details: connectionError.details,
          hint: connectionError.hint
        }
      }, { status: 503 })
    }

    

    // Check if each table exists
    const tables = ['profiles', 'quick_emotion_checks', 'conversation_emotion_records']
    const tableStatus: Record<string, boolean> = {}
    const tableErrors: Record<string, any> = {}

    for (const table of tables) {
      try {
        
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        if (error) {
          
          tableStatus[table] = false
          tableErrors[table] = {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          }
        } else {
          
          tableStatus[table] = true
        }
      } catch (err: any) {
        
        tableStatus[table] = false
        tableErrors[table] = {
          message: err.message,
          stack: err.stack
        }
      }
    }

    const missingTables = Object.entries(tableStatus)
      .filter(([table, exists]) => !exists)
      .map(([table]) => table)

    if (missingTables.length > 0) {
      
      return NextResponse.json({
        status: 'error',
        message: `Missing database tables: ${missingTables.join(', ')}`,
        issue: 'missing_tables',
        solution: 'Please run the database setup script to create the required tables',
        missingTables,
        tableStatus,
        tableErrors
      }, { status: 503 })
    }

    
    return NextResponse.json({
      status: 'healthy',
      message: 'Database connection and all tables are working correctly',
      tableStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      issue: 'unknown_error',
      solution: 'Please check the server logs for more details',
      error: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 })
  }
}