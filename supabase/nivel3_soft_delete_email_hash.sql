-- ============================================
-- NIVEL 3: SOFT DELETE + EMAIL HASH + PROFILES MIGRATION
-- ============================================

-- 1. Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_hash TEXT;

-- Index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);

-- 2. Update existing email hashes (for existing users)
UPDATE public.profiles 
SET email_hash = encode(digest(LOWER(TRIM(email)), 'sha256'), 'hex')
WHERE email_hash IS NULL AND email IS NOT NULL;

-- 3. Trigger to auto-generate email_hash on insert/update
CREATE OR REPLACE FUNCTION public.generate_email_hash()
RETURNS trigger AS $$
BEGIN
  IF NEW.email IS NOT NULL THEN
    NEW.email_hash := encode(digest(LOWER(TRIM(NEW.email)), 'sha256'), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_generate_email_hash ON public.profiles;
CREATE TRIGGER trigger_generate_email_hash
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_email_hash();

-- 4. Soft delete function (replaces hard delete)
CREATE OR REPLACE FUNCTION public.soft_delete_account(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Mark profile as deleted
  UPDATE public.profiles 
  SET deleted_at = NOW() 
  WHERE id = p_user_id;
  
  -- Soft delete mentorships where user is student
  UPDATE public.mentorias 
  SET estado = 'Eliminada', deleted_at = NOW()
  WHERE estudiante_id = p_user_id;
  
  -- Soft delete mentorships where user is mentor
  UPDATE public.mentorias 
  SET estado = 'Eliminada', deleted_at = NOW()
  WHERE mentor_id = p_user_id;
  
  -- Soft delete chat messages
  UPDATE public.chat_messages 
  SET deleted_at = NOW()
  WHERE emisor_id = p_user_id OR receptor_id = p_user_id;
  
  -- Soft delete notifications
  UPDATE public.notificaciones 
  SET deleted_at = NOW()
  WHERE usuario_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Account recovery function (within 30 days)
CREATE OR REPLACE FUNCTION public.recover_account(p_user_id UUID)
RETURNS boolean AS $$
DECLARE
  v_deleted_at TIMESTAMPTZ;
BEGIN
  SELECT deleted_at INTO v_deleted_at FROM public.profiles WHERE id = p_user_id;
  
  IF v_deleted_at IS NOT NULL AND v_deleted_at > NOW() - INTERVAL '30 days' THEN
    -- Restore profile
    UPDATE public.profiles SET deleted_at = NULL WHERE id = p_user_id;
    
    -- Restore mentorships
    UPDATE public.mentorias SET estado = 'Pendiente', deleted_at = NULL WHERE estudiante_id = p_user_id AND deleted_at IS NOT NULL;
    UPDATE public.mentorias SET estado = 'Pendiente', deleted_at = NULL WHERE mentor_id = p_user_id AND deleted_at IS NOT NULL;
    
    -- Restore chat messages
    UPDATE public.chat_messages SET deleted_at = NULL WHERE emisor_id = p_user_id AND deleted_at IS NOT NULL;
    UPDATE public.chat_messages SET deleted_at = NULL WHERE receptor_id = p_user_id AND deleted_at IS NOT NULL;
    
    -- Restore notifications
    UPDATE public.notificaciones SET deleted_at = NULL WHERE usuario_id = p_user_id AND deleted_at IS NOT NULL;
    
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add deleted_at to mentorias and other tables if not exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mentorias') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorias' AND column_name = 'deleted_at') THEN
      ALTER TABLE public.mentorias ADD COLUMN deleted_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_mentorias_deleted_at ON public.mentorias(deleted_at);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_messages' AND column_name = 'deleted_at') THEN
      ALTER TABLE public.chat_messages ADD COLUMN deleted_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted_at ON public.chat_messages(deleted_at);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificaciones') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notificaciones' AND column_name = 'deleted_at') THEN
      ALTER TABLE public.notificaciones ADD COLUMN deleted_at TIMESTAMPTZ;
      CREATE INDEX IF NOT EXISTS idx_notificaciones_deleted_at ON public.notificaciones(deleted_at);
    END IF;
  END IF;
END $$;

-- 7. Email hash verification function for login
CREATE OR REPLACE FUNCTION public.verify_email_hash(p_email TEXT)
RETURNS TABLE(id UUID, email_hash_match BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, (p.email_hash = encode(digest(LOWER(TRIM(p_email)), 'sha256'), 'hex'))
  FROM public.profiles p
  WHERE p.email = LOWER(TRIM(p_email)) AND p.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7b. Update RLS policies to filter out soft-deleted records
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id AND deleted_at IS NULL);

-- Ensure mentorias filters deleted_at
DROP POLICY IF EXISTS "Users can view own mentorias" ON public.mentorias;
CREATE POLICY "Users can view own mentorias" ON public.mentorias
  FOR SELECT USING (
    (auth.uid() = estudiante_id OR auth.uid() = mentor_id) 
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Users can create mentorias" ON public.mentorias;
CREATE POLICY "Users can create mentorias" ON public.mentorias
  FOR INSERT WITH CHECK (auth.uid() = estudiante_id AND deleted_at IS NULL);