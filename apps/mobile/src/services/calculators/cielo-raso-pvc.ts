import {
  calculatePvcCeiling,
  type PvcCeilingInput,
  type PvcCeilingPrices,
  type PvcCeilingResult
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculatePvcCeiling,
  type PvcCeilingInput,
  type PvcCeilingPrices,
  type PvcCeilingResult
};

export function registerPvcCeilingCalculator() {
  calculatorEngine.register<PvcCeilingInput, PvcCeilingPrices, PvcCeilingResult>({
    code: "pvc_ceiling",
    name: "Calculadora de Cielo Raso PVC",
    category: "Cielos",
    calculate: calculatePvcCeiling,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.panelsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Tablillas / Paneles PVC",
          unitName: "pieza",
          quantity: res.panelsToBuy,
          unitCost: prices.panelPiece,
          unitPrice: prices.panelPiece,
          subtotal: res.panelCost
        });
      }

      if (res.trackPieces > 0) {
        items.push({
          itemType: "material",
          description: "Perímetro / Moldura F de PVC",
          unitName: "pieza",
          quantity: res.trackPieces,
          unitCost: prices.trackPiece,
          unitPrice: prices.trackPiece,
          subtotal: res.trackCost
        });
      }

      if (res.supportPieces > 0) {
        items.push({
          itemType: "material",
          description: "Perfiles Principales de Soporte",
          unitName: "pieza",
          quantity: res.supportPieces,
          unitCost: prices.supportPiece,
          unitPrice: prices.supportPiece,
          subtotal: res.supportCost
        });
      }

      if (res.carrierPieces > 0) {
        items.push({
          itemType: "material",
          description: "Perfiles Secundarios / Cargadores",
          unitName: "pieza",
          quantity: res.carrierPieces,
          unitCost: prices.carrierPiece,
          unitPrice: prices.carrierPiece,
          subtotal: res.carrierCost
        });
      }

      if (res.hangers > 0) {
        items.push({
          itemType: "material",
          description: "Colgadores / Anclajes de Suspensión",
          unitName: "unidad",
          quantity: res.hangers,
          unitCost: prices.hangerUnit,
          unitPrice: prices.hangerUnit,
          subtotal: res.hangerCost
        });
      }

      if (res.screwBoxes > 0) {
        items.push({
          itemType: "material",
          description: "Cajas de Tornillos para PVC",
          unitName: "caja",
          quantity: res.screwBoxes,
          unitCost: prices.screwBox,
          unitPrice: prices.screwBox,
          subtotal: res.screwCost
        });
      }

      if (res.laborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Instalación Cielo Raso PVC",
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

registerPvcCeilingCalculator();
