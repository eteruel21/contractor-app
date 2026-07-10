import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
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
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    colors,
    radius,
} from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSignIn() {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Datos incompletos",
        "Introduce tu correo y contraseña.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await signIn(
        cleanEmail,
        password,
      );

      if (error) {
        Alert.alert(
          "No fue posible iniciar sesión",
          translateAuthError(error.message),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        "Correo requerido",
        "Introduce tu correo antes de solicitar la recuperación.",
      );
      return;
    }

    const { error } =
      await resetPassword(cleanEmail);

    if (error) {
      Alert.alert(
        "No fue posible enviar el correo",
        translateAuthError(error.message),
      );
      return;
    }

    Alert.alert(
      "Correo enviado",
      "Revisa tu bandeja de entrada para restablecer la contraseña.",
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons
                name="construct-outline"
                size={34}
                color={colors.textLight}
              />
            </View>

            <Text style={styles.brandName}>
              Contractor Pro
            </Text>

            <Text style={styles.brandDescription}>
              Administra tus obras, clientes,
              presupuestos y cálculos desde un solo lugar.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              Iniciar sesión
            </Text>

            <Text style={styles.subtitle}>
              Accede a tu empresa y continúa trabajando.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>
                Correo electrónico
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="correo@empresa.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Contraseña
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Tu contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="password"
                  style={styles.input}
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={21}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={() =>
                void handleResetPassword()
              }
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            <Pressable
              onPress={() => void handleSignIn()}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryButton,
                submitting &&
                  styles.primaryButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  color={colors.textLight}
                />
              ) : (
                <>
                  <Text
                    style={styles.primaryButtonText}
                  >
                    Iniciar sesión
                  </Text>

                  <Ionicons
                    name="arrow-forward-outline"
                    size={20}
                    color={colors.textLight}
                  />
                </>
              )}
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerLabel}>
                ¿No tienes una cuenta?
              </Text>

              <Pressable
                onPress={() =>
                  router.push("/registro")
                }
              >
                <Text style={styles.registerLink}>
                  Crear cuenta
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function translateAuthError(
  message: string,
): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes(
      "invalid login credentials",
    )
  ) {
    return "El correo o la contraseña son incorrectos.";
  }

  if (
    normalized.includes(
      "email not confirmed",
    )
  ) {
    return "Debes confirmar tu correo antes de iniciar sesión.";
  }

  if (
    normalized.includes(
      "too many requests",
    )
  ) {
    return "Se realizaron demasiados intentos. Inténtalo nuevamente más tarde.";
  }

  return message;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 40,
  },

  brand: {
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    marginTop: 15,
    color: colors.textLight,
    fontSize: 27,
    fontWeight: "900",
  },

  brandDescription: {
    maxWidth: 340,
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  card: {
    padding: 20,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 6,
    marginBottom: 22,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  inputContainer: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 18,
  },

  forgotText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },

  primaryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },

  registerRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },

  registerLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  registerLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});