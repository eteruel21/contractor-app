import {
  calculateAirConditioning,
  type AirConditioningInput,
  type AirConditioningPrices,
  type AirConditioningResult
} from "../../utils/calculations";
import { calculatorEngine, type StandardLineItem } from "./engine";

export {
  calculateAirConditioning,
  type AirConditioningInput,
  type AirConditioningPrices,
  type AirConditioningResult
};

export function registerAirConditioningCalculator() {
  calculatorEngine.register<AirConditioningInput, AirConditioningPrices, AirConditioningResult>({
    code: "air_conditioning",
    name: "Calculadora de Aire Acondicionado (HVAC)",
    category: "Climatización",
    calculate: calculateAirConditioning,
    extractSummary: (res) => ({
      materialsCost: res.materialsCost,
      laborCost: res.laborCost,
      totalCost: res.totalCost
    }),
    toLineItems: (res, _input, prices) => {
      const items: StandardLineItem[] = [];

      if (res.equipmentCost > 0) {
        items.push({
          itemType: "equipment",
          description: `Equipos de Aire Acondicionado (${res.selectedCapacityPerUnit} BTU)`,
          unitName: "unidad",
          quantity: res.unitCount,
          unitCost: prices.equipmentUnit,
          unitPrice: prices.equipmentUnit,
          subtotal: res.equipmentCost
        });
      }

      if (res.extraCopperMeters > 0) {
        items.push({
          itemType: "material",
          description: "Tubería Adicional de Cobre Aislada",
          unitName: "metro",
          quantity: Number(res.extraCopperMeters.toFixed(2)),
          unitCost: prices.copperPairMeter,
          unitPrice: prices.copperPairMeter,
          subtotal: res.copperCost
        });
      }

      if (res.brackets > 0) {
        items.push({
          itemType: "material",
          description: "Juego de Soportes / Base para Condensadora",
          unitName: "juego",
          quantity: res.brackets,
          unitCost: prices.bracketSet,
          unitPrice: prices.bracketSet,
          subtotal: res.bracketCost
        });
      }

      if (res.refrigerantKilograms > 0) {
        items.push({
          itemType: "material",
          description: "Refrigerante Adicional (Kg)",
          unitName: "kg",
          quantity: Number(res.refrigerantKilograms.toFixed(2)),
          unitCost: prices.refrigerantKilogram,
          unitPrice: prices.refrigerantKilogram,
          subtotal: res.refrigerantCost
        });
      }

      if (res.installationLaborCost > 0) {
        items.push({
          itemType: "labor",
          description: "Mano de Obra Instalación de Aire Acondicionado",
          unitName: "unidad",
          quantity: res.unitCount,
          unitCost: prices.laborUnit,
          unitPrice: prices.laborUnit,
          subtotal: res.installationLaborCost
        });
      }

      if (res.coreDrillingCost > 0) {
        items.push({
          itemType: "labor",
          description: "Perforaciones / Pases de Muro para Tubería",
          unitName: "pase",
          quantity: res.unitCount,
          unitCost: prices.coreDrillingUnit,
          unitPrice: prices.coreDrillingUnit,
          subtotal: res.coreDrillingCost
        });
      }

      return items;
    }
  });
}

registerAirConditioningCalculator();
