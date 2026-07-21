import {
  findInvoicesRepo,
  findInvoiceByBudgetRepo,
  getInvoiceByIdRepo,
  createInvoiceRepo,
  updateInvoiceStatusRepo,
  type CreateInvoiceInput
} from "./repository.js";

export async function getInvoicesService(userId: string, companyId: string) {
  return findInvoicesRepo(userId, companyId);
}

export async function getInvoiceByBudgetService(userId: string, companyId: string, budgetId: string) {
  return findInvoiceByBudgetRepo(userId, companyId, budgetId);
}

export async function getInvoiceByIdService(userId: string, invoiceId: string, companyId: string) {
  return getInvoiceByIdRepo(userId, invoiceId, companyId);
}

export async function createInvoiceService(userId: string, input: CreateInvoiceInput) {
  return createInvoiceRepo(userId, input);
}

export async function updateInvoiceStatusService(userId: string, invoiceId: string, companyId: string, status: string) {
  return updateInvoiceStatusRepo(userId, invoiceId, companyId, status);
}
