import { supabase } from "@/services/supabase";
import type {
  Project,
  ProjectStatus,
  ProjectWithDetails,
} from "@/types/project";

type CreateProjectInput = {
  companyId: string;
  clientId: string;
  addressId?: string | null;
  name: string;
  description?: string;
  budgetEstimate?: number;
};

export async function listProjectsByClient(
  companyId: string,
  clientId: string,
): Promise<{
  projects: Project[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("company_id", companyId)
    .eq("client_id", clientId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      projects: [],
      error: error.message,
    };
  }

  return {
    projects: (data ?? []) as Project[],
    error: null,
  };
}

export async function createProject(
  input: CreateProjectInput,
): Promise<{
  project: Project | null;
  error: string | null;
}> {
  const cleanName = input.name.trim();

  if (cleanName.length < 2) {
    return {
      project: null,
      error: "Introduce el nombre del proyecto.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      project: null,
      error: "No hay usuario autenticado.",
    };
  }

  const {
    data: projectCode,
    error: sequenceError,
  } = await supabase.rpc("next_document_number", {
    requested_company_id: input.companyId,
    requested_document_type: "project",
  });

  if (sequenceError) {
    return {
      project: null,
      error: sequenceError.message,
    };
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      company_id: input.companyId,
      client_id: input.clientId,
      address_id: input.addressId || null,
      project_code:
        typeof projectCode === "string"
          ? projectCode
          : null,
      name: cleanName,
      description:
        input.description?.trim() || null,
      status: "lead",
      budget_estimate:
        input.budgetEstimate ?? 0,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return {
      project: null,
      error: error.message,
    };
  }

  return {
    project: data as Project,
    error: null,
  };
}

export async function getProjectById(
  companyId: string,
  projectId: string,
): Promise<{
  project: ProjectWithDetails | null;
  error: string | null;
}> {
  const { data: projectData, error: projectError } =
    await supabase
      .from("projects")
      .select("*")
      .eq("company_id", companyId)
      .eq("id", projectId)
      .single();

  if (projectError) {
    return {
      project: null,
      error: projectError.message,
    };
  }

  const project = projectData as Project;

  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", companyId)
    .eq("id", project.client_id)
    .maybeSingle();

  let addressData = null;

  if (project.address_id) {
    const { data } = await supabase
      .from("client_addresses")
      .select("*")
      .eq("company_id", companyId)
      .eq("client_id", project.client_id)
      .eq("id", project.address_id)
      .maybeSingle();

    addressData = data;
  }

  return {
    project: {
      ...project,
      client: clientData ?? null,
      address: addressData ?? null,
    } as ProjectWithDetails,
    error: null,
  };
}

export async function updateProjectStatus(input: {
  companyId: string;
  projectId: string;
  status: ProjectStatus;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("projects")
    .update({
      status: input.status,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.projectId);

  return {
    error: error?.message ?? null,
  };
}

export async function updateProjectProgress(input: {
  companyId: string;
  projectId: string;
  progressPercentage: number;
}): Promise<{
  error: string | null;
}> {
  const cleanProgress = Math.min(
    Math.max(input.progressPercentage, 0),
    100,
  );

  const { error } = await supabase
    .from("projects")
    .update({
      progress_percentage: cleanProgress,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.projectId);

  return {
    error: error?.message ?? null,
  };
}