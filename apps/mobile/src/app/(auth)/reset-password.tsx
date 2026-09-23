import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius, shadows } from "@/constants/theme";
import { resetPasswordApi } from "@/services/api";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [tokenInput, setTokenInput] = useState(params.token || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    if (params.token) {
      // The deep-link parameter is an external source that may change while mounted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenInput(params.token);
    }
  }, [params.token]);

  async function handleResetPassword() {
    const cleanToken = tokenInput.trim();
    if (!cleanToken || !newPassword) {
      Alert.alert("Datos requeridos", "Ingresa el token y tu nueva contraseña.");
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert("Contraseña débil", "La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Contraseñas no coinciden", "La contraseña de confirmación no coincide.");
      return;
    }

    try {
      setSubmitting(true);
      await resetPasswordApi(cleanToken, newPassword);

      setTokenInput("");
      setNewPassword("");
      setConfirmPassword("");
      setResetComplete(true);
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error de recuperación", err.message || "El token es inválido o ha expirado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (resetComplete) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successScreen}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color="#16A34A"
              />
            </View>

            <Text style={styles.successTitle}>
              Contraseña actualizada con éxito
            </Text>

            <Text style={styles.successMessage}>
              Tu nueva contraseña se guardó correctamente. Ya puedes iniciar sesión en Contractor Pro.
            </Text>

            <Pressable
              style={[styles.primaryButton, styles.successButton]}
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text style={styles.primaryButtonText}>
                Iniciar sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Restablecer Contraseña</Text>
            <Text style={styles.subtitle}>
              Establece tu nueva contraseña de acceso a Contractor Pro.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Token de Recuperación</Text>
            <TextInput
              style={styles.input}
              placeholder="Token de recuperación"
              value={tokenInput}
              onChangeText={setTokenInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Al menos 8 caracteres"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar Nueva Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Repite la nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Guardar Nueva Contraseña</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  header: {
    alignItems: "center",
    marginBottom: 24
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryWash,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    ...shadows.soft
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16
  },
  successScreen: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  successCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 28,
    alignItems: "center",
    ...shadows.soft
  },
  successIconContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#ECFDF3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  successTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center"
  },
  successMessage: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 12
  },
  successButton: {
    width: "100%",
    marginTop: 24
  },
  primaryButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  }
});
