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
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { LeuretEmptyState } from "@/components/LeuretEmptyState";
import { LeuretLoading } from "@/components/LeuretLoading";
import { MotionPressable } from "@/components/MotionPressable";

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
        <LeuretEmptyState icon="business-outline" title="No hay empresa activa" description="Selecciona o crea una empresa para administrar tus presupuestos." compact />
      </View>
    );
  }

  if (loading) {
    return <LeuretLoading message="Cargando presupuestos…" fullScreen />;
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
                placeholderTextColor={colors.textMuted}
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
          <LeuretEmptyState
            icon={search.trim() ? "search-outline" : "receipt-outline"}
            title={search.trim() ? "Sin coincidencias" : "No hay presupuestos"}
            description={search.trim() ? "Prueba con otro número, título o estado." : "Crea un presupuesto desde un proyecto para comenzar a cotizar tu trabajo."}
            actionLabel={search.trim() ? "Limpiar búsqueda" : "Ir a proyectos"}
            actionIcon={search.trim() ? "close-outline" : "business-outline"}
            onAction={() => search.trim() ? setSearch("") : router.push("/proyectos" as Href)}
            style={styles.emptySpacing}
          />
        }
        renderItem={({ item, index }) => (
          <BudgetCard
            budget={item}
            index={index}
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
  index,
  onPress,
}: {
  budget: Budget;
  index: number;
  onPress: () => void;
}) {
  return (
    <MotionPressable
      entering={FadeInUp.delay(index * 45).duration(320)}
      onPress={onPress}
      pressedScale={0.985}
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
    </MotionPressable>
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
    backgroundColor: colors.accent,
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

  emptySpacing: {
    marginTop: 24,
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
    backgroundColor: colors.steel,
    alignItems: "center",
    justifyContent: "center",
  },

  budgetInfo: {
    flex: 1,
  },

  budgetNumber: {
    color: colors.accent,
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
    color: colors.accent,
    fontSize: 13,
  },

  pressed: {
    backgroundColor: colors.accentSoft,
    opacity: 0.92,
  },
});