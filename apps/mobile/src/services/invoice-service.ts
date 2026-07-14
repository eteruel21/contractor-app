import { supabase } from "@/services/supabase";
import type { Invoice, InvoiceWithDetails, InvoiceStatus } from "@/types/invoice";
import { getBudgetById } from "@/services/budget-service";

export async function listInvoices(companyId: string): Promise<{
  invoices: InvoiceWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      client:clients (*),
      budget:budgets (*)
    `)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    return { invoices: [], error: error.message };
  }

  return {
    invoices: (data ?? []) as InvoiceWithDetails[],
    error: null,
  };
}

export async function getInvoiceById(
  companyId: string,
  invoiceId: string,
): Promise<{
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select(`
      *,
      client:clients (*)
    `)
    .eq("company_id", companyId)
    .eq("id", invoiceId)
    .single();

  if (invoiceError) {
    return { invoice: null, error: invoiceError.message };
  }

  const invoice = invoiceData as InvoiceWithDetails;

  if (invoice.budget_id) {
    const { budget, error: budgetError } = await getBudgetById(
      companyId,
      invoice.budget_id,
    );
    if (!budgetError) {
      invoice.budget = budget;
    }
  }

  return { invoice, error: null };
}

export async function getInvoiceByBudgetId(
  companyId: string,
  budgetId: string,
): Promise<{
  invoice: Invoice | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("company_id", companyId)
    .eq("budget_id", budgetId)
    .maybeSingle();

  if (error) {
    return { invoice: null, error: error.message };
  }

  return { invoice: data as Invoice | null, error: null };
}

export async function createInvoiceFromBudget(input: {
  companyId: string;
  budgetId: string;
  clientId: string;
}): Promise<{
  invoice: Invoice | null;
  error: string | null;
}> {
  // 1. Obtener datos de la empresa para conseguir el prefijo
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("invoice_prefix")
    .eq("id", input.companyId)
    .single();

  if (companyError) {
    return { invoice: null, error: companyError.message };
  }

  const prefix = company?.invoice_prefix?.trim() || "FAC";

  // 2. Obtener el número de facturas existentes para generar el correlativo
  const { count, error: countError } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("company_id", input.companyId);

  if (countError) {
    return { invoice: null, error: countError.message };
  }

  const nextNumber = (count ?? 0) + 1;
  const invoiceNumber = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

  // 3. Crear el registro de la factura
  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      company_id: input.companyId,
      budget_id: input.budgetId,
      client_id: input.clientId,
      invoice_number: invoiceNumber,
      status: "pending" as InvoiceStatus,
    })
    .select()
    .single();

  if (insertError) {
    return { invoice: null, error: insertError.message };
  }

  return { invoice: invoice as Invoice, error: null };
}

export async function updateInvoiceStatus(input: {
  companyId: string;
  invoiceId: string;
  status: InvoiceStatus;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("invoices")
    .update({ status: input.status })
    .eq("company_id", input.companyId)
    .eq("id", input.invoiceId);

  return { error: error?.message ?? null };
}
