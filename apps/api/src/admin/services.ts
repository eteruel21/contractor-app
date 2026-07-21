import {
  getAdminDashboardDataRepo,
  updateAdminUserRepo,
  type UserInput
} from "./repository.js";

export async function getAdminDashboardService(userId: string) {
  return getAdminDashboardDataRepo(userId);
}

export async function updateAdminUserService(userId: string, targetUserId: string, input: UserInput) {
  return updateAdminUserRepo(userId, targetUserId, input);
}
