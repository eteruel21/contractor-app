import {
  saveCalculationRepo,
  findCompanyCalculationsRepo,
  getCalculationDetailRepo,
  deleteCalculationRepo,
  type SaveCalculationInput
} from "./repository.js";

export async function saveCalculationService(userId: string, input: SaveCalculationInput) {
  return saveCalculationRepo(userId, input);
}

export async function getCompanyCalculationsService(
  userId: string,
  companyId: string,
  projectId?: string,
  clientId?: string
) {
  return findCompanyCalculationsRepo(userId, companyId, projectId, clientId);
}

export async function getCalculationDetailService(userId: string, calculationId: string, companyId: string) {
  return getCalculationDetailRepo(userId, calculationId, companyId);
}

export async function deleteCalculationService(userId: string, calculationId: string, companyId: string) {
  return deleteCalculationRepo(userId, calculationId, companyId);
}
