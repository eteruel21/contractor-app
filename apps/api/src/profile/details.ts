import type { QueryResultRow } from "pg";

import { getUserStatus } from "../auth/repository.js";
import { withUserTransaction } from "../db/with-user-transaction.js";
import {
  generateSignedPhotoUrl,
  generateSignedProfileDocumentUrl
} from "../storage/signed-url.js";

export type ProfileDocumentType =
  | "identification"
  | "operation_notice"
  | "references"
  | "address_proof";

type ProfileRow = QueryResultRow & {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "super_admin" | "contractor" | "client";
  active: boolean;
  approved_at: Date | null;
  email_confirmed_at: Date | null;
  deleted_at: Date | null;
  province: string | null;
  district: string | null;
  corregimiento: string | null;
  terms_accepted: boolean;
  notifications_opt_in: boolean;
  business_name: string | null;
  id_document: string | null;
  tax_id: string | null;
  tax_dv: string | null;
  primary_category: string | null;
  specialties: string[] | null;
  experience_years: number | null;
  work_areas: string[] | null;
  professional_description: string | null;
  company_logo_url: string | null;
  portfolio_urls: string[] | null;
  certifications: string[] | null;
  availability: string | null;
  preferred_contact_method: string | null;
  emits_invoice: boolean;
  has_transport: boolean;
  work_mode: string | null;
  doc_id_url: string | null;
  doc_operation_notice_url: string | null;
  doc_technical_certs_urls: string[] | null;
  doc_references_url: string | null;
  doc_address_proof_url: string | null;
  created_at: Date;
  updated_at: Date;
};

type CompanyAssociationRow = QueryResultRow & {
  id: string;
  name: string;
  role: string | null;
  active: boolean;
};

type ClientAssociationRow = QueryResultRow & {
  id: string;
  company_name: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  active: boolean;
};

type ProjectPhotoRow = QueryResultRow & {
  id: string;
  storage_path: string;
  file_name: string;
  file_size: string | number;
  mime_type: string;
  caption: string | null;
  created_at: Date;
  project_name: string;
  company_name: string;
};

const PROFILE_DOCUMENTS: ReadonlyArray<{
  type: ProfileDocumentType;
  column: keyof Pick<
    ProfileRow,
    | "doc_id_url"
    | "doc_operation_notice_url"
    | "doc_references_url"
    | "doc_address_proof_url"
  >;
  label: string;
}> = [
  {
    type: "identification",
    column: "doc_id_url",
    label: "Cédula / Pasaporte"
  },
  {
    type: "operation_notice",
    column: "doc_operation_notice_url",
    label: "Aviso de Operación"
  },
  {
    type: "references",
    column: "doc_references_url",
    label: "Referencias comerciales o de obras"
  },
  {
    type: "address_proof",
    column: "doc_address_proof_url",
    label: "Comprobante de domicilio"
  }
];

function ownedProfileDocumentPath(
  userId: string,
  documentType: ProfileDocumentType
): string {
  return `profile-documents/${userId}/${documentType}`;
}

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

function safeHttpUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate) => {
    const url = safeHttpUrl(candidate);
    return url ? [url] : [];
  });
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim() !== ""
      )
    : [];
}

function clientDisplayName(row: ClientAssociationRow): string {
  const personName = [row.first_name, row.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return row.business_name?.trim() || personName || "Cliente sin nombre";
}

/**
 * Carga un perfil mediante la misma conexión y contexto RLS que el resto de la
 * API. La condición explícita evita que un actor no administrador pueda usar
 * esta función para consultar un identificador distinto al suyo, aunque una
 * ruta futura olvide hacer esa comprobación.
 */
export async function getUserProfileDetails(
  viewerUserId: string,
  targetUserId: string
) {
  const result = await withUserTransaction(
    viewerUserId,
    async (client) => {
      const profileResult = await client.query<ProfileRow>(
        `
          SELECT
            profile.id,
            auth_user.email,
            profile.full_name,
            profile.first_name,
            profile.last_name,
            profile.phone,
            profile.avatar_url,
            profile.role,
            profile.active,
            profile.approved_at,
            auth_user.email_confirmed_at,
            auth_user.deleted_at,
            profile.province,
            profile.district,
            profile.corregimiento,
            profile.terms_accepted,
            profile.notifications_opt_in,
            profile.business_name,
            profile.id_document,
            profile.tax_id,
            profile.tax_dv,
            profile.primary_category,
            profile.specialties,
            profile.experience_years,
            profile.work_areas,
            profile.professional_description,
            profile.company_logo_url,
            profile.portfolio_urls,
            profile.certifications,
            profile.availability,
            profile.preferred_contact_method,
            profile.emits_invoice,
            profile.has_transport,
            profile.work_mode,
            profile.doc_id_url,
            profile.doc_operation_notice_url,
            profile.doc_technical_certs_urls,
            profile.doc_references_url,
            profile.doc_address_proof_url,
            profile.created_at,
            profile.updated_at
          FROM public.profiles AS profile
          JOIN app_auth.users AS auth_user
            ON auth_user.id = profile.id
          WHERE profile.id = $1::uuid
            AND (
              profile.id = app.current_user_id()
              OR (SELECT public.is_admin())
            )
          LIMIT 1
        `,
        [targetUserId]
      );

      const profile = profileResult.rows[0];
      if (!profile) return null;

      const [companiesResult, clientsResult, photosResult] =
        await Promise.all([
          client.query<CompanyAssociationRow>(
            `
              SELECT
                company.id,
                company.name,
                membership.role::text AS role,
                membership.active
              FROM public.company_members AS membership
              JOIN public.companies AS company
                ON company.id = membership.company_id
              WHERE membership.user_id = $1::uuid
              ORDER BY membership.active DESC, company.name ASC
            `,
            [targetUserId]
          ),
          client.query<ClientAssociationRow>(
            `
              SELECT
                customer.id,
                company.name AS company_name,
                customer.first_name,
                customer.last_name,
                customer.business_name,
                customer.active
              FROM public.clients AS customer
              JOIN public.companies AS company
                ON company.id = customer.company_id
              WHERE customer.user_id = $1::uuid
              ORDER BY customer.active DESC, company.name ASC
            `,
            [targetUserId]
          ),
          client.query<ProjectPhotoRow>(
            `
              SELECT
                photo.id,
                photo.storage_path,
                photo.file_name,
                photo.file_size,
                photo.mime_type,
                photo.caption,
                photo.created_at,
                project.name AS project_name,
                company.name AS company_name
              FROM public.project_photos AS photo
              JOIN public.projects AS project
                ON project.id = photo.project_id
               AND project.company_id = photo.company_id
              JOIN public.companies AS company
                ON company.id = photo.company_id
              WHERE photo.created_by = $1::uuid
              ORDER BY photo.created_at DESC
            `,
            [targetUserId]
          )
        ]);

      return {
        profile,
        companies: companiesResult.rows,
        linkedClients: clientsResult.rows,
        photos: photosResult.rows
      };
    }
  );

  if (!result) return null;

  const { profile } = result;

  const profileDocuments = await Promise.all(
    PROFILE_DOCUMENTS.flatMap((document) => {
      const storedPath = profile[document.column];
      const expectedPath = ownedProfileDocumentPath(
        profile.id,
        document.type
      );

      if (storedPath !== expectedPath) return [];

      return [
        (async () => ({
          id: `profile-document:${document.type}`,
          type: document.type,
          label: document.label,
          available: true as const,
          url: await generateSignedProfileDocumentUrl(
            profile.id,
            document.type,
            10
          )
        }))()
      ];
    })
  );

  const projectPhotos = await Promise.all(
    result.photos.map(async (photo) => ({
      id: photo.id,
      fileName: photo.file_name,
      fileSize: Number(photo.file_size ?? 0),
      mimeType: photo.mime_type,
      caption: photo.caption,
      createdAt: photo.created_at,
      projectName: photo.project_name,
      companyName: photo.company_name,
      url: await generateSignedPhotoUrl(photo.id, 10)
    }))
  );

  const professional =
    profile.role === "contractor"
      ? {
          businessName: profile.business_name,
          idDocument: profile.id_document,
          taxId: profile.tax_id,
          taxDv: profile.tax_dv,
          primaryCategory: profile.primary_category,
          specialties: textArray(profile.specialties),
          experienceYears:
            profile.experience_years === null
              ? null
              : Number(profile.experience_years),
          workAreas: textArray(profile.work_areas),
          professionalDescription: profile.professional_description,
          companyLogoUrl: safeHttpUrl(profile.company_logo_url),
          portfolioUrls: safeHttpUrls(profile.portfolio_urls),
          certifications: textArray(profile.certifications),
          technicalCertificationUrls: safeHttpUrls(
            profile.doc_technical_certs_urls
          ),
          availability: profile.availability,
          preferredContactMethod: profile.preferred_contact_method,
          emitsInvoice: Boolean(profile.emits_invoice),
          hasTransport: Boolean(profile.has_transport),
          workMode: profile.work_mode
        }
      : null;

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone,
    avatarUrl: safeHttpUrl(profile.avatar_url),
    role: profile.role,
    active: Boolean(profile.active),
    status: getUserStatus(profile),
    approvedAt: profile.approved_at,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    location: {
      province: profile.province,
      district: profile.district,
      corregimiento: profile.corregimiento
    },
    preferences: {
      termsAccepted: Boolean(profile.terms_accepted),
      notificationsOptIn: Boolean(profile.notifications_opt_in)
    },
    professional,
    associations: {
      companies: result.companies.map((company) => ({
        id: company.id,
        name: company.name,
        role: company.role,
        active: Boolean(company.active)
      })),
      linkedClients: result.linkedClients.map((linkedClient) => ({
        id: linkedClient.id,
        companyName: linkedClient.company_name,
        displayName: clientDisplayName(linkedClient),
        active: Boolean(linkedClient.active)
      }))
    },
    resources: {
      profileDocuments,
      projectPhotos
    }
  };
}

export const profileDetailsInternals = {
  safeHttpUrl,
  safeHttpUrls,
  ownedProfileDocumentPath
};
