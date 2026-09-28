import { describe, expect, it } from "vitest";

import {
  toPublicUserProfile,
  type UserProfile
} from "../../auth/repository.js";
import {
  profileDetailsInternals
} from "../details.js";
import {
  generateSignedProfileDocumentUrl,
  verifyProfileDocumentToken
} from "../../storage/signed-url.js";

describe("perfil público seguro", () => {
  it("sólo conserva enlaces HTTP(S) y descarta rutas internas o esquemas activos", () => {
    expect(
      profileDetailsInternals.safeHttpUrl(
        "https://example.test/portfolio"
      )
    ).toBe("https://example.test/portfolio");

    expect(
      profileDetailsInternals.safeHttpUrl(
        "javascript:alert(1)"
      )
    ).toBeNull();

    expect(
      profileDetailsInternals.safeHttpUrl(
        "profile-documents/user-id/identification"
      )
    ).toBeNull();

    expect(
      profileDetailsInternals.safeHttpUrls([
        "https://example.test/uno",
        "data:text/html,unsafe",
        null
      ])
    ).toEqual(["https://example.test/uno"]);
  });

  it("no devuelve metadatos internos ni referencias privadas en la sesión", () => {
    const profile = {
      id: "00000000-0000-4000-8000-000000000001",
      email: "user@example.test",
      full_name: "Usuario Prueba",
      role: "contractor",
      active: true,
      approved_at: new Date(),
      email_confirmed_at: new Date(),
      deleted_at: null,
      registration_ip: "203.0.113.10",
      registration_device: "internal-fingerprint",
      doc_id_url: "profile-documents/private/id",
      doc_operation_notice_url: "profile-documents/private/notice",
      doc_technical_certs_urls: ["profile-documents/private/cert"],
      doc_references_url: "profile-documents/private/references",
      doc_address_proof_url: "profile-documents/private/address"
    } as unknown as UserProfile;

    const result = toPublicUserProfile(profile);

    expect(result.id).toBe(profile.id);
    expect(result.status).toBe("active");
    expect(result).not.toHaveProperty("registration_ip");
    expect(result).not.toHaveProperty("registration_device");
    expect(result).not.toHaveProperty("email_confirmed_at");
    expect(result).not.toHaveProperty("deleted_at");
    expect(result).not.toHaveProperty("doc_id_url");
    expect(result).not.toHaveProperty("doc_operation_notice_url");
    expect(result).not.toHaveProperty("doc_technical_certs_urls");
    expect(result).not.toHaveProperty("doc_references_url");
    expect(result).not.toHaveProperty("doc_address_proof_url");
  });
});

describe("URLs firmadas de documentos", () => {
  it("liga el token al usuario y tipo exactos", async () => {
    const userId = "00000000-0000-4000-8000-000000000001";
    const url = await generateSignedProfileDocumentUrl(
      userId,
      "identification",
      10
    );
    const token = new URL(url, "https://api.example.test")
      .searchParams
      .get("token");

    expect(token).toBeTruthy();
    expect(
      await verifyProfileDocumentToken(
        token!,
        userId,
        "identification"
      )
    ).toBe(true);
    expect(
      await verifyProfileDocumentToken(
        token!,
        "00000000-0000-4000-8000-000000000002",
        "identification"
      )
    ).toBe(false);
    expect(
      await verifyProfileDocumentToken(
        token!,
        userId,
        "references"
      )
    ).toBe(false);
  });
});
