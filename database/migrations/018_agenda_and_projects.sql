BEGIN;

SET ROLE contractor_owner;

-- 1. Table: public.activities (Agenda y actividades)
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  assigned_user_id uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'visit',
  status text NOT NULL DEFAULT 'scheduled',
  date text NOT NULL,
  start_time text NOT NULL DEFAULT '09:00',
  end_time text DEFAULT '10:00',
  address text,
  notes text,
  reminder_minutes integer NOT NULL DEFAULT 15,
  created_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_company_date ON public.activities(company_id, date);
CREATE INDEX IF NOT EXISTS idx_activities_project ON public.activities(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_assigned ON public.activities(assigned_user_id) WHERE assigned_user_id IS NOT NULL;

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS activities_select_policy ON public.activities;
CREATE POLICY activities_select_policy ON public.activities
  FOR SELECT TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS activities_insert_policy ON public.activities;
CREATE POLICY activities_insert_policy ON public.activities
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS activities_update_policy ON public.activities;
CREATE POLICY activities_update_policy ON public.activities
  FOR UPDATE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  )
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS activities_delete_policy ON public.activities;
CREATE POLICY activities_delete_policy ON public.activities
  FOR DELETE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'supervisor'::public.company_role])
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO contractor_api;

-- 2. Table: public.project_tasks (Tareas de proyecto)
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_user_id uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON public.project_tasks(assigned_user_id) WHERE assigned_user_id IS NOT NULL;

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_tasks_select_policy ON public.project_tasks;
CREATE POLICY project_tasks_select_policy ON public.project_tasks
  FOR SELECT TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS project_tasks_insert_policy ON public.project_tasks;
CREATE POLICY project_tasks_insert_policy ON public.project_tasks
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS project_tasks_update_policy ON public.project_tasks;
CREATE POLICY project_tasks_update_policy ON public.project_tasks
  FOR UPDATE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  )
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS project_tasks_delete_policy ON public.project_tasks;
CREATE POLICY project_tasks_delete_policy ON public.project_tasks
  FOR DELETE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'supervisor'::public.company_role])
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_tasks TO contractor_api;

-- 3. Table: public.project_progress_history (Historial de avance)
CREATE TABLE IF NOT EXISTS public.project_progress_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  progress_percentage numeric(5,2) NOT NULL,
  previous_percentage numeric(5,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_progress_history_project ON public.project_progress_history(project_id, created_at DESC);

ALTER TABLE public.project_progress_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_progress_history_select_policy ON public.project_progress_history;
CREATE POLICY project_progress_history_select_policy ON public.project_progress_history
  FOR SELECT TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS project_progress_history_insert_policy ON public.project_progress_history;
CREATE POLICY project_progress_history_insert_policy ON public.project_progress_history
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

GRANT SELECT, INSERT ON public.project_progress_history TO contractor_api;

-- 4. Table: public.project_photos (Fotos de proyectos con almacenamiento privado)
CREATE TABLE IF NOT EXISTS public.project_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  caption text,
  is_private boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES app_auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_photos_project ON public.project_photos(project_id, created_at DESC);

ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_photos_select_policy ON public.project_photos;
CREATE POLICY project_photos_select_policy ON public.project_photos
  FOR SELECT TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS project_photos_insert_policy ON public.project_photos;
CREATE POLICY project_photos_insert_policy ON public.project_photos
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

DROP POLICY IF EXISTS project_photos_delete_policy ON public.project_photos;
CREATE POLICY project_photos_delete_policy ON public.project_photos
  FOR DELETE TO contractor_api
  USING (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'supervisor'::public.company_role])
  );

GRANT SELECT, INSERT, DELETE ON public.project_photos TO contractor_api;

-- 5. Table: public.notifications (Notificaciones para usuarios)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notifications_select_policy ON public.notifications;
CREATE POLICY notifications_select_policy ON public.notifications
  FOR SELECT TO contractor_api
  USING (
    user_id = app.current_user_id()
  );

DROP POLICY IF EXISTS notifications_update_policy ON public.notifications;
CREATE POLICY notifications_update_policy ON public.notifications
  FOR UPDATE TO contractor_api
  USING (
    user_id = app.current_user_id()
  )
  WITH CHECK (
    user_id = app.current_user_id()
  );

DROP POLICY IF EXISTS notifications_insert_policy ON public.notifications;
CREATE POLICY notifications_insert_policy ON public.notifications
  FOR INSERT TO contractor_api
  WITH CHECK (
    public.has_company_role(company_id, ARRAY['owner'::public.company_role, 'admin'::public.company_role, 'estimator'::public.company_role, 'member'::public.company_role, 'supervisor'::public.company_role, 'sales'::public.company_role])
  );

GRANT SELECT, INSERT, UPDATE ON public.notifications TO contractor_api;

RESET ROLE;

COMMIT;
