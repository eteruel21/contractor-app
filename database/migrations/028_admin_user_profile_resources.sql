BEGIN;

SET ROLE contractor_owner;

-- La vista de perfil filtra fotos por creador y las ordena por fecha.
CREATE INDEX IF NOT EXISTS idx_project_photos_created_by_created_at
ON public.project_photos (created_by, created_at DESC)
WHERE created_by IS NOT NULL;

-- La política existente conserva el acceso normal por membresía de empresa.
-- Esta política permisiva adicional sólo habilita lectura global al
-- superadministrador activo; las escrituras no se amplían.
DROP POLICY IF EXISTS project_photos_super_admin_select
ON public.project_photos;

CREATE POLICY project_photos_super_admin_select
ON public.project_photos
FOR SELECT
TO contractor_api
USING ((SELECT private.is_super_admin()));

RESET ROLE;

COMMIT;
