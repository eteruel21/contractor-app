import {
  findClientBudgets,
  getClientBudgetDetailRepo,
  findCompanyBudgets,
  createProjectBudgetRepo,
  getBudgetDetailsRepo,
  addBudgetItemRepo,
  deleteBudgetItemRepo,
  approveBudgetRepo,
  rejectBudgetRepo,
  getBudgetHistoryRepo,
  type CreateBudgetItemInput
} from "./repository.js";
import { notifyBudgetDecision } from "../notifications/event-service.js";

export async function getClientBudgetsService(userId: string) {
  return findClientBudgets(userId);
}

export async function getClientBudgetDetailService(userId: string, budgetId: string) {
  return getClientBudgetDetailRepo(userId, budgetId);
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

export async function approveBudgetService(userId: string, budgetId: string, companyId?: string) {
  const budget = await approveBudgetRepo(userId, budgetId, companyId);
  await notifyBudgetDecision(budget, "approved");
  return budget;
}

export async function rejectBudgetService(userId: string, budgetId: string, rejectionReason: string, companyId?: string) {
  const budget = await rejectBudgetRepo(userId, budgetId, rejectionReason, companyId);
  await notifyBudgetDecision(budget, "rejected");
  return budget;
}

export async function getBudgetHistoryService(userId: string, budgetId: string, companyId?: string) {
  return getBudgetHistoryRepo(userId, budgetId, companyId);
}
