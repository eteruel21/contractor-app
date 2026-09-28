import { afterEach, describe, expect, it, vi } from "vitest";

import {
  notifyBudgetDecision,
  notifyInvoiceIssued,
  notifyInvoicePaymentRegistered
} from "../event-service.js";
import * as pushService from "../push-service.js";

describe("notificaciones push de eventos de negocio", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("notifica al creador cuando el cliente aprueba o rechaza un presupuesto", async () => {
    const sendSpy = vi
      .spyOn(pushService, "sendPushNotificationToUser")
      .mockResolvedValue({ sent: 1, failed: 0 });
    const budget = {
      id: "budget-104",
      company_id: "company-1",
      created_by: "contractor-1",
      budget_number: "PRE-104"
    };

    await notifyBudgetDecision(budget, "approved");
    await notifyBudgetDecision(budget, "rejected");

    expect(sendSpy).toHaveBeenNthCalledWith(
      1,
      "contractor-1",
      expect.objectContaining({
        title: "Presupuesto aprobado",
        data: expect.objectContaining({
          type: "budget.approved",
          budgetId: "budget-104"
        })
      })
    );
    expect(sendSpy).toHaveBeenNthCalledWith(
      2,
      "contractor-1",
      expect.objectContaining({
        title: "Presupuesto rechazado",
        data: expect.objectContaining({ type: "budget.rejected" })
      })
    );
  });

  it("notifica al usuario cliente al emitir una factura y registrar un pago", async () => {
    const sendSpy = vi
      .spyOn(pushService, "sendPushNotificationToUser")
      .mockResolvedValue({ sent: 1, failed: 0 });
    const invoice = {
      id: "invoice-22",
      company_id: "company-1",
      invoice_number: "FAC-22",
      client: { user_id: "client-1" }
    };

    await notifyInvoiceIssued(invoice);
    await notifyInvoicePaymentRegistered(invoice, { id: "payment-7" });

    expect(sendSpy).toHaveBeenNthCalledWith(
      1,
      "client-1",
      expect.objectContaining({
        title: "Factura emitida",
        data: expect.objectContaining({
          type: "invoice.issued",
          invoiceId: "invoice-22"
        })
      })
    );
    expect(sendSpy).toHaveBeenNthCalledWith(
      2,
      "client-1",
      expect.objectContaining({
        title: "Pago registrado",
        data: expect.objectContaining({
          type: "invoice.payment_registered",
          paymentId: "payment-7"
        })
      })
    );
  });

  it("omite clientes sin cuenta vinculada", async () => {
    const sendSpy = vi
      .spyOn(pushService, "sendPushNotificationToUser")
      .mockResolvedValue({ sent: 0, failed: 0 });

    await notifyInvoiceIssued({
      id: "invoice-22",
      client: { user_id: null }
    });

    expect(sendSpy).not.toHaveBeenCalled();
  });

  it("absorbe un fallo inesperado del emisor para no romper la operación principal", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(pushService, "sendPushNotificationToUser")
      .mockRejectedValue(new Error("Expo unavailable"));

    await expect(notifyInvoiceIssued({
      id: "invoice-22",
      client: { user_id: "client-1" }
    })).resolves.toBeUndefined();
  });
});
