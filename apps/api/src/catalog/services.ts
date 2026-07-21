import {
  findPlatformCatalogItems,
  setPersonalCatalogPricingRepo,
  resetPersonalCatalogPricingRepo,
  deactivateCatalogItemRepo,
  findCatalogUnits,
  findCatalogCategories,
  createCatalogItemRepo,
  createCatalogCategoryRepo,
  deactivateCatalogCategoryRepo,
  findCatalogYieldsRepo,
  createCatalogYieldRepo,
  deactivateCatalogYieldRepo,
  type CreateItemInput,
  type CreateCategoryInput,
  type CreateYieldInput,
  type PricingInput
} from "./repository.js";

export async function getPlatformCatalogItemsService(
  userId: string,
  options: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    categoryId?: string | undefined;
    categoryName?: string | undefined;
  } = {}
) {
  return findPlatformCatalogItems(userId, options);
}

export async function setPersonalCatalogPricingService(userId: string, itemId: string, input: PricingInput) {
  return setPersonalCatalogPricingRepo(userId, itemId, input);
}

export async function resetPersonalCatalogPricingService(userId: string, itemId: string) {
  return resetPersonalCatalogPricingRepo(userId, itemId);
}

export async function deactivateCatalogItemService(userId: string, itemId: string, companyId: string) {
  return deactivateCatalogItemRepo(userId, itemId, companyId);
}

export async function getCatalogUnitsService(userId: string, companyId: string) {
  return findCatalogUnits(userId, companyId);
}

export async function getCatalogCategoriesService(userId: string, companyId: string) {
  return findCatalogCategories(userId, companyId);
}

export async function createCatalogItemService(userId: string, input: CreateItemInput) {
  return createCatalogItemRepo(userId, input);
}

export async function createCatalogCategoryService(userId: string, input: CreateCategoryInput) {
  return createCatalogCategoryRepo(userId, input);
}

export async function deactivateCatalogCategoryService(userId: string, categoryId: string, companyId: string) {
  return deactivateCatalogCategoryRepo(userId, categoryId, companyId);
}

export async function getCatalogYieldsService(userId: string, companyId: string, catalogItemId: string) {
  return findCatalogYieldsRepo(userId, companyId, catalogItemId);
}

export async function createCatalogYieldService(userId: string, input: CreateYieldInput) {
  return createCatalogYieldRepo(userId, input);
}

export async function deactivateCatalogYieldService(userId: string, yieldId: string, companyId: string) {
  return deactivateCatalogYieldRepo(userId, yieldId, companyId);
}
