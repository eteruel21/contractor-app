import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingApprovalScreen() {
  const {
    profile,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="time-outline"
            size={44}
            color={colors.warning}
          />
        </View>

        <Text style={styles.eyebrow}>REGISTRO RECIBIDO</Text>
        <Text style={styles.title}>
          Tu cuenta está pendiente de aprobación
        </Text>
        <Text style={styles.description}>
          El administrador debe revisar y aceptar tu registro antes de darte
          acceso a la plataforma. Este proceso puede tomar un tiempo.
        </Text>

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                Estado actual: pendiente
              </Text>
              <Text style={styles.statusDescription}>
                {profile?.full_name
                  ? `Cuenta de ${profile.full_name}`
                  : "Esperando revisión administrativa"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.note}>
            Cuando tu cuenta sea aprobada, toca “Comprobar estado” para
            entrar. No necesitas registrarte de nuevo.
          </Text>
        </View>

        {profileError ? (
          <Text style={styles.errorText}>
            No se pudo comprobar el perfil: {profileError}
          </Text>
        ) : null}

        <Pressable
          onPress={() => void handleRefresh()}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.primaryButton,
            (refreshing || pressed) && styles.pressed,
          ]}
        >
          {refreshing ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <>
              <Ionicons
                name="refresh-outline"
                size={20}
                color={colors.textLight}
              />
              <Text style={styles.primaryButtonText}>
                Comprobar estado
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={() => void handleSignOut()}
          disabled={signingOut}
          style={({ pressed }) => [
            styles.secondaryButton,
            (signingOut || pressed) && styles.pressed,
          ]}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.textSecondary} />
          ) : (
            <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignSelf: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 86,
    height: 86,
    marginBottom: 20,
    borderRadius: 43,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
  },
  description: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  card: {
    marginTop: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.warning,
  },
  statusContent: { flex: 1 },
  statusTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  statusDescription: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: colors.border,
  },
  note: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  errorText: {
    marginTop: 14,
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 52,
    marginTop: 22,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primaryButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: { opacity: 0.7 },
});
