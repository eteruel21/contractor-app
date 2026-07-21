import { Ionicons } from "@expo/vector-icons";
import { type Href, router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import {
  cancelInvoice,
  cancelInvoiceCreditNote,
  getInvoiceById,
  issueInvoiceCreditNote,
  issueInvoice,
  listInvoiceCreditNotes,
  listInvoicePayments,
  recordInvoicePayment,
  reverseInvoicePayment,
  updateInvoiceStatus
} from "@/services/invoice-service";
import type {
  InvoiceCreditNote,
  InvoiceManualStatus,
  InvoicePayment,
  InvoicePaymentMethod,
  InvoiceWithDetails
} from "@/types/invoice";
import {
  getInvoicePaymentMethodLabel,
  getInvoiceStatusLabel
} from "@/types/invoice";
import { formatMoney } from "@/types/budget";
import { formatShortDate } from "@/utils/format";
import { getClientDisplayName } from "@/types/client";
import { shareInvoicePdf } from "@/utils/invoice-pdf";
import { shareCreditNotePdf } from "@/utils/credit-note-pdf";
import { shareReceiptPdf } from "@/utils/receipt-pdf";

const paymentMethods: InvoicePaymentMethod[] = [
  "cash",
  "bank_transfer",
  "card",
  "check",
  "other"
];

export default function InvoiceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { activeCompany, activeMembership } = useCompany();

  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [creditNotes, setCreditNotes] = useState<InvoiceCreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const [sharingReceiptId, setSharingReceiptId] = useState<string | null>(null);
  const [sharingCreditNoteId, setSharingCreditNoteId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<InvoicePaymentMethod>("bank_transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [creditNoteModalVisible, setCreditNoteModalVisible] = useState(false);
  const [creditNoteAmount, setCreditNoteAmount] = useState("");
  const [creditNoteReason, setCreditNoteReason] = useState("");
  const [savingCreditNote, setSavingCreditNote] = useState(false);
  const [cancellationTarget, setCancellationTarget] = useState<
    { type: "invoice" } | { type: "creditNote"; creditNote: InvoiceCreditNote } | null
  >(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const loadInvoice = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany || !invoiceId) return;

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const [invoiceResult, paymentsResult, creditNotesResult] = await Promise.all([
        getInvoiceById(activeCompany.id, invoiceId),
        listInvoicePayments(activeCompany.id, invoiceId),
        listInvoiceCreditNotes(activeCompany.id, invoiceId)
      ]);

      if (invoiceResult.error) {
        Alert.alert("No fue posible cargar la factura", invoiceResult.error);
      } else {
        setInvoice(invoiceResult.invoice);
      }

      if (paymentsResult.error) {
        Alert.alert("No fue posible cargar los pagos", paymentsResult.error);
      } else {
        setPayments(paymentsResult.payments);
      }

      if (creditNotesResult.error) {
        Alert.alert(
          "No fue posible cargar las notas de crédito",
          creditNotesResult.error
        );
      } else {
        setCreditNotes(creditNotesResult.creditNotes);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany, invoiceId],
  );

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  const handleShareInvoice = async () => {
    if (!activeCompany || !invoice) return;

    if (invoice.status === "draft" || !invoice.snapshot_data) {
      Alert.alert(
        "Factura sin emitir",
        "Emite la factura antes de generar su PDF."
      );
      return;
    }

    try {
      setSharingPdf(true);
      const { error } = await shareInvoicePdf({
        invoice,
      });

      if (error) {
        Alert.alert("Error al compartir PDF", error);
      }
    } finally {
      setSharingPdf(false);
    }
  };

  const handleChangeStatus = (nextStatus: InvoiceManualStatus) => {
    if (!activeCompany || !invoice) return;

    const statusLabel = getInvoiceStatusLabel(nextStatus);

    Alert.alert(
      "Cambiar estado",
      `¿Deseas marcar la factura como "${statusLabel}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setUpdating(true);
              const { invoice: updatedInvoice, error } = await updateInvoiceStatus({
                companyId: activeCompany.id,
                invoiceId: invoice.id,
                status: nextStatus,
                reason: "Marcada como vencida desde la aplicación."
              });

              if (error) {
                Alert.alert("Error al cambiar estado", error);
                return;
              }

              setInvoice(updatedInvoice);
            } catch (err: any) {
              Alert.alert("Error", err.message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  const handleIssueInvoice = () => {
    if (!activeCompany || !invoice) return;

    Alert.alert(
      "Emitir factura",
      "Al emitirla se asignará el número oficial y sus datos quedarán inmutables.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Emitir",
          onPress: async () => {
            try {
              setUpdating(true);
              const { invoice: issuedInvoice, error } = await issueInvoice(
                activeCompany.id,
                invoice.id
              );

              if (error) {
                Alert.alert("Error al emitir factura", error);
                return;
              }

              setInvoice(issuedInvoice);
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const resetPaymentForm = () => {
    setPaymentAmount("");
    setPaymentMethod("bank_transfer");
    setPaymentReference("");
    setPaymentNotes("");
  };

  const handleRecordPayment = async () => {
    if (!activeCompany || !invoice) return;

    const normalizedAmount = paymentAmount.trim().replace(",", ".");
    const amount = Number(normalizedAmount);
    const balance = invoice.balance_due ?? total;

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Monto inválido", "Introduce un monto mayor que cero.");
      return;
    }

    if (Math.abs(amount * 100 - Math.round(amount * 100)) >= 1e-8) {
      Alert.alert("Monto inválido", "El monto admite como máximo dos decimales.");
      return;
    }

    if (amount > balance) {
      Alert.alert(
        "El pago excede el saldo",
        `El saldo pendiente es ${formatMoney(balance, currencyCode)}.`
      );
      return;
    }

    try {
      setSavingPayment(true);
      const result = await recordInvoicePayment({
        companyId: activeCompany.id,
        invoiceId: invoice.id,
        amount,
        method: paymentMethod,
        reference: paymentReference,
        notes: paymentNotes
      });

      if (result.error || !result.payment || !result.invoice) {
        Alert.alert(
          "No fue posible registrar el pago",
          result.error ?? "La operación no devolvió un pago válido."
        );
        return;
      }

      setInvoice(result.invoice);
      setPayments((current) => [result.payment!, ...current]);
      setPaymentModalVisible(false);
      resetPaymentForm();

      Alert.alert(
        "Pago registrado",
        `Se generó el recibo ${result.payment.receipt_number}.`
      );
    } finally {
      setSavingPayment(false);
    }
  };

  const handleShareReceipt = async (payment: InvoicePayment) => {
    try {
      setSharingReceiptId(payment.id);
      const result = await shareReceiptPdf(payment);
      if (result.error) {
        Alert.alert("No fue posible compartir el recibo", result.error);
      }
    } finally {
      setSharingReceiptId(null);
    }
  };

  const handleReversePayment = (payment: InvoicePayment) => {
    if (!activeCompany || !invoice) return;

    Alert.alert(
      "Revertir pago",
      `¿Deseas revertir ${payment.payment_number}? El registro y su recibo permanecerán en el historial.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Revertir",
          style: "destructive",
          onPress: async () => {
            try {
              setUpdating(true);
              const result = await reverseInvoicePayment({
                companyId: activeCompany.id,
                invoiceId: invoice.id,
                paymentId: payment.id,
                reason: "Pago revertido manualmente desde la aplicación."
              });

              if (result.error || !result.payment || !result.invoice) {
                Alert.alert(
                  "No fue posible revertir el pago",
                  result.error ?? "La operación no devolvió un pago válido."
                );
                return;
              }

              setInvoice(result.invoice);
              setPayments((current) =>
                current.map((item) =>
                  item.id === result.payment!.id ? result.payment! : item
                )
              );
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleShareCreditNote = async (creditNote: InvoiceCreditNote) => {
    try {
      setSharingCreditNoteId(creditNote.id);
      const result = await shareCreditNotePdf(creditNote);
      if (result.error) {
        Alert.alert("No fue posible compartir la nota de crédito", result.error);
      }
    } finally {
      setSharingCreditNoteId(null);
    }
  };

  const handleIssueCreditNote = async () => {
    if (!activeCompany || !invoice) return;

    const amount = Number(creditNoteAmount.trim().replace(",", "."));
    const reason = creditNoteReason.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Monto inválido", "Introduce un monto mayor que cero.");
      return;
    }

    if (Math.abs(amount * 100 - Math.round(amount * 100)) >= 1e-8) {
      Alert.alert("Monto inválido", "El monto admite como máximo dos decimales.");
      return;
    }

    if (amount > creditRemaining) {
      Alert.alert(
        "El crédito excede la factura",
        `El monto máximo acreditable es ${formatMoney(creditRemaining, currencyCode)}.`
      );
      return;
    }

    if (reason.length < 3) {
      Alert.alert("Motivo requerido", "Explica por qué se emite la nota de crédito.");
      return;
    }

    try {
      setSavingCreditNote(true);
      const result = await issueInvoiceCreditNote({
        companyId: activeCompany.id,
        invoiceId: invoice.id,
        amount,
        reason
      });

      if (result.error || !result.creditNote || !result.invoice) {
        Alert.alert(
          "No fue posible emitir la nota de crédito",
          result.error ?? "La operación no devolvió una nota válida."
        );
        return;
      }

      setInvoice(result.invoice);
      setCreditNotes((current) => [result.creditNote!, ...current]);
      setCreditNoteModalVisible(false);
      setCreditNoteAmount("");
      setCreditNoteReason("");

      Alert.alert(
        "Nota de crédito emitida",
        `Se generó ${result.creditNote.credit_note_number}.`
      );
    } finally {
      setSavingCreditNote(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!activeCompany || !invoice || !cancellationTarget) return;

    const reason = cancellationReason.trim();
    if (reason.length < 3) {
      Alert.alert("Motivo requerido", "Introduce un motivo válido.");
      return;
    }

    try {
      setUpdating(true);

      if (cancellationTarget.type === "invoice") {
        const result = await cancelInvoice({
          companyId: activeCompany.id,
          invoiceId: invoice.id,
          reason
        });

        if (result.error || !result.invoice) {
          Alert.alert(
            "No fue posible cancelar la factura",
            result.error ?? "La operación no devolvió una factura válida."
          );
          return;
        }

        setInvoice(result.invoice);
      } else {
        const result = await cancelInvoiceCreditNote({
          companyId: activeCompany.id,
          invoiceId: invoice.id,
          creditNoteId: cancellationTarget.creditNote.id,
          reason
        });

        if (result.error || !result.creditNote || !result.invoice) {
          Alert.alert(
            "No fue posible cancelar la nota de crédito",
            result.error ?? "La operación no devolvió una nota válida."
          );
          return;
        }

        setInvoice(result.invoice);
        setCreditNotes((current) =>
          current.map((item) =>
            item.id === result.creditNote!.id ? result.creditNote! : item
          )
        );
      }

      setCancellationTarget(null);
      setCancellationReason("");
    } finally {
      setUpdating(false);
    }
  };

  if (!activeCompany || !invoiceId) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyTitle}>Factura no disponible</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Cargando factura...</Text>
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.loader}>
        <Text style={styles.emptyTitle}>Factura no encontrada</Text>
      </View>
    );
  }

  const snapshot = invoice.snapshot_data;
  const snapshotClientName = snapshot
    ? snapshot.client.businessName?.trim() ||
      [snapshot.client.firstName, snapshot.client.lastName]
        .filter(Boolean)
        .join(" ")
        .trim()
    : "";
  const clientName = snapshotClientName || (
    invoice.client
      ? getClientDisplayName(invoice.client)
      : "Cliente no registrado"
  );
  const snapshotAddress = snapshot?.client.address?.address;
  const clientAddress =
    typeof snapshotAddress === "string" && snapshotAddress.trim()
      ? snapshotAddress
      : invoice.budget?.address?.address ?? "Sin dirección registrada";
  const invoiceItems = snapshot?.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitName: item.unitName,
    unitPrice: item.unitPrice,
    subtotal: item.subtotal
  })) ?? invoice.budget?.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitName: item.unit_name,
    unitPrice: item.unit_price,
    subtotal: item.subtotal
  })) ?? [];
  const total = snapshot?.totals.total ?? invoice.budget?.total ?? 0;
  const subtotal = snapshot?.totals.subtotal ?? invoice.budget?.subtotal ?? 0;
  const taxAmount = snapshot?.totals.tax ?? invoice.budget?.tax_amount ?? 0;
  const taxRate = snapshot?.taxes[0]?.rate ?? activeCompany.tax_rate;
  const currencyCode = snapshot?.currency ?? invoice.budget?.currency_code ?? activeCompany.currency_code;
  const displayNumber = invoice.invoice_number ?? "Borrador";
  const totalPaid = invoice.total_paid ?? 0;
  const totalCredit = invoice.total_credit ?? 0;
  const adjustedTotal = invoice.adjusted_total_amount ?? Math.max(total - totalCredit, 0);
  const balanceDue = invoice.balance_due ?? Math.max(adjustedTotal - totalPaid, 0);
  const customerCredit = invoice.customer_credit ?? 0;
  const creditRemaining = Math.max(total - totalCredit, 0);
  const canManageFinancial =
    activeMembership?.role === "owner" || activeMembership?.role === "admin";
  const canRecordPayment =
    ["issued", "partially_paid", "overdue"].includes(invoice.status) &&
    balanceDue > 0;
  const canReversePayments = canManageFinancial;
  const canIssueCreditNote =
    canManageFinancial &&
    !["draft", "cancelled"].includes(invoice.status) &&
    creditRemaining > 0;
  const canCancelInvoice =
    canManageFinancial &&
    ["issued", "overdue"].includes(invoice.status) &&
    totalPaid === 0 &&
    totalCredit === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: displayNumber,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadInvoice(true)}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="receipt-outline" size={30} color={colors.textLight} />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.invoiceNumber}>{displayNumber}</Text>
            <Text style={styles.invoiceDate}>
              {invoice.issue_date
                ? `Emisión: ${formatShortDate(invoice.issue_date, activeCompany.timezone)}`
                : "Sin emitir"}
            </Text>
            <View style={styles.statusBadgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  invoice.status === "paid"
                    ? styles.badgePaid
                    : invoice.status === "cancelled"
                      ? styles.badgeCancelled
                      : styles.badgePending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    invoice.status === "paid"
                      ? styles.textPaid
                      : invoice.status === "cancelled"
                        ? styles.textCancelled
                        : styles.textPending,
                  ]}
                >
                  {getInvoiceStatusLabel(invoice.status)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Acciones principales */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => void handleShareInvoice()}
            disabled={sharingPdf || updating || invoice.status === "draft"}
            style={({ pressed }) => [
              styles.shareButton,
              (sharingPdf || updating || invoice.status === "draft") && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            {sharingPdf ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Ionicons name="share-social-outline" size={20} color={colors.textLight} />
                <Text style={styles.shareButtonText}>Enviar a Cliente</Text>
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/facturas/settings" as Href)}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="options-outline" size={20} color={colors.primary} />
            <Text style={styles.settingsButtonText}>Diseño</Text>
          </Pressable>
        </View>

        {/* Cliente y Detalles */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Facturado a</Text>
          <Text style={styles.clientName}>{clientName}</Text>
          <Text style={styles.clientMeta}>{clientAddress}</Text>
          {(snapshot?.client.phone || invoice.client?.phone) && (
            <Text style={styles.clientMeta}>
              Teléfono: {snapshot?.client.phone || invoice.client?.phone}
            </Text>
          )}
          {(snapshot?.client.email || invoice.client?.email) && (
            <Text style={styles.clientMeta}>
              Correo: {snapshot?.client.email || invoice.client?.email}
            </Text>
          )}
        </View>

        {/* Conceptos / Partidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conceptos cobrados</Text>
          {invoiceItems.length > 0 ? (
            invoiceItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemQty}>
                    {item.quantity} {item.unitName} × {formatMoney(item.unitPrice, currencyCode)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatMoney(item.subtotal, currencyCode)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyItemsText}>
              No hay partidas registradas en esta factura.
            </Text>
          )}
        </View>

        {/* Totales */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalVal}>{formatMoney(subtotal, currencyCode)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Impuesto ({taxRate}%)</Text>
            <Text style={styles.totalVal}>{formatMoney(taxAmount, currencyCode)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalVal}>{formatMoney(total, currencyCode)}</Text>
          </View>
          {invoice.status !== "draft" && (
            <>
              {totalCredit > 0 && (
                <>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Notas de crédito</Text>
                    <Text style={styles.creditValue}>
                      − {formatMoney(totalCredit, currencyCode)}
                    </Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total ajustado</Text>
                    <Text style={styles.totalVal}>
                      {formatMoney(adjustedTotal, currencyCode)}
                    </Text>
                  </View>
                </>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Pagado</Text>
                <Text style={styles.paidValue}>{formatMoney(totalPaid, currencyCode)}</Text>
              </View>
              <View style={[styles.totalRow, styles.balanceRow]}>
                <Text style={styles.balanceLabel}>Saldo pendiente</Text>
                <Text style={styles.balanceValue}>{formatMoney(balanceDue, currencyCode)}</Text>
              </View>
              {customerCredit > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Crédito a favor del cliente</Text>
                  <Text style={styles.creditValue}>
                    {formatMoney(customerCredit, currencyCode)}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {invoice.status !== "draft" && (
          <View style={styles.card}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentHeaderText}>
                <Text style={styles.cardTitle}>Pagos y recibos</Text>
                <Text style={styles.paymentCount}>
                  {payments.length} {payments.length === 1 ? "registro" : "registros"}
                </Text>
              </View>
              {canRecordPayment && (
                <Pressable
                  onPress={() => {
                    setPaymentAmount(balanceDue.toFixed(2));
                    setPaymentModalVisible(true);
                  }}
                  disabled={updating}
                  style={({ pressed }) => [
                    styles.addPaymentButton,
                    pressed && styles.pressed
                  ]}
                >
                  <Ionicons name="add" size={18} color={colors.textLight} />
                  <Text style={styles.addPaymentButtonText}>Registrar abono</Text>
                </Pressable>
              )}
            </View>

            {payments.length === 0 ? (
              <Text style={styles.emptyItemsText}>
                Todavía no hay pagos registrados.
              </Text>
            ) : (
              payments.map((payment) => (
                <View key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentIcon}>
                    <Ionicons
                      name={payment.status === "reversed" ? "return-up-back" : "cash-outline"}
                      size={20}
                      color={payment.status === "reversed" ? colors.danger : colors.primary}
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleRow}>
                      <Text style={styles.paymentNumber}>{payment.payment_number}</Text>
                      <Text
                        style={[
                          styles.paymentAmount,
                          payment.status === "reversed" && styles.reversedText
                        ]}
                      >
                        {formatMoney(payment.amount, payment.currency_code)}
                      </Text>
                    </View>
                    <Text style={styles.paymentMeta}>
                      {getInvoicePaymentMethodLabel(payment.method)} · {formatShortDate(payment.paid_at, activeCompany.timezone)}
                    </Text>
                    <Text style={styles.receiptNumber}>Recibo {payment.receipt_number}</Text>
                    {payment.status === "reversed" && (
                      <Text style={styles.reversedLabel}>Pago revertido</Text>
                    )}
                    <View style={styles.paymentActions}>
                      <Pressable
                        onPress={() => void handleShareReceipt(payment)}
                        disabled={sharingReceiptId === payment.id || updating}
                        style={({ pressed }) => [
                          styles.receiptButton,
                          pressed && styles.pressed
                        ]}
                      >
                        {sharingReceiptId === payment.id ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Ionicons name="share-outline" size={16} color={colors.primary} />
                        )}
                        <Text style={styles.receiptButtonText}>Compartir recibo</Text>
                      </Pressable>
                      {canReversePayments && payment.status === "confirmed" && (
                        <Pressable
                          onPress={() => handleReversePayment(payment)}
                          disabled={updating}
                          style={({ pressed }) => [
                            styles.reverseButton,
                            pressed && styles.pressed
                          ]}
                        >
                          <Text style={styles.reverseButtonText}>Revertir</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {invoice.status !== "draft" && (
          <View style={styles.card}>
            <View style={styles.paymentHeader}>
              <View style={styles.paymentHeaderText}>
                <Text style={styles.cardTitle}>Notas de crédito</Text>
                <Text style={styles.paymentCount}>
                  {creditNotes.length} {creditNotes.length === 1 ? "registro" : "registros"}
                </Text>
              </View>
              {canIssueCreditNote && (
                <Pressable
                  onPress={() => {
                    setCreditNoteAmount(creditRemaining.toFixed(2));
                    setCreditNoteModalVisible(true);
                  }}
                  disabled={updating}
                  style={({ pressed }) => [
                    styles.addPaymentButton,
                    pressed && styles.pressed
                  ]}
                >
                  <Ionicons name="document-text-outline" size={17} color={colors.textLight} />
                  <Text style={styles.addPaymentButtonText}>Nueva nota</Text>
                </Pressable>
              )}
            </View>

            {creditNotes.length === 0 ? (
              <Text style={styles.emptyItemsText}>
                No hay notas de crédito emitidas.
              </Text>
            ) : (
              creditNotes.map((creditNote) => (
                <View key={creditNote.id} style={styles.paymentItem}>
                  <View style={styles.creditNoteIcon}>
                    <Ionicons
                      name={creditNote.status === "cancelled" ? "close-circle-outline" : "document-text-outline"}
                      size={20}
                      color={creditNote.status === "cancelled" ? colors.danger : colors.primary}
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentTitleRow}>
                      <Text style={styles.paymentNumber}>
                        {creditNote.credit_note_number}
                      </Text>
                      <Text
                        style={[
                          styles.creditNoteAmount,
                          creditNote.status === "cancelled" && styles.reversedText
                        ]}
                      >
                        − {formatMoney(creditNote.amount, creditNote.currency_code)}
                      </Text>
                    </View>
                    <Text style={styles.paymentMeta}>
                      {formatShortDate(creditNote.issued_at, activeCompany.timezone)}
                    </Text>
                    <Text style={styles.creditNoteReason}>{creditNote.reason}</Text>
                    {creditNote.status === "cancelled" && (
                      <Text style={styles.reversedLabel}>Nota cancelada</Text>
                    )}
                    <View style={styles.paymentActions}>
                      <Pressable
                        onPress={() => void handleShareCreditNote(creditNote)}
                        disabled={sharingCreditNoteId === creditNote.id || updating}
                        style={({ pressed }) => [
                          styles.receiptButton,
                          pressed && styles.pressed
                        ]}
                      >
                        {sharingCreditNoteId === creditNote.id ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                          <Ionicons name="share-outline" size={16} color={colors.primary} />
                        )}
                        <Text style={styles.receiptButtonText}>Compartir nota</Text>
                      </Pressable>
                      {canManageFinancial && creditNote.status === "issued" && (
                        <Pressable
                          onPress={() => {
                            setCancellationReason("");
                            setCancellationTarget({ type: "creditNote", creditNote });
                          }}
                          disabled={updating}
                          style={({ pressed }) => [
                            styles.reverseButton,
                            pressed && styles.pressed
                          ]}
                        >
                          <Text style={styles.reverseButtonText}>Cancelar nota</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Cambiar Estado */}
        <View style={styles.statusButtonsCard}>
          <Text style={styles.cardTitle}>Administrar factura</Text>
          <View style={styles.statusButtonsRow}>
            {invoice.status === "draft" && (
              <Pressable
                onPress={handleIssueInvoice}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusOptionButton,
                  styles.btnPay,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                <Text style={styles.statusOptionButtonText}>Emitir factura</Text>
              </Pressable>
            )}

            {(invoice.status === "issued" || invoice.status === "partially_paid") && (
              <Pressable
                onPress={() => handleChangeStatus("overdue")}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusOptionButton,
                  styles.btnPending,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="time-outline" size={18} color="#FFFFFF" />
                <Text style={styles.statusOptionButtonText}>Marcar vencida</Text>
              </Pressable>
            )}

            {canCancelInvoice && (
              <Pressable
                onPress={() => {
                  setCancellationReason("");
                  setCancellationTarget({ type: "invoice" });
                }}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusOptionButton,
                  styles.btnCancel,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.statusOptionButtonText}>Cancelar factura</Text>
              </Pressable>
            )}

          </View>
        </View>
      </ScrollView>

      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !savingPayment && setPaymentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Registrar abono</Text>
                <Text style={styles.modalSubtitle}>
                  Saldo: {formatMoney(balanceDue, currencyCode)}
                </Text>
              </View>
              <Pressable
                onPress={() => setPaymentModalVisible(false)}
                disabled={savingPayment}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Monto</Text>
            <TextInput
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              style={styles.amountInput}
            />

            <Text style={styles.inputLabel}>Método de pago</Text>
            <View style={styles.methodGrid}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={({ pressed }) => [
                    styles.methodButton,
                    paymentMethod === method && styles.methodButtonActive,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.methodButtonText,
                      paymentMethod === method && styles.methodButtonTextActive
                    ]}
                  >
                    {getInvoicePaymentMethodLabel(method)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Referencia (opcional)</Text>
            <TextInput
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholder="Transferencia, cheque o comprobante"
              placeholderTextColor={colors.textMuted}
              maxLength={200}
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Notas (opcional)</Text>
            <TextInput
              value={paymentNotes}
              onChangeText={setPaymentNotes}
              placeholder="Detalle adicional del pago"
              placeholderTextColor={colors.textMuted}
              maxLength={2000}
              multiline
              style={[styles.textInput, styles.notesInput]}
            />

            <Pressable
              onPress={() => void handleRecordPayment()}
              disabled={savingPayment}
              style={({ pressed }) => [
                styles.confirmPaymentButton,
                savingPayment && styles.disabledButton,
                pressed && styles.pressed
              ]}
            >
              {savingPayment ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.textLight} />
                  <Text style={styles.confirmPaymentButtonText}>Confirmar y generar recibo</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={creditNoteModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          !savingCreditNote && setCreditNoteModalVisible(false)
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Emitir nota de crédito</Text>
                <Text style={styles.modalSubtitle}>
                  Máximo: {formatMoney(creditRemaining, currencyCode)}
                </Text>
              </View>
              <Pressable
                onPress={() => setCreditNoteModalVisible(false)}
                disabled={savingCreditNote}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Monto a acreditar</Text>
            <TextInput
              value={creditNoteAmount}
              onChangeText={setCreditNoteAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              style={styles.amountInput}
            />

            <Text style={styles.inputLabel}>Motivo</Text>
            <TextInput
              value={creditNoteReason}
              onChangeText={setCreditNoteReason}
              placeholder="Describe la corrección realizada"
              placeholderTextColor={colors.textMuted}
              maxLength={1000}
              multiline
              style={[styles.textInput, styles.notesInput]}
            />

            <Pressable
              onPress={() => void handleIssueCreditNote()}
              disabled={savingCreditNote}
              style={({ pressed }) => [
                styles.confirmPaymentButton,
                savingCreditNote && styles.disabledButton,
                pressed && styles.pressed
              ]}
            >
              {savingCreditNote ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color={colors.textLight} />
                  <Text style={styles.confirmPaymentButtonText}>Emitir nota de crédito</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={Boolean(cancellationTarget)}
        transparent
        animationType="slide"
        onRequestClose={() => !updating && setCancellationTarget(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.paymentHeaderText}>
                <Text style={styles.modalTitle}>
                  {cancellationTarget?.type === "creditNote"
                    ? "Cancelar nota de crédito"
                    : "Cancelar factura"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  El registro permanecerá visible en el historial.
                </Text>
              </View>
              <Pressable
                onPress={() => setCancellationTarget(null)}
                disabled={updating}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Motivo obligatorio</Text>
            <TextInput
              value={cancellationReason}
              onChangeText={setCancellationReason}
              placeholder="Explica el motivo de la cancelación"
              placeholderTextColor={colors.textMuted}
              maxLength={1000}
              multiline
              style={[styles.textInput, styles.notesInput]}
            />

            <Pressable
              onPress={() => void handleConfirmCancellation()}
              disabled={updating}
              style={({ pressed }) => [
                styles.confirmCancelButton,
                updating && styles.disabledButton,
                pressed && styles.pressed
              ]}
            >
              {updating ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={20} color={colors.textLight} />
                  <Text style={styles.confirmPaymentButtonText}>Confirmar cancelación</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loaderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  heroCard: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  heroInfo: {
    flex: 1,
  },

  invoiceNumber: {
    color: colors.textLight,
    fontSize: 21,
    fontWeight: "900",
  },

  invoiceDate: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },

  statusBadgeRow: {
    flexDirection: "row",
    marginTop: 6,
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.full,
  },

  badgePaid: {
    backgroundColor: "#DCFCE7",
  },

  badgeCancelled: {
    backgroundColor: "#FEE2E2",
  },

  badgePending: {
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  textPaid: {
    color: "#16A34A",
  },

  textCancelled: {
    color: "#DC2626",
  },

  textPending: {
    color: "#D97706",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  shareButton: {
    flex: 2,
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  shareButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  settingsButton: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  settingsButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  card: {
    marginTop: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  cardTitle: {
    marginBottom: 12,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.08,
  },

  clientName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  clientMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  itemInfo: {
    flex: 1,
    marginRight: 10,
  },

  itemDesc: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },

  itemQty: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  itemTotal: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  emptyItemsText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  totalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  totalVal: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },

  grandTotalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  grandTotalLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  grandTotalVal: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },

  paidValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  creditValue: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "900",
  },

  balanceRow: {
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  balanceLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  balanceValue: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900",
  },

  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },

  paymentHeaderText: {
    flex: 1,
  },

  paymentCount: {
    marginTop: -8,
    color: colors.textSecondary,
    fontSize: 12,
  },

  addPaymentButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addPaymentButtonText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "900",
  },

  paymentItem: {
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    gap: 10,
  },

  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  creditNoteIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  paymentInfo: {
    flex: 1,
  },

  paymentTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  paymentNumber: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },

  paymentAmount: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  creditNoteAmount: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "900",
  },

  paymentMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  creditNoteReason: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  receiptNumber: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
  },

  reversedText: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },

  reversedLabel: {
    marginTop: 3,
    color: colors.danger,
    fontSize: 11,
    fontWeight: "900",
  },

  paymentActions: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  receiptButton: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  receiptButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  reverseButton: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerSoft,
    justifyContent: "center",
  },

  reverseButtonText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "900",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(16, 37, 29, 0.55)",
  },

  modalCard: {
    padding: 20,
    paddingBottom: 30,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.surface,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  modalSubtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  modalClose: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    marginTop: 10,
    marginBottom: 6,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  amountInput: {
    minHeight: 58,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 24,
    fontWeight: "900",
  },

  textInput: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 14,
  },

  notesInput: {
    minHeight: 72,
    paddingTop: 12,
    textAlignVertical: "top",
  },

  methodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  methodButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },

  methodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  methodButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  methodButtonTextActive: {
    color: colors.primaryDark,
  },

  confirmPaymentButton: {
    minHeight: 52,
    marginTop: 20,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  confirmCancelButton: {
    minHeight: 52,
    marginTop: 20,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  confirmPaymentButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  statusButtonsCard: {
    marginTop: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  statusButtonsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  statusOptionButton: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  btnPay: {
    backgroundColor: "#16A34A",
  },

  btnCancel: {
    backgroundColor: "#DC2626",
  },

  btnPending: {
    backgroundColor: "#D97706",
  },

  statusOptionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.78,
  },
});
