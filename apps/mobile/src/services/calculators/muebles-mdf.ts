import {
  calculateMdfFurniture,
  type MdfFurnitureInput,
  type MdfFurniturePrices,
  type MdfFurnitureResult
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateMdfFurniture,
  type MdfFurnitureInput,
  type MdfFurniturePrices,
  type MdfFurnitureResult
};

export function registerMdfFurnitureCalculator() {
  calculatorEngine.register<MdfFurnitureInput, MdfFurniturePrices, MdfFurnitureResult>({
    code: "mdf_furniture",
    name: "Calculadora de Muebles de MDF / Carpintería",
    category: "Carpintería",
    calculate: calculateMdfFurniture,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost + res.installationCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.boardsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Tableros MDF Principal",
          unitName: "tablero",
          quantity: res.boardsToBuy,
          unitCost: prices.mdfBoard,
          unitPrice: prices.mdfBoard,
          subtotal: res.mdfCost
        });
      }

      if (res.backBoardsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Tableros de Fondo (MDF Delgado / Duropan)",
          unitName: "tablero",
          quantity: res.backBoardsToBuy,
          unitCost: prices.backBoard,
          unitPrice: prices.backBoard,
          subtotal: res.backCost
        });
      }

      if (res.edgeRollsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Rollos de Canto PVC para Melamina/MDF",
          unitName: "rollo",
          quantity: res.edgeRollsToBuy,
          unitCost: prices.edgeRoll,
          unitPrice: prices.edgeRoll,
          subtotal: res.edgeCost
        });
      }

      if (res.hinges > 0) {
        items.push({
          itemType: "material",
          description: "Bisagras de Cazoleta",
          unitName: "unidad",
          quantity: res.hinges,
          unitCost: prices.hingeUnit,
          unitPrice: prices.hingeUnit,
          subtotal: res.hingeCost
        });
      }

      if (res.slidePairs > 0) {
        items.push({
          itemType: "material",
          description: "Juegos de Rieles / Correderas para Cajones",
          unitName: "par",
          quantity: res.slidePairs,
          unitCost: prices.slidePair,
          unitPrice: prices.slidePair,
          subtotal: res.slideCost
        });
      }

      if (res.handles > 0) {
        items.push({
          itemType: "material",
          description: "Tiradores / Haladores",
          unitName: "unidad",
          quantity: res.handles,
          unitCost: prices.handleUnit,
          unitPrice: prices.handleUnit,
          subtotal: res.handleCost
        });
      }

      if (res.laborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Fabricación y Armado de Muebles",
          unitName: "m2",
          quantity: Number(res.grossMdfArea.toFixed(2)),
          unitCost: prices.laborSquareMeter,
          unitPrice: prices.laborSquareMeter,
          subtotal: res.laborCost
        });
      }

      if (res.installationCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Instalación en Sitio",
          unitName: "mueble",
          quantity: res.quantity,
          unitCost: prices.installationUnit,
          unitPrice: prices.installationUnit,
          subtotal: res.installationCost
        });
      }

      return items;
    }
  });
}

registerMdfFurnitureCalculator();
