import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { useEffect, useState } from "react";
import {
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

import { colors, radius } from "../../constants/theme";
import {
  getAppointmentById,
  saveAppointment,
  type AppointmentStatus,
  type AppointmentType,
} from "../../utils/appointment-storage";
import {
  cancelScheduledNotification,
  scheduleAppointmentNotification,
} from "../../utils/appointment-notifications";
import {
  getClients,
  type Client,
} from "../../utils/client-storage";

type FormState = {
  title: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  endTime: string;
  type: AppointmentType;
  status: AppointmentStatus;
  address: string;
  notes: string;
  reminderMinutes: string;
  notificationId: string;
};

const today = new Date().toISOString().slice(0, 10);

const initialForm: FormState = {
  title: "",
  clientId: "",
  clientName: "",
  date: today,
  time: "08:00",
  endTime: "09:00",
  type: "visit",
  status: "scheduled",
  address: "",
  notes: "",
  reminderMinutes: "60",
  notificationId: "",
};

const types: { value: AppointmentType; label: string }[] = [
  { value: "visit", label: "Visita técnica" },
  { value: "meeting", label: "Reunión" },
  { value: "work", label: "Trabajo" },
  { value: "payment", label: "Cobro" },
  { value: "other", label: "Otro" },
];

const statuses: {
  value: AppointmentStatus;
  label: string;
}[] = [
  { value: "scheduled", label: "Programada" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

function parseAppointmentDate(
  date: string,
  time: string,
): Date | null {
  const value = new Date(`${date}T${time}:00`);
  return Number.isNaN(value.getTime()) ? null : value;
}

export default function AppointmentFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const isNew = id === "nuevo";

  const [form, setForm] = useState<FormState>(initialForm);
  const [clients, setClients] = useState<Client[]>([]);
  const [showClients, setShowClients] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isNew ? "Nueva actividad" : "Editar actividad",
    });
  }, [isNew, navigation]);

  useEffect(() => {
    void getClients().then(setClients);

    if (isNew || !id) return;

    void getAppointmentById(id).then((item) => {
      if (!item) return;

      setForm({
        title: item.title,
        clientId: item.clientId,
        clientName: item.clientName,
        date: item.date,
        time: item.time,
        endTime: item.endTime,
        type: item.type,
        status: item.status,
        address: item.address,
        notes: item.notes,
        reminderMinutes: String(item.reminderMinutes),
        notificationId: item.notificationId,
      });
    });
  }, [id, isNew]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectClient(client: Client) {
    setForm((current) => ({
      ...current,
      clientId: client.id,
      clientName: client.name,
      address: current.address || client.address,
    }));
    setShowClients(false);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      Alert.alert(
        "Título requerido",
        "Introduce el motivo de la actividad.",
      );
      return;
    }

    const appointmentDate = parseAppointmentDate(
      form.date,
      form.time,
    );

    if (!appointmentDate) {
      Alert.alert(
        "Fecha inválida",
        "Usa el formato AAAA-MM-DD y una hora válida.",
      );
      return;
    }

    try {
      setSaving(true);

      await cancelScheduledNotification(
        form.notificationId,
      );

      const reminderMinutes = Math.max(
        Number(form.reminderMinutes) || 0,
        0,
      );

      let notificationId = "";

      if (
        form.status !== "cancelled" &&
        form.status !== "completed" &&
        appointmentDate.getTime() > Date.now()
      ) {
        notificationId =
          await scheduleAppointmentNotification({
            title: form.title.trim(),
            body: form.clientName
              ? `${form.clientName} · ${form.time}`
              : `Actividad programada a las ${form.time}`,
            date: appointmentDate,
            reminderMinutes,
          });
      }

      await saveAppointment(
        {
          title: form.title.trim(),
          clientId: form.clientId,
          clientName: form.clientName,
          date: form.date,
          time: form.time,
          endTime: form.endTime,
          type: form.type,
          status: form.status,
          address: form.address.trim(),
          notes: form.notes.trim(),
          reminderMinutes,
          notificationId,
        },
        isNew ? undefined : id,
      );

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert(
        "No se pudo guardar",
        "Revisa los datos e inténtalo nuevamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Información de la actividad
            </Text>

            <Field
              label="Título *"
              value={form.title}
              onChangeText={(value) =>
                updateField("title", value)
              }
              placeholder="Ej. Visita para medir cielo raso"
            />

            <Text style={styles.label}>Cliente</Text>

            <Pressable
              onPress={() => setShowClients(!showClients)}
              style={styles.clientSelector}
            >
              <Text style={styles.clientSelectorText}>
                {form.clientName || "Seleccionar cliente"}
              </Text>

              <Ionicons
                name="chevron-down-outline"
                size={20}
                color="#94A3B8"
              />
            </Pressable>

            {showClients ? (
              <View style={styles.clientList}>
                {clients.length === 0 ? (
                  <Text style={styles.emptyClients}>
                    No hay clientes registrados.
                  </Text>
                ) : (
                  clients.map((client) => (
                    <Pressable
                      key={client.id}
                      onPress={() => selectClient(client)}
                      style={styles.clientOption}
                    >
                      <Text style={styles.clientOptionName}>
                        {client.name}
                      </Text>
                      <Text style={styles.clientOptionMeta}>
                        {client.company || client.phone}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}

            <View style={styles.grid}>
              <Field
                label="Fecha"
                value={form.date}
                onChangeText={(value) =>
                  updateField("date", value)
                }
                placeholder="AAAA-MM-DD"
                compact
              />

              <Field
                label="Hora inicial"
                value={form.time}
                onChangeText={(value) =>
                  updateField("time", value)
                }
                placeholder="08:00"
                compact
              />

              <Field
                label="Hora final"
                value={form.endTime}
                onChangeText={(value) =>
                  updateField("endTime", value)
                }
                placeholder="09:00"
                compact
              />

              <Field
                label="Recordar antes"
                value={form.reminderMinutes}
                onChangeText={(value) =>
                  updateField("reminderMinutes", value)
                }
                placeholder="60 minutos"
                compact
              />
            </View>

            <Text style={styles.label}>Tipo</Text>
            <ChoiceRow
              options={types}
              value={form.type}
              onChange={(value) =>
                updateField("type", value)
              }
            />

            <Text style={styles.label}>Estado</Text>
            <ChoiceRow
              options={statuses}
              value={form.status}
              onChange={(value) =>
                updateField("status", value)
              }
            />

            <Field
              label="Dirección"
              value={form.address}
              onChangeText={(value) =>
                updateField("address", value)
              }
              placeholder="Ubicación de la visita o trabajo"
              multiline
            />

            <Field
              label="Notas"
              value={form.notes}
              onChangeText={(value) =>
                updateField("notes", value)
              }
              placeholder="Detalles, materiales o instrucciones"
              multiline
            />
          </View>

          <Pressable
            disabled={saving}
            onPress={() => void handleSave()}
            style={({ pressed }) => [
              styles.saveButton,
              saving && styles.saveButtonDisabled,
              pressed && !saving && styles.pressed,
            ]}
          >
            <Ionicons
              name="save-outline"
              size={20}
              color={colors.textLight}
            />

            <Text style={styles.saveButtonText}>
              {saving ? "Guardando..." : "Guardar actividad"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  compact?: boolean;
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  compact = false,
  multiline = false,
}: FieldProps) {
  return (
    <View style={[styles.field, compact && styles.compactField]}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multilineInput,
        ]}
      />
    </View>
  );
}

type ChoiceRowProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
}: ChoiceRowProps<T>) {
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[
            styles.choice,
            value === option.value && styles.choiceActive,
          ]}
        >
          <Text
            style={[
              styles.choiceText,
              value === option.value &&
                styles.choiceTextActive,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 18,
    paddingBottom: 42,
  },
  section: {
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  field: {
    width: "100%",
    marginTop: 16,
  },
  compactField: {
    width: "47%",
    minWidth: 145,
    flexGrow: 1,
  },
  label: {
    marginTop: 16,
    marginBottom: 7,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 13,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    color: colors.text,
    fontSize: 14,
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 13,
    textAlignVertical: "top",
  },
  clientSelector: {
    minHeight: 50,
    paddingHorizontal: 13,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clientSelectorText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  clientList: {
    marginTop: 8,
    overflow: "hidden",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clientOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  clientOptionName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  clientOptionMeta: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },
  emptyClients: {
    padding: 14,
    color: colors.textSecondary,
    fontSize: 12,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choice: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFC",
  },
  choiceActive: {
    borderColor: "#86EFAC",
    backgroundColor: colors.primarySoft,
  },
  choiceText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },
  choiceTextActive: {
    color: colors.primary,
  },
  saveButton: {
    minHeight: 56,
    marginTop: 18,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
