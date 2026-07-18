BEGIN;

SET ROLE contractor_owner;

DO $cleanup$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT
      namespace.nspname AS schema_name,
      procedure.proname AS function_name,
      pg_get_function_identity_arguments(procedure.oid) AS arguments
    FROM pg_proc AS procedure
    JOIN pg_namespace AS namespace
      ON namespace.oid = procedure.pronamespace
    WHERE namespace.nspname = 'public'
      AND procedure.proname = 'update_own_profile'
  LOOP
    EXECUTE format(
      'DROP FUNCTION IF EXISTS %I.%I(%s)',
      function_record.schema_name,
      function_record.function_name,
      function_record.arguments
    );
  END LOOP;
END
$cleanup$;

RESET ROLE;

COMMIT;
