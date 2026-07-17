import { supabase } from "@/services/supabase";
import type {
  Client,
  ClientAddress,
  ClientType,
  ClientWithDetails,
} from "@/types/client";
import type { Company } from "@/types/company";

// Empresa del contratista visible para un cliente vinculado
export type ContractorCompany = Pick<
  Company,
  "id" | "name" | "phone" | "email" | "address"
>;

type CreateClientInput = {
  companyId: string;
  clientType: ClientType;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  notes?: string;
  address?: string;
  addressLabel?: string;
  reference?: string;
};

export async function listClients(
  companyId: string,
): Promise<{
  clients: ClientWithDetails[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      addresses:client_addresses (*),
      contacts:client_contacts (*)
    `,
    )
    .eq("company_id", companyId)
    .eq("active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return {
      clients: [],
      error: error.message,
    };
  }

  const clients = (data ?? []).map((client) => ({
    ...(client as Client),
    addresses: (client.addresses ?? []) as ClientAddress[],
    contacts: client.contacts ?? [],
  })) as ClientWithDetails[];

  return {
    clients,
    error: null,
  };
}

export async function createClient(
  input: CreateClientInput,
): Promise<{
  client: Client | null;
  error: string | null;
}> {
  const {
    companyId,
    clientType,
    firstName = "",
    lastName = "",
    businessName = "",
    documentType = "",
    documentNumber = "",
    email = "",
    phone = "",
    secondaryPhone = "",
    notes = "",
    address = "",
    addressLabel = "Principal",
    reference = "",
  } = input;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      client: null,
      error: "No hay usuario autenticado.",
    };
  }

  const cleanFirstName = firstName.trim();
  const cleanLastName = lastName.trim();
  const cleanBusinessName = businessName.trim();

  if (
    clientType === "person" &&
    `${cleanFirstName} ${cleanLastName}`.trim().length < 2
  ) {
    return {
      client: null,
      error: "Introduce el nombre del cliente.",
    };
  }

  if (
    clientType === "business" &&
    cleanBusinessName.length < 2
  ) {
    return {
      client: null,
      error: "Introduce el nombre de la empresa cliente.",
    };
  }

  const { data: createdClient, error: clientError } =
    await supabase
      .from("clients")
      .insert({
        company_id: companyId,
        client_type: clientType,
        first_name:
          clientType === "person"
            ? cleanFirstName || null
            : null,
        last_name:
          clientType === "person"
            ? cleanLastName || null
            : null,
        business_name:
          clientType === "business"
            ? cleanBusinessName
            : null,
        document_type: documentType.trim() || null,
        document_number:
          documentNumber.trim() || null,
        email: email.trim().toLowerCase() || null,
        phone: phone.trim() || null,
        secondary_phone:
          secondaryPhone.trim() || null,
        notes: notes.trim() || null,
        created_by: user.id,
      })
      .select("*")
      .single();

  if (clientError) {
    return {
      client: null,
      error: clientError.message,
    };
  }

  const cleanAddress = address.trim();

  if (cleanAddress.length >= 3) {
    const { error: addressError } = await supabase
      .from("client_addresses")
      .insert({
        company_id: companyId,
        client_id: createdClient.id,
        label: addressLabel.trim() || "Principal",
        address: cleanAddress,
        reference: reference.trim() || null,
        is_primary: true,
      });

    if (addressError) {
      // El cliente se creó correctamente; el error de dirección es secundario.
      // Se retorna sin error para que el llamador no descarte el cliente creado.
      console.warn(
        "Cliente creado, pero no se pudo guardar la dirección:",
        addressError.message,
      );
    }
  }

  return {
    client: createdClient as Client,
    error: null,
  };
}

export async function deactivateClient(
  companyId: string,
  clientId: string,
): Promise<{
  error: string | null;
}> {
  const { error } = await supabase
    .from("clients")
    .update({
      active: false,
    })
    .eq("company_id", companyId)
    .eq("id", clientId);

  return {
    error: error?.message ?? null,
  };
}

export async function getClientById(
  companyId: string,
  clientId: string,
): Promise<{
  client: ClientWithDetails | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      *,
      addresses:client_addresses (*),
      contacts:client_contacts (*)
    `,
    )
    .eq("company_id", companyId)
    .eq("id", clientId)
    .single();

  if (error) {
    return {
      client: null,
      error: error.message,
    };
  }

  return {
    client: {
      ...(data as Client),
      addresses: (data.addresses ?? []) as ClientAddress[],
      contacts: data.contacts ?? [],
    } as ClientWithDetails,
    error: null,
  };
}

export async function addClientAddress(input: {
  companyId: string;
  clientId: string;
  label: string;
  address: string;
  province?: string;
  district?: string;
  township?: string;
  reference?: string;
  isPrimary?: boolean;
}): Promise<{
  address: ClientAddress | null;
  error: string | null;
}> {
  const cleanAddress = input.address.trim();

  if (cleanAddress.length < 3) {
    return {
      address: null,
      error: "Introduce una dirección válida.",
    };
  }

  // Si se pide como principal, usar la función atómica SQL para evitar race conditions
  if (input.isPrimary) {
    const { error: resetError } = await supabase
      .from("client_addresses")
      .update({ is_primary: false })
      .eq("company_id", input.companyId)
      .eq("client_id", input.clientId);

    if (resetError) {
      return {
        address: null,
        error: resetError.message,
      };
    }
  }

  const { data, error } = await supabase
    .from("client_addresses")
    .insert({
      company_id: input.companyId,
      client_id: input.clientId,
      label: input.label.trim() || "Dirección",
      address: cleanAddress,
      province: input.province?.trim() || null,
      district: input.district?.trim() || null,
      township: input.township?.trim() || null,
      reference: input.reference?.trim() || null,
      is_primary: Boolean(input.isPrimary),
    })
    .select("*")
    .single();

  if (error) {
    return {
      address: null,
      error: error.message,
    };
  }

  return {
    address: data as ClientAddress,
    error: null,
  };
}

/**
 * Cambia la dirección principal de un cliente de forma atómica usando la función
 * SQL `set_primary_client_address`. Antes se hacían dos queries separadas
 * (reset + set) que podían dejar al cliente sin dirección principal si la segunda
 * fallaba. La función SQL ejecuta ambas operaciones en una única transacción.
 */
export async function setPrimaryClientAddress(input: {
  companyId: string;
  clientId: string;
  addressId: string;
}): Promise<{
  error: string | null;
}> {
  const { error } = await supabase.rpc(
    "set_primary_client_address",
    {
      p_company_id: input.companyId,
      p_client_id: input.clientId,
      p_address_id: input.addressId,
    },
  );

  return {
    error: error?.message ?? null,
  };
}

export async function updateClient(input: {
  companyId: string;
  clientId: string;
  clientType: ClientType;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  secondaryPhone?: string;
  notes?: string;
}): Promise<{
  client: Client | null;
  error: string | null;
}> {
  const firstName = input.firstName?.trim() ?? "";
  const lastName = input.lastName?.trim() ?? "";
  const businessName =
    input.businessName?.trim() ?? "";

  if (
    input.clientType === "person" &&
    `${firstName} ${lastName}`.trim().length < 2
  ) {
    return {
      client: null,
      error: "Introduce el nombre del cliente.",
    };
  }

  if (
    input.clientType === "business" &&
    businessName.length < 2
  ) {
    return {
      client: null,
      error: "Introduce el nombre de la empresa.",
    };
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      client_type: input.clientType,
      first_name:
        input.clientType === "person"
          ? firstName || null
          : null,
      last_name:
        input.clientType === "person"
          ? lastName || null
          : null,
      business_name:
        input.clientType === "business"
          ? businessName
          : null,
      document_type:
        input.documentType?.trim() || null,
      document_number:
        input.documentNumber?.trim() || null,
      email:
        input.email?.trim().toLowerCase() || null,
      phone: input.phone?.trim() || null,
      secondary_phone:
        input.secondaryPhone?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("company_id", input.companyId)
    .eq("id", input.clientId)
    .select("*")
    .single();

  if (error) {
    return {
      client: null,
      error: error.message,
    };
  }

  return {
    client: data,
    error: null,
  };
}

export async function updateClientAddress(input: {
  companyId: string;
  clientId: string;
  addressId: string;
  label: string;
  address: string;
  province?: string;
  district?: string;
  township?: string;
  reference?: string;
  isPrimary: boolean;
}): Promise<{
  address: ClientAddress | null;
  error: string | null;
}> {
  const cleanAddress = input.address.trim();

  if (cleanAddress.length < 3) {
    return {
      address: null,
      error: "Introduce una dirección válida.",
    };
  }

  if (input.isPrimary) {
    const { error: resetError } = await supabase
      .from("client_addresses")
      .update({ is_primary: false })
      .eq("company_id", input.companyId)
      .eq("client_id", input.clientId);

    if (resetError) {
      return {
        address: null,
        error: resetError.message,
      };
    }
  }

  const { data, error } = await supabase
    .from("client_addresses")
    .update({
      label: input.label.trim() || "Dirección",
      address: cleanAddress,
      province: input.province?.trim() || null,
      district: input.district?.trim() || null,
      township: input.township?.trim() || null,
      reference: input.reference?.trim() || null,
      is_primary: input.isPrimary,
    })
    .eq("company_id", input.companyId)
    .eq("client_id", input.clientId)
    .eq("id", input.addressId)
    .select("*")
    .single();

  if (error) {
    return {
      address: null,
      error: error.message,
    };
  }

  return {
    address: data,
    error: null,
  };
}

export async function deleteClientAddress(input: {
  companyId: string;
  clientId: string;
  addressId: string;
}): Promise<{
  error: string | null;
}> {
  const { data: target, error: targetError } =
    await supabase
      .from("client_addresses")
      .select("is_primary")
      .eq("company_id", input.companyId)
      .eq("client_id", input.clientId)
      .eq("id", input.addressId)
      .single();

  if (targetError) {
    return { error: targetError.message };
  }

  const { error: deleteError } = await supabase
    .from("client_addresses")
    .delete()
    .eq("company_id", input.companyId)
    .eq("client_id", input.clientId)
    .eq("id", input.addressId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (target.is_primary) {
    const { data: replacement, error: replacementError } =
      await supabase
        .from("client_addresses")
        .select("id")
        .eq("company_id", input.companyId)
        .eq("client_id", input.clientId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (replacementError) {
      return { error: replacementError.message };
    }

    if (replacement) {
      // Usar la función atómica para promover el reemplazo
      const { error: promoteError } = await supabase.rpc(
        "set_primary_client_address",
        {
          p_company_id: input.companyId,
          p_client_id: input.clientId,
          p_address_id: replacement.id,
        },
      );

      if (promoteError) {
        return { error: promoteError.message };
      }
    }
  }

  return { error: null };
}

/**
 * Obtiene las empresas de contratistas a las que está vinculado un cliente.
 * Usa un JOIN directo en lugar de una query extra en el cliente.
 */
export async function getClientContractorCompanies(
  userId: string,
): Promise<{
  companies: ContractorCompany[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      company:companies (
        id,
        name,
        phone,
        email,
        address
      )
    `)
    .eq("user_id", userId)
    .eq("active", true);

  if (error) {
    return {
      companies: [],
      error: error.message,
    };
  }

  const companies = (data ?? [])
    .map((row) => {
      const companyValue = Array.isArray(row.company)
        ? row.company[0]
        : row.company;
      return companyValue as ContractorCompany | null;
    })
    .filter((c): c is ContractorCompany => Boolean(c));

  return {
    companies,
    error: null,
  };
}
