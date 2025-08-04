-- 数据库迁移：移除 conversation_summary 字段
-- 执行日期：根据需要执行
-- 说明：移除不再使用的对话概括功能相关字段

-- 从 emotion_records 表中删除 conversation_summary 字段
-- 注意：这个操作会永久删除该字段中的所有数据
-- 在生产环境执行前请确保已备份重要数据

ALTER TABLE public.emotion_records 
DROP COLUMN IF EXISTS conversation_summary;

-- 验证字段已被删除（可选）
-- 执行以下查询来确认字段不再存在：
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'emotion_records' 
-- AND table_schema = 'public'
-- AND column_name = 'conversation_summary';
-- 
-- 如果返回空结果，说明字段已成功删除

-- 迁移完成后的表结构应该包含以下字段：
-- - id (UUID, PRIMARY KEY)
-- - user_id (UUID, FOREIGN KEY)
-- - emotion (TEXT)
-- - intensity (INTEGER)
-- - note (TEXT)
-- - timestamp (TIMESTAMP WITH TIME ZONE)
-- - emotion_evaluation (JSONB)
-- - polarity_analysis (JSONB)
-- - created_at (TIMESTAMP WITH TIME ZONE)