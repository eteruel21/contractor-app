export type UnitType =
  | "length"
  | "area"
  | "volume"
  | "weight"
  | "unit"
  | "time"
  | "package"
  | "service";

export type CatalogItemType =
  | "material"
  | "labor"
  | "equipment"
  | "service"
  | "subcontract";

export type Unit = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  symbol: string;
  unit_type: UnitType;
  conversion_factor: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogCategory = {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogItem = {
  id: string;
  company_id: string;
  item_type: CatalogItemType;
  category_id: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  unit_id: string;
  unit_cost: number;
  sale_price: number;
  waste_percentage: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogItemWithDetails = CatalogItem & {
  unit: Unit | null;
  category: CatalogCategory | null;
};

export type CatalogYield = {
  id: string;
  company_id: string;
  catalog_item_id: string;
  output_unit_id: string;
  name: string;
  output_quantity: number;
  labor_hours: number;
  crew_size: number;
  waste_percentage: number;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CatalogYieldWithDetails = CatalogYield & {
  output_unit: Unit | null;
};

export function getCatalogItemTypeLabel(
  itemType: CatalogItemType,
): string {
  const labels: Record<CatalogItemType, string> = {
    material: "Material",
    labor: "Mano de obra",
    equipment: "Equipo",
    service: "Servicio",
    subcontract: "Subcontrato",
  };

  return labels[itemType];
}
