import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
} from "expo-router";
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

const modules = [
  {
    id: "catalog",
    title: "CatÃ¡logo",
    description:
      "Productos, servicios y categorÃ­as.",
    icon: "cube-outline" as const,
    route: "/admin/catalogo",
  },
  {
    id: "prices",
    title: "Precios",
    description:
      "Costos, venta e historial de cambios.",
    icon: "pricetags-outline" as const,
    route: "/admin/precios",
  },
  {
    id: "measurements",
    title: "Medidas",
    description:
      "Unidades, sÃ­mbolos y conversiones.",
    icon: "resize-outline" as const,
    route: "/admin/medidas",
  },
  {
    id: "formulas",
    title: "FÃ³rmulas",
    description:
      "Rendimientos y parÃ¡metros de cÃ¡lculo.",
    icon: "calculator-outline" as const,
    route: "/admin/formulas",
  },
  {
    id: "clients",
    title: "Clientes",
    description:
      "InformaciÃ³n y actividad de clientes.",
    icon: "people-outline" as const,
    route: "/admin/clientes",
  },
  {
    id: "users",
    title: "Usuarios",
    description:
      "Roles, accesos y cuentas activas.",
    icon: "shield-checkmark-outline" as const,
    route: "/admin/usuarios",
  },
  {
    id: "settings",
    title: "ConfiguraciÃ³n",
    description:
      "Preferencias generales de la aplicaciÃ³n.",
    icon: "settings-outline" as const,
    route: "/admin/configuracion",
  },
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
              <Text style={styles.adminBadgeText}>
                ADMIN
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            Panel administrativo
          </Text>

          <Text style={styles.subtitle}>
            {profile?.full_name
              ? `Bienvenido, ${profile.full_name}.`
              : "Control general de Contractor Pro."}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              Estado del sistema
            </Text>
            <Text style={styles.summaryValue}>
              AdministraciÃ³n activa
            </Text>
          </View>

          <View style={styles.statusDot} />
        </View>

        <Text style={styles.sectionTitle}>
          Herramientas administrativas
        </Text>

        <View style={styles.grid}>
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              description={module.description}
              icon={module.icon}
              onPress={() =>
                router.push(module.route as Href)
              }
            />
          ))}
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
    paddingBottom: 32,
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
    justifyContent: "space-between",
  },

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
});
