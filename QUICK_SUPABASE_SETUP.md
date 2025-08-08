# 🚀 Supabase 快速设置指南

## 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目：`breezie-emotion-app`
3. 设置强密码并保存

## 2. 获取连接字符串
在 Settings → Database 中复制：

**连接池URL** (用于生产):
```
postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**直连URL** (用于迁移):
```
postgresql://postgres.xxx:[PASSWORD]@xxx.pooler.supabase.com:5432/postgres
```

## 3. 创建 .env 文件
```bash
DATABASE_URL="[连接池URL]"
DIRECT_URL="[直连URL]"
JWT_SECRET="your-super-secret-jwt-key-make-it-very-long-and-random"
GEMINI_API_KEY="your-existing-gemini-key"
```

## 4. 运行数据库设置
```bash
# 推送数据库架构到Supabase
npm run db:push

# 测试连接
npm run db:init

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000/api/db-test 验证连接
```

## 5. Vercel部署配置
在Vercel项目设置中添加相同的环境变量：
- `DATABASE_URL`
- `DIRECT_URL` 
- `JWT_SECRET`
- `GEMINI_API_KEY`

## ✅ 完成！
数据库配置完成后，您可以：
- 在Supabase控制台查看数据表
- 开始开发用户认证功能
- 将现有本地数据迁移到云端

## 🆘 遇到问题？
1. 检查 `.env` 文件中的连接字符串
2. 确保密码正确替换了 `[PASSWORD]`
3. 查看完整指南：`SUPABASE_SETUP.md`