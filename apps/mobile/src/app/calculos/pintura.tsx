import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView,
  StyleSheet, Switch, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useCompany } from "../../contexts/CompanyContext";
import { addBudgetItem } from "../../services/budget-service";
import { listCatalogItems } from "../../services/catalog-service";
import type { CatalogItemWithDetails } from "../../types/catalog";
import { calculatePaint, type PaintResult } from "../../utils/calculations";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type Target = "paint" | "primer" | "labor" | "supplies";
type Form = {
  length: string; height: string; wallCount: string;
  directArea: string; openings: string; coats: string;
  coverage: string; waste: string; primerCoats: string;
  primerCoverage: string; paintPrice: string; primerPrice: string;
  suppliesPrice: string; laborPrice: string;
};
type Saved = Omit<Form, "length" | "height" | "wallCount" |
  "directArea" | "openings"> & { primer: boolean };

const KEY = "@contractor-pro/paint-settings";
const initial: Form = {
  length: "", height: "", wallCount: "1", directArea: "",
  openings: "0", coats: "2", coverage: "35", waste: "10",
  primerCoats: "1", primerCoverage: "35", paintPrice: "",
  primerPrice: "", suppliesPrice: "", laborPrice: "",
};
function num(value: string) {
  const n = Number(value.replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

export default function PaintScreen() {
  const params = useLocalSearchParams<{ budgetId?: string | string[] }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0] : params.budgetId;
  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency_code;
  const [form, setForm] = useState<Form>(initial);
  const [primer, setPrimer] = useState(true);
  const [result, setResult] = useState<PaintResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<CatalogItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  const grossArea = num(form.directArea) ||
    num(form.length) * num(form.height) * Math.max(num(form.wallCount), 1);

  useEffect(() => {
    async function restore() {
      const saved = await loadLocalData<Saved>(KEY);
      if (saved) {
        const { primer: savedPrimer, ...settings } = saved;
        setForm((current) => ({ ...current, ...settings }));
        setPrimer(savedPrimer ?? true);
      }
      setLoaded(true);
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const { length: _l, height: _h, wallCount: _c,
      directArea: _a, openings: _o, ...settings } = form;
    void saveLocalData<Saved>(KEY, { ...settings, primer });
  }, [form, loaded, primer]);

  useEffect(() => {
    const id = activeCompany?.id;
    if (!id) return;
    async function loadCatalog(companyId: string) {
      setLoading(true);
      const response = await listCatalogItems(companyId);
      if (response.error) Alert.alert("No fue posible cargar el catálogo", response.error);
      else setItems(response.items);
      setLoading(false);
    }
    void loadCatalog(id);
  }, [activeCompany]);

  function update(field: keyof Form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(""); setMessage("");
  }

  function choose(item: CatalogItemWithDetails) {
    if (!target) return;
    const fields: Record<Target, keyof Form> = {
      paint: "paintPrice", primer: "primerPrice",
      labor: "laborPrice", supplies: "suppliesPrice",
    };
    const price = item.sale_price > 0 ? item.sale_price : item.unit_cost;
    update(fields[target], String(price));
    setSelected((current) => ({ ...current, [target]: item.name }));
    setTarget(null);
  }

  function calculate() {
    if (!grossArea) { setError("Introduce las medidas o el área directa."); return; }
    if (num(form.openings) >= grossArea) {
      setError("Las puertas y ventanas deben ocupar menos que el área total."); return;
    }
    if (!num(form.coverage) || (primer && !num(form.primerCoverage))) {
      setError("Revisa el rendimiento de la pintura y el primer."); return;
    }
    setResult(calculatePaint({
      grossArea, openingsArea: num(form.openings), coats: num(form.coats),
      coveragePerGallon: num(form.coverage),
      wastePercentage: num(form.waste), primerEnabled: primer,
      primerCoats: num(form.primerCoats),
      primerCoveragePerGallon: num(form.primerCoverage),
    }, {
      paintGallon: num(form.paintPrice), primerGallon: num(form.primerPrice),
      supplies: num(form.suppliesPrice), laborSquareMeter: num(form.laborPrice),
    }));
    setError(""); setMessage("");
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
    const price = result.totalCost / result.netArea;
    const response = await addBudgetItem({
      companyId: activeCompany.id, budgetId, itemType: "service",
      description: `Pintura de paredes (${Math.round(num(form.coats))} manos)`,
      unitName: "m²", quantity: result.netArea, unitCost: price,
      unitPrice: price, taxable: true,
      notes: `${result.paintGallonsToBuy} galones de pintura` +
        (primer ? ` · ${result.primerGallonsToBuy} galones de primer` : ""),
    });
    if (response.error) Alert.alert("No fue posible agregar la partida", response.error);
    else setMessage("La partida fue guardada en el presupuesto.");
  }

  const fields: Array<[keyof Form, string, string]> = [
    ["length", "Largo", "m"], ["height", "Altura", "m"],
    ["wallCount", "Cantidad de muros", "und."],
    ["directArea", "Área directa (opcional)", "m²"],
    ["openings", "Puertas y ventanas", "m²"],
  ];
  const settings: Array<[keyof Form, string, string]> = [
    ["coats", "Manos de pintura", "manos"],
    ["coverage", "Rendimiento por galón", "m²"],
    ["waste", "Desperdicio", "%"],
    ["primerCoats", "Manos de primer", "manos"],
    ["primerCoverage", "Rendimiento del primer", "m²"],
  ];

  return <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}><Ionicons name="color-palette-outline" size={30}
        color={colors.textLight} /><View style={styles.flex}>
        <Text style={styles.title}>Pintura</Text>
        <Text style={styles.subtitle}>Galones, primer, materiales y mano de obra.</Text></View></View>

      <Section title="Área a pintar" description="Usa medidas de muros o escribe el área directa.">
        <Grid fields={fields} form={form} update={update} />
        <Text style={styles.info}>Área bruta: {formatDecimal(grossArea, 2, currency)} m²</Text>
      </Section>

      <Section title="Aplicación" description="Configura las manos, rendimiento y desperdicio.">
        <Grid fields={settings} form={form} update={update} />
        <View style={styles.switchRow}><View style={styles.flex}>
          <Text style={styles.switchTitle}>Aplicar primer o sellador</Text>
          <Text style={styles.small}>Incluye primer antes de la pintura.</Text></View>
          <Switch value={primer} onValueChange={setPrimer} trackColor={{ true: colors.primary }} />
        </View>
      </Section>

      <Section title="Precios" description="Puedes tomarlos del catálogo de tu empresa.">
        <CatalogButton label="Pintura" value={selected.paint} onPress={() => setTarget("paint")} />
        <CatalogButton label="Primer o sellador" value={selected.primer} onPress={() => setTarget("primer")} />
        <CatalogButton label="Insumos" value={selected.supplies} onPress={() => setTarget("supplies")} />
        <CatalogButton label="Mano de obra" value={selected.labor} onPress={() => setTarget("labor")} />
        <View style={styles.grid}>
          <Input label="Pintura por galón" value={form.paintPrice} onChangeText={(v) => update("paintPrice", v)} unit="B/." />
          <Input label="Primer por galón" value={form.primerPrice} onChangeText={(v) => update("primerPrice", v)} unit="B/." />
          <Input label="Insumos" value={form.suppliesPrice} onChangeText={(v) => update("suppliesPrice", v)} unit="B/." />
          <Input label="Mano de obra por m²" value={form.laborPrice} onChangeText={(v) => update("laborPrice", v)} unit="B/." />
        </View>
      </Section>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={calculate} style={styles.primary}><Text style={styles.primaryText}>Calcular pintura</Text></Pressable>
      {result ? <Results result={result} currency={currency} onAdd={addToBudget} /> : null}
      {message ? <Text style={styles.success}>{message}</Text> : null}
    </ScrollView>
    <Picker visible={Boolean(target)} target={target} items={items} loading={loading}
      currency={currency} onClose={() => setTarget(null)} onSelect={choose} />
  </SafeAreaView>;
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.small}>{description}</Text><View style={styles.body}>{children}</View></View>;
}
function Grid({ fields, form, update }: { fields: Array<[keyof Form, string, string]>; form: Form; update: (f: keyof Form, v: string) => void }) {
  return <View style={styles.grid}>{fields.map(([f, l, u]) => <Input key={f} label={l}
    value={form[f]} onChangeText={(v) => update(f, v)} unit={u} />)}</View>;
}
function Input({ label, value, onChangeText, unit }: { label: string; value: string; onChangeText: (v: string) => void; unit: string }) {
  return <View style={styles.inputGroup}><Text style={styles.label}>{label}</Text><View style={styles.inputBox}>
    <TextInput value={value} onChangeText={onChangeText} keyboardType="decimal-pad"
      inputMode="decimal" placeholder="0.00" style={styles.input} /><Text style={styles.unit}>{unit}</Text></View></View>;
}
function CatalogButton({ label, value, onPress }: { label: string; value?: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.catalog}><View style={styles.flex}>
    <Text style={styles.label}>{label}</Text><Text style={styles.catalogValue}>{value || "Seleccionar del catálogo"}</Text></View>
    <Ionicons name="chevron-forward" size={20} color={colors.primary} /></Pressable>;
}
function Picker({ visible, target, items, loading, currency, onClose, onSelect }: {
  visible: boolean; target: Target | null; items: CatalogItemWithDetails[]; loading: boolean;
  currency?: string; onClose: () => void; onSelect: (i: CatalogItemWithDetails) => void;
}) {
  const filtered = useMemo(() => items.filter((item) => target === "labor"
    ? item.item_type === "labor" || item.item_type === "service"
    : item.item_type === "material"), [items, target]);
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView style={styles.modal}><Pressable onPress={onClose}><Text style={styles.close}>Cerrar</Text></Pressable>
      {loading ? <ActivityIndicator size="large" color={colors.primary} /> : <FlatList data={filtered}
        keyExtractor={(i) => i.id} renderItem={({ item }) => <Pressable onPress={() => onSelect(item)} style={styles.item}>
          <Text style={styles.itemName}>{item.name}</Text><Text style={styles.price}>{formatMoney(item.sale_price || item.unit_cost, currency)}</Text>
        </Pressable>} />}</SafeAreaView></Modal>;
}
function Results({ result, currency, onAdd }: { result: PaintResult; currency?: string; onAdd: () => void }) {
  const m = (v: number) => formatMoney(v, currency);
  return <View style={styles.results}><Text style={styles.sectionTitle}>Resultado</Text>
    <Text>Área neta: {formatDecimal(result.netArea, 2, currency)} m²</Text>
    <Text>Pintura: {formatDecimal(result.paintGallonsExact, 2, currency)} gal · Comprar {result.paintGallonsToBuy}</Text>
    <Text>Primer: {formatDecimal(result.primerGallonsExact, 2, currency)} gal · Comprar {result.primerGallonsToBuy}</Text>
    <Text>Materiales: {m(result.materialsCost)}</Text><Text>Mano de obra: {m(result.laborCost)}</Text>
    <Text style={styles.total}>Total: {m(result.totalCost)}</Text>
    <Pressable onPress={onAdd} style={styles.primary}><Text style={styles.primaryText}>Agregar al presupuesto</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, content: { padding: 20, paddingBottom: 44 },
  flex: { flex: 1 }, hero: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surfaceDark,
    flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  title: { color: colors.textLight, fontSize: 21, fontWeight: "900" }, subtitle: { color: "#CBD5E1", fontSize: 13 },
  section: { padding: 18, borderRadius: radius.lg, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "900" }, small: { color: colors.textSecondary, fontSize: 12 },
  body: { marginTop: 14, gap: 12 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  inputGroup: { width: "48%", minWidth: 135, flexGrow: 1 }, label: { color: colors.text, fontSize: 12, fontWeight: "800", marginBottom: 6 },
  inputBox: { height: 50, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" },
  input: { flex: 1, height: "100%", color: colors.text }, unit: { color: colors.textSecondary, fontSize: 11 },
  info: { padding: 12, backgroundColor: "#EFF6FF", color: "#1E3A8A", borderRadius: radius.md },
  switchRow: { flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.background, borderRadius: radius.md },
  switchTitle: { color: colors.text, fontWeight: "800" }, catalog: { minHeight: 58, padding: 14,
    backgroundColor: colors.primarySoft, borderRadius: radius.md, flexDirection: "row", alignItems: "center" },
  catalogValue: { color: colors.primary, fontSize: 12 }, primary: { height: 52, borderRadius: radius.md,
    backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  primaryText: { color: colors.textLight, fontWeight: "900" }, error: { color: colors.danger, padding: 12 },
  success: { color: colors.primary, padding: 12 }, results: { padding: 18, backgroundColor: colors.surface,
    borderRadius: radius.lg, gap: 8, marginBottom: 16 }, total: { fontSize: 18, fontWeight: "900", marginVertical: 8 },
  modal: { flex: 1, padding: 20, backgroundColor: colors.background }, close: { color: colors.primary,
    fontWeight: "900", marginBottom: 16 }, item: { padding: 15, backgroundColor: colors.surface,
    borderRadius: radius.md, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
  itemName: { color: colors.text, fontWeight: "800" }, price: { color: colors.primary, fontWeight: "900" },
});
