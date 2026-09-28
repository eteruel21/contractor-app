import assert from "node:assert/strict";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  assertStorageConfigured,
  buildSecureStorageKey,
  configureR2Storage,
  sanitizeExtension,
  isLocalStorageFallbackAllowed,
  uploadStorageFile,
  downloadStorageFile,
  deleteStorageFile,
  getStorageSignedUrl,
  type R2BucketBinding
} from "../provider.js";

afterEach(() => {
  configureR2Storage(null);
});

test("buildSecureStorageKey: genera claves de almacenamiento seguras basadas en UUID", () => {
  const companyId = "11111111-1111-1111-1111-111111111111";
  const projectId = "22222222-2222-2222-2222-222222222222";
  const userFileName = "mi_foto_super_insegura <script>.PNG";

  const storageKey = buildSecureStorageKey(companyId, projectId, userFileName);

  assert.ok(storageKey.startsWith(`projects/${companyId}/${projectId}/`));
  assert.ok(storageKey.endsWith(".png"));
  assert.equal(storageKey.includes("<script>"), false);
  assert.equal(storageKey.includes("mi_foto_super_insegura"), false);
});

test("sanitizeExtension: normaliza extensiones inseguras o desconocidas a .jpg", () => {
  assert.equal(sanitizeExtension("test.PNG"), ".png");
  assert.equal(sanitizeExtension("foto.jpeg"), ".jpeg");
  assert.equal(sanitizeExtension("documento.pdf"), ".pdf");
  assert.equal(sanitizeExtension("malicioso.exe"), ".jpg");
  assert.equal(sanitizeExtension("script.sh"), ".jpg");
});

test("Operaciones de almacenamiento: subida, descarga, firma y eliminación", async () => {
  const companyId = "33333333-3333-3333-3333-333333333333";
  const projectId = "44444444-4444-4444-4444-444444444444";
  const key = buildSecureStorageKey(companyId, projectId, "test.jpg");
  const testBuffer = Buffer.from("test image content 123");

  await uploadStorageFile({
    storagePath: key,
    buffer: testBuffer,
    mimeType: "image/jpeg"
  });

  const downloaded = await downloadStorageFile(key);
  assert.equal(downloaded.buffer.toString(), "test image content 123");

  const signedUrl = await getStorageSignedUrl("photo-123", key, 60);
  assert.ok(signedUrl.length > 0);

  await deleteStorageFile(key);
});

describe("configuración productiva de R2", () => {
  test("solo permite el fallback local en desarrollo y pruebas", () => {
    expect(isLocalStorageFallbackAllowed("development")).toBe(true);
    expect(isLocalStorageFallbackAllowed("test")).toBe(true);
    expect(isLocalStorageFallbackAllowed("staging")).toBe(false);
    expect(isLocalStorageFallbackAllowed("production")).toBe(false);
  });

  test.each(["staging", "production"] as const)(
    "requiere R2_STORAGE en %s",
    (runtimeEnvironment) => {
      expect(() =>
        assertStorageConfigured(null, runtimeEnvironment)
      ).toThrow("R2_STORAGE es obligatorio");
    }
  );

  test.each(["development", "test"] as const)(
    "acepta almacenamiento local en %s",
    (runtimeEnvironment) => {
      expect(() =>
        assertStorageConfigured(null, runtimeEnvironment)
      ).not.toThrow();
    }
  );

  test("acepta un binding R2 en producción", () => {
    const bucket = createR2BucketMock();

    expect(() =>
      assertStorageConfigured(bucket, "production")
    ).not.toThrow();
  });
});

test("Operaciones de almacenamiento usan el binding R2 configurado", async () => {
  const storedObjects = new Map<
    string,
    { buffer: Buffer; contentType?: string }
  >();
  const bucket = createR2BucketMock(storedObjects);
  configureR2Storage(bucket);

  const storagePath = "projects/company/project/object.pdf";
  const buffer = Buffer.from("contenido privado");

  await uploadStorageFile({
    storagePath,
    buffer,
    mimeType: "application/pdf"
  });

  expect(bucket.put).toHaveBeenCalledWith(
    storagePath,
    buffer,
    {
      httpMetadata: {
        contentType: "application/pdf"
      }
    }
  );

  const downloaded = await downloadStorageFile(storagePath);
  expect(downloaded.buffer).toEqual(buffer);
  expect(downloaded.mimeType).toBe("application/pdf");

  await deleteStorageFile(storagePath);
  expect(bucket.delete).toHaveBeenCalledWith(storagePath);
  expect(storedObjects.has(storagePath)).toBe(false);
});

function createR2BucketMock(
  storedObjects = new Map<
    string,
    { buffer: Buffer; contentType?: string }
  >()
): R2BucketBinding {
  return {
    put: vi.fn(async (key, value, options) => {
      const contentType = options?.httpMetadata?.contentType;
      const storedObject: {
        buffer: Buffer;
        contentType?: string;
      } = {
        buffer: Buffer.from(
          value.buffer,
          value.byteOffset,
          value.byteLength
        )
      };

      if (contentType) {
        storedObject.contentType = contentType;
      }

      storedObjects.set(key, storedObject);
    }),
    get: vi.fn(async (key) => {
      const object = storedObjects.get(key);
      if (!object) {
        return null;
      }

      const result: {
        arrayBuffer(): Promise<ArrayBuffer>;
        httpMetadata?: { contentType?: string };
      } = {
        arrayBuffer: async () => object.buffer.buffer.slice(
          object.buffer.byteOffset,
          object.buffer.byteOffset + object.buffer.byteLength
        ) as ArrayBuffer
      };

      if (object.contentType) {
        result.httpMetadata = {
          contentType: object.contentType
        };
      }

      return result;
    }),
    delete: vi.fn(async (key) => {
      for (const objectKey of Array.isArray(key) ? key : [key]) {
        storedObjects.delete(objectKey);
      }
    })
  };
}
