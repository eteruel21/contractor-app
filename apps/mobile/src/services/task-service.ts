import { authenticatedRequest } from "./api";
import {
  cacheOfflineData,
  enqueueOfflineAction,
  getCachedOfflineData
} from "./offline-sync-service";

export type ProjectTaskStatus = "todo" | "in_progress" | "review" | "completed";
export type ProjectTaskPriority = "low" | "medium" | "high" | "urgent";

export type ProjectTask = {
  id: string;
  company_id: string;
  project_id: string;
  assigned_user_id: string | null;
  title: string;
  description: string | null;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    email: string;
  } | null;
  is_pending_sync?: boolean;
};

export type CreateTaskInput = {
  title: string;
  description?: string | null;
  assignedUserId?: string | null;
  status?: ProjectTaskStatus;
  priority?: ProjectTaskPriority;
  dueDate?: string | null;
};

export async function listProjectTasks(companyId: string, projectId: string): Promise<ProjectTask[]> {
  const cacheKey = `tasks_${companyId}_${projectId}`;
  try {
    const res = await authenticatedRequest<{ tasks: ProjectTask[] }>(
      `/companies/${companyId}/projects/${projectId}/tasks`
    );
    await cacheOfflineData(cacheKey, res.tasks);
    return res.tasks;
  } catch {
    const cached = await getCachedOfflineData<ProjectTask[]>(cacheKey);
    return cached ?? [];
  }
}

export async function createProjectTask(
  companyId: string,
  projectId: string,
  input: CreateTaskInput
): Promise<ProjectTask | null> {
  const endpoint = `/companies/${companyId}/projects/${projectId}/tasks`;
  try {
    const res = await authenticatedRequest<{ task: ProjectTask }>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    );
    return res.task;
  } catch {
    await enqueueOfflineAction({
      type: "CREATE_TASK",
      endpoint,
      method: "POST",
      body: input as unknown as Record<string, unknown>
    });

    const optimisticTask: ProjectTask = {
      id: `off_task_${Date.now()}`,
      company_id: companyId,
      project_id: projectId,
      assigned_user_id: input.assignedUserId || null,
      title: input.title,
      description: input.description || null,
      status: input.status || "todo",
      priority: input.priority || "medium",
      due_date: input.dueDate || null,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_pending_sync: true
    };

    const cacheKey = `tasks_${companyId}_${projectId}`;
    const cached = (await getCachedOfflineData<ProjectTask[]>(cacheKey)) ?? [];
    await cacheOfflineData(cacheKey, [...cached, optimisticTask]);

    return optimisticTask;
  }
}

export async function updateProjectTask(
  companyId: string,
  projectId: string,
  taskId: string,
  input: Partial<CreateTaskInput>
): Promise<ProjectTask | null> {
  try {
    const res = await authenticatedRequest<{ task: ProjectTask }>(
      `/companies/${companyId}/projects/${projectId}/tasks/${taskId}`,
      {
        method: "PUT",
        body: JSON.stringify(input)
      }
    );
    return res.task;
  } catch {
    return null;
  }
}

export async function deleteProjectTask(
  companyId: string,
  projectId: string,
  taskId: string
): Promise<boolean> {
  try {
    await authenticatedRequest(
      `/companies/${companyId}/projects/${projectId}/tasks/${taskId}`,
      { method: "DELETE" }
    );
    return true;
  } catch {
    return false;
  }
}
