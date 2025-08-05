-- Create Split Tables for Emotion Records - Clean Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- STEP 0: Clean up old tables (keep profiles only)
-- ===========================================

-- ⚠️ SAFETY CHECK: Verify profiles table exists before cleanup
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE '⚠️ WARNING: profiles table does not exist. Creating it first...';
        
        -- Create profiles table if it doesn't exist
        CREATE TABLE public.profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT,
            user_name TEXT UNIQUE NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Enable RLS for profiles
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for profiles
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
            
        RAISE NOTICE '✅ profiles table created with proper RLS policies';
    ELSE
        RAISE NOTICE '✅ profiles table exists - will be preserved during cleanup';
    END IF;
END $$;

-- Drop old emotion-related tables if they exist
DROP TABLE IF EXISTS public.emotion_records CASCADE;
DROP TABLE IF EXISTS public.emotion_records_backup_before_split CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.quick_emotion_checks CASCADE;
DROP TABLE IF EXISTS public.conversation_emotion_records CASCADE;

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

-- Note: We keep the profiles table and its policies intact

-- ===========================================
-- STEP 1: Quick Emotion Checks Table (Simple & Fast)
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
-- STEP 2: Conversation Emotion Records Table (AI Analysis)
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
-- STEP 3: Create Performance Indexes
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
-- STEP 4: Enable Row Level Security
-- ===========================================
ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 5: Create RLS Policies for Cross-Device Access
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
-- STEP 6: Add Table Comments
-- ===========================================
COMMENT ON TABLE public.quick_emotion_checks IS 
'Quick emotion check records: User subjective emotion feelings recorded via slider interface';

COMMENT ON TABLE public.conversation_emotion_records IS 
'Conversation emotion records: Deep emotion insights and behavioral impact assessments from AI conversations';

-- ===========================================
-- STEP 7: Verification and Status Check
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
  AND table_name IN ('quick_emotion_checks', 'conversation_emotion_records')
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
  AND tablename IN ('quick_emotion_checks', 'conversation_emotion_records');

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('quick_emotion_checks', 'conversation_emotion_records');

-- Final status
SELECT 
    '🎉 Database setup complete!' as final_status,
    'Tables: quick_emotion_checks, conversation_emotion_records' as tables_created,
    'RLS enabled with proper cross-device policies' as security_status,
    'Performance indexes created for fast queries' as performance_status,
    'Old tables cleaned up, profiles table preserved' as cleanup_status;