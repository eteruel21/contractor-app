import { Ionicons } from "@expo/vector-icons";
import {
  type Href,
  router,
  useFocusEffect,
} from "expo-router";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  createClient,
  deactivateClient,
  listClients,
} from "@/services/client-service";
import type {
  ClientType,
  ClientWithDetails,
} from "@/types/client";
import { getClientDisplayName } from "@/types/client";

export default function ClientsScreen() {
  const { activeCompany } = useCompany();

  const [clients, setClients] = useState<
    ClientWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [modalVisible, setModalVisible] =
    useState(false);
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return clients;

    return clients.filter((client) => {
      const name =
        getClientDisplayName(client).toLowerCase();

      const phone = client.phone?.toLowerCase() ?? "";
      const email = client.email?.toLowerCase() ?? "";
      const documentNumber =
        client.document_number?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        phone.includes(query) ||
        email.includes(query) ||
        documentNumber.includes(query)
      );
    });
  }, [clients, search]);

  const loadClients = useCallback(
    async (showRefresh = false) => {
      if (!activeCompany) return;

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { clients: loadedClients, error } =
        await listClients(activeCompany.id);

      if (error) {
        Alert.alert(
          "No fue posible cargar los clientes",
          error,
        );
      } else {
        setClients(loadedClients);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [activeCompany],
  );

  useFocusEffect(
    useCallback(() => {
      void loadClients();
    }, [loadClients]),
  );

  async function handleDeactivateClient(
    client: ClientWithDetails,
  ) {
    if (!activeCompany) return;

    Alert.alert(
      "Desactivar cliente",
      `¿Deseas desactivar a ${getClientDisplayName(client)}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Desactivar",
          style: "destructive",
          onPress: async () => {
            const { error } =
              await deactivateClient(
                activeCompany.id,
                client.id,
              );

            if (error) {
              Alert.alert(
                "No fue posible desactivar el cliente",
                error,
              );
              return;
            }

            await loadClients(true);
          },
        },
      ],
    );
  }

  if (!activeCompany) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          No hay empresa activa
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadClients(true)
            }
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="people-outline"
              size={44}
              color={colors.textSecondary}
            />

            <Text style={styles.emptyTitle}>
              No hay clientes
            </Text>

            <Text style={styles.emptyText}>
              Crea tu primer cliente para iniciar proyectos, visitas y presupuestos.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ height: 24 }} />
        }
        ListHeaderComponentStyle={{
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            onPress={() =>
              router.push({
                pathname: "/clientes/[id]",
                params: {
                  id: item.id,
                },
              } as Href)
            }
            onDeactivate={() =>
              void handleDeactivateClient(item)
            }
          />
        )}
        ListFooterComponentStyle={{
          marginBottom: 20,
        }}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Clientes
                </Text>

                <Text style={styles.subtitle}>
                  {activeCompany.name}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setModalVisible(true)
                }
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={colors.textLight}
                />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={colors.textSecondary}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre, teléfono, correo o documento"
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
              />
            </View>

            <Text style={styles.counter}>
              {filteredClients.length} cliente
              {filteredClients.length === 1
                ? ""
                : "s"}
            </Text>
          </View>
        }
      />

      <CreateClientModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={() => void loadClients(true)}
        companyId={activeCompany.id}
      />
    </SafeAreaView>
  );
}

type ClientCardProps = {
  client: ClientWithDetails;
  onPress: () => void;
  onDeactivate: () => void;
};

function ClientCard({
  client,
  onPress,
  onDeactivate,
}: ClientCardProps) {
  const primaryAddress =
    client.addresses.find(
      (address) => address.is_primary,
    ) ?? client.addresses[0];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.clientCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.clientIcon}>
        <Ionicons
          name={
            client.client_type === "business"
              ? "business-outline"
              : "person-outline"
          }
          size={23}
          color={colors.textLight}
        />
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>
          {getClientDisplayName(client)}
        </Text>

        <Text style={styles.clientMeta}>
          {client.phone ||
            client.email ||
            "Sin contacto"}
        </Text>

        {primaryAddress ? (
          <Text
            style={styles.clientAddress}
            numberOfLines={1}
          >
            {primaryAddress.address}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={onDeactivate}
        hitSlop={12}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#EF4444"
        />
      </Pressable>
    </Pressable>
  );
}

type CreateClientModalProps = {
  visible: boolean;
  companyId: string;
  onClose: () => void;
  onCreated: () => void;
};

function CreateClientModal({
  visible,
  companyId,
  onClose,
  onCreated,
}: CreateClientModalProps) {
  const [clientType, setClientType] =
    useState<ClientType>("person");

  const [firstName, setFirstName] =
    useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] =
    useState("");
  const [documentNumber, setDocumentNumber] =
    useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] =
    useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  function resetForm() {
    setClientType("person");
    setFirstName("");
    setLastName("");
    setBusinessName("");
    setDocumentNumber("");
    setPhone("");
    setEmail("");
    setAddress("");
    setReference("");
    setNotes("");
  }

  async function handleCreate() {
    try {
      setSubmitting(true);

      const { error } = await createClient({
        companyId,
        clientType,
        firstName,
        lastName,
        businessName,
        documentNumber,
        phone,
        email,
        address,
        reference,
        notes,
      });

      if (error) {
        Alert.alert(
          "No fue posible crear el cliente",
          error,
        );
        return;
      }

      resetForm();
      onClose();
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

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
            <Pressable
              onPress={onClose}
              hitSlop={12}
            >
              <Text style={styles.cancelText}>
                Cancelar
              </Text>
            </Pressable>

            <Text style={styles.modalTitle}>
              Nuevo cliente
            </Text>

            <Pressable
              onPress={() => void handleCreate()}
              disabled={submitting}
              hitSlop={12}
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
            <View style={styles.typeSelector}>
              <Pressable
                onPress={() =>
                  setClientType("person")
                }
                style={[
                  styles.typeButton,
                  clientType === "person" &&
                    styles.typeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    clientType === "person" &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  Persona
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setClientType("business")
                }
                style={[
                  styles.typeButton,
                  clientType === "business" &&
                    styles.typeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    clientType === "business" &&
                      styles.typeButtonTextActive,
                  ]}
                >
                  Empresa
                </Text>
              </Pressable>
            </View>

            {clientType === "person" ? (
              <>
                <FormField
                  label="Nombre"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Ej. Juan"
                />

                <FormField
                  label="Apellido"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Ej. Pérez"
                />
              </>
            ) : (
              <FormField
                label="Nombre de empresa cliente"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Ej. Constructora ABC"
              />
            )}

            <FormField
              label="Documento / RUC"
              value={documentNumber}
              onChangeText={setDocumentNumber}
              placeholder="Opcional"
            />

            <FormField
              label="Teléfono"
              value={phone}
              onChangeText={setPhone}
              placeholder="+507 6000-0000"
              keyboardType="phone-pad"
            />

            <FormField
              label="Correo"
              value={email}
              onChangeText={setEmail}
              placeholder="cliente@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              label="Dirección"
              value={address}
              onChangeText={setAddress}
              placeholder="Dirección principal"
              multiline
            />

            <FormField
              label="Referencia"
              value={reference}
              onChangeText={setReference}
              placeholder="Casa color blanco, portón negro..."
              multiline
            />

            <FormField
              label="Notas"
              value={notes}
              onChangeText={setNotes}
              placeholder="Observaciones internas"
              multiline
            />

            <Pressable
              onPress={() => void handleCreate()}
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
                  Guardar cliente
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?:
    | "default"
    | "email-address"
    | "phone-pad";
  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";
  multiline?: boolean;
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
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
    paddingBottom: 40,
  },

  header: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  counter: {
    marginTop: 12,
    marginBottom: 12,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },

  empty: {
    marginTop: 90,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  clientCard: {
    marginBottom: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  clientIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
  },

  clientInfo: {
    flex: 1,
  },

  clientName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },

  clientMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
  },

  clientAddress: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 12,
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

  typeSelector: {
    marginBottom: 18,
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: "#E2E8F0",
    flexDirection: "row",
  },

  typeButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  typeButtonActive: {
    backgroundColor: colors.surface,
  },

  typeButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },

  typeButtonTextActive: {
    color: colors.primary,
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
    minHeight: 86,
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
});