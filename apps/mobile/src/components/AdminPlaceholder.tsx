import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";

type AdminPlaceholderProps = {
  title: string;
  description?: string;
};

export function AdminPlaceholder({
  title,
  description =
    "La ruta ya estÃ¡ preparada. Su contenido se conectarÃ¡ en el siguiente bloque.",
}: AdminPlaceholderProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={colors.textLight}
          />
        </Pressable>

        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="construct-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>
            {description}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },

  header: {
    minHeight: 70,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: colors.textLight,
    fontSize: 20,
    fontWeight: "900",
  },

  content: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
  },

  card: {
    padding: 26,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },

  iconContainer: {
    width: 64,
    height: 64,
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  description: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
