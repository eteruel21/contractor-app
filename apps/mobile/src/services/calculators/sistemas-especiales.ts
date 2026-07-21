import {
  calculateSpecialSystems,
  type SpecialSystemsInput,
  type SpecialSystemsPrices,
  type SpecialSystemsResult,
  type SpecialSystemType
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateSpecialSystems,
  type SpecialSystemsInput,
  type SpecialSystemsPrices,
  type SpecialSystemsResult,
  type SpecialSystemType
};

export function registerSpecialSystemsCalculator() {
  calculatorEngine.register<SpecialSystemsInput, SpecialSystemsPrices, SpecialSystemsResult>({
    code: "special_systems",
    name: "Calculadora de Sistemas Especiales (CCTV, Alarma, Redes)",
    category: "Sistemas Especiales",
    calculate: calculateSpecialSystems,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.deviceA > 0) {
        items.push({
          itemType: "equipment",
          description: "Equipos Dispositivos Tipo A (Cámaras / Sensores Principal)",
          unitName: "unidad",
          quantity: res.deviceA,
          unitCost: prices.deviceAUnit,
          unitPrice: prices.deviceAUnit,
          subtotal: res.deviceACost
        });
      }

      if (res.deviceB > 0) {
        items.push({
          itemType: "equipment",
          description: "Equipos Dispositivos Tipo B",
          unitName: "unidad",
          quantity: res.deviceB,
          unitCost: prices.deviceBUnit,
          unitPrice: prices.deviceBUnit,
          subtotal: res.deviceBCost
        });
      }

      if (res.deviceC > 0) {
        items.push({
          itemType: "equipment",
          description: "Equipos Dispositivos Tipo C",
          unitName: "unidad",
          quantity: res.deviceC,
          unitCost: prices.deviceCUnit,
          unitPrice: prices.deviceCUnit,
          subtotal: res.deviceCCost
        });
      }

      if (res.cableRollsToBuy > 0) {
        items.push({
          itemType: "material",
          description: "Rollos de Cable para Sistemas Especiales (UTP/Coaxial)",
          unitName: "rollo",
          quantity: res.cableRollsToBuy,
          unitCost: prices.cableRoll,
          unitPrice: prices.cableRoll,
          subtotal: res.cableCost
        });
      }

      if (res.conduitPieces > 0) {
        items.push({
          itemType: "material",
          description: "Tubería Conduit para Cableado Estructurado",
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
          description: "Cajas de Conexión / Registro",
          unitName: "unidad",
          quantity: res.boxes,
          unitCost: prices.boxUnit,
          unitPrice: prices.boxUnit,
          subtotal: res.boxCost
        });
      }

      if (res.installationLaborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Cableado e Instalación de Puntos",
          unitName: "punto",
          quantity: res.wiredPoints,
          unitCost: prices.laborWiredPoint,
          unitPrice: prices.laborWiredPoint,
          subtotal: res.installationLaborCost
        });
      }

      if (res.programmingCost > 0) {
        items.push({
          itemType: "service",
          description: "Programación y Configuración del Sistema",
          unitName: "servicio",
          quantity: 1,
          unitCost: prices.programming,
          unitPrice: prices.programming,
          subtotal: res.programmingCost
        });
      }

      return items;
    }
  });
}

registerSpecialSystemsCalculator();
