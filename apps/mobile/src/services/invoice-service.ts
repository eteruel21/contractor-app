import {
  authenticatedRequest
} from "@/services/api";
import type {
  Invoice,
  InvoiceStatus,
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

    const response =
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

export async function updateInvoiceStatus(
  input: {
    companyId: string;
    invoiceId: string;
    status: InvoiceStatus;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/invoices/${input.invoiceId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          status:
            input.status
        })
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}