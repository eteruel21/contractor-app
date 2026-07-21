import {
  findClientProjectsRepo,
  findCompanyProjectsRepo,
  createProjectRepo,
  getProjectByIdRepo,
  updateProjectStatusRepo,
  updateProjectProgressRepo,
  type CreateProjectInput
} from "./repository.js";

export async function getClientProjectsService(userId: string) {
  return findClientProjectsRepo(userId);
}

export async function getCompanyProjectsService(userId: string, companyId: string, clientId?: string) {
  return findCompanyProjectsRepo(userId, companyId, clientId);
}

export async function createProjectService(userId: string, input: CreateProjectInput) {
  return createProjectRepo(userId, input);
}

export async function getProjectByIdService(userId: string, projectId: string, companyId: string) {
  return getProjectByIdRepo(userId, projectId, companyId);
}

export async function updateProjectStatusService(userId: string, projectId: string, companyId: string, status: string) {
  return updateProjectStatusRepo(userId, projectId, companyId, status);
}

export async function updateProjectProgressService(userId: string, projectId: string, companyId: string, progressPercentage: number) {
  return updateProjectProgressRepo(userId, projectId, companyId, progressPercentage);
}
