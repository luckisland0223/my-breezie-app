# Breezie 云端数据库设置指南

## 概述
Breezie情绪健康助手现在支持云端数据存储和跨设备同步！您的情绪数据将安全地存储在Supabase数据库中，并在不同设备间自动同步。

## 功能特点
✅ **真正的用户认证**: 使用Supabase Auth进行安全的用户注册和登录  
✅ **云端数据存储**: 情绪记录保存在PostgreSQL数据库中  
✅ **跨设备同步**: 在任何设备上登录同一账号即可访问所有数据  
✅ **实时同步状态**: 显示数据同步状态和最后同步时间  
✅ **离线支持**: 离线时数据保存在本地，联网后自动同步  

## 设置步骤

### 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 注册账号并创建新项目
3. 等待项目初始化完成（约2分钟）

### 2. 设置数据库
1. 在Supabase控制台中，点击左侧菜单的 "SQL Editor"
2. 复制 `docs/database_schema.sql` 中的所有SQL代码
3. 粘贴到SQL编辑器中并点击 "Run" 执行
4. 确认所有表和策略创建成功

### 3. 获取API密钥
1. 在Supabase控制台中，点击左侧菜单的 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **Project API keys** 中的 **anon public** 密钥

### 4. 配置应用
1. 启动Breezie应用
2. 点击右上角的设置按钮 → "App Settings"
3. 在Supabase配置页面中输入：
   - Supabase URL: 您的项目URL
   - Supabase Anon Key: 您的anon public密钥
4. 点击 "Save Configuration"
5. 点击 "Test Connection" 确认连接成功

## 如何使用

### 用户注册和登录
1. 点击右上角的 "Sign In" 按钮
2. 切换到 "Sign Up" 标签页创建新账号
3. 输入用户名（必须唯一）、邮箱和密码
4. 系统会自动检查用户名可用性
5. 点击 "Create Account" 完成注册

**用户名规则：**
- 长度2-30个字符
- 只能包含字母、数字、下划线(_)和连字符(-)
- 必须在整个系统中唯一

### 数据同步
- **自动同步**: 登录后，应用会自动从云端加载您的数据
- **手动同步**: 点击同步状态旁边的刷新按钮手动同步
- **同步状态**: 
  - 🟢 "Cloud Sync" - 已连接，数据会自动同步
  - 🔴 "Offline" - 离线模式，数据保存在本地
  - ⚪ "Local Mode" - 未登录，使用本地存储

### 跨设备使用
1. 在新设备上打开Breezie
2. 配置相同的Supabase设置
3. 使用相同的账号登录
4. 您的所有情绪记录和对话历史将自动同步

## 数据安全
- **数据加密**: 所有数据在传输过程中使用HTTPS加密
- **用户隔离**: 每个用户只能访问自己的数据
- **行级安全**: 使用Supabase RLS确保数据安全
- **本地备份**: 数据同时保存在本地和云端

## 故障排除

### 连接测试失败
1. 检查Supabase URL和API密钥是否正确
2. 确认Supabase项目处于活跃状态
3. 检查网络连接
4. 确认数据库schema已正确创建

### 数据同步问题
1. 检查网络连接状态
2. 尝试手动刷新同步
3. 重新登录账号
4. 检查浏览器控制台是否有错误信息

### 登录失败
1. 确认邮箱和密码正确
2. 检查Supabase Auth是否正确配置
3. 确认网络连接正常

## 技术架构

### 数据库表结构
- `profiles`: 用户配置信息（包含唯一用户名）
- `emotion_records`: 情绪记录
- `chat_sessions`: 聊天会话
- `chat_messages`: 聊天消息

**重要数据库约束：**
- `profiles.user_name`: 唯一约束，不可重复
- 自动创建唯一性索引确保用户名全局唯一

### API路由
- `/api/auth/signup`: 用户注册（包含用户名唯一性验证）
- `/api/auth/signin`: 用户登录
- `/api/auth/signout`: 用户登出
- `/api/auth/check-username`: 检查用户名可用性
- `/api/emotions`: 情绪记录CRUD
- `/api/sync`: 数据同步

### 状态管理
- `emotionDatabase.ts`: 增强的情绪数据管理，支持数据库同步
- `auth.ts`: 用户认证状态管理
- `supabase.ts`: Supabase配置管理

## 迁移说明
从本地版本升级到云端版本：
1. 现有的本地数据会保留
2. 注册账号后，本地数据会自动上传到云端
3. 建议先备份重要数据（导出功能待开发）

## 支持
如遇到问题，请检查：
1. 浏览器控制台错误信息
2. Supabase项目状态
3. 网络连接
4. API密钥配置

---
*更新时间: 2025年1月*