BEGIN;

SET ROLE contractor_owner;

-- 1. Table: public.company_invitations (Invitaciones a equipos)
CREATE TABLE IF NOT EXISTS public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.company_role NOT NULL DEFAULT 'member'::public.company_role,
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_invitations_company ON public.company_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_company_invitations_email ON public.company_invitations(email);
CREATE INDEX IF NOT EXISTS idx_company_invitations_token ON public.company_invitations(token);

ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_invitations_select_policy ON public.company_invitations;
CREATE POLICY company_invitations_select_policy ON public.company_invitations
  FOR SELECT TO contractor_api
  USING (
    public.is_company_member(company_id) OR app.current_user_id() IS NOT NULL
  );

DROP POLICY IF EXISTS company_invitations_insert_policy ON public.company_invitations;
CREATE POLICY company_invitations_insert_policy ON public.company_invitations
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.is_company_admin(company_id)
  );

DROP POLICY IF EXISTS company_invitations_update_policy ON public.company_invitations;
CREATE POLICY company_invitations_update_policy ON public.company_invitations
  FOR UPDATE TO contractor_api
  USING (
    public.is_company_admin(company_id) OR app.current_user_id() IS NOT NULL
  )
  WITH CHECK (
    public.is_company_admin(company_id) OR app.current_user_id() IS NOT NULL
  );

DROP POLICY IF EXISTS company_invitations_delete_policy ON public.company_invitations;
CREATE POLICY company_invitations_delete_policy ON public.company_invitations
  FOR DELETE TO contractor_api
  USING (
    public.is_company_admin(company_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_invitations TO contractor_api;

-- 2. Table: public.admin_audit_logs (Auditoría de acciones administrativas)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_company ON public.admin_audit_logs(company_id, created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_audit_logs_select_policy ON public.admin_audit_logs;
CREATE POLICY admin_audit_logs_select_policy ON public.admin_audit_logs
  FOR SELECT TO contractor_api
  USING (
    public.is_company_admin(company_id)
  );

DROP POLICY IF EXISTS admin_audit_logs_insert_policy ON public.admin_audit_logs;
CREATE POLICY admin_audit_logs_insert_policy ON public.admin_audit_logs
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.is_company_member(company_id)
  );

GRANT SELECT, INSERT ON public.admin_audit_logs TO contractor_api;

-- 3. Ensure permissions on client_contacts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_contacts TO contractor_api;

RESET ROLE;

COMMIT;
