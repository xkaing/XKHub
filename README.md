# XKHub

一个基于 Next.js + Supabase 的现代化 Web 应用，提供 PSN 奖杯管理、Warhammer 内容管理和 XKALLive 社区功能。

## 在线访问

项目已部署，可通过以下地址访问：

**访问地址**: [https://www.xiaokai.wang/](https://www.xiaokai.wang/)

## 功能特性

### 用户认证

- 基于 Supabase 的用户登录认证
- 用户资料管理
- 安全的会话管理

### PSN 管理

- **PSN Trophies**: PSN 奖杯管理
- **Game Company**: 游戏公司信息管理
- **Game IP**: 游戏 IP 管理

### Warhammer

- **40K**: Warhammer 40K 相关内容
- **30K**: 荷鲁斯叛乱相关内容（30K）
- **JOYTOY**: JOYTOY 模型收藏管理

### XKALLive

- **Accounts**: 用户账号管理
- **Moments**: 社区动态管理

### 主题系统

- 支持亮色/暗色主题
- 自动跟随系统主题
- 主题设置持久化存储

## 项目结构

```
XKHUB/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/login/       # 登录页
│   │   ├── (dashboard)/        # 仪表盘（需认证）
│   │   │   ├── accounts/       # 账号管理
│   │   │   ├── moments/        # 朋友圈
│   │   │   ├── psn/            # PSN 相关
│   │   │   │   ├── trophies/   # PSN 成就
│   │   │   │   ├── companies/  # 游戏公司
│   │   │   │   └── ips/       # 游戏IP
│   │   │   └── warhammer/      # 战锤相关
│   │   │       ├── 40k/       # 40K
│   │   │       ├── 30k/       # 30K
│   │   │       └── joytoy/     # JOYTOY
│   │   ├── layout.tsx          # 根布局
│   │   └── page.tsx            # 首页重定向
│   ├── components/
│   │   └── dashboard/          # 仪表盘组件
│   │       ├── Login.tsx
│   │       ├── AddBotModal.tsx
│   │       └── EditProfileModal.tsx
│   ├── lib/
│   │   └── supabase/          # Supabase 配置
│   │       ├── client.ts       # 客户端实例
│   │       ├── server.ts       # 服务端实例
│   │       └── auth.ts         # Server Actions
│   ├── hooks/
│   │   └── useTheme.tsx       # 主题管理
│   ├── types/
│   │   └── index.ts           # TypeScript 类型
│   └── data/
│       └── JOYTOY.json        # JOYTOY 数据
├── database/                    # 数据库脚本
├── public/                     # 静态资源
├── middleware.ts               # 路由中间件
├── next.config.mjs            # Next.js 配置
├── package.json
└── tsconfig.json
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase Anon Key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase Service Role Key
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 组件库**: Ant Design 5
- **后端服务**: Supabase
- **代码规范**: ESLint + TypeScript

## 核心模块说明

### Server Actions (`src/lib/supabase/auth.ts`)

封装了认证相关的 Server Actions：

- `loginAction`: 处理用户登录
- `logoutAction`: 处理用户登出
- `getUser`: 获取当前用户
- `getProfile`: 获取用户资料

### Supabase 客户端

- `client.ts`: 浏览器端客户端（用于客户端组件）
- `server.ts`: 服务端客户端（用于 Server Components）

### 主题系统

使用 Ant Design 的 ConfigProvider 配合客户端 ThemeProvider 实现主题切换。

## 开发指南

### 添加新页面

1. 在 `src/app/(dashboard)/` 下创建新的路由目录
2. 添加 `page.tsx` 文件
3. 在 Sidebar 菜单中添加对应的菜单项

### 添加新的工具函数

在 `src/lib/utils/` 目录下创建新的工具函数文件。

## 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Ant Design 文档](https://ant.design/)
- [Supabase 文档](https://supabase.com/docs)

## 许可证

本项目采用 MIT 许可证。
