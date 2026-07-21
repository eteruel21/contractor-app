BEGIN;

SET ROLE contractor_owner;

-- P1 / T-084.
-- Las facturas sin movimientos financieros se cancelan mediante una operación
-- controlada. Las correcciones de facturas con movimientos se documentan con
-- notas de crédito numeradas, inmutables y reversibles sin borrar registros.

-- El ejecutor aplica cada archivo dentro de una sola transacción. Por eso el
-- enum se reemplaza en vez de usar ALTER TYPE ... ADD VALUE, cuyo nuevo valor
-- no puede utilizarse hasta confirmar la transacción.
DROP FUNCTION public.next_document_number(uuid, public.document_type);

CREATE TYPE public.document_type_v2 AS ENUM (
  'budget',
  'invoice',
  'receipt',
  'project',
  'payment',
  'credit_note'
);

ALTER TABLE public.document_sequences
  ALTER COLUMN document_type TYPE public.document_type_v2
  USING document_type::text::public.document_type_v2;

DROP TYPE public.document_type;

ALTER TYPE public.document_type_v2
  RENAME TO document_type;

CREATE FUNCTION public.next_document_number(
  requested_company_id uuid,
  requested_document_type public.document_type
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  seq_record record;
  next_number bigint;
  current_year integer := extract(year from now())::integer;
  default_prefix text;
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.is_company_member(requested_company_id) THEN
    RAISE EXCEPTION 'No tienes acceso a esta empresa.';
  END IF;

  CASE requested_document_type
    WHEN 'budget'::public.document_type THEN default_prefix := 'COT';
    WHEN 'invoice'::public.document_type THEN default_prefix := 'FAC';
    WHEN 'receipt'::public.document_type THEN default_prefix := 'REC';
    WHEN 'project'::public.document_type THEN default_prefix := 'PR';
    WHEN 'payment'::public.document_type THEN default_prefix := 'ABO';
    WHEN 'credit_note'::public.document_type THEN default_prefix := 'NCR';
  END CASE;

  SELECT sequence.*
  INTO seq_record
  FROM public.document_sequences AS sequence
  WHERE sequence.company_id = requested_company_id
    AND sequence.document_type = requested_document_type
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.document_sequences (
      company_id,
      document_type,
      prefix,
      current_number,
      padding,
      yearly_reset,
      last_reset_year
    )
    VALUES (
      requested_company_id,
      requested_document_type,
      default_prefix,
      0,
      6,
      false,
      current_year
    )
    RETURNING * INTO seq_record;
  END IF;

  IF seq_record.yearly_reset = true
     AND COALESCE(seq_record.last_reset_year, current_year) <> current_year THEN
    UPDATE public.document_sequences
    SET
      current_number = 0,
      last_reset_year = current_year,
      updated_at = now()
    WHERE id = seq_record.id
    RETURNING * INTO seq_record;
  END IF;

  next_number := seq_record.current_number + 1;

  UPDATE public.document_sequences
  SET
    current_number = next_number,
    last_reset_year = current_year,
    updated_at = now()
  WHERE id = seq_record.id;

  RETURN seq_record.prefix
    || '-'
    || lpad(next_number::text, seq_record.padding, '0');
END
$function$;

REVOKE EXECUTE
ON FUNCTION public.next_document_number(uuid, public.document_type)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.next_document_number(uuid, public.document_type)
TO contractor_api;

CREATE TYPE public.invoice_credit_note_status AS ENUM (
  'issued',
  'cancelled'
);

ALTER TABLE public.invoice_history
  DROP CONSTRAINT invoice_history_event_type_valid;

ALTER TABLE public.invoice_history
  ADD CONSTRAINT invoice_history_event_type_valid CHECK (
    event_type IN (
      'created',
      'issued',
      'status_changed',
      'cancelled',
      'migrated',
      'payment_recorded',
      'payment_reversed',
      'credit_note_issued',
      'credit_note_cancelled'
    )
  );

CREATE TABLE public.invoice_credit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL
    REFERENCES public.companies(id)
    ON DELETE CASCADE,
  invoice_id uuid NOT NULL
    REFERENCES public.invoices(id)
    ON DELETE RESTRICT,
  credit_note_number text NOT NULL,
  status public.invoice_credit_note_status NOT NULL
    DEFAULT 'issued'::public.invoice_credit_note_status,
  amount numeric(12,2) NOT NULL,
  currency_code text NOT NULL,
  reason text NOT NULL,
  snapshot_schema_version smallint NOT NULL DEFAULT 1,
  snapshot_data jsonb NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  issued_by uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL,
  cancelled_at timestamptz,
  cancelled_by uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_credit_notes_amount_positive CHECK (amount > 0),
  CONSTRAINT invoice_credit_notes_currency_valid CHECK (
    currency_code ~ '^[A-Z]{3}$'
  ),
  CONSTRAINT invoice_credit_notes_reason_valid CHECK (
    char_length(btrim(reason)) BETWEEN 3 AND 1000
  ),
  CONSTRAINT invoice_credit_notes_snapshot_schema_valid CHECK (
    snapshot_schema_version = 1
  ),
  CONSTRAINT invoice_credit_notes_snapshot_object CHECK (
    jsonb_typeof(snapshot_data) = 'object'
  ),
  CONSTRAINT invoice_credit_notes_cancellation_consistent CHECK (
    (
      status = 'issued'::public.invoice_credit_note_status
      AND cancelled_at IS NULL
      AND cancelled_by IS NULL
      AND cancellation_reason IS NULL
    )
    OR
    (
      status = 'cancelled'::public.invoice_credit_note_status
      AND cancelled_at IS NOT NULL
      AND cancellation_reason IS NOT NULL
      AND char_length(btrim(cancellation_reason)) BETWEEN 3 AND 1000
    )
  ),
  CONSTRAINT invoice_credit_notes_company_number_unique
    UNIQUE (company_id, credit_note_number)
);

CREATE INDEX invoice_credit_notes_invoice_issued_idx
ON public.invoice_credit_notes(invoice_id, issued_at DESC, created_at DESC);

CREATE INDEX invoice_credit_notes_company_issued_idx
ON public.invoice_credit_notes(company_id, issued_at DESC, created_at DESC);

ALTER TABLE public.invoice_credit_notes
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoice_credit_notes_select_policy
ON public.invoice_credit_notes
FOR SELECT
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.id = invoice_credit_notes.invoice_id
      AND invoice.company_id = invoice_credit_notes.company_id
  )
);

CREATE OR REPLACE FUNCTION private.build_credit_note_snapshot(
  requested_invoice_snapshot jsonb,
  requested_invoice_id uuid,
  requested_credit_note_id uuid,
  requested_credit_note_number text,
  requested_amount numeric,
  requested_currency_code text,
  requested_reason text,
  requested_issued_at timestamptz,
  requested_previous_credit numeric,
  requested_total_credit numeric,
  requested_adjusted_total numeric,
  requested_total_paid numeric,
  requested_balance numeric,
  requested_customer_credit numeric
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT jsonb_build_object(
    'schemaVersion', 1,
    'creditNote', jsonb_build_object(
      'id', requested_credit_note_id,
      'number', requested_credit_note_number,
      'issuedAt', requested_issued_at,
      'amount', requested_amount,
      'currency', requested_currency_code,
      'reason', requested_reason
    ),
    'company', requested_invoice_snapshot -> 'company',
    'client', requested_invoice_snapshot -> 'client',
    'invoice', jsonb_build_object(
      'id', requested_invoice_id,
      'number', requested_invoice_snapshot #>> '{invoice,number}',
      'issueDate', requested_invoice_snapshot #>> '{invoice,issueDate}',
      'total', (requested_invoice_snapshot #>> '{totals,total}')::numeric,
      'currency', requested_invoice_snapshot ->> 'currency'
    ),
    'totals', jsonb_build_object(
      'previousCredit', requested_previous_credit,
      'creditAmount', requested_amount,
      'totalCredit', requested_total_credit,
      'adjustedInvoiceTotal', requested_adjusted_total,
      'totalPaid', requested_total_paid,
      'balance', requested_balance,
      'customerCredit', requested_customer_credit
    )
  );
$function$;

CREATE OR REPLACE FUNCTION private.enforce_invoice_credit_note_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION
      'Las notas de crédito no se eliminan; deben cancelarse.';
  END IF;

  IF current_setting('app.invoice_credit_note_cancel', true) <> 'on'
     OR OLD.status <> 'issued'::public.invoice_credit_note_status
     OR NEW.status <> 'cancelled'::public.invoice_credit_note_status
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.invoice_id IS DISTINCT FROM OLD.invoice_id
     OR NEW.credit_note_number IS DISTINCT FROM OLD.credit_note_number
     OR NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.currency_code IS DISTINCT FROM OLD.currency_code
     OR NEW.reason IS DISTINCT FROM OLD.reason
     OR NEW.snapshot_schema_version IS DISTINCT FROM OLD.snapshot_schema_version
     OR NEW.snapshot_data IS DISTINCT FROM OLD.snapshot_data
     OR NEW.issued_at IS DISTINCT FROM OLD.issued_at
     OR NEW.issued_by IS DISTINCT FROM OLD.issued_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.cancelled_at IS NULL
     OR NEW.cancellation_reason IS NULL
     OR char_length(btrim(NEW.cancellation_reason)) < 3 THEN
    RAISE EXCEPTION
      'Una nota de crédito emitida solo puede cambiar mediante una cancelación válida.';
  END IF;

  RETURN NEW;
END
$function$;

CREATE TRIGGER invoice_credit_notes_enforce_mutation
BEFORE UPDATE OR DELETE ON public.invoice_credit_notes
FOR EACH ROW
EXECUTE FUNCTION private.enforce_invoice_credit_note_mutation();

-- Los cambios de estado calculados por pagos y notas de crédito pueden avanzar
-- o retroceder entre estados financieros. Ninguna ruta manual obtiene ese
-- permiso; los indicadores solo viven durante la transacción controlada.
CREATE OR REPLACE FUNCTION private.enforce_invoice_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  financial_sync_enabled boolean :=
    current_setting('app.invoice_payment_sync', true) = 'on'
    OR current_setting('app.invoice_credit_sync', true) = 'on';
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
    RAISE EXCEPTION 'Una factura emitida es inmutable.';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT private.is_valid_invoice_transition(OLD.status, NEW.status)
     AND NOT (
       financial_sync_enabled
       AND OLD.status IN (
         'issued'::public.invoice_status,
         'partially_paid'::public.invoice_status,
         'paid'::public.invoice_status,
         'overdue'::public.invoice_status,
         'cancelled'::public.invoice_status
       )
       AND NEW.status IN (
         'issued'::public.invoice_status,
         'partially_paid'::public.invoice_status,
         'paid'::public.invoice_status,
         'overdue'::public.invoice_status,
         'cancelled'::public.invoice_status
       )
     ) THEN
    RAISE EXCEPTION
      'Transición de factura no permitida: % -> %.',
      OLD.status,
      NEW.status;
  END IF;

  RETURN NEW;
END
$function$;

CREATE OR REPLACE FUNCTION public.cancel_invoice(
  requested_invoice_id uuid,
  requested_company_id uuid,
  requested_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invoice_record public.invoices%ROWTYPE;
  clean_reason text := NULLIF(btrim(requested_reason), '');
  confirmed_payment_count bigint;
  issued_credit_note_count bigint;
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'Solo un propietario o administrador puede cancelar facturas.';
  END IF;

  IF clean_reason IS NULL OR char_length(clean_reason) NOT BETWEEN 3 AND 1000 THEN
    RAISE EXCEPTION 'La cancelación requiere un motivo válido.';
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

  SELECT count(*)
  INTO confirmed_payment_count
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  SELECT count(*)
  INTO issued_credit_note_count
  FROM public.invoice_credit_notes AS credit_note
  WHERE credit_note.invoice_id = invoice_record.id
    AND credit_note.company_id = invoice_record.company_id
    AND credit_note.status = 'issued'::public.invoice_credit_note_status;

  IF confirmed_payment_count > 0 OR issued_credit_note_count > 0 THEN
    RAISE EXCEPTION
      'La factura tiene movimientos financieros; utiliza una nota de crédito o revierte primero los movimientos.';
  END IF;

  IF invoice_record.status NOT IN (
    'issued'::public.invoice_status,
    'overdue'::public.invoice_status
  ) THEN
    RAISE EXCEPTION
      'Solo se puede cancelar directamente una factura emitida o vencida.';
  END IF;

  PERFORM set_config('app.invoice_change_reason', clean_reason, true);

  UPDATE public.invoices
  SET
    status = 'cancelled'::public.invoice_status,
    updated_at = now()
  WHERE id = invoice_record.id;

  RETURN invoice_record.id;
END
$function$;

CREATE OR REPLACE FUNCTION public.issue_invoice_credit_note(
  requested_invoice_id uuid,
  requested_company_id uuid,
  requested_amount numeric,
  requested_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invoice_record public.invoices%ROWTYPE;
  created_credit_note_id uuid := gen_random_uuid();
  generated_credit_note_number text;
  clean_reason text := NULLIF(btrim(requested_reason), '');
  invoice_total numeric(12,2);
  previous_credit numeric(12,2);
  total_credit numeric(12,2);
  adjusted_total numeric(12,2);
  total_paid numeric(12,2);
  balance numeric(12,2);
  customer_credit numeric(12,2);
  invoice_currency text;
  credit_note_snapshot jsonb;
  next_invoice_status public.invoice_status;
  issued_timestamp timestamptz := now();
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'Solo un propietario o administrador puede emitir notas de crédito.';
  END IF;

  IF requested_amount IS NULL
     OR requested_amount <= 0
     OR requested_amount <> round(requested_amount, 2) THEN
    RAISE EXCEPTION
      'El monto debe ser mayor que cero y tener como máximo dos decimales.';
  END IF;

  IF clean_reason IS NULL OR char_length(clean_reason) NOT BETWEEN 3 AND 1000 THEN
    RAISE EXCEPTION 'La nota de crédito requiere un motivo válido.';
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

  IF invoice_record.status IN (
    'draft'::public.invoice_status,
    'cancelled'::public.invoice_status
  ) THEN
    RAISE EXCEPTION
      'La nota de crédito requiere una factura emitida y activa.';
  END IF;

  IF invoice_record.snapshot_data IS NULL THEN
    RAISE EXCEPTION 'La factura no tiene un snapshot válido.';
  END IF;

  invoice_total :=
    (invoice_record.snapshot_data #>> '{totals,total}')::numeric(12,2);
  invoice_currency := upper(invoice_record.snapshot_data ->> 'currency');

  SELECT COALESCE(sum(credit_note.amount), 0)::numeric(12,2)
  INTO previous_credit
  FROM public.invoice_credit_notes AS credit_note
  WHERE credit_note.invoice_id = invoice_record.id
    AND credit_note.company_id = invoice_record.company_id
    AND credit_note.status = 'issued'::public.invoice_credit_note_status;

  IF previous_credit + requested_amount > invoice_total THEN
    RAISE EXCEPTION
      'La nota de crédito excede el monto acreditable de % %.',
      invoice_currency,
      invoice_total - previous_credit;
  END IF;

  SELECT COALESCE(sum(payment.amount), 0)::numeric(12,2)
  INTO total_paid
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  total_credit := previous_credit + requested_amount;
  adjusted_total := invoice_total - total_credit;
  balance := GREATEST(adjusted_total - total_paid, 0);
  customer_credit := GREATEST(total_paid - adjusted_total, 0);

  generated_credit_note_number := public.next_document_number(
    invoice_record.company_id,
    'credit_note'::public.document_type
  );

  credit_note_snapshot := private.build_credit_note_snapshot(
    invoice_record.snapshot_data,
    invoice_record.id,
    created_credit_note_id,
    generated_credit_note_number,
    requested_amount,
    invoice_currency,
    clean_reason,
    issued_timestamp,
    previous_credit,
    total_credit,
    adjusted_total,
    total_paid,
    balance,
    customer_credit
  );

  INSERT INTO public.invoice_credit_notes (
    id,
    company_id,
    invoice_id,
    credit_note_number,
    amount,
    currency_code,
    reason,
    snapshot_schema_version,
    snapshot_data,
    issued_at,
    issued_by
  )
  VALUES (
    created_credit_note_id,
    invoice_record.company_id,
    invoice_record.id,
    generated_credit_note_number,
    requested_amount,
    invoice_currency,
    clean_reason,
    1,
    credit_note_snapshot,
    issued_timestamp,
    app.current_user_id()
  );

  next_invoice_status := CASE
    WHEN adjusted_total = 0 THEN 'cancelled'::public.invoice_status
    WHEN total_paid >= adjusted_total THEN 'paid'::public.invoice_status
    WHEN total_paid > 0 THEN 'partially_paid'::public.invoice_status
    WHEN invoice_record.due_date IS NOT NULL
      AND invoice_record.due_date < CURRENT_DATE
      THEN 'overdue'::public.invoice_status
    ELSE 'issued'::public.invoice_status
  END;

  PERFORM set_config('app.invoice_credit_sync', 'on', true);
  PERFORM set_config(
    'app.invoice_change_reason',
    'Nota de crédito emitida: ' || generated_credit_note_number || '.',
    true
  );

  UPDATE public.invoices
  SET
    status = next_invoice_status,
    updated_at = now()
  WHERE id = invoice_record.id;

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
    invoice_record.company_id,
    invoice_record.id,
    'credit_note_issued',
    invoice_record.status,
    next_invoice_status,
    app.current_user_id(),
    jsonb_build_object(
      'creditNoteId', created_credit_note_id,
      'creditNoteNumber', generated_credit_note_number,
      'amount', requested_amount,
      'currency', invoice_currency,
      'reason', clean_reason,
      'totalCredit', total_credit,
      'adjustedInvoiceTotal', adjusted_total,
      'balance', balance,
      'customerCredit', customer_credit
    )
  );

  RETURN created_credit_note_id;
END
$function$;

CREATE OR REPLACE FUNCTION public.cancel_invoice_credit_note(
  requested_credit_note_id uuid,
  requested_invoice_id uuid,
  requested_company_id uuid,
  requested_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invoice_record public.invoices%ROWTYPE;
  credit_note_record public.invoice_credit_notes%ROWTYPE;
  clean_reason text := NULLIF(btrim(requested_reason), '');
  invoice_total numeric(12,2);
  remaining_credit numeric(12,2);
  adjusted_total numeric(12,2);
  total_paid numeric(12,2);
  balance numeric(12,2);
  customer_credit numeric(12,2);
  next_invoice_status public.invoice_status;
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'Solo un propietario o administrador puede cancelar notas de crédito.';
  END IF;

  IF clean_reason IS NULL OR char_length(clean_reason) NOT BETWEEN 3 AND 1000 THEN
    RAISE EXCEPTION 'La cancelación requiere un motivo válido.';
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

  SELECT credit_note.*
  INTO credit_note_record
  FROM public.invoice_credit_notes AS credit_note
  WHERE credit_note.id = requested_credit_note_id
    AND credit_note.invoice_id = requested_invoice_id
    AND credit_note.company_id = requested_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró la nota de crédito.';
  END IF;

  IF credit_note_record.status <> 'issued'::public.invoice_credit_note_status THEN
    RAISE EXCEPTION 'La nota de crédito ya fue cancelada.';
  END IF;

  PERFORM set_config('app.invoice_credit_note_cancel', 'on', true);

  UPDATE public.invoice_credit_notes
  SET
    status = 'cancelled'::public.invoice_credit_note_status,
    cancelled_at = now(),
    cancelled_by = app.current_user_id(),
    cancellation_reason = clean_reason,
    updated_at = now()
  WHERE id = credit_note_record.id;

  invoice_total :=
    (invoice_record.snapshot_data #>> '{totals,total}')::numeric(12,2);

  SELECT COALESCE(sum(credit_note.amount), 0)::numeric(12,2)
  INTO remaining_credit
  FROM public.invoice_credit_notes AS credit_note
  WHERE credit_note.invoice_id = invoice_record.id
    AND credit_note.company_id = invoice_record.company_id
    AND credit_note.status = 'issued'::public.invoice_credit_note_status;

  SELECT COALESCE(sum(payment.amount), 0)::numeric(12,2)
  INTO total_paid
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  adjusted_total := invoice_total - remaining_credit;
  balance := GREATEST(adjusted_total - total_paid, 0);
  customer_credit := GREATEST(total_paid - adjusted_total, 0);

  next_invoice_status := CASE
    WHEN adjusted_total = 0 THEN 'cancelled'::public.invoice_status
    WHEN total_paid >= adjusted_total THEN 'paid'::public.invoice_status
    WHEN total_paid > 0 THEN 'partially_paid'::public.invoice_status
    WHEN invoice_record.due_date IS NOT NULL
      AND invoice_record.due_date < CURRENT_DATE
      THEN 'overdue'::public.invoice_status
    ELSE 'issued'::public.invoice_status
  END;

  PERFORM set_config('app.invoice_credit_sync', 'on', true);
  PERFORM set_config(
    'app.invoice_change_reason',
    'Nota de crédito cancelada: '
      || credit_note_record.credit_note_number
      || '.',
    true
  );

  UPDATE public.invoices
  SET
    status = next_invoice_status,
    updated_at = now()
  WHERE id = invoice_record.id;

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
    invoice_record.company_id,
    invoice_record.id,
    'credit_note_cancelled',
    invoice_record.status,
    next_invoice_status,
    app.current_user_id(),
    jsonb_build_object(
      'creditNoteId', credit_note_record.id,
      'creditNoteNumber', credit_note_record.credit_note_number,
      'amount', credit_note_record.amount,
      'currency', credit_note_record.currency_code,
      'reason', clean_reason,
      'totalCredit', remaining_credit,
      'adjustedInvoiceTotal', adjusted_total,
      'balance', balance,
      'customerCredit', customer_credit
    )
  );

  RETURN credit_note_record.id;
END
$function$;

-- Los pagos posteriores a una nota de crédito usan el total ajustado y el
-- recibo deja constancia del crédito aplicado antes del abono.
DROP FUNCTION private.build_receipt_snapshot(
  jsonb,
  uuid,
  uuid,
  text,
  text,
  public.invoice_payment_method,
  numeric,
  text,
  timestamptz,
  text,
  text,
  numeric,
  numeric,
  numeric
);

CREATE FUNCTION private.build_receipt_snapshot(
  requested_invoice_snapshot jsonb,
  requested_invoice_id uuid,
  requested_payment_id uuid,
  requested_payment_number text,
  requested_receipt_number text,
  requested_method public.invoice_payment_method,
  requested_amount numeric,
  requested_currency_code text,
  requested_paid_at timestamptz,
  requested_reference text,
  requested_notes text,
  requested_total_credit numeric,
  requested_adjusted_invoice_total numeric,
  requested_previous_paid numeric,
  requested_total_paid numeric,
  requested_balance numeric
)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = ''
AS $function$
  SELECT jsonb_build_object(
    'schemaVersion', 1,
    'receipt', jsonb_build_object(
      'number', requested_receipt_number,
      'issuedAt', requested_paid_at
    ),
    'company', requested_invoice_snapshot -> 'company',
    'client', requested_invoice_snapshot -> 'client',
    'invoice', jsonb_build_object(
      'id', requested_invoice_id,
      'number', requested_invoice_snapshot #>> '{invoice,number}',
      'issueDate', requested_invoice_snapshot #>> '{invoice,issueDate}',
      'total', (requested_invoice_snapshot #>> '{totals,total}')::numeric,
      'currency', requested_invoice_snapshot ->> 'currency'
    ),
    'payment', jsonb_strip_nulls(
      jsonb_build_object(
        'id', requested_payment_id,
        'number', requested_payment_number,
        'method', requested_method,
        'amount', requested_amount,
        'currency', requested_currency_code,
        'paidAt', requested_paid_at,
        'reference', requested_reference,
        'notes', requested_notes
      )
    ),
    'totals', jsonb_build_object(
      'creditTotal', requested_total_credit,
      'adjustedInvoiceTotal', requested_adjusted_invoice_total,
      'previousPaid', requested_previous_paid,
      'paymentAmount', requested_amount,
      'totalPaid', requested_total_paid,
      'balance', requested_balance
    )
  );
$function$;

CREATE OR REPLACE FUNCTION public.record_invoice_payment(
  requested_invoice_id uuid,
  requested_company_id uuid,
  requested_amount numeric,
  requested_method public.invoice_payment_method,
  requested_paid_at timestamptz DEFAULT now(),
  requested_reference text DEFAULT NULL,
  requested_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  invoice_record public.invoices%ROWTYPE;
  created_payment_id uuid := gen_random_uuid();
  generated_payment_number text;
  generated_receipt_number text;
  invoice_total numeric(12,2);
  total_credit numeric(12,2);
  adjusted_total numeric(12,2);
  previous_paid numeric(12,2);
  new_total_paid numeric(12,2);
  new_balance numeric(12,2);
  next_invoice_status public.invoice_status;
  invoice_currency text;
  receipt_snapshot jsonb;
  clean_reference text := NULLIF(btrim(requested_reference), '');
  clean_notes text := NULLIF(btrim(requested_notes), '');
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role,
      'sales'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION 'No tienes permiso para registrar pagos en esta empresa.';
  END IF;

  IF requested_amount IS NULL
     OR requested_amount <= 0
     OR requested_amount <> round(requested_amount, 2) THEN
    RAISE EXCEPTION
      'El monto debe ser mayor que cero y tener como máximo dos decimales.';
  END IF;

  IF requested_paid_at IS NULL
     OR requested_paid_at > now() + interval '5 minutes' THEN
    RAISE EXCEPTION 'La fecha del pago no es válida.';
  END IF;

  IF clean_reference IS NOT NULL
     AND char_length(clean_reference) > 200 THEN
    RAISE EXCEPTION 'La referencia del pago es demasiado larga.';
  END IF;

  IF clean_notes IS NOT NULL
     AND char_length(clean_notes) > 2000 THEN
    RAISE EXCEPTION 'Las notas del pago son demasiado largas.';
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

  IF invoice_record.status NOT IN (
    'issued'::public.invoice_status,
    'partially_paid'::public.invoice_status,
    'overdue'::public.invoice_status
  ) THEN
    RAISE EXCEPTION
      'Solo se pueden registrar pagos en facturas emitidas con saldo pendiente.';
  END IF;

  invoice_total :=
    (invoice_record.snapshot_data #>> '{totals,total}')::numeric(12,2);
  invoice_currency := upper(invoice_record.snapshot_data ->> 'currency');

  SELECT COALESCE(sum(credit_note.amount), 0)::numeric(12,2)
  INTO total_credit
  FROM public.invoice_credit_notes AS credit_note
  WHERE credit_note.invoice_id = invoice_record.id
    AND credit_note.company_id = invoice_record.company_id
    AND credit_note.status = 'issued'::public.invoice_credit_note_status;

  adjusted_total := invoice_total - total_credit;

  SELECT COALESCE(sum(payment.amount), 0)::numeric(12,2)
  INTO previous_paid
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  new_total_paid := previous_paid + requested_amount;

  IF new_total_paid > adjusted_total THEN
    RAISE EXCEPTION
      'El pago excede el saldo pendiente de % %.',
      invoice_currency,
      GREATEST(adjusted_total - previous_paid, 0);
  END IF;

  new_balance := adjusted_total - new_total_paid;
  next_invoice_status := CASE
    WHEN new_balance = 0 THEN 'paid'::public.invoice_status
    ELSE 'partially_paid'::public.invoice_status
  END;

  generated_payment_number := public.next_document_number(
    invoice_record.company_id,
    'payment'::public.document_type
  );
  generated_receipt_number := public.next_document_number(
    invoice_record.company_id,
    'receipt'::public.document_type
  );

  receipt_snapshot := private.build_receipt_snapshot(
    invoice_record.snapshot_data,
    invoice_record.id,
    created_payment_id,
    generated_payment_number,
    generated_receipt_number,
    requested_method,
    requested_amount,
    invoice_currency,
    requested_paid_at,
    clean_reference,
    clean_notes,
    total_credit,
    adjusted_total,
    previous_paid,
    new_total_paid,
    new_balance
  );

  INSERT INTO public.invoice_payments (
    id,
    company_id,
    invoice_id,
    payment_number,
    receipt_number,
    method,
    amount,
    currency_code,
    paid_at,
    reference,
    notes,
    receipt_schema_version,
    receipt_snapshot_data,
    created_by
  )
  VALUES (
    created_payment_id,
    invoice_record.company_id,
    invoice_record.id,
    generated_payment_number,
    generated_receipt_number,
    requested_method,
    requested_amount,
    invoice_currency,
    requested_paid_at,
    clean_reference,
    clean_notes,
    1,
    receipt_snapshot,
    app.current_user_id()
  );

  PERFORM set_config('app.invoice_payment_sync', 'on', true);
  PERFORM set_config(
    'app.invoice_change_reason',
    'Pago confirmado: ' || generated_payment_number || '.',
    true
  );

  UPDATE public.invoices
  SET
    status = next_invoice_status,
    updated_at = now()
  WHERE id = invoice_record.id;

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
    invoice_record.company_id,
    invoice_record.id,
    'payment_recorded',
    invoice_record.status,
    next_invoice_status,
    app.current_user_id(),
    jsonb_build_object(
      'paymentId', created_payment_id,
      'paymentNumber', generated_payment_number,
      'receiptNumber', generated_receipt_number,
      'amount', requested_amount,
      'currency', invoice_currency,
      'creditTotal', total_credit,
      'adjustedInvoiceTotal', adjusted_total,
      'totalPaid', new_total_paid,
      'balance', new_balance
    )
  );

  RETURN created_payment_id;
END
$function$;

CREATE OR REPLACE FUNCTION public.reverse_invoice_payment(
  requested_payment_id uuid,
  requested_invoice_id uuid,
  requested_company_id uuid,
  requested_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  payment_record public.invoice_payments%ROWTYPE;
  invoice_record public.invoices%ROWTYPE;
  clean_reason text := NULLIF(btrim(requested_reason), '');
  invoice_total numeric(12,2);
  total_credit numeric(12,2);
  adjusted_total numeric(12,2);
  remaining_paid numeric(12,2);
  new_balance numeric(12,2);
  customer_credit numeric(12,2);
  next_invoice_status public.invoice_status;
BEGIN
  IF app.current_user_id() IS NULL
     OR NOT private.is_active_platform_user() THEN
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
  END IF;

  IF NOT public.has_company_role(
    requested_company_id,
    ARRAY[
      'owner'::public.company_role,
      'admin'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'Solo un propietario o administrador puede revertir pagos.';
  END IF;

  IF clean_reason IS NULL OR char_length(clean_reason) < 3 THEN
    RAISE EXCEPTION 'La reversión requiere un motivo válido.';
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

  SELECT payment.*
  INTO payment_record
  FROM public.invoice_payments AS payment
  WHERE payment.id = requested_payment_id
    AND payment.invoice_id = requested_invoice_id
    AND payment.company_id = requested_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontró el pago.';
  END IF;

  IF payment_record.status <> 'confirmed'::public.invoice_payment_status THEN
    RAISE EXCEPTION 'El pago ya fue revertido.';
  END IF;

  IF invoice_record.status = 'cancelled'::public.invoice_status THEN
    RAISE EXCEPTION
      'Cancela primero la nota de crédito total antes de revertir pagos.';
  END IF;

  UPDATE public.invoice_payments
  SET
    status = 'reversed'::public.invoice_payment_status,
    reversed_at = now(),
    reversed_by = app.current_user_id(),
    reversal_reason = clean_reason,
    updated_at = now()
  WHERE id = payment_record.id;

  invoice_total :=
    (invoice_record.snapshot_data #>> '{totals,total}')::numeric(12,2);

  SELECT COALESCE(sum(credit_note.amount), 0)::numeric(12,2)
  INTO total_credit
  FROM public.invoice_credit_notes AS credit_note
  WHERE credit_note.invoice_id = invoice_record.id
    AND credit_note.company_id = invoice_record.company_id
    AND credit_note.status = 'issued'::public.invoice_credit_note_status;

  adjusted_total := invoice_total - total_credit;

  SELECT COALESCE(sum(payment.amount), 0)::numeric(12,2)
  INTO remaining_paid
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  new_balance := GREATEST(adjusted_total - remaining_paid, 0);
  customer_credit := GREATEST(remaining_paid - adjusted_total, 0);
  next_invoice_status := CASE
    WHEN adjusted_total = 0 THEN 'cancelled'::public.invoice_status
    WHEN remaining_paid >= adjusted_total THEN 'paid'::public.invoice_status
    WHEN remaining_paid > 0 THEN 'partially_paid'::public.invoice_status
    WHEN invoice_record.due_date IS NOT NULL
      AND invoice_record.due_date < CURRENT_DATE
      THEN 'overdue'::public.invoice_status
    ELSE 'issued'::public.invoice_status
  END;

  PERFORM set_config('app.invoice_payment_sync', 'on', true);
  PERFORM set_config(
    'app.invoice_change_reason',
    'Pago revertido: ' || payment_record.payment_number || '.',
    true
  );

  UPDATE public.invoices
  SET
    status = next_invoice_status,
    updated_at = now()
  WHERE id = invoice_record.id;

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
    invoice_record.company_id,
    invoice_record.id,
    'payment_reversed',
    invoice_record.status,
    next_invoice_status,
    app.current_user_id(),
    jsonb_build_object(
      'paymentId', payment_record.id,
      'paymentNumber', payment_record.payment_number,
      'receiptNumber', payment_record.receipt_number,
      'amount', payment_record.amount,
      'currency', payment_record.currency_code,
      'reason', clean_reason,
      'creditTotal', total_credit,
      'adjustedInvoiceTotal', adjusted_total,
      'totalPaid', remaining_paid,
      'balance', new_balance,
      'customerCredit', customer_credit
    )
  );

  RETURN payment_record.id;
END
$function$;

-- La ruta genérica ya no puede cancelar. La cancelación usa cancel_invoice(),
-- que aplica permisos y verifica que no existan movimientos financieros.
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
    RAISE EXCEPTION 'Se requiere una cuenta activa y aprobada.';
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

  IF requested_status <> 'overdue'::public.invoice_status THEN
    RAISE EXCEPTION
      'Este estado requiere un flujo financiero específico.';
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
    COALESCE(clean_reason, 'Marcada como vencida.'),
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

REVOKE ALL ON public.invoice_credit_notes FROM contractor_api;
GRANT SELECT ON public.invoice_credit_notes TO contractor_api;

REVOKE EXECUTE
ON FUNCTION private.build_credit_note_snapshot(
  jsonb,
  uuid,
  uuid,
  text,
  numeric,
  text,
  text,
  timestamptz,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION private.enforce_invoice_credit_note_mutation()
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION private.build_receipt_snapshot(
  jsonb,
  uuid,
  uuid,
  text,
  text,
  public.invoice_payment_method,
  numeric,
  text,
  timestamptz,
  text,
  text,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.cancel_invoice(uuid, uuid, text)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.issue_invoice_credit_note(uuid, uuid, numeric, text)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.cancel_invoice_credit_note(uuid, uuid, uuid, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.cancel_invoice(uuid, uuid, text)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.issue_invoice_credit_note(uuid, uuid, numeric, text)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.cancel_invoice_credit_note(uuid, uuid, uuid, text)
TO contractor_api;

COMMENT ON TABLE public.invoice_credit_notes IS
  'Notas de crédito numeradas e inmutables. Se cancelan, nunca se editan ni eliminan.';

COMMENT ON COLUMN public.invoice_credit_notes.snapshot_data IS
  'Snapshot inmutable usado para generar la nota de crédito emitida.';

RESET ROLE;

COMMIT;
