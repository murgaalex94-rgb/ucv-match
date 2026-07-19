-- ============================================
-- AUDIT LOGS TABLE + TRIGGER FOR MENTORIAS
-- ============================================

-- 1. Drop and recreate table to ensure clean schema
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accion TEXT NOT NULL,
  tabla_afectada TEXT NOT NULL,
  registro_id UUID NOT NULL,
  valor_anterior JSONB,
  valor_nuevo JSONB,
  fecha TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabla_registro ON public.audit_logs(tabla_afectada, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha ON public.audit_logs(fecha DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 2. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_mentorias_changes()
RETURNS trigger AS $$
DECLARE
  v_usuario_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_usuario_id := NEW.estudiante_id;
    INSERT INTO public.audit_logs (usuario_id, accion, tabla_afectada, registro_id, valor_anterior, valor_nuevo)
    VALUES (v_usuario_id, 'INSERT', 'mentorias', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
      v_usuario_id := COALESCE(NEW.estudiante_id, NEW.mentor_id);
      INSERT INTO public.audit_logs (usuario_id, accion, tabla_afectada, registro_id, valor_anterior, valor_nuevo)
      VALUES (v_usuario_id, 'UPDATE', 'mentorias', NEW.id, 
              jsonb_build_object('estado', OLD.estado), 
              jsonb_build_object('estado', NEW.estado));
    END IF;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_usuario_id := COALESCE(OLD.estudiante_id, OLD.mentor_id);
    INSERT INTO public.audit_logs (usuario_id, accion, tabla_afectada, registro_id, valor_anterior, valor_nuevo)
    VALUES (v_usuario_id, 'DELETE', 'mentorias', OLD.id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger (only if mentorias table exists with estado column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'mentorias' AND column_name = 'estado'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_audit_mentorias ON public.mentorias;
    CREATE TRIGGER trigger_audit_mentorias
      AFTER INSERT OR UPDATE OR DELETE ON public.mentorias
      FOR EACH ROW EXECUTE FUNCTION public.audit_mentorias_changes();
  END IF;
END $$;

-- 4. Permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;