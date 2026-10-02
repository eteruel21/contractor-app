import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LeuretButton } from "@/components/LeuretButton";
import { LeuretFeedback } from "@/components/LeuretFeedback";
import { LeuretLoading } from "@/components/LeuretLoading";
import { colors, radius } from "@/constants/theme";
import { approveBudget, getClientBudgetDetail, rejectBudget } from "@/services/budget-service";
import type { Budget, BudgetItem, BudgetSection } from "@/types/budget";
import { getBudgetStatusLabel } from "@/types/budget";
import { formatMoney } from "@/utils/format";

type Detail = Budget & {
  sections: BudgetSection[];
  items: BudgetItem[];
  company?: { name?: string; currency_code?: string } | null;
  project?: { name?: string } | null;
};

export default function ClientBudgetDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const budgetId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [budget, setBudget] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!budgetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getClientBudgetDetail(budgetId);
    setBudget(result.budget as Detail | null);
    setError(result.error);
    setLoading(false);
  }, [budgetId]);

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(() => {
      if (active) void load();
    });

    return () => {
      active = false;
    };
  }, [load]);

  async function approve() {
    if (!budget) return;
    try {
      setSubmitting(true);
      setError(null);
      const result = await approveBudget(budget.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBudget({ ...budget, status: "approved" });
      setRejecting(false);
    } finally {
      setSubmitting(false);
    }
  }

  async function reject() {
    if (!budget) return;
    const rejectionReason = reason.trim();
    if (!rejectionReason) {
      setError("Escribe el motivo del rechazo.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const result = await rejectBudget(budget.id, rejectionReason);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBudget({ ...budget, status: "rejected" });
      setReason("");
      setRejecting(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LeuretLoading message="Cargando presupuesto…" fullScreen />;

  if (!budgetId || !budget) {
    return (
      <SafeAreaView style={styles.centered}>
        <LeuretFeedback
          tone="error"
          title="Presupuesto no disponible"
          message={error || "No encontramos este presupuesto."}
        />
      </SafeAreaView>
    );
  }

  const canRespond = budget.status === "sent" || budget.status === "viewed";
  const currency = budget.currency_code || budget.company?.currency_code;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: budget.budget_number }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.number}>{budget.budget_number}</Text>
          <Text style={styles.title}>{budget.title}</Text>
          <Text style={styles.meta}>{budget.project?.name || "Sin proyecto"}</Text>
          <Text style={styles.status}>{getBudgetStatusLabel(budget.status)}</Text>
        </View>

        {error ? (
          <LeuretFeedback tone="error" title="No se pudo completar la acción" message={error} />
        ) : null}

        <View style={styles.card}>
          <Row label="Subtotal" value={formatMoney(budget.subtotal, currency)} />
          <Row label="Descuento" value={formatMoney(budget.discount_amount, currency)} />
          <Row label={`ITBMS ${budget.tax_rate}%`} value={formatMoney(budget.tax_amount, currency)} />
          <View style={styles.divider} />
          <Row label="Total" value={formatMoney(budget.total, currency)} strong />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Partidas</Text>
          {budget.items.length ? budget.items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.description}</Text>
                <Text style={styles.itemMeta}>
                  {item.quantity} {item.unit_name} × {formatMoney(item.unit_price, currency)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{formatMoney(item.subtotal, currency)}</Text>
            </View>
          )) : <Text style={styles.empty}>Sin partidas.</Text>}
        </View>

        {canRespond ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tu decisión</Text>
            <Text style={styles.helper}>Aprueba el presupuesto o solicita cambios indicando el motivo.</Text>
            {rejecting ? (
              <>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Motivo del rechazo"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  style={styles.input}
                />
                <View style={styles.actions}>
                  <LeuretButton label="Cancelar" variant="secondary" onPress={() => setRejecting(false)} style={styles.action} />
                  <LeuretButton label="Rechazar" variant="danger" loading={submitting} onPress={() => void reject()} style={styles.action} />
                </View>
              </>
            ) : (
              <View style={styles.actions}>
                <LeuretButton label="Rechazar" variant="secondary" disabled={submitting} onPress={() => setRejecting(true)} style={styles.action} />
                <LeuretButton
                  label="Aprobar"
                  loading={submitting}
                  onPress={() => Alert.alert("Aprobar presupuesto", "¿Confirmas la aprobación?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Aprobar", onPress: () => void approve() },
                  ])}
                  style={styles.action}
                />
              </View>
            )}
          </View>
        ) : budget.status === "approved" ? (
          <LeuretFeedback tone="success" title="Presupuesto aprobado" message="El contratista ya puede continuar con la facturación." />
        ) : budget.status === "rejected" ? (
          <LeuretFeedback tone="info" title="Presupuesto rechazado" message="Tu decisión ya fue registrada." />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  hero: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surfaceDark },
  number: { color: colors.textLightMuted, fontSize: 12, fontWeight: "900" },
  title: { marginTop: 4, color: colors.textLight, fontSize: 20, fontWeight: "900" },
  meta: { marginTop: 5, color: colors.textLightMuted, fontSize: 12, fontWeight: "700" },
  status: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, overflow: "hidden", backgroundColor: colors.surfaceDarkRaised, color: colors.textLight, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  card: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  helper: { marginTop: 7, color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  row: { paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  rowLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: "700" },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: "900" },
  strong: { color: colors.accent, fontSize: 18 },
  divider: { height: 1, marginVertical: 5, backgroundColor: colors.divider },
  item: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider, flexDirection: "row", gap: 12, alignItems: "center" },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.text, fontSize: 13, fontWeight: "900" },
  itemMeta: { marginTop: 4, color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  itemTotal: { color: colors.text, fontSize: 13, fontWeight: "900" },
  empty: { marginTop: 12, color: colors.textSecondary, fontSize: 13 },
  input: { minHeight: 96, marginTop: 14, padding: 12, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, backgroundColor: colors.surfaceRaised, color: colors.text, textAlignVertical: "top" },
  actions: { marginTop: 16, flexDirection: "row", gap: 10 },
  action: { flex: 1 },
});
