import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
} from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

type OptionItem = {
  id: string;
  title: string;
  description: string;
  icon: any;
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
              style={({ pressed }) => [
                styles.option,
                pressed && styles.pressedOption,
              ]}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={colors.primary}
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

              <Ionicons
                name="chevron-forward-outline"
                size={21}
                color="#94A3B8"
              />
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

});
