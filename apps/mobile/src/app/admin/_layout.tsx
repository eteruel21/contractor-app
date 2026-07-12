import {
  type Href,
  Redirect,
  Stack,
} from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout() {
  const {
    session,
    loading,
    isAdmin,
  } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={styles.loadingText}>
          Verificando acceso administrativo...
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <Redirect href={"/(auth)/login" as Href} />
    );
  }

  if (!isAdmin) {
    return (
      <Redirect href={"/(tabs)/mas" as Href} />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 14,
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
