export type CompanyRole =
  | "owner"
  | "admin"
  | "supervisor"
  | "sales"
  | "estimator"
  | "member";

export type Company = {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  logo_url: string | null;
  currency_code: string;
  tax_rate: number;
  timezone: string;
  quotation_prefix: string;
  invoice_prefix: string;
  receipt_prefix: string;
  project_prefix: string;
  payment_prefix: string;
  created_by: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CompanyMembership = {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  active: boolean;
  company: Company;
};