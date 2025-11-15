-- ============================================
-- 初始化 ai_bots 表
-- ============================================

-- 1. 确保 ai_bots 表存在并包含必要字段
CREATE TABLE IF NOT EXISTS public.ai_bots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  avatar_url text,
  description text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- 2. 如果表已存在，添加缺失的字段
DO $$ 
BEGIN
  -- 添加 nickname 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_bots' 
    AND column_name = 'nickname'
  ) THEN
    ALTER TABLE public.ai_bots ADD COLUMN nickname text NOT NULL DEFAULT '';
  END IF;

  -- 添加 avatar_url 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_bots' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.ai_bots ADD COLUMN avatar_url text;
  END IF;

  -- 添加 description 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_bots' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.ai_bots ADD COLUMN description text;
  END IF;

  -- 添加 created_at 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_bots' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.ai_bots ADD COLUMN created_at timestamptz DEFAULT NOW();
  END IF;

  -- 添加 updated_at 字段（如果不存在）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_bots' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.ai_bots ADD COLUMN updated_at timestamptz DEFAULT NOW();
  END IF;
END $$;

-- 3. 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_ai_bots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建触发器：自动更新 updated_at
DROP TRIGGER IF EXISTS on_ai_bots_updated ON public.ai_bots;
CREATE TRIGGER on_ai_bots_updated
  BEFORE UPDATE ON public.ai_bots
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_bots_updated_at();

-- 5. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_ai_bots_created_at ON public.ai_bots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_bots_nickname ON public.ai_bots(nickname);

-- ============================================
-- 脚本执行完成
-- ============================================
-- ai_bots 表已创建，包含以下字段：
--   - id: uuid (主键，自动生成)
--   - nickname: text (昵称，必填)
--   - avatar_url: text (头像URL)
--   - description: text (介绍/简介)
--   - created_at: timestamptz (创建时间)
--   - updated_at: timestamptz (更新时间，自动更新)
-- ============================================

