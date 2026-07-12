import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModuleCard } from "@/components/ModuleCard";
import { colors, radius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

const activeModules = [
  {
    id: "catalog",
    title: "Catálogo",
    description:
      "Productos, servicios, categorías, precios y rendimientos.",
    icon: "cube-outline" as const,
    route: "/catalogo" as Href,
  },
  {
    id: "prices",
    title: "Precios",
    description:
      "Edita costos, precios de venta y desperdicios desde el catálogo.",
    icon: "pricetags-outline" as const,
    route: "/catalogo" as Href,
  },
  {
    id: "clients",
    title: "Clientes",
    description:
      "Consulta clientes, direcciones y actividad registrada.",
    icon: "people-outline" as const,
    route: "/(tabs)/clientes" as Href,
  },
  {
    id: "measurements",
    title: "Medidas",
    description:
      "Unidades, símbolos, factores y conversiones.",
    icon: "resize-outline" as const,
    route: "/admin/medidas" as Href,
  },
];

const pendingModules = [
  "Fórmulas",
  "Usuarios",
  "Configuración",
];

export default function AdminDashboardScreen() {
  const { profile } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              onPress={() =>
                router.replace("/(tabs)/mas" as Href)
              }
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back-outline"
                size={22}
                color={colors.textLight}
              />
            </Pressable>

            <View style={styles.adminBadge}>
              <Ionicons
                name="shield-checkmark"
                size={15}
                color={colors.primary}
              />
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>

          <Text style={styles.title}>Panel administrativo</Text>
          <Text style={styles.subtitle}>
            {profile?.full_name
              ? `Bienvenido, ${profile.full_name}.`
              : "Control general de Contractor Pro."}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryText}>
            <Text style={styles.summaryLabel}>
              Estado del sistema
            </Text>
            <Text style={styles.summaryValue}>
              4 módulos funcionales
            </Text>
            <Text style={styles.summaryDescription}>
              Catálogo, precios, clientes y medidas están conectados a pantallas reales.
            </Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        <Text style={styles.sectionTitle}>
          Herramientas disponibles
        </Text>

        <View style={styles.grid}>
          {activeModules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onPress={() => router.push(module.route)}
            />
          ))}
        </View>

        <View style={styles.pendingCard}>
          <View style={styles.pendingIcon}>
            <Ionicons
              name="time-outline"
              size={22}
              color={colors.primary}
            />
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.pendingTitle}>
              Módulos pendientes
            </Text>
            <Text style={styles.pendingText}>
              {pendingModules.join(" · ")}
            </Text>
            <Text style={styles.pendingDescription}>
              Se habilitarán cuando sus servicios, tablas y permisos estén implementados.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 36,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.surfaceDark,
  },
  headerTop: {
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  adminBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminBadgeText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
  },
  title: {
    color: colors.textLight,
    fontSize: 27,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 14,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  summaryText: { flex: 1 },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  summaryValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  summaryDescription: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 26,
    marginBottom: 14,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pendingCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },
  pendingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  pendingText: {
    marginTop: 5,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  pendingDescription: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});