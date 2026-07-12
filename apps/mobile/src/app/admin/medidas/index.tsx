import { Ionicons } from "@expo/vector-icons";
import { type Href, router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  convertMeasurement,
  createMeasurementUnit,
  listMeasurementUnits,
  setMeasurementUnitActive,
  updateMeasurementUnit,
} from "@/services/measurements-service";
import type { Unit, UnitType } from "@/types/catalog";
import { formatDecimal } from "@/utils/number-format";

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "length", label: "Longitud" },
  { value: "area", label: "Área" },
  { value: "volume", label: "Volumen" },
  { value: "weight", label: "Peso" },
  { value: "unit", label: "Unidad" },
  { value: "time", label: "Tiempo" },
  { value: "package", label: "Empaque" },
  { value: "service", label: "Servicio" },
];

function typeLabel(type: UnitType): string {
  return UNIT_TYPES.find((item) => item.value === type)?.label ?? type;
}

function toNumber(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AdminMeasurementsScreen() {
  const { activeCompany } = useCompany();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<UnitType | "all">("all");
  const [editing, setEditing] = useState<Unit | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const activeUnits = useMemo(
    () => units.filter((unit) => unit.active),
    [units],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return units.filter((unit) => {
      const matchesType = filter === "all" || unit.unit_type === filter;
      const matchesSearch =
        !query ||
        unit.name.toLowerCase().includes(query) ||
        unit.code.toLowerCase().includes(query) ||
        unit.symbol.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [filter, search, units]);

  const source = activeUnits.find((unit) => unit.id === sourceId) ?? null;
  const compatible = source
    ? activeUnits.filter((unit) => unit.unit_type === source.unit_type)
    : activeUnits;
  const target = compatible.find((unit) => unit.id === targetId) ?? null;
  const result =
    source && target
      ? convertMeasurement(toNumber(quantity), source, target)
      : null;

  const load = useCallback(
    async (refresh = false) => {
      if (!activeCompany) return;
      refresh ? setRefreshing(true) : setLoading(true);

      const response = await listMeasurementUnits(activeCompany.id);

      if (response.error) {
        Alert.alert("No fue posible cargar las medidas", response.error);
      } else {
        setUnits(response.units);
        const available = response.units.filter((unit) => unit.active);
        const first = available[0] ?? null;
        setSourceId((current) =>
          available.some((unit) => unit.id === current)
            ? current
            : first?.id ?? null,
        );
        setTargetId((current) =>
          available.some((unit) => unit.id === current)
            ? current
            : available.find(
                (unit) =>
                  unit.unit_type === first?.unit_type &&
                  unit.id !== first?.id,
              )?.id ?? first?.id ?? null,
        );
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

  function chooseSource(id: string) {
    const next = activeUnits.find((unit) => unit.id === id);
    if (!next) return;
    setSourceId(id);
    const currentTarget = activeUnits.find((unit) => unit.id === targetId);
    if (currentTarget?.unit_type !== next.unit_type) {
      setTargetId(
        activeUnits.find(
          (unit) =>
            unit.unit_type === next.unit_type && unit.id !== next.id,
        )?.id ?? next.id,
      );
    }
  }

  async function toggle(unit: Unit) {
    if (!activeCompany) return;
    const active = !unit.active;

    Alert.alert(
      active ? "Reactivar unidad" : "Desactivar unidad",
      `¿Deseas ${active ? "reactivar" : "desactivar"} "${unit.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: active ? "Reactivar" : "Desactivar",
          style: active ? "default" : "destructive",
          onPress: async () => {
            const response = await setMeasurementUnitActive({
              companyId: activeCompany.id,
              unitId: unit.id,
              active,
            });
            if (response.error) {
              Alert.alert("No fue posible actualizar la unidad", response.error);
              return;
            }
            await load(true);
          },
        },
      ],
    );
  }

  if (!activeCompany) {
    return <View style={styles.center}><Text>No hay empresa activa.</Text></View>;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <Pressable
                  onPress={() => router.replace("/admin" as Href)}
                  style={styles.iconButton}
                >
                  <Ionicons name="arrow-back-outline" size={22} color={colors.textLight} />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setEditing(null);
                    setFormVisible(true);
                  }}
                  style={styles.newButton}
                >
                  <Ionicons name="add-outline" size={20} color={colors.textLight} />
                  <Text style={styles.newButtonText}>Nueva</Text>
                </Pressable>
              </View>
              <Text style={styles.title}>Medidas y unidades</Text>
              <Text style={styles.subtitle}>{activeCompany.name}</Text>
            </View>

            <View style={styles.stats}>
              <Stat label="Unidades" value={units.length} />
              <Stat label="Activas" value={activeUnits.length} />
              <Stat
                label="Tipos"
                value={new Set(activeUnits.map((unit) => unit.unit_type)).size}
              />
            </View>

            <View style={styles.converter}>
              <Text style={styles.cardTitle}>Conversor rápido</Text>
              <Text style={styles.cardHelp}>
                Convierte entre unidades activas del mismo tipo.
              </Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                placeholder="Cantidad"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
              <Text style={styles.fieldLabel}>Origen</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {activeUnits.map((unit) => (
                    <Chip
                      key={unit.id}
                      label={`${unit.symbol} · ${unit.name}`}
                      active={sourceId === unit.id}
                      onPress={() => chooseSource(unit.id)}
                    />
                  ))}
                </View>
              </ScrollView>
              <Text style={styles.fieldLabel}>Destino</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {compatible.map((unit) => (
                    <Chip
                      key={unit.id}
                      label={`${unit.symbol} · ${unit.name}`}
                      active={targetId === unit.id}
                      onPress={() => setTargetId(unit.id)}
                    />
                  ))}
                </View>
              </ScrollView>
              <View style={styles.result}>
                <Text style={styles.resultLabel}>Resultado</Text>
                <Text style={styles.resultValue}>
                  {result === null || !target
                    ? "—"
                    : `${formatDecimal(result, 4)} ${target.symbol}`}
                </Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar unidad, código o símbolo"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filters}>
                <Chip label="Todas" active={filter === "all"} onPress={() => setFilter("all")} />
                {UNIT_TYPES.map((item) => (
                  <Chip
                    key={item.value}
                    label={item.label}
                    active={filter === item.value}
                    onPress={() => setFilter(item.value)}
                  />
                ))}
              </View>
            </ScrollView>
            <Text style={styles.counter}>{filtered.length} unidades</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="resize-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No hay unidades</Text>
            <Text style={styles.emptyText}>
              Crea unidades para usarlas en el catálogo y las calculadoras.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.unitCard, !item.active && styles.inactiveCard]}>
            <View style={styles.unitTop}>
              <View style={styles.symbolBox}>
                <Text style={styles.symbol}>{item.symbol}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.unitName}>{item.name}</Text>
                <Text style={styles.unitMeta}>
                  {typeLabel(item.unit_type)} · Código: {item.code}
                </Text>
                <Text style={styles.factor}>
                  Factor base: {formatDecimal(item.conversion_factor, 6)}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  setEditing(item);
                  setFormVisible(true);
                }}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => void toggle(item)} style={styles.actionButton}>
                <Text style={styles.actionText}>
                  {item.active ? "Desactivar" : "Reactivar"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <UnitForm
        visible={formVisible}
        companyId={activeCompany.id}
        unit={editing}
        onClose={() => setFormVisible(false)}
        onSaved={() => void load(true)}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Chip({
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
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function UnitForm({
  visible,
  companyId,
  unit,
  onClose,
  onSaved,
}: {
  visible: boolean;
  companyId: string;
  unit: Unit | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("length");
  const [factor, setFactor] = useState("1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setCode(unit?.code ?? "");
    setName(unit?.name ?? "");
    setSymbol(unit?.symbol ?? "");
    setUnitType(unit?.unit_type ?? "length");
    setFactor(String(unit?.conversion_factor ?? 1));
  }, [unit, visible]);

  async function save() {
    setSaving(true);
    const input = {
      companyId,
      code,
      name,
      symbol,
      unitType,
      conversionFactor: toNumber(factor),
    };
    const response = unit
      ? await updateMeasurementUnit({ ...input, unitId: unit.id })
      : await createMeasurementUnit(input);
    setSaving(false);

    if (response.error) {
      Alert.alert("No fue posible guardar la unidad", response.error);
      return;
    }
    onClose();
    onSaved();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
          <Text style={styles.modalTitle}>
            {unit ? "Editar unidad" : "Nueva unidad"}
          </Text>
          <Pressable disabled={saving} onPress={() => void save()}>
            <Text style={styles.save}>{saving ? "Guardando" : "Guardar"}</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.fieldLabel}>Tipo</Text>
          <View style={styles.typeGrid}>
            {UNIT_TYPES.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                active={unitType === item.value}
                onPress={() => setUnitType(item.value)}
              />
            ))}
          </View>

          <Text style={styles.fieldLabel}>Código</Text>
          <TextInput value={code} onChangeText={setCode} style={styles.input} />
          <Text style={styles.fieldLabel}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
          <Text style={styles.fieldLabel}>Símbolo</Text>
          <TextInput value={symbol} onChangeText={setSymbol} style={styles.input} />
          <Text style={styles.fieldLabel}>Factor de conversión</Text>
          <TextInput
            value={factor}
            onChangeText={setFactor}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <View style={styles.help}>
            <Text style={styles.helpText}>
              El factor indica cuántas unidades base representa la medida.
              Ejemplo: metro = 1, centímetro = 0.01 y pie = 0.3048.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surfaceDark },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  content: { flexGrow: 1, paddingBottom: 40, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 26,
    backgroundColor: colors.surfaceDark,
  },
  headerRow: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
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
  newButtonText: { color: colors.textLight, fontWeight: "900" },
  title: { color: colors.textLight, fontSize: 27, fontWeight: "900" },
  subtitle: { marginTop: 5, color: "#94A3B8", fontSize: 14 },
  stats: { margin: 20, flexDirection: "row", gap: 10 },
  stat: {
    flex: 1,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "900" },
  statLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  converter: {
    marginHorizontal: 20,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  cardHelp: { marginTop: 3, color: colors.textSecondary, fontSize: 12 },
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
  },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: colors.textLight },
  result: {
    marginTop: 14,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  resultLabel: { color: colors.primaryDark, fontSize: 11, fontWeight: "700" },
  resultValue: { color: colors.primaryDark, fontSize: 20, fontWeight: "900" },
  searchBox: {
    marginHorizontal: 20,
    marginTop: 18,
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
  searchInput: { flex: 1, color: colors.text },
  filters: { flexDirection: "row", gap: 8, padding: 13, paddingHorizontal: 20 },
  counter: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  unitCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inactiveCard: { opacity: 0.65, backgroundColor: "#F8FAFC" },
  unitTop: { flexDirection: "row", gap: 13 },
  symbolBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { color: colors.primaryDark, fontSize: 17, fontWeight: "900" },
  flex: { flex: 1 },
  unitName: { color: colors.text, fontSize: 16, fontWeight: "900" },
  unitMeta: { marginTop: 4, color: colors.textSecondary, fontSize: 12 },
  factor: { marginTop: 5, color: colors.text, fontSize: 12, fontWeight: "700" },
  actions: { marginTop: 15, flexDirection: "row", gap: 9 },
  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { color: colors.primaryDark, fontSize: 12, fontWeight: "800" },
  empty: { alignItems: "center", padding: 50 },
  emptyTitle: { marginTop: 12, color: colors.text, fontSize: 17, fontWeight: "900" },
  emptyText: {
    marginTop: 6,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
  },
  modal: { flex: 1, backgroundColor: colors.background },
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
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  cancel: { color: colors.textSecondary, fontWeight: "700" },
  save: { color: colors.primary, fontWeight: "900" },
  form: { padding: 20, paddingBottom: 40 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  help: {
    marginTop: 20,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  helpText: { color: colors.primaryDark, fontSize: 12, lineHeight: 18 },
});
