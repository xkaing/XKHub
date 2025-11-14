-- ============================================
-- 同步 auth.users 到 public.profiles 的数据库脚本
-- ============================================

-- 1. 创建同步函数：将 auth.users 的 email 和 last_sign_in_at 同步到 public.profiles
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

-- 2. 创建触发器：当 auth.users 表更新时自动同步
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER INSERT OR UPDATE OF email, last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_to_profile();

-- 3. 一次性同步所有现有用户数据
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

-- 4. 执行一次性同步（可选，取消注释以执行）
-- SELECT sync_all_users_to_profiles();

-- ============================================
-- 使用说明：
-- ============================================
-- 1. 此脚本会创建一个触发器，当 auth.users 表中的 email 或 last_sign_in_at 更新时，
--    自动同步到 public.profiles 表
--
-- 2. 如果 profiles 表中不存在对应的记录，会自动创建
--
-- 3. 如果 profiles 表中已存在记录，会更新 email 和 last_sign_in_at 字段
--
-- 4. 要同步所有现有用户数据，请取消注释最后一行并执行：
--    SELECT sync_all_users_to_profiles();
--
-- 5. 确保 public.profiles 表包含以下字段：
--    - id (uuid, primary key, 对应 auth.users.id)
--    - email (text)
--    - last_sign_in_at (timestamptz)
--
-- ============================================

