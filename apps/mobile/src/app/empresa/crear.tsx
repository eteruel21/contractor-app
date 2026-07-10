import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
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
import { useCompany } from "@/contexts/CompanyContext";

export default function CreateCompanyScreen() {
  const { createCompany } = useCompany();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleCreateCompany() {
    if (name.trim().length < 2) {
      Alert.alert(
        "Nombre requerido",
        "Introduce el nombre de tu empresa.",
      );
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await createCompany({
        name,
        phone,
        email,
      });

      if (error) {
        Alert.alert(
          "No fue posible crear la empresa",
          error,
        );
        return;
      }

      router.replace("/(tabs)" as Href);
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
          <View style={styles.iconBox}>
            <Ionicons
              name="business-outline"
              size={34}
              color={colors.textLight}
            />
          </View>

          <Text style={styles.title}>
            Crea tu empresa
          </Text>

          <Text style={styles.subtitle}>
            Esta será la cuenta principal donde se guardarán clientes,
            proyectos, presupuestos, cálculos y facturas.
          </Text>

          <View style={styles.card}>
            <FormField
              label="Nombre de la empresa"
              value={name}
              onChangeText={setName}
              placeholder="Ej. TCT Services"
              icon="business-outline"
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
              label="Correo de la empresa"
              value={email}
              onChangeText={setEmail}
              placeholder="empresa@correo.com"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Pressable
              onPress={() =>
                void handleCreateCompany()
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
                    Crear empresa
                  </Text>

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
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon:
    | "business-outline"
    | "call-outline"
    | "mail-outline";
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad";
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
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 50,
    justifyContent: "center",
  },

  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },

  card: {
    marginTop: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
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
});