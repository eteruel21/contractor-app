import {
  findUserCompanyMembershipsRepo,
  createCompanyRepo,
  updateCompanyBillingRepo,
  type CreateCompanyInput,
  type BillingInput
} from "./repository.js";

export async function getUserCompanyMembershipsService(userId: string) {
  return findUserCompanyMembershipsRepo(userId);
}

export async function createCompanyService(userId: string, input: CreateCompanyInput) {
  return createCompanyRepo(userId, input);
}

export async function updateCompanyBillingService(userId: string, companyId: string, input: BillingInput) {
  return updateCompanyBillingRepo(userId, companyId, input);
}
