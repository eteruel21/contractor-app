import { Ionicons } from "@expo/vector-icons";
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
    profile,
    loading: authLoading,
  } = useAuth();

  const {
    activeCompany,
    loading: companyLoading,
  } = useCompany();

  const isAuthenticated = Boolean(session);
  const isContractor = isAuthenticated && profile?.role === "contractor";
  const isClient = isAuthenticated && profile?.role === "client";

  const needsProfileSetup = isContractor && !profile?.primary_category;
  const isApproved = isAuthenticated && Boolean(profile?.active);
  const isPendingApproval = isAuthenticated && !profile?.active && !needsProfileSetup;

  const isClientAuthenticated = isApproved && profile?.role === "client";
  const isContractorAuthenticated = isApproved && profile?.role === "contractor";

  const hasActiveCompany = isContractorAuthenticated && Boolean(activeCompany);
  const needsCompanySetup = isContractorAuthenticated && !activeCompany;

  const isInitialLoading = authLoading && !profile;
  const isCompanyInitialLoading =
    isContractorAuthenticated && companyLoading && !activeCompany;

  if (isInitialLoading || isCompanyInitialLoading) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingOrb} />
        <View style={styles.loadingLogo}>
          <Ionicons
            name="construct"
            size={29}
            color={colors.surfaceDark}
          />
        </View>

        <Text style={styles.loadingBrand}>CONTRACTOR PRO</Text>

        <Text style={styles.loadingText}>
          Preparando tu espacio de trabajo
        </Text>

        <ActivityIndicator
          style={styles.loadingIndicator}
          size="small"
          color={colors.primary}
        />
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

      <Stack.Protected guard={needsProfileSetup}>
        <Stack.Screen name="perfil-profesional" />
      </Stack.Protected>

      <Stack.Protected guard={isPendingApproval}>
        <Stack.Screen name="pendiente" />
      </Stack.Protected>

      <Stack.Protected guard={needsCompanySetup}>
        <Stack.Screen name="empresa" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveCompany}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="agenda" />
        <Stack.Screen name="calculos" />
        <Stack.Screen name="clientes" />
        <Stack.Screen name="facturas" />
        <Stack.Screen name="presupuestos" />
        <Stack.Screen name="proyectos" />
        <Stack.Screen name="catalogo" />
      </Stack.Protected>


      <Stack.Protected guard={isClientAuthenticated}>
        <Stack.Screen name="(client-tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={hasActiveCompany || isClientAuthenticated}>
        <Stack.Screen name="perfil" />
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
    overflow: "hidden",
  },

  loadingOrb: {
    position: "absolute",
    width: 330,
    height: 330,
    top: -145,
    right: -170,
    borderRadius: 165,
    borderWidth: 52,
    borderColor: "rgba(255,255,255,0.035)",
  },

  loadingLogo: {
    width: 68,
    height: 68,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingBrand: {
    marginTop: 19,
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  loadingText: {
    marginTop: 9,
    color: colors.textLightMuted,
    fontSize: 12,
    fontWeight: "600",
  },

  loadingIndicator: {
    marginTop: 22,
  },
});
