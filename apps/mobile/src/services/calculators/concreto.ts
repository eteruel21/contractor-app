import {
  calculateConcrete,
  type ConcreteInput,
  type ConcretePrices,
  type ConcreteResult,
  type AggregatePriceMode
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateConcrete,
  type ConcreteInput,
  type ConcretePrices,
  type ConcreteResult,
  type AggregatePriceMode
};

export function registerConcreteCalculator() {
  calculatorEngine.register<ConcreteInput, ConcretePrices, ConcreteResult>({
    code: "concrete",
    name: "Calculadora de Concreto",
    category: "Estructuras",
    calculate: calculateConcrete,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.cementBagsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Cemento Gris (Sacos)",
          unitName: "saco",
          quantity: res.cementBagsToBuy,
          unitCost: prices.cementBag,
          unitPrice: prices.cementBag,
          subtotal: res.cementCost
        });
      }

      if (res.sandCost > 0) {
        const isBag = input.sandPriceMode === "bag";
        items.push({
          itemType: "material",
          description: isBag ? "Arena (Sacos)" : "Arena (Metro Cúbico)",
          unitName: isBag ? "saco" : "m3",
          quantity: isBag ? res.sandBagsToBuy : Number(res.sandVolume.toFixed(2)),
          unitCost: isBag ? prices.sandBag : prices.sandCubicMeter,
          unitPrice: isBag ? prices.sandBag : prices.sandCubicMeter,
          subtotal: res.sandCost
        });
      }

      if (res.gravelCost > 0) {
        const isBag = input.gravelPriceMode === "bag";
        items.push({
          itemType: "material",
          description: isBag ? "Piedra/Grava (Sacos)" : "Piedra/Grava (Metro Cúbico)",
          unitName: isBag ? "saco" : "m3",
          quantity: isBag ? res.gravelBagsToBuy : Number(res.gravelVolume.toFixed(2)),
          unitCost: isBag ? prices.gravelBag : prices.gravelCubicMeter,
          unitPrice: isBag ? prices.gravelBag : prices.gravelCubicMeter,
          subtotal: res.gravelCost
        });
      }

      if (res.laborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Vaciado de Concreto",
          unitName: "m3",
          quantity: Number(res.volumeWithWaste.toFixed(2)),
          unitCost: prices.laborCubicMeter,
          unitPrice: prices.laborCubicMeter,
          subtotal: res.laborCost
        });
      }

      return items;
    }
  });
}

// Auto-register on import
registerConcreteCalculator();
