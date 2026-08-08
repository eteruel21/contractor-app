import { authenticatedRequest } from "./api";
import {
  cacheOfflineData,
  enqueueOfflineAction,
  getCachedOfflineData
} from "./offline-sync-service";

export type ProjectProgressHistoryRecord = {
  id: string;
  company_id: string;
  project_id: string;
  progress_percentage: number;
  previous_percentage: number;
  notes: string | null;
  created_at: string;
  created_by_user?: {
    id: string;
    email: string;
  } | null;
  is_pending_sync?: boolean;
};

export async function listProjectProgressHistory(
  companyId: string,
  projectId: string
): Promise<ProjectProgressHistoryRecord[]> {
  const cacheKey = `progress_history_${companyId}_${projectId}`;
  try {
    const res = await authenticatedRequest<{ history: ProjectProgressHistoryRecord[] }>(
      `/companies/${companyId}/projects/${projectId}/progress-history`
    );
    await cacheOfflineData(cacheKey, res.history);
    return res.history;
  } catch {
    const cached = await getCachedOfflineData<ProjectProgressHistoryRecord[]>(cacheKey);
    return cached ?? [];
  }
}

export async function recordProjectProgressHistory(
  companyId: string,
  projectId: string,
  progressPercentage: number,
  notes?: string | null
): Promise<ProjectProgressHistoryRecord | null> {
  const endpoint = `/companies/${companyId}/projects/${projectId}/progress-history`;
  const body = {
    progressPercentage,
    notes: notes || null
  };

  try {
    const res = await authenticatedRequest<{ record: ProjectProgressHistoryRecord }>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(body)
      }
    );
    return res.record;
  } catch {
    // Si no hay red, encolar en el almacenamiento local y retornar registro optimista
    await enqueueOfflineAction({
      type: "RECORD_PROGRESS",
      endpoint,
      method: "POST",
      body
    });

    const optimisticRecord: ProjectProgressHistoryRecord = {
      id: `off_prog_${Date.now()}`,
      company_id: companyId,
      project_id: projectId,
      progress_percentage: progressPercentage,
      previous_percentage: 0,
      notes: notes || null,
      created_at: new Date().toISOString(),
      is_pending_sync: true
    };

    const cacheKey = `progress_history_${companyId}_${projectId}`;
    const cached = (await getCachedOfflineData<ProjectProgressHistoryRecord[]>(cacheKey)) ?? [];
    await cacheOfflineData(cacheKey, [optimisticRecord, ...cached]);

    return optimisticRecord;
  }
}

