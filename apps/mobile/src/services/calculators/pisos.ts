import {
  calculateFlooring,
  type FlooringInput,
  type FlooringPrices,
  type FlooringResult
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateFlooring,
  type FlooringInput,
  type FlooringPrices,
  type FlooringResult
};

export function registerFlooringCalculator() {
  calculatorEngine.register<FlooringInput, FlooringPrices, FlooringResult>({
    code: "flooring",
    name: "Calculadora de Pisos y Azulejos",
    category: "Revestimientos",
    calculate: calculateFlooring,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.boxesToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Cajas de Baldosa / Ceramica / Porcelanato",
          unitName: "caja",
          quantity: res.boxesToBuy,
          unitCost: prices.flooringBox,
          unitPrice: prices.flooringBox,
          subtotal: res.flooringCost
        });
      }

      if (res.adhesiveBagsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Mortero Adhesivo / Pegamento para Baldosas",
          unitName: "saco",
          quantity: res.adhesiveBagsToBuy,
          unitCost: prices.adhesiveBag,
          unitPrice: prices.adhesiveBag,
          subtotal: res.adhesiveCost
        });
      }

      if (res.groutBagsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Boquilla / Fraguador para Juntas",
          unitName: "saco",
          quantity: res.groutBagsToBuy,
          unitCost: prices.groutBag,
          unitPrice: prices.groutBag,
          subtotal: res.groutCost
        });
      }

      if (res.suppliesCost > 0) {
        items.push({
          itemType: "material",
          description: "Insumos de Instalación (Separadores, Cuñas, Niveladores)",
          unitName: "global",
          quantity: 1,
          unitCost: prices.supplies,
          unitPrice: prices.supplies,
          subtotal: res.suppliesCost
        });
      }

      if (res.laborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Instalación de Pisos / Azulejos",
          unitName: "m2",
          quantity: Number(res.netArea.toFixed(2)),
          unitCost: prices.laborSquareMeter,
          unitPrice: prices.laborSquareMeter,
          subtotal: res.laborCost
        });
      }

      return items;
    }
  });
}

registerFlooringCalculator();
