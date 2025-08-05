import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('🚀 Starting fresh database setup...')
    
    // Step 0: Enable UUID extension
    await supabase.rpc('sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    })
    console.log('✅ UUID extension enabled')
    
    // Step 1: Drop all existing tables
    const dropSQL = `
      DROP TABLE IF EXISTS public.emotion_records CASCADE;
      DROP TABLE IF EXISTS public.emotion_records_backup_before_split CASCADE;
      DROP TABLE IF EXISTS public.chat_sessions CASCADE;
      DROP TABLE IF EXISTS public.chat_messages CASCADE;
      DROP TABLE IF EXISTS public.quick_emotion_checks CASCADE;
      DROP TABLE IF EXISTS public.conversation_emotion_records CASCADE;
      DROP TABLE IF EXISTS public.profiles CASCADE;
    `
    
    const { error: dropError } = await supabase.rpc('sql', { sql: dropSQL })
    if (dropError) {
      console.error('Drop tables error:', dropError)
    } else {
      console.log('✅ All old tables dropped')
    }
    
    // Step 2: Create profiles table
    const profilesSQL = `
      CREATE TABLE public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT NOT NULL,
        user_name TEXT UNIQUE NOT NULL,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        timezone TEXT DEFAULT 'UTC',
        notification_preferences JSONB DEFAULT '{"email": true, "push": false, "wellness_tips": true}',
        privacy_settings JSONB DEFAULT '{"profile_public": false, "analytics_sharing": false}',
        subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
        onboarding_completed BOOLEAN DEFAULT false,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
      CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);
      
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id);
      CREATE POLICY "Users can update own profile" ON public.profiles  
        FOR UPDATE USING (auth.uid() = id);
      CREATE POLICY "Users can insert own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    `
    
    const { error: profilesError } = await supabase.rpc('sql', { sql: profilesSQL })
    if (profilesError) {
      console.error('Profiles table error:', profilesError)
      throw profilesError
    }
    console.log('✅ Profiles table created')
    
    // Step 3: Create quick_emotion_checks table
    const quickChecksSQL = `
      CREATE TABLE public.quick_emotion_checks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        emotion TEXT NOT NULL,
        intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_user_id ON public.quick_emotion_checks(user_id);
      CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_timestamp ON public.quick_emotion_checks(timestamp);
      CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_emotion ON public.quick_emotion_checks(emotion);
      
      ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own quick emotion checks" ON public.quick_emotion_checks
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own quick emotion checks" ON public.quick_emotion_checks
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own quick emotion checks" ON public.quick_emotion_checks
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete own quick emotion checks" ON public.quick_emotion_checks
        FOR DELETE USING (auth.uid() = user_id);
    `
    
    const { error: quickError } = await supabase.rpc('sql', { sql: quickChecksSQL })
    if (quickError) {
      console.error('Quick checks table error:', quickError)
      throw quickError
    }
    console.log('✅ Quick emotion checks table created')
    
    // Step 4: Create conversation_emotion_records table
    const conversationSQL = `
      CREATE TABLE public.conversation_emotion_records (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        emotion TEXT NOT NULL,
        behavioral_impact_score DECIMAL(4,2) NOT NULL CHECK (behavioral_impact_score >= 0 AND behavioral_impact_score <= 10),
        conversation_text TEXT NOT NULL,
        emotion_evaluation JSONB,
        polarity_analysis JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_user_id ON public.conversation_emotion_records(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_timestamp ON public.conversation_emotion_records(timestamp);
      CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_emotion ON public.conversation_emotion_records(emotion);
      CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_user_emotion ON public.conversation_emotion_records(user_id, emotion);
      
      ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view own conversation records" ON public.conversation_emotion_records
        FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert own conversation records" ON public.conversation_emotion_records
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update own conversation records" ON public.conversation_emotion_records
        FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete own conversation records" ON public.conversation_emotion_records
        FOR DELETE USING (auth.uid() = user_id);
    `
    
    const { error: conversationError } = await supabase.rpc('sql', { sql: conversationSQL })
    if (conversationError) {
      console.error('Conversation table error:', conversationError)
      throw conversationError
    }
    console.log('✅ Conversation emotion records table created')
    
    // Step 5: Create auto-profile trigger
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, user_name, full_name)
        VALUES (
          NEW.id, 
          NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)),
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1))
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          last_active = timezone('utc'::text, now()),
          updated_at = timezone('utc'::text, now());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE PROCEDURE public.handle_new_user();
    `
    
    const { error: triggerError } = await supabase.rpc('sql', { sql: triggerSQL })
    if (triggerError) {
      console.error('Trigger error:', triggerError)
      throw triggerError
    }
    console.log('✅ Auto-profile creation trigger installed')
    
    console.log('🎉 Fresh database setup complete!')
    
    return NextResponse.json({
      success: true,
      message: 'Fresh database setup completed successfully!',
      tables_created: ['profiles', 'quick_emotion_checks', 'conversation_emotion_records'],
      features: [
        'Row Level Security enabled',
        'Performance indexes created',
        'Auto-profile creation trigger installed',
        'Cross-device sync ready'
      ]
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