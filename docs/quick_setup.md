# Breezie 快速数据库设置指南

## 🎯 根据您的情况选择正确的脚本

### 情况1：全新的Supabase项目（推荐）
**如果您刚创建了Supabase项目，没有运行过任何SQL脚本：**

✅ **直接运行：** `docs/database_schema.sql`

```sql
-- 在Supabase SQL编辑器中运行此文件的全部内容
-- 这会创建所有需要的表、索引、触发器和安全策略
```

### 情况2：已有旧版本的Breezie数据库
**如果您之前运行过旧版本的数据库脚本：**

1️⃣ **先运行：** `docs/database_migration.sql`  
2️⃣ **再运行：** `docs/database_schema.sql`

### 情况3：遇到"trigger already exists"错误
**如果您在运行database_schema.sql时遇到触发器重复错误：**

现在的 `database_schema.sql` 已经包含了防重复逻辑，可以直接重新运行。

## 🚨 常见错误解决

### 错误1：`relation "public.profiles" does not exist`
**原因：** 您在全新数据库上运行了迁移脚本  
**解决：** 请运行 `database_schema.sql` 而不是 `database_migration.sql`

### 错误2：`trigger "on_auth_user_created" already exists`
**原因：** 触发器已存在  
**解决：** 使用更新后的 `database_schema.sql`（包含防重复逻辑）

### 错误3：`column "user_name" already exists`
**原因：** 表结构已更新  
**解决：** 数据库已是最新版本，无需额外操作

## 📋 完整设置检查清单

✅ Supabase项目已创建  
✅ 获取了Project URL和API Key  
✅ 运行了正确的SQL脚本  
✅ 在Breezie应用中配置了数据库连接  
✅ 测试连接成功  
✅ 注册测试用户验证功能  

## 🔍 验证安装成功

运行以下SQL查询验证表是否正确创建：

```sql
-- 检查所有表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 应该看到：
-- chat_messages
-- chat_sessions  
-- emotion_records
-- profiles

-- 检查用户名字段约束
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- user_name字段应该是NOT NULL且有UNIQUE约束
```

## 🎉 设置完成后

1. 在Breezie应用的设置页面输入数据库配置
2. 点击"Test Connection"确认连接成功
3. 注册一个测试用户验证系统正常工作
4. 开始使用您的云端情绪健康助手！