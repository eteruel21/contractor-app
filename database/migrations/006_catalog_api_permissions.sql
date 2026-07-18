BEGIN;

SET ROLE contractor_owner;

GRANT EXECUTE
ON FUNCTION public.set_personal_catalog_pricing(
  uuid,
  numeric,
  numeric,
  numeric
)
TO contractor_api;

GRANT EXECUTE
ON FUNCTION public.reset_personal_catalog_pricing(
  uuid
)
TO contractor_api;

RESET ROLE;

COMMIT;