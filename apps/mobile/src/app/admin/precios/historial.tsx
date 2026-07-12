import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  listPricingHistory,
  type PricingHistoryItem,
  subscribeToPricing,
} from "@/services/pricing-service";
import { formatMoney } from "@/types/budget";

type Filter =
  | "all"
  | "increase"
  | "decrease"
  | "initial";

const FILTERS: {
  value: Filter;
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  { value: "increase", label: "Aumentos" },
  { value: "decrease", label: "Reducciones" },
  { value: "initial", label: "Iniciales" },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getChangeDirection(
  entry: PricingHistoryItem,
): "increase" | "decrease" | "initial" | "same" {
  if (
    entry.previous_unit_cost === null ||
    entry.previous_sale_price === null
  ) {
    return "initial";
  }

  const costDifference =
    entry.unit_cost -
    entry.previous_unit_cost;
  const saleDifference =
    entry.sale_price -
    entry.previous_sale_price;

  if (
    costDifference > 0 ||
    saleDifference > 0
  ) {
    return "increase";
  }

  if (
    costDifference < 0 ||
    saleDifference < 0
  ) {
    return "decrease";
  }

  return "same";
}

export default function AdminPriceHistoryScreen() {
  const { activeCompany } = useCompany();
  const [history, setHistory] = useState<
    PricingHistoryItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>("all");

  const load = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) {
        setHistory([]);
        setLoading(false);
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await listPricingHistory(
        activeCompany.id,
      );

      if (result.error) {
        Alert.alert(
          "No fue posible cargar el historial",
          result.error,
        );
      } else {
        setHistory(result.history);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeCompany) return;

    return subscribeToPricing(
      activeCompany.id,
      () => {
        void load(true);
      },
    );
  }, [activeCompany, load]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return history.filter((entry) => {
      const direction =
        getChangeDirection(entry);

      if (
        filter !== "all" &&
        direction !== filter
      ) {
        return false;
      }

      if (!query) return true;

      return [
        entry.item?.name ?? "",
        entry.item?.sku ?? "",
        entry.changed_by_name ?? "",
        entry.source ?? "",
        entry.notes ?? "",
      ].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [filter, history, search]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back-outline"
                  size={22}
                  color={colors.textLight}
                />
              </Pressable>

              <Text style={styles.title}>
                Historial de precios
              </Text>
              <Text style={styles.subtitle}>
                {activeCompany?.name ?? ""}
              </Text>
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
                placeholder="Buscar producto, usuario o nota"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((option) => {
                const active =
                  filter === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      setFilter(option.value)
                    }
                    style={[
                      styles.filterChip,
                      active &&
                        styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active &&
                          styles.filterTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.counter}>
              {filteredHistory.length} registro
              {filteredHistory.length === 1
                ? ""
                : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={45}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              Sin historial
            </Text>
            <Text style={styles.emptyText}>
              Los próximos cambios de precio aparecerán aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryCard entry={item} />
        )}
      />
    </SafeAreaView>
  );
}

function HistoryCard({
  entry,
}: {
  entry: PricingHistoryItem;
}) {
  const direction = getChangeDirection(entry);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.changeIcon,
            direction === "increase" &&
              styles.increaseIcon,
            direction === "decrease" &&
              styles.decreaseIcon,
          ]}
        >
          <Ionicons
            name={
              direction === "increase"
                ? "trending-up-outline"
                : direction === "decrease"
                  ? "trending-down-outline"
                  : "pricetag-outline"
            }
            size={21}
            color={
              direction === "increase"
                ? colors.warning
                : direction === "decrease"
                  ? colors.info
                  : colors.primary
            }
          />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>
            {entry.item?.name ??
              "Elemento eliminado"}
          </Text>
          <Text style={styles.date}>
            {formatDate(entry.effective_at)}
          </Text>
        </View>

        <Text style={styles.actor}>
          {entry.changed_by_name ??
            "Sistema"}
        </Text>
      </View>

      <View style={styles.values}>
        <HistoryValue
          label="Costo"
          previous={entry.previous_unit_cost}
          current={entry.unit_cost}
        />
        <HistoryValue
          label="Venta"
          previous={entry.previous_sale_price}
          current={entry.sale_price}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.source}>
          {entry.source ??
            "actualización del catálogo"}
        </Text>

        {entry.item?.unit ? (
          <Text style={styles.unit}>
            {entry.item.unit.symbol}
          </Text>
        ) : null}
      </View>

      {entry.notes ? (
        <Text style={styles.notes}>
          {entry.notes}
        </Text>
      ) : null}
    </View>
  );
}

function HistoryValue({
  label,
  previous,
  current,
}: {
  label: string;
  previous: number | null;
  current: number;
}) {
  const difference =
    previous === null
      ? null
      : current - previous;

  return (
    <View style={styles.valueBlock}>
      <Text style={styles.valueLabel}>
        {label}
      </Text>

      <View style={styles.valueLine}>
        {previous !== null ? (
          <>
            <Text style={styles.previousValue}>
              {formatMoney(previous)}
            </Text>
            <Ionicons
              name="arrow-forward-outline"
              size={14}
              color={colors.textSecondary}
            />
          </>
        ) : null}

        <Text style={styles.currentValue}>
          {formatMoney(current)}
        </Text>
      </View>

      {difference !== null &&
      difference !== 0 ? (
        <Text
          style={[
            styles.difference,
            difference > 0
              ? styles.increaseText
              : styles.decreaseText,
          ]}
        >
          {difference > 0 ? "+" : ""}
          {formatMoney(difference)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingBottom: 32,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 25,
    backgroundColor: colors.surfaceDark,
  },

  backButton: {
    width: 42,
    height: 42,
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: colors.textLight,
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 13,
  },

  searchBox: {
    marginHorizontal: 20,
    marginTop: 20,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  filters: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  filterTextActive: {
    color: colors.primaryDark,
  },

  counter: {
    marginHorizontal: 20,
    marginTop: 13,
    marginBottom: 6,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  card: {
    marginHorizontal: 20,
    marginTop: 11,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  changeIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  increaseIcon: {
    backgroundColor: "#FFFBEB",
  },

  decreaseIcon: {
    backgroundColor: "#EFF6FF",
  },

  itemInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  itemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  date: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 10,
  },

  actor: {
    maxWidth: 90,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "right",
  },

  values: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    gap: 12,
  },

  valueBlock: {
    flex: 1,
  },

  valueLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  valueLine: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  previousValue: {
    color: colors.textSecondary,
    fontSize: 11,
    textDecorationLine: "line-through",
  },

  currentValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },

  difference: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "800",
  },

  increaseText: {
    color: colors.warning,
  },

  decreaseText: {
    color: colors.info,
  },

  footer: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  source: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 10,
  },

  unit: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
  },

  notes: {
    marginTop: 9,
    padding: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  empty: {
    padding: 50,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  emptyText: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});
