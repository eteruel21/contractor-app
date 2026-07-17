import { supabase } from "@/services/supabase";
import type { Invoice, InvoiceWithDetails, InvoiceStatus } from "@/types/invoice";

export async function listInvoices(companyId: string): Promise<{
  invoices: InvoiceWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      client:clients (
        id,
        company_id,
        client_type,
        first_name,
        last_name,
        business_name,
        document_type,
        document_number,
        email,
        phone,
        secondary_phone,
        notes,
        active,
        created_by,
        created_at,
        updated_at
      ),
      budget:budgets (id, title, status, total_amount)
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
      client:clients (
        id,
        company_id,
        client_type,
        first_name,
        last_name,
        business_name,
        document_type,
        document_number,
        email,
        phone,
        secondary_phone,
        notes,
        active,
        created_by,
        created_at,
        updated_at
      ),
      budget:budgets (
        id,
        title,
        status,
        total_amount,
        project_id,
        client_id,
        company_id,
        created_at,
        updated_at
      )
    `)
    .eq("company_id", companyId)
    .eq("id", invoiceId)
    .single();

  if (invoiceError) {
    return { invoice: null, error: invoiceError.message };
  }

  return {
    invoice: invoiceData as unknown as InvoiceWithDetails,
    error: null,
  };
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

/**
 * Crea una factura usando la función SQL `create_invoice` que genera el número
 * de factura de forma atómica (sin race condition). Antes se generaba el número
 * en el cliente con count() + insert en dos pasos, lo que producía colisiones
 * cuando dos usuarios creaban facturas al mismo tiempo.
 */
export async function createInvoiceFromBudget(input: {
  companyId: string;
  budgetId: string;
  clientId: string;
  dueDate?: string | null;
  notes?: string | null;
}): Promise<{
  invoice: Invoice | null;
  error: string | null;
}> {
  // Verificar primero que no exista ya una factura para este presupuesto
  const { invoice: existing, error: checkError } = await getInvoiceByBudgetId(
    input.companyId,
    input.budgetId,
  );

  if (checkError) {
    return { invoice: null, error: checkError };
  }

  if (existing) {
    return {
      invoice: null,
      error: "Ya existe una factura para este presupuesto.",
    };
  }

  // Usar RPC atómico para generar el número y crear el registro en una sola
  // transacción — elimina la race condition del patrón count() + insert anterior
  const { data, error } = await supabase.rpc("create_invoice", {
    requested_company_id: input.companyId,
    requested_client_id: input.clientId,
    requested_budget_id: input.budgetId,
    requested_due_date: input.dueDate ?? null,
    requested_notes: input.notes?.trim() ?? null,
  });

  if (error) {
    return { invoice: null, error: error.message };
  }

  const invoiceId = typeof data === "string" ? data : null;

  if (!invoiceId) {
    return { invoice: null, error: "No se pudo crear la factura." };
  }

  // Recuperar el registro creado
  const { data: invoiceData, error: fetchError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (fetchError) {
    return { invoice: null, error: fetchError.message };
  }

  return { invoice: invoiceData as Invoice, error: null };
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
