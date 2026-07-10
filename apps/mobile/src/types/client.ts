export type ClientType = "person" | "business";

export type Client = {
  id: string;
  company_id: string;
  client_type: ClientType;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  document_type: string | null;
  document_number: string | null;
  email: string | null;
  phone: string | null;
  secondary_phone: string | null;
  notes: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientAddress = {
  id: string;
  company_id: string;
  client_id: string;
  label: string;
  address: string;
  province: string | null;
  district: string | null;
  township: string | null;
  reference: string | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientContact = {
  id: string;
  company_id: string;
  client_id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientWithDetails = Client & {
  addresses: ClientAddress[];
  contacts: ClientContact[];
};

export function getClientDisplayName(client: Client): string {
  if (client.client_type === "business") {
    return client.business_name || "Empresa sin nombre";
  }

  const fullName = `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim();

  return fullName || "Cliente sin nombre";
}