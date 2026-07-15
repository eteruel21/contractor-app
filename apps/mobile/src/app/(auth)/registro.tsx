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

const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === "web") {
    alert(`${title}\n\n${message}`);
    if (buttons && buttons.length > 0) {
      const okButton = buttons.find((b: any) => b.text === "Entendido" || b.text === "OK" || b.onPress) || buttons[0];
      if (okButton && okButton.onPress) {
        okButton.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

function getPasswordStrength(pass: string) {
  if (!pass) return { score: 0, label: "Falta contraseña", color: "#94A3B8" };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 2) return { score, label: "Débil", color: "#EF4444" };
  if (score <= 4) return { score, label: "Media", color: "#F59E0B" };
  return { score, label: "Fuerte", color: "#10B981" };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBarBackground}>
        <View
          style={[
            styles.strengthBarActive,
            {
              width: `${(strength.score / 5) * 100}%`,
              backgroundColor: strength.color,
            },
          ]}
        />
      </View>
      <Text style={[styles.strengthText, { color: strength.color }]}>
        Seguridad: {strength.label}
      </Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountRole, setAccountRole] = useState<PublicAppRole>("contractor");
  
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [corregimiento, setCorregimiento] = useState("");
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notificationsOptIn, setNotificationsOptIn] = useState(false);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification Modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const PROVINCES = [
    "Bocas del Toro",
    "Coclé",
    "Colón",
    "Chiriquí",
    "Darién",
    "Herrera",
    "Los Santos",
    "Panamá",
    "Panamá Oeste",
    "Veraguas",
    "Comarca Guna Yala",
    "Comarca Ngäbe-Buglé",
  ];

  const handleSelectProvince = () => {
    setShowProvinceModal(true);
  };

  async function handleRegisterClick() {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert("Campos requeridos", "Introduce tu nombre y apellido.");
      return;
    }

    if (!phone.trim()) {
      showAlert("Teléfono requerido", "Introduce tu número de teléfono.");
      return;
    }

    if (!email.trim()) {
      showAlert("Correo requerido", "Introduce tu correo electrónico.");
      return;
    }

    if (!province || !district.trim() || !corregimiento.trim()) {
      showAlert("Ubicación requerida", "Completa los datos de tu provincia, distrito y corregimiento.");
      return;
    }

    if (password.length < 8) {
      showAlert("Contraseña insegura", "La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Las contraseñas no coinciden", "Verifica la contraseña introducida.");
      return;
    }

    if (!termsAccepted) {
      showAlert("Aviso legal", "Debes aceptar los términos y condiciones de servicio.");
      return;
    }

    if (!isRobotChecked) {
      showAlert("Protección contra robots", "Por favor marca la casilla 'No soy un robot' para continuar.");
      return;
    }

    // Si todo está correcto, abrimos el modal de verificación de teléfono (OTP)
    setShowOtpModal(true);
  }

  async function handleConfirmOtp() {
    if (otpCode !== "123456") {
      showAlert("Código incorrecto", "Para fines de demostración e integración, utiliza el código 123456.");
      return;
    }

    try {
      setVerifyingOtp(true);
      setSubmitting(true);
      setShowOtpModal(false);

      // Obtener IP pública y detalles del dispositivo
      let userIp = "127.0.0.1";
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        userIp = data.ip || "127.0.0.1";
      } catch (e) {
        // Fallback
      }

      const deviceDetail = `${Platform.OS === "web" ? "Navegador Web" : Platform.OS === "ios" ? "Dispositivo iOS" : "Dispositivo Android"} (${Platform.Version})`;

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      const { error, requiresEmailConfirmation } = await signUp({
        fullName,
        firstName,
        lastName,
        phone,
        email,
        password,
        role: accountRole,
        province,
        district,
        corregimiento,
        termsAccepted,
        notificationsOptIn,
        registrationIp: userIp,
        registrationDevice: deviceDetail,
      });

      if (error) {
        showAlert("No fue posible crear la cuenta", translateRegisterError(error.message));
        return;
      }

      if (requiresEmailConfirmation) {
        showAlert(
          "Registro recibido",
          "Revisa tu correo para confirmar la cuenta. Después, los contratistas deberán completar su perfil profesional antes de esperar la aprobación del administrador.",
          [
            {
              text: "Ir a iniciar sesión",
              onPress: () => router.replace("/login"),
            },
          ]
        );
      } else {
        // El usuario inicia sesión de inmediato si no hay confirmación obligatoria por correo
        showAlert("¡Registro Exitoso!", "Tu cuenta ha sido creada. A continuación completa tu perfil profesional.");
      }
    } catch (err: any) {
      showAlert("Error de Registro", err.message || "Ocurrió un error inesperado.");
    } finally {
      setVerifyingOtp(false);
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              <Text style={brandNameStyle()}>CONTRACTOR PRO</Text>
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
                  accountRole === "contractor" && styles.roleButtonActive,
                ]}
              >
                <Ionicons
                  name="hammer-outline"
                  size={20}
                  color={accountRole === "contractor" ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    accountRole === "contractor" && styles.roleButtonTextActive,
                  ]}
                >
                  Contratista
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setAccountRole("client")}
                style={[
                  styles.roleButton,
                  accountRole === "client" && styles.roleButtonActive,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={accountRole === "client" ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    accountRole === "client" && styles.roleButtonTextActive,
                  ]}
                >
                  Cliente
                </Text>
              </Pressable>
            </View>

            {/* Campos de Nombre y Apellido */}
            <View style={styles.row}>
              <View style={styles.col}>
                <FormField
                  label="Nombre"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Tu nombre"
                  icon="person-outline"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.col}>
                <FormField
                  label="Apellido"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Tu apellido"
                  icon="person-outline"
                  autoCapitalize="words"
                />
              </View>
            </View>

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

            {/* Sección de Ubicación */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Provincia</Text>
              <Pressable
                onPress={handleSelectProvince}
                style={styles.selectButton}
              >
                <Text style={province ? styles.selectButtonText : styles.selectPlaceholderText}>
                  {province || "Selecciona una provincia"}
                </Text>
                <Ionicons name="chevron-down-outline" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.row}>
              <View style={styles.col}>
                <FormField
                  label="Distrito"
                  value={district}
                  onChangeText={setDistrict}
                  placeholder="Ej. Panamá"
                  icon="map-outline"
                />
              </View>
              <View style={styles.col}>
                <FormField
                  label="Corregimiento"
                  value={corregimiento}
                  onChangeText={setCorregimiento}
                  placeholder="Ej. Bella Vista"
                  icon="location-outline"
                />
              </View>
            </View>

            {/* Contraseña con mostrar/ocultar y medidor */}
            <FormField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <PasswordStrengthIndicator password={password} />

            <FormField
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repite la contraseña"
              icon="shield-checkmark-outline"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Aceptaciones y Recaptcha */}
            <Pressable
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={styles.checkboxRow}
            >
              <Ionicons
                name={termsAccepted ? "checkbox" : "square-outline"}
                size={22}
                color={termsAccepted ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>
                Acepto los términos y condiciones de servicio y la política de privacidad.
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setNotificationsOptIn(!notificationsOptIn)}
              style={styles.checkboxRow}
            >
              <Ionicons
                name={notificationsOptIn ? "checkbox" : "square-outline"}
                size={22}
                color={notificationsOptIn ? colors.primary : colors.textSecondary}
              />
              <Text style={styles.checkboxLabel}>
                Autorizo recibir notificaciones sobre presupuestos, estados y facturas.
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setIsRobotChecked(!isRobotChecked)}
              style={[styles.checkboxRow, styles.robotRow]}
            >
              <Ionicons
                name={isRobotChecked ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={isRobotChecked ? "#10B981" : colors.textSecondary}
              />
              <View style={styles.robotLabelContainer}>
                <Text style={styles.robotLabelText}>No soy un robot</Text>
                <Text style={styles.robotLabelSub}>Protección de registro automatizado</Text>
              </View>
              <Ionicons name="shield-outline" size={20} color="#10B981" style={{ marginLeft: "auto" }} />
            </Pressable>

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
              onPress={handleRegisterClick}
              disabled={submitting}
              style={({ pressed }) => [
                styles.primaryButton,
                submitting && styles.primaryButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Siguiente paso</Text>
                  <Ionicons
                    name="arrow-forward-outline"
                    size={20}
                    color={colors.textLight}
                  />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Province Selector Modal */}
      {showProvinceModal && (
        <View style={styles.dropdownModalOverlay}>
          <View style={styles.dropdownModalContent}>
            <Text style={styles.dropdownModalTitle}>Selecciona tu Provincia</Text>
            <ScrollView style={{ maxHeight: 300, width: "100%" }}>
              {PROVINCES.map((prov) => (
                <Pressable
                  key={prov}
                  onPress={() => {
                    setProvince(prov);
                    setShowProvinceModal(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>{prov}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowProvinceModal(false)}
              style={styles.dropdownCloseButton}
            >
              <Text style={styles.dropdownCloseButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <View style={styles.otpModalOverlay}>
          <View style={styles.otpModalContent}>
            <View style={styles.otpIconCircle}>
              <Ionicons name="phone-portrait-outline" size={32} color={colors.primary} />
            </View>
            
            <Text style={styles.otpTitle}>Verificación OTP</Text>
            <Text style={styles.otpSubtitle}>
              Hemos enviado un código SMS temporal a tu número {phone}. Utiliza el código de prueba: <Text style={{fontWeight:"900"}}>123456</Text>
            </Text>

            <TextInput
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="Código de 6 dígitos"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.otpInput}
            />

            <View style={styles.otpActions}>
              <Pressable
                onPress={() => setShowOtpModal(false)}
                style={styles.otpCancelButton}
              >
                <Text style={styles.otpCancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmOtp}
                style={styles.otpConfirmButton}
              >
                <Text style={styles.otpConfirmButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightIcon?: string;
  onRightIconPress?: () => void;
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
  rightIcon,
  onRightIconPress,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name={icon as any}
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

        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={12}>
            <Ionicons name={rightIcon as any} size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function translateRegisterError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered")) {
    return "Ya existe una cuenta registrada con ese correo.";
  }

  if (normalized.includes("password should be at least")) {
    return "La contraseña no cumple con la longitud mínima de 8 caracteres.";
  }

  if (normalized.includes("invalid email")) {
    return "El correo electrónico no es válido.";
  }

  return message;
}

function brandNameStyle() {
  return styles.brandName;
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

  row: {
    flexDirection: "row",
    gap: 12,
  },

  col: {
    flex: 1,
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

  formGroup: {
    marginBottom: 16,
  },

  selectButton: {
    minHeight: 54,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectButtonText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },

  selectPlaceholderText: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 14,
  },

  strengthContainer: {
    marginBottom: 16,
    marginTop: -8,
  },

  strengthBarBackground: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },

  strengthBarActive: {
    height: "100%",
    width: "0%",
  },

  strengthText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingVertical: 4,
  },

  checkboxLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  robotRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    padding: 14,
    marginTop: 4,
  },

  robotLabelContainer: {
    flexDirection: "column",
  },

  robotLabelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },

  robotLabelSub: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  approvalNotice: {
    marginTop: 8,
    marginBottom: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.warningSoft,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  approvalNoticeText: {
    flex: 1,
    color: "#7B581C",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
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

  // OTP Modal Styles
  otpModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  otpModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  otpIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryWash,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  otpTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 8,
  },

  otpSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },

  otpInput: {
    width: "100%",
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 20,
  },

  otpActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  otpCancelButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },

  otpCancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },

  otpConfirmButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },

  otpConfirmButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  dropdownModalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 2000,
  },

  dropdownModalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  dropdownModalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 16,
  },

  dropdownItem: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },

  dropdownCloseButton: {
    width: "100%",
    minHeight: 48,
    marginTop: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },

  dropdownCloseButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
});
