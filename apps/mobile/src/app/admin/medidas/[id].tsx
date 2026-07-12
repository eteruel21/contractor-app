import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  UnitForm,
  type UnitFormValue,
} from "@/components/admin/UnitForm";
import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import {
  createAdminUnit,
  getAdminUnit,
  setAdminUnitActive,
  updateAdminUnit,
  type UnitWithUsage,
} from "@/services/measurements-service";

function parseNumber(value: string): number {
  const parsed = Number(
    value.trim().replace(",", "."),
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function unitToForm(
  unit: UnitWithUsage,
): UnitFormValue {
  return {
    code: unit.code,
    name: unit.name,
    symbol: unit.symbol,
    unitType: unit.unit_type,
    conversionFactor: String(
      unit.conversion_factor,
    ),
  };
}

const INITIAL_FORM: UnitFormValue = {
  code: "",
  name: "",
  symbol: "",
  unitType: "unit",
  conversionFactor: "1",
};

export default function AdminMeasurementDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const routeId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const isNew = routeId === "nueva";
  const { activeCompany } = useCompany();

  const [unit, setUnit] =
    useState<UnitWithUsage | null>(null);
  const [form, setForm] =
    useState<UnitFormValue>(INITIAL_FORM);
  const [loading, setLoading] =
    useState(!isNew);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (isNew) {
      setUnit(null);
      setForm(INITIAL_FORM);
      setLoading(false);
      return;
    }

    if (!activeCompany || !routeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = await getAdminUnit({
      companyId: activeCompany.id,
      unitId: routeId,
    });

    if (result.error) {
      Alert.alert(
        "No fue posible cargar la unidad",
        result.error,
      );
    }

    setUnit(result.unit);

    if (result.unit) {
      setForm(unitToForm(result.unit));
    }

    setLoading(false);
  }, [activeCompany, isNew, routeId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function save() {
    if (!activeCompany || saving) return;

    setSaving(true);

    const commonInput = {
      companyId: activeCompany.id,
      code: form.code,
      name: form.name,
      symbol: form.symbol,
      unitType: form.unitType,
      conversionFactor: parseNumber(
        form.conversionFactor,
      ),
    };

    const result = isNew
      ? await createAdminUnit(commonInput)
      : await updateAdminUnit({
          ...commonInput,
          unitId: routeId ?? "",
        });

    setSaving(false);

    if (result.error || !result.unit) {
      Alert.alert(
        "No fue posible guardar la unidad",
        result.error ??
          "Supabase no devolvió la unidad guardada.",
      );
      return;
    }

    if (isNew) {
      Alert.alert(
        "Unidad creada",
        `"${result.unit.name}" fue agregada correctamente.`,
        [
          {
            text: "Continuar",
            onPress: () => router.back(),
          },
        ],
      );
      return;
    }

    Alert.alert(
      "Cambios guardados",
      "La unidad fue actualizada correctamente.",
    );

    await load();
  }

  function confirmToggleActive() {
    if (
      !activeCompany ||
      !unit ||
      saving
    ) {
      return;
    }

    const nextActive = !unit.active;

    Alert.alert(
      nextActive
        ? "Restaurar unidad"
        : "Desactivar unidad",
      nextActive
        ? `¿Deseas restaurar "${unit.name}"?`
        : `¿Deseas desactivar "${unit.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: nextActive
            ? "Restaurar"
            : "Desactivar",
          style: nextActive
            ? "default"
            : "destructive",
          onPress: async () => {
            setSaving(true);

            const result =
              await setAdminUnitActive({
                companyId: activeCompany.id,
                unitId: unit.id,
                active: nextActive,
              });

            setSaving(false);

            if (result.error) {
              Alert.alert(
                "No fue posible actualizar la unidad",
                result.error,
              );
              return;
            }

            await load();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!isNew && !unit) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>
          La unidad no existe o no está disponible.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.backTextButton}
        >
          <Text style={styles.backText}>
            Volver
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back-outline"
              size={22}
              color={colors.textLight}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isNew
                ? "Nueva unidad"
                : "Editar unidad"}
            </Text>
            <Text style={styles.subtitle}>
              {isNew
                ? "Medidas para catálogo y cálculos"
                : unit?.name}
            </Text>
          </View>

          {!isNew && unit ? (
            <View
              style={[
                styles.statusBadge,
                unit.active
                  ? styles.activeBadge
                  : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  unit.active
                    ? styles.activeText
                    : styles.inactiveText,
                ]}
              >
                {unit.active
                  ? "ACTIVA"
                  : "INACTIVA"}
              </Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {!isNew && unit ? (
            <View style={styles.usageCard}>
              <View style={styles.usageIcon}>
                <Ionicons
                  name="link-outline"
                  size={22}
                  color={colors.info}
                />
              </View>

              <View style={styles.usageInfo}>
                <Text style={styles.usageTitle}>
                  Uso actual
                </Text>
                <Text style={styles.usageText}>
                  {unit.usage.catalogItems} elemento(s) del catálogo y{" "}
                  {unit.usage.catalogYields} rendimiento(s).
                </Text>
              </View>
            </View>
          ) : null}

          <UnitForm
            value={form}
            disabled={saving}
            typeLocked={
              !isNew &&
              Boolean(unit?.usage.total)
            }
            onChange={setForm}
          />

          <Pressable
            disabled={saving}
            onPress={() => void save()}
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
                  {isNew
                    ? "Crear unidad"
                    : "Guardar cambios"}
                </Text>
              </>
            )}
          </Pressable>

          {!isNew && unit ? (
            <Pressable
              disabled={saving}
              onPress={confirmToggleActive}
              style={[
                styles.statusButton,
                unit.active
                  ? styles.deactivateButton
                  : styles.restoreButton,
              ]}
            >
              <Ionicons
                name={
                  unit.active
                    ? "archive-outline"
                    : "refresh-outline"
                }
                size={20}
                color={
                  unit.active
                    ? colors.danger
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.statusButtonText,
                  unit.active
                    ? styles.deactivateText
                    : styles.restoreText,
                ]}
              >
                {unit.active
                  ? "Desactivar unidad"
                  : "Restaurar unidad"}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },

  center: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginHorizontal: 14,
  },

  title: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 11,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
  },

  activeBadge: {
    backgroundColor: colors.primarySoft,
  },

  inactiveBadge: {
    backgroundColor: "#334155",
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  activeText: {
    color: colors.primaryDark,
  },

  inactiveText: {
    color: "#CBD5E1",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },

  usageCard: {
    marginBottom: 20,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "center",
  },

  usageIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  usageInfo: {
    flex: 1,
    marginLeft: 11,
  },

  usageTitle: {
    color: "#1E40AF",
    fontSize: 12,
    fontWeight: "900",
  },

  usageText: {
    marginTop: 3,
    color: "#1D4ED8",
    fontSize: 10,
    lineHeight: 15,
  },

  saveButton: {
    minHeight: 54,
    marginTop: 24,
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

  statusButton: {
    minHeight: 52,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deactivateButton: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  restoreButton: {
    borderColor: "#BBF7D0",
    backgroundColor: colors.primarySoft,
  },

  statusButtonText: {
    fontSize: 13,
    fontWeight: "900",
  },

  deactivateText: {
    color: colors.danger,
  },

  restoreText: {
    color: colors.primaryDark,
  },

  disabled: {
    opacity: 0.62,
  },

  notFound: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  backTextButton: {
    marginTop: 15,
  },

  backText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});
