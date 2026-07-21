import { withUserTransaction } from "../db/with-user-transaction.js";
import type { z } from "zod";
import type {
  clientFieldsSchema,
  createClientSchema,
  addressSchema
} from "./schemas.js";

export type ClientFieldsInput = z.infer<typeof clientFieldsSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

const clientDetailsQuery = `
  SELECT
    client.*,

    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(address)
          ORDER BY address.created_at ASC
        )
        FROM public.client_addresses AS address
        WHERE address.client_id = client.id
          AND address.company_id = client.company_id
      ),
      '[]'::jsonb
    ) AS addresses,

    COALESCE(
      (
        SELECT jsonb_agg(
          to_jsonb(contact)
          ORDER BY contact.created_at ASC
        )
        FROM public.client_contacts AS contact
        WHERE contact.client_id = client.id
          AND contact.company_id = client.company_id
      ),
      '[]'::jsonb
    ) AS contacts

  FROM public.clients AS client
`;

export async function findContractorCompaniesRepo(userId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(`
      SELECT DISTINCT
        company.id,
        company.name,
        company.phone,
        company.email,
        company.address
      FROM public.clients AS customer
      JOIN public.companies AS company ON company.id = customer.company_id
      WHERE customer.user_id = app.current_user_id()
        AND customer.active = true
        AND company.active = true
      ORDER BY company.name ASC
    `);
    return result.rows;
  });
}

export async function findCompanyClientsRepo(userId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${clientDetailsQuery}
        WHERE client.company_id = $1
          AND client.active = true
        ORDER BY client.created_at DESC
      `,
      [companyId]
    );
    return result.rows;
  });
}

export async function createClientRepo(userId: string, input: CreateClientInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        INSERT INTO public.clients (
          company_id, client_type, first_name, last_name, business_name, document_type, document_number, email, phone, secondary_phone, notes, created_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, app.current_user_id()
        )
        RETURNING *
      `,
      [
        input.companyId,
        input.clientType,
        input.clientType === "person" ? input.firstName || null : null,
        input.clientType === "person" ? input.lastName || null : null,
        input.clientType === "business" ? input.businessName : null,
        input.documentType || null,
        input.documentNumber || null,
        input.email ? input.email.toLowerCase() : null,
        input.phone || null,
        input.secondaryPhone || null,
        input.notes || null
      ]
    );

    const customer = result.rows[0] ?? null;

    if (customer && input.address.length >= 3) {
      await client.query(
        `
          INSERT INTO public.client_addresses (
            company_id, client_id, label, address, reference, is_primary
          )
          VALUES ($1, $2, $3, $4, $5, true)
        `,
        [
          input.companyId,
          customer.id,
          input.addressLabel || "Principal",
          input.address,
          input.reference || null
        ]
      );
    }

    return customer;
  });
}

export async function getClientDetailsRepo(userId: string, companyId: string, clientId: string) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        ${clientDetailsQuery}
        WHERE client.company_id = $1
          AND client.id = $2
        LIMIT 1
      `,
      [companyId, clientId]
    );
    return result.rows[0] ?? null;
  });
}

export async function updateClientRepo(userId: string, clientId: string, input: ClientFieldsInput) {
  return withUserTransaction(userId, async (client) => {
    const result = await client.query(
      `
        UPDATE public.clients
        SET
          client_type = $1,
          first_name = $2,
          last_name = $3,
          business_name = $4,
          document_type = $5,
          document_number = $6,
          email = $7,
          phone = $8,
          secondary_phone = $9,
          notes = $10,
          updated_at = now()
        WHERE id = $11
          AND company_id = $12
        RETURNING *
      `,
      [
        input.clientType,
        input.clientType === "person" ? input.firstName || null : null,
        input.clientType === "person" ? input.lastName || null : null,
        input.clientType === "business" ? input.businessName : null,
        input.documentType || null,
        input.documentNumber || null,
        input.email ? input.email.toLowerCase() : null,
        input.phone || null,
        input.secondaryPhone || null,
        input.notes || null,
        clientId,
        input.companyId
      ]
    );
    return result.rows[0] ?? null;
  });
}

export async function deactivateClientRepo(userId: string, clientId: string, companyId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        UPDATE public.clients
        SET active = false, updated_at = now()
        WHERE id = $1 AND company_id = $2
      `,
      [clientId, companyId]
    );
  });
}

export async function addClientAddressRepo(userId: string, clientId: string, input: AddressInput) {
  return withUserTransaction(userId, async (client) => {
    if (input.isPrimary) {
      await client.query(
        `
          UPDATE public.client_addresses
          SET is_primary = false, updated_at = now()
          WHERE company_id = $1 AND client_id = $2
        `,
        [input.companyId, clientId]
      );
    }

    const result = await client.query(
      `
        INSERT INTO public.client_addresses (
          company_id, client_id, label, address, province, district, township, reference, is_primary
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [
        input.companyId,
        clientId,
        input.label || "Dirección",
        input.address,
        input.province || null,
        input.district || null,
        input.township || null,
        input.reference || null,
        input.isPrimary
      ]
    );

    return result.rows[0] ?? null;
  });
}

export async function updateClientAddressRepo(userId: string, clientId: string, addressId: string, input: AddressInput) {
  return withUserTransaction(userId, async (client) => {
    if (input.isPrimary) {
      await client.query(
        `
          UPDATE public.client_addresses
          SET is_primary = false, updated_at = now()
          WHERE company_id = $1 AND client_id = $2
        `,
        [input.companyId, clientId]
      );
    }

    const result = await client.query(
      `
        UPDATE public.client_addresses
        SET
          label = $1,
          address = $2,
          province = $3,
          district = $4,
          township = $5,
          reference = $6,
          is_primary = $7,
          updated_at = now()
        WHERE id = $8 AND client_id = $9 AND company_id = $10
        RETURNING *
      `,
      [
        input.label || "Dirección",
        input.address,
        input.province || null,
        input.district || null,
        input.township || null,
        input.reference || null,
        input.isPrimary,
        addressId,
        clientId,
        input.companyId
      ]
    );

    return result.rows[0] ?? null;
  });
}

export async function setPrimaryClientAddressRepo(userId: string, companyId: string, clientId: string, addressId: string) {
  return withUserTransaction(userId, async (client) => {
    await client.query(
      `
        SELECT public.set_primary_client_address(
          p_company_id => $1,
          p_client_id => $2,
          p_address_id => $3
        )
      `,
      [companyId, clientId, addressId]
    );
  });
}

export async function deleteClientAddressRepo(userId: string, companyId: string, clientId: string, addressId: string) {
  return withUserTransaction(userId, async (client) => {
    const targetResult = await client.query<{ is_primary: boolean }>(
      `
        SELECT is_primary
        FROM public.client_addresses
        WHERE id = $1 AND client_id = $2 AND company_id = $3
        FOR UPDATE
      `,
      [addressId, clientId, companyId]
    );

    const target = targetResult.rows[0];
    if (!target) return false;

    await client.query(
      `
        DELETE FROM public.client_addresses
        WHERE id = $1 AND client_id = $2 AND company_id = $3
      `,
      [addressId, clientId, companyId]
    );

    if (target.is_primary) {
      const replacementResult = await client.query<{ id: string }>(
        `
          SELECT id
          FROM public.client_addresses
          WHERE client_id = $1 AND company_id = $2
          ORDER BY created_at ASC
          LIMIT 1
        `,
        [clientId, companyId]
      );

      const replacement = replacementResult.rows[0];
      if (replacement) {
        await client.query(
          `
            SELECT public.set_primary_client_address(
              p_company_id => $1,
              p_client_id => $2,
              p_address_id => $3
            )
          `,
          [companyId, clientId, replacement.id]
        );
      }
    }

    return true;
  });
}
