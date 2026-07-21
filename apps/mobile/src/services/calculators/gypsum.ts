import {
  calculateGypsum,
  type GypsumInput,
  type GypsumPrices,
  type GypsumResult,
  type GypsumBoardSides
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateGypsum,
  type GypsumInput,
  type GypsumPrices,
  type GypsumResult,
  type GypsumBoardSides
};

export function registerGypsumCalculator() {
  calculatorEngine.register<GypsumInput, GypsumPrices, GypsumResult>({
    code: "gypsum",
    name: "Calculadora de Gypsum / Drywall",
    category: "Acabados",
    calculate: calculateGypsum,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.boardsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Láminas de Gypsum",
          unitName: "placa",
          quantity: res.boardsToBuy,
          unitCost: prices.boardUnit,
          unitPrice: prices.boardUnit,
          subtotal: res.boardCost
        });
      }

      if (res.studPieces > 0) {
        items.push({
          itemType: "material",
          description: "Parales/Studs Metálicos",
          unitName: "pieza",
          quantity: res.studPieces,
          unitCost: prices.studPiece,
          unitPrice: prices.studPiece,
          subtotal: res.studCost
        });
      }

      if (res.trackPieces > 0) {
        items.push({
          itemType: "material",
          description: "Canales/Tracks Metálicos",
          unitName: "pieza",
          quantity: res.trackPieces,
          unitCost: prices.trackPiece,
          unitPrice: prices.trackPiece,
          subtotal: res.trackCost
        });
      }

      if (res.screwBoxes > 0) {
        items.push({
          itemType: "material",
          description: "Cajas de Tornillos Gypsum",
          unitName: "caja",
          quantity: res.screwBoxes,
          unitCost: prices.screwBox,
          unitPrice: prices.screwBox,
          subtotal: res.screwCost
        });
      }

      if (res.tapeRolls > 0) {
        items.push({
          itemType: "material",
          description: "Rollos de Cinta de Papel/Malla",
          unitName: "rollo",
          quantity: res.tapeRolls,
          unitCost: prices.tapeRoll,
          unitPrice: prices.tapeRoll,
          subtotal: res.tapeCost
        });
      }

      if (res.compoundPackages > 0) {
        items.push({
          itemType: "material",
          description: "Compuesto para Juntas / Masilla",
          unitName: "empaque",
          quantity: res.compoundPackages,
          unitCost: prices.compoundPackage,
          unitPrice: prices.compoundPackage,
          subtotal: res.compoundCost
        });
      }

      if (res.laborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Instalación de Gypsum",
          unitName: "m2",
          quantity: Number(res.finishedArea.toFixed(2)),
          unitCost: prices.laborSquareMeter,
          unitPrice: prices.laborSquareMeter,
          subtotal: res.laborCost
        });
      }

      return items;
    }
  });
}

registerGypsumCalculator();
