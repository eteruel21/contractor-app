BEGIN;

-- La versión preliminar de 024 fue aplicada antes de adoptar
-- SET ROLE contractor_owner, por lo que esta tabla heredada
-- puede pertenecer a contractor_migrator.
--
-- El runner ejecuta esta instrucción inicialmente como
-- contractor_migrator, propietario esperado del objeto legado.
DROP TABLE IF EXISTS public.online_payment_checkouts;

SET ROLE contractor_owner;

-- Esta función solo instala el trigger de perfil durante las migraciones.
-- Fijar search_path elimina la advertencia de seguridad de Supabase
-- y evita depender del search_path de la sesión.
ALTER FUNCTION public.create_new_user_trigger()
  SET search_path = '';

RESET ROLE;

COMMIT;