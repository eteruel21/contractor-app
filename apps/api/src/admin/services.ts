import {
  getAdminDashboardDataRepo,
  updateAdminUserRepo,
  saveCategoryRepo,
  saveItemRepo,
  saveUnitRepo,
  saveYieldRepo,
  saveFormulaRepo,
  saveGlobalPriceRepo,
  adjustPricesRepo,
  type UserInput,
  type CategoryInput,
  type ItemInput,
  type UnitInput,
  type YieldInput,
  type FormulaInput,
  type GlobalPriceInput,
  type AdjustPricesInput
} from "./repository.js";

export async function getAdminDashboardService(userId: string) {
  return getAdminDashboardDataRepo(userId);
}

export async function updateAdminUserService(userId: string, targetUserId: string, input: UserInput) {
  return updateAdminUserRepo(userId, targetUserId, input);
}

export async function saveCategoryService(userId: string, input: CategoryInput) {
  return saveCategoryRepo(userId, input);
}

export async function saveItemService(userId: string, input: ItemInput) {
  return saveItemRepo(userId, input);
}

export async function saveUnitService(userId: string, input: UnitInput) {
  return saveUnitRepo(userId, input);
}

export async function saveYieldService(userId: string, input: YieldInput) {
  return saveYieldRepo(userId, input);
}

export async function saveFormulaService(userId: string, input: FormulaInput) {
  return saveFormulaRepo(userId, input);
}

export async function saveGlobalPriceService(userId: string, itemId: string, input: GlobalPriceInput) {
  return saveGlobalPriceRepo(userId, itemId, input);
}

export async function adjustPricesService(userId: string, input: AdjustPricesInput) {
  return adjustPricesRepo(userId, input);
}
