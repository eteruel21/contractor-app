import {
  authenticatedRequest
} from "@/services/api";
import type {
  Invoice,
  InvoiceCreditNote,
  InvoiceManualStatus,
  InvoicePayment,
  InvoicePaymentMethod,
  InvoiceWithDetails
} from "@/types/invoice";

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listInvoices(
  companyId: string
): Promise<{
  invoices: InvoiceWithDetails[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        invoices:
          InvoiceWithDetails[];
      }>(
        `/invoices?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      invoices:
        response.invoices,
      error: null
    };
  } catch (error) {
    return {
      invoices: [],
      error: errorMessage(error)
    };
  }
}

export async function getInvoiceById(
  companyId: string,
  invoiceId: string
): Promise<{
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        invoice:
          InvoiceWithDetails;
      }>(
        `/invoices/${invoiceId}?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      invoice:
        response.invoice,
      error: null
    };
  } catch (error) {
    return {
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function getInvoiceByBudgetId(
  companyId: string,
  budgetId: string
): Promise<{
  invoice: Invoice | null;
  error: string | null;
}> {
  try {
    const query =
      new URLSearchParams({
        companyId,
        budgetId
      }).toString();

    const response =
      await authenticatedRequest<{
        invoice: Invoice | null;
      }>(
        `/invoices/by-budget?${query}`
      );

    return {
      invoice:
        response.invoice,
      error: null
    };
  } catch (error) {
    return {
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function createInvoiceFromBudget(
  input: {
    companyId: string;
    budgetId: string;
    clientId: string;
    dueDate?: string | null;
    notes?: string | null;
  }
): Promise<{
  invoice: Invoice | null;
  error: string | null;
}> {
  try {
    const existing =
      await getInvoiceByBudgetId(
        input.companyId,
        input.budgetId
      );

    if (existing.error) {
      return {
        invoice: null,
        error: existing.error
      };
    }

    if (existing.invoice) {
      return {
        invoice: null,
        error:
          "Ya existe una factura para este presupuesto."
      };
    }

    const draftResponse =
      await authenticatedRequest<{
        invoice: Invoice;
      }>(
        "/invoices",
        {
          method: "POST",
          body: JSON.stringify({
            companyId:
              input.companyId,
            budgetId:
              input.budgetId,
            clientId:
              input.clientId,
            dueDate:
              input.dueDate ?? null,
            notes:
              input.notes?.trim() ||
              null
          })
        }
      );

    const issueResponse =
      await authenticatedRequest<{
        invoice: Invoice;
      }>(
        `/invoices/${draftResponse.invoice.id}/issue`,
        {
          method: "POST",
          body: JSON.stringify({
            companyId: input.companyId
          })
        }
      );

    return {
      invoice:
        issueResponse.invoice,
      error: null
    };
  } catch (error) {
    return {
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function updateInvoiceStatus(
  input: {
    companyId: string;
    invoiceId: string;
    status: InvoiceManualStatus;
    reason?: string | null;
  }
): Promise<{
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        invoice: InvoiceWithDetails;
      }>(
      `/invoices/${input.invoiceId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          status:
            input.status,
          reason:
            input.reason?.trim() ||
            null
        })
      }
    );

    return {
      invoice: response.invoice,
      error: null
    };
  } catch (error) {
    return {
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function issueInvoice(
  companyId: string,
  invoiceId: string
): Promise<{
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        invoice: InvoiceWithDetails;
      }>(
        `/invoices/${invoiceId}/issue`,
        {
          method: "POST",
          body: JSON.stringify({ companyId })
        }
      );

    return {
      invoice: response.invoice,
      error: null
    };
  } catch (error) {
    return {
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function listInvoicePayments(
  companyId: string,
  invoiceId: string
): Promise<{
  payments: InvoicePayment[];
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      payments: InvoicePayment[];
    }>(
      `/invoices/${invoiceId}/payments?companyId=${encodeURIComponent(companyId)}`
    );

    return {
      payments: response.payments,
      error: null
    };
  } catch (error) {
    return {
      payments: [],
      error: errorMessage(error)
    };
  }
}

export async function recordInvoicePayment(
  input: {
    companyId: string;
    invoiceId: string;
    amount: number;
    method: InvoicePaymentMethod;
    reference?: string | null;
    notes?: string | null;
  }
): Promise<{
  payment: InvoicePayment | null;
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      payment: InvoicePayment;
      invoice: InvoiceWithDetails;
    }>(
      `/invoices/${input.invoiceId}/payments`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId: input.companyId,
          amount: input.amount,
          method: input.method,
          reference: input.reference?.trim() || null,
          notes: input.notes?.trim() || null
        })
      }
    );

    return {
      payment: response.payment,
      invoice: response.invoice,
      error: null
    };
  } catch (error) {
    return {
      payment: null,
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function reverseInvoicePayment(
  input: {
    companyId: string;
    invoiceId: string;
    paymentId: string;
    reason: string;
  }
): Promise<{
  payment: InvoicePayment | null;
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      payment: InvoicePayment;
      invoice: InvoiceWithDetails;
    }>(
      `/invoices/${input.invoiceId}/payments/${input.paymentId}/reverse`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId: input.companyId,
          reason: input.reason.trim()
        })
      }
    );

    return {
      payment: response.payment,
      invoice: response.invoice,
      error: null
    };
  } catch (error) {
    return {
      payment: null,
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function cancelInvoice(
  input: {
    companyId: string;
    invoiceId: string;
    reason: string;
  }
): Promise<{
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      invoice: InvoiceWithDetails;
    }>(
      `/invoices/${input.invoiceId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId: input.companyId,
          reason: input.reason.trim()
        })
      }
    );

    return { invoice: response.invoice, error: null };
  } catch (error) {
    return { invoice: null, error: errorMessage(error) };
  }
}

export async function listInvoiceCreditNotes(
  companyId: string,
  invoiceId: string
): Promise<{
  creditNotes: InvoiceCreditNote[];
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      creditNotes: InvoiceCreditNote[];
    }>(
      `/invoices/${invoiceId}/credit-notes?companyId=${encodeURIComponent(companyId)}`
    );

    return { creditNotes: response.creditNotes, error: null };
  } catch (error) {
    return { creditNotes: [], error: errorMessage(error) };
  }
}

export async function issueInvoiceCreditNote(
  input: {
    companyId: string;
    invoiceId: string;
    amount: number;
    reason: string;
  }
): Promise<{
  creditNote: InvoiceCreditNote | null;
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      creditNote: InvoiceCreditNote;
      invoice: InvoiceWithDetails;
    }>(
      `/invoices/${input.invoiceId}/credit-notes`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId: input.companyId,
          amount: input.amount,
          reason: input.reason.trim()
        })
      }
    );

    return {
      creditNote: response.creditNote,
      invoice: response.invoice,
      error: null
    };
  } catch (error) {
    return {
      creditNote: null,
      invoice: null,
      error: errorMessage(error)
    };
  }
}

export async function cancelInvoiceCreditNote(
  input: {
    companyId: string;
    invoiceId: string;
    creditNoteId: string;
    reason: string;
  }
): Promise<{
  creditNote: InvoiceCreditNote | null;
  invoice: InvoiceWithDetails | null;
  error: string | null;
}> {
  try {
    const response = await authenticatedRequest<{
      creditNote: InvoiceCreditNote;
      invoice: InvoiceWithDetails;
    }>(
      `/invoices/${input.invoiceId}/credit-notes/${input.creditNoteId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId: input.companyId,
          reason: input.reason.trim()
        })
      }
    );

    return {
      creditNote: response.creditNote,
      invoice: response.invoice,
      error: null
    };
  } catch (error) {
    return {
      creditNote: null,
      invoice: null,
      error: errorMessage(error)
    };
  }
}
