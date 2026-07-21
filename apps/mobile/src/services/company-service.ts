import {
  authenticatedRequest
} from "@/services/api";
import type {
  Company,
  CompanyMembership
} from "@/types/company";

function errorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la solicitud.";
}

export async function listCompanyMemberships():
Promise<{
  memberships: CompanyMembership[];
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        memberships:
          (Omit<
              CompanyMembership,
              "company"
            > & {
              company:
                Omit<
                  Company,
                  "tax_rate"
                > & {
                  tax_rate:
                    number | string;
                };
            })[];
      }>("/companies");

    const memberships =
      response.memberships.map(
        (membership) => ({
          ...membership,
          company: {
            ...membership.company,
            tax_rate: Number(
              membership.company.tax_rate ?? 0
            )
          }
        })
      );

    return {
      memberships,
      error: null
    };
  } catch (error) {
    return {
      memberships: [],
      error: errorMessage(error)
    };
  }
}

export async function createCompanyRecord(
  input: {
    name: string;
    phone?: string;
    email?: string;
  }
): Promise<{
  companyId: string | null;
  error: string | null;
}> {
  try {
    const response =
      await authenticatedRequest<{
        companyId: string;
      }>(
        "/companies",
        {
          method: "POST",
          body: JSON.stringify({
            name: input.name.trim(),
            phone:
              input.phone?.trim() || "",
            email:
              input.email
                ?.trim()
                .toLowerCase() || ""
          })
        }
      );

    return {
      companyId: response.companyId,
      error: null
    };
  } catch (error) {
    return {
      companyId: null,
      error: errorMessage(error)
    };
  }
}

export async function updateCompanyBillingDetails(
  input: {
    companyId: string;
    legalName: string | null;
    taxId: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    logoUrl: string | null;
    invoicePrefix: string;
    taxRate: number;
  }
): Promise<{
  error: string | null;
}> {
  try {
    await authenticatedRequest(
      `/companies/${input.companyId}/billing`,
      {
        method: "PATCH",
        body: JSON.stringify({
          legalName:
            input.legalName?.trim() || null,
          taxId:
            input.taxId?.trim() || null,
          phone:
            input.phone?.trim() || null,
          email:
            input.email
              ?.trim()
              .toLowerCase() || null,
          address:
            input.address?.trim() || null,
          logoUrl:
            input.logoUrl?.trim() || null,
          invoicePrefix:
            input.invoicePrefix.trim() ||
            "FAC",
          taxRate:
            Number(input.taxRate ?? 0)
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