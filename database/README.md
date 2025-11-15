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

---

### init_ai_bots.sql

**AI 机器人表初始化脚本**，包含：

- 自动创建 `ai_bots` 表（如果不存在）
- 自动添加缺失的字段（`nickname`, `avatar_url`, `description`, `created_at`, `updated_at`）
- 创建自动更新 `updated_at` 的触发器
- 创建索引以提高查询性能

**表结构说明**：

- `id` (uuid, primary key) - 主键，自动生成
- `nickname` (text, NOT NULL) - 机器人昵称
- `avatar_url` (text) - 头像URL
- `description` (text) - 介绍/简介
- `created_at` (timestamptz) - 创建时间，自动设置
- `updated_at` (timestamptz) - 更新时间，自动更新

**使用方法**：

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 "SQL Editor"
4. 复制 `init_ai_bots.sql` 文件中的内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行脚本

此脚本会自动：
- 创建表结构（如果不存在）
- 添加缺失字段
- 设置自动更新触发器
- 创建性能索引

**功能特性**：

- 当更新记录时，`updated_at` 字段会自动更新为当前时间
- 在 `created_at` 和 `nickname` 字段上创建了索引，提高查询性能

---

### migrate_ai_bots_uuid_to_bigint.sql

**迁移脚本：将 ai_bots 表的 id 从 uuid 改为 bigint**

**⚠️ 重要提示**：

- **此脚本仅适用于空表**！如果表中有数据，会先检查并报错
- 如果表中有数据，请先备份数据，然后手动迁移或清空表

**功能说明**：

1. 检查表是否存在
2. 检查表是否为空（如果有数据会报错）
3. 删除主键约束
4. 删除旧的 uuid id 列
5. 创建自增序列
6. 添加新的 bigint id 列并设置为主键
7. 重置序列从 1 开始

**使用方法**：

1. **确认表是空的**（重要！）
2. 登录 Supabase Dashboard
3. 进入你的项目
4. 点击左侧菜单的 "SQL Editor"
5. 复制 `migrate_ai_bots_uuid_to_bigint.sql` 文件中的内容
6. 粘贴到 SQL Editor 中
7. 点击 "Run" 执行脚本

**迁移后的表结构**：

- `id` (bigint, primary key) - 主键，自增序列（从 1 开始）
- 其他字段保持不变

**如果表中有数据怎么办？**

如果表中有数据，你需要：

1. **备份数据**：导出现有数据
2. **执行迁移脚本**：运行迁移脚本
3. **恢复数据**：重新导入数据（注意：id 会重新生成）

或者手动迁移：

```sql
-- 1. 创建临时列
ALTER TABLE ai_bots ADD COLUMN new_id bigint;

-- 2. 创建序列并填充新 ID
CREATE SEQUENCE ai_bots_id_seq START WITH 1;
UPDATE ai_bots SET new_id = nextval('ai_bots_id_seq');

-- 3. 删除旧列，重命名新列
ALTER TABLE ai_bots DROP CONSTRAINT ai_bots_pkey;
ALTER TABLE ai_bots DROP COLUMN id;
ALTER TABLE ai_bots RENAME COLUMN new_id TO id;
ALTER TABLE ai_bots ADD PRIMARY KEY (id);
ALTER SEQUENCE ai_bots_id_seq OWNED BY ai_bots.id;
```

---

### migrate_likes_uuid_to_bigint.sql

**迁移脚本：将 likes 表的 id 从 uuid 改为 bigint**

**⚠️ 重要提示**：

- **此脚本会自动清空表中的所有数据**！
- 执行前请确认数据可以丢失，或已做好备份
- 脚本会显示当前数据量作为提示

**功能说明**：

1. 检查表是否存在
2. 显示当前数据量（仅提示）
3. **自动清空表中的所有数据**
4. 删除主键约束和其他相关约束
5. 删除旧的 uuid id 列
6. 创建自增序列
7. 添加新的 bigint id 列并设置为主键
8. 重置序列从 1 开始

**使用方法**：

1. **确认数据可以清空或已备份**（重要！）
2. 登录 Supabase Dashboard
3. 进入你的项目
4. 点击左侧菜单的 "SQL Editor"
5. 复制 `migrate_likes_uuid_to_bigint.sql` 文件中的内容
6. 粘贴到 SQL Editor 中
7. 点击 "Run" 执行脚本

**迁移后的表结构**：

- `id` (bigint, primary key) - 主键，自增序列（从 1 开始）
- `moment_id` (int8) - 保持不变
- `user_id` (text) - 保持不变
- `created_at` (timestamptz) - 保持不变

**注意事项**：

- 如果有其他表通过外键引用 `likes.id`，需要先处理这些外键约束
- 迁移后所有数据会被清空，需要重新插入数据
