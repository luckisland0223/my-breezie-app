-- Breezie情绪健康助手数据库结构 (分表版本)
-- 使用Supabase PostgreSQL

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 核心表结构 (3个表)
-- ===========================================

-- 1. 用户配置表 (保持不变)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    user_name TEXT UNIQUE NOT NULL, -- 用户名必须唯一且不为空
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 快速情绪检查表
CREATE TABLE public.quick_emotion_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL, -- Joy, Sadness, Anxiety, etc.
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10), -- 用户主观选择的强度
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 对话情绪记录表
CREATE TABLE public.conversation_emotion_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL, -- AI推断的主要情绪
    behavioral_impact_score DECIMAL(4,2) NOT NULL CHECK (behavioral_impact_score >= 0.00 AND behavioral_impact_score <= 10.00), -- AI计算的行为影响分数
    conversation_text TEXT NOT NULL, -- 完整对话内容
    emotion_evaluation JSONB,   -- AI情绪评估结果
    polarity_analysis JSONB,    -- 情绪极性分析
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===========================================
-- 索引优化
-- ===========================================

-- Profiles表索引
CREATE UNIQUE INDEX idx_profiles_user_name ON public.profiles(user_name);

-- Quick Emotion Checks索引
CREATE INDEX idx_quick_emotion_checks_user_id ON public.quick_emotion_checks(user_id);
CREATE INDEX idx_quick_emotion_checks_timestamp ON public.quick_emotion_checks(timestamp);
CREATE INDEX idx_quick_emotion_checks_emotion ON public.quick_emotion_checks(emotion);
CREATE INDEX idx_quick_emotion_checks_user_emotion ON public.quick_emotion_checks(user_id, emotion);
CREATE INDEX idx_quick_emotion_checks_user_time ON public.quick_emotion_checks(user_id, timestamp DESC);

-- Conversation Emotion Records索引
CREATE INDEX idx_conversation_emotion_records_user_id ON public.conversation_emotion_records(user_id);
CREATE INDEX idx_conversation_emotion_records_timestamp ON public.conversation_emotion_records(timestamp);
CREATE INDEX idx_conversation_emotion_records_emotion ON public.conversation_emotion_records(emotion);
CREATE INDEX idx_conversation_emotion_records_user_emotion ON public.conversation_emotion_records(user_id, emotion);
CREATE INDEX idx_conversation_emotion_records_user_time ON public.conversation_emotion_records(user_id, timestamp DESC);
CREATE INDEX idx_conversation_emotion_records_impact_score ON public.conversation_emotion_records(behavioral_impact_score);

-- ===========================================
-- Row Level Security (RLS)
-- ===========================================

-- 启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;

-- Profiles RLS策略
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Quick Emotion Checks RLS策略
CREATE POLICY "Users can view own quick emotion checks" ON public.quick_emotion_checks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick emotion checks" ON public.quick_emotion_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick emotion checks" ON public.quick_emotion_checks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick emotion checks" ON public.quick_emotion_checks
    FOR DELETE USING (auth.uid() = user_id);

-- Conversation Emotion Records RLS策略
CREATE POLICY "Users can view own conversation emotion records" ON public.conversation_emotion_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation emotion records" ON public.conversation_emotion_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversation emotion records" ON public.conversation_emotion_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversation emotion records" ON public.conversation_emotion_records
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 触发器和函数
-- ===========================================

-- 自动更新updated_at字段的函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Profiles表的updated_at触发器
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- 自动创建用户配置的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, user_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'user_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 用户注册时自动创建配置的触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();

-- ===========================================
-- 表注释说明
-- ===========================================

COMMENT ON TABLE public.profiles IS 
'用户配置表：存储用户基本信息，补充auth.users表的功能';

COMMENT ON TABLE public.quick_emotion_checks IS 
'快速情绪检查表：用户通过滑块快速记录的主观情绪感受，轻量化设计';

COMMENT ON TABLE public.conversation_emotion_records IS 
'对话情绪记录表：通过AI对话分析得出的深度情绪洞察和行为影响评估，包含完整对话内容';

-- 字段注释
COMMENT ON COLUMN public.quick_emotion_checks.intensity IS 
'用户主观选择的情绪强度，范围1-10，直接来自用户滑块操作';

COMMENT ON COLUMN public.conversation_emotion_records.behavioral_impact_score IS 
'AI计算的行为影响分数，范围0.00-10.00，基于对话内容分析得出';

COMMENT ON COLUMN public.conversation_emotion_records.conversation_text IS 
'完整的用户与AI对话内容，用于情绪分析和后续回顾';

COMMENT ON COLUMN public.conversation_emotion_records.emotion_evaluation IS 
'AI情绪评估结果的JSONB数据，包含置信度、子情绪等详细分析';

COMMENT ON COLUMN public.conversation_emotion_records.polarity_analysis IS 
'情绪极性分析的JSONB数据，包含正面、负面、中性的比例分析';

-- ===========================================
-- 数据库统计视图 (可选)
-- ===========================================

-- 用户情绪统计视图
CREATE OR REPLACE VIEW public.user_emotion_stats AS
SELECT 
    user_id,
    'quick_check' as record_type,
    emotion,
    COUNT(*) as count,
    ROUND(AVG(intensity::decimal), 2) as avg_intensity,
    MIN(timestamp) as first_recorded,
    MAX(timestamp) as last_recorded
FROM public.quick_emotion_checks
GROUP BY user_id, emotion

UNION ALL

SELECT 
    user_id,
    'conversation' as record_type,
    emotion,
    COUNT(*) as count,
    ROUND(AVG(behavioral_impact_score), 2) as avg_intensity,
    MIN(timestamp) as first_recorded,
    MAX(timestamp) as last_recorded
FROM public.conversation_emotion_records
GROUP BY user_id, emotion;

-- 每日情绪趋势视图
CREATE OR REPLACE VIEW public.daily_emotion_trends AS
SELECT 
    user_id,
    DATE(timestamp) as date,
    'quick_check' as record_type,
    COUNT(*) as total_records,
    ROUND(AVG(intensity::decimal), 2) as avg_intensity
FROM public.quick_emotion_checks
GROUP BY user_id, DATE(timestamp)

UNION ALL

SELECT 
    user_id,
    DATE(timestamp) as date,
    'conversation' as record_type,
    COUNT(*) as total_records,
    ROUND(AVG(behavioral_impact_score), 2) as avg_intensity
FROM public.conversation_emotion_records
GROUP BY user_id, DATE(timestamp);

-- ===========================================
-- 性能优化建议
-- ===========================================

-- 如果数据量很大，可以考虑分区表
-- 例如按月分区conversation_emotion_records表

-- 定期清理策略（可选）
-- 可以添加定期清理超过1年的快速检查记录的任务

-- 建议的查询优化
-- 1. 查询最近30天的记录时使用timestamp索引
-- 2. 按情绪类型统计时使用emotion索引
-- 3. 用户个人数据查询时使用user_id索引

SELECT '✅ 分表数据库结构创建完成！' as status;