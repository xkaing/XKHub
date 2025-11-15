-- ============================================
-- 迁移脚本：将 likes 表的 id 从 uuid 改为 bigint
-- ============================================
-- 注意：此脚本会自动清空表中的所有数据！
-- ============================================

-- 1. 检查表是否存在
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'likes'
  ) THEN
    RAISE EXCEPTION '表 likes 不存在，请先创建表';
  END IF;
END $$;

-- 2. 显示当前数据量（仅用于信息提示）
DO $$ 
DECLARE
  row_count integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM public.likes;
  RAISE NOTICE '表 likes 当前包含 % 条记录，即将清空', row_count;
END $$;

-- 3. 清空表中的所有数据
TRUNCATE TABLE public.likes;

-- 4. 删除主键约束
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_pkey;

-- 5. 删除可能存在的其他约束（如外键约束，如果有的话）
-- 注意：如果有外键引用 likes.id，需要先处理
DO $$ 
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT conname, contype
    FROM pg_constraint
    WHERE conrelid = 'public.likes'::regclass
    AND contype IN ('f', 'p', 'u')
    AND conname != 'likes_pkey'
  LOOP
    EXECUTE format('ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS %I', constraint_record.conname);
    RAISE NOTICE '已删除约束: %', constraint_record.conname;
  END LOOP;
END $$;

-- 6. 删除旧的 id 列（uuid 类型）
ALTER TABLE public.likes DROP COLUMN IF EXISTS id;

-- 7. 创建序列用于生成自增 ID
DROP SEQUENCE IF EXISTS public.likes_id_seq;
CREATE SEQUENCE public.likes_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- 8. 添加新的 bigint id 列
ALTER TABLE public.likes 
  ADD COLUMN id bigint PRIMARY KEY DEFAULT nextval('public.likes_id_seq');

-- 9. 将序列的所有权授予表
ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;

-- 10. 重置序列（确保从 1 开始）
ALTER SEQUENCE public.likes_id_seq RESTART WITH 1;

-- ============================================
-- 迁移完成
-- ============================================
-- likes 表的 id 字段已从 uuid 改为 bigint
-- 新的 id 将从 1 开始自增
-- 注意：表中的所有数据已被清空
-- ============================================

