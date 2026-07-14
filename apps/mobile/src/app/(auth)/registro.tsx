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
  layout,
  radius,
  shadows,
} from "@/constants/theme";
import {
  type PublicAppRole,
  useAuth,
} from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [fullName, setFullName] =
    useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [accountRole, setAccountRole] =
    useState<PublicAppRole>("contractor");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleRegister() {
    if (!fullName.trim()) {
      Alert.alert(
        "Nombre requerido",
        "Introduce tu nombre completo.",
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        "Correo requerido",
        "Introduce tu correo electrónico.",
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Contraseña insegura",
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Las contraseñas no coinciden",
        "Verifica la contraseña introducida.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const {
        error,
        requiresEmailConfirmation,
      } = await signUp({
        fullName,
        phone,
        email,
        password,
        role: accountRole,
      });

      if (error) {
        Alert.alert(
          "No fue posible crear la cuenta",
          translateRegisterError(
            error.message,
          ),
        );
        return;
      }

      if (requiresEmailConfirmation) {
        Alert.alert(
          "Registro recibido",
          "Revisa tu correo para confirmar la cuenta. Después deberás esperar a que el administrador apruebe tu acceso a la plataforma.",
          [
            {
              text: "Ir a iniciar sesión",
              onPress: () =>
                router.replace("/login")
            },
          ],
        );
      } else {
        Alert.alert(
          "Registro recibido",
          "Tu cuenta fue creada y está pendiente de aprobación. La revisión puede tomar un tiempo.",
          [
            {
              text: "Entendido",
              onPress: () =>
                router.replace("/pendiente"),
            },
          ],
        );
      }
    } finally {
      setSubmitting(false);
    }
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
          <View style={styles.backgroundOrb} />

          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back-outline"
                size={21}
                color={colors.textLight}
              />
            </Pressable>

            <View style={styles.brandLockup}>
              <View style={styles.brandMark}>
                <Ionicons
                  name="construct"
                  size={17}
                  color={colors.surfaceDark}
                />
              </View>
              <Text style={styles.brandName}>CONTRACTOR PRO</Text>
            </View>
          </View>

          <Text style={styles.pageEyebrow}>NUEVA CUENTA</Text>

          <Text style={styles.title}>
            Empieza a trabajar{"\n"}con más control.
          </Text>

          <Text style={styles.subtitle}>
            {accountRole === "contractor"
              ? "Crea tu cuenta para administrar empresas, clientes y obras."
              : "Crea tu acceso para consultar proyectos y presupuestos compartidos."}
          </Text>

          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <Text style={styles.cardTitle}>Crea tu acceso</Text>
              <Text style={styles.cardDescription}>
                Elige cómo utilizarás la plataforma.
              </Text>
            </View>

            <View style={styles.roleSelector}>
              <Pressable
                onPress={() => setAccountRole("contractor")}
                style={[
                  styles.roleButton,
                  accountRole === "contractor" &&
                    styles.roleButtonActive,
                ]}
              >
                <Ionicons
                  name="hammer-outline"
                  size={20}
                  color={
                    accountRole === "contractor"
                      ? colors.primary
                      : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    accountRole === "contractor" &&
                      styles.roleButtonTextActive,
                  ]}
                >
                  Contratista
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setAccountRole("client")}
                style={[
                  styles.roleButton,
                  accountRole === "client" &&
                    styles.roleButtonActive,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    accountRole === "client"
                      ? colors.primary
                      : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    accountRole === "client" &&
                      styles.roleButtonTextActive,
                  ]}
                >
                  Cliente
                </Text>
              </Pressable>
            </View>
            <FormField
              label="Nombre completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nombre y apellido"
              icon="person-outline"
              autoCapitalize="words"
            />

            <FormField
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="+507 6000-0000"
              icon="call-outline"
              keyboardType="phone-pad"
            />

            <FormField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              placeholder="correo@empresa.com"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              icon="lock-closed-outline"
              secureTextEntry
              autoCapitalize="none"
            />

            <FormField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la contraseña"
              icon="shield-checkmark-outline"
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.approvalNotice}>
              <Ionicons
                name="time-outline"
                size={19}
                color={colors.warning}
              />
              <Text style={styles.approvalNoticeText}>
                Por seguridad, un administrador revisará tu registro antes de activar el acceso.
              </Text>
            </View>

            <Pressable
              onPress={() =>
                void handleRegister()
              }
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
                    Crear cuenta
                  </Text>

                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color={colors.textLight}
                  />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon:
    | "person-outline"
    | "call-outline"
    | "mail-outline"
    | "lock-closed-outline"
    | "shield-checkmark-outline";
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad";
  secureTextEntry?: boolean;
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "sentences",
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.textSecondary}
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
      </View>
    </View>
  );
}

function translateRegisterError(
  message: string,
): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes(
      "user already registered",
    )
  ) {
    return "Ya existe una cuenta registrada con ese correo.";
  }

  if (
    normalized.includes(
      "password should be at least",
    )
  ) {
    return "La contraseña no cumple con la longitud mínima.";
  }

  if (normalized.includes("invalid email")) {
    return "El correo electrónico no es válido.";
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
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: 40,
    overflow: "hidden",
  },

  backgroundOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    top: -125,
    right: -125,
    borderRadius: 130,
    borderWidth: 42,
    borderColor: "rgba(255,255,255,0.035)",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: colors.surfaceDarkRaised,
    alignItems: "center",
    justifyContent: "center",
  },

  brandLockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  brandMark: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  pageEyebrow: {
    marginTop: 38,
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  title: {
    marginTop: 7,
    color: colors.textLight,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 36,
    letterSpacing: -0.9,
  },

  subtitle: {
    maxWidth: 430,
    marginTop: 10,
    color: colors.textLightMuted,
    fontSize: 14,
    lineHeight: 21,
  },

  card: {
    marginTop: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.raised,
  },

  cardHeading: {
    marginBottom: 16,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  cardDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },

  roleSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    minHeight: 66,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  roleButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryWash,
  },

  roleButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "900",
  },

  roleButtonTextActive: {
    color: colors.primaryDark,
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
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  primaryButton: {
    minHeight: 56,
    marginTop: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  approvalNotice: {
    marginTop: 1,
    marginBottom: 7,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  approvalNoticeText: {
    flex: 1,
    color: "#7B581C",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
