import { Ionicons } from "@expo/vector-icons";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ModuleCard } from "../../components/ModuleCard";
import { colors, radius } from "../../constants/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Bienvenido</Text>
            <Text style={styles.company}>Contractor Pro</Text>
          </View>

          <View style={styles.avatar}>
            <Ionicons
              name="person-outline"
              size={23}
              color={colors.textLight}
            />
          </View>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryLabel}>
                Trabajos activos
              </Text>

              <Text style={styles.summaryValue}>0</Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="construct-outline"
                size={27}
                color={colors.primary}
              />
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottom}>
            <Text style={styles.summaryBottomText}>
              Presupuestos pendientes
            </Text>

            <Text style={styles.summaryBottomValue}>0</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Herramientas</Text>
        </View>

        <View style={styles.grid}>
          <ModuleCard
            title="Nuevo cálculo"
            description="Calcula materiales, equipos y mano de obra."
            icon="calculator-outline"
          />

          <ModuleCard
            title="Presupuestos"
            description="Crea cotizaciones profesionales para tus clientes."
            icon="document-text-outline"
          />

          <ModuleCard
            title="Proyectos"
            description="Programa y controla el avance de cada trabajo."
            icon="business-outline"
          />

          <ModuleCard
            title="Facturas"
            description="Registra facturas, abonos y saldos pendientes."
            icon="receipt-outline"
          />
        </View>

        <Text style={styles.sectionTitle}>Próximas actividades</Text>

        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-clear-outline"
            size={38}
            color="#94A3B8"
          />

          <Text style={styles.emptyTitle}>
            No hay actividades programadas
          </Text>

          <Text style={styles.emptyText}>
            Las próximas citas y trabajos aparecerán aquí.
          </Text>
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
    paddingBottom: 30,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  welcome: {
    color: "#94A3B8",
    fontSize: 14,
  },

  company: {
    marginTop: 3,
    color: colors.textLight,
    fontSize: 25,
    fontWeight: "900",
  },

  avatar: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  summary: {
    marginHorizontal: 20,
    marginTop: -6,
    marginBottom: 28,
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  summaryValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: colors.border,
  },

  summaryBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryBottomText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  summaryBottomValue: {
    color: colors.warning,
    fontSize: 18,
    fontWeight: "900",
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginBottom: 14,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },

  grid: {
    paddingHorizontal: 20,
    marginBottom: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  emptyState: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  emptyText: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});