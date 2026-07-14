import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModuleCard } from "@/components/ModuleCard";
import {
  colors,
  layout,
  radius,
  shadows,
} from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";

export default function HomeScreen() {
  const { profile } = useAuth();
  const { activeCompany } = useCompany();

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || "Profesional";
  const initial = firstName.charAt(0).toUpperCase();
  const companyName = activeCompany?.name || "Contractor Pro";

  const handleUnderDevelopment = (moduleName: string) => {
    Alert.alert(
      "Próximamente",
      `El módulo de ${moduleName} estará disponible en una siguiente actualización.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroOrbLarge} />
          <View style={styles.heroOrbSmall} />

          <View style={styles.brandRow}>
            <View style={styles.brandLockup}>
              <View style={styles.brandMark}>
                <Ionicons
                  name="construct"
                  size={18}
                  color={colors.surfaceDark}
                />
              </View>
              <Text style={styles.brandName}>CONTRACTOR PRO</Text>
            </View>

            <Pressable
              accessibilityLabel="Editar perfil"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => router.push("/perfil" as Href)}
              style={({ pressed }) => [
                styles.avatar,
                pressed && styles.avatarPressed,
              ]}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </Pressable>
          </View>

          <View style={styles.heroCopy}>
            <View style={styles.companyPill}>
              <View style={styles.companyDot} />
              <Text style={styles.companyPillText} numberOfLines={1}>
                {companyName}
              </Text>
            </View>

            <Text style={styles.greeting}>Hola, {firstName}</Text>
            <Text style={styles.heroTitle}>
              Toda tu operación, bajo control.
            </Text>
            <Text style={styles.heroDescription}>
              Calcula, cotiza y organiza cada trabajo desde un solo lugar.
            </Text>

            <Pressable
              onPress={() => router.push("/calculos" as Href)}
              style={({ pressed }) => [
                styles.heroButton,
                pressed && styles.heroButtonPressed,
              ]}
            >
              <View style={styles.heroButtonIcon}>
                <Ionicons
                  name="add"
                  size={20}
                  color={colors.surfaceDark}
                />
              </View>
              <Text style={styles.heroButtonText}>Nuevo cálculo</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.surfaceDark}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.dashboard}>
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>10</Text>
              <Text style={styles.statusLabel}>Calculadoras</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <View style={styles.statusInline}>
                <View style={styles.liveDot} />
                <Text style={styles.statusValueSmall}>Activa</Text>
              </View>
              <Text style={styles.statusLabel}>Empresa</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Ionicons
                name="shield-checkmark"
                size={23}
                color={colors.primary}
              />
              <Text style={styles.statusLabel}>Todo listo</Text>
            </View>
          </View>

          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>GESTIÓN DIARIA</Text>
              <Text style={styles.sectionTitle}>Accesos rápidos</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>4 módulos</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <ModuleCard
              title="Cálculos"
              description="Materiales, equipos y mano de obra con tus fórmulas."
              icon="calculator-outline"
              label="Estimar"
              tone="green"
              onPress={() => router.push("/calculos" as Href)}
            />

            <ModuleCard
              title="Presupuestos"
              description="Cotizaciones claras y profesionales para tus clientes."
              icon="document-text-outline"
              label="Cotizar"
              tone="blue"
              onPress={() => router.push("/presupuestos" as Href)}
            />

            <ModuleCard
              title="Proyectos"
              description="Controla el avance y la información de cada obra."
              icon="business-outline"
              label="Organizar"
              tone="violet"
              onPress={() => router.push("/proyectos" as Href)}
            />

            <ModuleCard
              title="Facturas"
              description="Registra cobros, abonos y saldos pendientes."
              icon="receipt-outline"
              label="Finanzas"
              tone="amber"
              onPress={() => handleUnderDevelopment("Facturas")}
            />
          </View>

          <View style={styles.sectionHeadingCompact}>
            <View>
              <Text style={styles.sectionEyebrow}>AGENDA</Text>
              <Text style={styles.sectionTitle}>Próximas actividades</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/agenda" as Href)}
              hitSlop={10}
            >
              <Text style={styles.viewAllText}>Ver agenda</Text>
            </Pressable>
          </View>

          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-clear-outline"
                size={25}
                color={colors.primary}
              />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Tu agenda está libre</Text>
              <Text style={styles.emptyText}>
                Las próximas citas y trabajos aparecerán aquí.
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.textMuted}
            />
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons
                name="sparkles"
                size={22}
                color={colors.warning}
              />
            </View>
            <View style={styles.insightCopy}>
              <Text style={styles.insightTitle}>Catálogo conectado</Text>
              <Text style={styles.insightText}>
                Los precios y rendimientos configurados se aplican a tus cálculos.
              </Text>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    backgroundColor: colors.background,
  },
  hero: {
    minHeight: 390,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: 52,
    backgroundColor: colors.surfaceDark,
    overflow: "hidden",
  },
  heroOrbLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    top: -90,
    right: -110,
    borderRadius: 130,
    borderWidth: 44,
    borderColor: "rgba(255,255,255,0.035)",
  },
  heroOrbSmall: {
    position: "absolute",
    width: 130,
    height: 130,
    bottom: -58,
    left: -40,
    borderRadius: 65,
    backgroundColor: "rgba(22,155,98,0.13)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: colors.surfaceDarkRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },
  avatarPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  heroCopy: {
    marginTop: 39,
  },
  companyPill: {
    maxWidth: 240,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  companyDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  companyPillText: {
    flexShrink: 1,
    color: colors.textLightMuted,
    fontSize: 11,
    fontWeight: "800",
  },
  greeting: {
    marginTop: 21,
    color: colors.textLightMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  heroTitle: {
    maxWidth: 360,
    marginTop: 5,
    color: colors.textLight,
    fontSize: 33,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: -1.1,
  },
  heroDescription: {
    maxWidth: 390,
    marginTop: 10,
    color: colors.textLightMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  heroButton: {
    minHeight: 54,
    marginTop: 24,
    paddingHorizontal: 13,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  heroButtonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.99 }],
  },
  heroButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroButtonText: {
    flex: 1,
    color: colors.surfaceDark,
    fontSize: 15,
    fontWeight: "900",
  },
  dashboard: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: layout.screenPadding,
  },
  statusCard: {
    minHeight: 96,
    marginTop: -28,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.raised,
  },
  statusItem: {
    flex: 1,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDivider: {
    width: 1,
    height: 43,
    backgroundColor: colors.border,
  },
  statusValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statusValueSmall: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  statusInline: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusLabel: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeading: {
    marginTop: 34,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionHeadingCompact: {
    marginTop: 5,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    marginBottom: 4,
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
  },
  sectionBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "800",
  },
  grid: {
    marginBottom: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  emptyState: {
    minHeight: 94,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCopy: {
    flex: 1,
    marginHorizontal: 13,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  insightCard: {
    marginTop: 14,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
  },
  insightIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "rgba(232,155,45,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  insightCopy: {
    flex: 1,
    marginLeft: 13,
  },
  insightTitle: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "900",
  },
  insightText: {
    marginTop: 3,
    color: colors.textLightMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
