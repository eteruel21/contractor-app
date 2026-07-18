BEGIN;

SET ROLE contractor_owner;

-- La función ya forma parte del esquema comercial, pero el volcado heredado sólo
-- la definía y nunca la ejecutaba. Una instalación limpia quedaba sin perfil al
-- registrar usuarios mediante app_auth.users.
SELECT public.create_new_user_trigger();

DO $verify_user_profile_trigger$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger trigger_record
    JOIN pg_catalog.pg_class table_record
      ON table_record.oid = trigger_record.tgrelid
    JOIN pg_catalog.pg_namespace schema_record
      ON schema_record.oid = table_record.relnamespace
    WHERE trigger_record.tgname = 'on_auth_user_created'
      AND NOT trigger_record.tgisinternal
      AND schema_record.nspname = 'app_auth'
      AND table_record.relname = 'users'
  ) THEN
    RAISE EXCEPTION 'No se pudo instalar on_auth_user_created en app_auth.users.';
  END IF;
END
$verify_user_profile_trigger$;

RESET ROLE;

COMMIT;
