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
    await adminPool.query(
      `
        DELETE FROM public.document_sequences
        WHERE company_id = $1
          AND document_type = 'invoice'
      `,
      [companyId]
    );

    const sequenceBefore = await adminPool.query(
      `
        SELECT current_number
        FROM public.document_sequences
        WHERE company_id = $1
          AND document_type = 'invoice'
      `,
      [companyId]
    );
    expect(sequenceBefore.rowCount).toBe(0);

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

    expect([...docNumbers].sort()).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `FAC-${String(index + 1).padStart(6, "0")}`
      )
    );

    // Verify format prefix FAC-
    for (const num of docNumbers) {
      expect(num).toMatch(/^FAC-\d{6}$/);
    }

    const sequenceAfter = await adminPool.query(
      `
        SELECT current_number
        FROM public.document_sequences
        WHERE company_id = $1
          AND document_type = 'invoice'
      `,
      [companyId]
    );
    expect(sequenceAfter.rowCount).toBe(1);
    expect(Number(sequenceAfter.rows[0].current_number)).toBe(10);
  });

  it("3. Reinicio anual conserva formato y serializa llamadas concurrentes", async () => {
    const yearResult = await adminPool.query(
      "SELECT EXTRACT(YEAR FROM CURRENT_DATE)::integer AS current_year"
    );
    const currentYear = Number(yearResult.rows[0].current_year);

    await adminPool.query(
      `
        INSERT INTO public.document_sequences (
          company_id,
          document_type,
          prefix,
          current_number,
          padding,
          yearly_reset,
          last_reset_year
        )
        VALUES ($1, 'project', 'OBR', 41, 4, true, $2)
        ON CONFLICT ON CONSTRAINT document_sequences_unique
        DO UPDATE SET
          prefix = EXCLUDED.prefix,
          current_number = EXCLUDED.current_number,
          padding = EXCLUDED.padding,
          yearly_reset = EXCLUDED.yearly_reset,
          last_reset_year = EXCLUDED.last_reset_year
      `,
      [companyId, currentYear - 1]
    );

    const projectNumbers = await Promise.all(
      Array.from({ length: 5 }, async () => {
        const client = await adminPool.connect();
        try {
          await client.query("SELECT set_config('app.user_id', $1, false)", [userId]);
          const result = await client.query(
            "SELECT public.next_document_number($1, 'project') AS num",
            [companyId]
          );
          return result.rows[0].num;
        } finally {
          client.release();
        }
      })
    );

    expect([...projectNumbers].sort()).toEqual([
      "OBR-0001",
      "OBR-0002",
      "OBR-0003",
      "OBR-0004",
      "OBR-0005"
    ]);

    const sequenceAfter = await adminPool.query(
      `
        SELECT prefix, current_number, padding, yearly_reset, last_reset_year
        FROM public.document_sequences
        WHERE company_id = $1
          AND document_type = 'project'
      `,
      [companyId]
    );

    expect(sequenceAfter.rowCount).toBe(1);
    expect(sequenceAfter.rows[0]).toMatchObject({
      prefix: "OBR",
      padding: 4,
      yearly_reset: true,
      last_reset_year: currentYear
    });
    expect(Number(sequenceAfter.rows[0].current_number)).toBe(5);
  });

  it("4. Reinicios de Transacción y Estabilidad tras Rollback", async () => {
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

    expect(numAfter).toBe("REC-000001");
  });
});
