import { Ionicons } from "@expo/vector-icons";

import {
  type Href,
  router,
  Stack,
  useLocalSearchParams,
} from "expo-router";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  radius,
} from "@/constants/theme";

import { useCompany } from "@/contexts/CompanyContext";

import {
  addBudgetItem,
  deleteBudgetItem,
  getBudgetById,
} from "@/services/budget-service";
import { getInvoiceByBudgetId, createInvoiceFromBudget } from "@/services/invoice-service";
import type { Invoice } from "@/types/invoice";

import type {
  BudgetItem,
  BudgetSection,
  BudgetWithDetails,
} from "@/types/budget";

import {
  formatMoney,
  getBudgetStatusLabel,
} from "@/types/budget";

import { shareBudgetPdf } from "@/utils/budget-pdf";

import { listCatalogItems } from "@/services/catalog-service";
import type { CatalogItemWithDetails } from "@/types/catalog";
import { getCatalogItemTypeLabel } from "@/types/catalog";

export default function BudgetDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const budgetId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { activeCompany } = useCompany();

  const [budget, setBudget] =
    useState<BudgetWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [modalVisible, setModalVisible] =
    useState(false);
  const [catalogModalVisible, setCatalogModalVisible] =
    useState(false);
  const [sharingPdf, setSharingPdf] =
    useState(false);
  const [associatedInvoice, setAssociatedInvoice] =
    useState<Invoice | null>(null);
  const [generatingInvoice, setGeneratingInvoice] =
    useState(false);
  const defaultSection = useMemo(() => {
    return budget?.sections[0] ?? null;
  }, [budget]);

  const loadBudget = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany || !budgetId) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { budget: loadedBudget, error } =
        await getBudgetById(
          activeCompany.id,
          budgetId,
        );

      if (error) {
        Alert.alert(
          "No fue posible cargar el presupuesto",
          error,
        );
      } else {
        setBudget(loadedBudget);
        try {
          const { invoice } = await getInvoiceByBudgetId(
            activeCompany.id,
            budgetId,
          );
          setAssociatedInvoice(invoice);
        } catch {
          // Ignore
        }
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany, budgetId],
  );

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(() => {
      if (active) void loadBudget();
    });

    return () => {
      active = false;
    };
  }, [loadBudget]);

  async function handleDeleteItem(item: BudgetItem) {
    if (!activeCompany || !budget) return;

    Alert.alert(
      "Eliminar partida",
      `¿Deseas eliminar "${item.description}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const { error } =
              await deleteBudgetItem({
                companyId: activeCompany.id,
                budgetId: budget.id,
                itemId: item.id,
              });

            if (error) {
              Alert.alert(
                "No fue posible eliminar la partida",
                error,
              );
              return;
            }

            await loadBudget(true);
          },
        },
      ],
    );
  }

  if (!activeCompany || !budgetId) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Presupuesto no disponible
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!budget) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Presupuesto no encontrado
        </Text>
      </View>
    );
  }

  async function handleSharePdf() {
    if (!activeCompany || !budget) return;

    try {
      setSharingPdf(true);

      const { error } = await shareBudgetPdf({
        company: activeCompany,
        budget,
      });

      if (error) {
        Alert.alert(
          "No fue posible compartir el PDF",
          error,
        );
      }
    } finally {
      setSharingPdf(false);
    }
  }

  async function handleCreateInvoice() {
    if (!activeCompany || !budget) return;

    if (associatedInvoice) {
      router.push({
        pathname: "/facturas/[id]",
        params: { id: associatedInvoice.id },
      } as Href);
      return;
    }

    Alert.alert(
      "Facturar presupuesto",
      `¿Deseas generar la factura para el presupuesto ${budget.budget_number}? Se asignará el correlativo automático.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Generar",
          onPress: async () => {
            try {
              setGeneratingInvoice(true);
              const { invoice, error } = await createInvoiceFromBudget({
                companyId: activeCompany.id,
                budgetId: budget.id,
                clientId: budget.client_id,
              });

              if (error) {
                Alert.alert("Error al generar factura", error);
                return;
              }

              if (invoice) {
                setAssociatedInvoice(invoice);
                Alert.alert(
                  "Factura generada",
                  `Se ha creado la factura ${invoice.invoice_number} con éxito.`,
                  [
                    {
                      text: "Ver factura",
                      onPress: () => {
                        router.push({
                          pathname: "/facturas/[id]",
                          params: { id: invoice.id },
                        } as Href);
                      },
                    },
                    { text: "Aceptar", style: "default" },
                  ],
                );
              }
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Ocurrió un error");
            } finally {
              setGeneratingInvoice(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: budget.budget_number,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadBudget(true)
            }
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="receipt-outline"
              size={30}
              color={colors.textLight}
            />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.budgetNumber}>
              {budget.budget_number}
            </Text>

            <Text style={styles.budgetTitle}>
              {budget.title}
            </Text>

            <Text style={styles.budgetStatus}>
              {getBudgetStatusLabel(
                budget.status,
              )}
            </Text>
          </View>
        </View>

        <View style={styles.totalCard}>
          <TotalRow
            label="Subtotal"
            value={formatMoney(budget.subtotal)}
          />

          <TotalRow
            label="Descuento"
            value={formatMoney(
              budget.discount_amount,
            )}
          />

          <TotalRow
            label={`ITBMS ${budget.tax_rate}%`}
            value={formatMoney(
              budget.tax_amount,
            )}
          />

          <View style={styles.totalDivider} />

          <TotalRow
            label="Total"
            value={formatMoney(budget.total)}
            strong
          />
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => void handleSharePdf()}
            disabled={sharingPdf}
            style={({ pressed }) => [
              styles.pdfButton,
              sharingPdf && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            {sharingPdf ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Ionicons
                  name="share-social-outline"
                  size={21}
                  color={colors.textLight}
                />
                <Text style={styles.pdfButtonText}>Compartir PDF</Text>
              </>
            )}
          </Pressable>

          {budget.status === "approved" && (
            <Pressable
              onPress={() => void handleCreateInvoice()}
              disabled={generatingInvoice}
              style={({ pressed }) => [
                styles.invoiceButton,
                generatingInvoice && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {generatingInvoice ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Ionicons
                    name="receipt-outline"
                    size={21}
                    color={colors.textLight}
                  />
                  <Text style={styles.invoiceButtonText}>
                    {associatedInvoice ? "Ver factura" : "Generar factura"}
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Partidas
            </Text>

            <View style={styles.addButtonsRow}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/calculos/concreto",
                    params: { budgetId },
                  } as Href)
                }
                style={({ pressed }) => [
                  styles.catalogButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="calculator-outline"
                  size={18}
                  color={colors.primary}
                />

                <Text style={styles.catalogButtonText}>
                  Concreto
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setCatalogModalVisible(true)
                }
                style={({ pressed }) => [
                  styles.catalogButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={colors.primary}
                />

                <Text style={styles.catalogButtonText}>
                  Catálogo
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setModalVisible(true)
                }
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={colors.textLight}
                />

                <Text style={styles.addButtonText}>
                  Manual
                </Text>
              </Pressable>
            </View>
          </View>

          {budget.sections.map((section) => (
            <BudgetSectionBlock
              key={section.id}
              section={section}
              items={budget.items.filter(
                (item) =>
                  item.section_id === section.id,
              )}
              onDeleteItem={(item) =>
                void handleDeleteItem(item)
              }
            />
          ))}

          {budget.items.filter(
            (item) => !item.section_id,
          ).length > 0 ? (
            <BudgetSectionBlock
              section={null}
              items={budget.items.filter(
                (item) => !item.section_id,
              )}
              onDeleteItem={(item) =>
                void handleDeleteItem(item)
              }
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Condiciones
          </Text>

          <Text style={styles.termsText}>
            {budget.terms ||
              "Sin condiciones registradas."}
          </Text>
        </View>
      </ScrollView>

      <AddBudgetItemModal
        visible={modalVisible}
        companyId={activeCompany.id}
        budgetId={budget.id}
        sectionId={defaultSection?.id ?? null}
        onClose={() => setModalVisible(false)}
        onCreated={() => void loadBudget(true)}
      />

      <AddCatalogItemModal
        visible={catalogModalVisible}
        companyId={activeCompany.id}
        budgetId={budget.id}
        sectionId={defaultSection?.id ?? null}
        onClose={() =>
          setCatalogModalVisible(false)
        }
        onCreated={() => void loadBudget(true)}
      />
    </SafeAreaView>
  );
}

function BudgetSectionBlock({
  section,
  items,
  onDeleteItem,
}: {
  section: BudgetSection | null;
  items: BudgetItem[];
  onDeleteItem: (item: BudgetItem) => void;
}) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionBlockTitle}>
        {section?.name ?? "Sin sección"}
      </Text>

      {items.length === 0 ? (
        <Text style={styles.emptySmallText}>
          No hay partidas en esta sección.
        </Text>
      ) : (
        items.map((item) => (
          <View
            key={item.id}
            style={styles.itemCard}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>
                {item.description}
              </Text>

              <Pressable
                onPress={() =>
                  onDeleteItem(item)
                }
                hitSlop={12}
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color="#EF4444"
                />
              </Pressable>
            </View>

            <Text style={styles.itemMeta}>
              {item.quantity} {item.unit_name} ×{" "}
              {formatMoney(item.unit_price)}
            </Text>

            <Text style={styles.itemSubtotal}>
              {formatMoney(item.subtotal)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

function TotalRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text
        style={[
          styles.totalLabel,
          strong && styles.totalStrong,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.totalValue,
          strong && styles.totalStrong,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function AddBudgetItemModal({
  visible,
  companyId,
  budgetId,
  sectionId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  companyId: string;
  budgetId: string;
  sectionId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [description, setDescription] =
    useState("");
  const [unitName, setUnitName] =
    useState("unidad");
  const [quantity, setQuantity] =
    useState("1");
  const [unitPrice, setUnitPrice] =
    useState("");
  const [taxable, setTaxable] =
    useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  function resetForm() {
    setDescription("");
    setUnitName("unidad");
    setQuantity("1");
    setUnitPrice("");
    setTaxable(true);
    setNotes("");
  }

  async function handleSave() {
    const cleanQuantity =
      Number(
        quantity.replace(",", ".").trim(),
      ) || 0;

    const cleanUnitPrice =
      Number(
        unitPrice.replace(",", ".").trim(),
      ) || 0;

    try {
      setSubmitting(true);

      const { error } = await addBudgetItem({
        companyId,
        budgetId,
        sectionId,
        description,
        unitName,
        quantity: cleanQuantity,
        unitPrice: cleanUnitPrice,
        taxable,
        notes,
      });

      if (error) {
        Alert.alert(
          "No fue posible agregar la partida",
          error,
        );
        return;
      }

      resetForm();
      onClose();
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              Nueva partida
            </Text>

            <Pressable
              onPress={() => void handleSave()}
              disabled={submitting}
            >
              <Text style={styles.saveText}>
                Guardar
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={
              styles.modalContent
            }
            keyboardShouldPersistTaps="handled"
          >
            <FormField
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Ej. Instalación de cielo raso PVC"
              multiline
            />

            <FormField
              label="Unidad"
              value={unitName}
              onChangeText={setUnitName}
              placeholder="m², punto, unidad..."
            />

            <FormField
              label="Cantidad"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="decimal-pad"
            />

            <FormField
              label="Precio unitario"
              value={unitPrice}
              onChangeText={setUnitPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />

            <View style={styles.switchRow}>
              <View>
                <Text style={styles.label}>
                  Aplica ITBMS
                </Text>

                <Text style={styles.switchHint}>
                  Si está activo, esta partida entra en el cálculo del impuesto.
                </Text>
              </View>

              <Switch
                value={taxable}
                onValueChange={setTaxable}
              />
            </View>

            <FormField
              label="Notas"
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas internas"
              multiline
            />

            <Pressable
              onPress={() => void handleSave()}
              disabled={submitting}
              style={({ pressed }) => [
                styles.fullSaveButton,
                submitting &&
                  styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  color={colors.textLight}
                />
              ) : (
                <Text style={styles.fullSaveText}>
                  Guardar partida
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?:
    | "default"
    | "decimal-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
        ]}
      />
    </View>
  );
}

function AddCatalogItemModal({
  visible,
  companyId,
  budgetId,
  sectionId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  companyId: string;
  budgetId: string;
  sectionId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [items, setItems] = useState<
    CatalogItemWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [submittingItemId, setSubmittingItemId] =
    useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return items;

    return items.filter((item) => {
      const name = item.name.toLowerCase();
      const sku = item.sku?.toLowerCase() ?? "";
      const type = getCatalogItemTypeLabel(
        item.item_type,
      ).toLowerCase();
      const category =
        item.category?.name.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        sku.includes(query) ||
        type.includes(query) ||
        category.includes(query)
      );
    });
  }, [items, search]);

  useEffect(() => {
    if (!visible) return;

    async function loadCatalog() {
      setLoading(true);

      const { items: loadedItems, error } =
        await listCatalogItems(companyId);

      if (error) {
        Alert.alert(
          "No fue posible cargar el catálogo",
          error,
        );
      } else {
        setItems(loadedItems);
      }

      setLoading(false);
    }

    void loadCatalog();
  }, [companyId, visible]);

  async function handleAddCatalogItem(
    item: CatalogItemWithDetails,
  ) {
    const quantityNumber =
      Number(
        quantity.replace(",", ".").trim(),
      ) || 0;

    if (quantityNumber <= 0) {
      Alert.alert(
        "Cantidad inválida",
        "La cantidad debe ser mayor que cero.",
      );
      return;
    }

    const unitPrice =
      item.sale_price > 0
        ? item.sale_price
        : item.unit_cost;

    try {
      setSubmittingItemId(item.id);

      const { error } = await addBudgetItem({
        companyId,
        budgetId,
        sectionId,
        platformCatalogItemId: item.id,
        itemType: item.item_type,
        description: item.name,
        unitName:
          item.unit?.symbol ||
          item.unit?.name ||
          "unidad",
        quantity: quantityNumber,
        unitCost: item.unit_cost,
        unitPrice,
        taxable: true,
        notes: item.description ?? undefined,
      });

      if (error) {
        Alert.alert(
          "No fue posible agregar el ítem",
          error,
        );
        return;
      }

      setQuantity("1");
      onCreated();
    } finally {
      setSubmittingItemId(null);
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}>
            <Text style={styles.cancelText}>
              Cerrar
            </Text>
          </Pressable>

          <Text style={styles.modalTitle}>
            Catálogo
          </Text>

          <View style={{ width: 50 }} />
        </View>

        <View style={styles.catalogContent}>
          <View style={styles.catalogSearchBox}>
            <Ionicons
              name="search-outline"
              size={19}
              color={colors.textSecondary}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar material, mano de obra o SKU"
              placeholderTextColor="#94A3B8"
              style={styles.catalogSearchInput}
            />
          </View>

          <View style={styles.quantityBox}>
            <Text style={styles.label}>
              Cantidad a agregar
            </Text>

            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="1"
              placeholderTextColor="#94A3B8"
              style={styles.input}
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
              contentContainerStyle={
                styles.catalogListContent
              }
              ListEmptyComponent={
                <View style={styles.catalogEmpty}>
                  <Ionicons
                    name="cube-outline"
                    size={44}
                    color={colors.textSecondary}
                  />

                  <Text style={styles.emptyTitle}>
                    No hay ítems
                  </Text>

                  <Text style={styles.emptySmallText}>
                    No se encontraron materiales o servicios en el catálogo.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const unitPrice =
                  item.sale_price > 0
                    ? item.sale_price
                    : item.unit_cost;

                const isSubmitting =
                  submittingItemId === item.id;

                return (
                  <View style={styles.catalogCard}>
                    <View style={styles.catalogCardHeader}>
                      <View style={styles.catalogIcon}>
                        <Ionicons
                          name={
                            item.item_type === "labor"
                              ? "hammer-outline"
                              : item.item_type === "equipment"
                                ? "construct-outline"
                                : "cube-outline"
                          }
                          size={22}
                          color={colors.textLight}
                        />
                      </View>

                      <View style={styles.catalogInfo}>
                        <Text style={styles.catalogName}>
                          {item.name}
                        </Text>

                        <Text style={styles.catalogMeta}>
                          {getCatalogItemTypeLabel(
                            item.item_type,
                          )}
                          {item.category?.name
                            ? ` · ${item.category.name}`
                            : ""}
                        </Text>

                        <Text style={styles.catalogMeta}>
                          Unidad:{" "}
                          {item.unit?.symbol ||
                            item.unit?.name ||
                            "unidad"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.catalogPriceRow}>
                      <View>
                        <Text style={styles.catalogPriceLabel}>
                          Precio
                        </Text>

                        <Text style={styles.catalogPriceValue}>
                          {formatMoney(unitPrice)}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          void handleAddCatalogItem(item)
                        }
                        disabled={isSubmitting}
                        style={({ pressed }) => [
                          styles.catalogAddButton,
                          isSubmitting &&
                            styles.disabledButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator
                            color={colors.textLight}
                          />
                        ) : (
                          <Text style={styles.catalogAddText}>
                            Agregar
                          </Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
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

  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  heroCard: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  heroInfo: {
    flex: 1,
  },

  budgetNumber: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "900",
  },

  budgetTitle: {
    marginTop: 3,
    color: colors.textLight,
    fontSize: 21,
    fontWeight: "900",
  },

  budgetStatus: {
    marginTop: 5,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },

  totalCard: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  totalRow: {
    paddingVertical: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  totalLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },

  totalValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  totalStrong: {
    color: colors.primary,
    fontSize: 18,
  },

  totalDivider: {
    height: 1,
    marginVertical: 8,
    backgroundColor: colors.border,
  },

  section: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  addButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  addButtonText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "900",
  },

  sectionBlock: {
    marginTop: 10,
  },

  sectionBlockTitle: {
    marginBottom: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  itemCard: {
    marginBottom: 10,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },

  itemHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  itemTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
  },

  itemMeta: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  itemSubtotal: {
    marginTop: 5,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptySmallText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },

  termsText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  modalHeader: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },

  saveText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
  },

  inputMultiline: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  switchRow: {
    marginBottom: 15,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  switchHint: {
    maxWidth: 230,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  fullSaveButton: {
    minHeight: 56,
    marginTop: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  fullSaveText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  pdfButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  pdfButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  invoiceButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  invoiceButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  addButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },

  catalogButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  catalogButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  catalogContent: {
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

  quantityBox: {
    marginTop: 14,
    marginBottom: 12,
  },

  catalogLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  catalogListContent: {
    paddingBottom: 40,
  },

  catalogEmpty: {
    marginTop: 80,
    alignItems: "center",
  },

  catalogCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  catalogCardHeader: {
    flexDirection: "row",
    gap: 12,
  },

  catalogIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  catalogInfo: {
    flex: 1,
  },

  catalogName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  catalogMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  catalogPriceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  catalogPriceLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },

  catalogPriceValue: {
    marginTop: 3,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },

  catalogAddButton: {
    minHeight: 40,
    minWidth: 90,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  catalogAddText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "900",
  },
});
