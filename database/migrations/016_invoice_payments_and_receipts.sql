BEGIN;

SET ROLE contractor_owner;

-- P1 / T-079, T-080, T-081 y T-082.
-- Los pagos confirmados y revertidos se conservan como eventos financieros
-- inmutables. Cada pago genera un comprobante y un recibo con numeracion propia.

CREATE TYPE public.invoice_payment_status AS ENUM (
  'confirmed',
  'reversed'
);

CREATE TYPE public.invoice_payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'card',
  'check',
  'other'
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
      'payment_reversed'
    )
  );

CREATE TABLE public.invoice_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL
    REFERENCES public.companies(id)
    ON DELETE CASCADE,
  invoice_id uuid NOT NULL
    REFERENCES public.invoices(id)
    ON DELETE RESTRICT,
  payment_number text NOT NULL,
  receipt_number text NOT NULL,
  status public.invoice_payment_status NOT NULL
    DEFAULT 'confirmed'::public.invoice_payment_status,
  method public.invoice_payment_method NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency_code text NOT NULL,
  paid_at timestamptz NOT NULL,
  reference text,
  notes text,
  receipt_schema_version smallint NOT NULL DEFAULT 1,
  receipt_snapshot_data jsonb NOT NULL,
  created_by uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reversed_at timestamptz,
  reversed_by uuid
    REFERENCES app_auth.users(id)
    ON DELETE SET NULL,
  reversal_reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invoice_payments_amount_positive CHECK (amount > 0),
  CONSTRAINT invoice_payments_currency_valid CHECK (
    currency_code ~ '^[A-Z]{3}$'
  ),
  CONSTRAINT invoice_payments_reference_length CHECK (
    reference IS NULL OR char_length(reference) <= 200
  ),
  CONSTRAINT invoice_payments_notes_length CHECK (
    notes IS NULL OR char_length(notes) <= 2000
  ),
  CONSTRAINT invoice_payments_receipt_schema_valid CHECK (
    receipt_schema_version = 1
  ),
  CONSTRAINT invoice_payments_receipt_snapshot_object CHECK (
    jsonb_typeof(receipt_snapshot_data) = 'object'
  ),
  CONSTRAINT invoice_payments_reversal_consistent CHECK (
    (
      status = 'confirmed'::public.invoice_payment_status
      AND reversed_at IS NULL
      AND reversed_by IS NULL
      AND reversal_reason IS NULL
    )
    OR
    (
      status = 'reversed'::public.invoice_payment_status
      AND reversed_at IS NOT NULL
      AND reversal_reason IS NOT NULL
      AND char_length(btrim(reversal_reason)) >= 3
    )
  ),
  CONSTRAINT invoice_payments_company_number_unique
    UNIQUE (company_id, payment_number),
  CONSTRAINT invoice_payments_company_receipt_unique
    UNIQUE (company_id, receipt_number)
);

CREATE INDEX invoice_payments_invoice_paid_idx
ON public.invoice_payments(invoice_id, paid_at DESC, created_at DESC);

CREATE INDEX invoice_payments_company_paid_idx
ON public.invoice_payments(company_id, paid_at DESC, created_at DESC);

ALTER TABLE public.invoice_payments
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY invoice_payments_select_policy
ON public.invoice_payments
FOR SELECT
TO contractor_api
USING (
  EXISTS (
    SELECT 1
    FROM public.invoices AS invoice
    WHERE invoice.id = invoice_payments.invoice_id
      AND invoice.company_id = invoice_payments.company_id
  )
);

CREATE OR REPLACE FUNCTION private.build_receipt_snapshot(
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
      'previousPaid', requested_previous_paid,
      'paymentAmount', requested_amount,
      'totalPaid', requested_total_paid,
      'balance', requested_balance
    )
  );
$function$;

CREATE OR REPLACE FUNCTION private.enforce_invoice_payment_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION
      'Los pagos no se eliminan; deben revertirse.';
  END IF;

  IF OLD.status = 'reversed'::public.invoice_payment_status THEN
    RAISE EXCEPTION
      'Un pago revertido es inmutable.';
  END IF;

  IF NEW.status <> 'reversed'::public.invoice_payment_status
     OR NEW.company_id IS DISTINCT FROM OLD.company_id
     OR NEW.invoice_id IS DISTINCT FROM OLD.invoice_id
     OR NEW.payment_number IS DISTINCT FROM OLD.payment_number
     OR NEW.receipt_number IS DISTINCT FROM OLD.receipt_number
     OR NEW.method IS DISTINCT FROM OLD.method
     OR NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.currency_code IS DISTINCT FROM OLD.currency_code
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.reference IS DISTINCT FROM OLD.reference
     OR NEW.notes IS DISTINCT FROM OLD.notes
     OR NEW.receipt_schema_version IS DISTINCT FROM OLD.receipt_schema_version
     OR NEW.receipt_snapshot_data IS DISTINCT FROM OLD.receipt_snapshot_data
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.reversed_at IS NULL
     OR NEW.reversal_reason IS NULL
     OR char_length(btrim(NEW.reversal_reason)) < 3 THEN
    RAISE EXCEPTION
      'Un pago confirmado solo puede cambiar mediante una reversión válida.';
  END IF;

  RETURN NEW;
END
$function$;

CREATE TRIGGER invoice_payments_enforce_mutation
BEFORE UPDATE OR DELETE ON public.invoice_payments
FOR EACH ROW
EXECUTE FUNCTION private.enforce_invoice_payment_mutation();

-- Las sincronizaciones producidas por pagos necesitan regresar desde "paid"
-- cuando se revierte un abono. Ninguna ruta manual obtiene este permiso.
CREATE OR REPLACE FUNCTION private.enforce_invoice_mutation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
DECLARE
  payment_sync_enabled boolean :=
    current_setting('app.invoice_payment_sync', true) = 'on';
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
     )
     AND NOT (
       payment_sync_enabled
       AND OLD.status IN (
         'issued'::public.invoice_status,
         'partially_paid'::public.invoice_status,
         'paid'::public.invoice_status,
         'overdue'::public.invoice_status
       )
       AND NEW.status IN (
         'issued'::public.invoice_status,
         'partially_paid'::public.invoice_status,
         'paid'::public.invoice_status,
         'overdue'::public.invoice_status
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
      'No tienes permiso para registrar pagos en esta empresa.';
  END IF;

  IF requested_amount IS NULL
     OR requested_amount <= 0
     OR requested_amount <> round(requested_amount, 2) THEN
    RAISE EXCEPTION
      'El monto debe ser mayor que cero y tener como máximo dos decimales.';
  END IF;

  IF requested_paid_at IS NULL
     OR requested_paid_at > now() + interval '5 minutes' THEN
    RAISE EXCEPTION
      'La fecha del pago no es válida.';
  END IF;

  IF clean_reference IS NOT NULL
     AND char_length(clean_reference) > 200 THEN
    RAISE EXCEPTION
      'La referencia del pago es demasiado larga.';
  END IF;

  IF clean_notes IS NOT NULL
     AND char_length(clean_notes) > 2000 THEN
    RAISE EXCEPTION
      'Las notas del pago son demasiado largas.';
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

  IF invoice_record.snapshot_data IS NULL THEN
    RAISE EXCEPTION
      'La factura no tiene un snapshot válido.';
  END IF;

  invoice_total :=
    (invoice_record.snapshot_data #>> '{totals,total}')::numeric(12,2);
  invoice_currency := upper(invoice_record.snapshot_data ->> 'currency');

  IF invoice_total IS NULL OR invoice_total <= 0 THEN
    RAISE EXCEPTION
      'El total congelado de la factura no es válido.';
  END IF;

  SELECT COALESCE(sum(payment.amount), 0)::numeric(12,2)
  INTO previous_paid
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  new_total_paid := previous_paid + requested_amount;

  IF new_total_paid > invoice_total THEN
    RAISE EXCEPTION
      'El pago excede el saldo pendiente de % %.',
      invoice_currency,
      invoice_total - previous_paid;
  END IF;

  new_balance := invoice_total - new_total_paid;
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

  PERFORM set_config(
    'app.invoice_payment_sync',
    'on',
    true
  );

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
  remaining_paid numeric(12,2);
  new_balance numeric(12,2);
  next_invoice_status public.invoice_status;
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
      'admin'::public.company_role
    ]
  ) THEN
    RAISE EXCEPTION
      'Solo un propietario o administrador puede revertir pagos.';
  END IF;

  IF clean_reason IS NULL OR char_length(clean_reason) < 3 THEN
    RAISE EXCEPTION
      'La reversión requiere un motivo válido.';
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
      'No se puede revertir un pago desde una factura cancelada.';
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

  SELECT COALESCE(sum(payment.amount), 0)::numeric(12,2)
  INTO remaining_paid
  FROM public.invoice_payments AS payment
  WHERE payment.invoice_id = invoice_record.id
    AND payment.company_id = invoice_record.company_id
    AND payment.status = 'confirmed'::public.invoice_payment_status;

  new_balance := invoice_total - remaining_paid;
  next_invoice_status := CASE
    WHEN new_balance = 0 THEN 'paid'::public.invoice_status
    WHEN remaining_paid > 0 THEN 'partially_paid'::public.invoice_status
    WHEN invoice_record.due_date IS NOT NULL
      AND invoice_record.due_date < CURRENT_DATE
      THEN 'overdue'::public.invoice_status
    ELSE 'issued'::public.invoice_status
  END;

  PERFORM set_config(
    'app.invoice_payment_sync',
    'on',
    true
  );

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
      'totalPaid', remaining_paid,
      'balance', new_balance
    )
  );

  RETURN payment_record.id;
END
$function$;

REVOKE ALL ON public.invoice_payments FROM contractor_api;
GRANT SELECT ON public.invoice_payments TO contractor_api;

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
  numeric
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION private.enforce_invoice_payment_mutation()
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.record_invoice_payment(
  uuid,
  uuid,
  numeric,
  public.invoice_payment_method,
  timestamptz,
  text,
  text
)
FROM PUBLIC;

REVOKE EXECUTE
ON FUNCTION public.reverse_invoice_payment(
  uuid,
  uuid,
  uuid,
  text
)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.record_invoice_payment(
  uuid,
  uuid,
  numeric,
  public.invoice_payment_method,
  timestamptz,
  text,
  text
)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.reverse_invoice_payment(
  uuid,
  uuid,
  uuid,
  text
)
TO contractor_api;

COMMENT ON TABLE public.invoice_payments IS
  'Pagos auditables de facturas. Se revierten, nunca se editan ni eliminan.';

COMMENT ON COLUMN public.invoice_payments.receipt_snapshot_data IS
  'Snapshot inmutable usado para generar el recibo del pago.';

RESET ROLE;

COMMIT;
