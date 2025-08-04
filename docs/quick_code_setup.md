# 🚀 代码中直接配置Supabase（推荐）

如果您不想让用户手动配置，可以直接在代码中设置Supabase配置！

## 方法1：代码文件配置（最简单）

### 第1步：编辑配置文件

打开 `src/config/database.ts` 文件，找到这部分：

```typescript
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  // 📝 将此处替换为您的Supabase项目URL
  url: 'https://your-project-id.supabase.co',
  
  // 📝 将此处替换为您的Supabase anon public 密钥
  anonKey: 'your-anon-public-key-here',
  
  // ✅ 配置完成后将此处改为 true
  isConfigured: false
}
```

### 第2步：替换为您的实际配置

```typescript
export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  // 替换为您的实际URL
  url: 'https://abcdefghijklm.supabase.co',
  
  // 替换为您的实际API密钥
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here',
  
  // 改为 true 启用配置
  isConfigured: true
}
```

### 第3步：完成！

- 重启应用：`npm run dev`
- 数据库自动连接，无需用户配置
- 用户可以直接注册使用

## 方法2：环境变量配置

### 第1步：创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 第2步：修改配置文件

修改 `src/config/database.ts`：

```typescript
export const getDbConfig = (): DatabaseConfig => {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isConfigured: true
    }
  }
  
  // 其他逻辑保持不变...
}
```

## 获取Supabase配置信息

### 1. 创建Supabase项目
- 访问 [supabase.com](https://supabase.com)
- 创建新项目
- 等待初始化完成

### 2. 运行数据库脚本
- 在SQL Editor中运行 `docs/database_schema.sql`

### 3. 获取配置信息
- 进入 Settings → API
- 复制 **Project URL**
- 复制 **anon public** 密钥

### 4. 应用到代码
- 粘贴到配置文件中
- 设置 `isConfigured: true`

## 用户体验

配置完成后，用户将看到：
- ✅ "数据库已配置" 绿色提示
- 自动启用云端存储和同步
- 无需手动配置步骤
- 直接可以注册使用

## 安全注意事项

- ✅ `anon public` 密钥可以安全地暴露在前端代码中
- ✅ Supabase的RLS（行级安全）会保护用户数据
- ⚠️ 不要在代码中暴露 `service_role` 密钥
- 💡 对于开源项目，建议使用环境变量方式

## 最佳实践

1. **开发环境**：使用代码配置，快速开发
2. **演示项目**：直接硬编码配置，用户即开即用
3. **生产环境**：使用环境变量，安全部署

现在您可以选择最适合的方式直接在代码中配置Supabase了！🎉