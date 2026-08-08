import { withUserTransaction } from "../db/with-user-transaction.js";
import { pool } from "../db/pool.js";
import { recordInvoicePaymentService } from "./services.js";
import { sendPushNotificationToUser } from "../notifications/push-service.js";

export type OnlineProvider = "yappy" | "paguelofacil";

export type OnlineCheckoutResult = {
  checkoutId: string;
  provider: OnlineProvider;
  amount: number;
  status: string;
  gatewayReference: string;
  checkoutUrl: string;
};

/**
 * Crea una sesión de cobro digital para Yappy o PagueloFacil.
 */
export async function createOnlineCheckoutSessionService(
  userId: string,
  companyId: string,
  invoiceId: string,
  provider: OnlineProvider,
  amount: number
): Promise<OnlineCheckoutResult | null> {
  return withUserTransaction(userId, async (client) => {
    const invResult = await client.query<{
      id: string;
      total: string | number;
      amount_paid: string | number;
      status: string;
      client_id: string;
    }>(
      `
        SELECT id, status, client_id
        FROM public.invoices
        WHERE id = $1 AND company_id = $2
      `,
      [invoiceId, companyId]
    );

    const invoice = invResult.rows[0];
    if (!invoice) return null;

    if (invoice.status === "cancelled" || invoice.status === "paid") {
      throw new Error("No es posible generar cobro para una factura pagada o cancelada.");
    }

    const totalNum = Number(invoice.total);
    const paidNum = Number(invoice.amount_paid);
    const remainingBalance = Math.round((totalNum - paidNum) * 100) / 100;

    if (amount > remainingBalance + 0.001) {
      throw new Error(`El monto del cobro ($${amount.toFixed(2)}) supera el saldo pendiente ($${remainingBalance.toFixed(2)}).`);
    }

    const reference = `${provider.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let checkoutUrl = "";
    if (provider === "yappy") {
      checkoutUrl = `https://pagos.yappy.com.pa/checkout?ref=${reference}&amount=${amount.toFixed(2)}`;
    } else {
      checkoutUrl = `https://checkout.paguelofacil.com/pay?ref=${reference}&amount=${amount.toFixed(2)}`;
    }

    const insertResult = await client.query<{
      id: string;
      gateway_reference: string;
      checkout_url: string;
      status: string;
    }>(
      `
        INSERT INTO public.online_payment_checkouts (
          company_id, invoice_id, payment_provider, amount, status,
          gateway_reference, checkout_url, created_by
        )
        VALUES ($1, $2, $3, $4, 'pending', $5, $6, app.current_user_id())
        RETURNING id, gateway_reference, checkout_url, status
      `,
      [companyId, invoiceId, provider, amount, reference, checkoutUrl]
    );

    const row = insertResult.rows[0];
    if (!row) {
      throw new Error("No se pudo generar la sesión de cobro.");
    }

    return {
      checkoutId: row.id,
      provider,
      amount,
      status: row.status,
      gatewayReference: row.gateway_reference,
      checkoutUrl: row.checkout_url
    };
  });
}

/**
 * Consulta el estado de una sesión de cobro digital.
 */
export async function getOnlineCheckoutStatusService(
  userId: string,
  companyId: string,
  invoiceId: string,
  checkoutId: string
) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query<{
      id: string;
      company_id: string;
      invoice_id: string;
      payment_provider: string;
      amount: string | number;
      status: string;
      gateway_reference: string;
      checkout_url: string;
      payment_id: string | null;
      created_at: string;
    }>(
      `
        SELECT id, company_id, invoice_id, payment_provider, amount, status, gateway_reference, checkout_url, payment_id, created_at
        FROM public.online_payment_checkouts
        WHERE id = $1 AND company_id = $2 AND invoice_id = $3
      `,
      [checkoutId, companyId, invoiceId]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      companyId: row.company_id,
      invoiceId: row.invoice_id,
      provider: row.payment_provider,
      amount: Number(row.amount),
      status: row.status,
      gatewayReference: row.gateway_reference,
      checkoutUrl: row.checkout_url,
      paymentId: row.payment_id,
      createdAt: row.created_at
    };
  });
}

/**
 * Procesa webhooks de confirmación automática de Yappy o PagueloFacil.
 */
export async function processPaymentWebhookService(
  provider: OnlineProvider,
  payload: {
    reference: string;
    status: "completed" | "failed";
    transactionId?: string;
  }
) {
  const checkoutResult = await pool.query<{
    id: string;
    company_id: string;
    invoice_id: string;
    amount: string | number;
    status: string;
    created_by: string;
  }>(
    `
      SELECT id, company_id, invoice_id, amount, status, created_by
      FROM public.online_payment_checkouts
      WHERE gateway_reference = $1 AND payment_provider = $2
    `,
    [payload.reference, provider]
  );

  const checkout = checkoutResult.rows[0];
  if (!checkout) {
    return { success: false, error: "Sesión de cobro no encontrada." };
  }

  if (checkout.status === "completed") {
    return { success: true, message: "Pago procesado previamente." };
  }

  if (payload.status === "failed") {
    await pool.query(
      `UPDATE public.online_payment_checkouts SET status = 'failed', updated_at = now() WHERE id = $1`,
      [checkout.id]
    );
    return { success: false, message: "Pago marcado como fallido." };
  }

  const amountNum = Number(checkout.amount);

  // Registrar el abono oficialmente en la factura
  const paymentRecord = await recordInvoicePaymentService(
    checkout.created_by,
    checkout.invoice_id,
    {
      companyId: checkout.company_id,
      amount: amountNum,
      method: provider as "yappy" | "paguelofacil",
      paidAt: new Date().toISOString(),
      reference: `Ref Online ${payload.transactionId ?? payload.reference}`,
      notes: `Pago recibido mediante ${provider.toUpperCase()}`
    }
  );

  if (!paymentRecord?.payment) {
    return { success: false, error: "No se pudo registrar el pago de la factura." };
  }

  await pool.query(
    `
      UPDATE public.online_payment_checkouts
      SET status = 'completed', payment_id = $1, updated_at = now()
      WHERE id = $2
    `,
    [paymentRecord.payment.id, checkout.id]
  );

  // Despachar notificación push al usuario
  await sendPushNotificationToUser(checkout.created_by, {
    title: `Pago Recibido (${provider.toUpperCase()})`,
    body: `Se ha acreditado un abono por $${amountNum.toFixed(2)} en tu factura.`
  }).catch(() => null);

  return { success: true, paymentId: paymentRecord.payment.id };
}
