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
import { useMemo, useState } from "react";

import { colors, radius } from "@/constants/theme";
import type {
  CatalogCategory,
  CatalogItemType,
  Unit,
} from "@/types/catalog";
import { getCatalogItemTypeLabel } from "@/types/catalog";

export type CatalogItemFormValue = {
  itemType: CatalogItemType;
  categoryId: string | null;
  sku: string;
  name: string;
  description: string;
  unitId: string;
  unitCost: string;
  salePrice: string;
  wastePercentage: string;
};

type CatalogItemFormProps = {
  value: CatalogItemFormValue;
  units: Unit[];
  categories: CatalogCategory[];
  disabled?: boolean;
  onChange: (value: CatalogItemFormValue) => void;
};

const ITEM_TYPES: CatalogItemType[] = [
  "material",
  "labor",
  "equipment",
  "service",
  "subcontract",
];

export function CatalogItemForm({
  value,
  units,
  categories,
  disabled = false,
  onChange,
}: CatalogItemFormProps) {
  const [selector, setSelector] = useState<
    "unit" | "category" | null
  >(null);

  const selectedUnit = useMemo(
    () =>
      units.find((unit) => unit.id === value.unitId) ??
      null,
    [units, value.unitId],
  );

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === value.categoryId,
      ) ?? null,
    [categories, value.categoryId],
  );

  function patch(
    field: keyof CatalogItemFormValue,
    fieldValue: string | null,
  ) {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  }

  return (
    <View style={styles.form}>
      <Text style={styles.sectionTitle}>
        Tipo de elemento
      </Text>

      <View style={styles.typeGrid}>
        {ITEM_TYPES.map((itemType) => {
          const active = value.itemType === itemType;

          return (
            <Pressable
              key={itemType}
              disabled={disabled}
              onPress={() =>
                onChange({
                  ...value,
                  itemType,
                })
              }
              style={[
                styles.typeChip,
                active && styles.typeChipActive,
              ]}
            >
              <Text
                style={[
                  styles.typeChipText,
                  active && styles.typeChipTextActive,
                ]}
              >
                {getCatalogItemTypeLabel(itemType)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Field
        label="Nombre"
        value={value.name}
        placeholder="Ej.: Cemento gris 42.5 kg"
        disabled={disabled}
        onChangeText={(text) => patch("name", text)}
      />

      <Field
        label="SKU o código"
        value={value.sku}
        placeholder="Opcional"
        autoCapitalize="characters"
        disabled={disabled}
        onChangeText={(text) => patch("sku", text)}
      />

      <Field
        label="Descripción"
        value={value.description}
        placeholder="Descripción o notas del elemento"
        multiline
        disabled={disabled}
        onChangeText={(text) =>
          patch("description", text)
        }
      />

      <Text style={styles.label}>Categoría</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setSelector("category")}
        style={styles.selector}
      >
        <View style={styles.selectorText}>
          <Text style={styles.selectorValue}>
            {selectedCategory?.name ?? "Sin categoría"}
          </Text>
          <Text style={styles.selectorHint}>
            Clasificación administrativa
          </Text>
        </View>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      <Text style={styles.label}>Unidad</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setSelector("unit")}
        style={styles.selector}
      >
        <View style={styles.selectorText}>
          <Text style={styles.selectorValue}>
            {selectedUnit
              ? `${selectedUnit.name} (${selectedUnit.symbol})`
              : "Seleccionar unidad"}
          </Text>
          <Text style={styles.selectorHint}>
            Unidad utilizada en presupuestos y cálculos
          </Text>
        </View>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      <View style={styles.twoColumns}>
        <View style={styles.column}>
          <Field
            label="Costo unitario"
            value={value.unitCost}
            placeholder="0.00"
            keyboardType="decimal-pad"
            disabled={disabled}
            onChangeText={(text) =>
              patch("unitCost", text)
            }
          />
        </View>

        <View style={styles.column}>
          <Field
            label="Precio de venta"
            value={value.salePrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            disabled={disabled}
            onChangeText={(text) =>
              patch("salePrice", text)
            }
          />
        </View>
      </View>

      <Field
        label="Desperdicio (%)"
        value={value.wastePercentage}
        placeholder="0"
        keyboardType="decimal-pad"
        disabled={disabled}
        onChangeText={(text) =>
          patch("wastePercentage", text)
        }
      />

      <SelectionModal
        visible={selector === "unit"}
        title="Seleccionar unidad"
        options={units.map((unit) => ({
          id: unit.id,
          title: unit.name,
          subtitle: `${unit.symbol} · ${unit.code}`,
        }))}
        selectedId={value.unitId}
        onSelect={(id) => {
          patch("unitId", id);
          setSelector(null);
        }}
        onClose={() => setSelector(null)}
      />

      <SelectionModal
        visible={selector === "category"}
        title="Seleccionar categoría"
        options={[
          {
            id: "",
            title: "Sin categoría",
            subtitle: "No asignar clasificación",
          },
          ...categories
            .filter((category) => category.active)
            .map((category) => ({
              id: category.id,
              title: category.name,
              subtitle:
                category.description ??
                "Categoría del catálogo",
            })),
        ]}
        selectedId={value.categoryId ?? ""}
        onSelect={(id) => {
          patch("categoryId", id || null);
          setSelector(null);
        }}
        onClose={() => setSelector(null)}
      />
    </View>
  );
}

function Field({
  label,
  value,
  placeholder,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  disabled = false,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
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
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          disabled && styles.disabled,
        ]}
      />
    </View>
  );
}

function SelectionModal({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: {
    id: string;
    title: string;
    subtitle: string;
  }[];
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons
                name="close-outline"
                size={25}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalList}
          >
            {options.map((option) => {
              const selected = option.id === selectedId;

              return (
                <Pressable
                  key={option.id || "empty"}
                  onPress={() => onSelect(option.id)}
                  style={[
                    styles.modalOption,
                    selected && styles.modalOptionSelected,
                  ]}
                >
                  <View style={styles.selectorText}>
                    <Text style={styles.selectorValue}>
                      {option.title}
                    </Text>
                    <Text style={styles.selectorHint}>
                      {option.subtitle}
                    </Text>
                  </View>

                  {selected ? (
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
  form: {
    gap: 14,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  typeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  typeChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  typeChipTextActive: {
    color: colors.primaryDark,
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

  inputMultiline: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: "top",
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

  twoColumns: {
    flexDirection: "row",
    gap: 10,
  },

  column: {
    flex: 1,
  },

  disabled: {
    opacity: 0.65,
  },

  modalOverlay: {
    flex: 1,
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
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

  modalList: {
    padding: 12,
    gap: 8,
  },

  modalOption: {
    minHeight: 62,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
});
