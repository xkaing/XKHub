-- 简化的批量同步函数（单独执行）
CREATE OR REPLACE FUNCTION sync_all_users_to_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, last_sign_in_at)
  SELECT id, email, last_sign_in_at
  FROM auth.users
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    last_sign_in_at = EXCLUDED.last_sign_in_at;
END;
$$;

-- 执行同步
SELECT sync_all_users_to_profiles();

