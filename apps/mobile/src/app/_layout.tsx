import { Stack } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import {
  AuthProvider,
  useAuth,
} from "@/contexts/AuthContext";
import {
  CompanyProvider,
  useCompany,
} from "@/contexts/CompanyContext";

function RootNavigator() {
  const {
    session,
    loading: authLoading,
    isAdmin,
  } = useAuth();

  const {
    activeCompany,
    loading: companyLoading,
  } = useCompany();

  const isAuthenticated = Boolean(session);
  const hasActiveCompany =
    isAuthenticated && Boolean(activeCompany);
  const hasAdminAccess =
    hasActiveCompany && isAdmin;

  if (
    authLoading ||
    (isAuthenticated && companyLoading)
  ) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Cargando Contractor Pro...
        </Text>
      </View>
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
    >
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="empresa" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveCompany}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="agenda" />
        <Stack.Screen name="calculos" />
        <Stack.Screen name="clientes" />
        <Stack.Screen name="presupuestos" />
        <Stack.Screen name="proyectos" />
        <Stack.Screen name="catalogo" />
      </Stack.Protected>

      <Stack.Protected guard={hasAdminAccess}>
        <Stack.Screen name="admin" />
      </Stack.Protected>
    </Stack>
  );
}

function AppProviders() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <RootNavigator />
      </CompanyProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AppProviders />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  loading: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 14,
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "700",
  },
});
