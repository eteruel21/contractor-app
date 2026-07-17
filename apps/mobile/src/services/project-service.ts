import { supabase } from "@/services/supabase";
import type {
  Client,
  ClientAddress,
} from "@/types/client";
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

// Tipo para el listado de proyectos con datos mínimos del cliente
export type ProjectSummary = Project & {
  client: {
    id: string;
    client_type: "person" | "business";
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
  } | null;
};

// Tipo para proyectos visibles por el usuario cliente vinculado
export type ClientProjectSummary = Project & {
  company: {
    name: string;
  } | null;
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

/**
 * Obtiene el detalle completo de un proyecto en una sola query con JOINs,
 * en lugar de las 2-3 queries secuenciales que había antes
 * (proyecto → cliente → dirección).
 */
export async function getProjectById(
  companyId: string,
  projectId: string,
): Promise<{
  project: ProjectWithDetails | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      client:clients (*),
      address:client_addresses (*)
    `)
    .eq("company_id", companyId)
    .eq("id", projectId)
    .single();

  if (error) {
    return {
      project: null,
      error: error.message,
    };
  }

  const clientValue = Array.isArray(data.client)
    ? data.client[0]
    : data.client;

  const addressValue = Array.isArray(data.address)
    ? data.address[0]
    : data.address;

  return {
    project: {
      ...(data as unknown as Project),
      client: (clientValue ?? null) as Client | null,
      address: (addressValue ?? null) as ClientAddress | null,
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

export async function listProjectsByCompany(
  companyId: string,
): Promise<{
  projects: ProjectSummary[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      client:clients (
        id,
        client_type,
        first_name,
        last_name,
        business_name
      )
    `)
    .eq("company_id", companyId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      projects: [],
      error: error.message,
    };
  }

  const parsedProjects = (data ?? []).map((project) => {
    const clientData = Array.isArray(project.client)
      ? project.client[0]
      : project.client;

    return {
      ...project,
      client: clientData ?? null,
    };
  });

  return {
    projects: parsedProjects as ProjectSummary[],
    error: null,
  };
}

/**
 * Lista los proyectos visibles para un usuario cliente usando una sola query
 * con JOIN directo desde clients.user_id, en lugar de las dos queries
 * secuenciales anteriores (clients → projects).
 */
export async function listProjectsForClient(
  userId: string,
): Promise<{
  projects: ClientProjectSummary[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      company:companies (name),
      client:clients!inner (user_id)
    `)
    .eq("client.user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      projects: [],
      error: error.message,
    };
  }

  const parsedProjects = (data ?? []).map((project) => {
    const companyValue = Array.isArray(project.company)
      ? project.company[0]
      : project.company;

    return {
      ...project,
      company: companyValue ?? null,
      // Omitir la relación client que solo se usó como filtro
      client: undefined,
    };
  });

  return {
    projects: parsedProjects as ClientProjectSummary[],
    error: null,
  };
}