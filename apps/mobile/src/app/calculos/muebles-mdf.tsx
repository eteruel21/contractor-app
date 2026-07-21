import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import { useCompany } from "../../contexts/CompanyContext";
import { addBudgetItem } from "../../services/budget-service";
import { listCatalogItems } from "../../services/catalog-service";
import type { CatalogItemWithDetails } from "../../types/catalog";
import {
  calculateMdfFurniture,
  type MdfFurnitureResult,
} from "../../services/calculators/muebles-mdf";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type Target =
  | "mdf"
  | "back"
  | "edge"
  | "hinge"
  | "slide"
  | "handle"
  | "leg"
  | "supplies"
  | "labor"
  | "installation";

type Form = {
  width: string;
  height: string;
  depth: string;
  quantity: string;
  verticalPanels: string;
  horizontalPanels: string;
  shelves: string;
  frontArea: string;
  backArea: string;
  extraMdfArea: string;
  waste: string;
  boardWidth: string;
  boardLength: string;
  backBoardWidth: string;
  backBoardLength: string;
  extraEdgeMeters: string;
  edgeRollLength: string;
  doors: string;
  hingesPerDoor: string;
  drawers: string;
  slidesPerDrawer: string;
  handles: string;
  legs: string;
  mdfPrice: string;
  backPrice: string;
  edgePrice: string;
  hingePrice: string;
  slidePrice: string;
  handlePrice: string;
  legPrice: string;
  suppliesPrice: string;
  laborPrice: string;
  installationPrice: string;
};

type Saved = Omit<
  Form,
  | "width"
  | "height"
  | "depth"
  | "quantity"
  | "frontArea"
  | "backArea"
  | "extraMdfArea"
>;

const KEY = "@contractor-pro/mdf-settings";

const initial: Form = {
  width: "",
  height: "",
  depth: "0.60",
  quantity: "1",
  verticalPanels: "2",
  horizontalPanels: "2",
  shelves: "3",
  frontArea: "0",
  backArea: "0",
  extraMdfArea: "0",
  waste: "12",
  boardWidth: "1.83",
  boardLength: "2.44",
  backBoardWidth: "1.22",
  backBoardLength: "2.44",
  extraEdgeMeters: "0",
  edgeRollLength: "50",
  doors: "0",
  hingesPerDoor: "3",
  drawers: "0",
  slidesPerDrawer: "1",
  handles: "0",
  legs: "0",
  mdfPrice: "",
  backPrice: "",
  edgePrice: "",
  hingePrice: "",
  slidePrice: "",
  handlePrice: "",
  legPrice: "",
  suppliesPrice: "",
  laborPrice: "",
  installationPrice: "",
};

function num(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MdfFurnitureScreen() {
  const params = useLocalSearchParams<{ budgetId?: string | string[] }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0]
    : params.budgetId;
  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency_code;
  const [form, setForm] = useState<Form>(initial);
  const [result, setResult] = useState<MdfFurnitureResult | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<CatalogItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  const bodyArea =
    Math.max(num(form.quantity), 1) *
    (num(form.verticalPanels) * num(form.height) * num(form.depth) +
      (num(form.horizontalPanels) + num(form.shelves)) *
        num(form.width) *
        num(form.depth) +
      num(form.frontArea) +
      num(form.extraMdfArea));

  useEffect(() => {
    async function restore() {
      const saved = await loadLocalData<Saved>(KEY);
      if (saved) {
        setForm((current) => ({ ...current, ...saved }));
      }
      setLoaded(true);
    }
    void restore();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const {
      width: _width,
      height: _height,
      depth: _depth,
      quantity: _quantity,
      frontArea: _frontArea,
      backArea: _backArea,
      extraMdfArea: _extraMdfArea,
      ...settings
    } = form;
    void saveLocalData<Saved>(KEY, settings);
  }, [form, loaded]);

  useEffect(() => {
    const companyId = activeCompany?.id;
    if (!companyId) return;
    async function loadCatalog(id: string) {
      setLoading(true);
      const response = await listCatalogItems(id);
      if (response.error) {
        Alert.alert("No fue posible cargar el catálogo", response.error);
      } else {
        setItems(response.items);
      }
      setLoading(false);
    }
    void loadCatalog(companyId);
  }, [activeCompany]);

  function update(field: keyof Form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  }

  function choose(item: CatalogItemWithDetails) {
    if (!target) return;
    const fields: Record<Target, keyof Form> = {
      mdf: "mdfPrice",
      back: "backPrice",
      edge: "edgePrice",
      hinge: "hingePrice",
      slide: "slidePrice",
      handle: "handlePrice",
      leg: "legPrice",
      supplies: "suppliesPrice",
      labor: "laborPrice",
      installation: "installationPrice",
    };
    const price = item.sale_price > 0 ? item.sale_price : item.unit_cost;
    update(fields[target], String(price));
    setSelected((current) => ({ ...current, [target]: item.name }));
    setTarget(null);
  }

  function calculate() {
    if (!num(form.width) || !num(form.height) || !num(form.depth)) {
      setError("Introduce el ancho, alto y profundidad del mueble.");
      return;
    }
    if (!num(form.boardWidth) || !num(form.boardLength)) {
      setError("Revisa las medidas del tablero MDF.");
      return;
    }
    if (
      num(form.backArea) > 0 &&
      (!num(form.backBoardWidth) || !num(form.backBoardLength))
    ) {
      setError("Revisa las medidas del tablero de fondo.");
      return;
    }

    const calculated = calculateMdfFurniture(
      {
        width: num(form.width),
        height: num(form.height),
        depth: num(form.depth),
        quantity: num(form.quantity),
        verticalPanels: num(form.verticalPanels),
        horizontalPanels: num(form.horizontalPanels),
        shelves: num(form.shelves),
        frontArea: num(form.frontArea),
        backArea: num(form.backArea),
        extraMdfArea: num(form.extraMdfArea),
        wastePercentage: num(form.waste),
        boardWidth: num(form.boardWidth),
        boardLength: num(form.boardLength),
        backBoardWidth: num(form.backBoardWidth),
        backBoardLength: num(form.backBoardLength),
        extraEdgeMeters: num(form.extraEdgeMeters),
        edgeRollLength: num(form.edgeRollLength),
        doors: num(form.doors),
        hingesPerDoor: num(form.hingesPerDoor),
        drawers: num(form.drawers),
        slidesPerDrawer: num(form.slidesPerDrawer),
        handles: num(form.handles),
        legs: num(form.legs),
      },
      {
        mdfBoard: num(form.mdfPrice),
        backBoard: num(form.backPrice),
        edgeRoll: num(form.edgePrice),
        hingeUnit: num(form.hingePrice),
        slidePair: num(form.slidePrice),
        handleUnit: num(form.handlePrice),
        legUnit: num(form.legPrice),
        supplies: num(form.suppliesPrice),
        laborSquareMeter: num(form.laborPrice),
        installationUnit: num(form.installationPrice),
      },
    );

    setResult(calculated);
    setError("");
    setMessage("");
  }

  async function addToBudget() {
    if (!result) return;
    if (!activeCompany || !budgetId) {
      Alert.alert(
        "Selecciona un presupuesto",
        "Abre esta calculadora desde un presupuesto para guardar la partida.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Ver presupuestos",
            onPress: () => router.push("/presupuestos"),
          },
        ],
      );
      return;
    }

    const quantity = Math.max(result.quantity, 1);
    const unitPrice = result.totalCost / quantity;
    const response = await addBudgetItem({
      companyId: activeCompany.id,
      budgetId,
      itemType: "service",
      description: `Fabricación de mueble MDF (${quantity} und.)`,
      unitName: "und.",
      quantity,
      unitCost: unitPrice,
      unitPrice,
      taxable: true,
      notes:
        `${result.boardsToBuy} tableros MDF · ` +
        `${result.backBoardsToBuy} fondos · ` +
        `${formatDecimal(result.edgeLinearMeters, 2, currency)} m de canto · ` +
        `${result.hinges} bisagras · ${result.slidePairs} pares de rieles`,
    });

    if (response.error) {
      Alert.alert("No fue posible agregar la partida", response.error);
    } else {
      setMessage("La partida fue guardada en el presupuesto.");
    }
  }

  const dimensionFields: Array<[keyof Form, string, string]> = [
    ["width", "Ancho del mueble", "m"],
    ["height", "Alto del mueble", "m"],
    ["depth", "Profundidad", "m"],
    ["quantity", "Cantidad de muebles", "und."],
  ];

  const panelFields: Array<[keyof Form, string, string]> = [
    ["verticalPanels", "Paneles verticales", "und."],
    ["horizontalPanels", "Tapas y bases", "und."],
    ["shelves", "Entrepaños", "und."],
    ["frontArea", "Puertas y frentes por mueble", "m²"],
    ["backArea", "Fondo por mueble", "m²"],
    ["extraMdfArea", "MDF adicional por mueble", "m²"],
    ["waste", "Desperdicio", "%"],
  ];

  const boardFields: Array<[keyof Form, string, string]> = [
    ["boardWidth", "Ancho tablero MDF", "m"],
    ["boardLength", "Largo tablero MDF", "m"],
    ["backBoardWidth", "Ancho tablero fondo", "m"],
    ["backBoardLength", "Largo tablero fondo", "m"],
    ["extraEdgeMeters", "Canto adicional por mueble", "m"],
    ["edgeRollLength", "Longitud del rollo", "m"],
  ];

  const hardwareFields: Array<[keyof Form, string, string]> = [
    ["doors", "Puertas", "und."],
    ["hingesPerDoor", "Bisagras por puerta", "und."],
    ["drawers", "Gavetas", "und."],
    ["slidesPerDrawer", "Pares de rieles por gaveta", "par"],
    ["handles", "Maniguetas", "und."],
    ["legs", "Patas", "und."],
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Ionicons
            name="file-tray-full-outline"
            size={30}
            color={colors.textLight}
          />
          <View style={styles.flex}>
            <Text style={styles.title}>Muebles MDF</Text>
            <Text style={styles.subtitle}>
              Tableros, cantos, fondos, herrajes y fabricación.
            </Text>
          </View>
        </View>

        <Section
          title="Dimensiones"
          description="Medidas exteriores de cada mueble."
        >
          <Grid fields={dimensionFields} form={form} update={update} />
          <Text style={styles.info}>
            Área MDF estimada antes de desperdicio: {formatDecimal(bodyArea, 2, currency)} m²
          </Text>
        </Section>

        <Section
          title="Despiece"
          description="Los frentes y piezas especiales se introducen por área para cada mueble."
        >
          <Grid fields={panelFields} form={form} update={update} />
        </Section>

        <Section
          title="Tableros y canto"
          description="Configura los formatos disponibles en tu proveedor."
        >
          <Grid fields={boardFields} form={form} update={update} />
          <Text style={styles.small}>
            En canto adicional incluye puertas, frentes y bordes especiales. El cálculo de tableros es por área y desperdicio; no sustituye un plan de corte.
          </Text>
        </Section>

        <Section
          title="Herrajes"
          description="Cantidades por cada mueble."
        >
          <Grid fields={hardwareFields} form={form} update={update} />
        </Section>

        <Section
          title="Precios"
          description="Selecciona productos del catálogo o escribe los valores."
        >
          <CatalogButton label="Tablero MDF" value={selected.mdf} onPress={() => setTarget("mdf")} />
          <CatalogButton label="Tablero de fondo" value={selected.back} onPress={() => setTarget("back")} />
          <CatalogButton label="Rollo de canto" value={selected.edge} onPress={() => setTarget("edge")} />
          <CatalogButton label="Bisagra" value={selected.hinge} onPress={() => setTarget("hinge")} />
          <CatalogButton label="Par de rieles" value={selected.slide} onPress={() => setTarget("slide")} />
          <CatalogButton label="Manigueta" value={selected.handle} onPress={() => setTarget("handle")} />
          <CatalogButton label="Pata" value={selected.leg} onPress={() => setTarget("leg")} />
          <CatalogButton label="Insumos" value={selected.supplies} onPress={() => setTarget("supplies")} />
          <CatalogButton label="Fabricación" value={selected.labor} onPress={() => setTarget("labor")} />
          <CatalogButton label="Instalación" value={selected.installation} onPress={() => setTarget("installation")} />

          <View style={styles.grid}>
            <Input label="Tablero MDF" value={form.mdfPrice} onChangeText={(value) => update("mdfPrice", value)} unit="B/." />
            <Input label="Tablero de fondo" value={form.backPrice} onChangeText={(value) => update("backPrice", value)} unit="B/." />
            <Input label="Rollo de canto" value={form.edgePrice} onChangeText={(value) => update("edgePrice", value)} unit="B/." />
            <Input label="Bisagra" value={form.hingePrice} onChangeText={(value) => update("hingePrice", value)} unit="B/." />
            <Input label="Par de rieles" value={form.slidePrice} onChangeText={(value) => update("slidePrice", value)} unit="B/." />
            <Input label="Manigueta" value={form.handlePrice} onChangeText={(value) => update("handlePrice", value)} unit="B/." />
            <Input label="Pata" value={form.legPrice} onChangeText={(value) => update("legPrice", value)} unit="B/." />
            <Input label="Insumos totales" value={form.suppliesPrice} onChangeText={(value) => update("suppliesPrice", value)} unit="B/." />
            <Input label="Fabricación por m²" value={form.laborPrice} onChangeText={(value) => update("laborPrice", value)} unit="B/." />
            <Input label="Instalación por mueble" value={form.installationPrice} onChangeText={(value) => update("installationPrice", value)} unit="B/." />
          </View>
        </Section>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={calculate} style={styles.primary}>
          <Text style={styles.primaryText}>Calcular mueble MDF</Text>
        </Pressable>
        {result ? (
          <Results result={result} currency={currency} onAdd={addToBudget} />
        ) : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
      </ScrollView>

      <Picker
        visible={Boolean(target)}
        target={target}
        items={items}
        loading={loading}
        currency={currency}
        onClose={() => setTarget(null)}
        onSelect={choose}
      />
    </SafeAreaView>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.small}>{description}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

function Grid({
  fields,
  form,
  update,
}: {
  fields: Array<[keyof Form, string, string]>;
  form: Form;
  update: (field: keyof Form, value: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {fields.map(([field, label, unit]) => (
        <Input
          key={field}
          label={label}
          value={form[field]}
          onChangeText={(value) => update(field, value)}
          unit={unit}
        />
      ))}
    </View>
  );
}

function Input({
  label,
  value,
  onChangeText,
  unit,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0.00"
          style={styles.input}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

function CatalogButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.catalog}>
      <View style={styles.flex}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.catalogValue}>
          {value || "Seleccionar del catálogo"}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </Pressable>
  );
}

function Picker({
  visible,
  target,
  items,
  loading,
  currency,
  onClose,
  onSelect,
}: {
  visible: boolean;
  target: Target | null;
  items: CatalogItemWithDetails[];
  loading: boolean;
  currency?: string;
  onClose: () => void;
  onSelect: (item: CatalogItemWithDetails) => void;
}) {
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        target === "labor" || target === "installation"
          ? item.item_type === "labor" || item.item_type === "service"
          : item.item_type === "material",
      ),
    [items, target],
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modal}>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>Cerrar</Text>
        </Pressable>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => onSelect(item)} style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.price}>
                  {formatMoney(item.sale_price || item.unit_cost, currency)}
                </Text>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

function Results({
  result,
  currency,
  onAdd,
}: {
  result: MdfFurnitureResult;
  currency?: string;
  onAdd: () => void;
}) {
  const money = (value: number) => formatMoney(value, currency);
  return (
    <View style={styles.results}>
      <Text style={styles.sectionTitle}>Resultado</Text>
      <Text>Muebles: {result.quantity}</Text>
      <Text>Área MDF: {formatDecimal(result.grossMdfArea, 2, currency)} m²</Text>
      <Text>Área con desperdicio: {formatDecimal(result.mdfAreaWithWaste, 2, currency)} m²</Text>
      <Text>Tableros MDF: {formatDecimal(result.boardsExact, 2, currency)} · Comprar {result.boardsToBuy}</Text>
      <Text>Tableros de fondo: {formatDecimal(result.backBoardsExact, 2, currency)} · Comprar {result.backBoardsToBuy}</Text>
      <Text>Canto: {formatDecimal(result.edgeLinearMeters, 2, currency)} m · Comprar {result.edgeRollsToBuy} rollos</Text>
      <Text>Bisagras: {result.hinges}</Text>
      <Text>Pares de rieles: {result.slidePairs}</Text>
      <Text>Maniguetas: {result.handles}</Text>
      <Text>Patas: {result.legs}</Text>
      <Text>Materiales: {money(result.materialsCost)}</Text>
      <Text>Fabricación: {money(result.laborCost)}</Text>
      <Text>Instalación: {money(result.installationCost)}</Text>
      <Text style={styles.total}>Total: {money(result.totalCost)}</Text>
      <Pressable onPress={onAdd} style={styles.primary}>
        <Text style={styles.primaryText}>Agregar al presupuesto</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 44 },
  flex: { flex: 1 },
  hero: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  title: { color: colors.textLight, fontSize: 21, fontWeight: "900" },
  subtitle: { color: "#CBD5E1", fontSize: 13 },
  section: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  small: { color: colors.textSecondary, fontSize: 12 },
  body: { marginTop: 14, gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  inputGroup: { width: "48%", minWidth: 135, flexGrow: 1 },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  inputBox: {
    height: 50,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, height: "100%", color: colors.text },
  unit: { color: colors.textSecondary, fontSize: 11 },
  info: {
    padding: 12,
    backgroundColor: "#EFF6FF",
    color: "#1E3A8A",
    borderRadius: radius.md,
  },
  catalog: {
    minHeight: 58,
    padding: 14,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
  },
  catalogValue: { color: colors.primary, fontSize: 12 },
  primary: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryText: { color: colors.textLight, fontWeight: "900" },
  error: { color: colors.danger, padding: 12 },
  success: { color: colors.primary, padding: 12 },
  results: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: 8,
    marginBottom: 16,
  },
  total: { fontSize: 18, fontWeight: "900", marginVertical: 8 },
  modal: { flex: 1, padding: 20, backgroundColor: colors.background },
  close: { color: colors.primary, fontWeight: "900", marginBottom: 16 },
  item: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemName: { color: colors.text, fontWeight: "800", flex: 1 },
  price: { color: colors.primary, fontWeight: "900", marginLeft: 12 },
});
