import {
  cancelInvoiceCreditNoteRepo,
  cancelInvoiceRepo,
  createInvoiceRepo,
  findInvoiceByBudgetRepo,
  findInvoiceCreditNotesRepo,
  findInvoiceHistoryRepo,
  findInvoicePaymentsRepo,
  findInvoicesRepo,
  getInvoiceByIdRepo,
  issueInvoiceCreditNoteRepo,
  issueInvoiceRepo,
  recordInvoicePaymentRepo,
  reverseInvoicePaymentRepo,
  transitionInvoiceStatusRepo,
  type CancelInvoiceCreditNoteInput,
  type CancelInvoiceInput,
  type CreateInvoiceCreditNoteInput,
  type CreateInvoiceInput,
  type CreateInvoicePaymentInput,
  type ReverseInvoicePaymentInput,
  type TransitionInvoiceStatusInput
} from "./repository.js";

export async function getInvoicesService(userId: string, companyId: string) {
  return findInvoicesRepo(userId, companyId);
}

export async function getInvoiceByBudgetService(
  userId: string,
  companyId: string,
  budgetId: string
) {
  return findInvoiceByBudgetRepo(userId, companyId, budgetId);
}

export async function getInvoiceByIdService(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return getInvoiceByIdRepo(userId, invoiceId, companyId);
}

export async function getInvoiceHistoryService(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return findInvoiceHistoryRepo(userId, invoiceId, companyId);
}

export async function getInvoicePaymentsService(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return findInvoicePaymentsRepo(userId, invoiceId, companyId);
}

export async function getInvoiceCreditNotesService(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return findInvoiceCreditNotesRepo(userId, invoiceId, companyId);
}

export async function createInvoiceService(
  userId: string,
  input: CreateInvoiceInput
) {
  return createInvoiceRepo(userId, input);
}

export async function issueInvoiceService(
  userId: string,
  invoiceId: string,
  companyId: string
) {
  return issueInvoiceRepo(userId, invoiceId, companyId);
}

export async function transitionInvoiceStatusService(
  userId: string,
  invoiceId: string,
  input: TransitionInvoiceStatusInput
) {
  return transitionInvoiceStatusRepo(userId, invoiceId, input);
}

export async function recordInvoicePaymentService(
  userId: string,
  invoiceId: string,
  input: CreateInvoicePaymentInput
) {
  return recordInvoicePaymentRepo(userId, invoiceId, input);
}

export async function reverseInvoicePaymentService(
  userId: string,
  invoiceId: string,
  paymentId: string,
  input: ReverseInvoicePaymentInput
) {
  return reverseInvoicePaymentRepo(userId, invoiceId, paymentId, input);
}

export async function cancelInvoiceService(
  userId: string,
  invoiceId: string,
  input: CancelInvoiceInput
) {
  return cancelInvoiceRepo(userId, invoiceId, input);
}

export async function issueInvoiceCreditNoteService(
  userId: string,
  invoiceId: string,
  input: CreateInvoiceCreditNoteInput
) {
  return issueInvoiceCreditNoteRepo(userId, invoiceId, input);
}

export async function cancelInvoiceCreditNoteService(
  userId: string,
  invoiceId: string,
  creditNoteId: string,
  input: CancelInvoiceCreditNoteInput
) {
  return cancelInvoiceCreditNoteRepo(
    userId,
    invoiceId,
    creditNoteId,
    input
  );
}
