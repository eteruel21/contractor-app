import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    colors,
    radius,
} from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import type { Company } from "@/types/company";

export default function SelectCompanyScreen() {
  const {
    companies,
    activeCompany,
    loading,
    refreshing,
    refreshCompanies,
    setActiveCompanyId,
  } = useCompany();

  async function handleSelectCompany(
    company: Company,
  ) {
    try {
      await setActiveCompanyId(company.id);
      router.replace("/(tabs)" as Href);
    } catch (error) {
      Alert.alert(
        "No fue posible seleccionar la empresa",
        error instanceof Error
          ? error.message
          : "Inténtalo nuevamente.",
      );
    }
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
        data={companies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void refreshCompanies()
            }
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>
              Selecciona tu empresa
            </Text>

            <Text style={styles.subtitle}>
              Los clientes, proyectos y presupuestos se cargarán según la empresa activa.
            </Text>

            <Pressable
              onPress={() =>
                router.push(
                  "/empresa/crear" as Href,
                )
              }
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="add-circle-outline"
                size={21}
                color={colors.primary}
              />

              <Text style={styles.addButtonText}>
                Crear otra empresa
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const selected =
            item.id === activeCompany?.id;

          return (
            <Pressable
              onPress={() =>
                void handleSelectCompany(item)
              }
              style={({ pressed }) => [
                styles.companyCard,
                selected &&
                  styles.companyCardSelected,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.companyIcon}>
                <Ionicons
                  name="business-outline"
                  size={24}
                  color={colors.textLight}
                />
              </View>

              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {item.name}
                </Text>

                <Text style={styles.companyMeta}>
                  {item.email ||
                    item.phone ||
                    "Sin datos de contacto"}
                </Text>
              </View>

              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={colors.textSecondary}
                />
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="business-outline"
              size={42}
              color={colors.textSecondary}
            />

            <Text style={styles.emptyTitle}>
              No tienes empresas
            </Text>

            <Text style={styles.emptyText}>
              Crea tu primera empresa para empezar a trabajar.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: 40,
  },

  header: {
    marginBottom: 18,
  },

  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  addButton: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  companyCard: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  companyCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  companyMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  empty: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});