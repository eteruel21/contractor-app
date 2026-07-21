import { authenticatedRequest } from "@/services/api";

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
  try {
    const res = await authenticatedRequest<{ tasks: ProjectTask[] }>(
      `/companies/${companyId}/projects/${projectId}/tasks`
    );
    return res.tasks;
  } catch {
    return [];
  }
}

export async function createProjectTask(
  companyId: string,
  projectId: string,
  input: CreateTaskInput
): Promise<ProjectTask | null> {
  try {
    const res = await authenticatedRequest<{ task: ProjectTask }>(
      `/companies/${companyId}/projects/${projectId}/tasks`,
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    );
    return res.task;
  } catch {
    return null;
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
