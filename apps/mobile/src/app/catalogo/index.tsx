import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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
    createCatalogCategory,
    createCatalogItem,
    deactivateCatalogCategory,
    deactivateCatalogItem,
    listCatalogCategories,
    listCatalogItems,
    listCatalogUnits,
    updateCatalogItemPricing,
} from "@/services/catalog-service";
import { formatMoney } from "@/types/budget";
import type {
    CatalogCategory,
    CatalogItemType,
    CatalogItemWithDetails,
    Unit,
} from "@/types/catalog";
import { getCatalogItemTypeLabel } from "@/types/catalog";

const FILTERS: {
  label: string;
  value: CatalogItemType | "all";
}[] = [
  {
    label: "Todos",
    value: "all",
  },
  {
    label: "Materiales",
    value: "material",
  },
  {
    label: "Mano de obra",
    value: "labor",
  },
  {
    label: "Equipos",
    value: "equipment",
  },
  {
    label: "Servicios",
    value: "service",
  },
];

export default function CatalogScreen() {
  const { activeCompany } = useCompany();

  const [items, setItems] = useState<
    CatalogItemWithDetails[]
  >([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<
    CatalogCategory[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<CatalogItemType | "all">("all");
  const [editingItem, setEditingItem] =
    useState<CatalogItemWithDetails | null>(
      null,
    );
  const [createModalVisible, setCreateModalVisible] =
    useState(false);
  const [
    categoriesModalVisible,
    setCategoriesModalVisible,
  ] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        item.item_type === filter;

      if (!matchesFilter) return false;

      if (!query) return true;

      const name = item.name.toLowerCase();
      const sku = item.sku?.toLowerCase() ?? "";
      const category =
        item.category?.name.toLowerCase() ?? "";
      const type = getCatalogItemTypeLabel(
        item.item_type,
      ).toLowerCase();

      return (
        name.includes(query) ||
        sku.includes(query) ||
        category.includes(query) ||
        type.includes(query)
      );
    });
  }, [filter, items, search]);

  const loadCatalog = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        itemsResult,
        unitsResult,
        categoriesResult,
      ] = await Promise.all([
        listCatalogItems(activeCompany.id),
        listCatalogUnits(activeCompany.id),
        listCatalogCategories(activeCompany.id),
      ]);

      if (itemsResult.error) {
        Alert.alert(
          "No fue posible cargar el catálogo",
          itemsResult.error,
        );
      } else {
        setItems(itemsResult.items);
      }

      if (unitsResult.error) {
        Alert.alert(
          "No fue posible cargar las unidades",
          unitsResult.error,
        );
      } else {
        setUnits(unitsResult.units);
      }

      if (categoriesResult.error) {
        Alert.alert(
          "No fue posible cargar las categorías",
          categoriesResult.error,
        );
      } else {
        setCategories(categoriesResult.categories);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useFocusEffect(
    useCallback(() => {
      void loadCatalog();
    }, [loadCatalog]),
  );

  async function handleDeactivate(
    item: CatalogItemWithDetails,
  ) {
    if (!activeCompany) return;

    Alert.alert(
      "Desactivar ítem",
      `¿Deseas desactivar "${item.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            const { error } =
              await deactivateCatalogItem({
                companyId: activeCompany.id,
                itemId: item.id,
              });

            if (error) {
              Alert.alert(
                "No fue posible desactivar el ítem",
                error,
              );
              return;
            }

            await loadCatalog(true);
          },
        },
      ],
    );
  }

  if (!activeCompany) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          No hay empresa activa
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadCatalog(true)
            }
          />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Catálogo
                </Text>

                <Text style={styles.subtitle}>
                  {activeCompany.name}
                </Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  onPress={() =>
                    setCategoriesModalVisible(true)
                  }
                  style={({ pressed }) => [
                    styles.categoriesButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="folder-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.categoriesButtonText}>
                    Categorías
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setCreateModalVisible(true)}
                  style={({ pressed }) => [
                    styles.newButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="add-outline"
                    size={20}
                    color={colors.textLight}
                  />
                  <Text style={styles.newButtonText}>Nuevo</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.searchBox}>
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
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {FILTERS.map((option) => {
                const active =
                  filter === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() =>
                      setFilter(option.value)
                    }
                    style={({ pressed }) => [
                      styles.filterChip,
                      active &&
                        styles.filterChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.counter}>
              {filteredItems.length} ítem
              {filteredItems.length === 1
                ? ""
                : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="cube-outline"
              size={46}
              color={colors.textSecondary}
            />

            <Text style={styles.emptyTitle}>
              No hay ítems
            </Text>

            <Text style={styles.emptyText}>
              No se encontraron materiales, mano de obra o servicios en el catálogo.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <CatalogCard
            item={item}
            onEdit={() => setEditingItem(item)}
            onDeactivate={() =>
              void handleDeactivate(item)
            }
          />
        )}
      />

      <ManageCategoriesModal
        visible={categoriesModalVisible}
        companyId={activeCompany.id}
        categories={categories}
        onClose={() => setCategoriesModalVisible(false)}
        onChanged={() => void loadCatalog(true)}
      />

      <CreateCatalogItemModal
        visible={createModalVisible}
        companyId={activeCompany.id}
        units={units}
        categories={categories}
        onClose={() => setCreateModalVisible(false)}
        onCreated={() => void loadCatalog(true)}
      />

      <EditCatalogItemModal
        visible={Boolean(editingItem)}
        item={editingItem}
        companyId={activeCompany.id}
        onClose={() => setEditingItem(null)}
        onSaved={() => void loadCatalog(true)}
      />
    </SafeAreaView>
  );
}

function CatalogCard({
  item,
  onEdit,
  onDeactivate,
}: {
  item: CatalogItemWithDetails;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  const price =
    item.sale_price > 0
      ? item.sale_price
      : item.unit_cost;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.itemIcon}>
          <Ionicons
            name={
              item.item_type === "labor"
                ? "hammer-outline"
                : item.item_type === "equipment"
                  ? "construct-outline"
                  : item.item_type === "service"
                    ? "briefcase-outline"
                    : "cube-outline"
            }
            size={23}
            color={colors.textLight}
          />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>
            {item.name}
          </Text>

          <Text style={styles.itemMeta}>
            {getCatalogItemTypeLabel(
              item.item_type,
            )}
            {item.category?.name
              ? ` · ${item.category.name}`
              : ""}
          </Text>

          <Text style={styles.itemMeta}>
            Unidad:{" "}
            {item.unit?.symbol ||
              item.unit?.name ||
              "unidad"}
          </Text>
        </View>

        <Pressable
          onPress={onDeactivate}
          hitSlop={10}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#EF4444"
          />
        </Pressable>
      </View>

      <View style={styles.priceGrid}>
        <PriceBox
          label="Costo"
          value={formatMoney(item.unit_cost)}
        />

        <PriceBox
          label="Venta"
          value={formatMoney(price)}
          strong
        />

        <PriceBox
          label="Desperdicio"
          value={`${item.waste_percentage}%`}
        />
      </View>

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
          Editar precios
        </Text>
      </Pressable>
    </View>
  );
}

function PriceBox({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.priceBox}>
      <Text style={styles.priceLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.priceValue,
          strong && styles.priceValueStrong,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ManageCategoriesModal({
  visible,
  companyId,
  categories,
  onClose,
  onChanged,
}: {
  visible: boolean;
  companyId: string;
  categories: CatalogCategory[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName("");
    setDescription("");
  }, [visible]);

  async function handleCreate() {
    try {
      setSaving(true);

      const { error } = await createCatalogCategory({
        companyId,
        name,
        description,
      });

      if (error) {
        Alert.alert(
          "No fue posible crear la categoría",
          error,
        );
        return;
      }

      setName("");
      setDescription("");
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  function confirmDeactivate(category: CatalogCategory) {
    Alert.alert(
      "Desactivar categoría",
      `¿Deseas desactivar “${category.name}”?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: () => void handleDeactivate(category),
        },
      ],
    );
  }

  async function handleDeactivate(
    category: CatalogCategory,
  ) {
    try {
      setDeactivatingId(category.id);

      const { error } = await deactivateCatalogCategory({
        companyId,
        categoryId: category.id,
      });

      if (error) {
        Alert.alert(
          "No fue posible desactivar la categoría",
          error,
        );
        return;
      }

      onChanged();
    } finally {
      setDeactivatingId(null);
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
            <Text style={styles.cancelText}>Cerrar</Text>
          </Pressable>

          <Text style={styles.modalTitle}>Categorías</Text>

          <View style={styles.modalHeaderSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.modalContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.categoryCreateCard}>
            <Text style={styles.categoryCreateTitle}>
              Nueva categoría
            </Text>

            <FormField
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Ej. Materiales de concreto"
              keyboardType="default"
            />

            <FormField
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Opcional"
              keyboardType="default"
            />

            <Pressable
              onPress={() => void handleCreate()}
              disabled={saving}
              style={({ pressed }) => [
                styles.fullSaveButton,
                saving && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.fullSaveText}>
                  Crear categoría
                </Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.categoryListTitle}>
            Categorías activas
          </Text>

          {categories.length === 0 ? (
            <View style={styles.emptyCategoryBox}>
              <Text style={styles.emptyText}>
                Todavía no hay categorías.
              </Text>
            </View>
          ) : (
            categories.map((category) => (
              <View
                key={category.id}
                style={styles.categoryRow}
              >
                <View style={styles.categoryRowInfo}>
                  <Text style={styles.categoryRowName}>
                    {category.name}
                  </Text>
                  {category.description ? (
                    <Text style={styles.categoryRowDescription}>
                      {category.description}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  onPress={() => confirmDeactivate(category)}
                  disabled={deactivatingId === category.id}
                  hitSlop={10}
                >
                  {deactivatingId === category.id ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.danger}
                    />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.danger}
                    />
                  )}
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function CreateCatalogItemModal({
  visible,
  companyId,
  units,
  categories,
  onClose,
  onCreated,
}: {
  visible: boolean;
  companyId: string;
  units: Unit[];
  categories: CatalogCategory[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [itemType, setItemType] =
    useState<CatalogItemType>("material");
  const [categoryId, setCategoryId] =
    useState<string | null>(null);
  const [unitId, setUnitId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [wastePercentage, setWastePercentage] =
    useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setItemType("material");
    setCategoryId(null);
    setUnitId(units[0]?.id ?? "");
    setName("");
    setSku("");
    setDescription("");
    setUnitCost("");
    setSalePrice("");
    setWastePercentage("");
  }, [units, visible]);

  async function handleSave() {
    const { error } = await createCatalogItem({
      companyId,
      itemType,
      categoryId,
      sku,
      name,
      description,
      unitId,
      unitCost: parseMoney(unitCost),
      salePrice: parseMoney(salePrice),
      wastePercentage: parseMoney(wastePercentage),
    });

    if (error) {
      Alert.alert(
        "No fue posible crear el ítem",
        error,
      );
      return;
    }

    onClose();
    onCreated();
  }

  const createTypes = FILTERS.filter(
    (
      option,
    ): option is {
      label: string;
      value: CatalogItemType;
    } => option.value !== "all",
  );

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
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>

            <Text style={styles.modalTitle}>Nuevo ítem</Text>

            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
            >
              <Text style={styles.saveText}>Guardar</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.selectionLabel}>Tipo</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectionRow}
            >
              {createTypes.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => setItemType(option.value)}
                  style={[
                    styles.filterChip,
                    itemType === option.value &&
                      styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      itemType === option.value &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <FormField
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Ej. Cemento de uso general"
              keyboardType="default"
            />
            <FormField
              label="SKU o código"
              value={sku}
              onChangeText={setSku}
              placeholder="Opcional"
              keyboardType="default"
            />
            <FormField
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Opcional"
              keyboardType="default"
            />

            <Text style={styles.selectionLabel}>Unidad</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectionRow}
            >
              {units.map((unit) => (
                <Pressable
                  key={unit.id}
                  onPress={() => setUnitId(unit.id)}
                  style={[
                    styles.filterChip,
                    unitId === unit.id &&
                      styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      unitId === unit.id &&
                        styles.filterChipTextActive,
                    ]}
                  >
                    {unit.symbol} · {unit.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {categories.length > 0 ? (
              <>
                <Text style={styles.selectionLabel}>
                  Categoría opcional
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectionRow}
                >
                  <Pressable
                    onPress={() => setCategoryId(null)}
                    style={[
                      styles.filterChip,
                      categoryId === null &&
                        styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        categoryId === null &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      Sin categoría
                    </Text>
                  </Pressable>

                  {categories.map((category) => (
                    <Pressable
                      key={category.id}
                      onPress={() => setCategoryId(category.id)}
                      style={[
                        styles.filterChip,
                        categoryId === category.id &&
                          styles.filterChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          categoryId === category.id &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            ) : null}

            <FormField
              label="Costo unitario"
              value={unitCost}
              onChangeText={setUnitCost}
              placeholder="0.00"
            />
            <FormField
              label="Precio de venta"
              value={salePrice}
              onChangeText={setSalePrice}
              placeholder="0.00"
            />
            <FormField
              label="Desperdicio %"
              value={wastePercentage}
              onChangeText={setWastePercentage}
              placeholder="0"
            />

            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
              style={({ pressed }) => [
                styles.fullSaveButton,
                saving && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.fullSaveText}>
                  Crear ítem
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function EditCatalogItemModal({
  visible,
  item,
  companyId,
  onClose,
  onSaved,
}: {
  visible: boolean;
  item: CatalogItemWithDetails | null;
  companyId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [unitCost, setUnitCost] = useState("");
  const [salePrice, setSalePrice] =
    useState("");
  const [wastePercentage, setWastePercentage] =
    useState("");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!item) return;

      setUnitCost(String(item.unit_cost));
      setSalePrice(String(item.sale_price));
      setWastePercentage(
        String(item.waste_percentage),
      );
    }, [item]),
  );

  async function handleSave() {
    if (!item) return;

    const cleanUnitCost = parseMoney(unitCost);
    const cleanSalePrice = parseMoney(salePrice);
    const cleanWaste = parseMoney(wastePercentage);

    try {
      setSaving(true);

      const { error } =
        await updateCatalogItemPricing({
          companyId,
          itemId: item.id,
          unitCost: cleanUnitCost,
          salePrice: cleanSalePrice,
          wastePercentage: cleanWaste,
        });

      if (error) {
        Alert.alert(
          "No fue posible actualizar el ítem",
          error,
        );
        return;
      }

      onClose();
      onSaved();
    } finally {
      setSaving(false);
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
              Editar ítem
            </Text>

            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
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
            <View style={styles.modalItemHeader}>
              <View style={styles.itemIcon}>
                <Ionicons
                  name="cube-outline"
                  size={23}
                  color={colors.textLight}
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item?.name}
                </Text>

                <Text style={styles.itemMeta}>
                  {item
                    ? getCatalogItemTypeLabel(
                        item.item_type,
                      )
                    : ""}
                </Text>
              </View>
            </View>

            <FormField
              label="Costo unitario"
              value={unitCost}
              onChangeText={setUnitCost}
              placeholder="0.00"
            />

            <FormField
              label="Precio de venta"
              value={salePrice}
              onChangeText={setSalePrice}
              placeholder="0.00"
            />

            <FormField
              label="Desperdicio %"
              value={wastePercentage}
              onChangeText={setWastePercentage}
              placeholder="0"
            />

            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
              style={({ pressed }) => [
                styles.fullSaveButton,
                saving && styles.disabledButton,
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  color={colors.textLight}
                />
              ) : (
                <Text style={styles.fullSaveText}>
                  Guardar cambios
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
  keyboardType = "decimal-pad",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "decimal-pad";
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
        style={styles.input}
      />
    </View>
  );
}

function parseMoney(value: string): number {
  const parsed = Number(
    value.replace(",", ".").trim(),
  );

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : 0;
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

  header: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  categoriesButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  categoriesButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  newButton: {
    minHeight: 44,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  newButtonText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "900",
  },

  searchBox: {
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

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  filters: {
    paddingVertical: 14,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },

  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },

  filterChipTextActive: {
    color: colors.primary,
  },

  counter: {
    marginBottom: 12,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  empty: {
    marginTop: 90,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptyText: {
    maxWidth: 300,
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  card: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  itemMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  priceGrid: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    gap: 8,
  },

  priceBox: {
    flex: 1,
  },

  priceLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },

  priceValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },

  priceValueStrong: {
    color: colors.primary,
    fontSize: 13,
  },

  editButton: {
    minHeight: 42,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
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

  modalHeaderSpacer: {
    width: 50,
  },

  categoryCreateCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  categoryCreateTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  categoryListTitle: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  emptyCategoryBox: {
    padding: 18,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  categoryRow: {
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

  categoryRowInfo: {
    flex: 1,
  },

  categoryRowName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  categoryRowDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  modalItemHeader: {
    marginBottom: 18,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: 12,
  },

  selectionLabel: {
    marginBottom: 8,
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
  },

  selectionRow: {
    paddingBottom: 16,
    gap: 8,
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
});