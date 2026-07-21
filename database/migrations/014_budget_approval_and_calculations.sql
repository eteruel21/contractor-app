BEGIN;

SET ROLE contractor_owner;

-- 1. Extend public.budgets with approval and rejection fields
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL;

-- 2. Create public.budget_change_history
CREATE TABLE IF NOT EXISTS public.budget_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  budget_id uuid NOT NULL REFERENCES public.budgets(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  action text NOT NULL,
  performed_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  notes text,
  snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_change_history_budget
  ON public.budget_change_history(budget_id, created_at DESC);

ALTER TABLE public.budget_change_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS budget_change_history_select_policy ON public.budget_change_history;
CREATE POLICY budget_change_history_select_policy ON public.budget_change_history
  FOR SELECT TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
    OR EXISTS (
      SELECT 1 FROM public.budgets b
      JOIN public.clients c ON c.id = b.client_id
      WHERE b.id = budget_change_history.budget_id
        AND c.user_id = app.current_user_id()
    )
  );

DROP POLICY IF EXISTS budget_change_history_insert_policy ON public.budget_change_history;
CREATE POLICY budget_change_history_insert_policy ON public.budget_change_history
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
    OR EXISTS (
      SELECT 1 FROM public.budgets b
      JOIN public.clients c ON c.id = b.client_id
      WHERE b.id = budget_change_history.budget_id
        AND c.user_id = app.current_user_id()
    )
  );

GRANT SELECT, INSERT ON public.budget_change_history TO contractor_api;

-- 3. Create public.saved_calculations
CREATE TABLE IF NOT EXISTS public.saved_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  formula_code text NOT NULL,
  title text NOT NULL,
  input_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  price_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  results_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  total_cost numeric(12,2) DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT saved_calculations_title_not_empty CHECK (char_length(trim(both from title)) >= 1),
  CONSTRAINT saved_calculations_total_cost_valid CHECK (total_cost >= 0)
);

CREATE INDEX IF NOT EXISTS idx_saved_calculations_company
  ON public.saved_calculations(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_calculations_project
  ON public.saved_calculations(project_id) WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_saved_calculations_client
  ON public.saved_calculations(client_id) WHERE client_id IS NOT NULL;

ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS saved_calculations_select_policy ON public.saved_calculations;
CREATE POLICY saved_calculations_select_policy ON public.saved_calculations
  FOR SELECT TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS saved_calculations_insert_policy ON public.saved_calculations;
CREATE POLICY saved_calculations_insert_policy ON public.saved_calculations
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS saved_calculations_update_policy ON public.saved_calculations;
CREATE POLICY saved_calculations_update_policy ON public.saved_calculations
  FOR UPDATE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'sales'::public.company_role])
  )
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS saved_calculations_delete_policy ON public.saved_calculations;
CREATE POLICY saved_calculations_delete_policy ON public.saved_calculations
  FOR DELETE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role])
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_calculations TO contractor_api;

RESET ROLE;

COMMIT;
