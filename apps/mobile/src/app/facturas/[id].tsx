import { Ionicons } from "@expo/vector-icons";
import { type Href, router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import { getInvoiceById, updateInvoiceStatus } from "@/services/invoice-service";
import type { InvoiceWithDetails, InvoiceStatus } from "@/types/invoice";
import { getInvoiceStatusLabel } from "@/types/invoice";
import { formatMoney } from "@/types/budget";
import { formatShortDate } from "@/utils/format";
import { getClientDisplayName } from "@/types/client";
import { shareInvoicePdf } from "@/utils/invoice-pdf";

export default function InvoiceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const invoiceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { activeCompany } = useCompany();

  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadInvoice = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany || !invoiceId) return;

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const { invoice: loadedInvoice, error } = await getInvoiceById(
        activeCompany.id,
        invoiceId,
      );

      if (error) {
        Alert.alert("No fue posible cargar la factura", error);
      } else {
        setInvoice(loadedInvoice);
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

    try {
      setSharingPdf(true);
      const { error } = await shareInvoicePdf({
        company: activeCompany,
        invoice,
      });

      if (error) {
        Alert.alert("Error al compartir PDF", error);
      }
    } finally {
      setSharingPdf(false);
    }
  };

  const handleChangeStatus = (nextStatus: InvoiceStatus) => {
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
              const { error } = await updateInvoiceStatus({
                companyId: activeCompany.id,
                invoiceId: invoice.id,
                status: nextStatus,
              });

              if (error) {
                Alert.alert("Error al cambiar estado", error);
                return;
              }

              setInvoice((curr) =>
                curr ? { ...curr, status: nextStatus } : null,
              );
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

  const clientName = invoice.client
    ? getClientDisplayName(invoice.client)
    : "Cliente no registrado";

  const clientAddress = invoice.budget?.address?.address ?? "Sin dirección registrada";

  const total = invoice.budget?.total ?? 0;
  const subtotal = invoice.budget?.subtotal ?? 0;
  const taxAmount = invoice.budget?.tax_amount ?? 0;
  const currencyCode = invoice.budget?.currency_code ?? activeCompany.currency_code;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: invoice.invoice_number,
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
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceDate}>
              Emisión: {formatShortDate(invoice.issue_date, activeCompany.timezone)}
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
            disabled={sharingPdf || updating}
            style={({ pressed }) => [
              styles.shareButton,
              (sharingPdf || updating) && styles.disabledButton,
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
          {invoice.client?.phone && (
            <Text style={styles.clientMeta}>Teléfono: {invoice.client.phone}</Text>
          )}
          {invoice.client?.email && (
            <Text style={styles.clientMeta}>Correo: {invoice.client.email}</Text>
          )}
        </View>

        {/* Conceptos / Partidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conceptos cobrados</Text>
          {invoice.budget && invoice.budget.items.length > 0 ? (
            invoice.budget.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemQty}>
                    {item.quantity} {item.unit_name} × {formatMoney(item.unit_price, currencyCode)}
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
            <Text style={styles.totalLabel}>Impuesto ({activeCompany.tax_rate}%)</Text>
            <Text style={styles.totalVal}>{formatMoney(taxAmount, currencyCode)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalVal}>{formatMoney(total, currencyCode)}</Text>
          </View>
        </View>

        {/* Cambiar Estado */}
        <View style={styles.statusButtonsCard}>
          <Text style={styles.cardTitle}>Administrar factura</Text>
          <View style={styles.statusButtonsRow}>
            {invoice.status !== "paid" && (
              <Pressable
                onPress={() => handleChangeStatus("paid")}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusOptionButton,
                  styles.btnPay,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.statusOptionButtonText}>Marcar Pagada</Text>
              </Pressable>
            )}

            {invoice.status !== "cancelled" && (
              <Pressable
                onPress={() => handleChangeStatus("cancelled")}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusOptionButton,
                  styles.btnCancel,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.statusOptionButtonText}>Anular</Text>
              </Pressable>
            )}

            {invoice.status !== "pending" && (
              <Pressable
                onPress={() => handleChangeStatus("pending")}
                disabled={updating}
                style={({ pressed }) => [
                  styles.statusOptionButton,
                  styles.btnPending,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="time-outline" size={18} color="#FFFFFF" />
                <Text style={styles.statusOptionButtonText}>Marcar Pendiente</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
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
