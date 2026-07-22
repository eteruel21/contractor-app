import { Ionicons } from "@expo/vector-icons";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import { listInvoices } from "@/services/invoice-service";
import type { InvoiceWithDetails } from "@/types/invoice";
import { getInvoiceStatusLabel } from "@/types/invoice";
import { formatMoney } from "@/types/budget";
import { formatShortDate } from "@/utils/format";
import { getClientDisplayName } from "@/types/client";

export default function InvoicesListScreen() {
  const { activeCompany } = useCompany();
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const loadInvoices = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) return;

      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const { invoices: loadedInvoices, error } = await listInvoices(
        activeCompany.id,
      );

      if (error) {
        console.error("Error cargando facturas", error);
      } else {
        setInvoices(loadedInvoices);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useFocusEffect(
    useCallback(() => {
      void loadInvoices();
    }, [loadInvoices]),
  );

  const filteredInvoices = invoices.filter((invoice) => {
    const snapshotClient = invoice.snapshot_data?.client;
    const clientName = snapshotClient
      ? snapshotClient.businessName?.trim() ||
        [snapshotClient.firstName, snapshotClient.lastName]
          .filter(Boolean)
          .join(" ")
          .trim()
      : invoice.client
        ? getClientDisplayName(invoice.client)
        : "";
    const term = search.toLowerCase().trim();
    return (
      (invoice.invoice_number ?? "borrador").toLowerCase().includes(term) ||
      clientName.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { text: "#16A34A", bg: "#DCFCE7" };
      case "cancelled":
        return { text: "#DC2626", bg: "#FEE2E2" };
      case "overdue":
        return { text: "#B91C1C", bg: "#FEE2E2" };
      case "draft":
        return { text: "#475569", bg: "#E2E8F0" };
      case "issued":
        return { text: "#1D4ED8", bg: "#DBEAFE" };
      default:
        return { text: "#D97706", bg: "#FEF3C7" };
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Cargando facturas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por número o cliente..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <Pressable
          onPress={() => router.push("/facturas/settings" as Href)}
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.settingsButtonText}>Diseño</Text>
        </Pressable>
      </View>

      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadInvoices(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No hay facturas</Text>
            <Text style={styles.emptySubtitle}>
              Las facturas se generan aprobando un presupuesto y haciendo clic en &quot;Generar factura&quot;.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const snapshotClient = item.snapshot_data?.client;
          const clientName = snapshotClient
            ? snapshotClient.businessName?.trim() ||
              [snapshotClient.firstName, snapshotClient.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              "Cliente no registrado"
            : item.client
              ? getClientDisplayName(item.client)
              : "Cliente no registrado";
          const statusColors = getStatusColor(item.status);
          const total = item.snapshot_data?.totals.total ?? item.budget?.total ?? 0;
          const currencyCode = item.snapshot_data?.currency ?? item.budget?.currency_code ?? activeCompany?.currency_code;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/facturas/[id]",
                  params: { id: item.id },
                } as Href)
              }
              style={({ pressed }) => [
                styles.invoiceCard,
                pressed && styles.pressedCard,
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.invoiceNumber}>
                    {item.invoice_number ?? "Borrador"}
                  </Text>
                  <Text style={styles.invoiceDate}>
                    {item.issue_date
                      ? formatShortDate(item.issue_date, activeCompany?.timezone)
                      : "Sin emitir"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors.bg },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColors.text }]}>
                    {getInvoiceStatusLabel(item.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.clientName}>{clientName}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Monto total</Text>
                <Text style={styles.totalValue}>
                  {formatMoney(total, currencyCode)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
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

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  searchBox: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  settingsButton: {
    minHeight: 46,
    paddingHorizontal: 12,
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
    fontSize: 13,
    fontWeight: "800",
  },

  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  invoiceCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  pressedCard: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  pressed: {
    opacity: 0.75,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  invoiceNumber: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  invoiceDate: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  clientName: {
    marginTop: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: "bold",
  },

  cardFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  totalValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },

  emptyState: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptySubtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
