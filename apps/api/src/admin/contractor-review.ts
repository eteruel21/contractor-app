import { withUserTransaction } from "../db/with-user-transaction.js";
import { downloadStorageFile } from "../storage/provider.js";

export type ContractorDocumentType =
  | "identification"
  | "operation_notice"
  | "references"
  | "address_proof";

const DOCUMENT_COLUMN: Record<
  ContractorDocumentType,
  string
> = {
  identification: "doc_id_url",
  operation_notice: "doc_operation_notice_url",
  references: "doc_references_url",
  address_proof: "doc_address_proof_url"
};

const DOCUMENT_FILE_BASENAME: Record<
  ContractorDocumentType,
  string
> = {
  identification: "identificacion",
  operation_notice: "aviso-operacion",
  references: "referencias",
  address_proof: "comprobante-domicilio"
};

function expectedContractorDocumentPath(
  userId: string,
  documentType: ContractorDocumentType
): string {
  return `profile-documents/${userId}/${documentType}`;
}

function isOwnedContractorDocumentPath(
  value: unknown,
  userId: string,
  documentType: ContractorDocumentType
): boolean {
  return (
    typeof value === "string" &&
    value.trim() ===
      expectedContractorDocumentPath(
        userId,
        documentType
      )
  );
}

export function isContractorDocumentType(
  value: unknown
): value is ContractorDocumentType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(
      DOCUMENT_COLUMN,
      value
    )
  );
}

function extensionForMimeType(
  mimeType?: string
): string {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";

    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "image/webp":
      return ".webp";

    case "image/heic":
      return ".heic";

    case "image/heif":
      return ".heif";

    default:
      return "";
  }
}

export async function getContractorReview(
  adminUserId: string,
  targetUserId: string
) {
  return withUserTransaction(
    adminUserId,
    async (client) => {
      const result = await client.query(
        `
          SELECT
            profile.id,
            COALESCE(auth_user.email, '') AS email,
            COALESCE(profile.full_name, '') AS full_name,
            COALESCE(profile.phone, '') AS phone,
            profile.active,
            profile.approved_at,
            profile.created_at,

            COALESCE(profile.province, '') AS province,
            COALESCE(profile.district, '') AS district,
            COALESCE(
              profile.corregimiento,
              ''
            ) AS corregimiento,

            COALESCE(
              profile.business_name,
              ''
            ) AS business_name,

            COALESCE(
              profile.id_document,
              ''
            ) AS id_document,

            COALESCE(profile.tax_id, '') AS tax_id,
            COALESCE(profile.tax_dv, '') AS tax_dv,

            COALESCE(
              profile.primary_category,
              ''
            ) AS primary_category,

            profile.specialties,
            profile.experience_years,
            profile.work_areas,

            COALESCE(
              profile.professional_description,
              ''
            ) AS professional_description,

            COALESCE(
              profile.availability,
              ''
            ) AS availability,

            COALESCE(
              profile.preferred_contact_method,
              ''
            ) AS preferred_contact_method,

            COALESCE(
              profile.emits_invoice,
              false
            ) AS emits_invoice,

            COALESCE(
              profile.has_transport,
              false
            ) AS has_transport,

            COALESCE(
              profile.work_mode,
              ''
            ) AS work_mode,

            profile.portfolio_urls,
            profile.certifications,

            profile.doc_id_url,
            profile.doc_operation_notice_url,
            profile.doc_references_url,
            profile.doc_address_proof_url

          FROM public.profiles AS profile

          LEFT JOIN app_auth.users AS auth_user
            ON auth_user.id = profile.id

          WHERE profile.id = $1::uuid
            AND profile.role = 'contractor'

          LIMIT 1
        `,
        [targetUserId]
      );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,

        active: Boolean(row.active),
        approvedAt:
          row.approved_at ?? null,

        createdAt:
          row.created_at,

        province:
          row.province,

        district:
          row.district,

        corregimiento:
          row.corregimiento,

        businessName:
          row.business_name,

        idDocument:
          row.id_document,

        taxId:
          row.tax_id,

        taxDv:
          row.tax_dv,

        primaryCategory:
          row.primary_category,

        specialties:
          Array.isArray(row.specialties)
            ? row.specialties
            : [],

        experienceYears:
          row.experience_years === null ||
          row.experience_years === undefined
            ? null
            : Number(row.experience_years),

        workAreas:
          Array.isArray(row.work_areas)
            ? row.work_areas
            : [],

        professionalDescription:
          row.professional_description,

        availability:
          row.availability,

        preferredContactMethod:
          row.preferred_contact_method,

        emitsInvoice:
          Boolean(row.emits_invoice),

        hasTransport:
          Boolean(row.has_transport),

        workMode:
          row.work_mode,

        portfolioUrls:
          Array.isArray(row.portfolio_urls)
            ? row.portfolio_urls
            : [],

        certifications:
          Array.isArray(row.certifications)
            ? row.certifications
            : [],

        documents: {
          identification:
            isOwnedContractorDocumentPath(
              row.doc_id_url,
              targetUserId,
              "identification"
            ),

          operationNotice:
            isOwnedContractorDocumentPath(
              row.doc_operation_notice_url,
              targetUserId,
              "operation_notice"
            ),

          references:
            isOwnedContractorDocumentPath(
              row.doc_references_url,
              targetUserId,
              "references"
            ),

          addressProof:
            isOwnedContractorDocumentPath(
              row.doc_address_proof_url,
              targetUserId,
              "address_proof"
            )
        }
      };
    }
  );
}

export async function getContractorDocument(
  adminUserId: string,
  targetUserId: string,
  documentType: ContractorDocumentType
): Promise<{
  buffer: Buffer;
  mimeType: string | undefined;
  fileName: string;
} | null> {
  const column =
    DOCUMENT_COLUMN[documentType];

  const storagePath =
    await withUserTransaction(
      adminUserId,
      async (client) => {
        const result =
          await client.query(
            `
              SELECT
                ${column} AS storage_path

              FROM public.profiles

              WHERE id = $1::uuid
                AND role = 'contractor'

              LIMIT 1
            `,
            [targetUserId]
          );

        const value =
          result.rows[0]?.storage_path;

        return (
          typeof value === "string" &&
          value.trim()
        )
          ? value.trim()
          : null;
      }
    );

  const expectedStoragePath =
    expectedContractorDocumentPath(
      targetUserId,
      documentType
    );

  if (
    !storagePath ||
    storagePath !== expectedStoragePath
  ) {
    return null;
  }

  const downloaded =
    await downloadStorageFile(
      storagePath
    );

  return {
    buffer: downloaded.buffer,
    mimeType: downloaded.mimeType,

    fileName:
      `${DOCUMENT_FILE_BASENAME[documentType]}${extensionForMimeType(
        downloaded.mimeType
      )}`
  };
}
