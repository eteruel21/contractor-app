import { authenticatedRequest } from "./api";

export type ProfileDocumentType =
  | "identification"
  | "operation_notice"
  | "references"
  | "address_proof";

export type ProfileDocumentMimeType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/heic"
  | "image/heif";

export type UploadProfileDocumentInput = {
  documentType: ProfileDocumentType;
  fileName: string;
  mimeType: ProfileDocumentMimeType;
  fileData: string;
};

export type UploadProfileDocumentResponse = {
  storagePath: string;
  fileName: string;
  mimeType: ProfileDocumentMimeType;
  fileSize: number;
};

export async function uploadProfileDocument(
  input: UploadProfileDocumentInput
): Promise<UploadProfileDocumentResponse> {
  return authenticatedRequest<UploadProfileDocumentResponse>(
    "/profile/documents",
    {
      method: "POST",
      body: JSON.stringify(input)
    }
  );
}