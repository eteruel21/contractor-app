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
  calculatePvcCeiling, type PvcCeilingResult,
} from "../../services/calculators/cielo-raso-pvc";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type Target = "panel" | "track" | "support" | "carrier" |
  "hanger" | "screw" | "labor";

type Form = {
  length: string; width: string; directArea: string; directPerimeter: string;
  panelWidth: string; panelLength: string; waste: string;
  supportSpacing: string; supportLength: string;
  carrierSpacing: string; carrierLength: string;
  trackLength: string; hangerSpacing: string;
  screwsPerM2: string; screwsPerBox: string;
  panelPrice: string; trackPrice: string; supportPrice: string;
  carrierPrice: string; hangerPrice: string; screwPrice: string;
  laborPrice: string;
};

type Saved = Omit<Form, "length" | "width" | "directArea" | "directPerimeter">;
const SETTINGS_KEY = "@contractor-pro/pvc-ceiling-settings";
const initial: Form = {
  length: "", width: "", directArea: "", directPerimeter: "",
  panelWidth: "0.20", panelLength: "5.85", waste: "10",
  supportSpacing: "0.40", supportLength: "3",
  carrierSpacing: "1.20", carrierLength: "3", trackLength: "3",
  hangerSpacing: "1", screwsPerM2: "12", screwsPerBox: "1000",
  panelPrice: "", trackPrice: "", supportPrice: "",
  carrierPrice: "", hangerPrice: "", screwPrice: "", laborPrice: "",
};

function number(value: string) {
  const result = Number(value.replace(",", ".").trim());
  return Number.isFinite(result) ? result : 0;
}

export default function PvcCeilingScreen() {
  const params = useLocalSearchParams<{ budgetId?: string | string[] }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0] : params.budgetId;
  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency_code;
  const [form, setForm] = useState<Form>(initial);
  const [result, setResult] = useState<PvcCeilingResult | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [items, setItems] = useState<CatalogItemWithDetails[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  const calculatedArea = number(form.directArea) ||
    number(form.length) * number(form.width);
  const calculatedPerimeter = number(form.directPerimeter) ||
    (number(form.length) && number(form.width)
      ? 2 * (number(form.length) + number(form.width)) : 0);

  useEffect(() => {
    async function restore() {
      const saved = await loadLocalData<Saved>(SETTINGS_KEY);
      if (saved) setForm((current) => ({ ...current, ...saved }));
      setSettingsLoaded(true);
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    const {
      length: _l, width: _w, directArea: _a,
      directPerimeter: _p, ...settings
    } = form;
    void saveLocalData<Saved>(SETTINGS_KEY, settings);
  }, [form, settingsLoaded]);

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
    setError(""); setSuccess("");
  }

  function choose(item: CatalogItemWithDetails) {
    if (!target) return;
    const fields: Record<Target, keyof Form> = {
      panel: "panelPrice", track: "trackPrice",
      support: "supportPrice", carrier: "carrierPrice",
      hanger: "hangerPrice", screw: "screwPrice", labor: "laborPrice",
    };
    const price = item.sale_price > 0 ? item.sale_price : item.unit_cost;
    update(fields[target], String(price));
    setSelected((current) => ({ ...current, [target]: item.name }));
    setTarget(null);
  }

  function calculate() {
    if (!calculatedArea || !calculatedPerimeter) {
      setError("Introduce largo y ancho, o escribe el área y perímetro directos.");
      return;
    }
    const positive: Array<[keyof Form, string]> = [
      ["panelWidth", "ancho de la lámina"], ["panelLength", "largo de la lámina"],
      ["supportSpacing", "separación de studs"], ["supportLength", "largo del stud"],
      ["carrierSpacing", "separación de cargadores"],
      ["carrierLength", "largo del cargador"], ["trackLength", "largo del track"],
      ["hangerSpacing", "separación de suspensiones"],
      ["screwsPerBox", "tornillos por caja"],
    ];
    const invalid = positive.find(([field]) => number(form[field]) <= 0);
    if (invalid) { setError(`Revisa el ${invalid[1]}.`); return; }

    setResult(calculatePvcCeiling({
      area: calculatedArea, perimeter: calculatedPerimeter,
      panelWidth: number(form.panelWidth), panelLength: number(form.panelLength),
      wastePercentage: number(form.waste),
      supportSpacing: number(form.supportSpacing),
      supportPieceLength: number(form.supportLength),
      carrierSpacing: number(form.carrierSpacing),
      carrierPieceLength: number(form.carrierLength),
      trackPieceLength: number(form.trackLength),
      hangerSpacing: number(form.hangerSpacing),
      screwsPerSquareMeter: number(form.screwsPerM2),
      screwsPerBox: number(form.screwsPerBox),
    }, {
      panelPiece: number(form.panelPrice), trackPiece: number(form.trackPrice),
      supportPiece: number(form.supportPrice),
      carrierPiece: number(form.carrierPrice),
      hangerUnit: number(form.hangerPrice), screwBox: number(form.screwPrice),
      laborSquareMeter: number(form.laborPrice),
    }));
    setError(""); setSuccess("");
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
    const n = (value: number) => formatDecimal(value, 0, currency);
    const unitPrice = result.totalCost / result.netArea;
    const response = await addBudgetItem({
      companyId: activeCompany.id, budgetId, itemType: "service",
      description: "Cielo raso PVC", unitName: "m²",
      quantity: result.netArea, unitCost: unitPrice, unitPrice, taxable: true,
      notes: `${n(result.panelsToBuy)} láminas PVC · ${n(result.trackPieces)} tracks · ` +
        `${n(result.supportPieces)} studs · ${n(result.carrierPieces)} cargadores · ` +
        `${n(result.hangers)} suspensiones · ${n(result.screwBoxes)} cajas de tornillos`,
    });
    if (response.error) Alert.alert("No fue posible agregar la partida", response.error);
    else setSuccess("La partida fue guardada en el presupuesto.");
  }

  const dimensions: Array<[keyof Form, string, string, string]> = [
    ["length", "Largo", "0.00", "m"], ["width", "Ancho", "0.00", "m"],
    ["directArea", "Área directa (opcional)", "0.00", "m²"],
    ["directPerimeter", "Perímetro directo (opcional)", "0.00", "m"],
  ];
  const structure: Array<[keyof Form, string, string, string]> = [
    ["supportSpacing", "Separación de studs", "0.40", "m"],
    ["supportLength", "Largo del stud", "3", "m"],
    ["carrierSpacing", "Separación de cargadores", "1.20", "m"],
    ["carrierLength", "Largo del cargador", "3", "m"],
    ["trackLength", "Largo del track", "3", "m"],
    ["hangerSpacing", "Suspensiones cada", "1", "m"],
    ["screwsPerM2", "Tornillos por m²", "12", "und."],
    ["screwsPerBox", "Tornillos por caja", "1000", "und."],
  ];
  const prices: Array<[keyof Form, string]> = [
    ["panelPrice", "Lámina PVC"], ["trackPrice", "Track"],
    ["supportPrice", "Stud"], ["carrierPrice", "Cargador"],
    ["hangerPrice", "Suspensión"], ["screwPrice", "Caja de tornillos"],
    ["laborPrice", "Mano de obra por m²"],
  ];

  return <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
    <KeyboardAvoidingView style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}><View style={styles.heroIcon}>
          <Ionicons name="apps-outline" size={27} color={colors.textLight} /></View>
          <View style={styles.flex}><Text style={styles.title}>Cielo raso PVC</Text>
            <Text style={styles.subtitle}>Láminas, estructura, cargadores y costos.</Text></View>
        </View>

        <Section title="Área del cielo raso"
          description="Para espacios irregulares puedes escribir directamente el área y perímetro.">
          <FieldGrid fields={dimensions} form={form} update={update} />
          <View style={styles.summary}><Text style={styles.summaryText}>
            Área: {formatDecimal(calculatedArea, 2, currency)} m² · Perímetro: {formatDecimal(calculatedPerimeter, 2, currency)} m
          </Text></View>
        </Section>

        <Section title="Láminas de PVC"
          description="Ancho inicial de 20 cm y largo seleccionable.">
          <CatalogButton label="Lámina PVC" value={selected.panel}
            onPress={() => setTarget("panel")} />
          <Text style={styles.label}>Largo comercial</Text>
          <View style={styles.segments}>{["5.85", "2.90"].map((length) =>
            <Pressable key={length} onPress={() => update("panelLength", length)}
              style={[styles.segment, form.panelLength === length && styles.segmentActive]}>
              <Text style={[styles.segmentText,
                form.panelLength === length && styles.segmentTextActive]}>{length} m</Text>
            </Pressable>)}</View>
          <View style={styles.grid}>
            <Input label="Ancho de lámina" value={form.panelWidth}
              onChangeText={(value) => update("panelWidth", value)} placeholder="0.20" unit="m" />
            <Input label="Largo de lámina" value={form.panelLength}
              onChangeText={(value) => update("panelLength", value)} placeholder="5.85" unit="m" />
            <Input label="Desperdicio" value={form.waste}
              onChangeText={(value) => update("waste", value)} placeholder="10" unit="%" />
          </View>
        </Section>

        <Section title="Estructura metálica"
          description="Tracks perimetrales, studs a 40 cm y cargadores de stud.">
          <CatalogButton label="Track" value={selected.track}
            onPress={() => setTarget("track")} />
          <CatalogButton label="Stud" value={selected.support}
            onPress={() => setTarget("support")} />
          <CatalogButton label="Cargador" value={selected.carrier}
            onPress={() => setTarget("carrier")} />
          <CatalogButton label="Suspensión" value={selected.hanger}
            onPress={() => setTarget("hanger")} />
          <CatalogButton label="Tornillos" value={selected.screw}
            onPress={() => setTarget("screw")} />
          <FieldGrid fields={structure} form={form} update={update} />
        </Section>

        <Section title="Precios y mano de obra"
          description="Precios por pieza, caja, suspensión o metro cuadrado.">
          <CatalogButton label="Mano de obra" value={selected.labor}
            onPress={() => setTarget("labor")} />
          <View style={styles.grid}>{prices.map(([field, label]) =>
            <Input key={field} label={label} value={form[field]}
              onChangeText={(value) => update(field, value)} placeholder="0.00" unit="B/." />)}</View>
        </Section>

        {error ? <Message text={error} danger /> : null}
        <View style={styles.actions}><Pressable onPress={calculate} style={styles.primary}>
          <Ionicons name="calculator-outline" size={20} color={colors.textLight} />
          <Text style={styles.primaryText}>Calcular</Text></Pressable>
          <Pressable onPress={() => { setForm((current) => ({ ...current,
            length: "", width: "", directArea: "", directPerimeter: "" }));
            setResult(null); setError(""); }} style={styles.secondary}>
            <Text style={styles.secondaryText}>Limpiar medidas</Text></Pressable></View>
        {result ? <Results result={result} currency={currency} onAdd={addToBudget} /> : null}
        {success ? <Message text={success} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
    <CatalogPicker visible={Boolean(target)} target={target} items={items}
      loading={catalogLoading} currency={currency} onClose={() => setTarget(null)}
      onSelect={choose} />
  </SafeAreaView>;
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
      onChangeText={(value) => update(field, value)} placeholder={placeholder} unit={unit} />)}</View>;
}

function Input({ label, value, onChangeText, placeholder, unit }: {
  label: string; value: string; onChangeText: (value: string) => void;
  placeholder: string; unit: string;
}) {
  return <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputBox}><TextInput value={value} onChangeText={onChangeText}
      placeholder={placeholder} placeholderTextColor="#94A3B8" keyboardType="decimal-pad"
      inputMode="decimal" style={styles.input} /><Text style={styles.unit}>{unit}</Text></View></View>;
}

function CatalogButton({ label, value, onPress }: {
  label: string; value?: string; onPress: () => void;
}) {
  return <Pressable onPress={onPress} style={styles.catalogButton}>
    <View style={styles.flex}><Text style={styles.catalogLabel}>{label}</Text>
      <Text style={styles.catalogValue}>{value || "Seleccionar del catálogo"}</Text></View>
    <Ionicons name="chevron-forward" size={20} color={colors.primary} /></Pressable>;
}

function CatalogPicker({ visible, target, items, loading, currency, onClose, onSelect }: {
  visible: boolean; target: Target | null; items: CatalogItemWithDetails[];
  loading: boolean; currency?: string; onClose: () => void;
  onSelect: (item: CatalogItemWithDetails) => void;
}) {
  const [search, setSearch] = useState("");
  useEffect(() => { if (visible) setSearch(""); }, [visible, target]);
  const filtered = useMemo(() => items.filter((item) => {
    const valid = target === "labor" ? item.item_type === "labor" ||
      item.item_type === "service" : item.item_type === "material";
    const query = search.trim().toLowerCase();
    return valid && (!query || item.name.toLowerCase().includes(query) ||
      (item.category?.name.toLowerCase().includes(query) ?? false));
  }), [items, search, target]);
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet"
    onRequestClose={onClose}><SafeAreaView style={styles.modal}>
      <View style={styles.modalHeader}><Pressable onPress={onClose}>
        <Text style={styles.close}>Cerrar</Text></Pressable>
        <Text style={styles.modalTitle}>Seleccionar del catálogo</Text><View style={styles.spacer} /></View>
      <View style={styles.modalBody}><TextInput value={search} onChangeText={setSearch}
        placeholder="Buscar por nombre o categoría" style={styles.search} />
        {loading ? <ActivityIndicator size="large" color={colors.primary} /> :
          <FlatList data={filtered} keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const price = item.sale_price > 0 ? item.sale_price : item.unit_cost;
              return <Pressable onPress={() => onSelect(item)} style={styles.catalogItem}>
                <View style={styles.flex}><Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{item.unit?.symbol || "unidad"}</Text></View>
                <Text style={styles.itemPrice}>{formatMoney(price, currency)}</Text></Pressable>;
            }} />}
      </View></SafeAreaView></Modal>;
}

function Results({ result, currency, onAdd }: {
  result: PvcCeilingResult; currency?: string; onAdd: () => void;
}) {
  const n = (value: number, digits = 0) => formatDecimal(value, digits, currency);
  const m = (value: number) => formatMoney(value, currency);
  const rows: Array<[string, string, string?]> = [
    ["Área neta", `${n(result.netArea, 2)} m²`],
    ["Área con desperdicio", `${n(result.areaWithWaste, 2)} m²`],
    ["Láminas PVC", `${n(result.panelsToBuy)} piezas`, `${n(result.panelsExact, 2)} calculadas`],
    ["Track perimetral", `${n(result.trackPieces)} piezas`, `${n(result.trackLinearMeters, 2)} ml`],
    ["Studs", `${n(result.supportPieces)} piezas`, `${n(result.supportLinearMeters, 2)} ml`],
    ["Cargadores", `${n(result.carrierPieces)} piezas`, `${n(result.carrierLinearMeters, 2)} ml`],
    ["Suspensiones", `${n(result.hangers)} unidades`],
    ["Tornillos", `${n(result.screws)} unidades`, `${n(result.screwBoxes)} cajas`],
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
    <Text style={styles.warning}>Confirma luces, cajones, cambios de nivel, refuerzos,
      cortes y puntos de suspensión antes de comprar los materiales.</Text></View>;
}

function Message({ text, danger = false }: { text: string; danger?: boolean }) {
  return <View style={[styles.message, danger && styles.danger]}>
    <Ionicons name={danger ? "alert-circle-outline" : "checkmark-circle"} size={20}
      color={danger ? colors.danger : colors.primary} />
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
  inputLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: "800", marginBottom: 7 },
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
  summary: { padding: 12, borderRadius: radius.md, backgroundColor: "#EFF6FF" },
  summaryText: { color: "#1E3A8A", fontSize: 12, fontWeight: "800" },
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
  resultRow: { minHeight: 52, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 12 },
  resultLabel: { color: colors.text, fontSize: 13, fontWeight: "700" },
  detail: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  resultValue: { color: colors.text, fontSize: 13, fontWeight: "900" },
  total: { padding: 15, borderRadius: radius.md, backgroundColor: colors.surfaceDark,
    flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  totalLabel: { color: colors.textLight, fontWeight: "800" },
  totalValue: { color: colors.textLight, fontSize: 18, fontWeight: "900" },
  addButton: { height: 52, borderRadius: radius.md, backgroundColor: colors.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 },
  warning: { color: "#92400E", backgroundColor: "#FFFBEB", fontSize: 11,
    lineHeight: 17, padding: 14, borderRadius: radius.md, marginTop: 14 },
  message: { padding: 14, borderRadius: radius.md, backgroundColor: colors.primarySoft,
    flexDirection: "row", gap: 9, marginBottom: 14 },
  messageText: { flex: 1, color: colors.primary, fontSize: 13 },
  danger: { backgroundColor: "#FEF2F2" }, dangerText: { color: colors.danger },
  modal: { flex: 1, backgroundColor: colors.background },
  modalHeader: { height: 60, paddingHorizontal: 18, backgroundColor: colors.surface,
    flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.border },
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
