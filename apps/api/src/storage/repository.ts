import { withUserTransaction } from "../db/with-user-transaction.js";

export interface CreatePhotoInput {
  companyId: string;
  projectId: string;
  taskId?: string | null | undefined;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption?: string | null | undefined;
  isPrivate?: boolean | undefined;
}

export async function findProjectPhotosRepo(userId: string, companyId: string, projectId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        SELECT *
        FROM public.project_photos
        WHERE company_id = $1 AND project_id = $2
        ORDER BY created_at DESC
      `,
      [companyId, projectId]
    );
    return result.rows;
  });
}

export async function createProjectPhotoRepo(userId: string, input: CreatePhotoInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.project_photos (
          company_id, project_id, task_id, storage_path, file_name, file_size, mime_type, caption, is_private, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, app.current_user_id())
        RETURNING *
      `,
      [
        input.companyId,
        input.projectId,
        input.taskId ?? null,
        input.storagePath,
        input.fileName,
        input.fileSize,
        input.mimeType || "image/jpeg",
        input.caption ?? null,
        input.isPrivate ?? true
      ]
    );
    return result.rows[0];
  });
}

export async function getPhotoByIdRepo(userId: string, photoId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `SELECT * FROM public.project_photos WHERE id = $1 LIMIT 1`,
      [photoId]
    );
    return result.rows[0] ?? null;
  });
}

export async function deleteProjectPhotoRepo(userId: string, companyId: string, projectId: string, photoId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        DELETE FROM public.project_photos
        WHERE id = $1 AND company_id = $2 AND project_id = $3
        RETURNING id, storage_path
      `,
      [photoId, companyId, projectId]
    );
    return result.rows[0] ?? null;
  });
}
