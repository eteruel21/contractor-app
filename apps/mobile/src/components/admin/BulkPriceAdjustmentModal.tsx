import { Ionicons } from "@expo/vector-icons";
import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors, radius } from "@/constants/theme";

type BulkPriceAdjustmentModalProps = {
  visible: boolean;
  itemCount: number;
  saving: boolean;
  onClose: () => void;
  onApply: (input: {
    target: "unit_cost" | "sale_price";
    percentage: number;
    notes: string;
  }) => void;
};

function parseNumber(value: string): number {
  const parsed = Number(
    value.trim().replace(",", "."),
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export function BulkPriceAdjustmentModal({
  visible,
  itemCount,
  saving,
  onClose,
  onApply,
}: BulkPriceAdjustmentModalProps) {
  const [target, setTarget] =
    useState<"unit_cost" | "sale_price">(
      "sale_price",
    );
  const [percentage, setPercentage] =
    useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!visible) return;

    setTarget("sale_price");
    setPercentage("");
    setNotes("");
  }, [visible]);

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
                Ajuste masivo
              </Text>
              <Text style={styles.subtitle}>
                Afectará {itemCount} elemento
                {itemCount === 1 ? "" : "s"} visibles
              </Text>
            </View>

            <Pressable
              disabled={saving}
              onPress={onClose}
            >
              <Ionicons
                name="close-outline"
                size={25}
                color={colors.text}
              />
            </Pressable>
          </View>

          <Text style={styles.label}>
            Valor que deseas ajustar
          </Text>

          <View style={styles.targets}>
            <TargetButton
              label="Costo"
              active={target === "unit_cost"}
              onPress={() => setTarget("unit_cost")}
            />
            <TargetButton
              label="Precio de venta"
              active={target === "sale_price"}
              onPress={() => setTarget("sale_price")}
            />
          </View>

          <Text style={styles.label}>
            Porcentaje
          </Text>
          <TextInput
            value={percentage}
            editable={!saving}
            onChangeText={setPercentage}
            placeholder="Ej.: 5 o -3"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
            style={styles.input}
          />

          <Text style={styles.hint}>
            Un número positivo aumenta; uno negativo reduce.
          </Text>

          <Text style={styles.label}>
            Nota del ajuste
          </Text>
          <TextInput
            value={notes}
            editable={!saving}
            onChangeText={setNotes}
            placeholder="Ej.: aumento general del proveedor"
            placeholderTextColor="#94A3B8"
            multiline
            style={[
              styles.input,
              styles.multiline,
            ]}
          />

          <Pressable
            disabled={saving || itemCount === 0}
            onPress={() =>
              onApply({
                target,
                percentage:
                  parseNumber(percentage),
                notes,
              })
            }
            style={[
              styles.applyButton,
              (saving || itemCount === 0) &&
                styles.disabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator
                color={colors.textLight}
              />
            ) : (
              <>
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color={colors.textLight}
                />
                <Text style={styles.applyText}>
                  Aplicar ajuste
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TargetButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.targetButton,
        active && styles.targetButtonActive,
      ]}
    >
      <Text
        style={[
          styles.targetText,
          active && styles.targetTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  header: {
    marginBottom: 19,
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

  label: {
    marginTop: 13,
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  targets: {
    flexDirection: "row",
    gap: 9,
  },

  targetButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  targetButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  targetText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },

  targetTextActive: {
    color: colors.primaryDark,
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
    minHeight: 85,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  hint: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 11,
  },

  applyButton: {
    minHeight: 53,
    marginTop: 22,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  applyText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  disabled: {
    opacity: 0.55,
  },
});
