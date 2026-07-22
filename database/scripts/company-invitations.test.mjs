import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";

import pg from "pg";

import { requireTestDatabaseUrl } from "./db-utils.mjs";

const { Client } = pg;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function setRole(client, role, userId) {
  await client.query(`SET LOCAL ROLE ${role}`);
  await client.query(
    "SELECT set_config('app.user_id', $1, true)",
    [userId ?? ""],
  );
}

async function expectDatabaseError(client, savepoint, callback, errorCode = "42501") {
  await client.query(`SAVEPOINT ${savepoint}`);

  try {
    await callback();
    assert.fail("La consulta debía ser rechazada por PostgreSQL.");
  } catch (error) {
    assert.equal(error?.code, errorCode);
  } finally {
    await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
    await client.query(`RELEASE SAVEPOINT ${savepoint}`);
  }
}

test("las invitaciones protegen token, correo, rol y concurrencia", async () => {
  const client = new Client({ connectionString: requireTestDatabaseUrl() });
  const inviterId = randomUUID();
  const inviteeId = randomUUID();
  const outsiderId = randomUUID();
  const companyId = randomUUID();
  const suffix = randomUUID();
  const inviterEmail = `inviter-${suffix}@example.test`;
  const inviteeEmail = `invitee-${suffix}@example.test`;
  const outsiderEmail = `outsider-${suffix}@example.test`;

  await client.connect();
  await client.query("BEGIN");

  try {
    await setRole(client, "contractor_owner", null);
    await client.query(
      `
        INSERT INTO app_auth.users (
          id,
          email,
          email_confirmed_at,
          raw_user_meta_data
        )
        VALUES
          ($1, $2, now(), jsonb_build_object('full_name', 'Invitador')),
          ($3, $4, now(), jsonb_build_object('full_name', 'Invitado')),
          ($5, $6, now(), jsonb_build_object('full_name', 'Tercero'))
      `,
      [
        inviterId,
        inviterEmail,
        inviteeId,
        inviteeEmail,
        outsiderId,
        outsiderEmail,
      ],
    );

    await client.query(
      `
        UPDATE public.profiles
        SET active = true, approved_at = now(), terms_accepted = true
        WHERE id = ANY($1::uuid[])
      `,
      [[inviterId, inviteeId, outsiderId]],
    );

    await client.query(
      `
        INSERT INTO public.companies (id, name, created_by)
        VALUES ($1, 'Empresa de invitaciones', $2)
      `,
      [companyId, inviterId],
    );

    await client.query(
      `
        INSERT INTO public.company_members (company_id, user_id, role, active)
        VALUES ($1, $2, 'owner', true)
      `,
      [companyId, inviterId],
    );

    const firstToken = randomUUID();
    const firstHash = hashToken(firstToken);

    await setRole(client, "contractor_api", inviterId);
    const firstInvitation = await client.query(
      `
        SELECT *
        FROM private.create_company_invitation(
          $1,
          $2,
          'member'::public.company_role,
          $3,
          now() + interval '7 days'
        )
      `,
      [companyId, inviteeEmail.toUpperCase(), firstHash],
    );

    assert.equal(firstInvitation.rowCount, 1);
    assert.equal(firstInvitation.rows[0].created_email, inviteeEmail);

    const secondToken = randomUUID();
    const secondHash = hashToken(secondToken);
    const reissuedInvitation = await client.query(
      `
        SELECT *
        FROM private.create_company_invitation(
          $1,
          $2,
          'admin'::public.company_role,
          $3,
          now() + interval '7 days'
        )
      `,
      [companyId, inviteeEmail, secondHash],
    );

    assert.equal(reissuedInvitation.rowCount, 1);
    assert.equal(
      reissuedInvitation.rows[0].created_invitation_id,
      firstInvitation.rows[0].created_invitation_id,
    );

    await expectDatabaseError(client, "token_hash_is_private", async () => {
      await client.query(
        "SELECT token_hash FROM public.company_invitations WHERE company_id = $1",
        [companyId],
      );
    });

    const ownerEscalation = await client.query(
      `
        SELECT *
        FROM private.create_company_invitation(
          $1,
          $2,
          'owner'::public.company_role,
          $3,
          now() + interval '7 days'
        )
      `,
      [companyId, inviteeEmail, hashToken(randomUUID())],
    );
    assert.equal(ownerEscalation.rowCount, 0);

    await setRole(client, "contractor_api", outsiderId);
    const hiddenInvitations = await client.query(
      `
        SELECT id
        FROM public.company_invitations
        WHERE company_id = $1
      `,
      [companyId],
    );
    assert.equal(hiddenInvitations.rowCount, 0);

    const wrongEmailAcceptance = await client.query(
      "SELECT * FROM private.accept_company_invitation($1)",
      [secondHash],
    );
    assert.equal(wrongEmailAcceptance.rowCount, 0);

    await setRole(client, "contractor_api", inviteeId);
    const rotatedTokenAcceptance = await client.query(
      "SELECT * FROM private.accept_company_invitation($1)",
      [firstHash],
    );
    assert.equal(rotatedTokenAcceptance.rowCount, 0);

    const acceptedInvitation = await client.query(
      "SELECT * FROM private.accept_company_invitation($1)",
      [secondHash],
    );
    assert.equal(acceptedInvitation.rowCount, 1);
    assert.equal(acceptedInvitation.rows[0].accepted_company_id, companyId);

    const repeatedAcceptance = await client.query(
      "SELECT * FROM private.accept_company_invitation($1)",
      [secondHash],
    );
    assert.equal(repeatedAcceptance.rowCount, 0);

    await setRole(client, "contractor_owner", null);
    const storedInvitation = await client.query(
      `
        SELECT token_hash, status, role
        FROM public.company_invitations
        WHERE id = $1
      `,
      [firstInvitation.rows[0].created_invitation_id],
    );
    assert.equal(storedInvitation.rows[0].token_hash, secondHash);
    assert.equal(storedInvitation.rows[0].status, "accepted");
    assert.equal(storedInvitation.rows[0].role, "admin");

    const membership = await client.query(
      `
        SELECT role, active
        FROM public.company_members
        WHERE company_id = $1 AND user_id = $2
      `,
      [companyId, inviteeId],
    );
    assert.deepEqual(membership.rows[0], { role: "admin", active: true });

    await setRole(client, "contractor_api", inviteeId);
    const adminCannotDeactivateOwner = await client.query(
      `
        UPDATE public.company_members
        SET active = false
        WHERE company_id = $1 AND user_id = $2
        RETURNING id
      `,
      [companyId, inviterId],
    );
    assert.equal(adminCannotDeactivateOwner.rowCount, 0);

    await setRole(client, "contractor_api", inviterId);
    await expectDatabaseError(
      client,
      "last_owner_is_required",
      async () => {
        await client.query(
          `
            UPDATE public.company_members
            SET role = 'member'::public.company_role
            WHERE company_id = $1 AND user_id = $2
          `,
          [companyId, inviterId],
        );
      },
      "23514",
    );

    const promotedOwner = await client.query(
      `
        UPDATE public.company_members
        SET role = 'owner'::public.company_role
        WHERE company_id = $1 AND user_id = $2
        RETURNING id
      `,
      [companyId, inviteeId],
    );
    assert.equal(promotedOwner.rowCount, 1);

    const transferredOwnership = await client.query(
      `
        UPDATE public.company_members
        SET role = 'member'::public.company_role
        WHERE company_id = $1 AND user_id = $2
        RETURNING id
      `,
      [companyId, inviterId],
    );
    assert.equal(transferredOwnership.rowCount, 1);

    const activeOwners = await client.query(
      `
        SELECT count(*)::integer AS owner_count
        FROM public.company_members
        WHERE company_id = $1
          AND role = 'owner'::public.company_role
          AND active = true
      `,
      [companyId],
    );
    assert.equal(activeOwners.rows[0].owner_count, 1);

    await setRole(client, "contractor_owner", null);
    const auditActions = await client.query(
      `
        SELECT action, count(*)::integer AS action_count
        FROM public.admin_audit_logs
        WHERE company_id = $1
          AND target_type = 'company_invitation'
        GROUP BY action
      `,
      [companyId],
    );
    assert.deepEqual(
      Object.fromEntries(
        auditActions.rows.map((row) => [row.action, row.action_count]),
      ),
      {
        INVITATION_ACCEPTED: 1,
        INVITATION_CREATED: 2,
      },
    );

    const deletedCompany = await client.query(
      "DELETE FROM public.companies WHERE id = $1 RETURNING id",
      [companyId],
    );
    assert.equal(deletedCompany.rowCount, 1);
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    await client.end();
  }
});
