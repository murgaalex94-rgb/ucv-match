-- ============================================
-- AUDIT LOGS TABLE + TRIGGER FOR MENTORIAS
-- ============================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  accion TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  tabla_afectada TEXT NOT NULL, -- 'mentorias'
  registro_id UUID NOT NULL,
  valor_anterior JSONB,
  valor_nuevo JSONB,
  fecha TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabla_registro ON public.audit_logs(tabla_afectada, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha ON public.audit_logs(fecha DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own audit logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = usuario_id);

-- Policy: only service_role can insert (via trigger)
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 2. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_mentorias_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (usuario_id, accion, tabla_afectada, registro_id, valor_anterior, valor_nuevo)
    VALUES (NEW.estudiante_id, 'INSERT', 'mentorias', NEW.id, NULL, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if estado changed
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
      INSERT INTO public.audit_logs (usuario_id, accion, tabla_afectada, registro_id, valor_anterior, valor_nuevo)
      VALUES (
        COALESCE(NEW.estudiante_id, NEW.mentor_id),
        'UPDATE',
        'mentorias',
        NEW.id,
        jsonb_build_object('estado', OLD.estado),
        jsonb_build_object('estado', NEW.estado)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (usuario_id, accion, tabla_afectada, registro_id, valor_anterior, valor_nuevo)
    VALUES (OLD.estudiante_id, 'DELETE', 'mentorias', OLD.id, to_jsonb(OLD), NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to mentorias table
DROP TRIGGER IF EXISTS trigger_audit_mentorias ON public.mentorias;
CREATE TRIGGER trigger_audit_mentorias
  AFTER INSERT OR UPDATE OR DELETE ON public.mentorias
  FOR EACH ROW EXECUTE FUNCTION public.audit_mentorias_changes();

-- 4. Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;