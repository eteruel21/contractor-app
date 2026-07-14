import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  colors,
  layout,
  radius,
  shadows,
} from "@/constants/theme";
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundOrb} />

        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons
              name="construct"
              size={18}
              color={colors.surfaceDark}
            />
          </View>
          <Text style={styles.brandName}>CONTRACTOR PRO</Text>
        </View>

        <View style={styles.heroCopy}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="time-outline"
              size={32}
              color={colors.warning}
            />
          </View>

          <Text style={styles.eyebrow}>REGISTRO RECIBIDO</Text>
          <Text style={styles.title}>
            Estamos revisando tu cuenta.
          </Text>
          <Text style={styles.description}>
            Un administrador validará tu información antes de darte acceso a la plataforma.
          </Text>
        </View>

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

          <View style={styles.progressRow}>
            <View style={styles.progressStep}>
              <View style={styles.progressDone}>
                <Ionicons
                  name="checkmark"
                  size={15}
                  color={colors.textLight}
                />
              </View>
              <Text style={styles.progressLabel}>Registro</Text>
            </View>
            <View style={styles.progressLineActive} />
            <View style={styles.progressStep}>
              <View style={styles.progressCurrent}>
                <View style={styles.progressCurrentDot} />
              </View>
              <Text style={styles.progressLabelActive}>Revisión</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressPending} />
              <Text style={styles.progressLabel}>Acceso</Text>
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
    width: "100%",
    maxWidth: layout.maxContentWidth,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 18,
    paddingBottom: 34,
    alignSelf: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  backgroundOrb: {
    position: "absolute",
    width: 280,
    height: 280,
    top: -125,
    right: -145,
    borderRadius: 140,
    borderWidth: 44,
    borderColor: "rgba(255,255,255,0.035)",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  heroCopy: {
    marginTop: 37,
  },
  iconContainer: {
    width: 62,
    height: 62,
    marginBottom: 19,
    borderRadius: 20,
    backgroundColor: "rgba(232,155,45,0.14)",
    borderWidth: 1,
    borderColor: "rgba(232,155,45,0.23)",
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
    maxWidth: 470,
    color: colors.textLight,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
    letterSpacing: -0.9,
  },
  description: {
    marginTop: 12,
    maxWidth: 500,
    color: colors.textLightMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    marginTop: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.raised,
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
  progressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  progressStep: {
    width: 58,
    alignItems: "center",
  },
  progressDone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCurrent: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCurrentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  progressPending: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  },
  progressLineActive: {
    flex: 1,
    height: 2,
    marginTop: 12,
    marginHorizontal: -13,
    backgroundColor: colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginTop: 12,
    marginHorizontal: -13,
    backgroundColor: colors.borderStrong,
  },
  progressLabel: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "700",
  },
  progressLabelActive: {
    marginTop: 6,
    color: colors.warning,
    fontSize: 9,
    fontWeight: "900",
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
    color: colors.textLightMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: { opacity: 0.7 },
});
