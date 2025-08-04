# 使用NextAuth.js替换Supabase Auth

## 安装NextAuth.js

```bash
npm install next-auth
npm install @auth/prisma-adapter prisma @prisma/client  # 如果使用数据库
```

## 配置NextAuth.js

### 1. 创建配置文件

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 自定义验证逻辑
        if (credentials?.email && credentials?.password) {
          // 验证用户凭据
          const user = await validateUser(credentials.email, credentials.password)
          if (user) {
            return user
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  }
})

export { handler as GET, handler as POST }
```

### 2. 创建登录组件

```typescript
// src/components/auth/NextAuthLogin.tsx
'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function NextAuthLogin() {
  const { data: session, status } = useSession()

  if (status === "loading") return <p>Loading...</p>

  if (session) {
    return (
      <>
        <p>Signed in as {session.user?.email}</p>
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    )
  }

  return (
    <>
      <Button onClick={() => signIn('google')}>Sign in with Google</Button>
      <Button onClick={() => signIn('github')}>Sign in with GitHub</Button>
    </>
  )
}
```

### 3. 环境变量配置

```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```