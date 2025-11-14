-- ============================================
-- 初始化 profiles 表并设置同步功能
-- ============================================

-- 1. 确保 profiles 表存在并包含必要字段
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text,
  avatar_url text,
  email text,
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- 2. 如果表已存在，添加缺失的字段
DO $$ 
BEGIN
  -- 添加 email 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;

  -- 添加 last_sign_in_at 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'last_sign_in_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_sign_in_at timestamptz;
  END IF;
END $$;

-- 3. 创建同步函数
CREATE OR REPLACE FUNCTION sync_user_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新或插入 profiles 表中的数据
  INSERT INTO public.profiles (id, email, last_sign_in_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.last_sign_in_at
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER INSERT OR UPDATE OF email, last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_to_profile();

-- 5. 创建批量同步函数
CREATE OR REPLACE FUNCTION sync_all_users_to_profiles()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, last_sign_in_at)
  SELECT 
    id,
    email,
    last_sign_in_at
  FROM auth.users
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 执行一次性同步所有现有用户数据
SELECT sync_all_users_to_profiles();

-- ============================================
-- 脚本执行完成
-- ============================================
-- 现在 auth.users 表中的 email 和 last_sign_in_at 
-- 会自动同步到 public.profiles 表
-- ============================================

