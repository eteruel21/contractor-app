import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  radius,
} from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import type { Budget } from "@/types/budget";
import {
  formatMoney,
  getBudgetStatusLabel,
} from "@/types/budget";
import { listBudgetsByCompany } from "../../services/budget-service";

export default function BudgetsScreen() {
  const { activeCompany } = useCompany();

  const [budgets, setBudgets] = useState<
    Budget[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [search, setSearch] = useState("");

  const filteredBudgets = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return budgets;

    return budgets.filter((budget) => {
      const budgetNumber =
        budget.budget_number.toLowerCase();
      const title = budget.title.toLowerCase();
      const status =
        getBudgetStatusLabel(
          budget.status,
        ).toLowerCase();

      return (
        budgetNumber.includes(query) ||
        title.includes(query) ||
        status.includes(query)
      );
    });
  }, [budgets, search]);

  const loadBudgets = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { budgets: loadedBudgets, error } =
        await listBudgetsByCompany(
          activeCompany.id,
        );

      if (error) {
        Alert.alert(
          "No fue posible cargar los presupuestos",
          error,
        );
      } else {
        setBudgets(loadedBudgets);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useFocusEffect(
    useCallback(() => {
      void loadBudgets();
    }, [loadBudgets]),
  );

  if (!activeCompany) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          No hay empresa activa
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredBudgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadBudgets(true)
            }
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Presupuestos
                </Text>

                <Text style={styles.subtitle}>
                  {activeCompany.name}
                </Text>
              </View>

              <View style={styles.iconBox}>
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color={colors.textLight}
                />
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por número, título o estado"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <Text style={styles.counter}>
              {filteredBudgets.length} presupuesto
              {filteredBudgets.length === 1
                ? ""
                : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="receipt-outline"
              size={46}
              color={colors.textSecondary}
            />

            <Text style={styles.emptyTitle}>
              No hay presupuestos
            </Text>

            <Text style={styles.emptyText}>
              Para crear uno, entra a un cliente, abre un proyecto y presiona Crear presupuesto.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BudgetCard
            budget={item}
            onPress={() =>
              router.push({
                pathname: "/presupuestos/[id]",
                params: {
                  id: item.id,
                },
              } as Href)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

function BudgetCard({
  budget,
  onPress,
}: {
  budget: Budget;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.budgetCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.budgetTopRow}>
        <View style={styles.budgetIcon}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={colors.textLight}
          />
        </View>

        <View style={styles.budgetInfo}>
          <Text style={styles.budgetNumber}>
            {budget.budget_number}
          </Text>

          <Text
            style={styles.budgetTitle}
            numberOfLines={1}
          >
            {budget.title}
          </Text>

          <Text style={styles.budgetStatus}>
            {getBudgetStatusLabel(
              budget.status,
            )}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.amountRow}>
        <AmountBox
          label="Subtotal"
          value={formatMoney(budget.subtotal)}
        />

        <AmountBox
          label="ITBMS"
          value={formatMoney(budget.tax_amount)}
        />

        <AmountBox
          label="Total"
          value={formatMoney(budget.total)}
          strong
        />
      </View>
    </Pressable>
  );
}

function AmountBox({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.amountBox}>
      <Text style={styles.amountLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.amountValue,
          strong && styles.amountValueStrong,
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
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
    paddingBottom: 50,
  },

  header: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  counter: {
    marginTop: 12,
    marginBottom: 12,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  empty: {
    marginTop: 90,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptyText: {
    maxWidth: 300,
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  budgetCard: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  budgetTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  budgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  budgetInfo: {
    flex: 1,
  },

  budgetNumber: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  budgetTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  budgetStatus: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  amountRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    gap: 8,
  },

  amountBox: {
    flex: 1,
  },

  amountLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },

  amountValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },

  amountValueStrong: {
    color: colors.primary,
    fontSize: 13,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});