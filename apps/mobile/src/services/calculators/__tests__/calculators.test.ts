import { describe, it, expect } from "vitest";
import {
  calculateConcrete,
  calculateMasonry,
  calculatePvcCeiling,
  calculateAirConditioning,
  calculateElectrical,
  calculateGypsum,
  calculateMdfFurniture,
  calculatePaint,
  calculateFlooring,
  calculateSpecialSystems
} from "../index";

describe("T-056: Calculadoras de Construcción (10 Calculadoras)", () => {
  // 1. Concreto
  describe("1. Calculadora de Concreto (calculateConcrete)", () => {
    const defaultPrices = {
      cementBag: 10,
      sandCubicMeter: 30,
      sandBag: 3,
      gravelCubicMeter: 35,
      gravelBag: 4,
      laborCubicMeter: 20
    };

    it("Caso normal", () => {
      const result = calculateConcrete(
        {
          length: 5,
          width: 4,
          thickness: 0.15,
          wastePercentage: 5,
          mixCement: 1,
          mixSand: 2,
          mixGravel: 3,
          cementBagWeight: 42.5,
          sandBagVolume: 0.0142,
          gravelBagVolume: 0.0142,
          sandPriceMode: "cubicMeter",
          gravelPriceMode: "cubicMeter"
        },
        defaultPrices
      );

      expect(result.netVolume).toBe(3);
      expect(result.volumeWithWaste).toBeCloseTo(3.15, 2);
      expect(result.cementBagsToBuy).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateConcrete(
        {
          length: 0,
          width: 0,
          thickness: 0,
          wastePercentage: 0,
          mixCement: 1,
          mixSand: 2,
          mixGravel: 3,
          cementBagWeight: 42.5,
          sandBagVolume: 0.0142,
          gravelBagVolume: 0.0142,
          sandPriceMode: "cubicMeter",
          gravelPriceMode: "cubicMeter"
        },
        defaultPrices
      );

      expect(result.netVolume).toBe(0);
      expect(result.totalCost).toBe(0);
    });

    it("Límites y entradas inválidas", () => {
      const result = calculateConcrete(
        {
          length: -5,
          width: NaN,
          thickness: -0.1,
          wastePercentage: -10,
          mixCement: 1,
          mixSand: 2,
          mixGravel: 3,
          cementBagWeight: 42.5,
          sandBagVolume: 0.0142,
          gravelBagVolume: 0.0142,
          sandPriceMode: "cubicMeter",
          gravelPriceMode: "cubicMeter"
        },
        defaultPrices
      );

      expect(result.netVolume).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 2. Bloques y Repello
  describe("2. Calculadora de Bloques y Repello (calculateMasonry)", () => {
    const defaultPrices = {
      blockUnit: 0.85,
      cementBag: 9.5,
      sandCubicMeter: 28,
      masonryLaborSquareMeter: 12,
      plasterLaborSquareMeter: 8
    };

    it("Caso normal", () => {
      const result = calculateMasonry(
        {
          wallLength: 10,
          wallHeight: 3,
          openingsArea: 2,
          blockLength: 0.4,
          blockHeight: 0.2,
          blockWastePercentage: 5,
          layingMortarVolumePerSquareMeter: 0.015,
          mixCement: 1,
          mixSand: 4,
          plasterSides: 2,
          plasterThickness: 0.015,
          plasterWastePercentage: 5,
          cementBagWeight: 42.5
        },
        defaultPrices
      );

      expect(result.netWallArea).toBe(28);
      expect(result.blocksToBuy).toBeGreaterThan(300);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateMasonry(
        {
          wallLength: 0,
          wallHeight: 0,
          openingsArea: 0,
          blockLength: 0.4,
          blockHeight: 0.2,
          blockWastePercentage: 0,
          layingMortarVolumePerSquareMeter: 0,
          mixCement: 1,
          mixSand: 4,
          plasterSides: 0,
          plasterThickness: 0,
          plasterWastePercentage: 0,
          cementBagWeight: 42.5
        },
        defaultPrices
      );

      expect(result.netWallArea).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 3. Cielo Raso PVC
  describe("3. Calculadora de Cielo Raso PVC (calculatePvcCeiling)", () => {
    const defaultPrices = {
      panelPiece: 12,
      trackPiece: 3,
      supportPiece: 4,
      carrierPiece: 3.5,
      hangerUnit: 1,
      screwBox: 8,
      laborSquareMeter: 6
    };

    it("Caso normal", () => {
      const result = calculatePvcCeiling(
        {
          area: 30,
          perimeter: 22,
          panelWidth: 0.2,
          panelLength: 5.95,
          wastePercentage: 10,
          supportSpacing: 0.6,
          supportPieceLength: 3,
          carrierSpacing: 1.2,
          carrierPieceLength: 3,
          trackPieceLength: 3,
          hangerSpacing: 1,
          screwsPerSquareMeter: 12,
          screwsPerBox: 100
        },
        defaultPrices
      );

      expect(result.netArea).toBe(30);
      expect(result.panelsToBuy).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculatePvcCeiling(
        {
          area: 0,
          perimeter: 0,
          panelWidth: 0.2,
          panelLength: 5.95,
          wastePercentage: 0,
          supportSpacing: 0,
          supportPieceLength: 0,
          carrierSpacing: 0,
          carrierPieceLength: 0,
          trackPieceLength: 0,
          hangerSpacing: 0,
          screwsPerSquareMeter: 0,
          screwsPerBox: 100
        },
        defaultPrices
      );

      expect(result.netArea).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 4. Aire Acondicionado
  describe("4. Calculadora de Aire Acondicionado (calculateAirConditioning)", () => {
    const defaultPrices = {
      equipmentUnit: 450,
      copperPairMeter: 15,
      cableMeter: 2.5,
      drainPiece: 4,
      bracketSet: 25,
      breakerUnit: 12,
      disconnectUnit: 15,
      refrigerantKilogram: 20,
      supplies: 15,
      laborUnit: 120,
      coreDrillingUnit: 30
    };

    it("Caso normal", () => {
      const result = calculateAirConditioning(
        {
          grossArea: 25,
          excludedArea: 0,
          unitCount: 1,
          occupants: 3,
          btuPerSquareMeter: 600,
          extraBtuPerPerson: 600,
          heatLoadPercentage: 10,
          selectedCapacityBtu: 18000,
          copperRoutePerUnit: 5,
          includedCopperPerUnit: 3,
          cableRoutePerUnit: 6,
          drainRoutePerUnit: 4,
          wastePercentage: 5,
          drainPieceLength: 3,
          refrigerantKgPerExtraMeter: 0.02
        },
        defaultPrices
      );

      expect(result.netArea).toBe(25);
      expect(result.recommendedCapacityPerUnit).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateAirConditioning(
        {
          grossArea: 0,
          excludedArea: 0,
          unitCount: 0,
          occupants: 0,
          btuPerSquareMeter: 600,
          extraBtuPerPerson: 600,
          heatLoadPercentage: 0,
          selectedCapacityBtu: 0,
          copperRoutePerUnit: 0,
          includedCopperPerUnit: 0,
          cableRoutePerUnit: 0,
          drainRoutePerUnit: 0,
          wastePercentage: 0,
          drainPieceLength: 0,
          refrigerantKgPerExtraMeter: 0
        },
        defaultPrices
      );

      expect(result.netArea).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 5. Electricidad
  describe("5. Calculadora de Electricidad (calculateElectrical)", () => {
    const defaultPrices = {
      lightingCableRoll: 45,
      powerCableRoll: 55,
      conduitPiece: 3.5,
      boxUnit: 1.2,
      outletUnit: 3.5,
      switchUnit: 4.0,
      breakerUnit: 12.0,
      supplies: 20,
      laborStandardPoint: 25.0,
      laborDedicatedPoint: 35.0
    };

    it("Caso normal", () => {
      const result = calculateElectrical(
        {
          lightPoints: 6,
          switchPoints: 4,
          outletPoints: 10,
          dedicatedPoints: 1,
          averageRouteLength: 10,
          cableRollLength: 100,
          conduitPieceLength: 3,
          lightingPointsPerCircuit: 10,
          outletPointsPerCircuit: 8,
          lightingConductors: 2,
          powerConductors: 3,
          wastePercentage: 10
        },
        defaultPrices
      );

      expect(result.totalPoints).toBe(21);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateElectrical(
        {
          lightPoints: 0,
          switchPoints: 0,
          outletPoints: 0,
          dedicatedPoints: 0,
          averageRouteLength: 0,
          cableRollLength: 100,
          conduitPieceLength: 3,
          lightingPointsPerCircuit: 10,
          outletPointsPerCircuit: 8,
          lightingConductors: 2,
          powerConductors: 3,
          wastePercentage: 0
        },
        defaultPrices
      );

      expect(result.totalPoints).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 6. Gypsum
  describe("6. Calculadora de Gypsum (calculateGypsum)", () => {
    const defaultPrices = {
      boardUnit: 11,
      studPiece: 3.5,
      trackPiece: 3.0,
      screwBox: 8,
      tapeRoll: 5,
      compoundPackage: 18,
      laborSquareMeter: 10
    };

    it("Caso normal", () => {
      const result = calculateGypsum(
        {
          wallLength: 8,
          wallHeight: 2.7,
          openingsArea: 0,
          boardWidth: 1.22,
          boardHeight: 2.44,
          boardSides: 2,
          studSpacing: 0.406,
          studPieceLength: 3.05,
          trackPieceLength: 3.05,
          screwsPerBoard: 30,
          screwsPerBox: 1000,
          tapePerSquareMeter: 1,
          tapeRollLength: 75,
          compoundKgPerSquareMeter: 1.5,
          compoundPackageKg: 20,
          wastePercentage: 8
        },
        defaultPrices
      );

      expect(result.netWallArea).toBeCloseTo(21.6, 1);
      expect(result.boardsToBuy).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateGypsum(
        {
          wallLength: 0,
          wallHeight: 0,
          openingsArea: 0,
          boardWidth: 1.22,
          boardHeight: 2.44,
          boardSides: 1,
          studSpacing: 0,
          studPieceLength: 0,
          trackPieceLength: 0,
          screwsPerBoard: 0,
          screwsPerBox: 1,
          tapePerSquareMeter: 0,
          tapeRollLength: 1,
          compoundKgPerSquareMeter: 0,
          compoundPackageKg: 1,
          wastePercentage: 0
        },
        defaultPrices
      );

      expect(result.netWallArea).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 7. Muebles MDF
  describe("7. Calculadora de Muebles MDF (calculateMdfFurniture)", () => {
    const defaultPrices = {
      boardPiece: 35,
      edgeMeter: 0.5,
      hardwareKit: 15,
      screwBox: 8,
      supplies: 10,
      laborMeter: 40
    };

    it("Caso normal", () => {
      const result = calculateMdfFurniture(
        {
          width: 0.8,
          height: 0.9,
          depth: 0.6,
          quantity: 1,
          verticalPanels: 2,
          horizontalPanels: 2,
          shelves: 1,
          frontArea: 0.5,
          backArea: 0.7,
          extraMdfArea: 0,
          wastePercentage: 10,
          boardWidth: 1.22,
          boardLength: 2.44,
          backBoardWidth: 1.22,
          backBoardLength: 2.44,
          extraEdgeMeters: 5,
          edgeRollLength: 50,
          doors: 2,
          hingesPerDoor: 2,
          drawers: 0,
          slidesPerDrawer: 0,
          handles: 2,
          legs: 4
        },
        {
          mdfBoard: 35,
          backBoard: 15,
          edgeRoll: 12,
          hingeUnit: 2.5,
          slidePair: 6,
          handleUnit: 3,
          legUnit: 2,
          supplies: 10,
          laborSquareMeter: 25,
          installationUnit: 30
        }
      );

      expect(result.boardsToBuy).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateMdfFurniture(
        {
          width: 0,
          height: 0,
          depth: 0,
          quantity: 1,
          verticalPanels: 0,
          horizontalPanels: 0,
          shelves: 0,
          frontArea: 0,
          backArea: 0,
          extraMdfArea: 0,
          wastePercentage: 0,
          boardWidth: 1.22,
          boardLength: 2.44,
          backBoardWidth: 1.22,
          backBoardLength: 2.44,
          extraEdgeMeters: 0,
          edgeRollLength: 50,
          doors: 0,
          hingesPerDoor: 0,
          drawers: 0,
          slidesPerDrawer: 0,
          handles: 0,
          legs: 0
        },
        {
          mdfBoard: 35,
          backBoard: 15,
          edgeRoll: 12,
          hingeUnit: 2.5,
          slidePair: 6,
          handleUnit: 3,
          legUnit: 2,
          supplies: 0,
          laborSquareMeter: 25,
          installationUnit: 0
        }
      );

      expect(result.boardsToBuy).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 8. Pintura
  describe("8. Calculadora de Pintura (calculatePaint)", () => {
    const defaultPrices = {
      paintGallon: 22,
      primerGallon: 18,
      supplies: 10,
      laborSquareMeter: 4.5
    };

    it("Caso normal", () => {
      const result = calculatePaint(
        {
          grossArea: 120,
          openingsArea: 0,
          coats: 2,
          coveragePerGallon: 30,
          primerEnabled: true,
          primerCoats: 1,
          primerCoveragePerGallon: 35,
          wastePercentage: 5
        },
        defaultPrices
      );

      expect(result.netArea).toBe(120);
      expect(result.paintGallonsToBuy).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculatePaint(
        {
          grossArea: 0,
          openingsArea: 0,
          coats: 0,
          coveragePerGallon: 30,
          primerEnabled: false,
          primerCoats: 0,
          primerCoveragePerGallon: 35,
          wastePercentage: 0
        },
        { ...defaultPrices, supplies: 0 }
      );

      expect(result.netArea).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 9. Pisos
  describe("9. Calculadora de Pisos (calculateFlooring)", () => {
    const defaultPrices = {
      flooringBox: 25,
      adhesiveBag: 8,
      groutBag: 4,
      supplies: 10,
      laborSquareMeter: 9.0
    };

    it("Caso normal", () => {
      const result = calculateFlooring(
        {
          grossArea: 20,
          excludedArea: 0,
          tileLengthCm: 60,
          tileWidthCm: 60,
          piecesPerBox: 4,
          wastePercentage: 10,
          adhesiveCoveragePerBag: 4,
          groutJointWidthMm: 2,
          groutJointDepthMm: 6,
          groutBagKilograms: 5
        },
        defaultPrices
      );

      expect(result.netArea).toBe(20);
      expect(result.piecesToBuy).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateFlooring(
        {
          grossArea: 0,
          excludedArea: 0,
          tileLengthCm: 60,
          tileWidthCm: 60,
          piecesPerBox: 4,
          wastePercentage: 0,
          adhesiveCoveragePerBag: 4,
          groutJointWidthMm: 2,
          groutJointDepthMm: 6,
          groutBagKilograms: 5
        },
        defaultPrices
      );

      expect(result.netArea).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });

  // 10. Sistemas Especiales
  describe("10. Calculadora de Sistemas Especiales (calculateSpecialSystems)", () => {
    const defaultPrices = {
      deviceAUnit: 65,
      deviceBUnit: 120,
      deviceCUnit: 25,
      deviceDUnit: 150,
      deviceEUnit: 180,
      cableRoll: 55,
      conduitPiece: 3.5,
      boxUnit: 1.2,
      supplies: 20,
      laborWiredPoint: 35,
      programming: 50
    };

    it("Caso normal (CCTV)", () => {
      const result = calculateSpecialSystems(
        {
          systemType: "cctv",
          deviceA: 8,
          deviceB: 1,
          deviceC: 0,
          deviceD: 0,
          deviceE: 0,
          wiredPoints: 8,
          averageRouteLength: 20,
          cableRunsPerPoint: 1,
          wastePercentage: 10,
          cableRollLength: 305,
          conduitPieceLength: 3
        },
        defaultPrices
      );

      expect(result.totalEquipment).toBe(9);
      expect(result.wiredPoints).toBe(8);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("Valores cero", () => {
      const result = calculateSpecialSystems(
        {
          systemType: "cctv",
          deviceA: 0,
          deviceB: 0,
          deviceC: 0,
          deviceD: 0,
          deviceE: 0,
          wiredPoints: 0,
          averageRouteLength: 0,
          cableRunsPerPoint: 1,
          wastePercentage: 0,
          cableRollLength: 305,
          conduitPieceLength: 3
        },
        defaultPrices
      );

      expect(result.totalEquipment).toBe(0);
      expect(result.totalCost).toBe(0);
    });
  });
});
