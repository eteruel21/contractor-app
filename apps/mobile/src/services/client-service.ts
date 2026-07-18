import {
  authenticatedRequest
} from "@/services/api";
import type {
  Client,
  ClientAddress,
  ClientType,
  ClientWithDetails
} from "@/types/client";
import type {
  Company
} from "@/types/company";

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

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listClients(
  companyId: string
): Promise<{
  clients: ClientWithDetails[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        clients: ClientWithDetails[];
      }>(
        `/clients?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      clients: response.clients,
      error: null
    };
  } catch (error) {
    return {
      clients: [],
      error: errorMessage(error)
    };
  }
}

export async function createClient(
  input: CreateClientInput
): Promise<{
  client: Client | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        client: Client;
      }>(
        "/clients",
        {
          method: "POST",
          body: JSON.stringify(input)
        }
      );

    return {
      client: response.client,
      error: null
    };
  } catch (error) {
    return {
      client: null,
      error: errorMessage(error)
    };
  }
}

export async function deactivateClient(
  companyId: string,
  clientId: string
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/clients/${clientId}/deactivate`,
      {
        method: "PATCH",
        body: JSON.stringify({
          companyId
        })
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}

export async function getClientById(
  companyId: string,
  clientId: string
): Promise<{
  client: ClientWithDetails | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        client: ClientWithDetails;
      }>(
        `/clients/${clientId}?companyId=${encodeURIComponent(companyId)}`
      );

    return {
      client: response.client,
      error: null
    };
  } catch (error) {
    return {
      client: null,
      error: errorMessage(error)
    };
  }
}

export async function addClientAddress(
  input: {
    companyId: string;
    clientId: string;
    label: string;
    address: string;
    province?: string;
    district?: string;
    township?: string;
    reference?: string;
    isPrimary?: boolean;
  }
): Promise<{
  address: ClientAddress | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        address: ClientAddress;
      }>(
        `/clients/${input.clientId}/addresses`,
        {
          method: "POST",
          body: JSON.stringify({
            companyId:
              input.companyId,
            label:
              input.label.trim() ||
              "Dirección",
            address:
              input.address.trim(),
            province:
              input.province?.trim() ||
              "",
            district:
              input.district?.trim() ||
              "",
            township:
              input.township?.trim() ||
              "",
            reference:
              input.reference?.trim() ||
              "",
            isPrimary:
              Boolean(input.isPrimary)
          })
        }
      );

    return {
      address: response.address,
      error: null
    };
  } catch (error) {
    return {
      address: null,
      error: errorMessage(error)
    };
  }
}

export async function setPrimaryClientAddress(
  input: {
    companyId: string;
    clientId: string;
    addressId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/clients/${input.clientId}/addresses/${input.addressId}/primary`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId:
            input.companyId
        })
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}

export async function updateClient(
  input: {
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
  }
): Promise<{
  client: Client | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        client: Client;
      }>(
        `/clients/${input.clientId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            companyId:
              input.companyId,
            clientType:
              input.clientType,
            firstName:
              input.firstName ?? "",
            lastName:
              input.lastName ?? "",
            businessName:
              input.businessName ?? "",
            documentType:
              input.documentType ?? "",
            documentNumber:
              input.documentNumber ?? "",
            email:
              input.email ?? "",
            phone:
              input.phone ?? "",
            secondaryPhone:
              input.secondaryPhone ?? "",
            notes:
              input.notes ?? ""
          })
        }
      );

    return {
      client: response.client,
      error: null
    };
  } catch (error) {
    return {
      client: null,
      error: errorMessage(error)
    };
  }
}

export async function updateClientAddress(
  input: {
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
  }
): Promise<{
  address: ClientAddress | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        address: ClientAddress;
      }>(
        `/clients/${input.clientId}/addresses/${input.addressId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            companyId:
              input.companyId,
            label:
              input.label,
            address:
              input.address,
            province:
              input.province ?? "",
            district:
              input.district ?? "",
            township:
              input.township ?? "",
            reference:
              input.reference ?? "",
            isPrimary:
              input.isPrimary
          })
        }
      );

    return {
      address: response.address,
      error: null
    };
  } catch (error) {
    return {
      address: null,
      error: errorMessage(error)
    };
  }
}

export async function deleteClientAddress(
  input: {
    companyId: string;
    clientId: string;
    addressId: string;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/clients/${input.clientId}/addresses/${input.addressId}`,
      {
        method: "DELETE",
        body: JSON.stringify({
          companyId:
            input.companyId
        })
      }
    );

    return {
      error: null
    };
  } catch (error) {
    return {
      error: errorMessage(error)
    };
  }
}

export async function getClientContractorCompanies(
  _userId: string
): Promise<{
  companies: ContractorCompany[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        companies:
          ContractorCompany[];
      }>(
        "/clients/contractor-companies"
      );

    return {
      companies:
        response.companies,
      error: null
    };
  } catch (error) {
    return {
      companies: [],
      error: errorMessage(error)
    };
  }
}