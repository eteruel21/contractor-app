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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { LeuretEmptyState } from "@/components/LeuretEmptyState";
import { MotionPressable } from "@/components/MotionPressable";

import { colors, radius, shadows, typography } from "@/constants/theme";
import { useCompany } from "@/contexts/CompanyContext";
import { formatDate as formatDateUtil } from "@/utils/format";
import {
  deleteAppointment,
  getAppointments,
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
} from "@/utils/appointment-storage";
import { cancelScheduledNotification } from "@/utils/appointment-notifications";

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

// La función formatDate se define dentro del componente usando la zona horaria de la empresa

export default function AgendaScreen() {
  const { activeCompany } = useCompany();
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const formatDate = (dateStr: string) => {
    return formatDateUtil(dateStr, activeCompany?.timezone || undefined);
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      if (!activeCompany?.id) {
        setAppointments([]);
        return () => { active = false; };
      }
      void getAppointments(activeCompany.id).then((items) => {
        if (active) setAppointments(items);
      });

      return () => {
        active = false;
      };
    }, [activeCompany?.id]),
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
    if (!activeCompany?.id) { Alert.alert("Empresa requerida", "Selecciona una empresa activa."); return; }
    try {
      const items = await deleteAppointment(item.id, activeCompany.id);
      try { await cancelScheduledNotification(item.notificationId); } catch {}
      setAppointments(items);
    } catch (error) {
      Alert.alert("No se pudo eliminar", error instanceof Error ? error.message : "Inténtalo nuevamente.");
    }
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
      <Animated.View entering={FadeInDown.duration(420)} style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LEURET AGENDA</Text>
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
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        {appointments.length === 0 ? (
          <LeuretEmptyState
            icon="calendar-clear-outline"
            title="No hay actividades programadas"
            description="Registra citas, visitas técnicas, cobros y trabajos."
            actionLabel="Agregar actividad"
            actionIcon="add"
            onAction={() => openAppointment("nuevo")}
            style={styles.emptyStateSpacing}
          />
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <View key={date} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>
                {formatDate(date)}
              </Text>

              {items.map((item, index) => (
                <MotionPressable
                  key={item.id}
                  entering={FadeInUp.delay(index * 45).duration(320)}
                  onPress={() => openAppointment(item.id)}
                  pressedScale={0.985}
                  style={styles.card}
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
                </MotionPressable>
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
    paddingTop: 18,
    paddingBottom: 30,
    backgroundColor: colors.surfaceDark,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
  },

  title: {
    marginTop: 6,
    color: colors.textLight,
    ...typography.title,
  },
  subtitle: {
    marginTop: 5,
    color: colors.textLightMuted,
    fontSize: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.glow,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  dayGroup: {
    marginBottom: 22,
  },
  dayTitle: {
    marginBottom: 11,
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  card: {
    minHeight: 108,
    marginBottom: 12,
    padding: 15,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "flex-start",
    ...shadows.soft,
  },
  timeBlock: {
    width: 62,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
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
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.sandSoft,
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
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateSpacing: {
    marginTop: 34,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
});
