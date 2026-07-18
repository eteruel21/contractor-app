BEGIN;

SET ROLE contractor_owner;

DO $invoice_status$
BEGIN
  CREATE TYPE public.invoice_status AS ENUM (
    'pending',
    'paid',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$invoice_status$;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id uuid NOT NULL
    REFERENCES public.companies(id)
    ON DELETE CASCADE,

  budget_id uuid
    REFERENCES public.budgets(id)
    ON DELETE SET NULL,

  client_id uuid NOT NULL
    REFERENCES public.clients(id)
    ON DELETE RESTRICT,

  invoice_number text NOT NULL,

  status public.invoice_status
    NOT NULL
    DEFAULT 'pending',

  issue_date date
    NOT NULL
    DEFAULT CURRENT_DATE,

  due_date date,
  notes text,

  created_by uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL,

  created_at timestamptz
    NOT NULL
    DEFAULT now(),

  updated_at timestamptz
    NOT NULL
    DEFAULT now(),

  CONSTRAINT invoices_company_number_unique
    UNIQUE (
      company_id,
      invoice_number
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS
  invoices_budget_unique
ON public.invoices(budget_id)
WHERE budget_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS
  invoices_company_created_idx
ON public.invoices(
  company_id,
  created_at DESC
);

CREATE INDEX IF NOT EXISTS
  invoices_client_idx
ON public.invoices(client_id);

ALTER TABLE public.invoices
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS
  invoices_select_policy
ON public.invoices;

CREATE POLICY invoices_select_policy
ON public.invoices
FOR SELECT
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members
      AS membership
    WHERE
      membership.company_id =
        invoices.company_id

      AND membership.user_id =
        app.current_user_id()

      AND membership.active = true
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.clients AS customer
    WHERE customer.id =
      invoices.client_id

      AND customer.user_id =
        app.current_user_id()

      AND customer.active = true
  )
);

DROP POLICY IF EXISTS
  invoices_insert_policy
ON public.invoices;

CREATE POLICY invoices_insert_policy
ON public.invoices
FOR INSERT
TO contractor_api
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.company_members
      AS membership
    WHERE
      membership.company_id =
        invoices.company_id

      AND membership.user_id =
        app.current_user_id()

      AND membership.active = true
  )
);

DROP POLICY IF EXISTS
  invoices_update_policy
ON public.invoices;

CREATE POLICY invoices_update_policy
ON public.invoices
FOR UPDATE
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members
      AS membership
    WHERE
      membership.company_id =
        invoices.company_id

      AND membership.user_id =
        app.current_user_id()

      AND membership.active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.company_members
      AS membership
    WHERE
      membership.company_id =
        invoices.company_id

      AND membership.user_id =
        app.current_user_id()

      AND membership.active = true
  )
);

DROP POLICY IF EXISTS
  invoices_delete_policy
ON public.invoices;

CREATE POLICY invoices_delete_policy
ON public.invoices
FOR DELETE
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.company_members
      AS membership
    WHERE
      membership.company_id =
        invoices.company_id

      AND membership.user_id =
        app.current_user_id()

      AND membership.active = true
  )
);

CREATE OR REPLACE FUNCTION public.create_invoice(
  requested_company_id uuid,
  requested_client_id uuid,
  requested_budget_id uuid,
  requested_due_date date DEFAULT NULL,
  requested_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $function$
DECLARE
  created_invoice_id uuid;
  generated_number text;
BEGIN
  IF app.current_user_id() IS NULL THEN
    RAISE EXCEPTION
      'Se requiere autenticación.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.company_members
      AS membership
    WHERE
      membership.company_id =
        requested_company_id

      AND membership.user_id =
        app.current_user_id()

      AND membership.active = true
  ) THEN
    RAISE EXCEPTION
      'No tienes acceso a esta empresa.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.clients AS customer
    WHERE
      customer.id = requested_client_id
      AND customer.company_id =
        requested_company_id
  ) THEN
    RAISE EXCEPTION
      'El cliente no pertenece a la empresa.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.budgets AS budget
    WHERE
      budget.id = requested_budget_id
      AND budget.company_id =
        requested_company_id
      AND budget.client_id =
        requested_client_id
  ) THEN
    RAISE EXCEPTION
      'El presupuesto no es válido.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.budget_id =
      requested_budget_id
  ) THEN
    RAISE EXCEPTION
      'Ya existe una factura para este presupuesto.';
  END IF;

  generated_number :=
    public.next_document_number(
      requested_company_id,
      'invoice'
    );

  INSERT INTO public.invoices (
    company_id,
    budget_id,
    client_id,
    invoice_number,
    due_date,
    notes,
    created_by
  )
  VALUES (
    requested_company_id,
    requested_budget_id,
    requested_client_id,
    generated_number,
    requested_due_date,
    NULLIF(
      btrim(requested_notes),
      ''
    ),
    app.current_user_id()
  )
  RETURNING id
  INTO created_invoice_id;

  RETURN created_invoice_id;
END
$function$;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.invoices
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.create_invoice(
  uuid,
  uuid,
  uuid,
  date,
  text
)
TO contractor_api;

DO $grant_admin_functions$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT
      namespace.nspname AS schema_name,
      procedure.proname AS function_name,
      pg_get_function_identity_arguments(
        procedure.oid
      ) AS arguments
    FROM pg_proc AS procedure
    JOIN pg_namespace AS namespace
      ON namespace.oid =
        procedure.pronamespace
    WHERE namespace.nspname = 'public'
      AND procedure.proname IN (
        'admin_update_catalog_pricing',
        'admin_adjust_catalog_prices'
      )
  LOOP
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %I.%I(%s) TO contractor_api',
      function_record.schema_name,
      function_record.function_name,
      function_record.arguments
    );
  END LOOP;
END
$grant_admin_functions$;

RESET ROLE;

COMMIT;