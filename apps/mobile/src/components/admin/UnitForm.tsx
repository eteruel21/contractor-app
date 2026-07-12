import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";

import { colors, radius } from "@/constants/theme";
import type {
  UnitType,
} from "@/types/catalog";

export type UnitFormValue = {
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: string;
};

type UnitFormProps = {
  value: UnitFormValue;
  disabled?: boolean;
  typeLocked?: boolean;
  onChange: (value: UnitFormValue) => void;
};

const UNIT_TYPES: {
  value: UnitType;
  label: string;
  description: string;
}[] = [
  {
    value: "length",
    label: "Longitud",
    description: "Metro, pie, pulgada...",
  },
  {
    value: "area",
    label: "Área",
    description: "m², pie²...",
  },
  {
    value: "volume",
    label: "Volumen",
    description: "m³, litro, galón...",
  },
  {
    value: "weight",
    label: "Peso",
    description: "kg, lb, tonelada...",
  },
  {
    value: "unit",
    label: "Cantidad",
    description: "Unidad, pieza, bloque...",
  },
  {
    value: "time",
    label: "Tiempo",
    description: "Hora, día, jornada...",
  },
  {
    value: "package",
    label: "Empaque",
    description: "Saco, caja, paquete...",
  },
  {
    value: "service",
    label: "Servicio",
    description: "Servicio o actividad...",
  },
];

export function getUnitTypeLabel(
  unitType: UnitType,
): string {
  return (
    UNIT_TYPES.find(
      (option) => option.value === unitType,
    )?.label ?? unitType
  );
}

export function UnitForm({
  value,
  disabled = false,
  typeLocked = false,
  onChange,
}: UnitFormProps) {
  const [selectorVisible, setSelectorVisible] =
    useState(false);

  function patch(
    field: keyof UnitFormValue,
    fieldValue: string,
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <View style={styles.form}>
      <Field
        label="Nombre"
        value={value.name}
        placeholder="Ej.: Metro cuadrado"
        disabled={disabled}
        onChangeText={(text) =>
          patch("name", text)
        }
      />

      <View style={styles.row}>
        <View style={styles.column}>
          <Field
            label="Código"
            value={value.code}
            placeholder="M2"
            disabled={disabled}
            autoCapitalize="characters"
            onChangeText={(text) =>
              patch("code", text)
            }
          />
        </View>

        <View style={styles.column}>
          <Field
            label="Símbolo"
            value={value.symbol}
            placeholder="m²"
            disabled={disabled}
            autoCapitalize="none"
            onChangeText={(text) =>
              patch("symbol", text)
            }
          />
        </View>
      </View>

      <Text style={styles.label}>
        Tipo de medida
      </Text>
      <Pressable
        disabled={disabled || typeLocked}
        onPress={() => setSelectorVisible(true)}
        style={[
          styles.selector,
          typeLocked && styles.locked,
        ]}
      >
        <View style={styles.selectorText}>
          <Text style={styles.selectorValue}>
            {getUnitTypeLabel(value.unitType)}
          </Text>
          <Text style={styles.selectorHint}>
            {typeLocked
              ? "El tipo está bloqueado porque la unidad está en uso."
              : "Agrupa conversiones compatibles."}
          </Text>
        </View>

        <Ionicons
          name={
            typeLocked
              ? "lock-closed-outline"
              : "chevron-down-outline"
          }
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      <Field
        label="Factor de conversión"
        value={value.conversionFactor}
        placeholder="1"
        disabled={disabled}
        keyboardType="decimal-pad"
        onChangeText={(text) =>
          patch("conversionFactor", text)
        }
      />

      <View style={styles.helpCard}>
        <Ionicons
          name="information-circle-outline"
          size={22}
          color={colors.info}
        />

        <Text style={styles.helpText}>
          El factor convierte esta unidad a la unidad base del mismo tipo. Ejemplo: metro = 1, centímetro = 0.01, pie = 0.3048.
        </Text>
      </View>

      <Modal
        visible={selectorVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setSelectorVisible(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Tipo de medida
              </Text>

              <Pressable
                onPress={() =>
                  setSelectorVisible(false)
                }
              >
                <Ionicons
                  name="close-outline"
                  size={25}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.options}
            >
              {UNIT_TYPES.map((option) => {
                const active =
                  value.unitType === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange({
                        ...value,
                        unitType: option.value,
                      });
                      setSelectorVisible(false);
                    }}
                    style={[
                      styles.option,
                      active && styles.optionActive,
                    ]}
                  >
                    <View style={styles.selectorText}>
                      <Text style={styles.selectorValue}>
                        {option.label}
                      </Text>
                      <Text style={styles.selectorHint}>
                        {option.description}
                      </Text>
                    </View>

                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  disabled = false,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
  disabled?: boolean;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        editable={!disabled}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          disabled && styles.locked,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },

  field: {
    gap: 7,
  },

  label: {
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
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  selector: {
    minHeight: 64,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  selectorText: {
    flex: 1,
  },

  selectorValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  selectorHint: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },

  locked: {
    opacity: 0.62,
  },

  helpCard: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  helpText: {
    flex: 1,
    color: "#1E40AF",
    fontSize: 11,
    lineHeight: 17,
  },

  overlay: {
    flex: 1,
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.60)",
    justifyContent: "flex-end",
  },

  modalCard: {
    maxHeight: "78%",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },

  modalHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  options: {
    padding: 12,
    gap: 8,
  },

  option: {
    minHeight: 64,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
});
