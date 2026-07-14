import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import { updateCompanyBillingDetails } from "@/services/company-service";

export default function InvoiceSettingsScreen() {
  const { activeCompany, refreshCompanies } = useCompany();

  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeCompany) {
      setLegalName(activeCompany.legal_name ?? "");
      setTaxId(activeCompany.tax_id ?? "");
      setPhone(activeCompany.phone ?? "");
      setEmail(activeCompany.email ?? "");
      setAddress(activeCompany.address ?? "");
      setLogoUrl(activeCompany.logo_url ?? "");
      setInvoicePrefix(activeCompany.invoice_prefix ?? "FAC");
      setTaxRate(String(activeCompany.tax_rate ?? 0));
    }
  }, [activeCompany]);

  const handleSave = async () => {
    if (!activeCompany) return;

    if (!invoicePrefix.trim()) {
      Alert.alert("Prefijo requerido", "Introduce un prefijo para las facturas (ej. FAC).");
      return;
    }

    try {
      setSaving(true);
      const rate = Number(taxRate.replace(",", "."));

      const { error } = await updateCompanyBillingDetails({
        companyId: activeCompany.id,
        legalName: legalName.trim() || null,
        taxId: taxId.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        logoUrl: logoUrl.trim() || null,
        invoicePrefix: invoicePrefix.trim().toUpperCase(),
        taxRate: Number.isFinite(rate) ? rate : 0,
      });

      if (error) {
        Alert.alert("No fue posible guardar los cambios", error);
        return;
      }

      await refreshCompanies();
      Alert.alert("Cambios guardados", "El formato de tu factura ha sido actualizado con éxito.", [
        { text: "Aceptar", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!activeCompany) {
    return (
      <View style={styles.loader}>
        <Text style={styles.loaderText}>Empresa no disponible</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "Diseño de Factura",
        }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Completa estos campos para personalizar el encabezado y detalles del PDF de tus facturas.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Razón Social / Nombre Comercial</Text>
            <TextInput
              value={legalName}
              onChangeText={setLegalName}
              placeholder="Ej. Soluciones Constructivas S.A."
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Identificación Tributaria (RUC / NIT)</Text>
            <TextInput
              value={taxId}
              onChangeText={setTaxId}
              placeholder="Ej. 155-224-899 DV 20"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Dirección física</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Ej. Calle 50, Edificio Pro, Ciudad de Panamá"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.col]}>
              <Text style={styles.label}>Teléfono de contacto</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Ej. +507 399-2811"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>

            <View style={[styles.formGroup, styles.col]}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Ej. facturas@empresa.com"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>URL del Logotipo (imagen JPG/PNG)</Text>
            <TextInput
              value={logoUrl}
              onChangeText={setLogoUrl}
              autoCapitalize="none"
              placeholder="Ej. https://empresa.com/logo.png"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, styles.col]}>
              <Text style={styles.label}>Prefijo de factura</Text>
              <TextInput
                value={invoicePrefix}
                onChangeText={setInvoicePrefix}
                autoCapitalize="characters"
                placeholder="Ej. FAC"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>

            <View style={[styles.formGroup, styles.col]}>
              <Text style={styles.label}>Tasa de ITBMS / Impuesto (%)</Text>
              <TextInput
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                placeholder="Ej. 7"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              saving && styles.disabledButton,
              pressed && styles.pressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color={colors.textLight} />
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  flex: {
    flex: 1,
  },

  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loaderText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  infoBox: {
    marginBottom: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.infoSoft,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    flexDirection: "row",
    gap: 8,
  },

  infoText: {
    flex: 1,
    color: colors.info,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "bold",
  },

  formGroup: {
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  col: {
    flex: 1,
  },

  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 13,
  },

  saveButton: {
    minHeight: 52,
    marginTop: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.78,
  },
});
