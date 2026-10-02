import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  type Href,
  router,
} from "expo-router";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { MotionPressable } from "@/components/MotionPressable";

import { colors, radius, shadows, typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

type OptionItem = {
  id: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
};

const baseOptions: OptionItem[] = [
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
    onPress: () => router.push("/proyectos" as Href),
  },
  {
    id: "invoices",
    title: "Facturas",
    description:
      "Facturas, abonos y saldos pendientes.",
    icon: "receipt-outline" as const,
    onPress: () => router.push("/facturas" as Href),
  },
  {
    id: "catalog",
    title: "Catálogo",
    description:
      "Consultar materiales, mano de obra y servicios.",
    icon: "cube-outline" as const,
    onPress: () => router.push("/catalogo" as Href),
  },
];

export default function MoreScreen() {
  const { signOut } = useAuth();

  const performLogout = async () => {
    const { error } = await signOut();

    if (!error) return;

    if (Platform.OS === "web") {
      console.error("No se pudo cerrar sesión:", error.message);
      return;
    }

    Alert.alert("No se pudo cerrar sesión", error.message);
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      void performLogout();
      return;
    }

    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => void performLogout(),
        },
      ],
    );
  };

  const options = [
    ...baseOptions,
    {
      id: "logout",
      title: "Cerrar sesión",
      description: "Salir de tu cuenta actual.",
      icon: "log-out-outline" as const,
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(420)} style={styles.header}>
          <Text style={styles.eyebrow}>LEURET</Text>

          <Text style={styles.title}>
            Más herramientas
          </Text>

          <Text style={styles.subtitle}>
            Administración general de la empresa.
          </Text>
        </Animated.View>

        <View style={styles.sectionIntro}>
          <Text style={styles.sectionEyebrow}>CENTRO DE CONTROL</Text>
          <Text style={styles.sectionText}>Todo lo que complementa tu operación.</Text>
        </View>

        <View style={styles.list}>
          {options.map((option, index) => (
            <MotionPressable
              key={option.id}
              entering={FadeInUp.delay(index * 55).duration(320)}
              onPress={option.onPress}
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressedOption,
              ]}
            >
              <View style={[styles.iconContainer, option.id === "logout" && styles.logoutIconContainer]}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={option.id === "logout" ? colors.danger : colors.primary}
                />
              </View>

              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, option.id === "logout" && styles.logoutTitle]}>
                  {option.title}
                </Text>

                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward-outline"
                size={21}
                color={colors.steel}
              />
            </MotionPressable>
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
    paddingTop: 22,
    paddingBottom: 34,
    backgroundColor: colors.surfaceDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  title: {
    marginTop: 8,
    color: colors.textLight,
    ...typography.title,
  },

  subtitle: {
    marginTop: 7,
    color: colors.textLightMuted,
    fontSize: 13,
    lineHeight: 19,
  },

  sectionIntro: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  sectionEyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  sectionText: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 12,
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },

  option: {
    minHeight: 86,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.soft,
  },

  pressedOption: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.9,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.steelSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutIconContainer: {
    backgroundColor: colors.dangerSoft,
  },

  logoutTitle: {
    color: colors.danger,
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

});
