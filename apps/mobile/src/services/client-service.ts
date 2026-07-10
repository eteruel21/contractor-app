import { supabase } from "@/services/supabase";
import type {
  Client,
  ClientAddress,
  ClientType,
  ClientWithDetails,
} from "@/types/client";

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
      return {
        client: createdClient as Client,
        error: `Cliente creado, pero no se pudo guardar la dirección: ${addressError.message}`,
      };
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

  if (input.isPrimary) {
    await supabase
      .from("client_addresses")
      .update({
        is_primary: false,
      })
      .eq("company_id", input.companyId)
      .eq("client_id", input.clientId);
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

export async function setPrimaryClientAddress(input: {
  companyId: string;
  clientId: string;
  addressId: string;
}): Promise<{
  error: string | null;
}> {
  const { error: resetError } = await supabase
    .from("client_addresses")
    .update({
      is_primary: false,
    })
    .eq("company_id", input.companyId)
    .eq("client_id", input.clientId);

  if (resetError) {
    return {
      error: resetError.message,
    };
  }

  const { error } = await supabase
    .from("client_addresses")
    .update({
      is_primary: true,
    })
    .eq("company_id", input.companyId)
    .eq("client_id", input.clientId)
    .eq("id", input.addressId);

  return {
    error: error?.message ?? null,
  };
}