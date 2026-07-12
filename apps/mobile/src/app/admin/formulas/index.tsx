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
  Modal,
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
  createAdminFormula,
  listAdminFormulas,
  listFormulaCatalogItems,
  listFormulaUnits,
  setAdminFormulaActive,
  updateAdminFormula,
  type FormulaCatalogItem,
} from "@/services/formulas-service";
import type {
  CatalogItemType,
  CatalogYield,
  Unit,
} from "@/types/catalog";
import { formatDecimal } from "@/utils/number-format";

type StatusFilter = "all" | "active" | "inactive";
type SelectorMode = "item" | "unit" | null;

type FormulaForm = {
  catalogItemId: string;
  outputUnitId: string;
  name: string;
  outputQuantity: string;
  laborHours: string;
  crewSize: string;
  wastePercentage: string;
  notes: string;
};

const EMPTY_FORM: FormulaForm = {
  catalogItemId: "",
  outputUnitId: "",
  name: "",
  outputQuantity: "1",
  laborHours: "1",
  crewSize: "1",
  wastePercentage: "0",
  notes: "",
};

function toNumber(value: string): number {
  const parsed = Number(value.trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function itemTypeLabel(type: CatalogItemType): string {
  const labels: Record<CatalogItemType, string> = {
    material: "Material",
    labor: "Mano de obra",
    equipment: "Equipo",
    service: "Servicio",
    subcontract: "Subcontrato",
  };

  return labels[type];
}

export default function AdminFormulasScreen() {
  const { activeCompany } = useCompany();
  const [formulas, setFormulas] = useState<CatalogYield[]>([]);
  const [items, setItems] = useState<FormulaCatalogItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [editing, setEditing] =
    useState<CatalogYield | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [selectorMode, setSelectorMode] =
    useState<SelectorMode>(null);

  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const unitMap = useMemo(
    () => new Map(units.map((unit) => [unit.id, unit])),
    [units],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return formulas.filter((formula) => {
      if (statusFilter === "active" && !formula.active) {
        return false;
      }

      if (statusFilter === "inactive" && formula.active) {
        return false;
      }

      if (!query) return true;

      const itemName =
        itemMap.get(formula.catalog_item_id)?.name ?? "";
      const unitName =
        unitMap.get(formula.output_unit_id)?.name ?? "";

      return (
        formula.name.toLowerCase().includes(query) ||
        itemName.toLowerCase().includes(query) ||
        unitName.toLowerCase().includes(query) ||
        (formula.notes ?? "").toLowerCase().includes(query)
      );
    });
  }, [formulas, itemMap, search, statusFilter, unitMap]);

  const activeCount = useMemo(
    () => formulas.filter((formula) => formula.active).length,
    [formulas],
  );

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [formulaResult, itemResult, unitResult] =
        await Promise.all([
          listAdminFormulas(activeCompany.id),
          listFormulaCatalogItems(activeCompany.id),
          listFormulaUnits(activeCompany.id),
        ]);

      const error =
        formulaResult.error ??
        itemResult.error ??
        unitResult.error;

      if (error) {
        Alert.alert(
          "No fue posible cargar las fórmulas",
          error,
        );
      } else {
        setFormulas(formulaResult.formulas);
        setItems(itemResult.items);
        setUnits(unitResult.units);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  function openCreate() {
    setEditing(null);
    setFormVisible(true);
  }

  function openEdit(formula: CatalogYield) {
    setEditing(formula);
    setFormVisible(true);
  }

  function toggleFormula(formula: CatalogYield) {
    if (!activeCompany) return;

    const nextActive = !formula.active;

    Alert.alert(
      nextActive ? "Reactivar fórmula" : "Desactivar fórmula",
      `¿Deseas ${
        nextActive ? "reactivar" : "desactivar"
      } "${formula.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: nextActive ? "Reactivar" : "Desactivar",
          style: nextActive ? "default" : "destructive",
          onPress: async () => {
            const result = await setAdminFormulaActive({
              companyId: activeCompany.id,
              formulaId: formula.id,
              active: nextActive,
            });

            if (result.error) {
              Alert.alert(
                "No fue posible actualizar la fórmula",
                result.error,
              );
              return;
            }

            await loadData(true);
          },
        },
      ],
    );
  }

  if (!activeCompany) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>
          No hay empresa activa
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(formula) => formula.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadData(true)}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Pressable
                  onPress={() =>
                    router.replace("/admin" as Href)
                  }
                  style={styles.backButton}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={22}
                    color={colors.textLight}
                  />
                </Pressable>

                <Pressable
                  onPress={openCreate}
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
                Fórmulas y rendimientos
              </Text>
              <Text style={styles.subtitle}>
                {activeCompany.name}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <SummaryCard
                label="Fórmulas"
                value={String(formulas.length)}
              />
              <SummaryCard
                label="Activas"
                value={String(activeCount)}
              />
              <SummaryCard
                label="Inactivas"
                value={String(formulas.length - activeCount)}
              />
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name="analytics-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.infoText}>
                Define cuánto produce una cuadrilla, en cuánto
                tiempo y con qué porcentaje de desperdicio.
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
                placeholder="Buscar fórmula o elemento"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <View style={styles.filters}>
              <FilterChip
                label="Todas"
                active={statusFilter === "all"}
                onPress={() => setStatusFilter("all")}
              />
              <FilterChip
                label="Activas"
                active={statusFilter === "active"}
                onPress={() => setStatusFilter("active")}
              />
              <FilterChip
                label="Inactivas"
                active={statusFilter === "inactive"}
                onPress={() => setStatusFilter("inactive")}
              />
            </View>

            <Text style={styles.counter}>
              {filtered.length} fórmula
              {filtered.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="calculator-outline"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>
              No hay fórmulas
            </Text>
            <Text style={styles.emptyText}>
              Crea un rendimiento para relacionar producción,
              tiempo, cuadrilla y desperdicio.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <FormulaCard
            formula={item}
            catalogItem={
              itemMap.get(item.catalog_item_id) ?? null
            }
            unit={unitMap.get(item.output_unit_id) ?? null}
            onEdit={() => openEdit(item)}
            onToggle={() => toggleFormula(item)}
          />
        )}
      />

      <FormulaFormModal
        visible={formVisible}
        companyId={activeCompany.id}
        formula={editing}
        items={items}
        units={units}
        selectorMode={selectorMode}
        onSetSelectorMode={setSelectorMode}
        onClose={() => {
          setSelectorMode(null);
          setFormVisible(false);
        }}
        onSaved={() => void loadData(true)}
      />
    </SafeAreaView>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        active && styles.filterChipActive,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          active && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FormulaCard({
  formula,
  catalogItem,
  unit,
  onEdit,
  onToggle,
}: {
  formula: CatalogYield;
  catalogItem: FormulaCatalogItem | null;
  unit: Unit | null;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const productionPerHour =
    formula.labor_hours > 0
      ? formula.output_quantity / formula.labor_hours
      : null;

  const workerHoursPerUnit =
    formula.output_quantity > 0
      ? (formula.labor_hours * formula.crew_size) /
        formula.output_quantity
      : null;

  return (
    <View
      style={[
        styles.formulaCard,
        !formula.active && styles.inactiveCard,
      ]}
    >
      <View style={styles.formulaTop}>
        <View style={styles.formulaIcon}>
          <Ionicons
            name="speedometer-outline"
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={styles.formulaName}>
              {formula.name}
            </Text>
            {!formula.active ? (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>
                  INACTIVA
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.formulaItem}>
            {catalogItem?.name ?? "Elemento no disponible"}
          </Text>
          <Text style={styles.formulaType}>
            {catalogItem
              ? itemTypeLabel(catalogItem.item_type)
              : "Sin clasificación"}
          </Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        <Metric
          label="Producción"
          value={`${formatDecimal(
            formula.output_quantity,
            3,
          )} ${unit?.symbol ?? ""}`}
        />
        <Metric
          label="Tiempo"
          value={`${formatDecimal(
            formula.labor_hours,
            2,
          )} h`}
        />
        <Metric
          label="Cuadrilla"
          value={`${formatDecimal(
            formula.crew_size,
            0,
          )} pers.`}
        />
        <Metric
          label="Desperdicio"
          value={`${formatDecimal(
            formula.waste_percentage,
            2,
          )} %`}
        />
      </View>

      <View style={styles.productivityBox}>
        <View style={styles.flex}>
          <Text style={styles.productivityLabel}>
            Producción por hora
          </Text>
          <Text style={styles.productivityValue}>
            {productionPerHour === null
              ? "No calculable"
              : `${formatDecimal(
                  productionPerHour,
                  3,
                )} ${unit?.symbol ?? ""}/h`}
          </Text>
        </View>

        <View style={styles.flex}>
          <Text style={styles.productivityLabel}>
            Horas-hombre por unidad
          </Text>
          <Text style={styles.productivityValue}>
            {workerHoursPerUnit === null
              ? "No calculable"
              : formatDecimal(workerHoursPerUnit, 4)}
          </Text>
        </View>
      </View>

      {formula.notes ? (
        <Text style={styles.notes}>{formula.notes}</Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={onEdit}
          style={styles.editButton}
        >
          <Ionicons
            name="create-outline"
            size={17}
            color={colors.primary}
          />
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>

        <Pressable
          onPress={onToggle}
          style={[
            styles.editButton,
            formula.active && styles.deactivateButton,
          ]}
        >
          <Ionicons
            name={
              formula.active
                ? "pause-circle-outline"
                : "play-circle-outline"
            }
            size={17}
            color={
              formula.active ? "#B91C1C" : colors.primary
            }
          />
          <Text
            style={[
              styles.editButtonText,
              formula.active && styles.deactivateText,
            ]}
          >
            {formula.active ? "Desactivar" : "Reactivar"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function FormulaFormModal({
  visible,
  companyId,
  formula,
  items,
  units,
  selectorMode,
  onSetSelectorMode,
  onClose,
  onSaved,
}: {
  visible: boolean;
  companyId: string;
  formula: CatalogYield | null;
  items: FormulaCatalogItem[];
  units: Unit[];
  selectorMode: SelectorMode;
  onSetSelectorMode: (mode: SelectorMode) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] =
    useState<FormulaForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectorSearch, setSelectorSearch] =
    useState("");

  useEffect(() => {
    if (!visible) return;

    setForm(
      formula
        ? {
            catalogItemId: formula.catalog_item_id,
            outputUnitId: formula.output_unit_id,
            name: formula.name,
            outputQuantity: String(formula.output_quantity),
            laborHours: String(formula.labor_hours),
            crewSize: String(formula.crew_size),
            wastePercentage: String(
              formula.waste_percentage,
            ),
            notes: formula.notes ?? "",
          }
        : EMPTY_FORM,
    );
    setSelectorSearch("");
  }, [formula, visible]);

  const selectedItem = items.find(
    (item) => item.id === form.catalogItemId,
  );
  const selectedUnit = units.find(
    (unit) => unit.id === form.outputUnitId,
  );

  const selectorOptions = useMemo(() => {
    const query = selectorSearch.trim().toLowerCase();

    if (selectorMode === "item") {
      return items.filter(
        (item) =>
          !query || item.name.toLowerCase().includes(query),
      );
    }

    if (selectorMode === "unit") {
      return units.filter(
        (unit) =>
          !query ||
          unit.name.toLowerCase().includes(query) ||
          unit.symbol.toLowerCase().includes(query),
      );
    }

    return [];
  }, [items, selectorMode, selectorSearch, units]);

  async function save() {
    const input = {
      companyId,
      catalogItemId: form.catalogItemId,
      outputUnitId: form.outputUnitId,
      name: form.name,
      outputQuantity: toNumber(form.outputQuantity),
      laborHours: toNumber(form.laborHours),
      crewSize: toNumber(form.crewSize),
      wastePercentage: toNumber(form.wastePercentage),
      notes: form.notes,
    };

    setSaving(true);

    const result = formula
      ? await updateAdminFormula({
          ...input,
          formulaId: formula.id,
        })
      : await createAdminFormula(input);

    setSaving(false);

    if (result.error) {
      Alert.alert(
        "No fue posible guardar la fórmula",
        result.error,
      );
      return;
    }

    onClose();
    onSaved();
  }

  function updateField(
    field: keyof FormulaForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalRoot}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
          <Text style={styles.modalTitle}>
            {formula ? "Editar fórmula" : "Nueva fórmula"}
          </Text>
          <Pressable
            disabled={saving}
            onPress={() => void save()}
          >
            <Text style={styles.saveText}>
              {saving ? "Guardando" : "Guardar"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.fieldLabel}>
            Elemento del catálogo
          </Text>
          <SelectButton
            value={
              selectedItem
                ? `${selectedItem.name} · ${itemTypeLabel(
                    selectedItem.item_type,
                  )}`
                : "Seleccionar elemento"
            }
            onPress={() => onSetSelectorMode("item")}
          />

          <Text style={styles.fieldLabel}>
            Nombre de la fórmula
          </Text>
          <TextInput
            value={form.name}
            onChangeText={(value) => updateField("name", value)}
            placeholder="Ejemplo: Instalación estándar"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>
            Unidad de producción
          </Text>
          <SelectButton
            value={
              selectedUnit
                ? `${selectedUnit.name} (${selectedUnit.symbol})`
                : "Seleccionar unidad"
            }
            onPress={() => onSetSelectorMode("unit")}
          />

          <View style={styles.twoColumns}>
            <NumberField
              label="Producción"
              value={form.outputQuantity}
              onChangeText={(value) =>
                updateField("outputQuantity", value)
              }
            />
            <NumberField
              label="Horas"
              value={form.laborHours}
              onChangeText={(value) =>
                updateField("laborHours", value)
              }
            />
          </View>

          <View style={styles.twoColumns}>
            <NumberField
              label="Cuadrilla"
              value={form.crewSize}
              onChangeText={(value) =>
                updateField("crewSize", value)
              }
            />
            <NumberField
              label="Desperdicio %"
              value={form.wastePercentage}
              onChangeText={(value) =>
                updateField("wastePercentage", value)
              }
            />
          </View>

          <Text style={styles.fieldLabel}>Notas</Text>
          <TextInput
            value={form.notes}
            onChangeText={(value) => updateField("notes", value)}
            multiline
            textAlignVertical="top"
            placeholder="Condiciones, alcance o supuestos"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.notesInput]}
          />

          <View style={styles.helpCard}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={colors.primary}
            />
            <Text style={styles.helpText}>
              Ejemplo: una cuadrilla de 2 personas produce 20 m²
              en 8 horas. Esto equivale a 2.5 m² por hora y 0.8
              horas-hombre por m².
            </Text>
          </View>
        </ScrollView>

        <Modal
          visible={Boolean(selectorMode)}
          transparent
          animationType="fade"
          onRequestClose={() => onSetSelectorMode(null)}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => onSetSelectorMode(null)}
          >
            <Pressable style={styles.selectorModal}>
              <View style={styles.selectorHeader}>
                <Text style={styles.selectorTitle}>
                  {selectorMode === "item"
                    ? "Seleccionar elemento"
                    : "Seleccionar unidad"}
                </Text>
                <Pressable
                  onPress={() => onSetSelectorMode(null)}
                >
                  <Ionicons
                    name="close-outline"
                    size={25}
                    color={colors.text}
                  />
                </Pressable>
              </View>

              <TextInput
                value={selectorSearch}
                onChangeText={setSelectorSearch}
                placeholder="Buscar"
                placeholderTextColor="#94A3B8"
                style={styles.selectorSearch}
              />

              <ScrollView style={styles.selectorList}>
                {selectorMode === "item"
                  ? (selectorOptions as FormulaCatalogItem[]).map(
                      (item) => (
                        <SelectorRow
                          key={item.id}
                          title={item.name}
                          subtitle={`${itemTypeLabel(
                            item.item_type,
                          )}${item.active ? "" : " · Inactivo"}`}
                          selected={
                            item.id === form.catalogItemId
                          }
                          onPress={() => {
                            updateField("catalogItemId", item.id);
                            onSetSelectorMode(null);
                          }}
                        />
                      ),
                    )
                  : (selectorOptions as Unit[]).map((unit) => (
                      <SelectorRow
                        key={unit.id}
                        title={`${unit.name} (${unit.symbol})`}
                        subtitle={`${unit.unit_type}${
                          unit.active ? "" : " · Inactiva"
                        }`}
                        selected={unit.id === form.outputUnitId}
                        onPress={() => {
                          updateField("outputUnitId", unit.id);
                          onSetSelectorMode(null);
                        }}
                      />
                    ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}

function SelectButton({
  value,
  onPress,
}: {
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.selectButton}>
      <Text numberOfLines={1} style={styles.selectButtonText}>
        {value}
      </Text>
      <Ionicons
        name="chevron-down-outline"
        size={20}
        color={colors.textSecondary}
      />
    </Pressable>
  );
}

function NumberField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.column}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />
    </View>
  );
}

function SelectorRow({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.selectorRow,
        selected && styles.selectorRowSelected,
      ]}
    >
      <View style={styles.flex}>
        <Text style={styles.selectorRowTitle}>{title}</Text>
        <Text style={styles.selectorRowSubtitle}>
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={colors.primary}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 26,
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
    paddingHorizontal: 15,
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
    fontSize: 27,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 14,
  },
  summaryRow: {
    marginHorizontal: 20,
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  summaryLabel: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 18,
  },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  counter: {
    marginHorizontal: 20,
    marginTop: 13,
    marginBottom: 7,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  formulaCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: "#F8FAFC",
  },
  formulaTop: {
    flexDirection: "row",
    gap: 13,
  },
  formulaIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },
  formulaName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  formulaItem: {
    marginTop: 4,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  formulaType: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 11,
  },
  inactiveBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },
  inactiveBadgeText: {
    color: "#475569",
    fontSize: 8,
    fontWeight: "900",
  },
  metricGrid: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metric: {
    width: "48%",
    flexGrow: 1,
    padding: 11,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },
  metricValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  productivityBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    gap: 12,
  },
  productivityLabel: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: "700",
  },
  productivityValue: {
    marginTop: 3,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  notes: {
    marginTop: 11,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 9,
  },
  editButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  editButtonText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  deactivateButton: {
    backgroundColor: "#FEE2E2",
  },
  deactivateText: {
    color: "#B91C1C",
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    minHeight: 58,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },
  saveText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    marginTop: 14,
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    minHeight: 49,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
  },
  selectButton: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectButtonText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },
  column: {
    flex: 1,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 13,
  },
  helpCard: {
    marginTop: 20,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  helpText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 12,
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectorModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "78%",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  selectorHeader: {
    padding: 17,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  selectorSearch: {
    margin: 12,
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  selectorList: {
    flexGrow: 0,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  selectorRow: {
    minHeight: 58,
    padding: 11,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectorRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  selectorRowTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  selectorRowSubtitle: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 11,
  },
  flex: {
    flex: 1,
  },
});
