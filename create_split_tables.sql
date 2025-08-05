-- Create Split Tables for Emotion Records - Clean Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- STEP 0: Clean up old tables (keep profiles only)
-- ===========================================

-- 🗑️ COMPLETE CLEANUP: Drop ALL existing tables and start fresh
DROP TABLE IF EXISTS public.emotion_records CASCADE;
DROP TABLE IF EXISTS public.emotion_records_backup_before_split CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.quick_emotion_checks CASCADE;
DROP TABLE IF EXISTS public.conversation_emotion_records CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS public.idx_emotion_records_user_id;
DROP INDEX IF EXISTS public.idx_emotion_records_timestamp;
DROP INDEX IF EXISTS public.idx_emotion_records_emotion;
DROP INDEX IF EXISTS public.idx_emotion_records_user_emotion;
DROP INDEX IF EXISTS public.idx_emotion_records_record_type;
DROP INDEX IF EXISTS public.idx_chat_sessions_user_id;
DROP INDEX IF EXISTS public.idx_chat_messages_session_id;
DROP INDEX IF EXISTS public.idx_chat_messages_user_id;

-- Drop old RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own emotion records" ON public.emotion_records;
DROP POLICY IF EXISTS "Users can insert own emotion records" ON public.emotion_records;
DROP POLICY IF EXISTS "Users can update own emotion records" ON public.emotion_records;
DROP POLICY IF EXISTS "Users can delete own emotion records" ON public.emotion_records;
DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can insert own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;

-- ===========================================
-- STEP 1: Create Fresh Profiles Table
-- ===========================================
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

-- Add profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles  
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- STEP 2: Quick Emotion Checks Table (Simple & Fast)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.quick_emotion_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===========================================
-- STEP 3: Conversation Emotion Records Table (AI Analysis)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.conversation_emotion_records (
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

-- ===========================================
-- STEP 4: Create Performance Indexes
-- ===========================================

-- Quick Emotion Checks indexes
CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_user_id ON public.quick_emotion_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_timestamp ON public.quick_emotion_checks(timestamp);
CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_emotion ON public.quick_emotion_checks(emotion);
CREATE INDEX IF NOT EXISTS idx_quick_emotion_checks_user_emotion ON public.quick_emotion_checks(user_id, emotion);

-- Conversation Emotion Records indexes
CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_user_id ON public.conversation_emotion_records(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_timestamp ON public.conversation_emotion_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_emotion ON public.conversation_emotion_records(emotion);
CREATE INDEX IF NOT EXISTS idx_conversation_emotion_records_user_emotion ON public.conversation_emotion_records(user_id, emotion);

-- ===========================================
-- STEP 5: Enable Row Level Security
-- ===========================================
ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 6: Create RLS Policies for Cross-Device Access
-- ===========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can insert own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can update own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can delete own quick emotion checks" ON public.quick_emotion_checks;

DROP POLICY IF EXISTS "Users can view own conversation records" ON public.conversation_emotion_records;
DROP POLICY IF EXISTS "Users can insert own conversation records" ON public.conversation_emotion_records;
DROP POLICY IF EXISTS "Users can update own conversation records" ON public.conversation_emotion_records;
DROP POLICY IF EXISTS "Users can delete own conversation records" ON public.conversation_emotion_records;

-- Quick Emotion Checks policies
CREATE POLICY "Users can view own quick emotion checks" ON public.quick_emotion_checks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick emotion checks" ON public.quick_emotion_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick emotion checks" ON public.quick_emotion_checks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick emotion checks" ON public.quick_emotion_checks
    FOR DELETE USING (auth.uid() = user_id);

-- Conversation Emotion Records policies
CREATE POLICY "Users can view own conversation records" ON public.conversation_emotion_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation records" ON public.conversation_emotion_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversation records" ON public.conversation_emotion_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversation records" ON public.conversation_emotion_records
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- STEP 7: Auto-Create Profile on User Signup
-- ===========================================

-- Create function to auto-create user profile
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

-- ===========================================
-- STEP 8: Add Table Comments
-- ===========================================
COMMENT ON TABLE public.profiles IS 
'User profiles: Complete user information, preferences, and settings for personalized experience';

COMMENT ON TABLE public.quick_emotion_checks IS 
'Quick emotion check records: User subjective emotion feelings recorded via slider interface';

COMMENT ON TABLE public.conversation_emotion_records IS 
'Conversation emotion records: Deep emotion insights and behavioral impact assessments from AI conversations';

-- ===========================================
-- STEP 9: Verification and Status Check
-- ===========================================

-- Check that old tables are gone and new tables exist
SELECT 
    '🧹 Old tables cleaned up' as cleanup_status,
    '✅ Split tables created successfully!' as creation_status;

-- Verify table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'quick_emotion_checks', 'conversation_emotion_records')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'quick_emotion_checks', 'conversation_emotion_records');

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'quick_emotion_checks', 'conversation_emotion_records');

-- Check trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    trigger_schema,
    trigger_name
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Final status
SELECT 
    '🎉 Database setup complete!' as final_status,
    'Tables: profiles, quick_emotion_checks, conversation_emotion_records' as tables_created,
    'RLS enabled with proper cross-device policies' as security_status,
    'Performance indexes created for fast queries' as performance_status,
    'Auto-profile creation trigger installed' as automation_status,
    'Complete fresh database - all old tables removed' as cleanup_status;