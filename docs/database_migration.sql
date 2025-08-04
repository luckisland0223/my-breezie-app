-- Breezie数据库迁移脚本
-- 用于从已有数据库升级或重新创建表结构

-- ⚠️  重要提示：
-- 如果这是全新的数据库（没有任何表），请直接运行 database_schema.sql
-- 此迁移脚本仅用于已有数据库的升级

-- 如果你已经有旧的数据库结构，先运行这个迁移脚本

-- 1. 删除现有触发器（避免重复创建错误）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 删除现有函数（如果存在）
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- 3. 如果需要重建表（谨慎操作，会丢失数据）
-- 取消注释以下语句来重建表结构
/*
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.emotion_records CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
*/

-- 4. 如果只是更新现有表结构（保留数据）
-- 首先检查profiles表是否存在
DO $$
BEGIN
    -- 检查profiles表是否存在
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'profiles' 
                   AND table_schema = 'public') THEN
        RAISE NOTICE 'Table profiles does not exist. This appears to be a fresh database. Please run database_schema.sql instead of migration script.';
        RETURN;
    END IF;
    
    -- 检查是否存在full_name字段需要重命名为user_name
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' 
               AND column_name = 'full_name' 
               AND table_schema = 'public') THEN
        
        -- 如果存在user_name字段，先删除它
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'user_name' 
                   AND table_schema = 'public') THEN
            ALTER TABLE public.profiles DROP COLUMN user_name;
        END IF;
        
        -- 重命名full_name为user_name
        ALTER TABLE public.profiles RENAME COLUMN full_name TO user_name;
        
        -- 添加唯一约束
        ALTER TABLE public.profiles ALTER COLUMN user_name SET NOT NULL;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_name_unique UNIQUE (user_name);
        
        -- 创建索引
        CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);
        
        RAISE NOTICE 'Successfully migrated full_name to user_name';
    END IF;
    
    -- 如果profiles表不存在user_name字段，添加它
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' 
                   AND column_name = 'user_name' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.profiles ADD COLUMN user_name TEXT;
        
        -- 为现有用户生成唯一用户名（基于email）
        UPDATE public.profiles 
        SET user_name = CONCAT('user_', EXTRACT(EPOCH FROM created_at)::bigint)
        WHERE user_name IS NULL;
        
        -- 设置非空约束和唯一约束
        ALTER TABLE public.profiles ALTER COLUMN user_name SET NOT NULL;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_name_unique UNIQUE (user_name);
        
        -- 创建索引
        CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_name ON public.profiles(user_name);
        
        RAISE NOTICE 'Successfully added user_name column';
    END IF;
END
$$;

-- 现在运行完整的数据库schema脚本