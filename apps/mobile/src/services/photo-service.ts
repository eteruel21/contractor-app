import { authenticatedRequest } from "@/services/api";

export type ProjectPhoto = {
  id: string;
  company_id: string;
  project_id: string;
  task_id: string | null;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  caption: string | null;
  is_private: boolean;
  created_at: string;
  signedUrl: string;
};

export type UploadPhotoInput = {
  fileName: string;
  fileData: string; // Base64
  mimeType?: string;
  caption?: string | null;
  taskId?: string | null;
  isPrivate?: boolean;
};

export async function listProjectPhotos(companyId: string, projectId: string): Promise<ProjectPhoto[]> {
  try {
    const res = await authenticatedRequest<{ photos: ProjectPhoto[] }>(
      `/companies/${companyId}/projects/${projectId}/photos`
    );
    return res.photos;
  } catch {
    return [];
  }
}

export async function uploadProjectPhoto(
  companyId: string,
  projectId: string,
  input: UploadPhotoInput
): Promise<ProjectPhoto | null> {
  try {
    const res = await authenticatedRequest<{ photo: ProjectPhoto }>(
      `/companies/${companyId}/projects/${projectId}/photos`,
      {
        method: "POST",
        body: JSON.stringify(input)
      }
    );
    return res.photo;
  } catch {
    return null;
  }
}

export async function deleteProjectPhoto(
  companyId: string,
  projectId: string,
  photoId: string
): Promise<boolean> {
  try {
    await authenticatedRequest(
      `/companies/${companyId}/projects/${projectId}/photos/${photoId}`,
      { method: "DELETE" }
    );
    return true;
  } catch {
    return false;
  }
}
