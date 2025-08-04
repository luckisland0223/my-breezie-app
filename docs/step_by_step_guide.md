# 🔧 Supabase数据库设置详细操作步骤

## 第一步：访问Supabase控制台

1. **打开浏览器，访问您的Supabase项目**
   - 登录 [supabase.com](https://supabase.com)
   - 点击您的项目（项目名称）进入控制台

2. **找到SQL编辑器**
   - 在左侧导航栏中，找到并点击 **"SQL Editor"**
   - 图标看起来像 `</>`

## 第二步：准备SQL脚本

1. **在您的电脑上找到文件**
   - 打开项目文件夹：`1-Breezie`
   - 进入 `docs` 文件夹
   - 找到 `database_schema.sql` 文件

2. **打开并复制SQL内容**
   - 用任意文本编辑器打开 `database_schema.sql`（记事本、VS Code、或直接在GitHub/文件管理器中查看）
   - 选择**全部内容**（Ctrl+A 或 Cmd+A）
   - 复制（Ctrl+C 或 Cmd+C）

## 第三步：在Supabase中运行脚本

1. **清空SQL编辑器**
   - 在Supabase的SQL编辑器中，如果有任何现有内容，全选并删除

2. **粘贴SQL脚本**
   - 将复制的SQL内容粘贴到编辑器中（Ctrl+V 或 Cmd+V）
   - 确保所有内容都粘贴完整

3. **执行脚本**
   - 点击右下角的绿色 **"Run"** 按钮
   - 或使用快捷键 Ctrl+Enter（Windows）或 Cmd+Enter（Mac）

## 第四步：验证执行结果

1. **检查执行状态**
   - 等待脚本执行完成（通常需要几秒钟）
   - 如果成功，您会看到绿色的成功消息
   - 如果有错误，会显示红色的错误信息

2. **成功的标志**
   - 看到类似 "Success. No rows returned" 或 "Query executed successfully" 的消息
   - 没有红色错误信息

## 第五步：验证表是否创建成功

1. **检查数据库表**
   - 在左侧导航栏点击 **"Table Editor"**
   - 您应该能看到以下表：
     - `profiles`
     - `emotion_records`
     - `chat_sessions`
     - `chat_messages`

2. **检查profiles表结构**
   - 点击 `profiles` 表
   - 确认包含以下字段：
     - `id` (uuid)
     - `email` (text)
     - `user_name` (text) ← 重要：应该是user_name，不是full_name
     - `avatar_url` (text)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

## 第六步：获取API密钥

1. **进入API设置**
   - 在左侧导航栏点击 **"Settings"**
   - 点击 **"API"**

2. **复制必要信息**
   - **Project URL**: 复制 "Project URL"（类似 `https://xxxxx.supabase.co`）
   - **API Key**: 复制 "Project API keys" 下的 **"anon public"** 密钥（很长的字符串）

## 第七步：在Breezie应用中配置

1. **启动Breezie应用**
   ```bash
   npm run dev
   ```

2. **访问设置页面**
   - 打开浏览器访问 `http://localhost:3001`
   - 点击右上角用户头像旁的设置按钮
   - 点击 "App Settings"

3. **输入数据库配置**
   - **Supabase URL**: 粘贴您复制的Project URL
   - **Supabase Anon Key**: 粘贴您复制的API密钥
   - 点击 **"Save Configuration"**
   - 点击 **"Test Connection"** 验证连接

## 🎉 完成！测试功能

1. **注册测试用户**
   - 点击 "Sign In" → "Sign Up"
   - 输入用户名、邮箱、密码
   - 观察用户名可用性检查是否正常工作
   - 完成注册

2. **测试数据同步**
   - 记录一个情绪
   - 查看同步状态（应显示"Cloud Sync"）
   - 在不同浏览器或设备上登录同一账号，验证数据同步

## ❓ 常见问题

### Q: SQL脚本运行时出现错误怎么办？
A: 
- 检查是否复制了完整的脚本内容
- 确保您的Supabase项目是活跃状态
- 如果是权限错误，确保您是项目的所有者

### Q: 找不到SQL Editor怎么办？
A: 
- 确保您已登录正确的Supabase账号
- 确保您点击的是正确的项目
- 刷新页面重试

### Q: Test Connection失败怎么办？
A: 
- 检查URL和API密钥是否正确复制
- 确保没有多余的空格
- 确保Supabase项目处于活跃状态

### Q: 用户名检查不工作怎么办？
A: 
- 确保profiles表已正确创建
- 确保user_name字段存在且有UNIQUE约束
- 检查浏览器控制台是否有JavaScript错误

---

按照这些步骤操作，您就能成功设置Breezie的云端数据库了！🚀