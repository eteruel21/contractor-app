BEGIN;

SET ROLE contractor_owner;

DO $grant_functions$
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
        'create_company',
        'set_primary_client_address'
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
$grant_functions$;

RESET ROLE;

COMMIT;