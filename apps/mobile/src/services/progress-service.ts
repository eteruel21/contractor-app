import { authenticatedRequest } from "@/services/api";

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
};

export async function listProjectProgressHistory(
  companyId: string,
  projectId: string
): Promise<ProjectProgressHistoryRecord[]> {
  try {
    const res = await authenticatedRequest<{ history: ProjectProgressHistoryRecord[] }>(
      `/companies/${companyId}/projects/${projectId}/progress-history`
    );
    return res.history;
  } catch {
    return [];
  }
}

export async function recordProjectProgressHistory(
  companyId: string,
  projectId: string,
  progressPercentage: number,
  notes?: string | null
): Promise<ProjectProgressHistoryRecord | null> {
  try {
    const res = await authenticatedRequest<{ record: ProjectProgressHistoryRecord }>(
      `/companies/${companyId}/projects/${projectId}/progress-history`,
      {
        method: "POST",
        body: JSON.stringify({
          progressPercentage,
          notes: notes || null
        })
      }
    );
    return res.record;
  } catch {
    return null;
  }
}
