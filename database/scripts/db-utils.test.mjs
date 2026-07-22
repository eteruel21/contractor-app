import assert from "node:assert/strict";
import test from "node:test";

import {
  checksum,
  quoteIdentifier,
  quoteLiteral,
  stripOuterTransaction,
  stripPsqlMetaCommands,
  validateTestDatabaseUrl,
} from "./db-utils.mjs";

test("calcula checksums SHA-256 estables", () => {
  assert.equal(
    checksum("contractor-app"),
    "234c141811755f52e1ea80a3e2761c5c6c1194f5bd6aa728cf8d32318632e31d",
  );
});

test("normaliza saltos de línea antes de calcular checksums", () => {
  const expected = checksum("BEGIN;\nSELECT 1;\nCOMMIT;\n");

  assert.equal(checksum("BEGIN;\r\nSELECT 1;\r\nCOMMIT;\r\n"), expected);
  assert.equal(checksum("BEGIN;\rSELECT 1;\rCOMMIT;\r"), expected);
});

test("retira únicamente la transacción exterior", () => {
  assert.equal(
    stripOuterTransaction("BEGIN;\nSELECT 1;\nCOMMIT;\n", "001_test.sql"),
    "SELECT 1;",
  );
});

test("permite comentarios SQL antes de la transacción exterior", () => {
  assert.equal(
    stripOuterTransaction(
      "-- encabezado\n/* metadatos */\nbegin;\nSELECT 1;\ncommit;\n",
      "001_seed.sql",
    ),
    "SELECT 1;",
  );
});

test("conserva la verificación SQL posterior al COMMIT", () => {
  assert.equal(
    stripOuterTransaction(
      "-- Catálogo oficial\n\nbegin;\nINSERT INTO catalog VALUES (1);\n\ncommit;\n\n-- Verificación esperada\nselect count(*) as partidas_importadas from catalog;\n",
      "001_seed.sql",
    ),
    "INSERT INTO catalog VALUES (1);\n\n-- Verificación esperada\nselect count(*) as partidas_importadas from catalog;",
  );
});

test("rechaza migraciones sin transacción exterior", () => {
  assert.throws(
    () => stripOuterTransaction("SELECT 1;", "001_test.sql"),
    /debe contener una transacción exterior delimitada por BEGIN; y COMMIT;/u,
  );
});

test("retira los delimitadores de seguridad generados por pg_dump", () => {
  assert.equal(
    stripPsqlMetaCommands(
      "SELECT 1;\n\\restrict token\nSELECT 2;\n\\unrestrict token",
      "003_dump.sql",
    ),
    "SELECT 1;\nSELECT 2;",
  );
});

test("rechaza otros comandos exclusivos de psql", () => {
  assert.throws(
    () => stripPsqlMetaCommands("\\connect otra_base", "003_dump.sql"),
    /comandos psql no compatibles/u,
  );
});

test("escapa literales y valida identificadores", () => {
  assert.equal(quoteIdentifier("contractor_pro"), '"contractor_pro"');
  assert.equal(quoteLiteral("se'creto"), "'se''creto'");
  assert.throws(() => quoteIdentifier("contractor-pro"), /inválido/u);
});

test("acepta únicamente URLs de bases marcadas como pruebas", () => {
  const safeUrl = "postgresql://localhost:5432/contractor_ci_test";

  assert.equal(validateTestDatabaseUrl(safeUrl, "test"), safeUrl);
  assert.throws(
    () => validateTestDatabaseUrl("postgresql://localhost:5432/contractor_pro", "test"),
    /inequívocamente de pruebas/u,
  );
  assert.throws(
    () => validateTestDatabaseUrl("postgresql://localhost:5432/staging_test", "test"),
    /nunca prod, staging, main o live/u,
  );
  assert.throws(
    () => validateTestDatabaseUrl(safeUrl, "production"),
    /NODE_ENV=test/u,
  );
});
