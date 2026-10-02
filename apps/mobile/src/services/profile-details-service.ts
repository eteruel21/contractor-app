import {
  API_URL,
  authenticatedRequest
} from "./api";

export type ProfileStatus =
  | "email_pending"
  | "pending_approval"
  | "active"
  | "suspended"
  | "deactivated";

export type ProfileDocumentResource = {
  id: string;
  type:
    | "identification"
    | "operation_notice"
    | "references"
    | "address_proof";
  label: string;
  available: true;
  url: string;
};

export type ProjectPhotoResource = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption: string | null;
  createdAt: string;
  projectName: string;
  companyName: string;
  url: string;
};

export type UserProfileDetails = {
  id: string;
  email: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: "super_admin" | "contractor" | "client";
  active: boolean;
  status: ProfileStatus;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    province: string | null;
    district: string | null;
    corregimiento: string | null;
  };
  preferences: {
    termsAccepted: boolean;
    notificationsOptIn: boolean;
  };
  professional: {
    businessName: string | null;
    idDocument: string | null;
    taxId: string | null;
    taxDv: string | null;
    primaryCategory: string | null;
    specialties: string[];
    experienceYears: number | null;
    workAreas: string[];
    professionalDescription: string | null;
    companyLogoUrl: string | null;
    portfolioUrls: string[];
    certifications: string[];
    technicalCertificationUrls: string[];
    availability: string | null;
    preferredContactMethod: string | null;
    emitsInvoice: boolean;
    hasTransport: boolean;
    workMode: string | null;
  } | null;
  associations: {
    companies: {
      id: string;
      name: string;
      role: string | null;
      active: boolean;
    }[];
    linkedClients: {
      id: string;
      companyName: string;
      displayName: string;
      active: boolean;
    }[];
  };
  resources: {
    profileDocuments: ProfileDocumentResource[];
    projectPhotos: ProjectPhotoResource[];
  };
};

export async function loadOwnProfileDetails(): Promise<UserProfileDetails> {
  return authenticatedRequest<UserProfileDetails>("/profile/details");
}

export function absoluteProfileResourceUrl(value: string): string | null {
  try {
    const url = new URL(value, `${API_URL}/`);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
