import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('🚀 Starting database check and basic setup...')
    
    // Try to check if tables exist by attempting to query them
    const tablesToCheck = ['profiles', 'quick_emotion_checks', 'conversation_emotion_records']
    const existingTableNames: string[] = []
    
    for (const tableName of tablesToCheck) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1)
        
        if (!error) {
          existingTableNames.push(tableName)
          console.log(`✅ Table ${tableName} exists`)
        } else {
          console.log(`❌ Table ${tableName} missing: ${error.message}`)
        }
      } catch (e) {
        console.log(`❌ Table ${tableName} missing or inaccessible`)
      }
    }
    
    const requiredTables = ['profiles', 'quick_emotion_checks', 'conversation_emotion_records']
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table))
    
    console.log('📊 Database Status:')
    console.log('- Existing tables:', existingTableNames)
    console.log('- Missing tables:', missingTables)
    
    if (missingTables.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All required tables already exist!',
        existing_tables: existingTableNames,
        status: 'ready'
      })
    }
    
    console.log('🎉 Database check complete!')
    
    return NextResponse.json({
      success: false,
      error: 'Tables missing - manual setup required',
      message: 'Some required tables are missing. Please run the SQL script manually.',
      missing_tables: missingTables,
      existing_tables: existingTableNames,
      action: 'run_sql_script',
      instructions: 'Go to Supabase Dashboard → SQL Editor → Run create_split_tables.sql'
    })
    
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to setup fresh database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}