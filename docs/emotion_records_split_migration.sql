-- 情绪记录分表迁移脚本
-- 将 emotion_records 分成两个专门的表

-- 启用UUID扩展（如果还没有）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 第一步：创建新的分表结构
-- ===========================================

-- 1. 快速情绪检查表
CREATE TABLE public.quick_emotion_checks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL,
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10), -- 用户主观选择的强度
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 对话情绪记录表
CREATE TABLE public.conversation_emotion_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    emotion TEXT NOT NULL,
    behavioral_impact_score DECIMAL(4,2) NOT NULL, -- AI计算的行为影响分数 (0.00-10.00)
    conversation_text TEXT NOT NULL,               -- 完整对话内容
    emotion_evaluation JSONB,                     -- AI情绪评估结果
    polarity_analysis JSONB,                      -- 情绪极性分析
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===========================================
-- 第二步：创建索引提升查询性能
-- ===========================================

-- Quick Emotion Checks 索引
CREATE INDEX idx_quick_emotion_checks_user_id ON public.quick_emotion_checks(user_id);
CREATE INDEX idx_quick_emotion_checks_timestamp ON public.quick_emotion_checks(timestamp);
CREATE INDEX idx_quick_emotion_checks_emotion ON public.quick_emotion_checks(emotion);
CREATE INDEX idx_quick_emotion_checks_user_emotion ON public.quick_emotion_checks(user_id, emotion);

-- Conversation Emotion Records 索引
CREATE INDEX idx_conversation_emotion_records_user_id ON public.conversation_emotion_records(user_id);
CREATE INDEX idx_conversation_emotion_records_timestamp ON public.conversation_emotion_records(timestamp);
CREATE INDEX idx_conversation_emotion_records_emotion ON public.conversation_emotion_records(emotion);
CREATE INDEX idx_conversation_emotion_records_user_emotion ON public.conversation_emotion_records(user_id, emotion);

-- ===========================================
-- 第三步：设置Row Level Security (RLS)
-- ===========================================

-- 启用RLS
ALTER TABLE public.quick_emotion_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_emotion_records ENABLE ROW LEVEL SECURITY;

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
-- 第四步：数据迁移
-- ===========================================

-- 迁移 Quick Check 数据
-- 识别条件：note字段以"Quick check:"开头
INSERT INTO public.quick_emotion_checks (
    user_id, 
    emotion, 
    intensity, 
    timestamp, 
    created_at
)
SELECT 
    user_id,
    emotion,
    intensity,
    timestamp,
    created_at
FROM public.emotion_records 
WHERE note LIKE 'Quick check:%'
   OR note ~ '^Quick check:';

-- 迁移 Chat/Conversation 数据  
-- 识别条件：note字段不以"Quick check:"开头，且通常包含对话内容
INSERT INTO public.conversation_emotion_records (
    user_id,
    emotion,
    behavioral_impact_score,
    conversation_text,
    emotion_evaluation,
    polarity_analysis,
    timestamp,
    created_at
)
SELECT 
    user_id,
    emotion,
    CASE 
        WHEN intensity > 10 THEN 10.00  -- 确保不超过范围
        WHEN intensity < 0 THEN 0.00
        ELSE intensity::DECIMAL(4,2)
    END as behavioral_impact_score,
    COALESCE(note, '') as conversation_text,  -- 防止NULL
    emotion_evaluation,
    polarity_analysis,
    timestamp,
    created_at
FROM public.emotion_records 
WHERE note NOT LIKE 'Quick check:%'
   AND note !~ '^Quick check:';

-- ===========================================
-- 第五步：验证迁移结果
-- ===========================================

-- 检查迁移数量
DO $$
DECLARE
    original_count INTEGER;
    quick_count INTEGER;
    conversation_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO original_count FROM public.emotion_records;
    SELECT COUNT(*) INTO quick_count FROM public.quick_emotion_checks;
    SELECT COUNT(*) INTO conversation_count FROM public.conversation_emotion_records;
    
    RAISE NOTICE '=== 迁移结果验证 ===';
    RAISE NOTICE '原始记录数: %', original_count;
    RAISE NOTICE '快速检查记录数: %', quick_count;
    RAISE NOTICE '对话记录数: %', conversation_count;
    RAISE NOTICE '总迁移记录数: %', quick_count + conversation_count;
    
    IF original_count = quick_count + conversation_count THEN
        RAISE NOTICE '✅ 迁移成功！所有记录都已正确迁移';
    ELSE
        RAISE NOTICE '⚠️  迁移可能存在问题，请检查数据';
    END IF;
END $$;

-- 显示各表的示例数据
SELECT '=== Quick Emotion Checks Sample ===' as info;
SELECT * FROM public.quick_emotion_checks LIMIT 3;

SELECT '=== Conversation Emotion Records Sample ===' as info;  
SELECT id, user_id, emotion, behavioral_impact_score, 
       LEFT(conversation_text, 50) || '...' as conversation_preview,
       timestamp 
FROM public.conversation_emotion_records LIMIT 3;

-- ===========================================
-- 第六步：重命名旧表（备份）
-- ===========================================

-- 重命名旧表作为备份，而不是直接删除
ALTER TABLE public.emotion_records RENAME TO emotion_records_backup_before_split;

-- 添加注释说明
COMMENT ON TABLE public.emotion_records_backup_before_split IS 
'备份表：2025年情绪记录分表迁移前的原始数据，迁移验证通过后可安全删除';

COMMENT ON TABLE public.quick_emotion_checks IS 
'快速情绪检查记录：用户通过滑块快速记录的主观情绪感受';

COMMENT ON TABLE public.conversation_emotion_records IS 
'对话情绪记录：通过AI对话分析得出的深度情绪洞察和行为影响评估';

-- ===========================================
-- 迁移完成提示
-- ===========================================

SELECT '🎉 情绪记录分表迁移完成！' as status,
       '请更新应用代码以使用新的表结构' as next_step;