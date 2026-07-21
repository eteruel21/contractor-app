import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { adminPool } from "../../db/test-db.js";

describe("T-058: Suite de Pruebas de Numeración de Documentos (Concurrencia, Duplicados, Transacciones)", () => {
  const suffix = Math.floor(Math.random() * 1000000);
  const testEmail = `doc_num_${suffix}@example.com`;
  let userId: string;
  let companyId: string;

  beforeAll(async () => {
    const userRes = await adminPool.query(`
      INSERT INTO app_auth.users (email, email_confirmed_at)
      VALUES ($1, now())
      RETURNING id
    `, [testEmail]);
    userId = userRes.rows[0].id;

    await adminPool.query(`
      UPDATE public.profiles SET active = true, approved_at = now() WHERE id = $1
    `, [userId]);

    const compRes = await adminPool.query(`
      INSERT INTO public.companies (name, created_by)
      VALUES ($1, $2)
      RETURNING id
    `, [`Company DocNum ${suffix}`, userId]);
    companyId = compRes.rows[0].id;

    await adminPool.query(`
      INSERT INTO public.company_members (company_id, user_id, role, active)
      VALUES ($1, $2, 'owner', true)
    `, [companyId, userId]);
  });

  afterAll(async () => {
    await adminPool.query("DELETE FROM public.companies WHERE id = $1", [companyId]);
    await adminPool.query("DELETE FROM app_auth.users WHERE id = $1", [userId]);
  });

  it("1. Generación Secuencial de Números de Documento", async () => {
    const fetchDoc = async () => {
      const client = await adminPool.connect();
      try {
        await client.query("SELECT set_config('app.user_id', $1, false)", [userId]);
        const res = await client.query("SELECT public.next_document_number($1, 'budget') AS num", [companyId]);
        return res.rows[0].num;
      } finally {
        client.release();
      }
    };

    const num1 = await fetchDoc();
    const num2 = await fetchDoc();
    const num3 = await fetchDoc();

    expect(num1).toBe("COT-000001");
    expect(num2).toBe("COT-000002");
    expect(num3).toBe("COT-000003");
  });

  it("2. Concurrencia: Múltiples llamadas concurrentes generan números únicos sin duplicados", async () => {
    const promises = Array.from({ length: 10 }).map(async () => {
      const client = await adminPool.connect();
      try {
        await client.query("SELECT set_config('app.user_id', $1, false)", [userId]);
        const res = await client.query("SELECT public.next_document_number($1, 'invoice') AS num", [companyId]);
        return res.rows[0].num;
      } finally {
        client.release();
      }
    });

    const docNumbers = await Promise.all(promises);

    // Verify all 10 document numbers are unique
    const uniqueNumbers = new Set(docNumbers);
    expect(uniqueNumbers.size).toBe(10);

    // Verify format prefix FAC-
    for (const num of docNumbers) {
      expect(num).toMatch(/^FAC-\d{6}$/);
    }
  });

  it("3. Reinicios de Transacción y Estabilidad tras Rollback", async () => {
    const client = await adminPool.connect();
    let numInRollback: string | null = null;
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
      const res = await client.query("SELECT public.next_document_number($1, 'receipt') AS num", [companyId]);
      numInRollback = res.rows[0].num;
      expect(numInRollback).toBe("REC-000001");

      // Rollback transaction
      await client.query("ROLLBACK");
    } finally {
      client.release();
    }

    // Subsequent call after rollback generates next valid number without crash
    const client2 = await adminPool.connect();
    let numAfter: string;
    try {
      await client2.query("SELECT set_config('app.user_id', $1, false)", [userId]);
      const resAfterRollback = await client2.query("SELECT public.next_document_number($1, 'receipt') AS num", [companyId]);
      numAfter = resAfterRollback.rows[0].num;
    } finally {
      client2.release();
    }

    expect(numAfter).toBeDefined();
    expect(numAfter).toMatch(/^REC-\d{6}$/);
  });
});
