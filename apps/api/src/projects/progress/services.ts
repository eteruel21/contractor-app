import {
  findProjectProgressHistoryRepo,
  recordProjectProgressHistoryRepo
} from "./repository.js";

export async function listProjectProgressHistoryService(userId: string, companyId: string, projectId: string) {
  return findProjectProgressHistoryRepo(userId, companyId, projectId);
}

export async function recordProjectProgressHistoryService(
  userId: string,
  companyId: string,
  projectId: string,
  progressPercentage: number,
  notes?: string | null
) {
  return recordProjectProgressHistoryRepo(userId, companyId, projectId, progressPercentage, notes);
}
