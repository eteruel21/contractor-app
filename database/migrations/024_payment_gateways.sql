BEGIN;

SET ROLE contractor_owner;

SET search_path = public, app_commercial, app_auth;

-- Migration 024: Digital Payment Gateways Integration (Yappy & PagueloFacil)

CREATE TABLE IF NOT EXISTS public.online_payment_checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_provider TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
    gateway_reference TEXT,
    checkout_url TEXT,
    payment_id UUID REFERENCES public.invoice_payments(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES app_auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_online_checkouts_company_invoice ON public.online_payment_checkouts(company_id, invoice_id);
CREATE INDEX IF NOT EXISTS idx_online_checkouts_gateway_ref ON public.online_payment_checkouts(gateway_reference);

ALTER TABLE public.online_payment_checkouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS online_payment_checkouts_company_member_policy ON public.online_payment_checkouts;
CREATE POLICY online_payment_checkouts_company_member_policy ON public.online_payment_checkouts
    FOR ALL
    TO authenticated
    USING (public.is_company_member(company_id))
    WITH CHECK (public.is_company_member(company_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.online_payment_checkouts TO contractor_api;

RESET ROLE;

COMMIT;
