import {
  authenticatedRequest
} from "@/services/api";
import type {
  Client,
  ClientAddress
} from "@/types/client";
import type {
  Project,
  ProjectStatus,
  ProjectWithDetails
} from "@/types/project";

type CreateProjectInput = {
  companyId: string;
  clientId: string;
  addressId?: string | null;
  name: string;
  description?: string;
  budgetEstimate?: number;
};

export type ProjectSummary =
  Project & {
    client: {
      id: string;
      client_type:
        | "person"
        | "business";
      first_name: string | null;
      last_name: string | null;
      business_name: string | null;
    } | null;
  };

export type ClientProjectSummary =
  Project & {
    company: {
      name: string;
    } | null;
  };

type ProjectRow =
  Omit<
    Project,
    | "budget_estimate"
    | "contract_value"
    | "progress_percentage"
  > & {
    budget_estimate:
      | number
      | string;
    contract_value:
      | number
      | string;
    progress_percentage:
      | number
      | string;
  };

function normalizeProject(
  project: ProjectRow
): Project {
  return {
    ...project,
    budget_estimate:
      Number(
        project.budget_estimate ?? 0
      ),
    contract_value:
      Number(
        project.contract_value ?? 0
      ),
    progress_percentage:
      Number(
        project.progress_percentage ?? 0
      )
  };
}

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listProjectsByClient(
  companyId: string,
  clientId: string
): Promise<{
  projects: Project[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        projects: ProjectRow[];
      }>(
        `/projects?companyId=${encodeURIComponent(companyId)}&clientId=${encodeURIComponent(clientId)}`
      );

    return {
      projects:
        response.projects.map(
          normalizeProject
        ),
      error: null
    };
  } catch (error) {
    return {
      projects: [],
      error: errorMessage(error)
    };
  }
}

export async function createProject(
  input: CreateProjectInput
): Promise<{
  project: Project | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        project: ProjectRow;
      }>(
        "/projects",
        {
          method: "POST",
          body: JSON.stringify({
            companyId:
              input.companyId,
            clientId:
              input.clientId,
            addressId:
              input.addressId ?? null,
            name:
              input.name.trim(),
            description:
              input.description?.trim() ||
              "",
            budgetEstimate:
              Math.max(
                input.budgetEstimate ?? 0,
                0
              )
          })
        }
      );

    return {
      project:
        normalizeProject(
          response.project
        ),
      error: null
    };
  } catch (error) {
    return {
      project: null,
      error: errorMessage(error)
    };
  }
}

export async function getProjectById(
  companyId: string,
  projectId: string
): Promise<{
  project: ProjectWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        project:
          ProjectRow & {
            client: Client | null;
            address:
              ClientAddress | null;
          };
      }>(
        `/projects/${projectId}?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      project: {
        ...normalizeProject(
          response.project
        ),
        client:
          response.project.client,
        address:
          response.project.address
      },
      error: null
    };
  } catch (error) {
    return {
      project: null,
      error: errorMessage(error)
    };
  }
}

export async function updateProjectStatus(
  input: {
    companyId: string;
    projectId: string;
    status: ProjectStatus;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/projects/${input.projectId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          status:
            input.status
        })
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}

export async function updateProjectProgress(
  input: {
    companyId: string;
    projectId: string;
    progressPercentage: number;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/projects/${input.projectId}/progress`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId:
            input.companyId,
          progressPercentage:
            Math.min(
              Math.max(
                input.progressPercentage,
                0
              ),
              100
            )
        })
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}

export async function listProjectsByCompany(
  companyId: string
): Promise<{
  projects: ProjectSummary[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        projects:
          Array<
            ProjectRow & {
              client:
                ProjectSummary["client"];
            }
          >;
      }>(
        `/projects?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      projects:
        response.projects.map(
          (project) => ({
            ...normalizeProject(
              project
            ),
            client:
              project.client ?? null
          })
        ),
      error: null
    };
  } catch (error) {
    return {
      projects: [],
      error: errorMessage(error)
    };
  }
}

export async function listProjectsForClient(
  _userId: string
): Promise<{
  projects: ClientProjectSummary[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        projects:
          Array<
            ProjectRow & {
              company:
                | {
                    name: string;
                  }
                | null;
            }
          >;
      }>("/projects/client");

    return {
      projects:
        response.projects.map(
          (project) => ({
            ...normalizeProject(
              project
            ),
            company:
              project.company ?? null
          })
        ),
      error: null
    };
  } catch (error) {
    return {
      projects: [],
      error: errorMessage(error)
    };
  }
}