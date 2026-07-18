import assert from "node:assert/strict";
import test from "node:test";

import {
  checksum,
  quoteIdentifier,
  quoteLiteral,
  stripOuterTransaction,
} from "./db-utils.mjs";

test("calcula checksums SHA-256 estables", () => {
  assert.equal(
    checksum("contractor-app"),
    "234c141811755f52e1ea80a3e2761c5c6c1194f5bd6aa728cf8d32318632e31d",
  );
});

test("retira únicamente la transacción exterior", () => {
  assert.equal(
    stripOuterTransaction("BEGIN;\nSELECT 1;\nCOMMIT;\n", "001_test.sql"),
    "SELECT 1;",
  );
});

test("rechaza migraciones sin transacción exterior", () => {
  assert.throws(
    () => stripOuterTransaction("SELECT 1;", "001_test.sql"),
    /debe comenzar con BEGIN; y terminar con COMMIT;/u,
  );
});

test("escapa literales y valida identificadores", () => {
  assert.equal(quoteIdentifier("contractor_pro"), '"contractor_pro"');
  assert.equal(quoteLiteral("se'creto"), "'se''creto'");
  assert.throws(() => quoteIdentifier("contractor-pro"), /inválido/u);
});
