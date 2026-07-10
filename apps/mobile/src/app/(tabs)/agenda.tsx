import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../../constants/theme";
import {
  deleteAppointment,
  getAppointments,
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
} from "../../utils/appointment-storage";
import { cancelScheduledNotification } from "../../utils/appointment-notifications";

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Programada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const typeLabels: Record<AppointmentType, string> = {
  visit: "Visita técnica",
  meeting: "Reunión",
  work: "Trabajo",
  payment: "Cobro",
  other: "Otro",
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-PA", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function AgendaScreen() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void getAppointments().then((items) => {
        if (active) setAppointments(items);
      });

      return () => {
        active = false;
      };
    }, []),
  );

  const grouped = useMemo(() => {
    return appointments.reduce<Record<string, Appointment[]>>(
      (accumulator, item) => {
        accumulator[item.date] ??= [];
        accumulator[item.date].push(item);
        return accumulator;
      },
      {},
    );
  }, [appointments]);

  function openAppointment(id: string) {
    router.push({
      pathname: "/agenda/[id]",
      params: { id },
    });
  }

  async function removeAppointment(item: Appointment) {
    await cancelScheduledNotification(item.notificationId);
    setAppointments(await deleteAppointment(item.id));
  }

  function confirmDelete(item: Appointment) {
    Alert.alert(
      "Eliminar actividad",
      `¿Deseas eliminar “${item.title}”?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => void removeAppointment(item),
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Agenda</Text>
          <Text style={styles.subtitle}>
            {appointments.length} actividad(es)
          </Text>
        </View>

        <Pressable
          onPress={() => openAppointment("nuevo")}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={22}
            color={colors.textLight}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-clear-outline"
              size={48}
              color="#94A3B8"
            />

            <Text style={styles.emptyTitle}>
              No hay actividades programadas
            </Text>

            <Text style={styles.emptyText}>
              Registra citas, visitas técnicas, cobros y trabajos.
            </Text>

            <Pressable
              onPress={() => openAppointment("nuevo")}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>
                Agregar actividad
              </Text>
            </Pressable>
          </View>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>
                {formatDate(date)}
              </Text>

              {items.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => openAppointment(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.timeBlock}>
                    <Text style={styles.timeText}>
                      {item.time}
                    </Text>
                    {item.endTime ? (
                      <Text style={styles.endTimeText}>
                        {item.endTime}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.cardMeta}>
                      {typeLabels[item.type]}
                      {item.clientName
                        ? ` · ${item.clientName}`
                        : ""}
                    </Text>

                    {item.address ? (
                      <Text
                        style={styles.cardAddress}
                        numberOfLines={1}
                      >
                        {item.address}
                      </Text>
                    ) : null}

                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>
                        {statusLabels[item.status]}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      confirmDelete(item);
                    }}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={colors.danger}
                    />
                  </Pressable>
                </Pressable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    backgroundColor: colors.surfaceDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.textLight,
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 13,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  dayGroup: {
    marginBottom: 22,
  },
  dayTitle: {
    marginBottom: 10,
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  card: {
    minHeight: 105,
    marginBottom: 10,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timeBlock: {
    width: 58,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  timeText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  endTimeText: {
    marginTop: 3,
    color: colors.textSecondary,
    fontSize: 11,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  cardMeta: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
  },
  cardAddress: {
    marginTop: 5,
    color: "#64748B",
    fontSize: 11,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },
  statusText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    paddingVertical: 90,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 8,
    maxWidth: 300,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
