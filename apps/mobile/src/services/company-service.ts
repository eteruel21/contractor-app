import { supabase } from "@/services/supabase";

export async function updateCompanyBillingDetails(input: {
  companyId: string;
  legalName: string | null;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logoUrl: string | null;
  invoicePrefix: string;
  taxRate: number;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("companies")
    .update({
      legal_name: input.legalName?.trim() || null,
      tax_id: input.taxId?.trim() || null,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
      logo_url: input.logoUrl?.trim() || null,
      invoice_prefix: input.invoicePrefix?.trim() || "FAC",
      tax_rate: Number(input.taxRate ?? 0),
    })
    .eq("id", input.companyId);

  return { error: error?.message ?? null };
}
