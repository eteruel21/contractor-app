import {
  calculateMasonry,
  type MasonryInput,
  type MasonryPrices,
  type MasonryResult,
  type PlasterSides
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateMasonry,
  type MasonryInput,
  type MasonryPrices,
  type MasonryResult,
  type PlasterSides
};

export function registerMasonryCalculator() {
  calculatorEngine.register<MasonryInput, MasonryPrices, MasonryResult>({
    code: "masonry",
    name: "Calculadora de Bloques y Repello",
    category: "Albañilería",
    calculate: calculateMasonry,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.blocksToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Bloques de Mampostería",
          unitName: "unidad",
          quantity: res.blocksToBuy,
          unitCost: prices.blockUnit,
          unitPrice: prices.blockUnit,
          subtotal: res.blockCost
        });
      }

      if (res.cementBagsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Cemento Gris para Mortero",
          unitName: "saco",
          quantity: res.cementBagsToBuy,
          unitCost: prices.cementBag,
          unitPrice: prices.cementBag,
          subtotal: res.cementCost
        });
      }

      if (res.sandCost > 0) {
        items.push({
          itemType: "material",
          description: "Arena para Mortero",
          unitName: "m3",
          quantity: Number(res.sandVolume.toFixed(2)),
          unitCost: prices.sandCubicMeter,
          unitPrice: prices.sandCubicMeter,
          subtotal: res.sandCost
        });
      }

      if (res.masonryLaborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Pegado de Bloques",
          unitName: "m2",
          quantity: Number(res.netWallArea.toFixed(2)),
          unitCost: prices.masonryLaborSquareMeter,
          unitPrice: prices.masonryLaborSquareMeter,
          subtotal: res.masonryLaborCost
        });
      }

      if (res.plasterLaborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Repello / Aplanado",
          unitName: "m2",
          quantity: Number(res.plasterArea.toFixed(2)),
          unitCost: prices.plasterLaborSquareMeter,
          unitPrice: prices.plasterLaborSquareMeter,
          subtotal: res.plasterLaborCost
        });
      }

      return items;
    }
  });
}

registerMasonryCalculator();
