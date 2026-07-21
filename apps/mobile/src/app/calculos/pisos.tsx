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
  calculateFlooring,
  type FlooringResult,
} from "../../services/calculators/pisos";
import { formatDecimal, formatMoney } from "../../utils/format";
import { loadLocalData, saveLocalData } from "../../utils/local-storage";

type FloorType = "ceramica" | "porcelanato";
type Target = "floor" | "adhesive" | "grout" | "supplies" | "labor";

type Form = {
  length: string;
  width: string;
  directArea: string;
  excludedArea: string;
  tileLengthCm: string;
  tileWidthCm: string;
  piecesPerBox: string;
  waste: string;
  adhesiveCoverage: string;
  groutJointWidthMm: string;
  groutJointDepthMm: string;
  groutBagKg: string;
  floorBoxPrice: string;
  adhesiveBagPrice: string;
  groutBagPrice: string;
  suppliesPrice: string;
  laborPrice: string;
};

type Saved = Omit<
  Form,
  "length" | "width" | "directArea" | "excludedArea"
> & {
  floorType: FloorType;
};

const KEY = "@contractor-pro/flooring-settings";

const initial: Form = {
  length: "",
  width: "",
  directArea: "",
  excludedArea: "0",
  tileLengthCm: "60",
  tileWidthCm: "60",
  piecesPerBox: "4",
  waste: "10",
  adhesiveCoverage: "4",
  groutJointWidthMm: "3",
  groutJointDepthMm: "8",
  groutBagKg: "2",
  floorBoxPrice: "",
  adhesiveBagPrice: "",
  groutBagPrice: "",
  suppliesPrice: "",
  laborPrice: "",
};

function num(value: string) {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function FlooringScreen() {
  const params = useLocalSearchParams<{
    budgetId?: string | string[];
  }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0]
    : params.budgetId;

  const { activeCompany } = useCompany();
  const currency = activeCompany?.currency_code;

  const [form, setForm] = useState<Form>(initial);
  const [floorType, setFloorType] = useState<FloorType>("porcelanato");
  const [result, setResult] = useState<FlooringResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [items, setItems] = useState<CatalogItemWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Target | null>(null);
  const [selected, setSelected] =
    useState<Partial<Record<Target, string>>>({});

  const grossArea =
    num(form.directArea) || num(form.length) * num(form.width);
  const netArea = Math.max(grossArea - num(form.excludedArea), 0);

  useEffect(() => {
    async function restore() {
      const saved = await loadLocalData<Saved>(KEY);
      if (saved) {
        const { floorType: savedFloorType, ...settings } = saved;
        setForm((current) => ({ ...current, ...settings }));
        setFloorType(savedFloorType ?? "porcelanato");
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
      ...settings
    } = form;

    void saveLocalData<Saved>(KEY, {
      ...settings,
      floorType,
    });
  }, [floorType, form, loaded]);

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
      floor: "floorBoxPrice",
      adhesive: "adhesiveBagPrice",
      grout: "groutBagPrice",
      supplies: "suppliesPrice",
      labor: "laborPrice",
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
      setError(
        "El área excluida debe ser menor que el área total.",
      );
      return;
    }

    if (
      !num(form.tileLengthCm) ||
      !num(form.tileWidthCm) ||
      !num(form.piecesPerBox)
    ) {
      setError(
        "Revisa las medidas del piso y las piezas por caja.",
      );
      return;
    }

    if (
      !num(form.adhesiveCoverage) ||
      !num(form.groutJointWidthMm) ||
      !num(form.groutJointDepthMm) ||
      !num(form.groutBagKg)
    ) {
      setError(
        "Revisa el rendimiento del adhesivo y los datos de boquilla.",
      );
      return;
    }

    setResult(
      calculateFlooring(
        {
          grossArea,
          excludedArea: num(form.excludedArea),
          tileLengthCm: num(form.tileLengthCm),
          tileWidthCm: num(form.tileWidthCm),
          piecesPerBox: num(form.piecesPerBox),
          wastePercentage: num(form.waste),
          adhesiveCoveragePerBag: num(
            form.adhesiveCoverage,
          ),
          groutJointWidthMm: num(
            form.groutJointWidthMm,
          ),
          groutJointDepthMm: num(
            form.groutJointDepthMm,
          ),
          groutBagKilograms: num(form.groutBagKg),
        },
        {
          flooringBox: num(form.floorBoxPrice),
          adhesiveBag: num(form.adhesiveBagPrice),
          groutBag: num(form.groutBagPrice),
          supplies: num(form.suppliesPrice),
          laborSquareMeter: num(form.laborPrice),
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

    const unitPrice = result.totalCost / result.netArea;
    const floorLabel =
      floorType === "ceramica" ? "Cerámica" : "Porcelanato";

    const response = await addBudgetItem({
      companyId: activeCompany.id,
      budgetId,
      itemType: "service",
      description:
        `${floorLabel} ${form.tileLengthCm} × ` +
        `${form.tileWidthCm} cm`,
      unitName: "m²",
      quantity: result.netArea,
      unitCost: unitPrice,
      unitPrice,
      taxable: true,
      notes:
        `${result.boxesToBuy} cajas · ` +
        `${result.adhesiveBagsToBuy} sacos de adhesivo · ` +
        `${result.groutBagsToBuy} bolsas de boquilla`,
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

  const areaFields: [keyof Form, string, string][] = [
    ["length", "Largo", "m"],
    ["width", "Ancho", "m"],
    ["directArea", "Área directa (opcional)", "m²"],
    ["excludedArea", "Área excluida", "m²"],
  ];

  const materialFields: [keyof Form, string, string][] = [
    ["tileLengthCm", "Largo de pieza", "cm"],
    ["tileWidthCm", "Ancho de pieza", "cm"],
    ["piecesPerBox", "Piezas por caja", "und."],
    ["waste", "Desperdicio", "%"],
    [
      "adhesiveCoverage",
      "Rendimiento adhesivo",
      "m²/saco",
    ],
    ["groutJointWidthMm", "Ancho de junta", "mm"],
    ["groutJointDepthMm", "Profundidad junta", "mm"],
    ["groutBagKg", "Presentación boquilla", "kg"],
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
            name="square-outline"
            size={30}
            color={colors.textLight}
          />

          <View style={styles.flex}>
            <Text style={styles.title}>Pisos</Text>
            <Text style={styles.subtitle}>
              Cerámica, porcelanato, adhesivo y boquilla.
            </Text>
          </View>
        </View>

        <Section
          title="Tipo de acabado"
          description="Selecciona el material que vas a instalar."
        >
          <View style={styles.segment}>
            <TypeButton
              active={floorType === "ceramica"}
              label="Cerámica"
              onPress={() => setFloorType("ceramica")}
            />
            <TypeButton
              active={floorType === "porcelanato"}
              label="Porcelanato"
              onPress={() => setFloorType("porcelanato")}
            />
          </View>
        </Section>

        <Section
          title="Área del piso"
          description="Usa largo y ancho o escribe el área directa."
        >
          <Grid
            fields={areaFields}
            form={form}
            update={update}
          />
          <Text style={styles.info}>
            Área útil:{" "}
            {formatDecimal(netArea, 2, currency)} m²
          </Text>
        </Section>

        <Section
          title="Materiales"
          description="Configura la pieza, el empaque y los rendimientos."
        >
          <Grid
            fields={materialFields}
            form={form}
            update={update}
          />
        </Section>

        <Section
          title="Precios"
          description="Puedes tomarlos del catálogo de tu empresa."
        >
          <CatalogButton
            label={floorType === "ceramica"
              ? "Cerámica"
              : "Porcelanato"}
            value={selected.floor}
            onPress={() => setTarget("floor")}
          />
          <CatalogButton
            label="Adhesivo"
            value={selected.adhesive}
            onPress={() => setTarget("adhesive")}
          />
          <CatalogButton
            label="Boquilla"
            value={selected.grout}
            onPress={() => setTarget("grout")}
          />
          <CatalogButton
            label="Insumos adicionales"
            value={selected.supplies}
            onPress={() => setTarget("supplies")}
          />
          <CatalogButton
            label="Mano de obra"
            value={selected.labor}
            onPress={() => setTarget("labor")}
          />

          <View style={styles.grid}>
            <Input
              label="Precio por caja"
              value={form.floorBoxPrice}
              onChangeText={(value) =>
                update("floorBoxPrice", value)}
              unit="B/."
            />
            <Input
              label="Adhesivo por saco"
              value={form.adhesiveBagPrice}
              onChangeText={(value) =>
                update("adhesiveBagPrice", value)}
              unit="B/."
            />
            <Input
              label="Boquilla por bolsa"
              value={form.groutBagPrice}
              onChangeText={(value) =>
                update("groutBagPrice", value)}
              unit="B/."
            />
            <Input
              label="Insumos"
              value={form.suppliesPrice}
              onChangeText={(value) =>
                update("suppliesPrice", value)}
              unit="B/."
            />
            <Input
              label="Mano de obra por m²"
              value={form.laborPrice}
              onChangeText={(value) =>
                update("laborPrice", value)}
              unit="B/."
            />
          </View>
        </Section>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <Pressable
          onPress={calculate}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>
            Calcular pisos
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
  fields: [keyof Form, string, string][];
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

function TypeButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.typeButton,
        active && styles.typeButtonActive,
      ]}
    >
      <Text
        style={[
          styles.typeButtonText,
          active && styles.typeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  const filtered = useMemo(
    () =>
      items.filter((item) =>
        target === "labor"
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
  result: FlooringResult;
  currency?: string;
  onAdd: () => void;
}) {
  const money = (value: number) =>
    formatMoney(value, currency);

  return (
    <View style={styles.results}>
      <Text style={styles.sectionTitle}>Resultado</Text>

      <Text>
        Área útil:{" "}
        {formatDecimal(result.netArea, 2, currency)} m²
      </Text>
      <Text>
        Área con desperdicio:{" "}
        {formatDecimal(
          result.areaWithWaste,
          2,
          currency,
        )}{" "}
        m²
      </Text>
      <Text>
        Piso: {result.piecesToBuy} piezas · Comprar{" "}
        {result.boxesToBuy} cajas
      </Text>
      <Text>
        Adhesivo:{" "}
        {formatDecimal(
          result.adhesiveBagsExact,
          2,
          currency,
        )}{" "}
        sacos · Comprar {result.adhesiveBagsToBuy}
      </Text>
      <Text>
        Boquilla:{" "}
        {formatDecimal(
          result.groutKilograms,
          2,
          currency,
        )}{" "}
        kg · Comprar {result.groutBagsToBuy} bolsas
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
  segment: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontWeight: "800",
  },
  typeButtonTextActive: {
    color: colors.primary,
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
