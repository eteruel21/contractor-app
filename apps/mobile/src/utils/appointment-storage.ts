import { loadLocalData, saveLocalData } from "./local-storage";
import {
  createRemoteActivity,
  deleteRemoteActivity,
  fetchCompanyActivities,
  updateRemoteActivity
} from "@/services/activity-service";

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

export async function getAppointments(companyId?: string, projectId?: string): Promise<Appointment[]> {
  if (companyId) {
    return await fetchCompanyActivities(companyId, { projectId });
  }

  const items = await loadLocalData<Appointment[]>(APPOINTMENTS_KEY);

  if (!Array.isArray(items)) return [];

  return items.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(
      `${b.date}T${b.time}`,
    ),
  );
}

export async function getAppointmentById(
  id: string,
  companyId?: string
): Promise<Appointment | null> {
  const items = await getAppointments(companyId);
  return items.find((item) => item.id === id) ?? null;
}

export async function saveAppointment(
  data: Omit<
    Appointment,
    "id" | "createdAt" | "updatedAt"
  >,
  id?: string,
  companyId?: string,
  projectId?: string
): Promise<Appointment> {
  if (companyId) {
    if (id && !id.startsWith("local-")) {
      const updated = await updateRemoteActivity(companyId, id, data);
      if (updated) return updated;
    } else {
      return await createRemoteActivity(companyId, data, projectId);
    }
  }

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
  companyId?: string
): Promise<Appointment[]> {
  if (companyId && !id.startsWith("local-")) {
    await deleteRemoteActivity(companyId, id);
  }

  const items = await getAppointments();
  const updated = items.filter((item) => item.id !== id);

  await saveLocalData(APPOINTMENTS_KEY, updated);
  return updated;
}
