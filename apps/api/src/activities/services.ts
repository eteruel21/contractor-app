import {
  createActivityRepo,
  deleteActivityRepo,
  findCompanyActivitiesRepo,
  getActivityByIdRepo,
  updateActivityRepo,
  type CreateActivityInput,
  type UpdateActivityInput
} from "./repository.js";

export async function listActivitiesService(
  userId: string,
  companyId: string,
  filters?: { date?: string | undefined; projectId?: string | undefined; clientId?: string | undefined }
) {
  return findCompanyActivitiesRepo(userId, companyId, filters);
}

export async function getActivityService(userId: string, activityId: string, companyId: string) {
  return getActivityByIdRepo(userId, activityId, companyId);
}

export async function createActivityService(userId: string, input: CreateActivityInput) {
  return createActivityRepo(userId, input);
}

export async function updateActivityService(
  userId: string,
  activityId: string,
  companyId: string,
  input: UpdateActivityInput
) {
  return updateActivityRepo(userId, activityId, companyId, input);
}

export async function deleteActivityService(userId: string, activityId: string, companyId: string) {
  return deleteActivityRepo(userId, activityId, companyId);
}
