# 自定义第三方验证系统

## 方案1：使用Firebase Auth

### 安装Firebase

```bash
npm install firebase
```

### 配置Firebase

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... 其他配置
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

### 创建Firebase登录组件

```typescript
// src/components/auth/FirebaseAuth.tsx
'use client'

import { signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function FirebaseAuth() {
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // 处理登录成功
      console.log('Google登录成功:', user)
      toast.success('登录成功！')
    } catch (error) {
      console.error('Google登录失败:', error)
      toast.error('登录失败')
    }
  }

  const signInWithGitHub = async () => {
    try {
      const provider = new GithubAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // 处理登录成功
      console.log('GitHub登录成功:', user)
      toast.success('登录成功！')
    } catch (error) {
      console.error('GitHub登录失败:', error)
      toast.error('登录失败')
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={signInWithGoogle} className="w-full">
        使用Google登录
      </Button>
      <Button onClick={signInWithGitHub} className="w-full">
        使用GitHub登录
      </Button>
    </div>
  )
}
```

## 方案2：使用Auth0

### 安装Auth0

```bash
npm install @auth0/nextjs-auth0
```

### 配置Auth0

```typescript
// src/app/api/auth/[...auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0'

export const GET = handleAuth()
```

### 环境变量

```bash
# .env.local
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
```

### 使用Auth0登录

```typescript
// src/components/auth/Auth0Login.tsx
'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { Button } from '@/components/ui/button'

export function Auth0Login() {
  const { user, error, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  if (user) {
    return (
      <div>
        <p>Welcome {user.name}!</p>
        <a href="/api/auth/logout">
          <Button>Logout</Button>
        </a>
      </div>
    )
  }

  return (
    <a href="/api/auth/login">
      <Button>Login</Button>
    </a>
  )
}
```

## 方案3：完全自定义验证

### 使用JWT + 第三方API

```typescript
// src/lib/customAuth.ts
import jwt from 'jsonwebtoken'

interface User {
  id: string
  email: string
  name: string
  provider: string
}

export class CustomAuth {
  private static instance: CustomAuth
  
  static getInstance() {
    if (!CustomAuth.instance) {
      CustomAuth.instance = new CustomAuth()
    }
    return CustomAuth.instance
  }

  async signInWithGoogle(googleToken: string): Promise<User> {
    // 验证Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleToken}`)
    const googleUser = await response.json()
    
    if (!googleUser.email) {
      throw new Error('Google登录失败')
    }

    // 创建自己的用户对象
    const user: User = {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      provider: 'google'
    }

    // 生成JWT token
    const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '7d' })
    
    // 保存到自己的数据库
    await this.saveUserToDatabase(user)
    
    return user
  }

  async signInWithGitHub(githubToken: string): Promise<User> {
    // 类似的GitHub验证逻辑
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`
      }
    })
    
    const githubUser = await response.json()
    
    // 处理GitHub用户数据...
    return {
      id: githubUser.id.toString(),
      email: githubUser.email,
      name: githubUser.name || githubUser.login,
      provider: 'github'
    }
  }

  private async saveUserToDatabase(user: User) {
    // 保存用户到您的数据库
    // 可以继续使用Supabase数据库，只是不用它的Auth
  }
}
```