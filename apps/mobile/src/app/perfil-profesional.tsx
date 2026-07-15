import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useReducer, useState } from "react";
import {
  ActivityIndicator,
  Image,
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

import { CONTRACTOR_CATEGORIES } from "@/constants/contractor-categories";
import { colors, layout, radius } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { showAlert } from "@/utils/alert";

type FormState = {
  // Paso 1: Info General
  businessName: string;
  idDocument: string;
  taxId: string;
  taxDv: string;
  primaryCategory: string;
  specialties: string;
  experienceYears: string;
  workAreas: string;
  availability: string;
  preferredContactMethod: string;
  emitsInvoice: boolean;
  hasTransport: boolean;
  workMode: string;
  professionalDescription: string;
  // Paso 2: Multimedia
  avatarUrl: string;
  companyLogoUrl: string;
  portfolioUrls: string;
  certifications: string;
  // Paso 3: Documentos
  docIdUrl: string;
  docOperationNoticeUrl: string;
  docTechnicalCertsUrls: string;
  docReferencesUrl: string;
  docAddressProofUrl: string;
};

type FormAction = {
  field: keyof FormState;
  value: string | boolean;
};

const INITIAL_FORM: FormState = {
  businessName: "",
  idDocument: "",
  taxId: "",
  taxDv: "",
  primaryCategory: "",
  specialties: "",
  experienceYears: "",
  workAreas: "",
  availability: "Inmediata",
  preferredContactMethod: "WhatsApp",
  emitsInvoice: false,
  hasTransport: false,
  workMode: "solo",
  professionalDescription: "",
  avatarUrl: "",
  companyLogoUrl: "",
  portfolioUrls: "",
  certifications: "",
  docIdUrl: "",
  docOperationNoticeUrl: "",
  docTechnicalCertsUrls: "",
  docReferencesUrl: "",
  docAddressProofUrl: "",
};

function formReducer(state: FormState, action: FormAction): FormState {
  return { ...state, [action.field]: action.value };
}

export default function ProfessionalProfileScreen() {
  const { profile, updateContractorProfile, signOut } = useAuth();

  // Paso actual (1: Info General, 2: Multimedia, 3: Documentos de Aprobación)
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM);

  const setField = (field: keyof FormState) =>
    (value: string | boolean) =>
      dispatch({ field, value });

  const handleSelectCategory = () => {
    setShowCategoryModal(true);
  };

  const handleUploadImage = (setter: (val: string) => void, title: string) => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setter(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      showAlert(
        "Cargar Archivo",
        `Para subir tu archivo para "${title}", abre la aplicación en tu navegador web o introduce una URL válida.`
      );
    }
  };

  async function handleSaveProfile() {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (!form.primaryCategory) {
      showAlert("Categoría obligatoria", "Por favor selecciona tu categoría principal de trabajo.");
      return;
    }

    if (!form.idDocument.trim()) {
      showAlert("Identificación obligatoria", "Introduce tu Cédula o número de Pasaporte.");
      return;
    }

    try {
      setSaving(true);

      const parsedSpecialties = form.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedWorkAreas = form.workAreas
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const parsedPortfolio = form.portfolioUrls
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const parsedCertifications = form.certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const result = await updateContractorProfile({
        businessName: form.businessName.trim() || null,
        idDocument: form.idDocument.trim(),
        taxId: form.taxId.trim() || null,
        taxDv: form.taxDv.trim() || null,
        primaryCategory: form.primaryCategory,
        specialties: parsedSpecialties.length ? parsedSpecialties : null,
        experienceYears: parseInt(form.experienceYears) || null,
        workAreas: parsedWorkAreas.length ? parsedWorkAreas : null,
        professionalDescription: form.professionalDescription.trim() || null,
        companyLogoUrl: form.companyLogoUrl || null,
        portfolioUrls: parsedPortfolio.length ? parsedPortfolio : null,
        certifications: parsedCertifications.length ? parsedCertifications : null,
        availability: form.availability,
        preferredContactMethod: form.preferredContactMethod,
        emitsInvoice: form.emitsInvoice,
        hasTransport: form.hasTransport,
        workMode: form.workMode,
        docIdUrl: form.docIdUrl || null,
        docOperationNoticeUrl: form.docOperationNoticeUrl || null,
        docTechnicalCertsUrls: null,
        docReferencesUrl: form.docReferencesUrl || null,
        docAddressProofUrl: form.docAddressProofUrl || null,
      });

      if (result.error) {
        showAlert("Error al actualizar perfil", result.error);
        return;
      }

      showAlert(
        "Perfil enviado",
        "Tu información profesional ha sido guardada. Los administradores revisarán tus datos y documentos para autorizar tu acceso.",
        [
          {
            text: "Entendido",
            onPress: () => router.replace("/pendiente"),
          },
        ]
      );
    } catch (e: any) {
      showAlert("Error", e.message || "Error al actualizar perfil.");
    } finally {
      setSaving(false);
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Paso {currentStep} de 3</Text>
            <Text style={styles.headerSubtitle}>
              {currentStep === 1
                ? "Información Comercial y General"
                : currentStep === 2
                ? "Medios Visuales e Imágenes"
                : "Documentos de Aprobación Oficial"}
            </Text>

            <Pressable onPress={() => signOut()} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={16} color="#DC2626" />
              <Text style={styles.logoutText}>Salir</Text>
            </Pressable>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressIndicator, { width: `${(currentStep / 3) * 100}%` }]} />
          </View>

          {/* Step 1: Info General */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Información de Contratista</Text>
              
              <FormField
                label="Nombre Comercial / Razón Social"
                value={form.businessName}
                onChangeText={setField("businessName")}
                placeholder="Ej. Construcciones Generales S.A."
                icon="business-outline"
              />

              <View style={styles.row}>
                <View style={[styles.col, { flex: 2 }]}>
                  <FormField
                    label="Cédula o Pasaporte *"
                    value={form.idDocument}
                    onChangeText={setField("idDocument")}
                    placeholder="Ej. 8-999-999"
                    icon="card-outline"
                  />
                </View>
                <View style={styles.col}>
                  <FormField
                    label="Años Experiencia"
                    value={form.experienceYears}
                    onChangeText={setField("experienceYears")}
                    placeholder="Ej. 5"
                    icon="ribbon-outline"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.col, { flex: 3 }]}>
                  <FormField
                    label="RUC de la empresa (si aplica)"
                    value={form.taxId}
                    onChangeText={setField("taxId")}
                    placeholder="Ej. 1234567-1-88"
                    icon="shield-outline"
                  />
                </View>
                <View style={styles.col}>
                  <FormField
                    label="D.V."
                    value={form.taxDv}
                    onChangeText={setField("taxDv")}
                    placeholder="00"
                    icon="key-outline"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Categoría Principal de Trabajo *</Text>
                <Pressable onPress={handleSelectCategory} style={styles.selectButton}>
                  <Text style={form.primaryCategory ? styles.selectButtonText : styles.selectPlaceholderText}>
                    {form.primaryCategory || "Selecciona tu especialidad principal"}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              <FormField
                label="Especialidades adicionales (separadas por comas)"
                value={form.specialties}
                onChangeText={setField("specialties")}
                placeholder="Ej. Soldadura, Techos, Albañilería"
                icon="options-outline"
              />

              <FormField
                label="Áreas de Cobertura / Trabajo (separadas por comas)"
                value={form.workAreas}
                onChangeText={setField("workAreas")}
                placeholder="Ej. Panamá Centro, Chorrera, San Miguelito"
                icon="map-outline"
              />

              <FormField
                label="Disponibilidad Horaria"
                value={form.availability}
                onChangeText={setField("availability")}
                placeholder="Ej. Lunes a Sábados 8:00 AM - 5:00 PM"
                icon="time-outline"
              />

              <FormField
                label="Método de contacto preferido"
                value={form.preferredContactMethod}
                onChangeText={setField("preferredContactMethod")}
                placeholder="Ej. WhatsApp o Llamada"
                icon="chatbox-ellipses-outline"
              />

              {/* Switches */}
              <View style={styles.switchesBlock}>
                <Pressable
                  onPress={() => setField("emitsInvoice")(!form.emitsInvoice)}
                  style={styles.switchRow}
                >
                  <Ionicons
                    name={form.emitsInvoice ? "checkbox" : "square-outline"}
                    size={22}
                    color={form.emitsInvoice ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.switchLabel}>¿Emite factura fiscal?</Text>
                </Pressable>

                <Pressable
                  onPress={() => setField("hasTransport")(!form.hasTransport)}
                  style={styles.switchRow}
                >
                  <Ionicons
                    name={form.hasTransport ? "checkbox" : "square-outline"}
                    size={22}
                    color={form.hasTransport ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.switchLabel}>¿Cuenta con vehículo propio o transporte?</Text>
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Modalidad de Trabajo</Text>
                <View style={styles.workModeSelector}>
                  <Pressable
                    onPress={() => setField("workMode")("solo")}
                    style={[styles.workModeButton, form.workMode === "solo" && styles.workModeActive]}
                  >
                    <Text style={[styles.workModeText, form.workMode === "solo" && styles.workModeTextActive]}>
                      Trabajo Solo
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setField("workMode")("crew")}
                    style={[styles.workModeButton, form.workMode === "crew" && styles.workModeActive]}
                  >
                    <Text style={[styles.workModeText, form.workMode === "crew" && styles.workModeTextActive]}>
                      Tengo Cuadrilla
                    </Text>
                  </Pressable>
                </View>
              </View>

              <FormField
                label="Descripción Profesional / Perfil"
                value={form.professionalDescription}
                onChangeText={setField("professionalDescription")}
                placeholder="Escribe brevemente sobre tu trayectoria y servicios..."
                icon="document-text-outline"
              />
            </View>
          )}

          {/* Step 2: Multimedia */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Logo, Foto y Portafolio</Text>

              {/* Foto de Perfil */}
              <View style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>Foto de Perfil Profesional</Text>
                {form.avatarUrl ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: form.avatarUrl }} style={styles.avatarPreview} />
                    <Pressable onPress={() => setField("avatarUrl")('')} style={styles.clearImageButton}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadImage(setField("avatarUrl") as (v: string) => void, "Foto de Perfil")}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="camera-outline" size={24} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Seleccionar Foto de Perfil</Text>
                  </Pressable>
                )}
              </View>

              {/* Logo de Empresa */}
              <View style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>Logotipo de Empresa (opcional)</Text>
                {form.companyLogoUrl ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: form.companyLogoUrl }} style={styles.logoPreview} resizeMode="contain" />
                    <Pressable onPress={() => setField("companyLogoUrl")('')} style={styles.clearImageButton}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadImage(setField("companyLogoUrl") as (v: string) => void, "Logo de Empresa")}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="image-outline" size={24} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Seleccionar Logo de Empresa</Text>
                  </Pressable>
                )}
              </View>

              <FormField
                label="Licencias / Certificaciones (URL o texto descriptivo)"
                value={form.certifications}
                onChangeText={setField("certifications")}
                placeholder="Ej. ID de electricista JT, Certificación CAPAC"
                icon="ribbon-outline"
              />

              <FormField
                label="Enlaces a fotos de tus trabajos (separados por comas)"
                value={form.portfolioUrls}
                onChangeText={setField("portfolioUrls")}
                placeholder="Ej. https://tusfotos.com/1.jpg, https://tusfotos.com/2.jpg"
                icon="images-outline"
              />
            </View>
          )}

          {/* Step 3: Documentos de Aprobación */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Soportes e Identificaciones Oficiales</Text>
              <Text style={styles.stepDescription}>
                Adjunta copias o fotos de tus documentos legales. Esto nos ayuda a certificar tu cuenta y darte prioridad con los clientes.
              </Text>

              {/* Foto de Cédula */}
              <View style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>Foto de Cédula o Pasaporte *</Text>
                {form.docIdUrl ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: form.docIdUrl }} style={styles.docImagePreview} />
                    <Pressable onPress={() => setField("docIdUrl")('')} style={styles.clearImageButton}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadImage(setField("docIdUrl") as (v: string) => void, "Foto de Cédula")}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="document-attach-outline" size={24} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Subir Copia de Identificación</Text>
                  </Pressable>
                )}
              </View>

              {/* Aviso de Operación */}
              <View style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>Aviso de Operación (si aplica)</Text>
                {form.docOperationNoticeUrl ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: form.docOperationNoticeUrl }} style={styles.docImagePreview} />
                    <Pressable onPress={() => setField("docOperationNoticeUrl")('')} style={styles.clearImageButton}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadImage(setField("docOperationNoticeUrl") as (v: string) => void, "Aviso de Operación")}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Subir Aviso de Operación</Text>
                  </Pressable>
                )}
              </View>

              {/* Referencias comerciales */}
              <View style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>Referencias Comerciales o de Obras</Text>
                {form.docReferencesUrl ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: form.docReferencesUrl }} style={styles.docImagePreview} />
                    <Pressable onPress={() => setField("docReferencesUrl")('')} style={styles.clearImageButton}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadImage(setField("docReferencesUrl") as (v: string) => void, "Referencias Comerciales")}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="people-outline" size={24} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Subir Documento de Referencia</Text>
                  </Pressable>
                )}
              </View>

              {/* Comprobante de Domicilio */}
              <View style={styles.uploadCard}>
                <Text style={styles.uploadLabel}>Comprobante de Domicilio (Opcional)</Text>
                {form.docAddressProofUrl ? (
                  <View style={styles.previewBox}>
                    <Image source={{ uri: form.docAddressProofUrl }} style={styles.docImagePreview} />
                    <Pressable onPress={() => setField("docAddressProofUrl")('')} style={styles.clearImageButton}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleUploadImage(setField("docAddressProofUrl") as (v: string) => void, "Comprobante de Domicilio")}
                    style={styles.uploadButton}
                  >
                    <Ionicons name="home-outline" size={24} color={colors.primary} />
                    <Text style={styles.uploadButtonText}>Subir Recibo de Domicilio</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Acciones */}
          <View style={styles.actions}>
            {currentStep > 1 && (
              <Pressable
                onPress={() => setCurrentStep(currentStep - 1)}
                style={styles.backStepButton}
              >
                <Ionicons name="arrow-back-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.backStepText}>Atrás</Text>
              </Pressable>
            )}

            <Pressable
              onPress={handleSaveProfile}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                saving && styles.saveButtonDisabled,
                pressed && styles.pressed,
                { flex: currentStep > 1 ? 2 : 1 },
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <>
                  <Text style={styles.saveButtonText}>
                    {currentStep < 3 ? "Siguiente" : "Guardar y Enviar"}
                  </Text>
                  <Ionicons
                    name={currentStep < 3 ? "arrow-forward-outline" : "checkmark-circle-outline"}
                    size={20}
                    color={colors.textLight}
                  />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selector de Categoría Modal */}
      {showCategoryModal && (
        <View style={styles.dropdownModalOverlay}>
          <View style={styles.dropdownModalContent}>
            <Text style={styles.dropdownModalTitle}>Selecciona tu Categoría Principal</Text>
            <ScrollView style={{ maxHeight: 300, width: "100%" }}>
              {CONTRACTOR_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => {
                    setField("primaryCategory")(cat);
                    setShowCategoryModal(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownItemText}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowCategoryModal(false)}
              style={styles.dropdownCloseButton}
            >
              <Text style={styles.dropdownCloseButtonText}>Cancelar</Text>
            </Pressable>
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
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = "default",
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <Ionicons name={icon as any} size={18} color={colors.textSecondary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
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
    backgroundColor: "#F8FAFC",
  },

  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  headerTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },

  headerSubtitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginTop: 2,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },

  logoutText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 14,
  },

  progressIndicator: {
    height: "100%",
    backgroundColor: colors.primary,
  },

  stepContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },

  stepTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 14,
  },

  stepDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 18,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    marginBottom: 6,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  inputContainer: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  input: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  col: {
    flex: 1,
  },

  formGroup: {
    marginBottom: 15,
  },

  selectButton: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectButtonText: {
    color: colors.text,
    fontSize: 13,
  },

  selectPlaceholderText: {
    color: "#94A3B8",
    fontSize: 13,
  },

  switchesBlock: {
    marginVertical: 12,
    gap: 12,
  },

  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  switchLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  workModeSelector: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },

  workModeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  workModeActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryWash,
  },

  workModeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },

  workModeTextActive: {
    color: colors.primary,
  },

  uploadCard: {
    padding: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.md,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
  },

  uploadLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10,
  },

  uploadButton: {
    minHeight: 50,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  uploadButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  previewBox: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  logoPreview: {
    width: 150,
    height: 60,
    borderRadius: radius.sm,
  },

  docImagePreview: {
    width: "100%",
    height: 150,
    borderRadius: radius.md,
  },

  clearImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  backStepButton: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  backStepText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },

  saveButton: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "900",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
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
