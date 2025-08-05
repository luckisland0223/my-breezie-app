-- 修复Supabase安全问题的SQL脚本
-- 请在Supabase SQL Editor中运行这些命令

-- 1. 修复Function Search Path Mutable问题
-- 设置安全的search_path
ALTER FUNCTION public.handle_updated_at() SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- 2. 修复Auth RLS Initialization Plan问题
-- 确保所有表都启用了RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;

-- 重新创建RLS策略，确保使用正确的设置
-- 删除现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can insert own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can update own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can delete own quick emotion checks" ON public.quick_emotion_checks;
DROP POLICY IF EXISTS "Users can view own conversation records" ON public.conversation_emotion_records;
DROP POLICY IF EXISTS "Users can insert own conversation records" ON public.conversation_emotion_records;
DROP POLICY IF EXISTS "Users can update own conversation records" ON public.conversation_emotion_records;
DROP POLICY IF EXISTS "Users can delete own conversation records" ON public.conversation_emotion_records;

-- 重新创建安全的RLS策略
-- Profiles表策略
CREATE POLICY "Enable read access for users based on user_id" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Quick emotion checks表策略
CREATE POLICY "Enable read access for users based on user_id" ON public.quick_emotion_checks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.quick_emotion_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.quick_emotion_checks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.quick_emotion_checks
    FOR DELETE USING (auth.uid() = user_id);

-- Conversation emotion records表策略
CREATE POLICY "Enable read access for users based on user_id" ON public.conversation_emotion_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for users based on user_id" ON public.conversation_emotion_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.conversation_emotion_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.conversation_emotion_records
    FOR DELETE USING (auth.uid() = user_id);

-- 3. 创建安全的函数来处理updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 4. 创建安全的函数来处理新用户
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, user_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'user_name', NEW.email)
    );
    RETURN NEW;
END;
$$;