export type UserRole = "super_admin" | "contractor" | "client";
export type ItemType =
  | "material"
  | "labor"
  | "equipment"
  | "service"
  | "subcontract";

export type UnitType =
  | "length"
  | "area"
  | "volume"
  | "weight"
  | "unit"
  | "time"
  | "package"
  | "service";

export type Company = {
  id: string;
  name: string;
  active: boolean;
};

export type PlatformUser = {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  active: boolean;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  companyName: string;
};

export type Category = {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  description: string;
  active: boolean;
};

export type CatalogItem = {
  id: string;
  companyId: string;
  companyName: string;
  sku: string;
  name: string;
  description: string;
  itemType: ItemType;
  categoryId: string | null;
  categoryName: string;
  unitId: string;
  unitSymbol: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
  active: boolean;
};

export type GlobalCatalogItem = {
  id: string;
  sku: string;
  name: string;
  description: string;
  itemType: ItemType;
  categoryName: string;
  unitName: string;
  unitSymbol: string;
  unitCost: number;
  salePrice: number;
  wastePercentage: number;
  active: boolean;
};

export type Unit = {
  id: string;
  companyId: string;
  companyName: string;
  code: string;
  name: string;
  symbol: string;
  unitType: UnitType;
  conversionFactor: number;
  active: boolean;
};

export type CatalogYield = {
  id: string;
  companyId: string;
  companyName: string;
  catalogItemId: string;
  catalogItemName: string;
  outputUnitId: string;
  outputUnitSymbol: string;
  name: string;
  outputQuantity: number;
  laborHours: number;
  crewSize: number;
  wastePercentage: number;
  notes: string;
  active: boolean;
};

export type FormulaParameter = {
  id?: string;
  parameterKey: string;
  label: string;
  numericValue: number;
  unitLabel: string;
  description: string;
  active: boolean;
  sortOrder: number;
};

export type Formula = {
  id: string;
  companyId: string;
  companyName: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
  parameters: FormulaParameter[];
};

export type AdminDataStats = {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  totalProjects: number;
  totalClients: number;
  totalCategories: number;
  totalItems: number;
  totalGlobalItems: number;
  totalUnits: number;
  totalYields: number;
  totalFormulas: number;
  priceHistoryCount: number;
};

export type AdminData = {
  users: PlatformUser[];
  companies: Company[];
  categories: Category[];
  items: CatalogItem[];
  globalItems: GlobalCatalogItem[];
  units: Unit[];
  yields: CatalogYield[];
  formulas: Formula[];
  projectCount: number;
  clientCount: number;
  priceHistoryCount: number;
  warnings: string[];
  stats: AdminDataStats;
};

export type UserDraft = Omit<PlatformUser, "createdAt" | "companyName">;
export type CategoryDraft = Omit<Category, "companyName">;
export type ItemDraft = Omit<
  CatalogItem,
  "companyName" | "categoryName" | "unitSymbol"
>;
export type GlobalCatalogItemDraft = Pick<
  GlobalCatalogItem,
  "id" | "unitCost" | "salePrice" | "wastePercentage"
>;
export type UnitDraft = Omit<Unit, "companyName">;
export type YieldDraft = Omit<
  CatalogYield,
  "companyName" | "catalogItemName" | "outputUnitSymbol"
>;
export type FormulaDraft = Omit<Formula, "companyName">;
