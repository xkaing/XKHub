# AI Assistant Guidelines for XKHub

## 项目概述

XKHub 是一个基于 Next.js + Supabase 的全栈 Web 应用，提供 PSN 奖杯管理、Warhammer 内容管理和社区功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: Ant Design 5
- **后端**: Supabase
- **语言**: TypeScript

## 目录结构规范

```
src/
├── app/                      # Next.js App Router（基于文件系统的路由）
│   ├── (auth)/              # 认证路由组（不需要认证）
│   │   └── login/
│   ├── (dashboard)/         # 仪表盘路由组（需要认证）
│   │   ├── accounts/
│   │   ├── moments/
│   │   ├── psn/trophies/
│   │   ├── psn/companies/
│   │   ├── psn/ips/
│   │   └── warhammer/40k/
│   │       └── warhammer/30k/
│   │       └── warhammer/joytoy/
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 首页（重定向到 /accounts 或 /login）
├── components/              # 可复用组件
│   └── dashboard/           # 仪表盘专用组件
├── lib/                     # 工具库
│   ├── supabase/           # Supabase 相关
│   │   ├── client.ts       # 浏览器端客户端
│   │   ├── server.ts       # 服务端客户端
│   │   └── auth.ts         # Server Actions
│   └── utils/              # 工具函数
├── hooks/                   # React Hooks（客户端）
├── types/                   # TypeScript 类型定义
└── data/                    # 静态数据文件
```

## 组件规范

### Server vs Client Components

- **Server Components** (`async function`): 用于直接获取数据，不需要交互
- **Client Components** (`'use client'`): 用于需要 hooks、事件处理、Ant Design 组件

### Ant Design 组件使用

由于 Ant Design 与 Next.js SSR 存在兼容性问题，所有使用 Ant Design 的页面和组件必须：

1. 添加 `'use client'` 指令
2. 或者将 Ant Design 组件封装在客户端组件中

### 推荐的组件结构

```typescript
// 客户端组件：包含 Ant Design 或需要交互
'use client'

import { useState } from 'react'
import { Button } from 'antd'

export default function MyClientComponent() {
  const [loading, setLoading] = useState(false)

  return <Button loading={loading}>Click</Button>
}
```

```typescript
// 服务端组件：直接获取数据
import { createClient } from '@/lib/supabase/server'

export default async function MyServerPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select('*')

  return <div>{JSON.stringify(data)}</div>
}
```

## 认证流程

### Middleware 保护

`middleware.ts` 保护所有 `(dashboard)` 路由：

- 未登录用户访问仪表盘路由时重定向到 `/login`
- 已登录用户访问 `/login` 时重定向到 `/accounts`

### Server Actions

认证相关的操作在 `src/lib/supabase/auth.ts` 中通过 Server Actions 处理：

- `loginAction(formData)`: 登录
- `logoutAction()`: 登出

## 数据库操作

### 客户端操作（客户端组件）

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data } = await supabase.from('table').select('*')
```

### 服务端操作（Server Components）

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select('*')

  return <div>{/* render */}</div>
}
```

## 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=       # Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase Anon Key（客户端可用）
SUPABASE_SERVICE_ROLE_KEY=      # Service Role Key（仅服务端）
```

## 代码风格

- 使用 TypeScript 进行类型检查
- 组件文件使用 `.tsx` 扩展名
- 纯类型文件使用 `.ts` 扩展名
- 组件名称使用 PascalCase
- 函数和变量使用 camelCase
- 优先使用 named exports 而不是 default exports（除页面组件外）

## 常见任务

### 添加新页面

1. 在 `src/app/(dashboard)/` 下创建目录
2. 创建 `page.tsx` 文件
3. 在 Dashboard Layout 的菜单中添加对应项

### 添加 Supabase 表操作

1. 在 `src/types/index.ts` 中添加类型定义
2. 根据场景选择使用客户端或服务端 Supabase 实例
3. 添加相应的数据获取/操作函数

### 修改主题

主题逻辑在 `src/components/ThemeProvider.tsx` 中管理，包括：

- 主题模式（light/dark/auto）
- Ant Design ConfigProvider 配置
- localStorage 持久化
