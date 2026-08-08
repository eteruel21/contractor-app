BEGIN;

SET ROLE contractor_owner;

ALTER FUNCTION public.create_company(text, text, text)
SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.create_company(text, text, text)
FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_company(text, text, text)
TO contractor_api;

COMMIT;