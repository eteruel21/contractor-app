import {
  authenticatedRequest
} from "./api";

import type {
  UserRole,
  ItemType,
  UnitType,
  Company,
  PlatformUser,
  Category,
  CatalogItem,
  GlobalCatalogItem,
  Unit,
  CatalogYield,
  FormulaParameter,
  Formula,
  AdminDataStats,
  AdminData,
  UserDraft,
  CategoryDraft,
  ItemDraft,
  GlobalCatalogItemDraft,
  UnitDraft,
  YieldDraft,
  FormulaDraft
} from "./admin-contracts";

export type {
  UserRole,
  ItemType,
  UnitType,
  Company,
  PlatformUser,
  Category,
  CatalogItem,
  GlobalCatalogItem,
  Unit,
  CatalogYield,
  FormulaParameter,
  Formula,
  AdminDataStats,
  AdminData,
  UserDraft,
  CategoryDraft,
  ItemDraft,
  GlobalCatalogItemDraft,
  UnitDraft,
  YieldDraft,
  FormulaDraft
};

function required(value: string, label: string) {
  const clean = value.trim();
  if (!clean) throw new Error(`${label} es obligatorio.`);
  return clean;
}

function nonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} debe ser mayor o igual a cero.`);
  }
  return value;
}

function percentage(value: number, label: string) {
  const validValue = nonNegative(value, label);
  if (validValue > 100) {
    throw new Error(`${label} debe estar entre 0 y 100.`);
  }
  return validValue;
}

function positive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} debe ser mayor que cero.`);
  }
  return value;
}

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function loadAdminData(): Promise<AdminData> {
  return authenticatedRequest<AdminData>("/admin/dashboard");
}

export async function saveUser(
  draft: UserDraft,
  _actorId: string
): Promise<void> {
  await authenticatedRequest(`/admin/users/${draft.id}`, {
    method: "PATCH",
    body: JSON.stringify(draft)
  });
}

export async function saveCategory(draft: CategoryDraft): Promise<void> {
  await authenticatedRequest("/admin/categories/save", {
    method: "POST",
    body: JSON.stringify({
      ...draft,
      name: required(draft.name, "El nombre")
    })
  });
}

export async function saveItem(draft: ItemDraft): Promise<void> {
  await authenticatedRequest("/admin/catalog/items/save", {
    method: "POST",
    body: JSON.stringify({
      ...draft,
      name: required(draft.name, "El nombre"),
      unitId: required(draft.unitId, "La unidad"),
      unitCost: nonNegative(draft.unitCost, "El costo"),
      salePrice: nonNegative(draft.salePrice, "El precio"),
      wastePercentage: percentage(draft.wastePercentage, "El desperdicio")
    })
  });
}

export async function saveUnit(draft: UnitDraft): Promise<void> {
  await authenticatedRequest("/admin/units/save", {
    method: "POST",
    body: JSON.stringify({
      ...draft,
      companyId: required(draft.companyId, "La empresa"),
      code: required(normalizeCode(draft.code), "El código"),
      name: required(draft.name, "El nombre"),
      symbol: required(draft.symbol, "El símbolo"),
      conversionFactor: positive(draft.conversionFactor, "El factor")
    })
  });
}

export async function saveYield(draft: YieldDraft): Promise<void> {
  await authenticatedRequest("/admin/yields/save", {
    method: "POST",
    body: JSON.stringify({
      ...draft,
      companyId: required(draft.companyId, "La empresa"),
      catalogItemId: required(draft.catalogItemId, "El concepto"),
      outputUnitId: required(draft.outputUnitId, "La unidad de salida"),
      name: required(draft.name, "El nombre"),
      outputQuantity: positive(draft.outputQuantity, "La producción"),
      laborHours: nonNegative(draft.laborHours, "Las horas"),
      crewSize: positive(draft.crewSize, "La cuadrilla"),
      wastePercentage: percentage(draft.wastePercentage, "El desperdicio")
    })
  });
}

export async function saveFormula(draft: FormulaDraft): Promise<void> {
  const parameters = draft.parameters.map((param: FormulaParameter) => ({
    ...param,
    parameterKey: required(normalizeCode(param.parameterKey), "La clave"),
    label: required(param.label, "La etiqueta"),
    numericValue: nonNegative(param.numericValue, "El valor")
  }));

  await authenticatedRequest("/admin/formulas/save", {
    method: "POST",
    body: JSON.stringify({
      ...draft,
      companyId: required(draft.companyId, "La empresa"),
      code: required(normalizeCode(draft.code), "El código"),
      name: required(draft.name, "El nombre"),
      parameters
    })
  });
}

export async function saveGlobalCatalogPricing(
  draft: GlobalCatalogItemDraft
): Promise<void> {
  await authenticatedRequest(`/admin/platform-pricing/${draft.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      unitCost: nonNegative(draft.unitCost, "El costo"),
      salePrice: nonNegative(draft.salePrice, "El precio"),
      wastePercentage: percentage(draft.wastePercentage, "El desperdicio")
    })
  });
}

export async function adjustPrices(input: {
  itemIds: string[];
  target: "unit_cost" | "sale_price";
  percentage: number;
  notes: string;
}): Promise<void> {
  if (input.itemIds.length === 0) {
    throw new Error("Selecciona al menos un concepto activo.");
  }

  if (!Number.isFinite(input.percentage) || input.percentage <= -100) {
    throw new Error("El porcentaje debe ser un número mayor que -100.");
  }

  await authenticatedRequest("/admin/platform-pricing/adjust", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export type ContractorDocumentType =
  | "identification"
  | "operation_notice"
  | "references"
  | "address_proof";

export type ContractorReview = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  active: boolean;
  approvedAt: string | null;
  createdAt: string;

  province: string;
  district: string;
  corregimiento: string;

  businessName: string;
  idDocument: string;
  taxId: string;
  taxDv: string;
  primaryCategory: string;

  specialties: string[];
  experienceYears: number | null;
  workAreas: string[];

  professionalDescription: string;
  availability: string;
  preferredContactMethod: string;

  emitsInvoice: boolean;
  hasTransport: boolean;
  workMode: string;

  portfolioUrls: string[];
  certifications: string[];

  documents: {
    identification: boolean;
    operationNotice: boolean;
    references: boolean;
    addressProof: boolean;
  };
};

export type ContractorDocumentResponse = {
  fileName: string;
  mimeType: string;
  base64: string;
};

export async function loadContractorReview(
  userId: string
): Promise<ContractorReview> {
  return authenticatedRequest<ContractorReview>(
    `/admin/users/${encodeURIComponent(userId)}/review`
  );
}

export async function loadContractorDocument(
  userId: string,
  documentType: ContractorDocumentType
): Promise<ContractorDocumentResponse> {
  return authenticatedRequest<ContractorDocumentResponse>(
    `/admin/users/${encodeURIComponent(userId)}/documents/${documentType}`
  );
}