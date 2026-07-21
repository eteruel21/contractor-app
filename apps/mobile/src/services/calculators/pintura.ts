import {
  calculatePaint,
  type PaintInput,
  type PaintPrices,
  type PaintResult
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculatePaint,
  type PaintInput,
  type PaintPrices,
  type PaintResult
};

export function registerPaintCalculator() {
  calculatorEngine.register<PaintInput, PaintPrices, PaintResult>({
    code: "paint",
    name: "Calculadora de Pintura",
    category: "Pintura y Acabados",
    calculate: calculatePaint,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.paintGallonsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Pintura Arquitectónica",
          unitName: "galón",
          quantity: res.paintGallonsToBuy,
          unitCost: prices.paintGallon,
          unitPrice: prices.paintGallon,
          subtotal: res.paintCost
        });
      }

      if (res.primerGallonsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Sellador / Primer para Pintura",
          unitName: "galón",
          quantity: res.primerGallonsToBuy,
          unitCost: prices.primerGallon,
          unitPrice: prices.primerGallon,
          subtotal: res.primerCost
        });
      }

      if (res.suppliesCost > 0) {
        items.push({
          itemType: "material",
          description: "Insumos y Consumibles de Pintura (Rodillos, Felpas, Cintas)",
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
          description: "Mano de Obra Aplicación de Pintura",
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

registerPaintCalculator();
