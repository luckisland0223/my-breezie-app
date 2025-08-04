# 生产环境问题排查指南

## 常见问题与解决方案

### 1. Supabase CORS配置问题

#### 在Supabase控制台中：
1. 进入项目控制台 → Authentication → Settings
2. 找到 "Site URL" 和 "Additional Redirect URLs"
3. 添加您的生产域名：
   ```
   Site URL: https://www.breezie.io
   Redirect URLs: 
   - https://www.breezie.io
   - https://www.breezie.io/auth/callback
   ```

### 2. 环境变量配置

#### 如果使用Vercel部署：
在Vercel项目设置中添加环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=https://bfxbqhohgdovkfveafpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 如果使用Netlify部署：
在Netlify项目设置中添加环境变量：
```
NEXT_PUBLIC_SUPABASE_URL=https://bfxbqhohgdovkfveafpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 常见错误类型

#### 错误A：Hydration Mismatch
```
Warning: Text content did not match. Server: ... Client: ...
```
**解决方案**：检查服务端渲染和客户端渲染差异

#### 错误B：CORS Policy
```
Access to fetch at 'https://...supabase.co' has been blocked by CORS policy
```
**解决方案**：在Supabase中配置正确的域名白名单

#### 错误C：Module Not Found
```
Module not found: Can't resolve '...'
```
**解决方案**：检查import路径和依赖安装

#### 错误D：Authentication Error
```
Auth session missing!
```
**解决方案**：检查Supabase配置和环境变量

### 4. 快速修复检查清单

- [ ] Supabase控制台中配置了正确的Site URL
- [ ] Supabase控制台中添加了重定向URL
- [ ] 部署平台配置了环境变量（如果需要）
- [ ] 检查API路由是否在生产环境中正常工作
- [ ] 检查静态资源是否正确加载

### 5. 调试步骤

1. **打开浏览器开发者工具**
2. **查看Console标签页**
3. **查看Network标签页**
4. **查看Elements标签页检查DOM**
5. **尝试硬刷新页面** (Cmd+Shift+R)