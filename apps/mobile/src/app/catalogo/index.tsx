import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, shadows } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import {
  listCatalogItems,
  resetCatalogItemPricing,
  updateCatalogItemPricing,
} from "@/services/catalog-service";
import { formatMoney } from "@/types/budget";
import type {
  CatalogItemType,
  CatalogItemWithDetails,
} from "@/types/catalog";
import { getCatalogItemTypeLabel } from "@/types/catalog";

type Filter = CatalogItemType | "all";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "Todos", value: "all" },
  { label: "Materiales", value: "material" },
  { label: "Mano de obra", value: "labor" },
  { label: "Equipos", value: "equipment" },
  { label: "Servicios", value: "service" },
];

export default function CatalogScreen() {
  const { activeCompany } = useCompany();
  const [items, setItems] = useState<CatalogItemWithDetails[]>([]);
  const [editingItem, setEditingItem] =
    useState<CatalogItemWithDetails | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCatalog = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await listCatalogItems(
        activeCompany?.id ?? "platform",
      );

      if (result.error) {
        Alert.alert(
          "No fue posible cargar los precios",
          result.error,
        );
      } else {
        setItems(result.items);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany?.id],
  );

  useFocusEffect(
    useCallback(() => {
      void loadCatalog();
    }, [loadCatalog]),
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      if (filter !== "all" && item.item_type !== filter) {
        return false;
      }

      if (!query) return true;

      return [
        item.name,
        item.sku ?? "",
        item.category?.name ?? "",
        getCatalogItemTypeLabel(item.item_type),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [filter, items, search]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>Cargando precios globales...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadCatalog(true)}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="pricetags-outline"
                  size={24}
                  color={colors.textLight}
                />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>Precios del catálogo</Text>
                <Text style={styles.subtitle}>
                  Valores globales con ajustes privados para tu cuenta.
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={colors.info}
              />
              <Text style={styles.infoText}>
                El administrador actualiza el precio predeterminado. Si lo
                personalizas, el cambio solo será visible para ti y podrás
                restaurarlo cuando quieras.
              </Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.textSecondary}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar material, mano de obra o código"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((option) => {
                const selected = filter === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setFilter(option.value)}
                    style={({ pressed }) => [
                      styles.filter,
                      selected && styles.filterSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.filterTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.counter}>
              {filteredItems.length} concepto
              {filteredItems.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="cube-outline"
              size={44}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No hay resultados</Text>
            <Text style={styles.emptyText}>
              Prueba con otro nombre o filtro.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CatalogPriceCard
            item={item}
            onEdit={() => setEditingItem(item)}
          />
        )}
      />

      <EditPersonalPriceModal
        item={editingItem}
        companyId={activeCompany?.id ?? "platform"}
        onClose={() => setEditingItem(null)}
        onChanged={async () => {
          setEditingItem(null);
          await loadCatalog(true);
        }}
      />
    </SafeAreaView>
  );
}

function CatalogPriceCard({
  item,
  onEdit,
}: {
  item: CatalogItemWithDetails;
  onEdit: () => void;
}) {
  const salePrice = item.sale_price || item.unit_cost;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.itemIcon,
            item.item_type === "labor" && styles.laborIcon,
          ]}
        >
          <Ionicons
            name={item.item_type === "labor" ? "hammer-outline" : "cube-outline"}
            size={21}
            color={item.item_type === "labor" ? colors.warning : colors.primary}
          />
        </View>
        <View style={styles.itemCopy}>
          <View style={styles.nameRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.has_override && (
              <View style={styles.personalBadge}>
                <Text style={styles.personalBadgeText}>Personalizado</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemMeta}>
            {getCatalogItemTypeLabel(item.item_type)}
            {item.category?.name ? ` · ${item.category.name}` : ""}
            {` · ${item.unit?.symbol ?? "und."}`}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <PriceValue label="Costo" value={formatMoney(item.unit_cost)} />
        <PriceValue label="Venta" value={formatMoney(salePrice)} strong />
        <PriceValue label="Desperdicio" value={`${item.waste_percentage}%`} />
      </View>

      {item.has_override && (
        <View style={styles.defaultRow}>
          <Ionicons
            name="globe-outline"
            size={16}
            color={colors.textSecondary}
          />
          <Text style={styles.defaultText}>
            Predeterminado: costo {formatMoney(item.default_unit_cost ?? 0)} ·
            venta {formatMoney(item.default_sale_price ?? 0)} · desperdicio{" "}
            {item.default_waste_percentage ?? 0}%
          </Text>
        </View>
      )}

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="create-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.editButtonText}>
          {item.has_override ? "Editar mi precio" : "Personalizar para mí"}
        </Text>
      </Pressable>
    </View>
  );
}

function PriceValue({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.priceValue}>
      <Text style={styles.priceLabel}>{label}</Text>
      <Text style={[styles.priceText, strong && styles.priceTextStrong]}>
        {value}
      </Text>
    </View>
  );
}

function EditPersonalPriceModal({
  item,
  companyId,
  onClose,
  onChanged,
}: {
  item: CatalogItemWithDetails | null;
  companyId: string;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [unitCost, setUnitCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [wastePercentage, setWastePercentage] = useState("");
  const [saving, setSaving] = useState(false);

  const syncValues = useCallback(() => {
    if (!item) return;
    setUnitCost(String(item.unit_cost));
    setSalePrice(String(item.sale_price));
    setWastePercentage(String(item.waste_percentage));
  }, [item]);

  useFocusEffect(
    useCallback(() => {
      syncValues();
    }, [syncValues]),
  );

  function numberValue(value: string) {
    const result = Number(value.replace(",", ".").trim());
    return Number.isFinite(result) ? result : -1;
  }

  async function save() {
    if (!item) return;

    const nextUnitCost = numberValue(unitCost);
    const nextSalePrice = numberValue(salePrice);
    const nextWaste = numberValue(wastePercentage);

    if (
      nextUnitCost < 0 ||
      nextSalePrice < 0 ||
      nextWaste < 0 ||
      nextWaste > 100
    ) {
      Alert.alert("Revisa los valores", "Los precios deben ser positivos y el desperdicio debe estar entre 0% y 100%.");
      return;
    }

    setSaving(true);
    const result = await updateCatalogItemPricing({
      companyId,
      itemId: item.id,
      unitCost: nextUnitCost,
      salePrice: nextSalePrice,
      wastePercentage: nextWaste,
    });
    setSaving(false);

    if (result.error) {
      Alert.alert("No fue posible guardar tu precio", result.error);
      return;
    }

    await onChanged();
  }

  function confirmReset() {
    if (!item) return;

    Alert.alert(
      "Restaurar precio predeterminado",
      `Se eliminará tu ajuste de “${item.name}” y volverás a recibir el precio global.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: () => void reset(),
        },
      ],
    );
  }

  async function reset() {
    if (!item) return;

    setSaving(true);
    const result = await resetCatalogItemPricing({ itemId: item.id });
    setSaving(false);

    if (result.error) {
      Alert.alert("No fue posible restaurar el precio", result.error);
      return;
    }

    await onChanged();
  }

  return (
    <Modal
      visible={Boolean(item)}
      animationType="slide"
      presentationStyle="pageSheet"
      onShow={syncValues}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <KeyboardAvoidingView
          style={styles.modalKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
            <Text style={styles.modalTitle}>Mi precio</Text>
            <View style={styles.modalSpacer} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalItemName}>{item?.name}</Text>
            <Text style={styles.modalItemMeta}>
              {item?.unit?.name ?? "Unidad"} ({item?.unit?.symbol ?? "und."})
            </Text>

            <View style={styles.globalPriceCard}>
              <View style={styles.globalPriceTitle}>
                <Ionicons
                  name="globe-outline"
                  size={19}
                  color={colors.info}
                />
                <Text style={styles.globalPriceTitleText}>
                  Precio predeterminado
                </Text>
              </View>
              <Text style={styles.globalPriceText}>
                Costo {formatMoney(item?.default_unit_cost ?? 0)} · Venta{" "}
                {formatMoney(item?.default_sale_price ?? 0)} · Desperdicio{" "}
                {item?.default_waste_percentage ?? 0}%
              </Text>
            </View>

            <MoneyInput
              label="Mi costo unitario"
              value={unitCost}
              onChangeText={setUnitCost}
            />
            <MoneyInput
              label="Mi precio de venta"
              value={salePrice}
              onChangeText={setSalePrice}
            />
            <MoneyInput
              label="Mi desperdicio"
              value={wastePercentage}
              onChangeText={setWastePercentage}
              suffix="%"
            />

            <Text style={styles.privateNote}>
              Este cambio se guardará en tu cuenta y será usado por tus
              calculadoras. No modifica el catálogo global ni los precios de
              otros usuarios.
            </Text>

            <Pressable
              onPress={() => void save()}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
                saving && styles.disabled,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={19}
                    color={colors.textLight}
                  />
                  <Text style={styles.saveButtonText}>Guardar para mí</Text>
                </>
              )}
            </Pressable>

            {item?.has_override && (
              <Pressable
                onPress={confirmReset}
                disabled={saving}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.resetButtonText}>
                  Volver al precio predeterminado
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function MoneyInput({
  label,
  value,
  onChangeText,
  suffix = "B/.",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <Text style={styles.inputSuffix}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  loaderText: { color: colors.textSecondary, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 16 },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.textSecondary, marginTop: 3, lineHeight: 19 },
  infoCard: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    marginBottom: 16,
  },
  infoText: { flex: 1, color: colors.text, lineHeight: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, minHeight: 48, color: colors.text },
  filters: { gap: 8, paddingVertical: 14 },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: colors.surface,
  },
  filterSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  filterText: { color: colors.textSecondary, fontWeight: "700" },
  filterTextSelected: { color: colors.primaryDark },
  counter: { color: colors.textSecondary, fontWeight: "700", marginBottom: 10 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    ...shadows.soft,
  },
  cardHeader: { flexDirection: "row", gap: 12, alignItems: "center" },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  laborIcon: { backgroundColor: colors.warningSoft },
  itemCopy: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7 },
  itemName: { color: colors.text, fontSize: 16, fontWeight: "900", flexShrink: 1 },
  itemMeta: { color: colors.textSecondary, marginTop: 4 },
  personalBadge: {
    borderRadius: radius.full,
    backgroundColor: colors.violetSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  personalBadgeText: { color: colors.violet, fontSize: 11, fontWeight: "900" },
  priceRow: { flexDirection: "row", gap: 8, marginTop: 15 },
  priceValue: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 10,
  },
  priceLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: "700" },
  priceText: { color: colors.text, fontSize: 14, fontWeight: "800", marginTop: 3 },
  priceTextStrong: { color: colors.primaryDark },
  defaultRow: {
    flexDirection: "row",
    gap: 7,
    alignItems: "flex-start",
    marginTop: 12,
    paddingHorizontal: 2,
  },
  defaultText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  editButton: {
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primaryWash,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 14,
  },
  editButtonText: { color: colors.primary, fontWeight: "900" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptyText: { color: colors.textSecondary, marginTop: 4 },
  modalSafeArea: { flex: 1, backgroundColor: colors.background },
  modalKeyboard: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelText: { color: colors.primary, fontWeight: "800" },
  modalTitle: { color: colors.text, fontSize: 17, fontWeight: "900" },
  modalSpacer: { width: 62 },
  modalContent: { padding: 20, paddingBottom: 48 },
  modalItemName: { color: colors.text, fontSize: 23, fontWeight: "900" },
  modalItemMeta: { color: colors.textSecondary, marginTop: 4, marginBottom: 18 },
  globalPriceCard: {
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    padding: 14,
    marginBottom: 18,
  },
  globalPriceTitle: { flexDirection: "row", alignItems: "center", gap: 7 },
  globalPriceTitleText: { color: colors.text, fontWeight: "900" },
  globalPriceText: { color: colors.textSecondary, lineHeight: 19, marginTop: 7 },
  field: { marginBottom: 14 },
  fieldLabel: { color: colors.text, fontWeight: "800", marginBottom: 7 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  input: { flex: 1, minHeight: 50, color: colors.text, fontSize: 17, fontWeight: "800" },
  inputSuffix: { color: colors.textSecondary, fontWeight: "800" },
  privateNote: {
    color: colors.textSecondary,
    lineHeight: 20,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 14,
    marginTop: 4,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  saveButtonText: { color: colors.textLight, fontWeight: "900", fontSize: 16 },
  resetButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  resetButtonText: { color: colors.primary, fontWeight: "900" },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.55 },
});
