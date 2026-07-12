import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  useFocusEffect,
} from "expo-router";
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

import { BulkPriceAdjustmentModal } from "@/components/admin/BulkPriceAdjustmentModal";
import { PricingEditorModal } from "@/components/admin/PricingEditorModal";
import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import {
  adjustCatalogPrices,
  listPricingItems,
  subscribeToPricing,
  updateCatalogPricing,
} from "@/services/pricing-service";
import { formatMoney } from "@/types/budget";
import type {
  CatalogItemWithDetails,
} from "@/types/catalog";

type Filter =
  | "all"
  | "without-price"
  | "low-margin"
  | "negative-margin";

const FILTERS: {
  value: Filter;
  label: string;
}[] = [
  { value: "all", label: "Todos" },
  {
    value: "without-price",
    label: "Sin precio",
  },
  {
    value: "low-margin",
    label: "Margen menor a 20%",
  },
  {
    value: "negative-margin",
    label: "Con pérdida",
  },
];

function getMargin(
  item: CatalogItemWithDetails,
): number {
  if (item.sale_price <= 0) return 0;

  return (
    ((item.sale_price - item.unit_cost) /
      item.sale_price) *
    100
  );
}

export default function AdminPricesScreen() {
  const { activeCompany } = useCompany();
  const [items, setItems] = useState<
    CatalogItemWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>("all");
  const [editingItem, setEditingItem] =
    useState<CatalogItemWithDetails | null>(
      null,
    );
  const [bulkVisible, setBulkVisible] =
    useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) {
        setItems([]);
        setLoading(false);
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await listPricingItems(
        activeCompany.id,
      );

      if (result.error) {
        Alert.alert(
          "No fue posible cargar los precios",
          result.error,
        );
      } else {
        setItems(result.items);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (!activeCompany) return;

    return subscribeToPricing(
      activeCompany.id,
      () => {
        void load(true);
      },
    );
  }, [activeCompany, load]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const margin = getMargin(item);
      const matchesFilter =
        filter === "all" ||
        (filter === "without-price" &&
          item.sale_price <= 0) ||
        (filter === "low-margin" &&
          item.sale_price > 0 &&
          margin >= 0 &&
          margin < 20) ||
        (filter === "negative-margin" &&
          item.sale_price > 0 &&
          margin < 0);

      if (!matchesFilter) return false;
      if (!query) return true;

      return [
        item.name,
        item.sku ?? "",
        item.category?.name ?? "",
        item.unit?.name ?? "",
      ].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [filter, items, search]);

  const summary = useMemo(() => {
    const withoutPrice = items.filter(
      (item) => item.sale_price <= 0,
    ).length;
    const lowMargin = items.filter((item) => {
      const margin = getMargin(item);

      return (
        item.sale_price > 0 &&
        margin >= 0 &&
        margin < 20
      );
    }).length;
    const losses = items.filter(
      (item) =>
        item.sale_price > 0 &&
        getMargin(item) < 0,
    ).length;

    return {
      total: items.length,
      withoutPrice,
      lowMargin,
      losses,
    };
  }, [items]);

  async function savePrice(input: {
    unitCost: number;
    salePrice: number;
    wastePercentage: number;
    notes: string;
  }) {
    if (
      !activeCompany ||
      !editingItem ||
      saving
    ) {
      return;
    }

    setSaving(true);

    const result = await updateCatalogPricing({
      companyId: activeCompany.id,
      itemId: editingItem.id,
      unitCost: input.unitCost,
      salePrice: input.salePrice,
      wastePercentage:
        input.wastePercentage,
      source: "panel_administrativo",
      notes: input.notes,
    });

    setSaving(false);

    if (result.error) {
      Alert.alert(
        "No fue posible actualizar el precio",
        result.error,
      );
      return;
    }

    setEditingItem(null);
    await load(true);
  }

  function confirmBulkAdjustment(input: {
    target: "unit_cost" | "sale_price";
    percentage: number;
    notes: string;
  }) {
    if (!activeCompany || saving) return;

    const itemIds = filteredItems.map(
      (item) => item.id,
    );

    if (itemIds.length === 0) {
      Alert.alert(
        "Sin elementos",
        "El filtro actual no contiene elementos.",
      );
      return;
    }

    if (
      !Number.isFinite(input.percentage) ||
      input.percentage === 0 ||
      input.percentage <= -100
    ) {
      Alert.alert(
        "Porcentaje inválido",
        "Escribe un porcentaje distinto de cero y mayor que -100.",
      );
      return;
    }

    const targetLabel =
      input.target === "unit_cost"
        ? "el costo"
        : "el precio de venta";

    Alert.alert(
      "Confirmar ajuste masivo",
      `Se modificará ${targetLabel} en ${
        input.percentage
      }% para ${itemIds.length} elemento${
        itemIds.length === 1 ? "" : "s"
      }.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Aplicar",
          style: "destructive",
          onPress: async () => {
            setSaving(true);

            const result =
              await adjustCatalogPrices({
                companyId: activeCompany.id,
                itemIds,
                target: input.target,
                percentage:
                  input.percentage,
                notes: input.notes,
              });

            setSaving(false);

            if (result.error) {
              Alert.alert(
                "No fue posible aplicar el ajuste",
                result.error,
              );
              return;
            }

            setBulkVisible(false);
            await load(true);
          },
        },
      ],
    );
  }

  if (!activeCompany) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          No hay empresa activa
        </Text>
      </View>
    );
  }

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
        data={filteredItems}
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
              <View style={styles.headerTop}>
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

                <View style={styles.headerActions}>
                  <Pressable
                    onPress={() =>
                      router.push(
                        "/admin/precios/historial" as Href,
                      )
                    }
                    style={styles.secondaryButton}
                  >
                    <Ionicons
                      name="time-outline"
                      size={19}
                      color={colors.primary}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      setBulkVisible(true)
                    }
                    style={styles.bulkButton}
                  >
                    <Ionicons
                      name="trending-up-outline"
                      size={18}
                      color={colors.textLight}
                    />
                    <Text style={styles.bulkText}>
                      Ajuste %
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Text style={styles.title}>
                Control de precios
              </Text>
              <Text style={styles.subtitle}>
                {activeCompany.name} · costos, ventas y márgenes
              </Text>
            </View>

            <View style={styles.stats}>
              <Stat
                label="Elementos"
                value={summary.total}
              />
              <Stat
                label="Sin precio"
                value={summary.withoutPrice}
                warning={
                  summary.withoutPrice > 0
                }
              />
              <Stat
                label="Margen bajo"
                value={summary.lowMargin}
                warning={summary.lowMargin > 0}
              />
              <Stat
                label="Con pérdida"
                value={summary.losses}
                danger={summary.losses > 0}
              />
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
                placeholder="Buscar producto, SKU o categoría"
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
              El ajuste masivo afectará los{" "}
              {filteredItems.length} elementos visibles
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="pricetags-outline"
              size={45}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              No hay precios
            </Text>
            <Text style={styles.emptyText}>
              No se encontraron elementos con este filtro.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PriceCard
            item={item}
            onEdit={() => setEditingItem(item)}
          />
        )}
      />

      <PricingEditorModal
        visible={Boolean(editingItem)}
        item={editingItem}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setEditingItem(null);
          }
        }}
        onSave={(input) =>
          void savePrice(input)
        }
      />

      <BulkPriceAdjustmentModal
        visible={bulkVisible}
        itemCount={filteredItems.length}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setBulkVisible(false);
          }
        }}
        onApply={confirmBulkAdjustment}
      />
    </SafeAreaView>
  );
}

function PriceCard({
  item,
  onEdit,
}: {
  item: CatalogItemWithDetails;
  onEdit: () => void;
}) {
  const utility =
    item.sale_price - item.unit_cost;
  const margin = getMargin(item);

  return (
    <Pressable
      onPress={onEdit}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.itemIcon}>
          <Ionicons
            name="pricetag-outline"
            size={21}
            color={colors.primary}
          />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>
            {item.name}
          </Text>
          <Text style={styles.itemMeta}>
            {item.category?.name ??
              "Sin categoría"}
            {item.unit
              ? ` · ${item.unit.symbol}`
              : ""}
          </Text>
        </View>

        <Ionicons
          name="create-outline"
          size={21}
          color={colors.info}
        />
      </View>

      <View style={styles.priceRow}>
        <PriceValue
          label="Costo"
          value={formatMoney(item.unit_cost)}
        />
        <PriceValue
          label="Venta"
          value={formatMoney(item.sale_price)}
        />
        <PriceValue
          label="Utilidad"
          value={formatMoney(utility)}
          danger={utility < 0}
        />
        <PriceValue
          label="Margen"
          value={`${margin.toFixed(1)}%`}
          danger={margin < 0}
          warning={
            margin >= 0 &&
            margin < 20 &&
            item.sale_price > 0
          }
        />
      </View>
    </Pressable>
  );
}

function PriceValue({
  label,
  value,
  danger = false,
  warning = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <View style={styles.priceBlock}>
      <Text style={styles.priceLabel}>
        {label}
      </Text>
      <Text
        style={[
          styles.priceValue,
          danger && styles.dangerText,
          warning && styles.warningText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function Stat({
  label,
  value,
  warning = false,
  danger = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text
        style={[
          styles.statValue,
          warning && styles.warningText,
          danger && styles.dangerText,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
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

  headerTop: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerActions: {
    flexDirection: "row",
    gap: 9,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  bulkButton: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  bulkText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "900",
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

  stats: {
    padding: 20,
    flexDirection: "row",
    gap: 8,
  },

  statCard: {
    flex: 1,
    minHeight: 72,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },

  statValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  statLabel: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  searchBox: {
    marginHorizontal: 20,
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

  itemIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
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

  itemMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
  },

  priceRow: {
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
  },

  priceBlock: {
    flex: 1,
  },

  priceLabel: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "700",
  },

  priceValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },

  warningText: {
    color: colors.warning,
  },

  dangerText: {
    color: colors.danger,
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
