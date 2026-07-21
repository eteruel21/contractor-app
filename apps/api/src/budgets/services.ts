import {
  findClientBudgets,
  findCompanyBudgets,
  createProjectBudgetRepo,
  getBudgetDetailsRepo,
  addBudgetItemRepo,
  deleteBudgetItemRepo,
  type CreateBudgetItemInput
} from "./repository.js";

export async function getClientBudgetsService(userId: string) {
  return findClientBudgets(userId);
}

export async function getCompanyBudgetsService(userId: string, companyId: string, projectId?: string) {
  return findCompanyBudgets(userId, companyId, projectId);
}

export async function createProjectBudgetService(userId: string, companyId: string, projectId: string, title?: string) {
  return createProjectBudgetRepo(userId, companyId, projectId, title);
}

export async function getBudgetDetailsService(userId: string, budgetId: string, companyId: string) {
  return getBudgetDetailsRepo(userId, budgetId, companyId);
}

export async function addBudgetItemService(userId: string, budgetId: string, input: CreateBudgetItemInput) {
  return addBudgetItemRepo(userId, budgetId, input);
}

export async function deleteBudgetItemService(userId: string, budgetId: string, itemId: string, companyId: string) {
  return deleteBudgetItemRepo(userId, budgetId, itemId, companyId);
}
