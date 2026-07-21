import {
  findAdminCatalogItemsRepo,
  findAdminCatalogItemByIdRepo,
  updateAdminCatalogItemRepo,
  setCatalogItemActiveRepo,
  findAdminCategoriesRepo,
  updateAdminCategoryRepo,
  setCategoryActiveRepo,
  findAdminFormulasRepo,
  findFormulaItemsRepo,
  findFormulaUnitsRepo,
  createAdminFormulaRepo,
  updateAdminFormulaRepo,
  setFormulaActiveRepo,
  getRuntimeFormulaParametersRepo,
  findMeasurementUnitsRepo,
  createMeasurementUnitRepo,
  updateMeasurementUnitRepo,
  setMeasurementUnitActiveRepo,
  findPricingItemsRepo,
  updateItemPricingRepo,
  adjustPricingRepo,
  findPricingHistoryRepo,
  type AdminCatalogItemInput,
  type CategoryInput,
  type FormulaInput,
  type UnitInput,
  type PricingInput,
  type PricingAdjustmentInput
} from "./repository.js";

export async function getAdminCatalogItemsService(userId: string, companyId: string) {
  return findAdminCatalogItemsRepo(userId, companyId);
}

export async function getAdminCatalogItemByIdService(userId: string, itemId: string, companyId: string) {
  return findAdminCatalogItemByIdRepo(userId, itemId, companyId);
}

export async function updateAdminCatalogItemService(userId: string, itemId: string, input: AdminCatalogItemInput) {
  return updateAdminCatalogItemRepo(userId, itemId, input);
}

export async function setCatalogItemActiveService(userId: string, itemId: string, companyId: string, active: boolean) {
  return setCatalogItemActiveRepo(userId, itemId, companyId, active);
}

export async function getAdminCategoriesService(userId: string, companyId: string) {
  return findAdminCategoriesRepo(userId, companyId);
}

export async function updateAdminCategoryService(userId: string, categoryId: string, input: CategoryInput) {
  return updateAdminCategoryRepo(userId, categoryId, input);
}

export async function setCategoryActiveService(userId: string, categoryId: string, companyId: string, active: boolean) {
  return setCategoryActiveRepo(userId, categoryId, companyId, active);
}

export async function getAdminFormulasService(userId: string, companyId: string) {
  return findAdminFormulasRepo(userId, companyId);
}

export async function getFormulaItemsService(userId: string, companyId: string) {
  return findFormulaItemsRepo(userId, companyId);
}

export async function getFormulaUnitsService(userId: string, companyId: string) {
  return findFormulaUnitsRepo(userId, companyId);
}

export async function createAdminFormulaService(userId: string, input: FormulaInput) {
  return createAdminFormulaRepo(userId, input);
}

export async function updateAdminFormulaService(userId: string, formulaId: string, input: FormulaInput) {
  return updateAdminFormulaRepo(userId, formulaId, input);
}

export async function setFormulaActiveService(userId: string, formulaId: string, companyId: string, active: boolean) {
  return setFormulaActiveRepo(userId, formulaId, companyId, active);
}

export async function getRuntimeFormulaParametersService(userId: string, companyId: string, formulaCode: string) {
  return getRuntimeFormulaParametersRepo(userId, companyId, formulaCode);
}

export async function getMeasurementUnitsService(userId: string, companyId: string) {
  return findMeasurementUnitsRepo(userId, companyId);
}

export async function createMeasurementUnitService(userId: string, input: UnitInput) {
  return createMeasurementUnitRepo(userId, input);
}

export async function updateMeasurementUnitService(userId: string, unitId: string, input: UnitInput) {
  return updateMeasurementUnitRepo(userId, unitId, input);
}

export async function setMeasurementUnitActiveService(userId: string, unitId: string, companyId: string, active: boolean) {
  return setMeasurementUnitActiveRepo(userId, unitId, companyId, active);
}

export async function getPricingItemsService(userId: string, companyId: string) {
  return findPricingItemsRepo(userId, companyId);
}

export async function updateItemPricingService(userId: string, itemId: string, input: PricingInput) {
  return updateItemPricingRepo(userId, itemId, input);
}

export async function adjustPricingService(userId: string, input: PricingAdjustmentInput) {
  return adjustPricingRepo(userId, input);
}

export async function getPricingHistoryService(userId: string, companyId: string) {
  return findPricingHistoryRepo(userId, companyId);
}
