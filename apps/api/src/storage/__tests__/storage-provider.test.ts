import assert from "node:assert/strict";
import { test } from "vitest";
import {
  buildSecureStorageKey,
  sanitizeExtension,
  uploadStorageFile,
  downloadStorageFile,
  deleteStorageFile,
  getStorageSignedUrl
} from "../provider.js";

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
