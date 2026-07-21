import { Ionicons } from "@expo/vector-icons";
import {
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
import { addBudgetItem } from "../../services/budget-service";
import { listCatalogItems } from "../../services/catalog-service";
import type { CatalogItemWithDetails } from "../../types/catalog";
import {
  calculateMasonry,
  type MasonryResult,
  type PlasterSides,
} from "../../services/calculators/bloques-repello";
import {
  formatDecimal,
  formatMoney,
} from "../../utils/format";
import {
  loadLocalData,
  saveLocalData,
} from "../../utils/local-storage";

type CatalogTarget =
  | "block"
  | "cement"
  | "sand"
  | "masonryLabor"
  | "plasterLabor";

type FormState = {
  wallLength: string;
  wallHeight: string;
  openingsArea: string;
  blockLength: string;
  blockHeight: string;
  blockWastePercentage: string;
  layingMortarVolumePerSquareMeter: string;
  plasterThicknessCentimeters: string;
  plasterWastePercentage: string;
  cementRatio: string;
  sandRatio: string;
  cementBagWeight: string;
  blockPrice: string;
  cementPrice: string;
  sandPrice: string;
  masonryLaborPrice: string;
  plasterLaborPrice: string;
};

type MasonrySavedSettings = Omit<
  FormState,
  "wallLength" | "wallHeight" | "openingsArea"
> & {
  plasterSides: PlasterSides;
};

const MASONRY_SETTINGS_KEY =
  "@contractor-pro/masonry-settings";

const initialForm: FormState = {
  wallLength: "",
  wallHeight: "",
  openingsArea: "0",
  blockLength: "0.40",
  blockHeight: "0.20",
  blockWastePercentage: "5",
  layingMortarVolumePerSquareMeter: "0.02",
  plasterThicknessCentimeters: "1.5",
  plasterWastePercentage: "10",
  cementRatio: "1",
  sandRatio: "4",
  cementBagWeight: "42.5",
  blockPrice: "",
  cementPrice: "",
  sandPrice: "",
  masonryLaborPrice: "",
  plasterLaborPrice: "",
};

function parseNumber(value: string): number {
  const parsed = Number(value.replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function MasonryCalculatorScreen() {
  const params = useLocalSearchParams<{
    budgetId?: string | string[];
  }>();
  const budgetId = Array.isArray(params.budgetId)
    ? params.budgetId[0]
    : params.budgetId;
  const { activeCompany } = useCompany();
  const currencyCode = activeCompany?.currency_code;

  const [form, setForm] = useState<FormState>(initialForm);
  const [plasterSides, setPlasterSides] =
    useState<PlasterSides>(2);
  const [result, setResult] =
    useState<MasonryResult | null>(null);
  const [error, setError] = useState("");
  const [budgetMessage, setBudgetMessage] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [catalogItems, setCatalogItems] = useState<
    CatalogItemWithDetails[]
  >([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogTarget, setCatalogTarget] =
    useState<CatalogTarget | null>(null);
  const [selectedCatalogNames, setSelectedCatalogNames] =
    useState<Partial<Record<CatalogTarget, string>>>({});

  useEffect(() => {
    const companyId = activeCompany?.id;

    if (!companyId) {
      setCatalogItems([]);
      return;
    }

    async function loadCatalog(id: string) {
      setCatalogLoading(true);
      const { items, error: catalogError } =
        await listCatalogItems(id);

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
    async function loadSettings() {
      const saved =
        await loadLocalData<MasonrySavedSettings>(
          MASONRY_SETTINGS_KEY,
        );

      if (saved) {
        const {
          plasterSides: savedPlasterSides,
          ...savedForm
        } = saved;

        setForm((current) => ({
          ...current,
          ...savedForm,
          wallLength: current.wallLength,
          wallHeight: current.wallHeight,
          openingsArea: current.openingsArea,
        }));
        setPlasterSides(savedPlasterSides ?? 2);
      }

      setSettingsLoaded(true);
    }

    void loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;

    const settings: MasonrySavedSettings = {
      blockLength: form.blockLength,
      blockHeight: form.blockHeight,
      blockWastePercentage: form.blockWastePercentage,
      layingMortarVolumePerSquareMeter:
        form.layingMortarVolumePerSquareMeter,
      plasterThicknessCentimeters:
        form.plasterThicknessCentimeters,
      plasterWastePercentage: form.plasterWastePercentage,
      cementRatio: form.cementRatio,
      sandRatio: form.sandRatio,
      cementBagWeight: form.cementBagWeight,
      blockPrice: form.blockPrice,
      cementPrice: form.cementPrice,
      sandPrice: form.sandPrice,
      masonryLaborPrice: form.masonryLaborPrice,
      plasterLaborPrice: form.plasterLaborPrice,
      plasterSides,
    };

    void saveLocalData(MASONRY_SETTINGS_KEY, settings);
  }, [form, plasterSides, settingsLoaded]);

  const canCalculate = useMemo(
    () =>
      parseNumber(form.wallLength) > 0 &&
      parseNumber(form.wallHeight) > 0,
    [form.wallHeight, form.wallLength],
  );

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setBudgetMessage("");
  }

  function selectCatalogItem(item: CatalogItemWithDetails) {
    if (!catalogTarget) return;

    const price =
      item.sale_price > 0 ? item.sale_price : item.unit_cost;
    const fieldByTarget: Record<
      CatalogTarget,
      keyof FormState
    > = {
      block: "blockPrice",
      cement: "cementPrice",
      sand: "sandPrice",
      masonryLabor: "masonryLaborPrice",
      plasterLabor: "plasterLaborPrice",
    };

    updateField(fieldByTarget[catalogTarget], String(price));
    setSelectedCatalogNames((current) => ({
      ...current,
      [catalogTarget]: item.name,
    }));
    setCatalogTarget(null);
  }

  function handleCalculate() {
    const wallLength = parseNumber(form.wallLength);
    const wallHeight = parseNumber(form.wallHeight);
    const grossArea = wallLength * wallHeight;
    const openingsArea = parseNumber(form.openingsArea);

    if (wallLength <= 0 || wallHeight <= 0) {
      setError("Introduce un largo y una altura mayores que cero.");
      setResult(null);
      return;
    }

    if (openingsArea < 0 || openingsArea >= grossArea) {
      setError(
        "El área de puertas y ventanas debe ser menor que el área total del muro.",
      );
      setResult(null);
      return;
    }

    if (
      parseNumber(form.blockLength) <= 0 ||
      parseNumber(form.blockHeight) <= 0
    ) {
      setError("Revisa el largo y la altura del bloque.");
      setResult(null);
      return;
    }

    if (
      parseNumber(form.cementRatio) +
        parseNumber(form.sandRatio) <=
      0
    ) {
      setError("La proporción del mortero no es válida.");
      setResult(null);
      return;
    }

    if (
      plasterSides > 0 &&
      parseNumber(form.plasterThicknessCentimeters) <= 0
    ) {
      setError("El espesor del repello debe ser mayor que cero.");
      setResult(null);
      return;
    }

    const calculated = calculateMasonry(
      {
        wallLength,
        wallHeight,
        openingsArea,
        blockLength: parseNumber(form.blockLength),
        blockHeight: parseNumber(form.blockHeight),
        blockWastePercentage: parseNumber(
          form.blockWastePercentage,
        ),
        layingMortarVolumePerSquareMeter: parseNumber(
          form.layingMortarVolumePerSquareMeter,
        ),
        plasterSides,
        plasterThickness:
          parseNumber(form.plasterThicknessCentimeters) / 100,
        plasterWastePercentage: parseNumber(
          form.plasterWastePercentage,
        ),
        mixCement: parseNumber(form.cementRatio),
        mixSand: parseNumber(form.sandRatio),
        cementBagWeight: parseNumber(form.cementBagWeight),
      },
      {
        blockUnit: parseNumber(form.blockPrice),
        cementBag: parseNumber(form.cementPrice),
        sandCubicMeter: parseNumber(form.sandPrice),
        masonryLaborSquareMeter: parseNumber(
          form.masonryLaborPrice,
        ),
        plasterLaborSquareMeter: parseNumber(
          form.plasterLaborPrice,
        ),
      },
    );

    setResult(calculated);
    setError("");
    setBudgetMessage("");
  }

  async function handleAddToBudget() {
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

    const unitPrice =
      result.netWallArea > 0
        ? result.totalCost / result.netWallArea
        : 0;
    const notes = [
      `${formatDecimal(result.blocksToBuy, 0, currencyCode)} bloques`,
      `${formatDecimal(result.cementBagsToBuy, 0, currencyCode)} sacos de cemento`,
      `${formatDecimal(result.sandVolume, 3, currencyCode)} m³ de arena`,
      plasterSides > 0
        ? `repello en ${plasterSides} cara${plasterSides === 1 ? "" : "s"}`
        : "sin repello",
    ].join(" · ");

    const { error: budgetError } = await addBudgetItem({
      companyId: activeCompany.id,
      budgetId,
      itemType: "service",
      description:
        plasterSides > 0
          ? "Muro de bloques y repello"
          : "Muro de bloques",
      unitName: "m²",
      quantity: result.netWallArea,
      unitCost: unitPrice,
      unitPrice,
      taxable: true,
      notes,
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

  function clearMeasurements() {
    setForm((current) => ({
      ...current,
      wallLength: "",
      wallHeight: "",
      openingsArea: "0",
    }));
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introduction}>
            <View style={styles.introIcon}>
              <Ionicons
                name="grid-outline"
                size={27}
                color={colors.textLight}
              />
            </View>
            <View style={styles.introText}>
              <Text style={styles.title}>Bloques y repello</Text>
              <Text style={styles.subtitle}>
                Calcula bloques, mortero, repello, mano de obra y costo estimado.
              </Text>
            </View>
          </View>

          <Section
            title="Dimensiones del muro"
            description="Resta el área total de puertas, ventanas y otros huecos."
          >
            <View style={styles.formGrid}>
              <FormInput
                label="Largo"
                value={form.wallLength}
                onChangeText={(value) =>
                  updateField("wallLength", value)
                }
                placeholder="0.00"
                unit="m"
              />
              <FormInput
                label="Altura"
                value={form.wallHeight}
                onChangeText={(value) =>
                  updateField("wallHeight", value)
                }
                placeholder="0.00"
                unit="m"
              />
              <FormInput
                label="Puertas y ventanas"
                value={form.openingsArea}
                onChangeText={(value) =>
                  updateField("openingsArea", value)
                }
                placeholder="0.00"
                unit="m²"
                fullWidth
              />
            </View>
          </Section>

          <Section
            title="Bloques"
            description="Las medidas corresponden a la cara visible del bloque."
          >
            <CatalogButton
              label="Bloque del catálogo"
              value={selectedCatalogNames.block}
              onPress={() => setCatalogTarget("block")}
            />
            <View style={styles.formGrid}>
              <FormInput
                label="Largo del bloque"
                value={form.blockLength}
                onChangeText={(value) =>
                  updateField("blockLength", value)
                }
                placeholder="0.40"
                unit="m"
              />
              <FormInput
                label="Altura del bloque"
                value={form.blockHeight}
                onChangeText={(value) =>
                  updateField("blockHeight", value)
                }
                placeholder="0.20"
                unit="m"
              />
              <FormInput
                label="Desperdicio"
                value={form.blockWastePercentage}
                onChangeText={(value) =>
                  updateField("blockWastePercentage", value)
                }
                placeholder="5"
                unit="%"
              />
              <FormInput
                label="Precio por bloque"
                value={form.blockPrice}
                onChangeText={(value) =>
                  updateField("blockPrice", value)
                }
                placeholder="0.00"
                unit="B/."
              />
            </View>
          </Section>

          <Section
            title="Mortero y repello"
            description="El consumo de pega sugerido es 0.02 m³ por m² de muro."
          >
            <FormInput
              label="Mortero de pega por m²"
              value={form.layingMortarVolumePerSquareMeter}
              onChangeText={(value) =>
                updateField(
                  "layingMortarVolumePerSquareMeter",
                  value,
                )
              }
              placeholder="0.02"
              unit="m³"
              fullWidth
            />

            <Text style={styles.fieldLabel}>Caras con repello</Text>
            <View style={styles.segmentedRow}>
              {([0, 1, 2] as PlasterSides[]).map((sides) => (
                <Pressable
                  key={sides}
                  onPress={() => setPlasterSides(sides)}
                  style={[
                    styles.segmentButton,
                    plasterSides === sides &&
                      styles.segmentButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      plasterSides === sides &&
                        styles.segmentTextActive,
                    ]}
                  >
                    {sides === 0
                      ? "Sin repello"
                      : `${sides} cara${sides === 1 ? "" : "s"}`}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.formGrid}>
              <FormInput
                label="Espesor del repello"
                value={form.plasterThicknessCentimeters}
                onChangeText={(value) =>
                  updateField(
                    "plasterThicknessCentimeters",
                    value,
                  )
                }
                placeholder="1.5"
                unit="cm"
              />
              <FormInput
                label="Desperdicio del repello"
                value={form.plasterWastePercentage}
                onChangeText={(value) =>
                  updateField("plasterWastePercentage", value)
                }
                placeholder="10"
                unit="%"
              />
            </View>

            <Text style={styles.fieldLabel}>Proporción del mortero</Text>
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
            </View>

            <FormInput
              label="Peso del saco de cemento"
              value={form.cementBagWeight}
              onChangeText={(value) =>
                updateField("cementBagWeight", value)
              }
              placeholder="42.5"
              unit="kg"
              fullWidth
            />
          </Section>

          <Section
            title="Precios y mano de obra"
            description="Puedes escribirlos o tomarlos del catálogo de tu empresa."
          >
            <CatalogButton
              label="Cemento"
              value={selectedCatalogNames.cement}
              onPress={() => setCatalogTarget("cement")}
            />
            <CatalogButton
              label="Arena"
              value={selectedCatalogNames.sand}
              onPress={() => setCatalogTarget("sand")}
            />
            <CatalogButton
              label="Mano de obra de bloques"
              value={selectedCatalogNames.masonryLabor}
              onPress={() => setCatalogTarget("masonryLabor")}
            />
            <CatalogButton
              label="Mano de obra de repello"
              value={selectedCatalogNames.plasterLabor}
              onPress={() => setCatalogTarget("plasterLabor")}
            />

            <View style={styles.formGrid}>
              <FormInput
                label="Cemento por saco"
                value={form.cementPrice}
                onChangeText={(value) =>
                  updateField("cementPrice", value)
                }
                placeholder="0.00"
                unit="B/."
              />
              <FormInput
                label="Arena por m³"
                value={form.sandPrice}
                onChangeText={(value) =>
                  updateField("sandPrice", value)
                }
                placeholder="0.00"
                unit="B/."
              />
              <FormInput
                label="Colocación por m²"
                value={form.masonryLaborPrice}
                onChangeText={(value) =>
                  updateField("masonryLaborPrice", value)
                }
                placeholder="0.00"
                unit="B/."
              />
              <FormInput
                label="Repello por m²"
                value={form.plasterLaborPrice}
                onChangeText={(value) =>
                  updateField("plasterLaborPrice", value)
                }
                placeholder="0.00"
                unit="B/."
              />
            </View>
          </Section>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              disabled={!canCalculate}
              onPress={handleCalculate}
              style={({ pressed }) => [
                styles.primaryButton,
                !canCalculate && styles.disabledButton,
                pressed && canCalculate && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="calculator-outline"
                size={21}
                color={colors.textLight}
              />
              <Text style={styles.primaryButtonText}>Calcular</Text>
            </Pressable>

            <Pressable
              onPress={clearMeasurements}
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
                Limpiar medidas
              </Text>
            </Pressable>
          </View>

          {result ? (
            <Results
              result={result}
              plasterSides={plasterSides}
              currencyCode={currencyCode}
              onAddToBudget={handleAddToBudget}
            />
          ) : null}

          {budgetMessage ? (
            <View style={styles.successBox}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.successText}>{budgetMessage}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <CatalogPicker
        visible={Boolean(catalogTarget)}
        target={catalogTarget}
        items={catalogItems}
        loading={catalogLoading}
        currencyCode={currencyCode}
        onClose={() => setCatalogTarget(null)}
        onSelect={selectCatalogItem}
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
      <Text style={styles.sectionDescription}>{description}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  unit,
  fullWidth = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  unit?: string;
  fullWidth?: boolean;
}) {
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
        {unit ? <Text style={styles.inputUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function RatioInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
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
      style={({ pressed }) => [
        styles.catalogButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.catalogButtonText}>
        <Text style={styles.catalogLabel}>{label}</Text>
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

function CatalogPicker({
  visible,
  target,
  items,
  loading,
  currencyCode,
  onClose,
  onSelect,
}: {
  visible: boolean;
  target: CatalogTarget | null;
  items: CatalogItemWithDetails[];
  loading: boolean;
  currencyCode?: string;
  onClose: () => void;
  onSelect: (item: CatalogItemWithDetails) => void;
}) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) setSearch("");
  }, [target, visible]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const laborTarget =
      target === "masonryLabor" || target === "plasterLabor";

    return items.filter((item) => {
      const validType = laborTarget
        ? item.item_type === "labor" || item.item_type === "service"
        : item.item_type === "material";

      if (!validType) return false;
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        (item.sku?.toLowerCase().includes(query) ?? false) ||
        (item.category?.name.toLowerCase().includes(query) ?? false)
      );
    });
  }, [items, search, target]);

  const titles: Record<CatalogTarget, string> = {
    block: "Seleccionar bloque",
    cement: "Seleccionar cemento",
    sand: "Seleccionar arena",
    masonryLabor: "Seleccionar colocación de bloques",
    plasterLabor: "Seleccionar mano de obra de repello",
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modal}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.modalClose}>Cerrar</Text>
          </Pressable>
          <Text style={styles.modalTitle}>
            {target ? titles[target] : "Seleccionar del catálogo"}
          </Text>
          <View style={styles.modalSpacer} />
        </View>

        <View style={styles.modalContent}>
          <View style={styles.searchBox}>
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
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <View style={styles.modalLoading}>
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
                <View style={styles.emptyCatalog}>
                  <Ionicons
                    name="cube-outline"
                    size={42}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyTitle}>
                    No hay ítems compatibles
                  </Text>
                  <Text style={styles.emptyText}>
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
                      {formatMoney(price, currencyCode)}
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

function Results({
  result,
  plasterSides,
  currencyCode,
  onAddToBudget,
}: {
  result: MasonryResult;
  plasterSides: PlasterSides;
  currencyCode?: string;
  onAddToBudget: () => void;
}) {
  const number = (value: number, digits = 2) =>
    formatDecimal(value, digits, currencyCode);
  const money = (value: number) =>
    formatMoney(value, currencyCode);

  return (
    <View style={styles.resultsSection}>
      <View style={styles.resultsHeader}>
        <View>
          <Text style={styles.resultsLabel}>Resultado estimado</Text>
          <Text style={styles.resultsValue}>
            {number(result.netWallArea, 2)} m² de muro
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
        label="Área bruta"
        value={`${number(result.grossWallArea, 2)} m²`}
      />
      <ResultRow
        label="Área neta"
        value={`${number(result.netWallArea, 2)} m²`}
      />
      <ResultRow
        label="Bloques a comprar"
        value={`${number(result.blocksToBuy, 0)} unidades`}
        detail={`${number(result.blocksExact, 2)} unidades calculadas con desperdicio`}
      />

      <View style={styles.divider} />
      <Text style={styles.resultGroupTitle}>Mortero y repello</Text>
      <ResultRow
        label="Mortero de pega"
        value={`${number(result.layingMortarVolume, 3)} m³`}
      />
      <ResultRow
        label={`Repello (${plasterSides} cara${plasterSides === 1 ? "" : "s"})`}
        value={`${number(result.plasterArea, 2)} m²`}
        detail={`${number(result.plasterMortarVolume, 3)} m³ de mortero`}
      />
      <ResultRow
        label="Cemento"
        value={`${number(result.cementBags, 2)} sacos`}
        detail={`Comprar ${number(result.cementBagsToBuy, 0)} sacos`}
      />
      <ResultRow
        label="Arena"
        value={`${number(result.sandVolume, 3)} m³`}
      />

      <View style={styles.divider} />
      <Text style={styles.resultGroupTitle}>Costos</Text>
      <ResultRow label="Bloques" value={money(result.blockCost)} />
      <ResultRow label="Cemento" value={money(result.cementCost)} />
      <ResultRow label="Arena" value={money(result.sandCost)} />
      <ResultRow
        label="Colocación de bloques"
        value={money(result.masonryLaborCost)}
      />
      <ResultRow
        label="Repello"
        value={money(result.plasterLaborCost)}
      />
      <ResultRow
        label="Total de materiales"
        value={money(result.materialsCost)}
      />
      <ResultRow
        label="Total de mano de obra"
        value={money(result.laborCost)}
      />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Costo estimado</Text>
        <Text style={styles.totalValue}>
          {money(result.totalCost)}
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
        <Text style={styles.addBudgetText}>
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
          La cantidad real puede variar por juntas, modulación, cortes,
          plomos, vanos y condiciones de obra. Ajusta los rendimientos a
          tu sistema constructivo.
        </Text>
      </View>
    </View>
  );
}

function ResultRow({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <View style={styles.resultRow}>
      <View style={styles.resultRowText}>
        <Text style={styles.resultLabel}>{label}</Text>
        {detail ? (
          <Text style={styles.resultDetail}>{detail}</Text>
        ) : null}
      </View>
      <Text style={styles.resultAmount}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 44,
  },
  introduction: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  introIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  introText: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: colors.textLight,
    fontSize: 21,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 19,
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
  sectionDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionContent: {
    marginTop: 16,
    gap: 12,
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  inputGroup: {
    width: "48%",
    minWidth: 135,
    flexGrow: 1,
  },
  fullWidthInput: {
    width: "100%",
  },
  inputLabel: {
    marginBottom: 7,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  inputContainer: {
    height: 50,
    paddingHorizontal: 13,
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
    fontSize: 15,
    fontWeight: "700",
  },
  inputUnit: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmentText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  segmentTextActive: {
    color: colors.textLight,
  },
  ratioRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  ratioGroup: { flex: 1 },
  ratioInput: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  ratioSeparator: {
    paddingBottom: 13,
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  catalogButton: {
    minHeight: 58,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    flexDirection: "row",
    alignItems: "center",
  },
  catalogButtonText: { flex: 1 },
  catalogLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  catalogValue: {
    marginTop: 3,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  primaryButton: {
    flex: 1.3,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  disabledButton: { opacity: 0.45 },
  buttonPressed: { opacity: 0.75 },
  errorBox: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    gap: 9,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  successBox: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 14,
  },
  successText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  resultsSection: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  resultsLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  resultsValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  resultsIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  resultRow: {
    minHeight: 52,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  resultRowText: { flex: 1 },
  resultLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  resultDetail: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  resultAmount: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  resultGroupTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalRow: {
    marginTop: 12,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "800",
  },
  totalValue: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: "900",
  },
  addBudgetButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
  },
  addBudgetText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },
  warningBox: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#FFFBEB",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 14,
  },
  warningText: {
    flex: 1,
    color: "#92400E",
    fontSize: 11,
    lineHeight: 17,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    height: 60,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalClose: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  modalTitle: {
    flex: 1,
    marginHorizontal: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  modalSpacer: { width: 45 },
  modalContent: { flex: 1, padding: 18 },
  searchBox: {
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 9,
    color: colors.text,
    fontSize: 14,
  },
  modalLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  catalogList: { paddingTop: 14, paddingBottom: 30 },
  catalogItem: {
    minHeight: 68,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  catalogItemInfo: { flex: 1 },
  catalogItemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  catalogItemMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },
  catalogItemPrice: {
    marginLeft: 12,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  emptyCatalog: {
    padding: 35,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});
