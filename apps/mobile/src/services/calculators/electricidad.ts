import {
  calculateElectrical,
  type ElectricalInput,
  type ElectricalPrices,
  type ElectricalResult
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateElectrical,
  type ElectricalInput,
  type ElectricalPrices,
  type ElectricalResult
};

export function registerElectricalCalculator() {
  calculatorEngine.register<ElectricalInput, ElectricalPrices, ElectricalResult>({
    code: "electrical",
    name: "Calculadora de Instalación Eléctrica",
    category: "Instalaciones",
    calculate: calculateElectrical,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.lightingCableRollsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Rollos de Cable Eléctrico para Iluminación",
          unitName: "rollo",
          quantity: res.lightingCableRollsToBuy,
          unitCost: prices.lightingCableRoll,
          unitPrice: prices.lightingCableRoll,
          subtotal: res.lightingCableCost
        });
      }

      if (res.powerCableRollsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Rollos de Cable Eléctrico para Tomacorrientes/Fuerza",
          unitName: "rollo",
          quantity: res.powerCableRollsToBuy,
          unitCost: prices.powerCableRoll,
          unitPrice: prices.powerCableRoll,
          subtotal: res.powerCableCost
        });
      }

      if (res.conduitPieces > 0) {
        items.push({
          itemType: "material",
          description: "Tubería Conduit Eléctrica",
          unitName: "pieza",
          quantity: res.conduitPieces,
          unitCost: prices.conduitPiece,
          unitPrice: prices.conduitPiece,
          subtotal: res.conduitCost
        });
      }

      if (res.boxes > 0) {
        items.push({
          itemType: "material",
          description: "Cajas Eléctricas de Paso / Registro",
          unitName: "unidad",
          quantity: res.boxes,
          unitCost: prices.boxUnit,
          unitPrice: prices.boxUnit,
          subtotal: res.boxCost
        });
      }

      if (res.outletPoints + res.dedicatedPoints > 0) {
        items.push({
          itemType: "material",
          description: "Módulos y Placas de Tomacorrientes",
          unitName: "unidad",
          quantity: res.outletPoints + res.dedicatedPoints,
          unitCost: prices.outletUnit,
          unitPrice: prices.outletUnit,
          subtotal: res.outletCost
        });
      }

      if (res.switchPoints > 0) {
        items.push({
          itemType: "material",
          description: "Módulos y Placas de Interruptores",
          unitName: "unidad",
          quantity: res.switchPoints,
          unitCost: prices.switchUnit,
          unitPrice: prices.switchUnit,
          subtotal: res.switchCost
        });
      }

      if (res.totalBreakers > 0) {
        items.push({
          itemType: "material",
          description: "Interruptores Termomagnéticos (Breakers)",
          unitName: "unidad",
          quantity: res.totalBreakers,
          unitCost: prices.breakerUnit,
          unitPrice: prices.breakerUnit,
          subtotal: res.breakerCost
        });
      }

      if (res.suppliesCost > 0) {
        items.push({
          itemType: "material",
          description: "Insumos Eléctricos (Cinta aislante, conectores, conectores de compresión)",
          unitName: "global",
          quantity: 1,
          unitCost: prices.supplies,
          unitPrice: prices.supplies,
          subtotal: res.suppliesCost
        });
      }

      if (res.standardLaborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Puntos Eléctricos Estándar",
          unitName: "punto",
          quantity: res.standardPoints,
          unitCost: prices.laborStandardPoint,
          unitPrice: prices.laborStandardPoint,
          subtotal: res.standardLaborCost
        });
      }

      if (res.dedicatedLaborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Puntos Eléctricos Dedicados/Especiales",
          unitName: "punto",
          quantity: res.dedicatedPoints,
          unitCost: prices.laborDedicatedPoint,
          unitPrice: prices.laborDedicatedPoint,
          subtotal: res.dedicatedLaborCost
        });
      }

      return items;
    }
  });
}

registerElectricalCalculator();
