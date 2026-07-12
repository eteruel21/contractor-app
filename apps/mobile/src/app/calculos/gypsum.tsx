import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView,
  Modal, Platform, Pressable, ScrollView, StyleSheet, Text,
  TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useCompany } from "../../contexts/CompanyContext";
import { addBudgetItem } from "../../services/budget-service";
import { listCatalogItems } from "../../services/catalog-service";
import type { CatalogItemWithDetails } from "../../types/catalog";
import {
  calculateGypsum, type GypsumBoardSides, type GypsumResult,
} from "../../utils/calculations";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type Target = "board" | "stud" | "track" | "screw" |
  "tape" | "compound" | "labor";

type Form = {
  wallLength: string; wallHeight: string; openingsArea: string;
  boardWidth: string; boardHeight: string; waste: string;
  studSpacing: string; studLength: string; trackLength: string;
  screwsPerBoard: string; screwsPerBox: string;
  tapePerM2: string; tapeRollLength: string;
  compoundPerM2: string; compoundPackageKg: string;
  boardPrice: string; studPrice: string; trackPrice: string;
  screwPrice: string; tapePrice: string; compoundPrice: string;
  laborPrice: string;
};

type Saved = Omit<Form, "wallLength" | "wallHeight" | "openingsArea"> & {
  sides: GypsumBoardSides;
};

const SETTINGS_KEY = "@contractor-pro/gypsum-settings";
const initial: Form = {
  wallLength: "", wallHeight: "", openingsArea: "0",
  boardWidth: "1.22", boardHeight: "2.44", waste: "10",
  studSpacing: "0.40", studLength: "3", trackLength: "3",
  screwsPerBoard: "40", screwsPerBox: "1000",
  tapePerM2: "1.5", tapeRollLength: "75",
  compoundPerM2: "0.6", compoundPackageKg: "28",
  boardPrice: "", studPrice: "", trackPrice: "",
  screwPrice: "", tapePrice: "", compoundPrice: "",
  laborPrice: "",
};

function number(value: string) {
  const result = Number(value.replace(",", ".").trim());
  return Number.isFinite(result) ? result : 0;
}

export default function GypsumScreen() {
  const params = useLocalSearchParams<{ budgetId?: string | string[] }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0] : params.budgetId;
  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency_code;
  const [form, setForm] = useState<Form>(initial);
  const [sides, setSides] = useState<GypsumBoardSides>(2);
  const [result, setResult] = useState<GypsumResult | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<CatalogItemWithDetails[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  useEffect(() => {
    async function restore() {
      const saved = await loadLocalData<Saved>(SETTINGS_KEY);
      if (saved) {
        const { sides: savedSides, ...settings } = saved;
        setForm((current) => ({ ...current, ...settings }));
        setSides(savedSides ?? 2);
      }
      setLoaded(true);
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const { wallLength: _l, wallHeight: _h, openingsArea: _o, ...settings } = form;
    void saveLocalData<Saved>(SETTINGS_KEY, { ...settings, sides });
  }, [form, loaded, sides]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) return;
    async function loadCatalog(id: string) {
      setCatalogLoading(true);
      const response = await listCatalogItems(id);
      if (response.error) {
        Alert.alert("No fue posible cargar el catálogo", response.error);
      } else {
        setItems(response.items);
      }
      setCatalogLoading(false);
    }
    void loadCatalog(companyId);
  }, [activeCompany]);

  function update(field: keyof Form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  }

  function choose(item: CatalogItemWithDetails) {
    if (!target) return;
    const fields: Record<Target, keyof Form> = {
      board: "boardPrice", stud: "studPrice", track: "trackPrice",
      screw: "screwPrice", tape: "tapePrice",
      compound: "compoundPrice", labor: "laborPrice",
    };
    const price = item.sale_price > 0 ? item.sale_price : item.unit_cost;
    update(fields[target], String(price));
    setSelected((current) => ({ ...current, [target]: item.name }));
    setTarget(null);
  }

  function calculate() {
    const length = number(form.wallLength);
    const height = number(form.wallHeight);
    const openings = number(form.openingsArea);
    if (!length || !height) {
      setError("Introduce un largo y una altura mayores que cero.");
      return;
    }
    if (openings < 0 || openings >= length * height) {
      setError("El área de puertas y ventanas debe ser menor que el muro.");
      return;
    }
    const positive: Array<[keyof Form, string]> = [
      ["boardWidth", "ancho de lámina"], ["boardHeight", "alto de lámina"],
      ["studSpacing", "separación de studs"], ["studLength", "largo del stud"],
      ["trackLength", "largo del track"], ["screwsPerBox", "tornillos por caja"],
      ["tapeRollLength", "largo del rollo"],
      ["compoundPackageKg", "peso del compuesto"],
    ];
    const invalid = positive.find(([field]) => number(form[field]) <= 0);
    if (invalid) {
      setError(`Revisa el ${invalid[1]}.`);
      return;
    }

    setResult(calculateGypsum({
      wallLength: length, wallHeight: height, openingsArea: openings,
      boardSides: sides, boardWidth: number(form.boardWidth),
      boardHeight: number(form.boardHeight),
      wastePercentage: number(form.waste),
      studSpacing: number(form.studSpacing),
      studPieceLength: number(form.studLength),
      trackPieceLength: number(form.trackLength),
      screwsPerBoard: number(form.screwsPerBoard),
      screwsPerBox: number(form.screwsPerBox),
      tapePerSquareMeter: number(form.tapePerM2),
      tapeRollLength: number(form.tapeRollLength),
      compoundKgPerSquareMeter: number(form.compoundPerM2),
      compoundPackageKg: number(form.compoundPackageKg),
    }, {
      boardUnit: number(form.boardPrice), studPiece: number(form.studPrice),
      trackPiece: number(form.trackPrice), screwBox: number(form.screwPrice),
      tapeRoll: number(form.tapePrice),
      compoundPackage: number(form.compoundPrice),
      laborSquareMeter: number(form.laborPrice),
    }));
    setError("");
    setSuccess("");
  }

  async function addToBudget() {
    if (!result) return;
    if (!activeCompany || !budgetId) {
      Alert.alert("Selecciona un presupuesto",
        "Abre esta calculadora desde un presupuesto para guardar la partida.", [
          { text: "Cancelar", style: "cancel" },
          { text: "Ver presupuestos", onPress: () => router.push("/presupuestos") },
        ]);
      return;
    }
    const f = (value: number) => formatDecimal(value, 0, currency);
    const unitPrice = result.totalCost / result.finishedArea;
    const response = await addBudgetItem({
      companyId: activeCompany.id, budgetId, itemType: "service",
      description: `Muro de gypsum a ${sides} cara${sides === 1 ? "" : "s"}`,
      unitName: "m²", quantity: result.finishedArea,
      unitCost: unitPrice, unitPrice, taxable: true,
      notes: `${f(result.boardsToBuy)} láminas · ${f(result.studPieces)} studs · ` +
        `${f(result.trackPieces)} tracks · ${f(result.screwBoxes)} cajas de tornillos · ` +
        `${f(result.tapeRolls)} rollos de cinta · ${f(result.compoundPackages)} compuestos`,
    });
    if (response.error) {
      Alert.alert("No fue posible agregar la partida", response.error);
    } else {
      setSuccess("La partida fue guardada en el presupuesto.");
    }
  }

  const dimensions: Array<[keyof Form, string, string, string]> = [
    ["wallLength", "Largo", "0.00", "m"],
    ["wallHeight", "Altura", "0.00", "m"],
    ["openingsArea", "Puertas y ventanas", "0.00", "m²"],
  ];
  const structure: Array<[keyof Form, string, string, string]> = [
    ["boardWidth", "Ancho de lámina", "1.22", "m"],
    ["boardHeight", "Alto de lámina", "2.44", "m"],
    ["waste", "Desperdicio", "10", "%"],
    ["studSpacing", "Separación de studs", "0.40", "m"],
    ["studLength", "Largo del stud", "3", "m"],
    ["trackLength", "Largo del track", "3", "m"],
  ];
  const finishes: Array<[keyof Form, string, string, string]> = [
    ["screwsPerBoard", "Tornillos por lámina", "40", "und."],
    ["screwsPerBox", "Tornillos por caja", "1000", "und."],
    ["tapePerM2", "Cinta por m²", "1.5", "m"],
    ["tapeRollLength", "Largo del rollo", "75", "m"],
    ["compoundPerM2", "Compuesto por m²", "0.6", "kg"],
    ["compoundPackageKg", "Peso por envase", "28", "kg"],
  ];
  const prices: Array<[keyof Form, string]> = [
    ["boardPrice", "Lámina"], ["studPrice", "Stud"],
    ["trackPrice", "Track"], ["screwPrice", "Caja de tornillos"],
    ["tapePrice", "Rollo de cinta"],
    ["compoundPrice", "Envase de compuesto"],
    ["laborPrice", "Mano de obra por m²"],
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroIcon}><Ionicons name="layers-outline" size={27}
              color={colors.textLight} /></View>
            <View style={styles.flex}><Text style={styles.title}>Gypsum</Text>
              <Text style={styles.subtitle}>Láminas, estructura, fijación, acabado y costos.</Text>
            </View>
          </View>

          <Section title="Dimensiones del muro"
            description="Descuenta puertas, ventanas y otros huecos.">
            <FieldGrid fields={dimensions} form={form} update={update} />
            <Text style={styles.label}>Caras con lámina</Text>
            <View style={styles.segments}>{([1, 2] as GypsumBoardSides[]).map((value) =>
              <Pressable key={value} onPress={() => setSides(value)}
                style={[styles.segment, sides === value && styles.segmentActive]}>
                <Text style={[styles.segmentText,
                  sides === value && styles.segmentTextActive]}>
                  {value} cara{value === 1 ? "" : "s"}
                </Text>
              </Pressable>)}</View>
          </Section>

          <Section title="Láminas y estructura"
            description="Medidas configurables para láminas y perfiles.">
            <CatalogButton label="Lámina" value={selected.board}
              onPress={() => setTarget("board")} />
            <CatalogButton label="Stud" value={selected.stud}
              onPress={() => setTarget("stud")} />
            <CatalogButton label="Track" value={selected.track}
              onPress={() => setTarget("track")} />
            <FieldGrid fields={structure} form={form} update={update} />
          </Section>

          <Section title="Fijación y acabado"
            description="Ajusta los rendimientos al nivel de acabado utilizado.">
            <CatalogButton label="Tornillos" value={selected.screw}
              onPress={() => setTarget("screw")} />
            <CatalogButton label="Cinta" value={selected.tape}
              onPress={() => setTarget("tape")} />
            <CatalogButton label="Compuesto" value={selected.compound}
              onPress={() => setTarget("compound")} />
            <FieldGrid fields={finishes} form={form} update={update} />
          </Section>

          <Section title="Precios y mano de obra"
            description="Escribe los precios o selecciónalos del catálogo.">
            <CatalogButton label="Mano de obra" value={selected.labor}
              onPress={() => setTarget("labor")} />
            <View style={styles.grid}>{prices.map(([field, label]) =>
              <Input key={field} label={label} value={form[field]}
                onChangeText={(value) => update(field, value)} placeholder="0.00"
                unit="B/." />)}</View>
          </Section>

          {error ? <Message danger text={error} /> : null}
          <View style={styles.actions}>
            <Pressable disabled={!number(form.wallLength) || !number(form.wallHeight)}
              onPress={calculate} style={styles.primary}>
              <Ionicons name="calculator-outline" size={20} color={colors.textLight} />
              <Text style={styles.primaryText}>Calcular</Text>
            </Pressable>
            <Pressable onPress={() => {
              setForm((current) => ({ ...current, wallLength: "", wallHeight: "",
                openingsArea: "0" })); setResult(null); setError("");
            }} style={styles.secondary}>
              <Text style={styles.secondaryText}>Limpiar medidas</Text>
            </Pressable>
          </View>
          {result ? <Results result={result} currency={currency}
            onAdd={addToBudget} /> : null}
          {success ? <Message text={success} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <CatalogPicker visible={Boolean(target)} target={target} items={items}
        loading={catalogLoading} currency={currency} onClose={() => setTarget(null)}
        onSelect={choose} />
    </SafeAreaView>
  );
}

function Section({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    <View style={styles.sectionBody}>{children}</View></View>;
}

function FieldGrid({ fields, form, update }: {
  fields: Array<[keyof Form, string, string, string]>; form: Form;
  update: (field: keyof Form, value: string) => void;
}) {
  return <View style={styles.grid}>{fields.map(([field, label, placeholder, unit]) =>
    <Input key={field} label={label} value={form[field]}
      onChangeText={(value) => update(field, value)} placeholder={placeholder}
      unit={unit} />)}</View>;
}

function Input({ label, value, onChangeText, placeholder, unit }: {
  label: string; value: string; onChangeText: (value: string) => void;
  placeholder: string; unit: string;
}) {
  return <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputBox}><TextInput value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor="#94A3B8"
      keyboardType="decimal-pad" inputMode="decimal" style={styles.input} />
      <Text style={styles.unit}>{unit}</Text></View></View>;
}

function CatalogButton({ label, value, onPress }: {
  label: string; value?: string; onPress: () => void;
}) {
  return <Pressable onPress={onPress} style={styles.catalogButton}>
    <View style={styles.flex}><Text style={styles.catalogLabel}>{label}</Text>
      <Text style={styles.catalogValue}>{value || "Seleccionar del catálogo"}</Text></View>
    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
  </Pressable>;
}

function CatalogPicker({ visible, target, items, loading, currency, onClose, onSelect }: {
  visible: boolean; target: Target | null; items: CatalogItemWithDetails[];
  loading: boolean; currency?: string; onClose: () => void;
  onSelect: (item: CatalogItemWithDetails) => void;
}) {
  const [search, setSearch] = useState("");
  useEffect(() => { if (visible) setSearch(""); }, [visible, target]);
  const filtered = useMemo(() => items.filter((item) => {
    const typeOk = target === "labor"
      ? item.item_type === "labor" || item.item_type === "service"
      : item.item_type === "material";
    const q = search.trim().toLowerCase();
    return typeOk && (!q || item.name.toLowerCase().includes(q) ||
      (item.category?.name.toLowerCase().includes(q) ?? false));
  }), [items, search, target]);
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet"
    onRequestClose={onClose}><SafeAreaView style={styles.modal}>
      <View style={styles.modalHeader}><Pressable onPress={onClose}>
        <Text style={styles.close}>Cerrar</Text></Pressable>
        <Text style={styles.modalTitle}>Seleccionar del catálogo</Text>
        <View style={styles.spacer} /></View>
      <View style={styles.modalBody}><TextInput value={search} onChangeText={setSearch}
        placeholder="Buscar por nombre o categoría" style={styles.search} />
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> :
          <FlatList data={filtered} keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const price = item.sale_price > 0 ? item.sale_price : item.unit_cost;
              return <Pressable onPress={() => onSelect(item)} style={styles.catalogItem}>
                <View style={styles.flex}><Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.unit?.symbol || "unidad"}</Text></View>
                <Text style={styles.itemPrice}>{formatMoney(price, currency)}</Text>
              </Pressable>;
            }} />}
      </View>
    </SafeAreaView></Modal>;
}

function Results({ result, currency, onAdd }: {
  result: GypsumResult; currency?: string; onAdd: () => void;
}) {
  const n = (value: number, digits = 0) => formatDecimal(value, digits, currency);
  const m = (value: number) => formatMoney(value, currency);
  const rows: Array<[string, string, string?]> = [
    ["Área neta", `${n(result.netWallArea, 2)} m²`],
    ["Área terminada", `${n(result.finishedArea, 2)} m²`],
    ["Láminas", `${n(result.boardsToBuy)} unidades`, `${n(result.boardsExact, 2)} calculadas`],
    ["Studs", `${n(result.studPieces)} piezas`, `${n(result.studLinearMeters, 2)} ml`],
    ["Tracks", `${n(result.trackPieces)} piezas`, `${n(result.trackLinearMeters, 2)} ml`],
    ["Tornillos", `${n(result.screws)} unidades`, `${n(result.screwBoxes)} cajas`],
    ["Cinta", `${n(result.tapeLinearMeters, 1)} m`, `${n(result.tapeRolls)} rollos`],
    ["Compuesto", `${n(result.compoundKilograms, 1)} kg`, `${n(result.compoundPackages)} envases`],
    ["Materiales", m(result.materialsCost)], ["Mano de obra", m(result.laborCost)],
  ];
  return <View style={styles.results}><Text style={styles.resultsTitle}>Resultado estimado</Text>
    {rows.map(([label, value, detail]) => <View key={label} style={styles.resultRow}>
      <View style={styles.flex}><Text style={styles.resultLabel}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}</View>
      <Text style={styles.resultValue}>{value}</Text></View>)}
    <View style={styles.total}><Text style={styles.totalLabel}>Costo estimado</Text>
      <Text style={styles.totalValue}>{m(result.totalCost)}</Text></View>
    <Pressable onPress={onAdd} style={styles.addButton}>
      <Ionicons name="document-text-outline" size={20} color={colors.textLight} />
      <Text style={styles.primaryText}>Agregar al presupuesto</Text></Pressable>
    <Text style={styles.warning}>Refuerzos, vanos, capas dobles y nivel de acabado
      pueden aumentar los materiales. Ajusta los rendimientos a la obra.</Text>
  </View>;
}

function Message({ text, danger = false }: { text: string; danger?: boolean }) {
  return <View style={[styles.message, danger && styles.danger]}>
    <Ionicons name={danger ? "alert-circle-outline" : "checkmark-circle"}
      size={20} color={danger ? colors.danger : colors.primary} />
    <Text style={[styles.messageText, danger && styles.dangerText]}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 44 },
  hero: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surfaceDark,
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  heroIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center" },
  title: { color: colors.textLight, fontSize: 21, fontWeight: "900" },
  subtitle: { color: "#CBD5E1", fontSize: 13, marginTop: 4 },
  section: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  description: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  sectionBody: { marginTop: 16, gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  inputGroup: { width: "48%", minWidth: 135, flexGrow: 1 },
  inputLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "800",
    marginBottom: 7 },
  inputBox: { height: 50, paddingHorizontal: 13, borderRadius: radius.md,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
    flexDirection: "row", alignItems: "center" },
  input: { flex: 1, height: "100%", color: colors.text, fontWeight: "700" },
  unit: { color: colors.textSecondary, fontSize: 11, fontWeight: "800" },
  label: { color: colors.text, fontSize: 13, fontWeight: "900" },
  segments: { flexDirection: "row", gap: 8 },
  segment: { flex: 1, height: 44, borderRadius: radius.md, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentText: { color: colors.textSecondary, fontWeight: "800" },
  segmentTextActive: { color: colors.textLight },
  catalogButton: { minHeight: 58, paddingHorizontal: 14, borderRadius: radius.md,
    backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: "#A7F3D0",
    flexDirection: "row", alignItems: "center" },
  catalogLabel: { color: colors.text, fontSize: 12, fontWeight: "900" },
  catalogValue: { color: colors.primary, fontSize: 12, fontWeight: "700", marginTop: 3 },
  actions: { flexDirection: "row", gap: 10, marginBottom: 18 },
  primary: { flex: 1.2, height: 54, borderRadius: radius.md, backgroundColor: colors.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryText: { color: colors.textLight, fontWeight: "900" },
  secondary: { flex: 1, height: 54, borderRadius: radius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.text, fontSize: 12, fontWeight: "800" },
  results: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border },
  resultsTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginBottom: 10 },
  resultRow: { minHeight: 52, paddingVertical: 8, flexDirection: "row",
    alignItems: "center", gap: 12 },
  resultLabel: { color: colors.text, fontSize: 13, fontWeight: "700" },
  detail: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  resultValue: { color: colors.text, fontSize: 13, fontWeight: "900" },
  total: { padding: 15, borderRadius: radius.md, backgroundColor: colors.surfaceDark,
    flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  totalLabel: { color: colors.textLight, fontWeight: "800" },
  totalValue: { color: colors.textLight, fontSize: 18, fontWeight: "900" },
  addButton: { height: 52, borderRadius: radius.md, backgroundColor: colors.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 14 },
  warning: { color: "#92400E", backgroundColor: "#FFFBEB", fontSize: 11,
    lineHeight: 17, padding: 14, borderRadius: radius.md, marginTop: 14 },
  message: { padding: 14, borderRadius: radius.md, backgroundColor: colors.primarySoft,
    flexDirection: "row", gap: 9, marginBottom: 14 },
  messageText: { flex: 1, color: colors.primary, fontSize: 13 },
  danger: { backgroundColor: "#FEF2F2" }, dangerText: { color: colors.danger },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { height: 60, paddingHorizontal: 18, backgroundColor: colors.surface,
    flexDirection: "row", alignItems: "center", borderBottomWidth: 1,
    borderBottomColor: colors.border },
  close: { color: colors.primary, fontWeight: "800" },
  modalTitle: { flex: 1, color: colors.text, fontWeight: "900", textAlign: "center" },
  spacer: { width: 45 }, modalBody: { flex: 1, padding: 18, gap: 14 },
  search: { height: 50, paddingHorizontal: 14, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catalogItem: { minHeight: 68, padding: 14, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    flexDirection: "row", alignItems: "center", marginBottom: 10 },
  itemName: { color: colors.text, fontWeight: "800" },
  itemMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  itemPrice: { color: colors.primary, fontWeight: "900" },
});
