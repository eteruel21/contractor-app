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

import {
  getUnitTypeLabel,
} from "@/components/admin/UnitForm";
import { UnitConverter } from "@/components/admin/UnitConverter";
import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import {
  listAdminUnits,
  setAdminUnitActive,
  subscribeToAdminUnits,
  type UnitWithUsage,
} from "@/services/measurements-service";
import type {
  UnitType,
} from "@/types/catalog";

type Filter = "all" | "active" | "inactive";

const FILTERS: {
  value: Filter;
  label: string;
}[] = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "inactive", label: "Inactivas" },
];

export default function AdminMeasurementsScreen() {
  const { activeCompany } = useCompany();
  const [units, setUnits] = useState<
    UnitWithUsage[]
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
        setUnits([]);
        setLoading(false);
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await listAdminUnits(
        activeCompany.id,
      );

      if (result.error) {
        Alert.alert(
          "No fue posible cargar las unidades",
          result.error,
        );
      } else {
        setUnits(result.units);
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

    return subscribeToAdminUnits(
      activeCompany.id,
      () => {
        void load(true);
      },
    );
  }, [activeCompany, load]);

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase();

    return units.filter((unit) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && unit.active) ||
        (filter === "inactive" && !unit.active);

      if (!matchesFilter) return false;
      if (!query) return true;

      return [
        unit.name,
        unit.code,
        unit.symbol,
        getUnitTypeLabel(unit.unit_type),
      ].some((value) =>
        value.toLowerCase().includes(query),
      );
    });
  }, [filter, search, units]);

  const summary = useMemo(() => {
    const active = units.filter(
      (unit) => unit.active,
    ).length;
    const types = new Set<UnitType>(
      units
        .filter((unit) => unit.active)
        .map((unit) => unit.unit_type),
    ).size;
    const used = units.filter(
      (unit) => unit.usage.total > 0,
    ).length;

    return {
      total: units.length,
      active,
      types,
      used,
    };
  }, [units]);

  async function toggleActive(
    unit: UnitWithUsage,
  ) {
    if (!activeCompany) return;

    const nextActive = !unit.active;

    Alert.alert(
      nextActive
        ? "Restaurar unidad"
        : "Desactivar unidad",
      nextActive
        ? `¿Deseas restaurar "${unit.name}"?`
        : `¿Deseas desactivar "${unit.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: nextActive
            ? "Restaurar"
            : "Desactivar",
          style: nextActive
            ? "default"
            : "destructive",
          onPress: async () => {
            const result =
              await setAdminUnitActive({
                companyId: activeCompany.id,
                unitId: unit.id,
                active: nextActive,
              });

            if (result.error) {
              Alert.alert(
                "No fue posible actualizar la unidad",
                result.error,
              );
              return;
            }

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
        data={filteredUnits}
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

                <Pressable
                  onPress={() =>
                    router.push(
                      "/admin/medidas/nueva" as Href,
                    )
                  }
                  style={styles.newButton}
                >
                  <Ionicons
                    name="add-outline"
                    size={20}
                    color={colors.textLight}
                  />
                  <Text style={styles.newButtonText}>
                    Nueva
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.title}>
                Medidas y unidades
              </Text>
              <Text style={styles.subtitle}>
                {activeCompany.name} · catálogo y cálculos
              </Text>
            </View>

            <View style={styles.stats}>
              <Stat
                label="Total"
                value={summary.total}
              />
              <Stat
                label="Activas"
                value={summary.active}
              />
              <Stat
                label="Tipos"
                value={summary.types}
              />
              <Stat
                label="En uso"
                value={summary.used}
              />
            </View>

            <UnitConverter units={units} />

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={colors.textSecondary}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar nombre, código, símbolo o tipo"
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
              {filteredUnits.length} unidad
              {filteredUnits.length === 1 ? "" : "es"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="resize-outline"
              size={45}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              No hay unidades
            </Text>
            <Text style={styles.emptyText}>
              Crea la primera unidad para utilizarla en el catálogo.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UnitCard
            unit={item}
            onOpen={() =>
              router.push(
                `/admin/medidas/${item.id}` as Href,
              )
            }
            onToggleActive={() =>
              void toggleActive(item)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

function UnitCard({
  unit,
  onOpen,
  onToggleActive,
}: {
  unit: UnitWithUsage;
  onOpen: () => void;
  onToggleActive: () => void;
}) {
  return (
    <Pressable
      onPress={onOpen}
      style={[
        styles.card,
        !unit.active && styles.inactive,
      ]}
    >
      <View style={styles.symbolBox}>
        <Text style={styles.symbol}>
          {unit.symbol}
        </Text>
      </View>

      <View style={styles.unitInfo}>
        <Text style={styles.unitName}>
          {unit.name}
        </Text>
        <Text style={styles.unitMeta}>
          {getUnitTypeLabel(unit.unit_type)}
          {" · "}
          {unit.code}
          {" · factor "}
          {unit.conversion_factor}
        </Text>

        <Text style={styles.usage}>
          {unit.usage.total > 0
            ? `Usada en ${unit.usage.catalogItems} elemento(s) y ${unit.usage.catalogYields} rendimiento(s)`
            : "Sin uso actual"}
        </Text>
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          onToggleActive();
        }}
        style={styles.action}
      >
        <Ionicons
          name={
            unit.active
              ? "archive-outline"
              : "refresh-outline"
          }
          size={20}
          color={
            unit.active
              ? colors.danger
              : colors.primary
          }
        />
      </Pressable>
    </Pressable>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>
        {label}
      </Text>
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

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  newButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  newButtonText: {
    color: colors.textLight,
    fontSize: 13,
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
    minHeight: 70,
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
    minHeight: 85,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  inactive: {
    opacity: 0.62,
  },

  symbolBox: {
    minWidth: 50,
    height: 50,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  symbol: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "900",
  },

  unitInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  unitName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  unitMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 10,
  },

  usage: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 9,
  },

  action: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
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
    lineHeight: 19,
    textAlign: "center",
  },
});
