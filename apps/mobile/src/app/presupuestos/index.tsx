import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import { colors, radius } from "../../constants/theme";
import { generateAndShareBudgetPdf } from "../../utils/budget-pdf";
import {
  addManualBudgetItem,
  clearBudgetDraft,
  getBudgetDraft,
  removeBudgetItem,
  saveBudgetDraft,
  type BudgetDraft,
  type BudgetItem,
} from "../../utils/budget-storage";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    maximumFractionDigits: 3,
  }).format(value);
}

function parseNumber(value: string): number {
  const result = Number(value.replace(",", "."));

  return Number.isFinite(result) && result >= 0
    ? result
    : 0;
}

export default function BudgetDraftScreen() {
  const [draft, setDraft] = useState<BudgetDraft | null>(
    null,
  );
  const [isGeneratingPdf, setIsGeneratingPdf] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadDraft() {
        const currentDraft = await getBudgetDraft();

        if (active) {
          setDraft(currentDraft);
        }
      }

      void loadDraft();

      return () => {
        active = false;
      };
    }, []),
  );

  const totals = useMemo(() => {
    if (!draft) {
      return {
        directCost: 0,
        overhead: 0,
        costWithOverhead: 0,
        profit: 0,
        saleBeforeDiscount: 0,
        discount: 0,
        taxable: 0,
        tax: 0,
        total: 0,
      };
    }

    const directCost = draft.items.reduce(
      (sum, item) =>
        sum + item.quantity * item.unitPrice,
      0,
    );

    const overhead =
      directCost *
      (Math.max(draft.overheadPercentage, 0) / 100);

    const costWithOverhead =
      directCost + overhead;

    const profit =
      costWithOverhead *
      (Math.max(draft.profitPercentage, 0) / 100);

    const saleBeforeDiscount =
      costWithOverhead + profit;

    const discount = Math.min(
      Math.max(draft.discount, 0),
      saleBeforeDiscount,
    );

    const taxable =
      saleBeforeDiscount - discount;

    const tax =
      taxable *
      (Math.max(draft.taxPercentage, 0) / 100);

    return {
      directCost,
      overhead,
      costWithOverhead,
      profit,
      saleBeforeDiscount,
      discount,
      taxable,
      tax,
      total: taxable + tax,
    };
  }, [draft]);

  async function updateDraft(
    changes: Partial<BudgetDraft>,
  ) {
    if (!draft) {
      return;
    }

    const updatedDraft = {
      ...draft,
      ...changes,
    };

    setDraft(updatedDraft);
    await saveBudgetDraft(updatedDraft);
  }

  async function updateItem(
    itemId: string,
    changes: Partial<BudgetItem>,
  ) {
    if (!draft) {
      return;
    }

    const updatedDraft = {
      ...draft,
      items: draft.items.map((item) =>
        item.id === itemId
          ? { ...item, ...changes }
          : item,
      ),
    };

    setDraft(updatedDraft);
    await saveBudgetDraft(updatedDraft);
  }

  async function deleteItem(itemId: string) {
    const updatedDraft = await removeBudgetItem(itemId);
    setDraft(updatedDraft);
  }

  async function addManualItem() {
    const updatedDraft = await addManualBudgetItem();
    setDraft(updatedDraft);
  }


  async function handleGeneratePdf() {
    if (!draft || draft.items.length === 0) {
      Alert.alert(
        "Presupuesto vacío",
        "Agrega al menos una partida antes de generar el PDF.",
      );
      return;
    }

    try {
      setIsGeneratingPdf(true);

      await generateAndShareBudgetPdf(
        draft,
        totals,
      );

      if (Platform.OS === "web") {
        Alert.alert(
          "Documento preparado",
          "Selecciona Guardar como PDF en el diálogo de impresión.",
        );
      }
    } catch (error) {
      console.error(error);

      Alert.alert(
        "No se pudo generar el PDF",
        "Verifica la información del presupuesto e inténtalo nuevamente.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function confirmClear() {
    Alert.alert(
      "Vaciar presupuesto",
      "Se eliminarán todas las partidas y se restablecerán los porcentajes.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Vaciar",
          style: "destructive",
          onPress: async () => {
            const emptyDraft =
              await clearBudgetDraft();
            setDraft(emptyDraft);
          },
        },
      ],
    );
  }

  if (!draft) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Cargando presupuesto...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Datos del presupuesto
          </Text>

          <Field
            label="Título"
            value={draft.title}
            onChangeText={(value) =>
              void updateDraft({ title: value })
            }
            placeholder="Ej. Construcción de losa"
          />

          <View style={styles.clientSelectorGroup}>
            <Text style={styles.fieldLabel}>Cliente</Text>

            <Pressable
              onPress={() =>
                router.push(
                  "/presupuestos/seleccionar-cliente",
                )
              }
              style={({ pressed }) => [
                styles.clientSelector,
                pressed && styles.pressedButton,
              ]}
            >
              <View style={styles.clientSelectorIcon}>
                <Ionicons
                  name="person-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.clientSelectorText}>
                <Text style={styles.clientSelectorName}>
                  {draft.clientName ||
                    "Seleccionar cliente"}
                </Text>

                <Text style={styles.clientSelectorDetail}>
                  {draft.clientName
                    ? [
                        draft.clientCompany,
                        draft.clientPhone,
                        draft.clientEmail,
                      ]
                        .filter(Boolean)
                        .join(" · ") ||
                      "Cliente seleccionado"
                    : "Elige un cliente registrado"}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={21}
                color="#94A3B8"
              />
            </Pressable>

            {draft.clientId ? (
              <Pressable
                onPress={() =>
                  void updateDraft({
                    clientId: "",
                    clientName: "",
                    clientCompany: "",
                    clientPhone: "",
                    clientEmail: "",
                    clientIdentification: "",
                    clientAddress: "",
                  })
                }
                style={styles.removeClientButton}
              >
                <Text style={styles.removeClientButtonText}>
                  Quitar cliente
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Partidas
              </Text>

              <Text style={styles.sectionDescription}>
                {draft.items.length} partida(s) agregada(s)
              </Text>
            </View>

            {draft.items.length > 0 ? (
              <Pressable
                onPress={confirmClear}
                style={styles.clearButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color={colors.danger}
                />

                <Text style={styles.clearButtonText}>
                  Vaciar
                </Text>
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => void addManualItem()}
            style={({ pressed }) => [
              styles.addItemButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={styles.addItemButtonText}>
              Agregar partida manual
            </Text>
          </Pressable>

          {draft.items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={42}
                color="#94A3B8"
              />

              <Text style={styles.emptyTitle}>
                No hay partidas
              </Text>

              <Text style={styles.emptyText}>
                Agrega una partida manual o envía un cálculo
                desde alguna calculadora.
              </Text>
            </View>
          ) : (
            draft.items.map((item) => (
              <BudgetItemCard
                key={item.id}
                item={item}
                onUpdate={(changes) =>
                  void updateItem(item.id, changes)
                }
                onDelete={() =>
                  void deleteItem(item.id)
                }
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Precio de venta
          </Text>

          <Text style={styles.sectionDescription}>
            Los costos indirectos se aplican al costo directo.
            La utilidad se aplica después de sumar los costos
            indirectos.
          </Text>

          <View style={styles.adjustmentGrid}>
            <NumberField
              label="Costos indirectos"
              value={String(
                draft.overheadPercentage,
              )}
              onChangeText={(value) =>
                void updateDraft({
                  overheadPercentage:
                    parseNumber(value),
                })
              }
              unit="%"
            />

            <NumberField
              label="Utilidad"
              value={String(
                draft.profitPercentage,
              )}
              onChangeText={(value) =>
                void updateDraft({
                  profitPercentage:
                    parseNumber(value),
                })
              }
              unit="%"
            />
          </View>

          <View style={styles.adjustmentGrid}>
            <NumberField
              label="Descuento"
              value={String(draft.discount)}
              onChangeText={(value) =>
                void updateDraft({
                  discount: parseNumber(value),
                })
              }
              unit="B/."
            />

            <NumberField
              label="ITBMS"
              value={String(
                draft.taxPercentage,
              )}
              onChangeText={(value) =>
                void updateDraft({
                  taxPercentage:
                    parseNumber(value),
                })
              }
              unit="%"
            />
          </View>

          <Field
            label="Notas"
            value={draft.notes}
            onChangeText={(value) =>
              void updateDraft({ notes: value })
            }
            placeholder="Condiciones, alcance o exclusiones"
            multiline
          />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalCardTitle}>
            Resumen financiero
          </Text>

          <TotalRow
            label="Costo directo"
            value={formatMoney(totals.directCost)}
          />

          <TotalRow
            label={`Costos indirectos (${formatNumber(
              draft.overheadPercentage,
            )} %)`}
            value={formatMoney(totals.overhead)}
          />

          <TotalRow
            label={`Utilidad (${formatNumber(
              draft.profitPercentage,
            )} %)`}
            value={formatMoney(totals.profit)}
          />

          <TotalRow
            label="Precio antes de descuento"
            value={formatMoney(
              totals.saleBeforeDiscount,
            )}
          />

          <TotalRow
            label="Descuento"
            value={`- ${formatMoney(
              totals.discount,
            )}`}
          />

          <TotalRow
            label={`ITBMS (${formatNumber(
              draft.taxPercentage,
            )} %)`}
            value={formatMoney(totals.tax)}
          />

          <View style={styles.totalDivider} />

          <TotalRow
            label="Total a cobrar"
            value={formatMoney(totals.total)}
            highlighted
          />
        </View>

        <Pressable
          disabled={
            isGeneratingPdf ||
            draft.items.length === 0
          }
          onPress={() => void handleGeneratePdf()}
          style={({ pressed }) => [
            styles.pdfButton,
            (isGeneratingPdf ||
              draft.items.length === 0) &&
              styles.pdfButtonDisabled,
            pressed &&
              !isGeneratingPdf &&
              draft.items.length > 0 &&
              styles.pressedButton,
          ]}
        >
          <Ionicons
            name="document-attach-outline"
            size={21}
            color={colors.textLight}
          />

          <Text style={styles.pdfButtonText}>
            {isGeneratingPdf
              ? "Generando documento..."
              : Platform.OS === "web"
                ? "Imprimir o guardar PDF"
                : "Generar y compartir PDF"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        style={[
          styles.textInput,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

type NumberFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
};

function NumberField({
  label,
  value,
  onChangeText,
  unit,
}: NumberFieldProps) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.numberInputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          style={styles.numberInput}
        />

        <Text style={styles.inputUnit}>{unit}</Text>
      </View>
    </View>
  );
}

type BudgetItemCardProps = {
  item: BudgetItem;
  onUpdate: (changes: Partial<BudgetItem>) => void;
  onDelete: () => void;
};

function BudgetItemCard({
  item,
  onUpdate,
  onDelete,
}: BudgetItemCardProps) {
  const total = item.quantity * item.unitPrice;

  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemHeaderText}>
          <TextInput
            value={item.description}
            onChangeText={(value) =>
              onUpdate({ description: value })
            }
            style={styles.itemDescriptionInput}
          />

          {item.details ? (
            <Text style={styles.itemDetails}>
              {item.details}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onDelete}
          style={styles.deleteButton}
        >
          <Ionicons
            name="close-outline"
            size={20}
            color={colors.danger}
          />
        </Pressable>
      </View>

      <View style={styles.itemGrid}>
        <NumberField
          label="Cantidad"
          value={String(item.quantity)}
          onChangeText={(value) =>
            onUpdate({
              quantity: parseNumber(value),
            })
          }
          unit={item.unit}
        />

        <NumberField
          label="Precio unitario"
          value={String(item.unitPrice)}
          onChangeText={(value) =>
            onUpdate({
              unitPrice: parseNumber(value),
            })
          }
          unit="B/."
        />
      </View>

      <View style={styles.unitEditor}>
        <Text style={styles.fieldLabel}>
          Unidad
        </Text>

        <TextInput
          value={item.unit}
          onChangeText={(value) =>
            onUpdate({ unit: value })
          }
          placeholder="und"
          placeholderTextColor="#94A3B8"
          style={styles.unitInput}
        />
      </View>

      <View style={styles.itemTotalRow}>
        <Text style={styles.itemTotalLabel}>
          Total de partida
        </Text>

        <Text style={styles.itemTotalValue}>
          {formatMoney(total)}
        </Text>
      </View>
    </View>
  );
}

type TotalRowProps = {
  label: string;
  value: string;
  highlighted?: boolean;
};

function TotalRow({
  label,
  value,
  highlighted = false,
}: TotalRowProps) {
  return (
    <View style={styles.totalRow}>
      <Text
        style={[
          styles.totalLabel,
          highlighted && styles.highlightedLabel,
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.totalValue,
          highlighted && styles.highlightedValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  content: {
    padding: 18,
    paddingBottom: 45,
  },

  section: {
    marginBottom: 18,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  sectionHeader: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionDescription: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  fieldGroup: {
    marginTop: 16,
  },

  clientSelectorGroup: {
    marginTop: 16,
  },

  clientSelector: {
    minHeight: 72,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  clientSelectorIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  clientSelectorText: {
    flex: 1,
    marginHorizontal: 12,
  },

  clientSelectorName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  clientSelectorDetail: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  removeClientButton: {
    alignSelf: "flex-start",
    marginTop: 8,
  },

  removeClientButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },

  fieldLabel: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },

  textInput: {
    minHeight: 50,
    paddingHorizontal: 13,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    color: colors.text,
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 95,
    paddingTop: 13,
    textAlignVertical: "top",
  },

  adjustmentGrid: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },

  numberField: {
    flex: 1,
    minWidth: 120,
  },

  numberInputContainer: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  numberInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  inputUnit: {
    marginLeft: 6,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  clearButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "800",
  },

  addItemButton: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  addItemButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  pressedButton: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  emptyState: {
    paddingVertical: 32,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 6,
    maxWidth: 300,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  itemCard: {
    marginTop: 14,
    padding: 15,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  itemHeaderText: {
    flex: 1,
    paddingRight: 8,
  },

  itemDescriptionInput: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  itemDetails: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  itemGrid: {
    marginTop: 15,
    flexDirection: "row",
    gap: 10,
  },

  unitEditor: {
    marginTop: 12,
  },

  unitInput: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },

  itemTotalRow: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  itemTotalLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  itemTotalValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  pdfButton: {
    minHeight: 56,
    marginTop: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  pdfButtonDisabled: {
    backgroundColor: "#94A3B8",
  },

  pdfButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },

  totalCard: {
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
  },

  totalCardTitle: {
    marginBottom: 10,
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "900",
  },

  totalRow: {
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  totalLabel: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 14,
  },

  totalValue: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "800",
  },

  totalDivider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: "#334155",
  },

  highlightedLabel: {
    color: colors.textLight,
    fontSize: 17,
    fontWeight: "900",
  },

  highlightedValue: {
    color: "#4ADE80",
    fontSize: 22,
    fontWeight: "900",
  },
});
