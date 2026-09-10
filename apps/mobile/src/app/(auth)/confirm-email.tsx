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

import TurnstileChallenge from "@/components/TurnstileChallenge";
import { colors, radius, shadows } from "@/constants/theme";
import { confirmEmailApi, resendVerificationEmail } from "@/services/api";

export default function ConfirmEmailScreen() {
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [tokenInput, setTokenInput] = useState(params.token || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState(params.email || "");
  const [resending, setResending] = useState(false);
  const [resendCaptchaToken, setResendCaptchaToken] = useState<string | null>(null);
  const [resendCaptchaResetKey, setResendCaptchaResetKey] = useState(0);

  useEffect(() => {
    if (params.token) {
      // The deep-link parameter is an external source that may change while mounted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTokenInput(params.token);
    }
  }, [params.token]);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
  }, [params.email]);

  async function handleConfirm() {
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      Alert.alert("Token requerido", "Ingresa el token de verificación recibido en tu correo.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await confirmEmailApi(cleanToken);

      setSuccess(true);
      Alert.alert("¡Cuenta verificada!", response.message || "Tu correo ha sido confirmado. Ya puedes iniciar sesión.", [
        {
          text: "Ir a Iniciar Sesión",
          onPress: () => router.replace("/(auth)/login")
        }
      ]);
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("Error de verificación", err.message || "El token es inválido o ha expirado.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      Alert.alert("Correo requerido", "Ingresa el correo asociado a tu cuenta.");
      return;
    }

    if (!resendCaptchaToken) {
      Alert.alert("Verificación requerida", "Completa la verificación de seguridad antes de reenviar el correo.");
      return;
    }

    const captchaToken = resendCaptchaToken;
    setResendCaptchaToken(null);
    setResendCaptchaResetKey((current) => current + 1);

    try {
      setResending(true);
      const response = await resendVerificationEmail(cleanEmail, captchaToken);
      Alert.alert("Solicitud recibida", response.message || "Si la cuenta existe y aún necesita verificación, enviaremos un nuevo correo.");
    } catch (error) {
      const err = error as { message?: string };
      Alert.alert("No fue posible reenviar", err.message || "Inténtalo nuevamente más tarde.");
    } finally {
      setResending(false);
    }
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
              <Ionicons name="mail-unread" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>Confirmar Correo Electrónico</Text>
            <Text style={styles.subtitle}>
              Ingresa o valida el código recibido en tu email para activar tu cuenta.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Token de Verificación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa el token de verificación"
              value={tokenInput}
              onChangeText={setTokenInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={[styles.primaryButton, submitting && styles.buttonDisabled]}
              onPress={handleConfirm}
              disabled={submitting || success}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Confirmar Cuenta</Text>
              )}
            </Pressable>

            <Text style={[styles.label, { marginTop: 20 }]}>Reenviar correo de verificación</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@empresa.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TurnstileChallenge
              action="resend_verification"
              onToken={setResendCaptchaToken}
              resetKey={resendCaptchaResetKey}
            />

            <Pressable
              style={[styles.secondaryButton, (resending || !resendCaptchaToken) && styles.buttonDisabled]}
              onPress={handleResend}
              disabled={resending || !resendCaptchaToken}
            >
              {resending ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.secondaryButtonText}>Reenviar correo</Text>
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
    marginBottom: 16,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace"
  },
  primaryButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600"
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
