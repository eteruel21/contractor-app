import assert from "node:assert/strict";
import { test } from "vitest";
import {
  userSchema,
  categorySchema,
  itemSchema,
  unitSchema,
  yieldSchema,
  formulaSchema,
  globalPriceSchema,
  adjustPricesSchema
} from "../schemas.js";

const companyId = "00000000-0000-4000-8000-000000000001";
const unitId = "00000000-0000-4000-8000-000000000002";
const categoryId = "00000000-0000-4000-8000-000000000003";
const itemId = "00000000-0000-4000-8000-000000000004";

test("Esquema de Usuario: aprueba payload válido con approvedBy opcional/null", () => {
  const result = userSchema.safeParse({
    fullName: "Admin Test",
    phone: "+507 6000-0000",
    role: "super_admin",
    active: true,
    approvedAt: null,
    approvedBy: null
  });
  assert.equal(result.success, true);
});

test("Esquema de Categoría: aprueba borrador válido", () => {
  const result = categorySchema.safeParse({
    companyId,
    name: "Materiales Especiales",
    description: "Categoría de prueba para materiales de construcción",
    active: true
  });
  assert.equal(result.success, true);
});

test("Esquema de Ítem de Catálogo: aprueba borrador de ítem completo", () => {
  const result = itemSchema.safeParse({
    companyId,
    sku: "MAT-001",
    name: "Cemento Portland",
    description: "Saco de 42.5kg",
    itemType: "material",
    categoryId,
    unitId,
    unitCost: 8.50,
    salePrice: 10.20,
    wastePercentage: 5.0,
    active: true
  });
  assert.equal(result.success, true);
});

test("Esquema de Unidad: aprueba código, símbolo y tipo de unidad", () => {
  const result = unitSchema.safeParse({
    companyId,
    code: "kg",
    name: "Kilogramo",
    symbol: "kg",
    unitType: "weight",
    conversionFactor: 1.0,
    active: true
  });
  assert.equal(result.success, true);
});

test("Esquema de Rendimiento: aprueba cuadrilla y horas de trabajo", () => {
  const result = yieldSchema.safeParse({
    companyId,
    catalogItemId: itemId,
    outputUnitId: unitId,
    name: "Rendimiento Pared Bloque",
    outputQuantity: 12.0,
    laborHours: 8.0,
    crewSize: 2.0,
    wastePercentage: 3.0,
    notes: "Rendimiento estándar",
    active: true
  });
  assert.equal(result.success, true);
});

test("Esquema de Fórmula: aprueba fórmula con parámetros opcionales", () => {
  const result = formulaSchema.safeParse({
    companyId,
    code: "calc_bloques",
    name: "Cálculo de Bloques por m2",
    description: "Fórmula de paredes",
    active: true,
    parameters: [
      {
        parameterKey: "alto",
        label: "Alto de Pared",
        numericValue: 2.5,
        unitLabel: "m",
        description: "Metros de alto",
        active: true,
        sortOrder: 1
      }
    ]
  });
  assert.equal(result.success, true);
});

test("Esquema de Ajuste de Precios Globales: aprueba porcentaje y lista de ítems", () => {
  const result = adjustPricesSchema.safeParse({
    itemIds: [itemId],
    target: "sale_price",
    percentage: 15.0,
    notes: "Aumento por inflación"
  });
  assert.equal(result.success, true);
});

test("Esquema de Precio Global Individual: aprueba costo, precio y desperdicio", () => {
  const result = globalPriceSchema.safeParse({
    unitCost: 15.0,
    salePrice: 20.0,
    wastePercentage: 4.0
  });
  assert.equal(result.success, true);
});
