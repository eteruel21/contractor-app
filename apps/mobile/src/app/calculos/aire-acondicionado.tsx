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
  calculateAirConditioning,
  type AirConditioningResult,
} from "../../utils/calculations";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type Target =
  | "equipment"
  | "copper"
  | "cable"
  | "drain"
  | "bracket"
  | "breaker"
  | "disconnect"
  | "refrigerant"
  | "supplies"
  | "labor"
  | "coreDrilling";

type Form = {
  length: string;
  width: string;
  directArea: string;
  excludedArea: string;
  units: string;
  occupants: string;
  btuPerSquareMeter: string;
  extraBtuPerPerson: string;
  heatLoad: string;
  selectedCapacity: string;
  copperRoute: string;
  includedCopper: string;
  cableRoute: string;
  drainRoute: string;
  waste: string;
  drainPieceLength: string;
  refrigerantPerExtraMeter: string;
  equipmentPrice: string;
  copperMeterPrice: string;
  cableMeterPrice: string;
  drainPiecePrice: string;
  bracketPrice: string;
  breakerPrice: string;
  disconnectPrice: string;
  refrigerantKgPrice: string;
  suppliesPrice: string;
  laborUnitPrice: string;
  coreDrillingPrice: string;
};

type Saved = Omit<
  Form,
  "length" | "width" | "directArea" | "excludedArea" | "units"
>;

const KEY = "@contractor-pro/air-conditioning-settings";

const initial: Form = {
  length: "",
  width: "",
  directArea: "",
  excludedArea: "0",
  units: "1",
  occupants: "2",
  btuPerSquareMeter: "600",
  extraBtuPerPerson: "600",
  heatLoad: "10",
  selectedCapacity: "",
  copperRoute: "5",
  includedCopper: "3",
  cableRoute: "10",
  drainRoute: "5",
  waste: "10",
  drainPieceLength: "3",
  refrigerantPerExtraMeter: "0.02",
  equipmentPrice: "",
  copperMeterPrice: "",
  cableMeterPrice: "",
  drainPiecePrice: "",
  bracketPrice: "",
  breakerPrice: "",
  disconnectPrice: "",
  refrigerantKgPrice: "",
  suppliesPrice: "",
  laborUnitPrice: "",
  coreDrillingPrice: "",
};

function num(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AirConditioningScreen() {
  const params = useLocalSearchParams<{
    budgetId?: string | string[];
  }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0]
    : params.budgetId;

  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency_code;
  const [form, setForm] = useState<Form>(initial);
  const [result, setResult] =
    useState<AirConditioningResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] =
    useState<CatalogItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  const grossArea =
    num(form.directArea) || num(form.length) * num(form.width);

  useEffect(() => {
    async function restore() {
      const saved = await loadLocalData<Saved>(KEY);

      if (saved) {
        setForm((current) => ({
          ...current,
          ...saved,
        }));
      }

      setLoaded(true);
    }

    void restore();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const {
      length: _length,
      width: _width,
      directArea: _directArea,
      excludedArea: _excludedArea,
      units: _units,
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
        Alert.alert(
          "No fue posible cargar el catálogo",
          response.error,
        );
      } else {
        setItems(response.items);
      }

      setLoading(false);
    }

    void loadCatalog(companyId);
  }, [activeCompany]);

  function update(field: keyof Form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setMessage("");
  }

  function choose(item: CatalogItemWithDetails) {
    if (!target) return;

    const fields: Record<Target, keyof Form> = {
      equipment: "equipmentPrice",
      copper: "copperMeterPrice",
      cable: "cableMeterPrice",
      drain: "drainPiecePrice",
      bracket: "bracketPrice",
      breaker: "breakerPrice",
      disconnect: "disconnectPrice",
      refrigerant: "refrigerantKgPrice",
      supplies: "suppliesPrice",
      labor: "laborUnitPrice",
      coreDrilling: "coreDrillingPrice",
    };

    const price =
      item.sale_price > 0 ? item.sale_price : item.unit_cost;

    update(fields[target], String(price));
    setSelected((current) => ({
      ...current,
      [target]: item.name,
    }));
    setTarget(null);
  }

  function calculate() {
    if (!grossArea) {
      setError("Introduce las medidas o el área directa.");
      return;
    }

    if (num(form.excludedArea) >= grossArea) {
      setError("El área excluida debe ser menor que el área total.");
      return;
    }

    if (!num(form.units) || !num(form.btuPerSquareMeter)) {
      setError("Revisa la cantidad de equipos y el rendimiento en BTU.");
      return;
    }

    if (num(form.drainRoute) > 0 && !num(form.drainPieceLength)) {
      setError("Introduce la longitud comercial de la tubería de drenaje.");
      return;
    }

    setResult(
      calculateAirConditioning(
        {
          grossArea,
          excludedArea: num(form.excludedArea),
          unitCount: num(form.units),
          occupants: num(form.occupants),
          btuPerSquareMeter: num(form.btuPerSquareMeter),
          extraBtuPerPerson: num(form.extraBtuPerPerson),
          heatLoadPercentage: num(form.heatLoad),
          selectedCapacityBtu: num(form.selectedCapacity),
          copperRoutePerUnit: num(form.copperRoute),
          includedCopperPerUnit: num(form.includedCopper),
          cableRoutePerUnit: num(form.cableRoute),
          drainRoutePerUnit: num(form.drainRoute),
          wastePercentage: num(form.waste),
          drainPieceLength: num(form.drainPieceLength),
          refrigerantKgPerExtraMeter: num(
            form.refrigerantPerExtraMeter,
          ),
        },
        {
          equipmentUnit: num(form.equipmentPrice),
          copperPairMeter: num(form.copperMeterPrice),
          cableMeter: num(form.cableMeterPrice),
          drainPiece: num(form.drainPiecePrice),
          bracketSet: num(form.bracketPrice),
          breakerUnit: num(form.breakerPrice),
          disconnectUnit: num(form.disconnectPrice),
          refrigerantKilogram: num(form.refrigerantKgPrice),
          supplies: num(form.suppliesPrice),
          laborUnit: num(form.laborUnitPrice),
          coreDrillingUnit: num(form.coreDrillingPrice),
        },
      ),
    );

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
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Ver presupuestos",
            onPress: () => router.push("/presupuestos"),
          },
        ],
      );
      return;
    }

    const unitPrice = result.totalCost / result.unitCount;
    const capacity = formatDecimal(
      result.selectedCapacityPerUnit,
      0,
      currency,
    );

    const response = await addBudgetItem({
      companyId: activeCompany.id,
      budgetId,
      itemType: "service",
      description:
        `Suministro e instalación de aire acondicionado ` +
        `de ${capacity} BTU`,
      unitName: "und.",
      quantity: result.unitCount,
      unitCost: unitPrice,
      unitPrice,
      taxable: true,
      notes:
        `Carga estimada: ${formatDecimal(result.designLoadBtu, 0, currency)} BTU` +
        ` · ${formatDecimal(result.extraCopperMeters, 2, currency)} m de cobre adicional` +
        ` · ${formatDecimal(result.cableMeters, 2, currency)} m de cable` +
        ` · ${result.drainPieces} piezas de drenaje`,
    });

    if (response.error) {
      Alert.alert(
        "No fue posible agregar la partida",
        response.error,
      );
    } else {
      setMessage("La partida fue guardada en el presupuesto.");
    }
  }

  const areaFields: Array<[keyof Form, string, string]> = [
    ["length", "Largo", "m"],
    ["width", "Ancho", "m"],
    ["directArea", "Área directa (opcional)", "m²"],
    ["excludedArea", "Área excluida", "m²"],
    ["units", "Cantidad de equipos", "und."],
  ];

  const loadFields: Array<[keyof Form, string, string]> = [
    ["occupants", "Personas", "pers."],
    ["btuPerSquareMeter", "Carga base", "BTU/m²"],
    ["extraBtuPerPerson", "BTU por persona adicional", "BTU"],
    ["heatLoad", "Carga adicional", "%"],
    ["selectedCapacity", "Capacidad manual (opcional)", "BTU/und."],
  ];

  const routeFields: Array<[keyof Form, string, string]> = [
    ["copperRoute", "Recorrido de cobre", "m/und."],
    ["includedCopper", "Cobre incluido", "m/und."],
    ["cableRoute", "Recorrido eléctrico", "m/und."],
    ["drainRoute", "Recorrido de drenaje", "m/und."],
    ["waste", "Desperdicio", "%"],
    ["drainPieceLength", "Largo del tubo de drenaje", "m/pza."],
    ["refrigerantPerExtraMeter", "Refrigerante adicional", "kg/m"],
  ];

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Ionicons
            name="snow-outline"
            size={30}
            color={colors.textLight}
          />

          <View style={styles.flex}>
            <Text style={styles.title}>Aire acondicionado</Text>
            <Text style={styles.subtitle}>
              BTU, tuberías, cableado, drenaje e instalación.
            </Text>
          </View>
        </View>

        <Section
          title="Espacio y equipos"
          description="Usa las medidas del área o escribe el área directamente."
        >
          <Grid fields={areaFields} form={form} update={update} />
          <Text style={styles.info}>
            Área bruta: {formatDecimal(grossArea, 2, currency)} m²
          </Text>
        </Section>

        <Section
          title="Carga térmica"
          description="La capacidad es una estimación configurable para presupuestar."
        >
          <Grid fields={loadFields} form={form} update={update} />
          <Text style={styles.warning}>
            La selección definitiva del equipo debe verificarse con las
            condiciones reales del sitio, aislamiento, orientación y cargas
            internas.
          </Text>
        </Section>

        <Section
          title="Instalación"
          description="Configura los recorridos promedio por cada equipo."
        >
          <Grid fields={routeFields} form={form} update={update} />
        </Section>

        <Section
          title="Precios"
          description="Puedes tomarlos del catálogo de tu empresa."
        >
          <CatalogButton
            label="Equipo de aire acondicionado"
            value={selected.equipment}
            onPress={() => setTarget("equipment")}
          />
          <CatalogButton
            label="Par de tuberías de cobre por metro adicional"
            value={selected.copper}
            onPress={() => setTarget("copper")}
          />
          <CatalogButton
            label="Cable eléctrico por metro"
            value={selected.cable}
            onPress={() => setTarget("cable")}
          />
          <CatalogButton
            label="Tubería de drenaje por pieza"
            value={selected.drain}
            onPress={() => setTarget("drain")}
          />
          <CatalogButton
            label="Soporte de condensadora"
            value={selected.bracket}
            onPress={() => setTarget("bracket")}
          />
          <CatalogButton
            label="Breaker"
            value={selected.breaker}
            onPress={() => setTarget("breaker")}
          />
          <CatalogButton
            label="Desconectivo o safety"
            value={selected.disconnect}
            onPress={() => setTarget("disconnect")}
          />
          <CatalogButton
            label="Refrigerante por kilogramo"
            value={selected.refrigerant}
            onPress={() => setTarget("refrigerant")}
          />
          <CatalogButton
            label="Accesorios e insumos"
            value={selected.supplies}
            onPress={() => setTarget("supplies")}
          />
          <CatalogButton
            label="Instalación por equipo"
            value={selected.labor}
            onPress={() => setTarget("labor")}
          />
          <CatalogButton
            label="Perforación por equipo"
            value={selected.coreDrilling}
            onPress={() => setTarget("coreDrilling")}
          />

          <View style={styles.grid}>
            <Input label="Equipo por unidad" value={form.equipmentPrice} onChangeText={(v) => update("equipmentPrice", v)} unit="B/." />
            <Input label="Cobre adicional por metro" value={form.copperMeterPrice} onChangeText={(v) => update("copperMeterPrice", v)} unit="B/." />
            <Input label="Cable por metro" value={form.cableMeterPrice} onChangeText={(v) => update("cableMeterPrice", v)} unit="B/." />
            <Input label="Drenaje por pieza" value={form.drainPiecePrice} onChangeText={(v) => update("drainPiecePrice", v)} unit="B/." />
            <Input label="Soporte por juego" value={form.bracketPrice} onChangeText={(v) => update("bracketPrice", v)} unit="B/." />
            <Input label="Breaker por unidad" value={form.breakerPrice} onChangeText={(v) => update("breakerPrice", v)} unit="B/." />
            <Input label="Desconectivo por unidad" value={form.disconnectPrice} onChangeText={(v) => update("disconnectPrice", v)} unit="B/." />
            <Input label="Refrigerante por kg" value={form.refrigerantKgPrice} onChangeText={(v) => update("refrigerantKgPrice", v)} unit="B/." />
            <Input label="Accesorios e insumos" value={form.suppliesPrice} onChangeText={(v) => update("suppliesPrice", v)} unit="B/." />
            <Input label="Instalación por equipo" value={form.laborUnitPrice} onChangeText={(v) => update("laborUnitPrice", v)} unit="B/." />
            <Input label="Perforación por equipo" value={form.coreDrillingPrice} onChangeText={(v) => update("coreDrillingPrice", v)} unit="B/." />
          </View>
        </Section>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={calculate} style={styles.primary}>
          <Text style={styles.primaryText}>
            Calcular aire acondicionado
          </Text>
        </Pressable>

        {result ? (
          <Results
            result={result}
            currency={currency}
            onAdd={addToBudget}
          />
        ) : null}

        {message ? (
          <Text style={styles.success}>{message}</Text>
        ) : null}
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
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.primary}
      />
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
        target === "labor" || target === "coreDrilling"
          ? item.item_type === "labor" ||
            item.item_type === "service"
          : item.item_type === "material",
      ),
    [items, target],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modal}>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>Cerrar</Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={styles.item}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.price}>
                  {formatMoney(
                    item.sale_price || item.unit_cost,
                    currency,
                  )}
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
  result: AirConditioningResult;
  currency?: string;
  onAdd: () => void;
}) {
  const money = (value: number) => formatMoney(value, currency);
  const decimal = (value: number, digits = 2) =>
    formatDecimal(value, digits, currency);

  return (
    <View style={styles.results}>
      <Text style={styles.sectionTitle}>Resultado</Text>
      <Text>Área neta: {decimal(result.netArea)} m²</Text>
      <Text>
        Carga térmica estimada: {decimal(result.designLoadBtu, 0)} BTU
      </Text>
      <Text>
        Capacidad recomendada: {decimal(result.recommendedCapacityPerUnit, 0)} BTU por equipo
      </Text>
      <Text>
        Capacidad utilizada: {decimal(result.selectedCapacityPerUnit, 0)} BTU por equipo
      </Text>
      <Text>
        Capacidad instalada total: {decimal(result.totalInstalledCapacity, 0)} BTU
      </Text>
      <Text>
        Tubería de cobre: {decimal(result.copperMeters)} m · adicional cobrable {decimal(result.extraCopperMeters)} m
      </Text>
      <Text>Cable eléctrico: {decimal(result.cableMeters)} m</Text>
      <Text>
        Drenaje: {decimal(result.drainMeters)} m · comprar {result.drainPieces} piezas
      </Text>
      <Text>
        Soportes: {result.brackets} · Breakers: {result.breakers} · Desconectivos: {result.disconnects}
      </Text>
      <Text>
        Refrigerante adicional: {decimal(result.refrigerantKilograms, 3)} kg
      </Text>
      <Text>Materiales: {money(result.materialsCost)}</Text>
      <Text>Mano de obra: {money(result.laborCost)}</Text>
      <Text style={styles.total}>Total: {money(result.totalCost)}</Text>

      <Pressable onPress={onAdd} style={styles.primary}>
        <Text style={styles.primaryText}>
          Agregar al presupuesto
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 44,
  },
  flex: {
    flex: 1,
  },
  hero: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  title: {
    color: colors.textLight,
    fontSize: 21,
    fontWeight: "900",
  },
  subtitle: {
    color: "#CBD5E1",
    fontSize: 13,
  },
  section: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  small: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  body: {
    marginTop: 14,
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  inputGroup: {
    width: "48%",
    minWidth: 135,
    flexGrow: 1,
  },
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
  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
  },
  unit: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  info: {
    padding: 12,
    backgroundColor: "#EFF6FF",
    color: "#1E3A8A",
    borderRadius: radius.md,
  },
  warning: {
    padding: 12,
    backgroundColor: "#FFF7ED",
    color: "#9A3412",
    borderRadius: radius.md,
    fontSize: 12,
    lineHeight: 18,
  },
  catalog: {
    minHeight: 58,
    padding: 14,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
  },
  catalogValue: {
    color: colors.primary,
    fontSize: 12,
  },
  primary: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryText: {
    color: colors.textLight,
    fontWeight: "900",
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    padding: 12,
  },
  success: {
    color: colors.primary,
    padding: 12,
  },
  results: {
    padding: 18,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: 8,
    marginBottom: 16,
  },
  total: {
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 8,
  },
  modal: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  close: {
    color: colors.primary,
    fontWeight: "900",
    marginBottom: 16,
  },
  item: {
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemName: {
    flex: 1,
    color: colors.text,
    fontWeight: "800",
  },
  price: {
    color: colors.primary,
    fontWeight: "900",
  },
});
