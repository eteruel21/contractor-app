import {
  createTaskRepo,
  deleteTaskRepo,
  findProjectTasksRepo,
  updateTaskRepo,
  type CreateTaskInput,
  type UpdateTaskInput
} from "./repository.js";

export async function listProjectTasksService(userId: string, companyId: string, projectId: string) {
  return findProjectTasksRepo(userId, companyId, projectId);
}

export async function createTaskService(
  userId: string,
  companyId: string,
  projectId: string,
  input: CreateTaskInput
) {
  return createTaskRepo(userId, companyId, projectId, input);
}

export async function updateTaskService(
  userId: string,
  companyId: string,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  return updateTaskRepo(userId, companyId, projectId, taskId, input);
}

export async function deleteTaskService(
  userId: string,
  companyId: string,
  projectId: string,
  taskId: string
) {
  return deleteTaskRepo(userId, companyId, projectId, taskId);
}
