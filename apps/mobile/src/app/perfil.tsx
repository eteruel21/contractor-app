import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

import { colors, layout, radius, shadows } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const { profile, user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const initial = useMemo(
    () => (fullName.trim().charAt(0) || "P").toUpperCase(),
    [fullName],
  );

  const hasChanges =
    fullName.trim() !== (profile?.full_name ?? "").trim() ||
    phone.trim() !== (profile?.phone ?? "").trim();

  const handleSave = async () => {
    if (saving || !hasChanges) return;

    setSaving(true);
    const { error } = await updateProfile({ fullName, phone });
    setSaving(false);

    if (error) {
      Alert.alert("No se pudo guardar", error);
      return;
    }

    Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            hitSlop={8}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textLight} />
          </Pressable>
          <Text style={styles.headerTitle}>Mi perfil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.title}>Información personal</Text>
          <Text style={styles.subtitle}>
            Mantén tus datos actualizados para identificar tu cuenta.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Nombre completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={19} color={colors.textMuted} />
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                maxLength={120}
                onChangeText={setFullName}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={fullName}
              />
            </View>

            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={19} color={colors.textMuted} />
              <TextInput
                autoComplete="tel"
                keyboardType="phone-pad"
                maxLength={30}
                onChangeText={setPhone}
                placeholder="Ej. 6000-0000"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={phone}
              />
            </View>

            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[styles.inputContainer, styles.readOnlyInput]}>
              <Ionicons name="mail-outline" size={19} color={colors.textMuted} />
              <Text style={styles.readOnlyText}>{user?.email ?? "Sin correo"}</Text>
              <Ionicons name="lock-closed" size={15} color={colors.textMuted} />
            </View>
            <Text style={styles.helperText}>
              El correo de acceso no se modifica desde esta pantalla.
            </Text>
          </View>

          <Pressable
            disabled={saving || !hasChanges}
            onPress={() => void handleSave()}
            style={({ pressed }) => [
              styles.saveButton,
              (!hasChanges || saving) && styles.saveButtonDisabled,
              pressed && hasChanges && styles.saveButtonPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.surfaceDark} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={21} color={colors.surfaceDark} />
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.surfaceDark },
  header: {
    height: 62,
    paddingHorizontal: layout.screenPadding,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: colors.textLight, fontSize: 17, fontWeight: "900" },
  headerSpacer: { width: 42 },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: colors.background,
    alignItems: "center",
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  avatarText: { color: colors.surfaceDark, fontSize: 30, fontWeight: "900" },
  title: { marginTop: 18, color: colors.text, fontSize: 24, fontWeight: "900" },
  subtitle: {
    maxWidth: 360,
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  formCard: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    marginTop: 27,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  label: { marginTop: 14, marginBottom: 7, color: colors.text, fontSize: 12, fontWeight: "800" },
  inputContainer: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0 },
  readOnlyInput: { backgroundColor: colors.surfaceAlt },
  readOnlyText: { flex: 1, color: colors.textSecondary, fontSize: 14 },
  helperText: { marginTop: 7, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  saveButton: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    minHeight: 54,
    marginTop: 20,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  saveButtonDisabled: { opacity: 0.45 },
  saveButtonPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.99 }] },
  saveButtonText: { color: colors.surfaceDark, fontSize: 15, fontWeight: "900" },
});
