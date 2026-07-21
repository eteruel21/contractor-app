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
  calculateElectrical,
  type ElectricalResult,
} from "../../services/calculators/electricidad";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type Target =
  | "lightingCable"
  | "powerCable"
  | "conduit"
  | "box"
  | "outlet"
  | "switch"
  | "breaker"
  | "supplies"
  | "standardLabor"
  | "dedicatedLabor";

type Form = {
  lightPoints: string;
  switchPoints: string;
  outletPoints: string;
  dedicatedPoints: string;
  averageRouteLength: string;
  lightingConductors: string;
  powerConductors: string;
  waste: string;
  cableRollLength: string;
  conduitPieceLength: string;
  lightingPointsPerCircuit: string;
  outletPointsPerCircuit: string;
  lightingCableRollPrice: string;
  powerCableRollPrice: string;
  conduitPiecePrice: string;
  boxUnitPrice: string;
  outletUnitPrice: string;
  switchUnitPrice: string;
  breakerUnitPrice: string;
  suppliesPrice: string;
  standardLaborPrice: string;
  dedicatedLaborPrice: string;
};

type Saved = Omit<
  Form,
  | "lightPoints"
  | "switchPoints"
  | "outletPoints"
  | "dedicatedPoints"
>;

const KEY = "@contractor-pro/electrical-settings";

const initial: Form = {
  lightPoints: "0",
  switchPoints: "0",
  outletPoints: "0",
  dedicatedPoints: "0",
  averageRouteLength: "8",
  lightingConductors: "3",
  powerConductors: "3",
  waste: "10",
  cableRollLength: "100",
  conduitPieceLength: "3",
  lightingPointsPerCircuit: "8",
  outletPointsPerCircuit: "6",
  lightingCableRollPrice: "",
  powerCableRollPrice: "",
  conduitPiecePrice: "",
  boxUnitPrice: "",
  outletUnitPrice: "",
  switchUnitPrice: "",
  breakerUnitPrice: "",
  suppliesPrice: "",
  standardLaborPrice: "",
  dedicatedLaborPrice: "",
};

function num(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ElectricalScreen() {
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
    useState<ElectricalResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] =
    useState<CatalogItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  const totalPoints =
    num(form.lightPoints) +
    num(form.switchPoints) +
    num(form.outletPoints) +
    num(form.dedicatedPoints);

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
      lightPoints: _lightPoints,
      switchPoints: _switchPoints,
      outletPoints: _outletPoints,
      dedicatedPoints: _dedicatedPoints,
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
      lightingCable: "lightingCableRollPrice",
      powerCable: "powerCableRollPrice",
      conduit: "conduitPiecePrice",
      box: "boxUnitPrice",
      outlet: "outletUnitPrice",
      switch: "switchUnitPrice",
      breaker: "breakerUnitPrice",
      supplies: "suppliesPrice",
      standardLabor: "standardLaborPrice",
      dedicatedLabor: "dedicatedLaborPrice",
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
    if (!totalPoints) {
      setError("Introduce al menos un punto eléctrico.");
      return;
    }

    if (
      !num(form.averageRouteLength) ||
      !num(form.cableRollLength) ||
      !num(form.conduitPieceLength)
    ) {
      setError(
        "Revisa las longitudes de recorrido, rollo y tubería.",
      );
      return;
    }

    if (
      !num(form.lightingConductors) ||
      !num(form.powerConductors) ||
      !num(form.lightingPointsPerCircuit) ||
      !num(form.outletPointsPerCircuit)
    ) {
      setError(
        "Revisa los conductores y la capacidad por circuito.",
      );
      return;
    }

    setResult(
      calculateElectrical(
        {
          lightPoints: num(form.lightPoints),
          switchPoints: num(form.switchPoints),
          outletPoints: num(form.outletPoints),
          dedicatedPoints: num(form.dedicatedPoints),
          averageRouteLength: num(
            form.averageRouteLength,
          ),
          lightingConductors: num(
            form.lightingConductors,
          ),
          powerConductors: num(
            form.powerConductors,
          ),
          wastePercentage: num(form.waste),
          cableRollLength: num(form.cableRollLength),
          conduitPieceLength: num(
            form.conduitPieceLength,
          ),
          lightingPointsPerCircuit: num(
            form.lightingPointsPerCircuit,
          ),
          outletPointsPerCircuit: num(
            form.outletPointsPerCircuit,
          ),
        },
        {
          lightingCableRoll: num(
            form.lightingCableRollPrice,
          ),
          powerCableRoll: num(
            form.powerCableRollPrice,
          ),
          conduitPiece: num(form.conduitPiecePrice),
          boxUnit: num(form.boxUnitPrice),
          outletUnit: num(form.outletUnitPrice),
          switchUnit: num(form.switchUnitPrice),
          breakerUnit: num(form.breakerUnitPrice),
          supplies: num(form.suppliesPrice),
          laborStandardPoint: num(
            form.standardLaborPrice,
          ),
          laborDedicatedPoint: num(
            form.dedicatedLaborPrice,
          ),
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

    const unitPrice =
      result.totalCost / result.totalPoints;

    const response = await addBudgetItem({
      companyId: activeCompany.id,
      budgetId,
      itemType: "service",
      description:
        `Instalación eléctrica (` +
        `${result.totalPoints} puntos)`,
      unitName: "punto",
      quantity: result.totalPoints,
      unitCost: unitPrice,
      unitPrice,
      taxable: true,
      notes:
        `${result.lightingCableRollsToBuy} rollos de cable de iluminación · ` +
        `${result.powerCableRollsToBuy} rollos de cable de potencia · ` +
        `${result.conduitPieces} tubos · ` +
        `${result.totalBreakers} breakers`,
    });

    if (response.error) {
      Alert.alert(
        "No fue posible agregar la partida",
        response.error,
      );
    } else {
      setMessage(
        "La partida fue guardada en el presupuesto.",
      );
    }
  }

  const pointFields: Array<
    [keyof Form, string, string]
  > = [
    ["lightPoints", "Puntos de luz", "und."],
    ["switchPoints", "Interruptores", "und."],
    ["outletPoints", "Tomacorrientes", "und."],
    ["dedicatedPoints", "Puntos dedicados", "und."],
  ];

  const routeFields: Array<
    [keyof Form, string, string]
  > = [
    [
      "averageRouteLength",
      "Recorrido promedio por punto",
      "m",
    ],
    [
      "lightingConductors",
      "Conductores iluminación",
      "hilos",
    ],
    [
      "powerConductors",
      "Conductores potencia",
      "hilos",
    ],
    ["waste", "Desperdicio", "%"],
    ["cableRollLength", "Longitud del rollo", "m"],
    [
      "conduitPieceLength",
      "Longitud de tubería",
      "m/pza.",
    ],
  ];

  const circuitFields: Array<
    [keyof Form, string, string]
  > = [
    [
      "lightingPointsPerCircuit",
      "Luces por circuito",
      "puntos",
    ],
    [
      "outletPointsPerCircuit",
      "Tomas por circuito",
      "puntos",
    ],
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
            name="flash-outline"
            size={30}
            color={colors.textLight}
          />

          <View style={styles.flex}>
            <Text style={styles.title}>Electricidad</Text>
            <Text style={styles.subtitle}>
              Puntos, cables, tuberías, breakers y accesorios.
            </Text>
          </View>
        </View>

        <Section
          title="Puntos eléctricos"
          description="Indica la cantidad de puntos que instalarás."
        >
          <Grid
            fields={pointFields}
            form={form}
            update={update}
          />
          <Text style={styles.info}>
            Total estimado:{" "}
            {formatDecimal(totalPoints, 0, currency)} puntos
          </Text>
        </Section>

        <Section
          title="Cableado y canalización"
          description="Configura recorridos, conductores y presentaciones."
        >
          <Grid
            fields={routeFields}
            form={form}
            update={update}
          />
        </Section>

        <Section
          title="Circuitos y breakers"
          description="Cada punto dedicado genera un circuito independiente."
        >
          <Grid
            fields={circuitFields}
            form={form}
            update={update}
          />
        </Section>

        <Section
          title="Precios"
          description="Puedes tomarlos del catálogo de tu empresa."
        >
          <CatalogButton
            label="Cable de iluminación por rollo"
            value={selected.lightingCable}
            onPress={() => setTarget("lightingCable")}
          />
          <CatalogButton
            label="Cable de potencia por rollo"
            value={selected.powerCable}
            onPress={() => setTarget("powerCable")}
          />
          <CatalogButton
            label="Tubería por pieza"
            value={selected.conduit}
            onPress={() => setTarget("conduit")}
          />
          <CatalogButton
            label="Caja eléctrica"
            value={selected.box}
            onPress={() => setTarget("box")}
          />
          <CatalogButton
            label="Tomacorriente"
            value={selected.outlet}
            onPress={() => setTarget("outlet")}
          />
          <CatalogButton
            label="Interruptor"
            value={selected.switch}
            onPress={() => setTarget("switch")}
          />
          <CatalogButton
            label="Breaker"
            value={selected.breaker}
            onPress={() => setTarget("breaker")}
          />
          <CatalogButton
            label="Accesorios e insumos"
            value={selected.supplies}
            onPress={() => setTarget("supplies")}
          />
          <CatalogButton
            label="Mano de obra por punto"
            value={selected.standardLabor}
            onPress={() => setTarget("standardLabor")}
          />
          <CatalogButton
            label="Mano de obra punto dedicado"
            value={selected.dedicatedLabor}
            onPress={() => setTarget("dedicatedLabor")}
          />

          <View style={styles.grid}>
            <Input
              label="Rollo cable iluminación"
              value={form.lightingCableRollPrice}
              onChangeText={(value) =>
                update("lightingCableRollPrice", value)}
              unit="B/."
            />
            <Input
              label="Rollo cable potencia"
              value={form.powerCableRollPrice}
              onChangeText={(value) =>
                update("powerCableRollPrice", value)}
              unit="B/."
            />
            <Input
              label="Tubería por pieza"
              value={form.conduitPiecePrice}
              onChangeText={(value) =>
                update("conduitPiecePrice", value)}
              unit="B/."
            />
            <Input
              label="Caja por unidad"
              value={form.boxUnitPrice}
              onChangeText={(value) =>
                update("boxUnitPrice", value)}
              unit="B/."
            />
            <Input
              label="Tomacorriente"
              value={form.outletUnitPrice}
              onChangeText={(value) =>
                update("outletUnitPrice", value)}
              unit="B/."
            />
            <Input
              label="Interruptor"
              value={form.switchUnitPrice}
              onChangeText={(value) =>
                update("switchUnitPrice", value)}
              unit="B/."
            />
            <Input
              label="Breaker"
              value={form.breakerUnitPrice}
              onChangeText={(value) =>
                update("breakerUnitPrice", value)}
              unit="B/."
            />
            <Input
              label="Accesorios e insumos"
              value={form.suppliesPrice}
              onChangeText={(value) =>
                update("suppliesPrice", value)}
              unit="B/."
            />
            <Input
              label="Mano de obra por punto"
              value={form.standardLaborPrice}
              onChangeText={(value) =>
                update("standardLaborPrice", value)}
              unit="B/."
            />
            <Input
              label="Mano de obra dedicado"
              value={form.dedicatedLaborPrice}
              onChangeText={(value) =>
                update("dedicatedLaborPrice", value)}
              unit="B/."
            />
          </View>
        </Section>

        <Text style={styles.notice}>
          La estimación no incluye luminarias, paneles ni equipos
          finales. Agrégalos como insumos cuando correspondan.
        </Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Pressable
          onPress={calculate}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>
            Calcular electricidad
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
    <Pressable
      onPress={onPress}
      style={styles.catalog}
    >
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
  const laborTarget =
    target === "standardLabor" ||
    target === "dedicatedLabor";

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        laborTarget
          ? item.item_type === "labor" ||
            item.item_type === "service"
          : item.item_type === "material",
      ),
    [items, laborTarget],
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
            keyExtractor={(item: CatalogItemWithDetails) =>
              item.id}
            renderItem={({
              item,
            }: {
              item: CatalogItemWithDetails;
            }) => (
              <Pressable
                onPress={() => onSelect(item)}
                style={styles.item}
              >
                <Text style={styles.itemName}>
                  {item.name}
                </Text>
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
  result: ElectricalResult;
  currency?: string;
  onAdd: () => void;
}) {
  const money = (value: number) =>
    formatMoney(value, currency);

  return (
    <View style={styles.results}>
      <Text style={styles.sectionTitle}>Resultado</Text>

      <Text>
        Puntos totales: {result.totalPoints}
      </Text>
      <Text>
        Cable de iluminación:{" "}
        {formatDecimal(
          result.lightingCableMeters,
          2,
          currency,
        )}{" "}
        m · Comprar {result.lightingCableRollsToBuy} rollos
      </Text>
      <Text>
        Cable de potencia:{" "}
        {formatDecimal(
          result.powerCableMeters,
          2,
          currency,
        )}{" "}
        m · Comprar {result.powerCableRollsToBuy} rollos
      </Text>
      <Text>
        Tubería:{" "}
        {formatDecimal(
          result.conduitMeters,
          2,
          currency,
        )}{" "}
        m · Comprar {result.conduitPieces} piezas
      </Text>
      <Text>
        Cajas eléctricas: {result.boxes}
      </Text>
      <Text>
        Circuitos: {result.lightingCircuits} iluminación ·{" "}
        {result.outletCircuits} tomacorrientes ·{" "}
        {result.dedicatedCircuits} dedicados
      </Text>
      <Text>
        Breakers: {result.totalBreakers}
      </Text>
      <Text>
        Materiales: {money(result.materialsCost)}
      </Text>
      <Text>
        Mano de obra: {money(result.laborCost)}
      </Text>
      <Text style={styles.total}>
        Total: {money(result.totalCost)}
      </Text>

      <Pressable
        onPress={onAdd}
        style={styles.primary}
      >
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
  notice: {
    padding: 12,
    marginBottom: 16,
    borderRadius: radius.md,
    backgroundColor: "#FFF7ED",
    color: "#9A3412",
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
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryText: {
    color: colors.textLight,
    fontWeight: "900",
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
  },
  itemName: {
    color: colors.text,
    fontWeight: "800",
  },
  price: {
    color: colors.primary,
    fontWeight: "900",
  },
});
