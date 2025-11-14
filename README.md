# XKHub

一个基于 React + Vite + Supabase 的现代化 Web 应用，提供 PSN 奖杯管理、Warhammer 内容管理和 XKALLive 社区功能。

## ✨ 功能特性

### 🔐 用户认证

- 基于 Supabase 的用户登录认证
- 用户资料管理
- 安全的会话管理

### 🎮 PSN 管理 w

- **PSN Trophies**: PSN 奖杯管理
- **Game Company**: 游戏公司信息管理
- **Game IP**: 游戏 IP 管理

### ⚔️ Warhammer

- **40K**: Warhammer 40K 相关内容
- **The Horus Heresy**: 荷鲁斯叛乱相关内容

### 🌐 XKALLive

- **Accounts**: 用户账号管理
- **Moments**: 社区动态管理

### 🎨 主题系统

- 支持亮色/暗色主题
- 自动跟随系统主题
- 主题设置持久化存储

## 🏗️ 项目结构

```
XKHub/
├── src/
│   ├── components/          # 公共组件
│   │   ├── Login.jsx       # 登录组件
│   │   └── Sidebar.jsx     # 侧边栏组件
│   ├── pages/              # 页面组件
│   │   ├── PSNTrophiesPage.jsx
│   │   ├── GameCompaniesPage.jsx
│   │   ├── GameIPsPage.jsx
│   │   ├── W40KPage.jsx
│   │   ├── TheHorusHeresyPage.jsx
│   │   ├── AccountsPage.jsx
│   │   ├── MomentsPage.jsx
│   │   └── DefaultPage.jsx
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useAuth.js      # 用户认证 Hook
│   │   └── useTheme.js     # 主题管理 Hook
│   ├── utils/              # 工具函数
│   │   ├── dateFormat.js   # 日期格式化
│   │   └── themeUtils.js   # 主题工具函数
│   ├── constants/          # 常量配置
│   │   ├── menuItems.js    # 菜单项配置
│   │   └── themeMenuItems.js # 主题菜单配置
│   ├── config/             # 配置文件
│   │   └── routes.js       # 路由配置
│   ├── lib/                # 第三方库配置
│   │   └── supabase.js     # Supabase 客户端
│   ├── App.jsx             # 主应用组件
│   └── main.jsx            # 应用入口
├── database/               # 数据库脚本
│   ├── init_profiles_sync.sql
│   ├── sync_users_to_profiles.sql
│   └── README.md
├── public/                 # 静态资源
├── superbase.json          # Supabase 配置
├── package.json
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 配置 Supabase

1. 复制 `superbase.json` 文件（如果不存在）
2. 配置你的 Supabase 项目信息：

```json
{
  "SupabaseConfig": {
    "supabaseURL": "你的 Supabase URL",
    "supabaseKey": "你的 Supabase Key",
    "profilesTable": "profiles",
    "momentsTable": "moments",
    "imageBucket": "image",
    "avatarPathPrefix": "avatars",
    "momentImagePathPrefix": "moments",
    "imageCompressionQuality": 1.0,
    "maxFileSize": 5242880,
    "allowedImageMimeTypes": ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  }
}
```

### 数据库设置

参考 `database/README.md` 中的说明设置数据库表和同步触发器。

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📦 技术栈

- **前端框架**: React 18.3
- **构建工具**: Vite 7.1
- **UI 组件库**: Ant Design 5.21
- **后端服务**: Supabase
- **代码规范**: ESLint

## 🎯 核心模块说明

### Hooks

#### `useAuth`

管理用户认证状态和用户资料：

- 自动检查登录状态
- 监听认证状态变化
- 获取用户资料信息

#### `useTheme`

管理应用主题：

- 支持亮色/暗色/自动三种模式
- 主题设置持久化
- 自动跟随系统主题

### 页面组件

所有页面组件位于 `src/pages/` 目录下，每个页面都是独立的组件，便于维护和扩展。

### 工具函数

- `formatDateTime`: 统一的日期时间格式化
- `getThemeIcon`: 获取主题图标

### 配置

- `menuItems`: 侧边栏菜单配置
- `routeConfig`: 路由与页面组件的映射关系

## 🔧 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/config/routes.js` 中添加路由配置
3. 在 `src/constants/menuItems.js` 中添加菜单项（如需要）

### 添加新的工具函数

在 `src/utils/` 目录下创建新的工具函数文件，保持单一职责原则。

### 自定义 Hook

在 `src/hooks/` 目录下创建新的 Hook，遵循 React Hooks 规范。

## 📝 代码规范

项目使用 ESLint 进行代码检查，运行以下命令检查代码：

```bash
npm run lint
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 🔗 相关链接

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Ant Design 文档](https://ant.design/)
- [Supabase 文档](https://supabase.com/docs)

## 📧 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
