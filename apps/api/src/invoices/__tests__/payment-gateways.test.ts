import { describe, expect, it, vi } from "vitest";
import { processPaymentWebhookService } from "../payment-gateway-service.js";
import { pool } from "../../db/pool.js";
import * as invoiceServices from "../services.js";

describe("Payment Gateways Integration (Yappy & PagueloFacil)", () => {
  it("procesa webhooks exitosos de Yappy y genera el recibo correspondiente", async () => {
    vi.spyOn(pool, "query").mockImplementation(async (queryText: string) => {
      if (queryText.includes("FROM public.online_payment_checkouts")) {
        return {
          rows: [
            {
              id: "chk-123",
              company_id: "comp-123",
              invoice_id: "inv-123",
              amount: "150.00",
              status: "pending",
              created_by: "usr-123"
            }
          ]
        } as any;
      }
      return { rows: [] } as any;
    });

    vi.spyOn(invoiceServices, "recordInvoicePaymentService").mockResolvedValueOnce({
      id: "pay-789",
      number: "REC-2026-01",
      company_id: "comp-123",
      invoice_id: "inv-123",
      amount: "150.00",
      payment_method: "yappy",
      payment_date: "2026-01-01T00:00:00Z",
      reference: "Ref Online TX-YAPPY-1",
      notes: "Pago recibido mediante YAPPY",
      status: "confirmed",
      created_by: "usr-123",
      created_at: "2026-01-01T00:00:00Z"
    } as any);

    const result = await processPaymentWebhookService("yappy", {
      reference: "YAPPY-12345",
      status: "completed",
      transactionId: "TX-YAPPY-1"
    });

    expect(result.success).toBe(true);
    expect(result.paymentId).toBe("pay-789");

    vi.restoreAllMocks();
  });

  it("actualiza a fallido cuando la pasarela retorna transacción rechazada", async () => {
    vi.spyOn(pool, "query").mockImplementation(async (queryText: string) => {
      if (queryText.includes("FROM public.online_payment_checkouts")) {
        return {
          rows: [
            {
              id: "chk-456",
              company_id: "comp-123",
              invoice_id: "inv-123",
              amount: "50.00",
              status: "pending",
              created_by: "usr-123"
            }
          ]
        } as any;
      }
      return { rows: [] } as any;
    });

    const result = await processPaymentWebhookService("paguelofacil", {
      reference: "PAGUELOFACIL-999",
      status: "failed"
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("fallido");

    vi.restoreAllMocks();
  });
});
