import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { useFormulaParameters } from "../../hooks/useFormulaParameters";
import { addBudgetItem } from "../../services/budget-service";
import { listCatalogItems } from "../../services/catalog-service";
import type { CatalogItemWithDetails } from "../../types/catalog";
import {
  calculateConcrete,
  type AggregatePriceMode,
  type ConcreteResult,
} from "../../services/calculators/concreto";
import {
  loadLocalData,
  saveLocalData,
} from "../../utils/local-storage";
import {
  getFormulaNumber,
} from "../../utils/formula-parameters";
import {
  formatMoney as formatMoneyUtil,
  formatDecimal as formatDecimalUtil,
} from "../../utils/format";

type CatalogPriceTarget =
  | "cement"
  | "sand"
  | "gravel"
  | "labor";

type FormState = {
  length: string;
  width: string;
  thickness: string;
  wastePercentage: string;

  cementRatio: string;
  sandRatio: string;
  gravelRatio: string;

  cementBagWeight: string;
  sandBagVolume: string;
  gravelBagVolume: string;

  cementPrice: string;

  sandCubicMeterPrice: string;
  sandBagPrice: string;

  gravelCubicMeterPrice: string;
  gravelBagPrice: string;

  laborPrice: string;
};

type ConcreteSavedSettings = Pick<
  FormState,
  | "wastePercentage"
  | "cementRatio"
  | "sandRatio"
  | "gravelRatio"
  | "cementBagWeight"
  | "sandBagVolume"
  | "gravelBagVolume"
  | "cementPrice"
  | "sandCubicMeterPrice"
  | "sandBagPrice"
  | "gravelCubicMeterPrice"
  | "gravelBagPrice"
  | "laborPrice"
> & {
  sandPriceMode: AggregatePriceMode;
  gravelPriceMode: AggregatePriceMode;
};

const CONCRETE_SETTINGS_KEY =
  "@contractor-pro/concrete-settings";

const initialForm: FormState = {
  length: "",
  width: "",
  thickness: "",
  wastePercentage: "5",

  cementRatio: "1",
  sandRatio: "2",
  gravelRatio: "3",

  cementBagWeight: "42.5",
  sandBagVolume: "0.0142",
  gravelBagVolume: "0.0142",

  cementPrice: "",

  sandCubicMeterPrice: "",
  sandBagPrice: "",

  gravelCubicMeterPrice: "",
  gravelBagPrice: "",

  laborPrice: "",
};

function parseNumber(value: string): number {
  const normalized = value.replace(",", ".").trim();
  const result = Number(normalized);

  return Number.isFinite(result) ? result : 0;
}

// Las funciones de formato se definen dinámicamente dentro del componente para usar la moneda de la empresa

export default function ConcreteCalculatorScreen() {
  const params = useLocalSearchParams<{
    budgetId?: string | string[];
  }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0]
    : params.budgetId;

  const { activeCompany } = useCompany();
  const {
    parameters: formulaParameters,
  } = useFormulaParameters(
    activeCompany?.id,
    "concrete_standard",
  );

  const formatNumber = (val: number, maxDigits = 2) => {
    return formatDecimalUtil(val, maxDigits, activeCompany?.currency_code);
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [sandPriceMode, setSandPriceMode] =
    useState<AggregatePriceMode>("cubicMeter");
  const [gravelPriceMode, setGravelPriceMode] =
    useState<AggregatePriceMode>("cubicMeter");
  const [result, setResult] =
    useState<ConcreteResult | null>(null);
  const [error, setError] = useState("");
  const [settingsLoaded, setSettingsLoaded] =
    useState(false);
  const [budgetMessage, setBudgetMessage] = useState("");
  const [catalogItems, setCatalogItems] = useState<
    CatalogItemWithDetails[]
  >([]);
  const [catalogLoading, setCatalogLoading] =
    useState(false);
  const [catalogTarget, setCatalogTarget] =
    useState<CatalogPriceTarget | null>(null);
  const [selectedCatalogNames, setSelectedCatalogNames] =
    useState<Partial<Record<CatalogPriceTarget, string>>>({});

  useEffect(() => {
    const companyId = activeCompany?.id;

    if (!companyId) return;

    async function loadCatalog(id: string) {
      setCatalogLoading(true);

      const {
        items,
        error: catalogError,
      } = await listCatalogItems(id);

      if (catalogError) {
        Alert.alert(
          "No fue posible cargar el catálogo",
          catalogError,
        );
      } else {
        setCatalogItems(items);
      }

      setCatalogLoading(false);
    }

    void loadCatalog(companyId);
  }, [activeCompany]);

  useEffect(() => {
    async function loadSavedSettings() {
      const saved =
        await loadLocalData<ConcreteSavedSettings>(
          CONCRETE_SETTINGS_KEY,
        );

      if (saved) {
        setForm((current) => ({
          ...current,
          wastePercentage:
            saved.wastePercentage ??
            current.wastePercentage,
          cementRatio:
            saved.cementRatio ?? current.cementRatio,
          sandRatio:
            saved.sandRatio ?? current.sandRatio,
          gravelRatio:
            saved.gravelRatio ?? current.gravelRatio,
          cementBagWeight:
            saved.cementBagWeight ??
            current.cementBagWeight,
          sandBagVolume:
            saved.sandBagVolume ??
            current.sandBagVolume,
          gravelBagVolume:
            saved.gravelBagVolume ??
            current.gravelBagVolume,
          cementPrice:
            saved.cementPrice ?? current.cementPrice,
          sandCubicMeterPrice:
            saved.sandCubicMeterPrice ??
            current.sandCubicMeterPrice,
          sandBagPrice:
            saved.sandBagPrice ??
            current.sandBagPrice,
          gravelCubicMeterPrice:
            saved.gravelCubicMeterPrice ??
            current.gravelCubicMeterPrice,
          gravelBagPrice:
            saved.gravelBagPrice ??
            current.gravelBagPrice,
          laborPrice:
            saved.laborPrice ?? current.laborPrice,
        }));

        setSandPriceMode(
          saved.sandPriceMode ?? "cubicMeter",
        );
        setGravelPriceMode(
          saved.gravelPriceMode ?? "cubicMeter",
        );
      }

      setSettingsLoaded(true);
    }

    void loadSavedSettings();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) {
      return;
    }

    const settings: ConcreteSavedSettings = {
      wastePercentage: form.wastePercentage,
      cementRatio: form.cementRatio,
      sandRatio: form.sandRatio,
      gravelRatio: form.gravelRatio,
      cementBagWeight: form.cementBagWeight,
      sandBagVolume: form.sandBagVolume,
      gravelBagVolume: form.gravelBagVolume,
      cementPrice: form.cementPrice,
      sandCubicMeterPrice:
        form.sandCubicMeterPrice,
      sandBagPrice: form.sandBagPrice,
      gravelCubicMeterPrice:
        form.gravelCubicMeterPrice,
      gravelBagPrice: form.gravelBagPrice,
      laborPrice: form.laborPrice,
      sandPriceMode,
      gravelPriceMode,
    };

    void saveLocalData(
      CONCRETE_SETTINGS_KEY,
      settings,
    );
  }, [
    settingsLoaded,
    form.wastePercentage,
    form.cementRatio,
    form.sandRatio,
    form.gravelRatio,
    form.cementBagWeight,
    form.sandBagVolume,
    form.gravelBagVolume,
    form.cementPrice,
    form.sandCubicMeterPrice,
    form.sandBagPrice,
    form.gravelCubicMeterPrice,
    form.gravelBagPrice,
    form.laborPrice,
    sandPriceMode,
    gravelPriceMode,
  ]);

  const canCalculate = useMemo(() => {
    return (
      parseNumber(form.length) > 0 &&
      parseNumber(form.width) > 0 &&
      parseNumber(form.thickness) > 0
    );
  }, [form.length, form.width, form.thickness]);

  function updateField(
    field: keyof FormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleCatalogItemSelected(
    item: CatalogItemWithDetails,
  ) {
    if (!catalogTarget) return;

    const price =
      item.sale_price > 0
        ? item.sale_price
        : item.unit_cost;
    const priceText = String(price);
    const unitCode = (
      item.unit?.code ??
      item.unit?.symbol ??
      ""
    ).toLowerCase();
    const isCubicMeter =
      unitCode === "m3" ||
      unitCode === "m³" ||
      unitCode.includes("metro cub");

    setSelectedCatalogNames((current) => ({
      ...current,
      [catalogTarget]: item.name,
    }));

    if (catalogTarget === "cement") {
      updateField("cementPrice", priceText);
    }

    if (catalogTarget === "sand") {
      if (isCubicMeter) {
        setSandPriceMode("cubicMeter");
        updateField("sandCubicMeterPrice", priceText);
      } else {
        setSandPriceMode("bag");
        updateField("sandBagPrice", priceText);
      }
    }

    if (catalogTarget === "gravel") {
      if (isCubicMeter) {
        setGravelPriceMode("cubicMeter");
        updateField("gravelCubicMeterPrice", priceText);
      } else {
        setGravelPriceMode("bag");
        updateField("gravelBagPrice", priceText);
      }
    }

    if (catalogTarget === "labor") {
      updateField("laborPrice", priceText);
    }

    setCatalogTarget(null);
  }

  function handleCalculate() {
    const length = parseNumber(form.length);
    const width = parseNumber(form.width);
    const thickness = parseNumber(form.thickness);

    if (length <= 0 || width <= 0 || thickness <= 0) {
      setError(
        "Introduce largo, ancho y espesor mayores que cero.",
      );
      setResult(null);
      return;
    }

    const cementRatio = parseNumber(form.cementRatio);
    const sandRatio = parseNumber(form.sandRatio);
    const gravelRatio = parseNumber(form.gravelRatio);

    if (cementRatio <= 0 || sandRatio <= 0 || gravelRatio <= 0) {
      setError(
        "Cada componente de la mezcla debe tener una proporción mayor que cero.",
      );
      setResult(null);
      return;
    }

    const wastePercentage = parseNumber(form.wastePercentage);
    if (wastePercentage < 0 || wastePercentage > 100) {
      setError("El desperdicio debe estar entre 0% y 100%.");
      setResult(null);
      return;
    }

    if (parseNumber(form.cementBagWeight) <= 0) {
      setError(
        "El peso del saco de cemento debe ser mayor que cero.",
      );
      setResult(null);
      return;
    }

    if (
      parseNumber(form.sandBagVolume) <= 0 ||
      parseNumber(form.gravelBagVolume) <= 0
    ) {
      setError(
        "El volumen por saco de arena y gravilla debe ser mayor que cero.",
      );
      setResult(null);
      return;
    }

    const calculatedResult = calculateConcrete(
      {
        length,
        width,
        thickness,
        wastePercentage,

        mixCement: cementRatio,
        mixSand: sandRatio,
        mixGravel: gravelRatio,

        cementBagWeight: parseNumber(
          form.cementBagWeight,
        ),
        sandBagVolume: parseNumber(
          form.sandBagVolume,
        ),
        gravelBagVolume: parseNumber(
          form.gravelBagVolume,
        ),

        sandPriceMode,
        gravelPriceMode,
        cementDensityKgM3:
          getFormulaNumber(
            formulaParameters,
            "cement_density_kg_m3",
            1440,
          ),
        dryVolumeFactor:
          getFormulaNumber(
            formulaParameters,
            "dry_volume_factor",
            1.54,
          ),
        defaultAggregateBagVolume:
          getFormulaNumber(
            formulaParameters,
            "aggregate_bag_volume_m3",
            0.0142,
          ),
      },
      {
        cementBag: parseNumber(form.cementPrice),

        sandCubicMeter: parseNumber(
          form.sandCubicMeterPrice,
        ),
        sandBag: parseNumber(form.sandBagPrice),

        gravelCubicMeter: parseNumber(
          form.gravelCubicMeterPrice,
        ),
        gravelBag: parseNumber(
          form.gravelBagPrice,
        ),

        laborCubicMeter: parseNumber(
          form.laborPrice,
        ),
      },
    );

    setResult(calculatedResult);
    setError("");
    setBudgetMessage("");
  }


  async function handleAddToBudget() {
    if (!result) return;

    if (!activeCompany || !budgetId) {
      Alert.alert(
        "Selecciona un presupuesto",
        "Abre la calculadora desde un presupuesto para guardar esta partida.",
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

    const unitPrice =
      result.volumeWithWaste > 0
        ? result.totalCost / result.volumeWithWaste
        : 0;

    const details = [
      `${formatNumber(result.cementBags, 2)} sacos de cemento`,
      `${formatNumber(result.sandVolume, 3)} m³ de arena`,
      `${formatNumber(result.gravelVolume, 3)} m³ de gravilla`,
    ].join(" · ");

    const { error: budgetError } = await addBudgetItem({
      companyId: activeCompany.id,
      budgetId,
      itemType: "service",
      description: `Concreto mezcla ${form.cementRatio}:${form.sandRatio}:${form.gravelRatio}`,
      unitName: "m³",
      quantity: result.volumeWithWaste,
      unitCost: unitPrice,
      unitPrice,
      taxable: true,
      notes: details,
    });

    if (budgetError) {
      Alert.alert(
        "No fue posible agregar la partida",
        budgetError,
      );
      return;
    }

    setBudgetMessage(
      "La partida fue guardada en el presupuesto.",
    );
  }

  function handleClear() {
    setForm(initialForm);
    setSandPriceMode("cubicMeter");
    setGravelPriceMode("cubicMeter");
    setResult(null);
    setError("");
    setBudgetMessage("");
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introduction}>
            <View style={styles.introductionIcon}>
              <Ionicons
                name="cube-outline"
                size={26}
                color={colors.primary}
              />
            </View>

            <View style={styles.introductionText}>
              <Text style={styles.introductionTitle}>
                Dimensiones del elemento
              </Text>

              <Text style={styles.introductionDescription}>
                Introduce las medidas en metros. El espesor
                también debe colocarse en metros.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Medidas principales
            </Text>

            <View style={styles.formGrid}>
              <FormInput
                label="Largo"
                value={form.length}
                onChangeText={(value) =>
                  updateField("length", value)
                }
                unit="m"
                placeholder="Ej. 6.00"
              />

              <FormInput
                label="Ancho"
                value={form.width}
                onChangeText={(value) =>
                  updateField("width", value)
                }
                unit="m"
                placeholder="Ej. 4.00"
              />

              <FormInput
                label="Espesor"
                value={form.thickness}
                onChangeText={(value) =>
                  updateField("thickness", value)
                }
                unit="m"
                placeholder="Ej. 0.10"
              />

              <FormInput
                label="Desperdicio"
                value={form.wastePercentage}
                onChangeText={(value) =>
                  updateField("wastePercentage", value)
                }
                unit="%"
                placeholder="5"
              />
            </View>

            <View style={styles.helpBox}>
              <Ionicons
                name="bulb-outline"
                size={20}
                color={colors.warning}
              />

              <Text style={styles.helpText}>
                Ejemplo: para una losa de 10 cm de espesor,
                introduce 0.10 m.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Proporción de mezcla
            </Text>

            <Text style={styles.sectionDescription}>
              La proporción inicial es 1:2:3. Puedes cambiarla
              según el diseño o especificación del proyecto.
            </Text>

            <View style={styles.ratioRow}>
              <RatioInput
                label="Cemento"
                value={form.cementRatio}
                onChangeText={(value) =>
                  updateField("cementRatio", value)
                }
              />

              <Text style={styles.ratioSeparator}>:</Text>

              <RatioInput
                label="Arena"
                value={form.sandRatio}
                onChangeText={(value) =>
                  updateField("sandRatio", value)
                }
              />

              <Text style={styles.ratioSeparator}>:</Text>

              <RatioInput
                label="Gravilla"
                value={form.gravelRatio}
                onChangeText={(value) =>
                  updateField("gravelRatio", value)
                }
              />
            </View>

            <View style={[styles.formGrid, styles.measurementGrid]}>
              <FormInput
                label="Peso del saco de cemento"
                value={form.cementBagWeight}
                onChangeText={(value) =>
                  updateField("cementBagWeight", value)
                }
                unit="kg"
                placeholder="42.5"
              />

              <FormInput
                label="Volumen por saco de arena"
                value={form.sandBagVolume}
                onChangeText={(value) =>
                  updateField("sandBagVolume", value)
                }
                unit="m³"
                placeholder="0.0142"
              />

              <FormInput
                label="Volumen por saco de gravilla"
                value={form.gravelBagVolume}
                onChangeText={(value) =>
                  updateField("gravelBagVolume", value)
                }
                unit="m³"
                placeholder="0.0142"
                fullWidth
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Precios unitarios
            </Text>

            <Text style={styles.sectionDescription}>
              Puedes cotizar la arena y la gravilla por metro
              cúbico o por saco. Todos los valores son editables
              y se guardan automáticamente en este dispositivo.
            </Text>

            <CatalogPriceButton
              label="Cemento del catálogo"
              value={selectedCatalogNames.cement}
              onPress={() => setCatalogTarget("cement")}
            />

            <FormInput
              label="Precio del saco de cemento"
              value={form.cementPrice}
              onChangeText={(value) =>
                updateField("cementPrice", value)
              }
              unit="B/."
              placeholder="0.00"
              fullWidth
            />

            <CatalogPriceButton
              label="Arena del catálogo"
              value={selectedCatalogNames.sand}
              onPress={() => setCatalogTarget("sand")}
            />

            <AggregatePriceSection
              title="Arena"
              mode={sandPriceMode}
              onChangeMode={setSandPriceMode}
              cubicMeterPrice={form.sandCubicMeterPrice}
              onChangeCubicMeterPrice={(value) =>
                updateField("sandCubicMeterPrice", value)
              }
              bagPrice={form.sandBagPrice}
              onChangeBagPrice={(value) =>
                updateField("sandBagPrice", value)
              }
            />

            <CatalogPriceButton
              label="Gravilla del catálogo"
              value={selectedCatalogNames.gravel}
              onPress={() => setCatalogTarget("gravel")}
            />

            <AggregatePriceSection
              title="Gravilla"
              mode={gravelPriceMode}
              onChangeMode={setGravelPriceMode}
              cubicMeterPrice={
                form.gravelCubicMeterPrice
              }
              onChangeCubicMeterPrice={(value) =>
                updateField(
                  "gravelCubicMeterPrice",
                  value,
                )
              }
              bagPrice={form.gravelBagPrice}
              onChangeBagPrice={(value) =>
                updateField("gravelBagPrice", value)
              }
            />

            <CatalogPriceButton
              label="Mano de obra del catálogo"
              value={selectedCatalogNames.labor}
              onPress={() => setCatalogTarget("labor")}
            />

            <FormInput
              label="Mano de obra por m³"
              value={form.laborPrice}
              onChangeText={(value) =>
                updateField("laborPrice", value)
              }
              unit="B/."
              placeholder="0.00"
              fullWidth
            />
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={21}
                color={colors.danger}
              />

              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <Pressable
              disabled={!canCalculate}
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.primaryButton,
                !canCalculate &&
                  styles.primaryButtonDisabled,
                pressed &&
                  canCalculate &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="calculator-outline"
                size={21}
                color={colors.textLight}
              />

              <Text style={styles.primaryButtonText}>
                Calcular
              </Text>
            </Pressable>

            <Pressable
              onPress={handleClear}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={colors.text}
              />

              <Text style={styles.secondaryButtonText}>
                Limpiar
              </Text>
            </Pressable>
          </View>

          {result ? (
            <Results
              result={result}
              currencyCode={activeCompany?.currency_code}
              onAddToBudget={handleAddToBudget}
            />
          ) : null}

          {budgetMessage ? (
            <View style={styles.budgetSuccessBox}>
              <View style={styles.budgetSuccessTextContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                />

                <Text style={styles.budgetSuccessText}>
                  {budgetMessage}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  budgetId
                    ? router.push({
                        pathname: "/presupuestos/[id]",
                        params: { id: budgetId },
                      } as Href)
                    : router.push("/presupuestos")
                }
                style={styles.viewBudgetButton}
              >
                <Text style={styles.viewBudgetButtonText}>
                  Ver presupuesto
                </Text>

                <Ionicons
                  name="arrow-forward-outline"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {catalogTarget ? (
        <CatalogPricePicker
          visible
          target={catalogTarget}
          items={catalogItems}
          loading={catalogLoading}
          currencyCode={activeCompany?.currency_code}
          onClose={() => setCatalogTarget(null)}
          onSelect={handleCatalogItemSelected}
        />
      ) : null}
    </SafeAreaView>
  );
}

function CatalogPriceButton({
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
      style={({ pressed }) => [
        styles.catalogPriceButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.catalogPriceButtonText}>
        <Text style={styles.catalogPriceLabel}>{label}</Text>
        <Text style={styles.catalogPriceValue}>
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

function CatalogPricePicker({
  visible,
  target,
  items,
  loading,
  currencyCode,
  onClose,
  onSelect,
}: {
  visible: boolean;
  target: CatalogPriceTarget | null;
  items: CatalogItemWithDetails[];
  loading: boolean;
  currencyCode?: string;
  onClose: () => void;
  onSelect: (item: CatalogItemWithDetails) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const validType =
        target === "labor"
          ? item.item_type === "labor" ||
            item.item_type === "service"
          : item.item_type === "material";

      if (!validType) return false;
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        (item.sku?.toLowerCase().includes(query) ?? false) ||
        (item.category?.name
          .toLowerCase()
          .includes(query) ?? false)
      );
    });
  }, [items, search, target]);

  const title =
    target === "cement"
      ? "Seleccionar cemento"
      : target === "sand"
        ? "Seleccionar arena"
        : target === "gravel"
          ? "Seleccionar gravilla"
          : "Seleccionar mano de obra";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.catalogModal}>
        <View style={styles.catalogModalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.catalogCloseText}>Cerrar</Text>
          </Pressable>

          <Text style={styles.catalogModalTitle}>{title}</Text>

          <View style={styles.catalogHeaderSpacer} />
        </View>

        <View style={styles.catalogModalContent}>
          <View style={styles.catalogSearchBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textSecondary}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre, SKU o categoría"
              placeholderTextColor="#94A3B8"
              style={styles.catalogSearchInput}
            />
          </View>

          {loading ? (
            <View style={styles.catalogLoading}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
              />
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.catalogList}
              ListEmptyComponent={
                <View style={styles.catalogEmpty}>
                  <Ionicons
                    name="cube-outline"
                    size={42}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.catalogEmptyTitle}>
                    No hay ítems compatibles
                  </Text>
                  <Text style={styles.catalogEmptyText}>
                    Crea primero el material o la mano de obra en el catálogo.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const price =
                  item.sale_price > 0
                    ? item.sale_price
                    : item.unit_cost;

                return (
                  <Pressable
                    onPress={() => onSelect(item)}
                    style={({ pressed }) => [
                      styles.catalogItem,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <View style={styles.catalogItemInfo}>
                      <Text style={styles.catalogItemName}>
                        {item.name}
                      </Text>
                      <Text style={styles.catalogItemMeta}>
                        {item.unit?.symbol ||
                          item.unit?.name ||
                          "unidad"}
                        {item.category?.name
                          ? ` · ${item.category.name}`
                          : ""}
                      </Text>
                    </View>

                    <Text style={styles.catalogItemPrice}>
                      {formatMoneyUtil(price, currencyCode)}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  unit?: string;
  fullWidth?: boolean;
};

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  fullWidth = false,
}: FormInputProps) {
  return (
    <View
      style={[
        styles.inputGroup,
        fullWidth && styles.fullWidthInput,
      ]}
    >
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType="decimal-pad"
          inputMode="decimal"
          style={styles.input}
        />

        {unit ? (
          <Text style={styles.inputUnit}>{unit}</Text>
        ) : null}
      </View>
    </View>
  );
}

type RatioInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
};

function RatioInput({
  label,
  value,
  onChangeText,
}: RatioInputProps) {
  return (
    <View style={styles.ratioGroup}>
      <Text style={styles.inputLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        inputMode="decimal"
        style={styles.ratioInput}
      />
    </View>
  );
}

type AggregatePriceSectionProps = {
  title: string;
  mode: AggregatePriceMode;
  onChangeMode: (mode: AggregatePriceMode) => void;

  cubicMeterPrice: string;
  onChangeCubicMeterPrice: (value: string) => void;

  bagPrice: string;
  onChangeBagPrice: (value: string) => void;
};

function AggregatePriceSection({
  title,
  mode,
  onChangeMode,
  cubicMeterPrice,
  onChangeCubicMeterPrice,
  bagPrice,
  onChangeBagPrice,
}: AggregatePriceSectionProps) {
  return (
    <View style={styles.aggregateSection}>
      <Text style={styles.aggregateTitle}>{title}</Text>

      <View style={styles.modeRow}>
        <Pressable
          onPress={() => onChangeMode("cubicMeter")}
          style={[
            styles.modeButton,
            mode === "cubicMeter" &&
              styles.modeButtonActive,
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              mode === "cubicMeter" &&
                styles.modeButtonTextActive,
            ]}
          >
            Por m³
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode("bag")}
          style={[
            styles.modeButton,
            mode === "bag" && styles.modeButtonActive,
          ]}
        >
          <Text
            style={[
              styles.modeButtonText,
              mode === "bag" &&
                styles.modeButtonTextActive,
            ]}
          >
            Por saco
          </Text>
        </Pressable>
      </View>

      <View style={styles.formGrid}>
        <View
          style={[
            styles.priceFieldWrapper,
            mode !== "cubicMeter" &&
              styles.inactivePriceField,
          ]}
        >
          <FormInput
            label={`Precio de ${title.toLowerCase()} por m³`}
            value={cubicMeterPrice}
            onChangeText={onChangeCubicMeterPrice}
            unit="B/."
            placeholder="0.00"
            fullWidth
          />
        </View>

        <View
          style={[
            styles.priceFieldWrapper,
            mode !== "bag" &&
              styles.inactivePriceField,
          ]}
        >
          <FormInput
            label={`Precio de ${title.toLowerCase()} por saco`}
            value={bagPrice}
            onChangeText={onChangeBagPrice}
            unit="B/."
            placeholder="0.00"
            fullWidth
          />
        </View>
      </View>

      <Text style={styles.selectedPriceText}>
        El costo se calculará usando el precio{" "}
        {mode === "bag" ? "por saco" : "por metro cúbico"}.
      </Text>
    </View>
  );
}

function Results({
  result,
  currencyCode,
  onAddToBudget,
}: {
  result: ConcreteResult;
  currencyCode?: string;
  onAddToBudget: () => void;
}) {
  const formatNumber = (value: number, maximumDigits = 2) =>
    formatDecimalUtil(value, maximumDigits, currencyCode);
  const formatMoney = (value: number) =>
    formatMoneyUtil(value, currencyCode);

  return (
    <View style={styles.resultsSection}>
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsLabel}>
            Resultado estimado
          </Text>

          <Text style={styles.resultsVolume}>
            {formatNumber(result.volumeWithWaste, 3)} m³
          </Text>
        </View>

        <View style={styles.resultsIcon}>
          <Ionicons
            name="checkmark-circle-outline"
            size={29}
            color={colors.primary}
          />
        </View>
      </View>

      <ResultRow
        label="Volumen neto"
        value={`${formatNumber(result.netVolume, 3)} m³`}
      />

      <ResultRow
        label="Volumen con desperdicio"
        value={`${formatNumber(
          result.volumeWithWaste,
          3,
        )} m³`}
      />

      <View style={styles.resultDivider} />

      <Text style={styles.resultGroupTitle}>
        Materiales
      </Text>

      <ResultRow
        label="Cemento"
        value={`${formatNumber(
          result.cementBags,
          2,
        )} sacos`}
        detail={`${formatNumber(
          result.cementKilograms,
          1,
        )} kg · Comprar ${formatNumber(
          result.cementBagsToBuy,
          0,
        )} sacos`}
      />

      <ResultRow
        label="Arena"
        value={`${formatNumber(
          result.sandVolume,
          3,
        )} m³`}
        detail={`${formatNumber(
          result.sandBags,
          2,
        )} sacos · Comprar ${formatNumber(
          result.sandBagsToBuy,
          0,
        )} sacos`}
      />

      <ResultRow
        label="Gravilla"
        value={`${formatNumber(
          result.gravelVolume,
          3,
        )} m³`}
        detail={`${formatNumber(
          result.gravelBags,
          2,
        )} sacos · Comprar ${formatNumber(
          result.gravelBagsToBuy,
          0,
        )} sacos`}
      />

      <View style={styles.resultDivider} />

      <Text style={styles.resultGroupTitle}>Costos</Text>

      <ResultRow
        label="Cemento"
        value={formatMoney(result.cementCost)}
      />

      <ResultRow
        label="Arena"
        value={formatMoney(result.sandCost)}
      />

      <ResultRow
        label="Gravilla"
        value={formatMoney(result.gravelCost)}
      />

      <ResultRow
        label="Mano de obra"
        value={formatMoney(result.laborCost)}
      />

      <ResultRow
        label="Total de materiales"
        value={formatMoney(result.materialsCost)}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>
          Costo estimado
        </Text>

        <Text style={styles.totalValue}>
          {formatMoney(result.totalCost)}
        </Text>
      </View>

      <Pressable
        onPress={onAddToBudget}
        style={({ pressed }) => [
          styles.addBudgetButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={21}
          color={colors.textLight}
        />

        <Text style={styles.addBudgetButtonText}>
          Agregar al presupuesto
        </Text>
      </Pressable>

      <View style={styles.warningBox}>
        <Ionicons
          name="warning-outline"
          size={20}
          color="#92400E"
        />

        <Text style={styles.warningText}>
          Este cálculo es orientativo. La dosificación final debe
          ajustarse a la resistencia requerida, especificaciones
          estructurales, humedad de los agregados y condiciones de
          obra.
        </Text>
      </View>
    </View>
  );
}

type ResultRowProps = {
  label: string;
  value: string;
  detail?: string;
};

function ResultRow({
  label,
  value,
  detail,
}: ResultRowProps) {
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultRowText}>
        <Text style={styles.resultLabel}>{label}</Text>

        {detail ? (
          <Text style={styles.resultDetail}>{detail}</Text>
        ) : null}
      </View>

      <Text style={styles.resultValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 18,
    paddingBottom: 50,
  },

  introduction: {
    marginBottom: 18,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  introductionIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  introductionText: {
    flex: 1,
    marginLeft: 14,
  },

  introductionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  introductionDescription: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  section: {
    marginBottom: 18,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionDescription: {
    marginTop: 6,
    marginBottom: 17,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  measurementGrid: {
    marginTop: 18,
  },

  inputGroup: {
    width: "47%",
    minWidth: 130,
    flexGrow: 1,
    marginBottom: 5,
  },

  fullWidthInput: {
    width: "100%",
  },

  inputLabel: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },

  inputContainer: {
    height: 50,
    paddingLeft: 13,
    paddingRight: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },

  inputUnit: {
    marginLeft: 7,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },

  helpBox: {
    marginTop: 14,
    padding: 13,
    borderRadius: radius.sm,
    backgroundColor: "#FFFBEB",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  helpText: {
    flex: 1,
    color: "#92400E",
    fontSize: 12,
    lineHeight: 18,
  },

  ratioRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 9,
  },

  ratioGroup: {
    flex: 1,
  },

  ratioInput: {
    height: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    color: colors.text,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  ratioSeparator: {
    paddingBottom: 13,
    color: colors.textSecondary,
    fontSize: 20,
    fontWeight: "900",
  },

  aggregateSection: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  aggregateTitle: {
    marginBottom: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  modeRow: {
    marginBottom: 14,
    padding: 4,
    borderRadius: radius.sm,
    backgroundColor: "#E2E8F0",
    flexDirection: "row",
  },

  modeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  modeButtonActive: {
    backgroundColor: colors.surface,
  },

  modeButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },

  modeButtonTextActive: {
    color: colors.primary,
  },

  priceFieldWrapper: {
    width: "47%",
    minWidth: 140,
    flexGrow: 1,
  },

  inactivePriceField: {
    opacity: 0.5,
  },

  selectedPriceText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  errorBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  errorText: {
    flex: 1,
    color: "#991B1B",
    fontSize: 13,
    lineHeight: 18,
  },

  buttonRow: {
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },

  primaryButton: {
    flex: 2,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonDisabled: {
    backgroundColor: "#94A3B8",
  },

  primaryButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },

  secondaryButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  resultsSection: {
    padding: 19,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
  },

  resultsHeader: {
    marginBottom: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultsLabel: {
    color: "#94A3B8",
    fontSize: 13,
  },

  resultsVolume: {
    marginTop: 5,
    color: colors.textLight,
    fontSize: 29,
    fontWeight: "900",
  },

  resultsIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#14532D",
    alignItems: "center",
    justifyContent: "center",
  },

  resultGroupTitle: {
    marginBottom: 7,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  resultRow: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultRowText: {
    flex: 1,
    paddingRight: 12,
  },

  resultLabel: {
    color: "#CBD5E1",
    fontSize: 14,
  },

  resultDetail: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 11,
  },

  resultValue: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "800",
  },

  resultDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#334155",
  },

  totalRow: {
    marginTop: 12,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "900",
  },

  totalValue: {
    color: "#4ADE80",
    fontSize: 21,
    fontWeight: "900",
  },

  addBudgetButton: {
    minHeight: 52,
    marginTop: 20,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  addBudgetButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  budgetSuccessBox: {
    marginTop: 2,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },

  budgetSuccessTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  budgetSuccessText: {
    flex: 1,
    color: "#166534",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },

  viewBudgetButton: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  viewBudgetButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  catalogPriceButton: {
    minHeight: 58,
    marginBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  catalogPriceButtonText: {
    flex: 1,
  },

  catalogPriceLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },

  catalogPriceValue: {
    marginTop: 3,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  catalogModal: {
    flex: 1,
    backgroundColor: colors.background,
  },

  catalogModalHeader: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  catalogCloseText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  catalogModalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  catalogHeaderSpacer: {
    width: 50,
  },

  catalogModalContent: {
    flex: 1,
    padding: 20,
  },

  catalogSearchBox: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  catalogSearchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  catalogLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  catalogList: {
    paddingTop: 14,
    paddingBottom: 40,
  },

  catalogEmpty: {
    marginTop: 80,
    alignItems: "center",
  },

  catalogEmptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  catalogEmptyText: {
    maxWidth: 280,
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  catalogItem: {
    marginBottom: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  catalogItemInfo: {
    flex: 1,
  },

  catalogItemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  catalogItemMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },

  catalogItemPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  warningBox: {
    marginTop: 20,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#FEF3C7",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  warningText: {
    flex: 1,
    color: "#78350F",
    fontSize: 11,
    lineHeight: 17,
  },
});
