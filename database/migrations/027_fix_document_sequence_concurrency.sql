BEGIN;

SET ROLE contractor_owner;

-- La fila de una secuencia puede no existir durante la primera solicitud.
-- SELECT ... FOR UPDATE no bloquea ese hueco, por lo que dos solicitudes
-- simultáneas podían intentar insertar la misma clave y una fallaba con 23505.
-- El UPSERT usa el índice único para serializar creación e incremento.
CREATE OR REPLACE FUNCTION public.next_document_number(
  requested_company_id uuid,
  requested_document_type public.document_type
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  sequence_record record;
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

  INSERT INTO public.document_sequences AS sequence (
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
    1,
    6,
    false,
    current_year
  )
  ON CONFLICT ON CONSTRAINT document_sequences_unique
  DO UPDATE SET
    current_number = CASE
      WHEN sequence.yearly_reset = true
       AND COALESCE(sequence.last_reset_year, current_year) <> current_year
        THEN 1
      ELSE sequence.current_number + 1
    END,
    last_reset_year = current_year,
    updated_at = now()
  RETURNING * INTO sequence_record;

  RETURN sequence_record.prefix
    || '-'
    || lpad(
      sequence_record.current_number::text,
      sequence_record.padding,
      '0'
    );
END
$function$;

REVOKE EXECUTE
ON FUNCTION public.next_document_number(uuid, public.document_type)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.next_document_number(uuid, public.document_type)
TO contractor_api;

COMMIT;
