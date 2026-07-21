BEGIN;

SET ROLE contractor_owner;

-- P1 / T-073, T-074, T-075, T-077, T-078 y T-083.
-- Una factura se crea como borrador y solo recibe número, fecha y snapshot
-- cuando se emite. Después de la emisión, sus datos comerciales son inmutables.

ALTER TABLE public.invoices
  ALTER COLUMN status DROP DEFAULT;

CREATE TYPE public.invoice_status_v2 AS ENUM (
  'draft',
  'issued',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled'
);

ALTER TABLE public.invoices
  ALTER COLUMN status TYPE public.invoice_status_v2
  USING (
    CASE status::text
      WHEN 'pending' THEN 'issued'
      WHEN 'paid' THEN 'paid'
      WHEN 'cancelled' THEN 'cancelled'
    END
  )::public.invoice_status_v2;

DROP TYPE public.invoice_status;

ALTER TYPE public.invoice_status_v2
  RENAME TO invoice_status;

ALTER TABLE public.invoices
  ALTER COLUMN status SET DEFAULT 'draft'::public.invoice_status,
  ALTER COLUMN invoice_number DROP NOT NULL,
  ALTER COLUMN issue_date DROP DEFAULT,
  ALTER COLUMN issue_date DROP NOT NULL,
  ADD COLUMN snapshot_schema_version smallint,
  ADD COLUMN snapshot_data jsonb,
  ADD COLUMN issued_at timestamptz,
  ADD COLUMN issued_by uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL;

CREATE TABLE public.invoice_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL
    REFERENCES public.companies(id)
    ON DELETE CASCADE,
  invoice_id uuid NOT NULL
    REFERENCES public.invoices(id)
    ON DELETE CASCADE,
  event_type text NOT NULL,
  from_status public.invoice_status,
  to_status public.invoice_status NOT NULL,
  actor_user_id uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_history_event_type_valid CHECK (
    event_type IN (
      'created',
      'issued',
      'status_changed',
      'cancelled',
      'migrated'
    )
  ),
  CONSTRAINT invoice_history_metadata_object CHECK (
    jsonb_typeof(metadata) = 'object'
  )
);

CREATE INDEX invoice_history_invoice_created_idx
ON public.invoice_history(invoice_id, created_at DESC);

CREATE INDEX invoice_history_company_created_idx
ON public.invoice_history(company_id, created_at DESC);

ALTER TABLE public.invoice_history
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoice_history_select_policy
ON public.invoice_history
FOR SELECT
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.id = invoice_history.invoice_id
      AND invoice.company_id = invoice_history.company_id
  )
);

CREATE OR REPLACE FUNCTION private.build_invoice_snapshot(
  requested_company_id uuid,
  requested_client_id uuid,
  requested_budget_id uuid,
  requested_invoice_number text,
  requested_issue_date date,
  requested_due_date date,
  requested_notes text
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  company_record public.companies%ROWTYPE;
  client_record public.clients%ROWTYPE;
  budget_record public.budgets%ROWTYPE;
  address_snapshot jsonb := 'null'::jsonb;
  sections_snapshot jsonb := '[]'::jsonb;
  items_snapshot jsonb := '[]'::jsonb;
  taxable_subtotal numeric(12,2) := 0;
BEGIN
  SELECT company.*
  INTO STRICT company_record
  FROM public.companies AS company
  WHERE company.id = requested_company_id;

  SELECT customer.*
  INTO STRICT client_record
  FROM public.clients AS customer
  WHERE customer.id = requested_client_id
    AND customer.company_id = requested_company_id;

  SELECT budget.*
  INTO STRICT budget_record
  FROM public.budgets AS budget
  WHERE budget.id = requested_budget_id
    AND budget.company_id = requested_company_id
    AND budget.client_id = requested_client_id;

  SELECT to_jsonb(address_row)
  INTO address_snapshot
  FROM (
    SELECT
      address.id,
      address.label,
      address.address,
      address.province,
      address.district,
      address.township,
      address.reference
    FROM public.client_addresses AS address
    LEFT JOIN public.projects AS project
      ON project.id = budget_record.project_id
     AND project.company_id = requested_company_id
    WHERE address.company_id = requested_company_id
      AND address.client_id = requested_client_id
    ORDER BY
      CASE
        WHEN address.id = project.address_id THEN 0
        WHEN address.is_primary THEN 1
        ELSE 2
      END,
      address.created_at
    LIMIT 1
  ) AS address_row;

  address_snapshot := COALESCE(address_snapshot, 'null'::jsonb);

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', section.id,
        'name', section.name,
        'description', section.description,
        'sortOrder', section.sort_order
      )
      ORDER BY section.sort_order, section.created_at, section.id
    ),
    '[]'::jsonb
  )
  INTO sections_snapshot
  FROM public.budget_sections AS section
  WHERE section.company_id = requested_company_id
    AND section.budget_id = requested_budget_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', item.id,
        'sectionId', item.section_id,
        'catalogItemId', item.catalog_item_id,
        'platformCatalogItemId', item.platform_catalog_item_id,
        'itemType', item.item_type,
        'description', item.description,
        'unitName', item.unit_name,
        'quantity', item.quantity,
        'unitCost', item.unit_cost,
        'unitPrice', item.unit_price,
        'discountPercentage', item.discount_percentage,
        'subtotal', item.subtotal,
        'taxable', item.taxable,
        'sortOrder', item.sort_order,
        'notes', item.notes
      )
      ORDER BY
        COALESCE(section.sort_order, 2147483647),
        item.sort_order,
        item.created_at,
        item.id
    ),
    '[]'::jsonb
  ),
  COALESCE(
    sum(item.subtotal) FILTER (WHERE item.taxable),
    0
  )
  INTO items_snapshot, taxable_subtotal
  FROM public.budget_items AS item
  LEFT JOIN public.budget_sections AS section
    ON section.id = item.section_id
   AND section.company_id = item.company_id
   AND section.budget_id = item.budget_id
  WHERE item.company_id = requested_company_id
    AND item.budget_id = requested_budget_id;

  RETURN jsonb_build_object(
    'schemaVersion', 1,
    'invoice', jsonb_build_object(
      'number', requested_invoice_number,
      'issueDate', requested_issue_date,
      'dueDate', requested_due_date,
      'notes', requested_notes
    ),
    'company', jsonb_build_object(
      'id', company_record.id,
      'name', company_record.name,
      'legalName', company_record.legal_name,
      'taxId', company_record.tax_id,
      'phone', company_record.phone,
      'email', company_record.email,
      'address', company_record.address,
      'logoUrl', company_record.logo_url,
      'timezone', company_record.timezone
    ),
    'client', jsonb_build_object(
      'id', client_record.id,
      'type', client_record.client_type,
      'firstName', client_record.first_name,
      'lastName', client_record.last_name,
      'businessName', client_record.business_name,
      'documentType', client_record.document_type,
      'documentNumber', client_record.document_number,
      'phone', client_record.phone,
      'secondaryPhone', client_record.secondary_phone,
      'email', client_record.email,
      'address', address_snapshot
    ),
    'sections', sections_snapshot,
    'items', items_snapshot,
    'taxes', jsonb_build_array(
      jsonb_build_object(
        'name', 'ITBMS',
        'rate', budget_record.tax_rate,
        'taxableAmount', taxable_subtotal,
        'amount', budget_record.tax_amount
      )
    ),
    'totals', jsonb_build_object(
      'subtotal', budget_record.subtotal,
      'discount', budget_record.discount_amount,
      'tax', budget_record.tax_amount,
      'total', budget_record.total
    ),
    'currency', budget_record.currency_code,
    'conditions', budget_record.terms,
    'source', jsonb_build_object(
      'budgetId', budget_record.id,
      'budgetNumber', budget_record.budget_number,
      'budgetVersion', budget_record.version,
      'projectId', budget_record.project_id,
      'title', budget_record.title
    )
  );
EXCEPTION
  WHEN no_data_found THEN
    RAISE EXCEPTION 'No fue posible construir el snapshot de la factura.';
END
$function$;

-- Convertir las facturas anteriores en documentos emitidos con snapshot.
UPDATE public.invoices AS invoice
SET
  snapshot_schema_version = 1,
  snapshot_data = private.build_invoice_snapshot(
    invoice.company_id,
    invoice.client_id,
    invoice.budget_id,
    invoice.invoice_number,
    invoice.issue_date,
    invoice.due_date,
    invoice.notes
  ),
  issued_at = COALESCE(invoice.created_at, now()),
  issued_by = invoice.created_by
WHERE invoice.budget_id IS NOT NULL;

DO $validate_backfill$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.status <> 'draft'::public.invoice_status
      AND (
        invoice.snapshot_schema_version IS NULL
        OR invoice.snapshot_data IS NULL
        OR invoice.invoice_number IS NULL
        OR invoice.issue_date IS NULL
        OR invoice.issued_at IS NULL
      )
  ) THEN
    RAISE EXCEPTION
      'Existen facturas históricas que no pudieron convertirse a snapshot.';
  END IF;
END
$validate_backfill$;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_snapshot_schema_version_valid CHECK (
    snapshot_schema_version IS NULL
    OR snapshot_schema_version = 1
  ),
  ADD CONSTRAINT invoices_snapshot_data_object CHECK (
    snapshot_data IS NULL
    OR jsonb_typeof(snapshot_data) = 'object'
  ),
  ADD CONSTRAINT invoices_issue_data_consistent CHECK (
    (
      status = 'draft'::public.invoice_status
      AND invoice_number IS NULL
      AND issue_date IS NULL
      AND snapshot_schema_version IS NULL
      AND snapshot_data IS NULL
      AND issued_at IS NULL
      AND issued_by IS NULL
    )
    OR
    (
      status <> 'draft'::public.invoice_status
      AND invoice_number IS NOT NULL
      AND issue_date IS NOT NULL
      AND snapshot_schema_version IS NOT NULL
      AND snapshot_data IS NOT NULL
      AND issued_at IS NOT NULL
    )
  ),
  ADD CONSTRAINT invoices_due_date_valid CHECK (
    issue_date IS NULL
    OR due_date IS NULL
    OR due_date >= issue_date
  );

CREATE OR REPLACE FUNCTION private.is_valid_invoice_transition(
  previous_status public.invoice_status,
  requested_status public.invoice_status
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT CASE previous_status
    WHEN 'draft'::public.invoice_status THEN
      requested_status = 'issued'::public.invoice_status
    WHEN 'issued'::public.invoice_status THEN
      requested_status IN (
        'partially_paid'::public.invoice_status,
        'paid'::public.invoice_status,
        'overdue'::public.invoice_status,
        'cancelled'::public.invoice_status
      )
    WHEN 'partially_paid'::public.invoice_status THEN
      requested_status IN (
        'paid'::public.invoice_status,
        'overdue'::public.invoice_status,
        'cancelled'::public.invoice_status
      )
    WHEN 'overdue'::public.invoice_status THEN
      requested_status IN (
        'partially_paid'::public.invoice_status,
        'paid'::public.invoice_status,
        'cancelled'::public.invoice_status
      )
    ELSE false
  END;
$function$;

CREATE OR REPLACE FUNCTION private.enforce_invoice_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF OLD.status <> 'draft'::public.invoice_status
     AND (
       NEW.company_id IS DISTINCT FROM OLD.company_id
       OR NEW.budget_id IS DISTINCT FROM OLD.budget_id
       OR NEW.client_id IS DISTINCT FROM OLD.client_id
       OR NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
       OR NEW.issue_date IS DISTINCT FROM OLD.issue_date
       OR NEW.due_date IS DISTINCT FROM OLD.due_date
       OR NEW.notes IS DISTINCT FROM OLD.notes
       OR NEW.snapshot_schema_version IS DISTINCT FROM OLD.snapshot_schema_version
       OR NEW.snapshot_data IS DISTINCT FROM OLD.snapshot_data
       OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
       OR NEW.issued_by IS DISTINCT FROM OLD.issued_by
     ) THEN
    RAISE EXCEPTION
      'Una factura emitida es inmutable.';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT private.is_valid_invoice_transition(
       OLD.status,
       NEW.status
     ) THEN
    RAISE EXCEPTION
      'Transición de factura no permitida: % -> %.',
      OLD.status,
      NEW.status;
  END IF;

  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION private.record_invoice_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  history_event text;
  change_reason text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    history_event := 'created';
  ELSIF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  ELSIF NEW.status = 'issued'::public.invoice_status THEN
    history_event := 'issued';
  ELSIF NEW.status = 'cancelled'::public.invoice_status THEN
    history_event := 'cancelled';
  ELSE
    history_event := 'status_changed';
  END IF;

  change_reason := NULLIF(
    current_setting('app.invoice_change_reason', true),
    ''
  );

  INSERT INTO public.invoice_history (
    company_id,
    invoice_id,
    event_type,
    from_status,
    to_status,
    actor_user_id,
    metadata
  )
  VALUES (
    NEW.company_id,
    NEW.id,
    history_event,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
    NEW.status,
    app.current_user_id(),
    jsonb_strip_nulls(
      jsonb_build_object(
        'reason', change_reason,
        'invoiceNumber', NEW.invoice_number,
        'snapshotSchemaVersion', NEW.snapshot_schema_version
      )
    )
  );

  RETURN NEW;
END
$function$;

INSERT INTO public.invoice_history (
  company_id,
  invoice_id,
  event_type,
  from_status,
  to_status,
  actor_user_id,
  metadata,
  created_at
)
SELECT
  invoice.company_id,
  invoice.id,
  'migrated',
  NULL,
  invoice.status,
  invoice.created_by,
  jsonb_build_object(
    'sourceMigration', '015_invoice_snapshots_and_history.sql',
    'invoiceNumber', invoice.invoice_number,
    'snapshotSchemaVersion', invoice.snapshot_schema_version
  ),
  invoice.created_at
FROM public.invoices AS invoice;

CREATE TRIGGER invoices_enforce_mutation
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION private.enforce_invoice_mutation();

CREATE TRIGGER invoices_record_history
AFTER INSERT OR UPDATE OF status ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION private.record_invoice_history();

CREATE OR REPLACE FUNCTION public.create_invoice(
  requested_company_id uuid,
  requested_client_id uuid,
  requested_budget_id uuid,
  requested_due_date date DEFAULT NULL,
  requested_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  created_invoice_id uuid;
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION
      'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role,
      'sales'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'No tienes permiso para crear facturas en esta empresa.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.clients AS customer
    WHERE customer.id = requested_client_id
      AND customer.company_id = requested_company_id
      AND customer.active = true
  ) THEN
    RAISE EXCEPTION
      'El cliente no pertenece a la empresa o está inactivo.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.budgets AS budget
    WHERE budget.id = requested_budget_id
      AND budget.company_id = requested_company_id
      AND budget.client_id = requested_client_id
      AND budget.status = 'approved'::public.budget_status
  ) THEN
    RAISE EXCEPTION
      'Solo se puede facturar un presupuesto aprobado.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.budget_id = requested_budget_id
  ) THEN
    RAISE EXCEPTION
      'Ya existe una factura para este presupuesto.';
  END IF;

  INSERT INTO public.invoices (
    company_id,
    budget_id,
    client_id,
    due_date,
    notes,
    created_by
  )
  VALUES (
    requested_company_id,
    requested_budget_id,
    requested_client_id,
    requested_due_date,
    NULLIF(btrim(requested_notes), ''),
    app.current_user_id()
  )
  RETURNING id INTO created_invoice_id;

  RETURN created_invoice_id;
END
$function$;

CREATE OR REPLACE FUNCTION public.issue_invoice(
  requested_invoice_id uuid,
  requested_company_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invoice_record public.invoices%ROWTYPE;
  generated_number text;
  generated_issue_date date := CURRENT_DATE;
  generated_snapshot jsonb;
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION
      'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role,
      'sales'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'No tienes permiso para emitir facturas en esta empresa.';
  END IF;

  SELECT invoice.*
  INTO invoice_record
  FROM public.invoices AS invoice
  WHERE invoice.id = requested_invoice_id
    AND invoice.company_id = requested_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la factura.';
  END IF;

  IF invoice_record.status <> 'draft'::public.invoice_status THEN
    RAISE EXCEPTION 'Solo se puede emitir una factura en borrador.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.budgets AS budget
    WHERE budget.id = invoice_record.budget_id
      AND budget.company_id = invoice_record.company_id
      AND budget.client_id = invoice_record.client_id
      AND budget.status = 'approved'::public.budget_status
  ) THEN
    RAISE EXCEPTION
      'El presupuesto debe permanecer aprobado al emitir la factura.';
  END IF;

  generated_number := public.next_document_number(
    invoice_record.company_id,
    'invoice'::public.document_type
  );

  generated_snapshot := private.build_invoice_snapshot(
    invoice_record.company_id,
    invoice_record.client_id,
    invoice_record.budget_id,
    generated_number,
    generated_issue_date,
    invoice_record.due_date,
    invoice_record.notes
  );

  PERFORM set_config(
    'app.invoice_change_reason',
    'Factura emitida desde presupuesto aprobado.',
    true
  );

  UPDATE public.invoices
  SET
    invoice_number = generated_number,
    status = 'issued'::public.invoice_status,
    issue_date = generated_issue_date,
    snapshot_schema_version = 1,
    snapshot_data = generated_snapshot,
    issued_at = now(),
    issued_by = app.current_user_id(),
    updated_at = now()
  WHERE id = invoice_record.id;

  RETURN invoice_record.id;
END
$function$;

CREATE OR REPLACE FUNCTION public.transition_invoice_status(
  requested_invoice_id uuid,
  requested_company_id uuid,
  requested_status public.invoice_status,
  requested_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invoice_record public.invoices%ROWTYPE;
  clean_reason text := NULLIF(btrim(requested_reason), '');
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION
      'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role,
      'sales'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'No tienes permiso para cambiar el estado de esta factura.';
  END IF;

  SELECT invoice.*
  INTO invoice_record
  FROM public.invoices AS invoice
  WHERE invoice.id = requested_invoice_id
    AND invoice.company_id = requested_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la factura.';
  END IF;

  IF requested_status IN (
    'draft'::public.invoice_status,
    'issued'::public.invoice_status
  ) THEN
    RAISE EXCEPTION
      'Este estado requiere el flujo específico de emisión.';
  END IF;

  IF requested_status IN (
    'partially_paid'::public.invoice_status,
    'paid'::public.invoice_status
  ) THEN
    RAISE EXCEPTION
      'Los estados de pago solo pueden cambiar mediante un pago confirmado.';
  END IF;

  IF requested_status = 'cancelled'::public.invoice_status
     AND clean_reason IS NULL THEN
    RAISE EXCEPTION
      'La cancelación requiere un motivo.';
  END IF;

  IF NOT private.is_valid_invoice_transition(
    invoice_record.status,
    requested_status
  ) THEN
    RAISE EXCEPTION
      'Transición de factura no permitida: % -> %.',
      invoice_record.status,
      requested_status;
  END IF;

  PERFORM set_config(
    'app.invoice_change_reason',
    COALESCE(clean_reason, 'Cambio de estado controlado.'),
    true
  );

  UPDATE public.invoices
  SET
    status = requested_status,
    updated_at = now()
  WHERE id = invoice_record.id;

  RETURN invoice_record.id;
END
$function$;

REVOKE ALL ON public.invoice_history FROM contractor_api;
GRANT SELECT ON public.invoice_history TO contractor_api;

REVOKE INSERT, UPDATE, DELETE ON public.invoices FROM contractor_api;
GRANT SELECT ON public.invoices TO contractor_api;

REVOKE EXECUTE
ON FUNCTION private.build_invoice_snapshot(
  uuid,
  uuid,
  uuid,
  text,
  date,
  date,
  text
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION private.is_valid_invoice_transition(
  public.invoice_status,
  public.invoice_status
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION private.enforce_invoice_mutation()
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION private.record_invoice_history()
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.create_invoice(
  uuid,
  uuid,
  uuid,
  date,
  text
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.issue_invoice(uuid, uuid)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.transition_invoice_status(
  uuid,
  uuid,
  public.invoice_status,
  text
)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.create_invoice(
  uuid,
  uuid,
  uuid,
  date,
  text
)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.issue_invoice(uuid, uuid)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.transition_invoice_status(
  uuid,
  uuid,
  public.invoice_status,
  text
)
TO contractor_api;

COMMENT ON COLUMN public.invoices.snapshot_data IS
  'Copia inmutable de empresa, cliente, partidas, impuestos, totales, moneda y condiciones al emitir.';

COMMENT ON TABLE public.invoice_history IS
  'Registro inmutable de creación, emisión y cambios de estado de cada factura.';

RESET ROLE;

COMMIT;
