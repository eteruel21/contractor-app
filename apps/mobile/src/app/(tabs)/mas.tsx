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

import { colors, radius } from "../../constants/theme";

const options = [
  {
    id: "budgets",
    title: "Presupuestos",
    description:
      "Partidas, descuentos, ITBMS y totales.",
    icon: "document-text-outline" as const,
    onPress: () => router.push("/presupuestos" as Href),
  },
  {
    id: "projects",
    title: "Proyectos",
    description:
      "Programación y seguimiento de trabajos.",
    icon: "business-outline" as const,
  },
  {
    id: "invoices",
    title: "Facturas",
    description:
      "Facturas, abonos y saldos pendientes.",
    icon: "receipt-outline" as const,
  },
  {
    id: "catalog",
    title: "Catálogo",
    description:
      "Editar precios de materiales, mano de obra y servicios.",
    icon: "cube-outline" as const,
    onPress: () => router.push("/catalogo" as Href),
  },
];

export default function MoreScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Más herramientas
          </Text>

          <Text style={styles.subtitle}>
            Administración general de la empresa.
          </Text>
        </View>

        <View style={styles.list}>
          {options.map((option) => (
            <Pressable
              key={option.id}
              onPress={option.onPress}
              disabled={!option.onPress}
              style={({ pressed }) => [
                styles.option,
                !option.onPress && styles.disabledOption,
                pressed && styles.pressedOption,
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    option.onPress
                      ? colors.primary
                      : "#94A3B8"
                  }
                />
              </View>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {option.title}
                </Text>

                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              {option.onPress ? (
                <Ionicons
                  name="chevron-forward-outline"
                  size={21}
                  color="#94A3B8"
                />
              ) : (
                <Text style={styles.soonText}>
                  Próximamente
                </Text>
              )}
            </Pressable>
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
    paddingBottom: 30,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    backgroundColor: colors.surfaceDark,
  },

  title: {
    color: colors.textLight,
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 14,
  },

  list: {
    padding: 20,
    gap: 12,
  },

  option: {
    minHeight: 82,
    padding: 15,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  disabledOption: {
    opacity: 0.65,
  },

  pressedOption: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  optionText: {
    flex: 1,
    marginHorizontal: 13,
  },

  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  optionDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },

  soonText: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
  },
});
