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
import {
  useMemo,
  useState,
} from "react";

import { colors, radius } from "@/constants/theme";
import {
  convertUnitValue,
} from "@/services/measurements-service";
import type {
  Unit,
} from "@/types/catalog";

type UnitConverterProps = {
  units: Unit[];
};

function parseNumber(value: string): number {
  const parsed = Number(
    value.trim().replace(",", "."),
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

export function UnitConverter({
  units,
}: UnitConverterProps) {
  const activeUnits = useMemo(
    () => units.filter((unit) => unit.active),
    [units],
  );

  const [quantity, setQuantity] =
    useState("1");
  const [fromId, setFromId] =
    useState(activeUnits[0]?.id ?? "");
  const [toId, setToId] =
    useState(activeUnits[0]?.id ?? "");
  const [selector, setSelector] =
    useState<"from" | "to" | null>(null);

  const fromUnit =
    activeUnits.find(
      (unit) => unit.id === fromId,
    ) ?? activeUnits[0] ?? null;

  const compatibleUnits = useMemo(
    () =>
      fromUnit
        ? activeUnits.filter(
            (unit) =>
              unit.unit_type ===
              fromUnit.unit_type,
          )
        : [],
    [activeUnits, fromUnit],
  );

  const toUnit =
    compatibleUnits.find(
      (unit) => unit.id === toId,
    ) ??
    compatibleUnits[0] ??
    null;

  const result = useMemo(() => {
    if (!fromUnit || !toUnit) {
      return {
        value: null,
        error:
          "No hay suficientes unidades compatibles.",
      };
    }

    return convertUnitValue({
      quantity: parseNumber(quantity),
      fromUnit,
      toUnit,
    });
  }, [fromUnit, quantity, toUnit]);

  function selectFrom(id: string) {
    const selected = activeUnits.find(
      (unit) => unit.id === id,
    );

    if (!selected) return;

    setFromId(id);

    const firstCompatible =
      activeUnits.find(
        (unit) =>
          unit.unit_type ===
          selected.unit_type,
      );

    setToId(firstCompatible?.id ?? id);
    setSelector(null);
  }

  if (activeUnits.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.iconBox}>
          <Ionicons
            name="swap-horizontal-outline"
            size={22}
            color={colors.primary}
          />
        </View>

        <View>
          <Text style={styles.title}>
            Conversión rápida
          </Text>
          <Text style={styles.subtitle}>
            Comprueba los factores configurados
          </Text>
        </View>
      </View>

      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
        placeholder="1"
        placeholderTextColor="#94A3B8"
        style={styles.input}
      />

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>Desde</Text>
          <Pressable
            onPress={() => setSelector("from")}
            style={styles.selector}
          >
            <Text
              style={styles.selectorText}
              numberOfLines={1}
            >
              {fromUnit
                ? `${fromUnit.name} (${fromUnit.symbol})`
                : "Seleccionar"}
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.column}>
          <Text style={styles.label}>Hacia</Text>
          <Pressable
            onPress={() => setSelector("to")}
            style={styles.selector}
          >
            <Text
              style={styles.selectorText}
              numberOfLines={1}
            >
              {toUnit
                ? `${toUnit.name} (${toUnit.symbol})`
                : "Seleccionar"}
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.result}>
        <Text style={styles.resultLabel}>
          Resultado
        </Text>
        <Text style={styles.resultValue}>
          {result.value !== null && toUnit
            ? `${result.value.toLocaleString(
                "es-PA",
                {
                  maximumFractionDigits: 6,
                },
              )} ${toUnit.symbol}`
            : "—"}
        </Text>
        {result.error ? (
          <Text style={styles.error}>
            {result.error}
          </Text>
        ) : null}
      </View>

      <UnitSelector
        visible={selector === "from"}
        title="Unidad de origen"
        units={activeUnits}
        selectedId={fromUnit?.id ?? ""}
        onSelect={selectFrom}
        onClose={() => setSelector(null)}
      />

      <UnitSelector
        visible={selector === "to"}
        title="Unidad de destino"
        units={compatibleUnits}
        selectedId={toUnit?.id ?? ""}
        onSelect={(id) => {
          setToId(id);
          setSelector(null);
        }}
        onClose={() => setSelector(null)}
      />
    </View>
  );
}

function UnitSelector({
  visible,
  title,
  units,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  units: Unit[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {title}
            </Text>

            <Pressable onPress={onClose}>
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
            {units.map((unit) => {
              const active =
                unit.id === selectedId;

              return (
                <Pressable
                  key={unit.id}
                  onPress={() =>
                    onSelect(unit.id)
                  }
                  style={[
                    styles.option,
                    active && styles.optionActive,
                  ]}
                >
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>
                      {unit.name}
                    </Text>
                    <Text style={styles.optionSubtitle}>
                      {unit.symbol} · factor{" "}
                      {unit.conversion_factor}
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
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  titleRow: {
    marginBottom: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  iconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },

  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 14,
  },

  row: {
    marginTop: 13,
    flexDirection: "row",
    gap: 9,
  },

  column: {
    flex: 1,
  },

  selector: {
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  selectorText: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },

  result: {
    marginTop: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },

  resultLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  resultValue: {
    marginTop: 5,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  error: {
    marginTop: 5,
    color: colors.danger,
    fontSize: 10,
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
    minHeight: 60,
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

  optionText: {
    flex: 1,
  },

  optionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },

  optionSubtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 10,
  },
});
