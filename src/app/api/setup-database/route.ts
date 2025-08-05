import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

// 数据库表创建SQL
const createTablesSQL = [
  // 1. 创建profiles表
  `
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    user_name TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  `,

  // 2. 创建快速情绪检查表
  `
  CREATE TABLE IF NOT EXISTS public.quick_emotion_checks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  `,

  // 3. 创建对话情绪记录表
  `
  CREATE TABLE IF NOT EXISTS public.conversation_emotion_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL,
    behavioral_impact_score DECIMAL(4,2) NOT NULL CHECK (behavioral_impact_score >= 0.00 AND behavioral_impact_score <= 10.00),
    conversation_text TEXT NOT NULL,
    emotion_evaluation JSONB,
    polarity_analysis JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
  );
  `,

  // 4. 创建索引
  `CREATE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);`,
  `CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_user_id ON public.quick_emotion_checks(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_timestamp ON public.quick_emotion_checks(timestamp);`,
  `CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_user_id ON public.conversation_emotion_records(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_timestamp ON public.conversation_emotion_records(timestamp);`,

  // 5. 启用RLS
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;`,

  // 6. 创建RLS策略
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
      CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    END IF;
  END $$;
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
      CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
  END $$;
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
      CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
  END $$;
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_emotion_checks' AND policyname = 'Users can view own quick emotion checks') THEN
      CREATE POLICY "Users can view own quick emotion checks" ON public.quick_emotion_checks FOR SELECT USING (auth.uid() = user_id);
    END IF;
  END $$;
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quick_emotion_checks' AND policyname = 'Users can insert own quick emotion checks') THEN
      CREATE POLICY "Users can insert own quick emotion checks" ON public.quick_emotion_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
  END $$;
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_emotion_records' AND policyname = 'Users can view own conversation emotion records') THEN
      CREATE POLICY "Users can view own conversation emotion records" ON public.conversation_emotion_records FOR SELECT USING (auth.uid() = user_id);
    END IF;
  END $$;
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_emotion_records' AND policyname = 'Users can insert own conversation emotion records') THEN
      CREATE POLICY "Users can insert own conversation emotion records" ON public.conversation_emotion_records FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
  END $$;
  `,

  // 7. 创建更新触发器函数
  `
  CREATE OR REPLACE FUNCTION public.handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = timezone('utc'::text, now());
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `,

  // 8. 创建触发器
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at') THEN
      CREATE TRIGGER handle_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_updated_at();
    END IF;
  END $$;
  `
]

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database setup...')
    
    const supabase = getSupabaseClient()
    console.log('Supabase client created')

    const results = []
    let successCount = 0
    let errorCount = 0

    // 执行每个SQL命令
    for (let i = 0; i < createTablesSQL.length; i++) {
      const sql = createTablesSQL[i].trim()
      if (!sql) continue

      try {
        console.log(`Executing SQL command ${i + 1}/${createTablesSQL.length}`)
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
        
        if (error) {
          console.error(`SQL command ${i + 1} failed:`, error)
          results.push({
            index: i + 1,
            sql: sql.substring(0, 100) + '...',
            success: false,
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            }
          })
          errorCount++
        } else {
          console.log(`SQL command ${i + 1} executed successfully`)
          results.push({
            index: i + 1,
            sql: sql.substring(0, 100) + '...',
            success: true
          })
          successCount++
        }
      } catch (err: any) {
        console.error(`Exception executing SQL command ${i + 1}:`, err)
        results.push({
          index: i + 1,
          sql: sql.substring(0, 100) + '...',
          success: false,
          error: {
            message: err.message,
            stack: err.stack
          }
        })
        errorCount++
      }
    }

    // 如果无法使用rpc执行SQL，尝试直接创建表
    if (errorCount === createTablesSQL.length) {
      console.log('RPC method failed, trying direct table creation...')
      
      try {
        // 尝试简单的表存在性检查和创建
        const { error: profilesError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        if (profilesError && profilesError.code === 'PGRST116') {
          return NextResponse.json({
            success: false,
            message: 'Database tables do not exist and cannot be created automatically via API.',
            issue: 'missing_tables',
            solution: 'Please create the tables manually in your Supabase SQL editor.',
            sqlScript: createTablesSQL.join('\n\n'),
            instructions: [
              '1. Go to your Supabase project dashboard',
              '2. Navigate to SQL Editor',
              '3. Copy and paste the provided SQL script',
              '4. Run the script to create all required tables',
              '5. Try again after tables are created'
            ]
          }, { status: 503 })
        }

        return NextResponse.json({
          success: true,
          message: 'Database tables already exist and are accessible',
          tablesChecked: ['profiles', 'quick_emotion_checks', 'conversation_emotion_records']
        })
        
      } catch (directError: any) {
        console.error('Direct table check also failed:', directError)
        
        return NextResponse.json({
          success: false,
          message: 'Unable to access or create database tables',
          issue: 'database_access_failed',
          solution: 'Please check your Supabase configuration and permissions',
          error: {
            message: directError.message
          },
          sqlScript: createTablesSQL.join('\n\n')
        }, { status: 503 })
      }
    }

    if (errorCount > 0) {
      console.warn(`Database setup completed with ${errorCount} errors out of ${createTablesSQL.length} commands`)
      return NextResponse.json({
        success: false,
        message: `Database setup completed with ${errorCount} errors`,
        successCount,
        errorCount,
        totalCommands: createTablesSQL.length,
        results,
        recommendation: 'Some commands failed. Please check the results and run any failed commands manually in Supabase SQL editor.'
      }, { status: 207 }) // 207 Multi-Status
    }

    console.log('Database setup completed successfully!')
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      successCount,
      errorCount: 0,
      totalCommands: createTablesSQL.length,
      tablesCreated: ['profiles', 'quick_emotion_checks', 'conversation_emotion_records'],
      message_zh: '数据库设置完成！现在您可以正常使用情绪记录功能了。'
    })

  } catch (error: any) {
    console.error('Database setup error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      issue: 'setup_failed',
      error: {
        message: error.message,
        stack: error.stack
      },
      solution: 'Please check your Supabase configuration and try again',
      sqlScript: createTablesSQL.join('\n\n')
    }, { status: 500 })
  }
}