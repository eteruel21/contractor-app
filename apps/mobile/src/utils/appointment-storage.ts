import { loadLocalData, saveLocalData } from "./local-storage";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled";

export type AppointmentType =
  | "visit"
  | "meeting"
  | "work"
  | "payment"
  | "other";

export type Appointment = {
  id: string;
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
  reminderMinutes: number;
  notificationId: string;
  createdAt: string;
  updatedAt: string;
};

const APPOINTMENTS_KEY = "@contractor-pro/appointments";

function createId(): string {
  return `appointment-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export async function getAppointments(): Promise<Appointment[]> {
  const items =
    await loadLocalData<Appointment[]>(APPOINTMENTS_KEY);

  if (!Array.isArray(items)) return [];

  return items.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(
      `${b.date}T${b.time}`,
    ),
  );
}

export async function getAppointmentById(
  id: string,
): Promise<Appointment | null> {
  const items = await getAppointments();
  return items.find((item) => item.id === id) ?? null;
}

export async function saveAppointment(
  data: Omit<
    Appointment,
    "id" | "createdAt" | "updatedAt"
  >,
  id?: string,
): Promise<Appointment> {
  const items = await getAppointments();
  const now = new Date().toISOString();

  if (id) {
    const index = items.findIndex((item) => item.id === id);

    if (index >= 0) {
      const updated: Appointment = {
        ...items[index],
        ...data,
        updatedAt: now,
      };

      items[index] = updated;
      await saveLocalData(APPOINTMENTS_KEY, items);
      return updated;
    }
  }

  const created: Appointment = {
    ...data,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };

  await saveLocalData(APPOINTMENTS_KEY, [...items, created]);
  return created;
}

export async function deleteAppointment(
  id: string,
): Promise<Appointment[]> {
  const items = await getAppointments();
  const updated = items.filter((item) => item.id !== id);

  await saveLocalData(APPOINTMENTS_KEY, updated);
  return updated;
}
