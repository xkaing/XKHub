# 数据库脚本说明

## 脚本文件

### init_profiles_sync.sql（推荐）

**完整初始化脚本**，包含：

- 自动创建 `profiles` 表（如果不存在）
- 自动添加缺失的字段（`email`, `last_sign_in_at`, `updated_at`）
- 创建同步触发器和函数
- 自动执行一次性同步所有现有用户数据

**推荐首次使用此脚本**，它会自动处理所有前置条件。

### sync_users_to_profiles.sql

**仅同步功能脚本**，包含：

- 创建同步触发器和函数
- 批量同步函数（需要手动执行）

**适用于**：`profiles` 表已存在且包含必要字段的情况。

---

## 功能说明

这些脚本用于同步 `auth.users` 表中的 `email` 和 `last_sign_in_at` 数据到 `public.profiles` 表。

1. **自动同步触发器**：当 `auth.users` 表中的 `email` 或 `last_sign_in_at` 字段更新时，自动同步到 `public.profiles` 表

2. **同步函数**：`sync_user_to_profile()` - 处理单个用户的同步

3. **批量同步函数**：`sync_all_users_to_profiles()` - 一次性同步所有现有用户数据

### 使用方法

#### 方式一：使用完整初始化脚本（推荐）

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 复制 `init_profiles_sync.sql` 文件中的内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行脚本

此脚本会自动：

- 创建表结构（如果不存在）
- 添加缺失字段
- 设置同步触发器
- 同步所有现有用户数据

#### 方式二：仅设置同步功能

如果 `profiles` 表已存在且包含必要字段：

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 复制 `sync_users_to_profiles.sql` 文件中的内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行脚本
7. 手动执行一次性同步：

```sql
SELECT sync_all_users_to_profiles();
```

### 前置条件

确保 `public.profiles` 表包含以下字段：

- `id` (uuid, primary key) - 对应 `auth.users.id`
- `email` (text) - 用户邮箱
- `last_sign_in_at` (timestamptz) - 最后登录时间

如果表结构不同，请先创建或修改表结构：

```sql
-- 如果 profiles 表不存在，创建表
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- 如果表已存在但缺少字段，添加字段
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;
```

### 注意事项

- 触发器使用 `SECURITY DEFINER`，确保有足够的权限访问 `auth.users` 表
- 如果 `profiles` 表中不存在对应记录，会自动创建新记录
