-- ============================================
-- 迁移脚本：将 ai_bots 表的 id 从 uuid 改为 bigint
-- ============================================
-- 注意：此脚本假设表是空的，如果表中有数据，请先备份！
-- ============================================

-- 1. 检查表是否存在
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'ai_bots'
  ) THEN
    RAISE EXCEPTION '表 ai_bots 不存在，请先创建表';
  END IF;
END $$;

-- 2. 检查表是否为空（可选，如果表有数据会报错）
DO $$ 
DECLARE
  row_count integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM public.ai_bots;
  IF row_count > 0 THEN
    RAISE EXCEPTION '表 ai_bots 不为空，包含 % 条记录。请先清空表或备份数据！', row_count;
  END IF;
END $$;

-- 3. 删除主键约束
ALTER TABLE public.ai_bots DROP CONSTRAINT IF EXISTS ai_bots_pkey;

-- 4. 删除旧的 id 列（uuid 类型）
ALTER TABLE public.ai_bots DROP COLUMN IF EXISTS id;

-- 5. 创建序列用于生成自增 ID
CREATE SEQUENCE IF NOT EXISTS public.ai_bots_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 6. 添加新的 bigint id 列
ALTER TABLE public.ai_bots 
  ADD COLUMN id bigint PRIMARY KEY DEFAULT nextval('public.ai_bots_id_seq');

-- 7. 将序列的所有权授予表
ALTER SEQUENCE public.ai_bots_id_seq OWNED BY public.ai_bots.id;

-- 8. 重置序列（确保从 1 开始）
ALTER SEQUENCE public.ai_bots_id_seq RESTART WITH 1;

-- ============================================
-- 迁移完成
-- ============================================
-- ai_bots 表的 id 字段已从 uuid 改为 bigint
-- 新的 id 将从 1 开始自增
-- ============================================

