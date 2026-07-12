import { Ionicons } from "@expo/vector-icons";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
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

import { colors, radius } from "@/constants/theme";
import { formatMoney } from "@/types/budget";
import type {
  CatalogItemWithDetails,
} from "@/types/catalog";

type PricingEditorModalProps = {
  visible: boolean;
  item: CatalogItemWithDetails | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: {
    unitCost: number;
    salePrice: number;
    wastePercentage: number;
    notes: string;
  }) => void;
};

function numberToInput(value: number): string {
  return Number.isFinite(value)
    ? String(value)
    : "0";
}

function parseNumber(value: string): number {
  const parsed = Number(
    value.trim().replace(",", "."),
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export function PricingEditorModal({
  visible,
  item,
  saving,
  onClose,
  onSave,
}: PricingEditorModalProps) {
  const [unitCost, setUnitCost] = useState("0");
  const [salePrice, setSalePrice] = useState("0");
  const [wastePercentage, setWastePercentage] =
    useState("0");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!visible || !item) return;

    setUnitCost(numberToInput(item.unit_cost));
    setSalePrice(numberToInput(item.sale_price));
    setWastePercentage(
      numberToInput(item.waste_percentage),
    );
    setNotes("");
  }, [item, visible]);

  const calculations = useMemo(() => {
    const cost = parseNumber(unitCost);
    const sale = parseNumber(salePrice);
    const utility = sale - cost;
    const margin =
      sale > 0 ? (utility / sale) * 100 : 0;
    const markup =
      cost > 0 ? (utility / cost) * 100 : 0;

    return {
      cost,
      sale,
      utility,
      margin,
      markup,
    };
  }, [salePrice, unitCost]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                Editar precio
              </Text>
              <Text
                style={styles.subtitle}
                numberOfLines={1}
              >
                {item?.name ?? ""}
              </Text>
            </View>

            <Pressable
              disabled={saving}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close-outline"
                size={25}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.summary}>
              <Summary
                label="Utilidad"
                value={formatMoney(
                  calculations.utility,
                )}
                danger={calculations.utility < 0}
              />
              <Summary
                label="Margen"
                value={`${calculations.margin.toFixed(
                  1,
                )}%`}
                danger={calculations.margin < 0}
              />
              <Summary
                label="Recargo"
                value={`${calculations.markup.toFixed(
                  1,
                )}%`}
                danger={calculations.markup < 0}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Field
                  label="Costo unitario"
                  value={unitCost}
                  onChangeText={setUnitCost}
                />
              </View>

              <View style={styles.column}>
                <Field
                  label="Precio de venta"
                  value={salePrice}
                  onChangeText={setSalePrice}
                />
              </View>
            </View>

            <Field
              label="Desperdicio (%)"
              value={wastePercentage}
              onChangeText={setWastePercentage}
            />

            <Text style={styles.label}>
              Nota del cambio
            </Text>
            <TextInput
              value={notes}
              editable={!saving}
              onChangeText={setNotes}
              placeholder="Ej.: actualización del proveedor"
              placeholderTextColor="#94A3B8"
              multiline
              style={[
                styles.input,
                styles.multiline,
              ]}
            />

            <Pressable
              disabled={saving}
              onPress={() =>
                onSave({
                  unitCost:
                    calculations.cost,
                  salePrice:
                    calculations.sale,
                  wastePercentage:
                    parseNumber(wastePercentage),
                  notes,
                })
              }
              style={[
                styles.saveButton,
                saving && styles.disabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  color={colors.textLight}
                />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={colors.textLight}
                  />
                  <Text style={styles.saveText}>
                    Guardar y registrar
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="0.00"
        placeholderTextColor="#94A3B8"
        keyboardType="decimal-pad"
        style={styles.input}
      />
    </View>
  );
}

function Summary({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.summaryBlock}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          danger && styles.danger,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.60)",
    justifyContent: "flex-end",
  },

  card: {
    maxHeight: "88%",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },

  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 18,
    paddingBottom: 28,
    gap: 14,
  },

  summary: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    flexDirection: "row",
  },

  summaryBlock: {
    flex: 1,
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  summaryValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  danger: {
    color: colors.danger,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
  },

  multiline: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  saveButton: {
    minHeight: 53,
    marginTop: 7,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.65,
  },
});
