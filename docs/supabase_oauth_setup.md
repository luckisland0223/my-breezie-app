# Supabase OAuth第三方登录设置指南

## 在Supabase中配置OAuth提供商

### 1. Google OAuth设置

#### 在Google Cloud Console中：
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择项目
3. 启用 "Google+ API"
4. 创建OAuth 2.0凭据
5. 设置授权重定向URI：
   ```
   https://你的项目ID.supabase.co/auth/v1/callback
   ```
6. 复制客户端ID和客户端密钥

#### 在Supabase中：
1. 进入项目控制台 → Authentication → Settings
2. 找到 "Auth Providers" 部分
3. 启用 Google
4. 填入：
   - Client ID: 您的Google客户端ID
   - Client Secret: 您的Google客户端密钥
5. 保存设置

### 2. GitHub OAuth设置

#### 在GitHub中：
1. 访问 GitHub → Settings → Developer settings → OAuth Apps
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: 您的应用名称
   - Homepage URL: `http://localhost:3000` (开发环境)
   - Authorization callback URL: 
     ```
     https://你的项目ID.supabase.co/auth/v1/callback
     ```
4. 创建应用后复制 Client ID 和 Client Secret

#### 在Supabase中：
1. 进入项目控制台 → Authentication → Settings
2. 找到 "Auth Providers" 部分
3. 启用 GitHub
4. 填入：
   - Client ID: 您的GitHub客户端ID
   - Client Secret: 您的GitHub客户端密钥
5. 保存设置

### 3. 配置重定向URL

在Supabase的Authentication → URL Configuration中设置：
- Site URL: `http://localhost:3001` (您的应用地址)
- Redirect URLs: 添加 `http://localhost:3001/auth/callback`

## 测试OAuth登录

现在您可以：
1. 重启应用：`npm run dev`
2. 访问登录页面
3. 点击 "第三方登录" 标签
4. 测试Google或GitHub登录

## 完全替换Supabase Auth的方案

如果您想完全不使用Supabase的身份验证，可以选择：

### 推荐方案排序：

1. **NextAuth.js** - 功能最全面，支持最多第三方提供商
2. **Firebase Auth** - Google出品，稳定可靠
3. **Auth0** - 企业级解决方案
4. **自定义系统** - 最灵活但需要更多开发工作

每种方案的详细实现请参考：
- `docs/alternative_auth_nextauth.md`
- `docs/alternative_auth_custom.md`