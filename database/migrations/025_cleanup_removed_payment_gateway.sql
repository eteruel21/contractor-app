BEGIN;

SET ROLE contractor_owner;

-- La integración preliminar de pasarelas fue retirada antes de producción.
-- Algunas bases donde 024 llegó a ejecutarse pueden conservar esta tabla.
-- En instalaciones limpias este DROP es simplemente un no-op.
DROP TABLE IF EXISTS public.online_payment_checkouts;

-- Esta función solo instala el trigger de perfil durante las migraciones.
-- Fijar search_path elimina la advertencia de seguridad de Supabase
-- y evita depender del search_path de la sesión.
ALTER FUNCTION public.create_new_user_trigger()
  SET search_path = '';

RESET ROLE;

COMMIT;