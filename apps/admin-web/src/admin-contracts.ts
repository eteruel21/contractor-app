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

export type ContractorDocumentType =
  | "identification"
  | "operation_notice"
  | "references"
  | "address_proof";

export type UserProfileProfessional = {
  businessName: string;
  idDocument: string;
  taxId: string;
  taxDv: string;
  primaryCategory: string;
  specialties: string[];
  experienceYears: number | null;
  workAreas: string[];
  professionalDescription: string;
  companyLogoUrl: string | null;
  portfolioUrls: string[];
  certifications: string[];
  availability: string;
  preferredContactMethod: string;
  emitsInvoice: boolean;
  hasTransport: boolean;
  workMode: string;
};

export type UserProfileDetail = {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string | null;
  role: UserRole;
  active: boolean;
  status: string;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  location: {
    province: string;
    district: string;
    corregimiento: string;
  };
  preferences: {
    termsAccepted: boolean;
    notificationsOptIn: boolean;
  };
  professional: UserProfileProfessional | null;
  associations: {
    companies: Array<{
      id: string;
      name: string;
      role: string | null;
      active: boolean;
    }>;
    linkedClients: Array<{
      id: string;
      companyName: string;
      displayName: string;
      active: boolean;
    }>;
  };
  resources: {
    profileDocuments: Array<{
      id: string;
      type: ContractorDocumentType;
      label: string;
      available: true;
    }>;
    projectPhotos: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      caption: string;
      createdAt: string;
      projectName: string;
      companyName: string;
      url: string;
    }>;
  };
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
