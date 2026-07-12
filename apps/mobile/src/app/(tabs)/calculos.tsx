import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";

type CalculationCategory = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  enabled: boolean;
  route?:
    | "/calculos/concreto"
    | "/calculos/bloques-repello";
};

const categories: CalculationCategory[] = [
  {
    id: "concrete",
    title: "Concreto",
    description:
      "Volumen, cemento, arena, piedra y mano de obra.",
    icon: "cube-outline",
    enabled: true,
    route: "/calculos/concreto",
  },
  {
    id: "blocks",
    title: "Bloques y repello",
    description:
      "Muros, bloques, mortero, repello y desperdicio.",
    icon: "grid-outline",
    enabled: true,
    route: "/calculos/bloques-repello",
  },
  {
    id: "gypsum",
    title: "Gypsum",
    description:
      "Láminas, perfiles, tornillos y compuesto.",
    icon: "layers-outline",
    enabled: false,
  },
  {
    id: "pvc",
    title: "Cielo raso PVC",
    description:
      "Láminas, tracks, studs, cargadores y accesorios.",
    icon: "apps-outline",
    enabled: false,
  },
  {
    id: "paint",
    title: "Pintura",
    description:
      "Área, galones, manos de pintura y mano de obra.",
    icon: "color-palette-outline",
    enabled: false,
  },
  {
    id: "flooring",
    title: "Pisos",
    description:
      "Cerámica, porcelanato, adhesivo y boquilla.",
    icon: "square-outline",
    enabled: false,
  },
  {
    id: "electricity",
    title: "Electricidad",
    description:
      "Puntos, cables, tuberías, breakers y accesorios.",
    icon: "flash-outline",
    enabled: false,
  },
  {
    id: "special-systems",
    title: "Sistemas especiales",
    description:
      "Cámaras, alarmas, incendio y control de acceso.",
    icon: "videocam-outline",
    enabled: false,
  },
  {
    id: "air-conditioning",
    title: "Aire acondicionado",
    description:
      "BTU, tuberías, cableado, drenaje e instalación.",
    icon: "snow-outline",
    enabled: false,
  },
  {
    id: "mdf",
    title: "Muebles MDF",
    description:
      "Tableros, cortes, cantos, herrajes y fabricación.",
    icon: "file-tray-full-outline",
    enabled: false,
  },
];

export default function CalculationsScreen() {
  function openCategory(category: CalculationCategory) {
    if (!category.enabled || !category.route) {
      return;
    }

    router.push(category.route);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="calculator-outline"
              size={28}
              color={colors.textLight}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>Calculadoras</Text>

            <Text style={styles.subtitle}>
              Selecciona el tipo de trabajo que deseas calcular.
            </Text>
          </View>
        </View>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={colors.info}
          />

          <Text style={styles.noticeText}>
            Los resultados son estimaciones. Los rendimientos,
            precios y desperdicios podrán configurarse para cada
            empresa.
          </Text>
        </View>

        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              disabled={!category.enabled}
              onPress={() => openCategory(category)}
              style={({ pressed }) => [
                styles.card,
                !category.enabled && styles.disabledCard,
                pressed && category.enabled && styles.pressedCard,
              ]}
            >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.categoryIcon,
                    !category.enabled &&
                      styles.disabledCategoryIcon,
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={
                      category.enabled
                        ? colors.primary
                        : "#94A3B8"
                    }
                  />
                </View>

                {!category.enabled && (
                  <View style={styles.comingSoon}>
                    <Text style={styles.comingSoonText}>
                      Próximamente
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.cardTitle,
                  !category.enabled &&
                    styles.disabledCardText,
                ]}
              >
                {category.title}
              </Text>

              <Text style={styles.cardDescription}>
                {category.description}
              </Text>

              {category.enabled && (
                <View style={styles.openRow}>
                  <Text style={styles.openText}>Abrir</Text>

                  <Ionicons
                    name="arrow-forward-outline"
                    size={18}
                    color={colors.primary}
                  />
                </View>
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
    paddingBottom: 34,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 15,
  },

  title: {
    color: colors.textLight,
    fontSize: 25,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 20,
  },

  notice: {
    margin: 20,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: "#EFF6FF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  noticeText: {
    flex: 1,
    color: "#1E3A8A",
    fontSize: 13,
    lineHeight: 19,
  },

  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  card: {
    width: "48%",
    minWidth: 155,
    maxWidth: 340,
    flexGrow: 1,
    minHeight: 205,
    padding: 17,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  disabledCard: {
    opacity: 0.68,
  },

  pressedCard: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  cardTop: {
    minHeight: 47,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  categoryIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledCategoryIcon: {
    backgroundColor: "#E2E8F0",
  },

  comingSoon: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  comingSoonText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: "800",
  },

  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  disabledCardText: {
    color: "#475569",
  },

  cardDescription: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  openRow: {
    marginTop: "auto",
    paddingTop: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  openText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
  },
});
