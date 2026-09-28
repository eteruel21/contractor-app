import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { colors, layout, radius } from "@/constants/theme";
import {
  absoluteProfileResourceUrl,
  type UserProfileDetails
} from "@/services/profile-details-service";

type Props = {
  details: UserProfileDetails | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const roleLabels = {
  super_admin: "Superadministrador",
  contractor: "Contratista",
  client: "Cliente"
} as const;

const statusLabels = {
  email_pending: "Correo pendiente",
  pending_approval: "Pendiente de aprobación",
  active: "Activo",
  suspended: "Suspendido",
  deactivated: "Desactivado"
} as const;

function visible(value: unknown): string {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "No indicado";
  }

  return String(value);
}

function formatDate(value: string | null): string {
  if (!value) return "No aplica";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No indicado";

  return new Intl.DateTimeFormat("es-PA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "Tamaño no disponible";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

async function openSafeUrl(value: string, label: string) {
  const url = absoluteProfileResourceUrl(value);

  if (!url) {
    Alert.alert("Enlace no válido", `No fue posible abrir ${label}.`);
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error("El dispositivo no admite este enlace.");
    await Linking.openURL(url);
  } catch (error) {
    Alert.alert(
      "No se pudo abrir",
      error instanceof Error ? error.message : `No fue posible abrir ${label}.`
    );
  }
}

function Section({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Value({ label, value }: { label: string; value: unknown }) {
  return (
    <View style={styles.value}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text selectable style={styles.valueText}>{visible(value)}</Text>
    </View>
  );
}

function ListValue({ label, values }: { label: string; values: string[] }) {
  return <Value label={label} value={values.length ? values.join(", ") : null} />;
}

function Empty({ children }: { children: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={22} color={colors.textMuted} />
      <Text style={styles.emptyText}>{children}</Text>
    </View>
  );
}

export function ProfileOverview({ details, loading, error, onRetry }: Props) {
  if (loading) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Cargando tu perfil completo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorCard}>
        <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable onPress={onRetry} style={styles.retryButton}>
          <Ionicons name="refresh" size={17} color={colors.surfaceDark} />
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>No hay información de perfil disponible.</Text>
      </View>
    );
  }

  const location = [
    details.location.province,
    details.location.district,
    details.location.corregimiento
  ].filter(Boolean).join(", ");

  return (
    <View style={styles.container}>
      <Text style={styles.overviewTitle}>Perfil completo</Text>
      <Text style={styles.overviewSubtitle}>
        Esta información y estas subidas pertenecen únicamente a tu cuenta.
      </Text>

      <Section title="Cuenta y estado">
        <View style={styles.grid}>
          <Value label="Tipo de cuenta" value={roleLabels[details.role]} />
          <Value label="Estado" value={statusLabels[details.status]} />
          <Value label="Ubicación" value={location} />
          <Value label="Registro" value={formatDate(details.createdAt)} />
          <Value label="Última actualización" value={formatDate(details.updatedAt)} />
          <Value label="Aprobación" value={formatDate(details.approvedAt)} />
          <Value
            label="Términos aceptados"
            value={details.preferences.termsAccepted ? "Sí" : "No"}
          />
          <Value
            label="Notificaciones"
            value={details.preferences.notificationsOptIn ? "Activadas" : "Desactivadas"}
          />
        </View>
      </Section>

      {details.professional && (
        <Section title="Información profesional">
          <View style={styles.grid}>
            <Value label="Nombre comercial" value={details.professional.businessName} />
            <Value label="Cédula / Pasaporte" value={details.professional.idDocument} />
            <Value label="RUC" value={details.professional.taxId} />
            <Value label="DV" value={details.professional.taxDv} />
            <Value label="Categoría principal" value={details.professional.primaryCategory} />
            <Value label="Años de experiencia" value={details.professional.experienceYears} />
            <Value label="Disponibilidad" value={details.professional.availability} />
            <Value label="Contacto preferido" value={details.professional.preferredContactMethod} />
            <Value label="Modalidad" value={details.professional.workMode} />
            <Value label="Emite factura" value={details.professional.emitsInvoice ? "Sí" : "No"} />
            <Value label="Transporte propio" value={details.professional.hasTransport ? "Sí" : "No"} />
          </View>

          <ListValue label="Especialidades" values={details.professional.specialties} />
          <ListValue label="Áreas de trabajo" values={details.professional.workAreas} />
          <ListValue label="Certificaciones" values={details.professional.certifications} />
          <Value label="Descripción profesional" value={details.professional.professionalDescription} />

          {(details.professional.portfolioUrls.length > 0 ||
            details.professional.technicalCertificationUrls.length > 0) && (
            <View style={styles.links}>
              {details.professional.portfolioUrls.map((url, index) => (
                <Pressable
                  key={`portfolio-${index}-${url}`}
                  onPress={() => void openSafeUrl(url, "el enlace del portafolio")}
                  style={styles.linkButton}
                >
                  <Ionicons name="open-outline" size={17} color={colors.primary} />
                  <Text style={styles.linkText}>Portafolio {index + 1}</Text>
                </Pressable>
              ))}
              {details.professional.technicalCertificationUrls.map((url, index) => (
                <Pressable
                  key={`certificate-${index}-${url}`}
                  onPress={() => void openSafeUrl(url, "la certificación")}
                  style={styles.linkButton}
                >
                  <Ionicons name="ribbon-outline" size={17} color={colors.primary} />
                  <Text style={styles.linkText}>Certificación {index + 1}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Section>
      )}

      <Section title="Empresas y vinculaciones">
        {details.associations.companies.length === 0 &&
        details.associations.linkedClients.length === 0 ? (
          <Empty>No hay empresas o perfiles de cliente vinculados.</Empty>
        ) : (
          <View style={styles.resourceList}>
            {details.associations.companies.map((company) => (
              <View key={`company-${company.id}`} style={styles.resourceRow}>
                <Ionicons name="business-outline" size={21} color={colors.primary} />
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>{company.name}</Text>
                  <Text style={styles.resourceMeta}>
                    {company.role || "Miembro"} · {company.active ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
            ))}
            {details.associations.linkedClients.map((client) => (
              <View key={`client-${client.id}`} style={styles.resourceRow}>
                <Ionicons name="person-circle-outline" size={21} color={colors.primary} />
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>{client.displayName}</Text>
                  <Text style={styles.resourceMeta}>
                    Cliente en {client.companyName} · {client.active ? "Activo" : "Inactivo"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Section>

      <Section title="Documentos subidos">
        {details.resources.profileDocuments.length === 0 ? (
          <Empty>No has subido documentos de perfil.</Empty>
        ) : (
          <View style={styles.resourceList}>
            {details.resources.profileDocuments.map((document) => (
              <Pressable
                key={document.id}
                onPress={() => void openSafeUrl(document.url, document.label)}
                style={styles.resourceRow}
              >
                <Ionicons name="document-attach-outline" size={22} color={colors.primary} />
                <View style={styles.resourceText}>
                  <Text style={styles.resourceTitle}>{document.label}</Text>
                  <Text style={styles.resourceMeta}>Abrir documento</Text>
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </Section>

      <Section title="Fotos de proyectos subidas">
        {details.resources.projectPhotos.length === 0 ? (
          <Empty>No has subido fotos de proyectos.</Empty>
        ) : (
          <View style={styles.resourceList}>
            {details.resources.projectPhotos.map((photo) => (
              <Pressable
                key={photo.id}
                onPress={() => void openSafeUrl(photo.url, photo.fileName)}
                style={styles.resourceRow}
              >
                <Ionicons name="image-outline" size={22} color={colors.primary} />
                <View style={styles.resourceText}>
                  <Text numberOfLines={1} style={styles.resourceTitle}>{photo.fileName}</Text>
                  <Text style={styles.resourceMeta}>
                    {photo.projectName} · {photo.companyName}
                  </Text>
                  <Text style={styles.resourceMeta}>
                    {formatBytes(photo.fileSize)} · {formatDate(photo.createdAt)}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        )}
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: layout.maxContentWidth, marginTop: 28, gap: 14 },
  overviewTitle: { color: colors.text, fontSize: 22, fontWeight: "900", textAlign: "center" },
  overviewSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: "center" },
  section: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, gap: 11 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "900" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  value: { minWidth: 145, flexGrow: 1, flexBasis: "45%", padding: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, gap: 5 },
  valueLabel: { color: colors.textMuted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.5 },
  valueText: { color: colors.text, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  links: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  linkButton: { minHeight: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, flexDirection: "row", alignItems: "center", gap: 7 },
  linkText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  resourceList: { gap: 9 },
  resourceRow: { minHeight: 58, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, flexDirection: "row", alignItems: "center", gap: 10 },
  resourceText: { flex: 1, minWidth: 0 },
  resourceTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  resourceMeta: { marginTop: 3, color: colors.textMuted, fontSize: 11, lineHeight: 15 },
  emptyState: { minHeight: 88, alignItems: "center", justifyContent: "center", gap: 7 },
  emptyText: { color: colors.textMuted, fontSize: 12, textAlign: "center" },
  stateCard: { width: "100%", minHeight: 130, marginTop: 28, padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", gap: 10 },
  stateText: { color: colors.textSecondary, fontSize: 13, textAlign: "center" },
  errorCard: { width: "100%", marginTop: 28, padding: 18, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: "center", gap: 10 },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 19, textAlign: "center" },
  retryButton: { minHeight: 42, paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", gap: 8 },
  retryText: { color: colors.surfaceDark, fontSize: 13, fontWeight: "900" }
});
