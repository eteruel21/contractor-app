import { describe, it, expect } from "vitest";
import { calculatorEngine, type FormulaCode } from "../engine";
import "../index"; // Ensure all 10 calculators self-register

describe("T-097: Pruebas de Regresión para el Motor Único de Fórmulas (10 Calculadoras)", () => {
  it("Debe tener las 10 calculadoras registradas en el motor", () => {
    const list = calculatorEngine.list();
    expect(list).toHaveLength(10);
    const codes = list.map((c) => c.code);
    expect(codes).toContain("concrete");
    expect(codes).toContain("masonry");
    expect(codes).toContain("gypsum");
    expect(codes).toContain("pvc_ceiling");
    expect(codes).toContain("paint");
    expect(codes).toContain("flooring");
    expect(codes).toContain("electrical");
    expect(codes).toContain("special_systems");
    expect(codes).toContain("air_conditioning");
    expect(codes).toContain("mdf_furniture");
  });

  // 1. Concrete Engine Test
  it("1. Motor de Fórmulas - Concreto (concrete)", () => {
    const res = calculatorEngine.execute("concrete", {
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
    }, {
      cementBag: 10,
      sandCubicMeter: 30,
      sandBag: 3,
      gravelCubicMeter: 35,
      gravelBag: 4,
      laborCubicMeter: 20
    });

    expect(res.formulaCode).toBe("concrete");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.length).toBeGreaterThan(0);
    expect(res.lineItems[0].subtotal).toBeGreaterThan(0);
  });

  // 2. Masonry Engine Test
  it("2. Motor de Fórmulas - Mampostería y Repello (masonry)", () => {
    const res = calculatorEngine.execute("masonry", {
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
    }, {
      blockUnit: 0.85,
      cementBag: 9.5,
      sandCubicMeter: 28,
      masonryLaborSquareMeter: 12,
      plasterLaborSquareMeter: 8
    });

    expect(res.formulaCode).toBe("masonry");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.description.includes("Bloques"))).toBeDefined();
  });

  // 3. Gypsum Engine Test
  it("3. Motor de Fórmulas - Gypsum / Drywall (gypsum)", () => {
    const res = calculatorEngine.execute("gypsum", {
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
    }, {
      boardUnit: 11,
      studPiece: 3.5,
      trackPiece: 3.0,
      screwBox: 8,
      tapeRoll: 5,
      compoundPackage: 18,
      laborSquareMeter: 10
    });

    expect(res.formulaCode).toBe("gypsum");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.unitName === "placa")).toBeDefined();
  });

  // 4. PVC Ceiling Engine Test
  it("4. Motor de Fórmulas - Cielo Raso PVC (pvc_ceiling)", () => {
    const res = calculatorEngine.execute("pvc_ceiling", {
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
    }, {
      panelPiece: 12,
      trackPiece: 3,
      supportPiece: 4,
      carrierPiece: 3.5,
      hangerUnit: 1,
      screwBox: 8,
      laborSquareMeter: 6
    });

    expect(res.formulaCode).toBe("pvc_ceiling");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.length).toBeGreaterThan(0);
  });

  // 5. Paint Engine Test
  it("5. Motor de Fórmulas - Pintura (paint)", () => {
    const res = calculatorEngine.execute("paint", {
      grossArea: 120,
      openingsArea: 0,
      coats: 2,
      coveragePerGallon: 30,
      primerEnabled: true,
      primerCoats: 1,
      primerCoveragePerGallon: 35,
      wastePercentage: 5
    }, {
      paintGallon: 22,
      primerGallon: 18,
      supplies: 10,
      laborSquareMeter: 4.5
    });

    expect(res.formulaCode).toBe("paint");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.unitName === "galón")).toBeDefined();
  });

  // 6. Flooring Engine Test
  it("6. Motor de Fórmulas - Pisos y Azulejos (flooring)", () => {
    const res = calculatorEngine.execute("flooring", {
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
    }, {
      flooringBox: 25,
      adhesiveBag: 8,
      groutBag: 4,
      supplies: 10,
      laborSquareMeter: 9.0
    });

    expect(res.formulaCode).toBe("flooring");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.unitName === "caja")).toBeDefined();
  });

  // 7. Electrical Engine Test
  it("7. Motor de Fórmulas - Electricidad (electrical)", () => {
    const res = calculatorEngine.execute("electrical", {
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
    }, {
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
    });

    expect(res.formulaCode).toBe("electrical");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.unitName === "rollo")).toBeDefined();
  });

  // 8. Special Systems Engine Test
  it("8. Motor de Fórmulas - Sistemas Especiales (special_systems)", () => {
    const res = calculatorEngine.execute("special_systems", {
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
    }, {
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
    });

    expect(res.formulaCode).toBe("special_systems");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.itemType === "equipment")).toBeDefined();
  });

  // 9. Air Conditioning Engine Test
  it("9. Motor de Fórmulas - Aire Acondicionado (air_conditioning)", () => {
    const res = calculatorEngine.execute("air_conditioning", {
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
    }, {
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
    });

    expect(res.formulaCode).toBe("air_conditioning");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.itemType === "equipment")).toBeDefined();
  });

  // 10. MDF Furniture Engine Test
  it("10. Motor de Fórmulas - Muebles MDF (mdf_furniture)", () => {
    const res = calculatorEngine.execute("mdf_furniture", {
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
    }, {
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
    });

    expect(res.formulaCode).toBe("mdf_furniture");
    expect(res.summary.totalCost).toBeGreaterThan(0);
    expect(res.lineItems.find((i) => i.unitName === "tablero")).toBeDefined();
  });

  it("Manejo de errores si la calculadora no existe", () => {
    expect(() => calculatorEngine.execute("invalid_code" as FormulaCode, {}, {})).toThrow("Calculadora no registrada");
  });
});
