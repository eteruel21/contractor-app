BEGIN;

SET ROLE contractor_owner;

-- Acceso a los esquemas utilizados por la API y las políticas RLS.
GRANT USAGE
ON SCHEMA public, private, app
TO contractor_api;

-- Las operaciones quedan limitadas posteriormente por RLS.
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO contractor_api;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO contractor_api;

-- Función que identifica al usuario de la petición.
GRANT EXECUTE
ON FUNCTION app.current_user_id()
TO contractor_api;

-- Funciones utilizadas dentro de políticas RLS.
GRANT EXECUTE
ON FUNCTION private.is_active_platform_user()
TO contractor_api;

GRANT EXECUTE
ON FUNCTION private.is_super_admin()
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.is_admin()
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.is_company_member(uuid)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.is_company_admin(uuid)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.is_company_owner(uuid)
TO contractor_api;

-- Permisos automáticos para futuras tablas creadas por contractor_owner.
ALTER DEFAULT PRIVILEGES
FOR ROLE contractor_owner
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES
TO contractor_api;

ALTER DEFAULT PRIVILEGES
FOR ROLE contractor_owner
IN SCHEMA public
GRANT USAGE, SELECT
ON SEQUENCES
TO contractor_api;

RESET ROLE;

COMMIT;