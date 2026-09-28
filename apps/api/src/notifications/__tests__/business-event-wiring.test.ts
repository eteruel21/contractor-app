import { afterEach, describe, expect, it, vi } from "vitest";

import {
  approveBudgetService,
  rejectBudgetService
} from "../../budgets/services.js";
import * as budgetRepository from "../../budgets/repository.js";
import {
  issueInvoiceService,
  recordInvoicePaymentService
} from "../../invoices/services.js";
import * as invoiceRepository from "../../invoices/repository.js";
import * as eventService from "../event-service.js";

describe("conexión de push con eventos de negocio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("conecta aprobación y rechazo de presupuesto con el notificador", async () => {
    const approvedBudget = {
      id: "budget-approved",
      created_by: "contractor-1",
      status: "approved"
    };
    const rejectedBudget = {
      id: "budget-rejected",
      created_by: "contractor-1",
      status: "rejected"
    };
    vi.spyOn(budgetRepository, "approveBudgetRepo")
      .mockResolvedValueOnce(approvedBudget);
    vi.spyOn(budgetRepository, "rejectBudgetRepo")
      .mockResolvedValueOnce(rejectedBudget);
    const notifySpy = vi.spyOn(eventService, "notifyBudgetDecision")
      .mockResolvedValue(undefined);

    await expect(approveBudgetService(
      "client-1",
      "budget-approved",
      "company-1"
    )).resolves.toBe(approvedBudget);
    await expect(rejectBudgetService(
      "client-1",
      "budget-rejected",
      "Fuera de alcance",
      "company-1"
    )).resolves.toBe(rejectedBudget);

    expect(notifySpy).toHaveBeenNthCalledWith(
      1,
      approvedBudget,
      "approved"
    );
    expect(notifySpy).toHaveBeenNthCalledWith(
      2,
      rejectedBudget,
      "rejected"
    );
  });

  it("conecta emisión de factura y registro de pago con el notificador", async () => {
    const invoice = {
      id: "invoice-1",
      client: { user_id: "client-1" }
    };
    const payment = { id: "payment-1" };
    vi.spyOn(invoiceRepository, "issueInvoiceRepo")
      .mockResolvedValueOnce(invoice);
    vi.spyOn(invoiceRepository, "recordInvoicePaymentRepo")
      .mockResolvedValueOnce({ invoice, payment });
    const issuedSpy = vi.spyOn(eventService, "notifyInvoiceIssued")
      .mockResolvedValue(undefined);
    const paymentSpy = vi.spyOn(
      eventService,
      "notifyInvoicePaymentRegistered"
    ).mockResolvedValue(undefined);

    await expect(issueInvoiceService(
      "contractor-1",
      "invoice-1",
      "company-1"
    )).resolves.toBe(invoice);
    await expect(recordInvoicePaymentService(
      "contractor-1",
      "invoice-1",
      {
        companyId: "company-1",
        amount: 125,
        method: "cash"
      }
    )).resolves.toEqual({ invoice, payment });

    expect(issuedSpy).toHaveBeenCalledWith(invoice);
    expect(paymentSpy).toHaveBeenCalledWith(invoice, payment);
  });
});
