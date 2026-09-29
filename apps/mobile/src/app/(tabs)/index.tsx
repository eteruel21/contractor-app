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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  layout,
  radius,
  shadows,
  spacing,
  typography,
} from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type QuickActionProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
  delay?: number;
};

function LeuretMark() {
  return (
    <View style={styles.mark}>
      <View style={styles.markVertical} />
      <View style={styles.markDiagonal} />
      <View style={styles.markHorizontal} />
      <View style={styles.markGlow} />
    </View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
  delay = 0,
}: QuickActionProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420)}
      style={styles.quickActionWrapper}
    >
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.quickAction,
          pressed && styles.quickActionPressed,
        ]}
      >
        <View style={styles.quickIcon}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>

        <View style={styles.quickCopy}>
          <Text style={styles.quickTitle}>{title}</Text>
          <Text style={styles.quickSubtitle}>{subtitle}</Text>
        </View>

        <Ionicons
          name="arrow-forward"
          size={17}
          color={colors.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {action && onAction ? (
        <Pressable
          hitSlop={10}
          onPress={onAction}
          style={({ pressed }) => pressed && styles.actionPressed}
        >
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const { activeCompany } = useCompany();

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || "Profesional";

  const initial = firstName.charAt(0).toUpperCase();
  const companyName = activeCompany?.name || "Leuret";

  const now = new Date();
  const hour = now.getHours();

  const greeting =
    hour < 12
      ? "Buenos días"
      : hour < 18
        ? "Buenas tardes"
        : "Buenas noches";

  const formattedDate = new Intl.DateTimeFormat("es-PA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now);

  const handleInvoices = () => {
    Alert.alert(
      "Facturación",
      "Este acceso se conectará al nuevo módulo financiero de Leuret.",
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <View style={styles.glowTop} />
          <View style={styles.glowSide} />

          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.topBar}
          >
            <View style={styles.brand}>
              <LeuretMark />

              <View>
                <Text style={styles.brandName}>LEURET</Text>
                <Text style={styles.brandTagline}>
                  WORK SMARTER
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Abrir perfil"
              accessibilityRole="button"
              onPress={() => router.push("/perfil" as Href)}
              style={({ pressed }) => [
                styles.avatar,
                pressed && styles.avatarPressed,
              ]}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(100).duration(520)}
            style={styles.heroCopy}
          >
            <Text style={styles.dateText}>
              {formattedDate.toUpperCase()}
            </Text>

            <Text style={styles.greeting}>
              {greeting}, {firstName}
            </Text>

            <Text style={styles.heroTitle}>
              Tu trabajo,
              {"\n"}
              <Text style={styles.heroTitleAccent}>
                más inteligente.
              </Text>
            </Text>

            <Text style={styles.heroDescription}>
              Proyectos, cálculos, presupuestos y clientes
              organizados desde un solo lugar.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(220).duration(520)}
            style={styles.companyCard}
          >
            <View style={styles.companyTop}>
              <View style={styles.companyIdentity}>
                <View style={styles.companyIndicator}>
                  <View style={styles.companyIndicatorDot} />
                </View>

                <View style={styles.companyCopy}>
                  <Text style={styles.companyLabel}>
                    ESPACIO ACTIVO
                  </Text>

                  <Text
                    style={styles.companyName}
                    numberOfLines={1}
                  >
                    {companyName}
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-forward"
                size={19}
                color={colors.textMuted}
              />
            </View>

            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>10</Text>
                <Text style={styles.metricLabel}>
                  Calculadoras
                </Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metric}>
                <View style={styles.metricOnline}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.metricValueSmall}>
                    Activo
                  </Text>
                </View>

                <Text style={styles.metricLabel}>
                  Estado
                </Text>
              </View>

              <View style={styles.metricDivider} />

              <View style={styles.metric}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={colors.accent}
                />
                <Text style={styles.metricLabel}>
                  Protegido
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        <View style={styles.content}>
          <SectionHeader
            eyebrow="ACCESOS RÁPIDOS"
            title="¿Qué quieres hacer?"
          />

          <View style={styles.quickGrid}>
            <QuickAction
              icon="calculator-outline"
              title="Calcular"
              subtitle="Materiales y mano de obra"
              delay={80}
              onPress={() =>
                router.push("/calculos" as Href)
              }
            />

            <QuickAction
              icon="document-text-outline"
              title="Presupuesto"
              subtitle="Crear una cotización"
              delay={140}
              onPress={() =>
                router.push("/presupuestos" as Href)
              }
            />

            <QuickAction
              icon="business-outline"
              title="Proyecto"
              subtitle="Organizar una obra"
              delay={200}
              onPress={() =>
                router.push("/proyectos" as Href)
              }
            />

            <QuickAction
              icon="person-add-outline"
              title="Cliente"
              subtitle="Gestionar contactos"
              delay={260}
              onPress={() =>
                router.push("/(tabs)/clientes" as Href)
              }
            />
          </View>

          <Animated.View
            entering={FadeInDown.delay(320).duration(480)}
          >
            <SectionHeader
              eyebrow="CONTROL"
              title="Tu operación"
            />

            <View style={styles.operationCard}>
              <Pressable
                onPress={() =>
                  router.push("/proyectos" as Href)
                }
                style={({ pressed }) => [
                  styles.operationRow,
                  pressed && styles.rowPressed,
                ]}
              >
                <View
                  style={[
                    styles.operationIcon,
                    styles.operationIconBlue,
                  ]}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.operationCopy}>
                  <Text style={styles.operationTitle}>
                    Proyectos
                  </Text>
                  <Text style={styles.operationText}>
                    Revisa avances y trabajos activos.
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              <View style={styles.rowDivider} />

              <Pressable
                onPress={handleInvoices}
                style={({ pressed }) => [
                  styles.operationRow,
                  pressed && styles.rowPressed,
                ]}
              >
                <View
                  style={[
                    styles.operationIcon,
                    styles.operationIconCyan,
                  ]}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={20}
                    color={colors.accent}
                  />
                </View>

                <View style={styles.operationCopy}>
                  <Text style={styles.operationTitle}>
                    Finanzas
                  </Text>
                  <Text style={styles.operationText}>
                    Facturas, cobros y saldos.
                  </Text>
                </View>

                <View style={styles.soonBadge}>
                  <Text style={styles.soonText}>
                    PRÓXIMO
                  </Text>
                </View>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(390).duration(480)}
          >
            <SectionHeader
              eyebrow="AGENDA"
              title="Próximas actividades"
              action="Ver agenda"
              onAction={() =>
                router.push("/(tabs)/agenda" as Href)
              }
            />

            <Pressable
              onPress={() =>
                router.push("/(tabs)/agenda" as Href)
              }
              style={({ pressed }) => [
                styles.agendaCard,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={styles.agendaIcon}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={24}
                  color={colors.accent}
                />
              </View>

              <View style={styles.agendaCopy}>
                <Text style={styles.agendaTitle}>
                  Tu agenda está libre
                </Text>

                <Text style={styles.agendaText}>
                  Tus próximas visitas, trabajos y
                  recordatorios aparecerán aquí.
                </Text>
              </View>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(460).duration(480)}
            style={styles.pulseCard}
          >
            <View style={styles.pulseIcon}>
              <View style={styles.pulseRing}>
                <View style={styles.pulseCore} />
              </View>
            </View>

            <View style={styles.pulseCopy}>
              <Text style={styles.pulseEyebrow}>
                LEURET PULSE
              </Text>

              <Text style={styles.pulseTitle}>
                Todo listo para trabajar
              </Text>

              <Text style={styles.pulseText}>
                Tu espacio está sincronizado y preparado.
              </Text>
            </View>

            <Ionicons
              name="sparkles-outline"
              size={20}
              color={colors.accent}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    backgroundColor: colors.background,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },

  glowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    top: -165,
    right: -100,
    borderRadius: 140,
    backgroundColor: colors.glowBlue,
    opacity: 0.42,
  },

  glowSide: {
    position: "absolute",
    width: 190,
    height: 190,
    bottom: 40,
    left: -135,
    borderRadius: 95,
    backgroundColor: colors.glowSoft,
    opacity: 0.18,
  },

  topBar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  mark: {
    position: "relative",
    width: 40,
    height: 40,
  },

  markVertical: {
    position: "absolute",
    left: 9,
    top: 4,
    width: 8,
    height: 29,
    borderRadius: 5,
    backgroundColor: colors.primary,
    transform: [{ rotate: "-8deg" }],
  },

  markDiagonal: {
    position: "absolute",
    left: 14,
    top: 20,
    width: 10,
    height: 19,
    borderRadius: 5,
    backgroundColor: colors.primary,
    transform: [{ rotate: "-42deg" }],
  },

  markHorizontal: {
    position: "absolute",
    left: 18,
    bottom: 5,
    width: 20,
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.accent,
    transform: [{ rotate: "-10deg" }],
  },

  markGlow: {
    position: "absolute",
    width: 28,
    height: 28,
    left: 7,
    top: 7,
    borderRadius: 14,
    backgroundColor: colors.glowBlue,
    opacity: 0.5,
  },

  brandName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2.2,
  },

  brandTagline: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.6,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  avatarText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  heroCopy: {
    marginTop: spacing.xl,
  },

  dateText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  greeting: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },

  heroTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.4,
  },

  heroTitleAccent: {
    color: colors.primary,
  },

  heroDescription: {
    maxWidth: 360,
    marginTop: spacing.md,
    color: colors.textSecondary,
    ...typography.body,
  },

  companyCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.raised,
  },

  companyTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  companyIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  companyIndicator: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  companyIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    ...shadows.glow,
  },

  companyCopy: {
    flex: 1,
    marginLeft: spacing.base,
  },

  companyLabel: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  companyName: {
    marginTop: 3,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  metrics: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    flexDirection: "row",
  },

  metric: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  metricDivider: {
    width: 1,
    height: 36,
    alignSelf: "center",
    backgroundColor: colors.divider,
  },

  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  metricValueSmall: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },

  metricOnline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },

  metricLabel: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
  },

  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: layout.screenPadding,
  },

  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionEyebrow: {
    marginBottom: 5,
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  sectionTitle: {
    color: colors.text,
    ...typography.heading,
  },

  sectionAction: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  actionPressed: {
    opacity: 0.6,
  },

  quickGrid: {
    gap: layout.cardGap,
  },

  quickActionWrapper: {
    width: "100%",
  },

  quickAction: {
    minHeight: 82,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },

  quickActionPressed: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
    transform: [{ scale: 0.985 }],
  },

  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  quickCopy: {
    flex: 1,
    marginLeft: spacing.base,
  },

  quickTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  quickSubtitle: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  operationCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  operationRow: {
    minHeight: 84,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },

  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },

  operationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  operationIconBlue: {
    backgroundColor: colors.primarySoft,
  },

  operationIconCyan: {
    backgroundColor: colors.accentSoft,
  },

  operationCopy: {
    flex: 1,
    marginLeft: spacing.base,
  },

  operationTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  operationText: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  rowDivider: {
    height: 1,
    marginLeft: 72,
    backgroundColor: colors.divider,
  },

  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },

  soonText: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  agendaCard: {
    minHeight: 104,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  agendaIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  agendaCopy: {
    flex: 1,
    marginHorizontal: spacing.base,
  },

  agendaTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },

  agendaText: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  pulseCard: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
  },

  pulseIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseCore: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.accent,
    ...shadows.glow,
  },

  pulseCopy: {
    flex: 1,
    marginHorizontal: spacing.base,
  },

  pulseEyebrow: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  pulseTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },

  pulseText: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
});