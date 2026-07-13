import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { listBudgetsForClient } from "../../services/budget-service";
import { formatMoney } from "../../utils/format";

export default function ClientBudgetsScreen() {
  const { profile } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBudgets = useCallback(
    async (showRefresh = false) => {
      if (!profile?.id) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { budgets: loadedBudgets, error } = await listBudgetsForClient(
        profile.id,
      );

      if (error) {
        Alert.alert("No fue posible cargar tus presupuestos", error);
      } else {
        setBudgets(loadedBudgets);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [profile?.id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadBudgets();
    }, [loadBudgets]),
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadBudgets(true)}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Mis Presupuestos</Text>
            <Text style={styles.subtitle}>
              {budgets.length} presupuesto{budgets.length === 1 ? "" : "s"} disponibles
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={46} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sin presupuestos compartidos</Text>
            <Text style={styles.emptyText}>
              Las cotizaciones y presupuestos emitidos por tus contratistas aparecerán aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.budgetCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.budgetCode}>
                  {item.quotation_number || "PRESUPUESTO"}
                </Text>
                <Text style={styles.projectLabel}>
                  Proyecto: {item.project?.name || "Sin vincular"}
                </Text>
                <Text style={styles.contractorLabel}>
                  Contratista: {item.company?.name || "Sin especificar"}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {item.status === "approved"
                    ? "Aprobado"
                    : item.status === "sent"
                      ? "Enviado"
                      : "Borrador"}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <Text style={styles.totalLabel}>Monto total:</Text>
              <Text style={styles.totalValue}>
                {formatMoney(item.total || 0, item.company?.currency_code)}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  empty: {
    marginTop: 40,
    padding: 30,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  budgetCard: {
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  budgetCode: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  projectLabel: {
    marginTop: 4,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  contractorLabel: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2563EB",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
});
