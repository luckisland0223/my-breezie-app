# 🗄️ Supabase + Vercel 完整配置指南

## 概述

本指南将帮助您配置Supabase数据库与Vercel部署的完整集成。

## 📋 配置步骤

### 1. 创建Supabase项目

1. **访问Supabase**: 前往 [supabase.com](https://supabase.com)
2. **登录或注册**: 使用GitHub账号登录（推荐）
3. **创建新项目**:
   - 点击 "New Project"
   - 选择组织（或创建新组织）
   - 项目设置：
     ```
     Name: breezie-emotion-app
     Database Password: [创建强密码并保存]
     Region: [选择离用户最近的区域]
     ```

### 2. 获取数据库连接信息

在Supabase项目控制台中：

1. 转到 **Settings** → **Database**
2. 滚动到 **Connection string** 部分
3. 复制两个连接字符串：

**连接池URL（用于Vercel部署）**:
```
postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**直连URL（用于数据库迁移）**:
```
postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
```

### 3. 配置本地环境变量

在项目根目录创建 `.env` 文件：

```bash
# Supabase数据库连接
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxxxxxxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# JWT密钥（用于用户认证）
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random"

# Gemini API密钥（现有）
GEMINI_API_KEY="your-gemini-api-key"

# 可选：Supabase公共配置（如果要使用Supabase Auth）
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. 运行数据库迁移

```bash
# 重新生成Prisma客户端
npx prisma generate

# 将数据库架构推送到Supabase
npx prisma db push

# 验证数据库连接
npm run dev
# 然后访问 http://localhost:3000/api/db-test
```

### 5. 配置Vercel环境变量

1. **访问Vercel控制台**: 前往 [vercel.com](https://vercel.com)
2. **选择项目**: 找到您的Breezie项目
3. **添加环境变量**:
   - 转到 **Settings** → **Environment Variables**
   - 添加以下变量：
     ```
     DATABASE_URL = [您的连接池URL]
     DIRECT_URL = [您的直连URL]
     JWT_SECRET = [强密码字符串]
     GEMINI_API_KEY = [您的Gemini API密钥]
     ```
4. **重新部署**: 环境变量更新后，Vercel会自动重新部署

### 6. 验证配置

#### 本地验证
```bash
# 启动开发服务器
npm run dev

# 测试数据库连接
curl http://localhost:3000/api/db-test
```

应该返回：
```json
{
  "status": "success",
  "message": "Database connection successful",
  "timestamp": "2025-01-XX..."
}
```

#### 生产环境验证
```bash
# 部署到Vercel后
curl https://your-app.vercel.app/api/db-test
```

### 7. Supabase控制台功能

配置完成后，您可以在Supabase控制台中：

1. **Table Editor**: 查看和编辑数据表
2. **SQL Editor**: 运行自定义SQL查询
3. **Database**: 监控连接和性能
4. **Auth**: 配置用户认证（可选）
5. **Storage**: 管理文件上传（用于头像等）

### 8. 性能优化建议

#### 连接池配置
```typescript
// src/lib/prisma.ts 已优化
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})
```

#### 查询优化
- 使用索引（已在schema中配置）
- 限制查询结果数量
- 使用分页而不是一次性加载所有数据

## 🚨 常见问题

### 连接问题

**错误**: `Connection timeout`
**解决**: 确保使用连接池URL (port 6543)

**错误**: `SSL required`
**解决**: Supabase默认要求SSL，无需额外配置

**错误**: `Authentication failed`
**解决**: 检查密码是否正确，确保在连接字符串中替换了`[YOUR-PASSWORD]`

### 迁移问题

**错误**: `Migration failed`
**解决**: 使用DIRECT_URL进行迁移操作

**错误**: `Table already exists`
**解决**: 使用 `npx prisma db push --force-reset`（仅开发环境）

### Vercel部署问题

**错误**: `Environment variable not found`
**解决**: 确保在Vercel设置中添加了所有必需的环境变量

**错误**: `Function timeout`
**解决**: 检查数据库连接池配置，确保使用正确的连接字符串

## 🔒 安全最佳实践

1. **强密码**: 使用强数据库密码
2. **环境变量**: 永远不要将`.env`文件提交到代码仓库
3. **JWT密钥**: 使用长且随机的JWT密钥
4. **RLS**: 在Supabase中启用行级安全（Row Level Security）
5. **备份**: 定期备份数据库

## 📈 监控和维护

1. **Supabase监控**: 在控制台中监控数据库性能
2. **Vercel分析**: 使用Vercel Analytics监控应用性能
3. **日志**: 检查Vercel函数日志以发现问题
4. **更新**: 定期更新Prisma和其他依赖项

## 🎯 下一步

配置完成后：
1. ✅ 测试数据库连接
2. ✅ 验证Vercel部署
3. 🔄 继续实施用户认证系统
4. 🔄 迁移现有本地数据到云数据库

---

配置完成后，请运行测试确保一切正常工作，然后我们可以继续进行用户认证系统的开发！