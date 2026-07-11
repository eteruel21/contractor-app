import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  Stack,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
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
import {
  addClientAddress,
  deleteClientAddress,
  getClientById,
  setPrimaryClientAddress,
  updateClient,
  updateClientAddress,
} from "@/services/client-service";
import {
  createProject,
  listProjectsByClient,
} from "@/services/project-service";
import type {
  ClientAddress,
  ClientWithDetails,
} from "@/types/client";
import { getClientDisplayName } from "@/types/client";
import type { Project } from "@/types/project";
import { getProjectStatusLabel } from "@/types/project";

export default function ClientDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const clientId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const { activeCompany } = useCompany();

  const [client, setClient] =
    useState<ClientWithDetails | null>(null);
  const [projects, setProjects] = useState<
    Project[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [editModalVisible, setEditModalVisible] =
    useState(false);
  const [editingAddress, setEditingAddress] =
    useState<ClientAddress | null>(null);
  const [addressModalVisible, setAddressModalVisible] =
    useState(false);
  const [projectModalVisible, setProjectModalVisible] =
    useState(false);

  const primaryAddress = useMemo(() => {
    if (!client) return null;

    return (
      client.addresses.find(
        (address) => address.is_primary,
      ) ?? client.addresses[0] ?? null
    );
  }, [client]);

  const loadData = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany || !clientId) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [clientResult, projectsResult] =
        await Promise.all([
          getClientById(activeCompany.id, clientId),
          listProjectsByClient(
            activeCompany.id,
            clientId,
          ),
        ]);

      if (clientResult.error) {
        Alert.alert(
          "No fue posible cargar el cliente",
          clientResult.error,
        );
      } else {
        setClient(clientResult.client);
      }

      if (projectsResult.error) {
        Alert.alert(
          "No fue posible cargar los proyectos",
          projectsResult.error,
        );
      } else {
        setProjects(projectsResult.projects);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany, clientId],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleDeleteAddress(address: ClientAddress) {
    Alert.alert(
      "Eliminar dirección",
      `¿Deseas eliminar “${address.label}”?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => void confirmDeleteAddress(address),
        },
      ],
    );
  }

  async function confirmDeleteAddress(
    address: ClientAddress,
  ) {
    if (!activeCompany || !client) return;

    const { error } = await deleteClientAddress({
      companyId: activeCompany.id,
      clientId: client.id,
      addressId: address.id,
    });

    if (error) {
      Alert.alert(
        "No fue posible eliminar la dirección",
        error,
      );
      return;
    }

    await loadData(true);
  }

  async function handleSetPrimaryAddress(
    address: ClientAddress,
  ) {
    if (!activeCompany || !client) return;

    const { error } =
      await setPrimaryClientAddress({
        companyId: activeCompany.id,
        clientId: client.id,
        addressId: address.id,
      });

    if (error) {
      Alert.alert(
        "No fue posible cambiar la dirección principal",
        error,
      );
      return;
    }

    await loadData(true);
  }

  if (!activeCompany || !clientId) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Cliente no disponible
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Cliente no encontrado
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: getClientDisplayName(client),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadData(true)
            }
          />
        }
      >
        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Ionicons
              name={
                client.client_type === "business"
                  ? "business-outline"
                  : "person-outline"
              }
              size={28}
              color={colors.textLight}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.clientName}>
              {getClientDisplayName(client)}
            </Text>

            <Text style={styles.clientType}>
              {client.client_type === "business"
                ? "Cliente empresa"
                : "Cliente persona"}
            </Text>
          </View>
        </View>

        <InfoSection
          title="Información"
          actionLabel="Editar"
          onAction={() => setEditModalVisible(true)}
        >
          <InfoRow
            icon="call-outline"
            label="Teléfono"
            value={client.phone || "Sin teléfono"}
          />

          <InfoRow
            icon="mail-outline"
            label="Correo"
            value={client.email || "Sin correo"}
          />

          <InfoRow
            icon="card-outline"
            label="Documento"
            value={
              client.document_number ||
              "Sin documento"
            }
          />

          <InfoRow
            icon="document-text-outline"
            label="Notas"
            value={client.notes || "Sin notas"}
          />
        </InfoSection>

        <InfoSection
          title="Direcciones"
          actionLabel="Agregar"
          onAction={() =>
            setAddressModalVisible(true)
          }
        >
          {client.addresses.length === 0 ? (
            <EmptySmall text="Este cliente no tiene direcciones." />
          ) : (
            client.addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onMakePrimary={() =>
                  void handleSetPrimaryAddress(address)
                }
                onEdit={() => setEditingAddress(address)}
                onDelete={() => handleDeleteAddress(address)}
              />
            ))
          )}
        </InfoSection>

        <InfoSection
          title="Proyectos"
          actionLabel="Crear"
          onAction={() =>
            setProjectModalVisible(true)
          }
        >
          {projects.length === 0 ? (
            <EmptySmall text="Este cliente todavía no tiene proyectos." />
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() =>
                  router.push({
                    pathname: "/proyectos/[id]",
                    params: {
                      id: project.id,
                    },
                  } as Href)
                }
              />
            ))
          )}
        </InfoSection>
      </ScrollView>

      <EditClientModal
        visible={editModalVisible}
        companyId={activeCompany.id}
        client={client}
        onClose={() => setEditModalVisible(false)}
        onUpdated={() => void loadData(true)}
      />

      <EditAddressModal
        visible={Boolean(editingAddress)}
        companyId={activeCompany.id}
        clientId={client.id}
        address={editingAddress}
        onClose={() => setEditingAddress(null)}
        onUpdated={() => void loadData(true)}
      />

      <AddAddressModal
        visible={addressModalVisible}
        companyId={activeCompany.id}
        clientId={client.id}
        onClose={() =>
          setAddressModalVisible(false)
        }
        onCreated={() => void loadData(true)}
      />

      <CreateProjectModal
        visible={projectModalVisible}
        companyId={activeCompany.id}
        clientId={client.id}
        addressId={primaryAddress?.id ?? null}
        onClose={() =>
          setProjectModalVisible(false)
        }
        onCreated={() => void loadData(true)}
      />
    </SafeAreaView>
  );
}

function InfoSection({
  title,
  children,
  actionLabel,
  onAction,
}: {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {actionLabel && onAction ? (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => [
              styles.sectionAction,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.sectionActionText}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon:
    | "call-outline"
    | "mail-outline"
    | "card-outline"
    | "document-text-outline";
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={20}
        color={colors.textSecondary}
      />

      <View style={styles.infoTextBox}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function AddressCard({
  address,
  onMakePrimary,
  onEdit,
  onDelete,
}: {
  address: ClientAddress;
  onMakePrimary: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.addressCard}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>
          {address.label}
        </Text>

        {address.is_primary ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Principal
            </Text>
          </View>
        ) : (
          <Pressable onPress={onMakePrimary}>
            <Text style={styles.linkText}>
              Hacer principal
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.cardBody}>
        {address.address}
      </Text>

      {address.reference ? (
        <Text style={styles.cardMuted}>
          Ref: {address.reference}
        </Text>
      ) : null}

      <View style={styles.addressActions}>
        <Pressable onPress={onEdit}>
          <Text style={styles.linkText}>Editar</Text>
        </Pressable>

        <Pressable onPress={onDelete}>
          <Text style={styles.dangerText}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: Project;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.projectCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTitle}>
          {project.name}
        </Text>

        <View style={styles.badgeDark}>
          <Text style={styles.badgeDarkText}>
            {project.project_code || "Sin código"}
          </Text>
        </View>
      </View>

      <Text style={styles.cardMuted}>
        Estado:{" "}
        {getProjectStatusLabel(project.status)}
      </Text>

      {project.description ? (
        <Text style={styles.cardBody}>
          {project.description}
        </Text>
      ) : null}

      <View style={styles.openRow}>
        <Text style={styles.openText}>
          Ver proyecto
        </Text>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.primary}
        />
      </View>
    </Pressable>
  );
}

function EmptySmall({ text }: { text: string }) {
  return (
    <View style={styles.emptySmall}>
      <Text style={styles.emptySmallText}>
        {text}
      </Text>
    </View>
  );
}

function EditClientModal({
  visible,
  companyId,
  client,
  onClose,
  onUpdated,
}: {
  visible: boolean;
  companyId: string;
  client: ClientWithDetails;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setFirstName(client.first_name ?? "");
    setLastName(client.last_name ?? "");
    setBusinessName(client.business_name ?? "");
    setDocumentType(client.document_type ?? "");
    setDocumentNumber(client.document_number ?? "");
    setEmail(client.email ?? "");
    setPhone(client.phone ?? "");
    setSecondaryPhone(client.secondary_phone ?? "");
    setNotes(client.notes ?? "");
  }, [client, visible]);

  async function handleSave() {
    try {
      setSubmitting(true);

      const { error } = await updateClient({
        companyId,
        clientId: client.id,
        clientType: client.client_type,
        firstName,
        lastName,
        businessName,
        documentType,
        documentNumber,
        email,
        phone,
        secondaryPhone,
        notes,
      });

      if (error) {
        Alert.alert(
          "No fue posible actualizar el cliente",
          error,
        );
        return;
      }

      onClose();
      onUpdated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormModal
      visible={visible}
      title="Editar cliente"
      onClose={onClose}
      onSave={() => void handleSave()}
      submitting={submitting}
    >
      {client.client_type === "business" ? (
        <FormField
          label="Nombre de la empresa"
          value={businessName}
          onChangeText={setBusinessName}
          placeholder="Nombre comercial"
        />
      ) : (
        <>
          <FormField
            label="Nombre"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nombre"
          />
          <FormField
            label="Apellido"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Apellido"
          />
        </>
      )}

      <FormField
        label="Tipo de documento"
        value={documentType}
        onChangeText={setDocumentType}
        placeholder="Cédula, RUC, pasaporte..."
      />
      <FormField
        label="Número de documento"
        value={documentNumber}
        onChangeText={setDocumentNumber}
        placeholder="Número"
      />
      <FormField
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        placeholder="Teléfono principal"
      />
      <FormField
        label="Teléfono secundario"
        value={secondaryPhone}
        onChangeText={setSecondaryPhone}
        placeholder="Opcional"
      />
      <FormField
        label="Correo"
        value={email}
        onChangeText={setEmail}
        placeholder="correo@ejemplo.com"
      />
      <FormField
        label="Notas"
        value={notes}
        onChangeText={setNotes}
        placeholder="Información adicional"
        multiline
      />
    </FormModal>
  );
}

function EditAddressModal({
  visible,
  companyId,
  clientId,
  address,
  onClose,
  onUpdated,
}: {
  visible: boolean;
  companyId: string;
  clientId: string;
  address: ClientAddress | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [label, setLabel] = useState("");
  const [addressText, setAddressText] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [township, setTownship] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!address || !visible) return;

    setLabel(address.label);
    setAddressText(address.address);
    setProvince(address.province ?? "");
    setDistrict(address.district ?? "");
    setTownship(address.township ?? "");
    setReference(address.reference ?? "");
  }, [address, visible]);

  async function handleSave() {
    if (!address) return;

    try {
      setSubmitting(true);

      const { error } = await updateClientAddress({
        companyId,
        clientId,
        addressId: address.id,
        label,
        address: addressText,
        province,
        district,
        township,
        reference,
        isPrimary: address.is_primary,
      });

      if (error) {
        Alert.alert(
          "No fue posible actualizar la dirección",
          error,
        );
        return;
      }

      onClose();
      onUpdated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormModal
      visible={visible}
      title="Editar dirección"
      onClose={onClose}
      onSave={() => void handleSave()}
      submitting={submitting}
    >
      <FormField
        label="Etiqueta"
        value={label}
        onChangeText={setLabel}
        placeholder="Casa, oficina, proyecto..."
      />
      <FormField
        label="Dirección"
        value={addressText}
        onChangeText={setAddressText}
        placeholder="Dirección completa"
        multiline
      />
      <FormField
        label="Provincia"
        value={province}
        onChangeText={setProvince}
        placeholder="Provincia"
      />
      <FormField
        label="Distrito"
        value={district}
        onChangeText={setDistrict}
        placeholder="Distrito"
      />
      <FormField
        label="Corregimiento"
        value={township}
        onChangeText={setTownship}
        placeholder="Corregimiento"
      />
      <FormField
        label="Referencia"
        value={reference}
        onChangeText={setReference}
        placeholder="Punto de referencia"
        multiline
      />
    </FormModal>
  );
}

function AddAddressModal({
  visible,
  companyId,
  clientId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  companyId: string;
  clientId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [label, setLabel] =
    useState("Principal");
  const [address, setAddress] = useState("");
  const [reference, setReference] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSave() {
    try {
      setSubmitting(true);

      const { error } = await addClientAddress({
        companyId,
        clientId,
        label,
        address,
        reference,
        isPrimary: false,
      });

      if (error) {
        Alert.alert(
          "No fue posible guardar la dirección",
          error,
        );
        return;
      }

      setLabel("Principal");
      setAddress("");
      setReference("");
      onClose();
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormModal
      visible={visible}
      title="Nueva dirección"
      onClose={onClose}
      onSave={() => void handleSave()}
      submitting={submitting}
    >
      <FormField
        label="Etiqueta"
        value={label}
        onChangeText={setLabel}
        placeholder="Casa, oficina, proyecto..."
      />

      <FormField
        label="Dirección"
        value={address}
        onChangeText={setAddress}
        placeholder="Dirección completa"
        multiline
      />

      <FormField
        label="Referencia"
        value={reference}
        onChangeText={setReference}
        placeholder="Punto de referencia"
        multiline
      />
    </FormModal>
  );
}

function CreateProjectModal({
  visible,
  companyId,
  clientId,
  addressId,
  onClose,
  onCreated,
}: {
  visible: boolean;
  companyId: string;
  clientId: string;
  addressId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [budgetEstimate, setBudgetEstimate] =
    useState("");
  const [submitting, setSubmitting] =
    useState(false);

  async function handleSave() {
    const estimateNumber =
      Number(
        budgetEstimate
          .replace(",", ".")
          .trim(),
      ) || 0;

    try {
      setSubmitting(true);

      const { error } = await createProject({
        companyId,
        clientId,
        addressId,
        name,
        description,
        budgetEstimate: estimateNumber,
      });

      if (error) {
        Alert.alert(
          "No fue posible crear el proyecto",
          error,
        );
        return;
      }

      setName("");
      setDescription("");
      setBudgetEstimate("");
      onClose();
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormModal
      visible={visible}
      title="Nuevo proyecto"
      onClose={onClose}
      onSave={() => void handleSave()}
      submitting={submitting}
    >
      <FormField
        label="Nombre del proyecto"
        value={name}
        onChangeText={setName}
        placeholder="Ej. Remodelación de cocina"
      />

      <FormField
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Detalles generales del trabajo"
        multiline
      />

      <FormField
        label="Estimado inicial"
        value={budgetEstimate}
        onChangeText={setBudgetEstimate}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
    </FormModal>
  );
}

function FormModal({
  visible,
  title,
  children,
  onClose,
  onSave,
  submitting,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  submitting: boolean;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              {title}
            </Text>

            <Pressable
              onPress={onSave}
              disabled={submitting}
            >
              <Text style={styles.saveText}>
                Guardar
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={
              styles.modalContent
            }
            keyboardShouldPersistTaps="handled"
          >
            {children}

            <Pressable
              onPress={onSave}
              disabled={submitting}
              style={({ pressed }) => [
                styles.fullSaveButton,
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
                <Text style={styles.fullSaveText}>
                  Guardar
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?:
    | "default"
    | "decimal-pad";
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
        ]}
      />
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

  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  profileCard: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  profileIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    flex: 1,
  },

  clientName: {
    color: colors.textLight,
    fontSize: 21,
    fontWeight: "900",
  },

  clientType: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },

  section: {
    marginTop: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionAction: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },

  sectionActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    gap: 12,
  },

  infoTextBox: {
    flex: 1,
  },

  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  infoValue: {
    marginTop: 2,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  addressCard: {
    marginBottom: 10,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },

  projectCard: {
    marginBottom: 10,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  cardBody: {
    marginTop: 6,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },

  cardMuted: {
    marginTop: 5,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },

  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },

  badgeDark: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceDark,
  },

  badgeDarkText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: "900",
  },

  linkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  addressActions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 18,
  },

  dangerText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptySmall: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
  },

  emptySmallText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },

  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  modalHeader: {
    minHeight: 56,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },

  saveText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },

  modalContent: {
    padding: 20,
    paddingBottom: 40,
  },

  field: {
    marginBottom: 15,
  },

  label: {
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
  },

  inputMultiline: {
    minHeight: 90,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  fullSaveButton: {
    minHeight: 56,
    marginTop: 8,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  fullSaveText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },

  openRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

  openText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
});