import { authenticatedRequest } from "@/services/api";
import { loadLocalData, saveLocalData } from "@/utils/local-storage";
import type { Appointment, AppointmentStatus, AppointmentType } from "@/utils/appointment-storage";

export type ServerActivity = {
  id: string;
  company_id: string;
  client_id: string | null;
  project_id: string | null;
  assigned_user_id: string | null;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  start_time: string;
  end_time: string | null;
  address: string | null;
  notes: string | null;
  reminder_minutes: number;
  client?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    project_code: string | null;
  } | null;
};

const APPOINTMENTS_KEY = "@contractor-pro/appointments";

function mapServerActivityToAppointment(act: ServerActivity): Appointment {
  const clientName = act.client
    ? act.client.business_name || `${act.client.first_name || ""} ${act.client.last_name || ""}`.trim()
    : "";

  return {
    id: act.id,
    title: act.title,
    clientId: act.client_id || "",
    clientName: clientName || "",
    date: act.date,
    time: act.start_time,
    endTime: act.end_time || act.start_time,
    type: act.type,
    status: act.status,
    address: act.address || "",
    notes: act.notes || "",
    reminderMinutes: act.reminder_minutes ?? 15,
    notificationId: `notif-${act.id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function fetchCompanyActivities(
  companyId: string,
  filters?: { date?: string; projectId?: string; clientId?: string }
): Promise<Appointment[]> {
  try {
    let url = `/companies/${companyId}/activities`;
    const params = new URLSearchParams();
    if (filters?.date) params.append("date", filters.date);
    if (filters?.projectId) params.append("projectId", filters.projectId);
    if (filters?.clientId) params.append("clientId", filters.clientId);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const res = await authenticatedRequest<{ activities: ServerActivity[] }>(url);
    const items = res.activities.map(mapServerActivityToAppointment);

    if (!filters || (!filters.date && !filters.projectId && !filters.clientId)) {
      await saveLocalData(APPOINTMENTS_KEY, items);
    }

    return items;
  } catch {
    const cached = await loadLocalData<Appointment[]>(APPOINTMENTS_KEY);
    let items = Array.isArray(cached) ? cached : [];

    if (filters?.date) {
      items = items.filter((a) => a.date === filters.date);
    }
    if (filters?.clientId) {
      items = items.filter((a) => a.clientId === filters.clientId);
    }

    return items;
  }
}

export async function createRemoteActivity(
  companyId: string,
  data: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  projectId?: string
): Promise<Appointment> {
  try {
    const res = await authenticatedRequest<{ activity: ServerActivity }>(
      `/companies/${companyId}/activities`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId,
          clientId: data.clientId || null,
          projectId: projectId || null,
          title: data.title,
          type: data.type,
          status: data.status,
          date: data.date,
          startTime: data.time,
          endTime: data.endTime,
          address: data.address,
          notes: data.notes,
          reminderMinutes: data.reminderMinutes
        })
      }
    );

    const appointment = mapServerActivityToAppointment(res.activity);
    const cached = (await loadLocalData<Appointment[]>(APPOINTMENTS_KEY)) || [];
    await saveLocalData(APPOINTMENTS_KEY, [appointment, ...cached.filter((c) => c.id !== appointment.id)]);
    return appointment;
  } catch (error) {
    const now = new Date().toISOString();
    const fallbackId = `local-${Date.now()}`;
    const appointment: Appointment = {
      ...data,
      id: fallbackId,
      createdAt: now,
      updatedAt: now
    };
    const cached = (await loadLocalData<Appointment[]>(APPOINTMENTS_KEY)) || [];
    await saveLocalData(APPOINTMENTS_KEY, [appointment, ...cached]);
    return appointment;
  }
}

export async function updateRemoteActivity(
  companyId: string,
  id: string,
  data: Partial<Appointment>
): Promise<Appointment | null> {
  try {
    const res = await authenticatedRequest<{ activity: ServerActivity }>(
      `/companies/${companyId}/activities/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          title: data.title,
          type: data.type,
          status: data.status,
          date: data.date,
          startTime: data.time,
          endTime: data.endTime,
          address: data.address,
          notes: data.notes,
          reminderMinutes: data.reminderMinutes
        })
      }
    );

    const updated = mapServerActivityToAppointment(res.activity);
    const cached = (await loadLocalData<Appointment[]>(APPOINTMENTS_KEY)) || [];
    const index = cached.findIndex((item) => item.id === id);
    if (index >= 0) {
      cached[index] = updated;
      await saveLocalData(APPOINTMENTS_KEY, cached);
    }
    return updated;
  } catch {
    const cached = (await loadLocalData<Appointment[]>(APPOINTMENTS_KEY)) || [];
    const index = cached.findIndex((item) => item.id === id);
    if (index >= 0) {
      cached[index] = { ...cached[index], ...data, updatedAt: new Date().toISOString() };
      await saveLocalData(APPOINTMENTS_KEY, cached);
      return cached[index];
    }
    return null;
  }
}

export async function deleteRemoteActivity(companyId: string, id: string): Promise<void> {
  try {
    await authenticatedRequest(`/companies/${companyId}/activities/${id}`, {
      method: "DELETE"
    });
  } catch {}

  const cached = (await loadLocalData<Appointment[]>(APPOINTMENTS_KEY)) || [];
  const updated = cached.filter((item) => item.id !== id);
  await saveLocalData(APPOINTMENTS_KEY, updated);
}
