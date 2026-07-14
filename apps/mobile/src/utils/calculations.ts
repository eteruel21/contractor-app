export type AggregatePriceMode = "cubicMeter" | "bag";

export type ConcreteInput = {
  length: number;
  width: number;
  thickness: number;
  wastePercentage: number;

  mixCement: number;
  mixSand: number;
  mixGravel: number;

  cementBagWeight: number;
  sandBagVolume: number;
  gravelBagVolume: number;

  sandPriceMode: AggregatePriceMode;
  gravelPriceMode: AggregatePriceMode;

  cementDensityKgM3?: number;
  dryVolumeFactor?: number;
  defaultAggregateBagVolume?: number;
};

export type ConcretePrices = {
  cementBag: number;

  sandCubicMeter: number;
  sandBag: number;

  gravelCubicMeter: number;
  gravelBag: number;

  laborCubicMeter: number;
};

export type ConcreteResult = {
  netVolume: number;
  volumeWithWaste: number;
  dryVolume: number;

  cementBags: number;
  cementBagsToBuy: number;
  cementKilograms: number;

  sandVolume: number;
  sandBags: number;
  sandBagsToBuy: number;

  gravelVolume: number;
  gravelBags: number;
  gravelBagsToBuy: number;

  cementCost: number;
  sandCost: number;
  gravelCost: number;
  laborCost: number;

  materialsCost: number;
  totalCost: number;
};

const CEMENT_DENSITY_KG_M3 = 1440;
const DRY_VOLUME_FACTOR = 1.54;
const DEFAULT_AGGREGATE_BAG_VOLUME = 0.0142;

function sanitizeNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

function createEmptyResult(): ConcreteResult {
  return {
    netVolume: 0,
    volumeWithWaste: 0,
    dryVolume: 0,

    cementBags: 0,
    cementBagsToBuy: 0,
    cementKilograms: 0,

    sandVolume: 0,
    sandBags: 0,
    sandBagsToBuy: 0,

    gravelVolume: 0,
    gravelBags: 0,
    gravelBagsToBuy: 0,

    cementCost: 0,
    sandCost: 0,
    gravelCost: 0,
    laborCost: 0,

    materialsCost: 0,
    totalCost: 0,
  };
}

export function calculateConcrete(
  input: ConcreteInput,
  prices: ConcretePrices,
): ConcreteResult {
  const length = sanitizeNumber(input.length);
  const width = sanitizeNumber(input.width);
  const thickness = sanitizeNumber(input.thickness);
  const wastePercentage = Math.min(
    sanitizeNumber(input.wastePercentage),
    100,
  );

  const cementPart = sanitizeNumber(input.mixCement);
  const sandPart = sanitizeNumber(input.mixSand);
  const gravelPart = sanitizeNumber(input.mixGravel);

  const cementBagWeight =
    sanitizeNumber(input.cementBagWeight) || 42.5;

  const cementDensityKgM3 =
    sanitizeNumber(input.cementDensityKgM3 ?? 0) ||
    CEMENT_DENSITY_KG_M3;

  const dryVolumeFactor =
    sanitizeNumber(input.dryVolumeFactor ?? 0) ||
    DRY_VOLUME_FACTOR;

  const defaultAggregateBagVolume =
    sanitizeNumber(
      input.defaultAggregateBagVolume ?? 0,
    ) || DEFAULT_AGGREGATE_BAG_VOLUME;

  const sandBagVolume =
    sanitizeNumber(input.sandBagVolume) ||
    defaultAggregateBagVolume;

  const gravelBagVolume =
    sanitizeNumber(input.gravelBagVolume) ||
    defaultAggregateBagVolume;

  const totalParts = cementPart + sandPart + gravelPart;

  if (
    length === 0 ||
    width === 0 ||
    thickness === 0 ||
    cementPart === 0 ||
    sandPart === 0 ||
    gravelPart === 0
  ) {
    return createEmptyResult();
  }

  const netVolume = length * width * thickness;
  const volumeWithWaste =
    netVolume * (1 + wastePercentage / 100);
  const dryVolume = volumeWithWaste * dryVolumeFactor;

  const cementVolume =
    dryVolume * (cementPart / totalParts);
  const sandVolume =
    dryVolume * (sandPart / totalParts);
  const gravelVolume =
    dryVolume * (gravelPart / totalParts);

  const cementKilograms =
    cementVolume * cementDensityKgM3;
  const cementBags = cementKilograms / cementBagWeight;
  const cementBagsToBuy = Math.ceil(cementBags);

  const sandBags = sandVolume / sandBagVolume;
  const gravelBags = gravelVolume / gravelBagVolume;
  const sandBagsToBuy = Math.ceil(sandBags);
  const gravelBagsToBuy = Math.ceil(gravelBags);

  const cementCost =
    cementBagsToBuy * sanitizeNumber(prices.cementBag);

  const sandCost =
    input.sandPriceMode === "bag"
      ? sandBagsToBuy * sanitizeNumber(prices.sandBag)
      : sandVolume * sanitizeNumber(prices.sandCubicMeter);

  const gravelCost =
    input.gravelPriceMode === "bag"
      ? gravelBagsToBuy * sanitizeNumber(prices.gravelBag)
      : gravelVolume * sanitizeNumber(prices.gravelCubicMeter);

  const laborCost =
    volumeWithWaste *
    sanitizeNumber(prices.laborCubicMeter);

  const materialsCost =
    cementCost + sandCost + gravelCost;
  const totalCost = materialsCost + laborCost;

  return {
    netVolume,
    volumeWithWaste,
    dryVolume,

    cementBags,
    cementBagsToBuy,
    cementKilograms,

    sandVolume,
    sandBags,
    sandBagsToBuy,

    gravelVolume,
    gravelBags,
    gravelBagsToBuy,

    cementCost,
    sandCost,
    gravelCost,
    laborCost,

    materialsCost,
    totalCost,
  };
}

export type PlasterSides = 0 | 1 | 2;

export type MasonryInput = {
  wallLength: number;
  wallHeight: number;
  openingsArea: number;
  blockLength: number;
  blockHeight: number;
  blockWastePercentage: number;
  layingMortarVolumePerSquareMeter: number;
  plasterSides: PlasterSides;
  plasterThickness: number;
  plasterWastePercentage: number;
  mixCement: number;
  mixSand: number;
  cementBagWeight: number;
};

export type MasonryPrices = {
  blockUnit: number;
  cementBag: number;
  sandCubicMeter: number;
  masonryLaborSquareMeter: number;
  plasterLaborSquareMeter: number;
};

export type MasonryResult = {
  grossWallArea: number;
  netWallArea: number;
  blockFaceArea: number;
  blocksExact: number;
  blocksToBuy: number;
  layingMortarVolume: number;
  plasterArea: number;
  plasterMortarVolume: number;
  totalWetMortarVolume: number;
  dryMortarVolume: number;
  cementBags: number;
  cementBagsToBuy: number;
  sandVolume: number;
  blockCost: number;
  cementCost: number;
  sandCost: number;
  masonryLaborCost: number;
  plasterLaborCost: number;
  materialsCost: number;
  laborCost: number;
  totalCost: number;
};

const MORTAR_DRY_VOLUME_FACTOR = 1.33;

function createEmptyMasonryResult(): MasonryResult {
  return {
    grossWallArea: 0,
    netWallArea: 0,
    blockFaceArea: 0,
    blocksExact: 0,
    blocksToBuy: 0,
    layingMortarVolume: 0,
    plasterArea: 0,
    plasterMortarVolume: 0,
    totalWetMortarVolume: 0,
    dryMortarVolume: 0,
    cementBags: 0,
    cementBagsToBuy: 0,
    sandVolume: 0,
    blockCost: 0,
    cementCost: 0,
    sandCost: 0,
    masonryLaborCost: 0,
    plasterLaborCost: 0,
    materialsCost: 0,
    laborCost: 0,
    totalCost: 0,
  };
}

export function calculateMasonry(
  input: MasonryInput,
  prices: MasonryPrices,
): MasonryResult {
  const wallLength = sanitizeNumber(input.wallLength);
  const wallHeight = sanitizeNumber(input.wallHeight);
  const openingsArea = sanitizeNumber(input.openingsArea);
  const blockLength = sanitizeNumber(input.blockLength);
  const blockHeight = sanitizeNumber(input.blockHeight);
  const mixCement = sanitizeNumber(input.mixCement);
  const mixSand = sanitizeNumber(input.mixSand);
  const totalParts = mixCement + mixSand;

  if (
    wallLength === 0 ||
    wallHeight === 0 ||
    blockLength === 0 ||
    blockHeight === 0 ||
    totalParts === 0
  ) {
    return createEmptyMasonryResult();
  }

  const grossWallArea = wallLength * wallHeight;
  const netWallArea = Math.max(grossWallArea - openingsArea, 0);

  if (netWallArea === 0) {
    return {
      ...createEmptyMasonryResult(),
      grossWallArea,
      blockFaceArea: blockLength * blockHeight,
    };
  }

  const blockFaceArea = blockLength * blockHeight;
  const blockWasteFactor =
    1 + sanitizeNumber(input.blockWastePercentage) / 100;
  const blocksExact =
    (netWallArea / blockFaceArea) * blockWasteFactor;
  const blocksToBuy = Math.ceil(blocksExact);

  const layingMortarVolume =
    netWallArea *
    sanitizeNumber(input.layingMortarVolumePerSquareMeter) *
    blockWasteFactor;

  const plasterSides = Math.min(
    Math.max(Math.round(sanitizeNumber(input.plasterSides)), 0),
    2,
  );
  const plasterArea = netWallArea * plasterSides;
  const plasterMortarVolume =
    plasterArea *
    sanitizeNumber(input.plasterThickness) *
    (1 + sanitizeNumber(input.plasterWastePercentage) / 100);

  const totalWetMortarVolume =
    layingMortarVolume + plasterMortarVolume;
  const dryMortarVolume =
    totalWetMortarVolume * MORTAR_DRY_VOLUME_FACTOR;
  const cementVolume =
    dryMortarVolume * (mixCement / totalParts);
  const sandVolume = dryMortarVolume * (mixSand / totalParts);
  const cementBagWeight =
    sanitizeNumber(input.cementBagWeight) || 42.5;

  const cementBags =
    (cementVolume * CEMENT_DENSITY_KG_M3) / cementBagWeight;
  const cementBagsToBuy = Math.ceil(cementBags);

  const blockCost =
    blocksToBuy * sanitizeNumber(prices.blockUnit);
  const cementCost =
    cementBagsToBuy * sanitizeNumber(prices.cementBag);
  const sandCost =
    sandVolume * sanitizeNumber(prices.sandCubicMeter);
  const masonryLaborCost =
    netWallArea *
    sanitizeNumber(prices.masonryLaborSquareMeter);
  const plasterLaborCost =
    plasterArea *
    sanitizeNumber(prices.plasterLaborSquareMeter);
  const materialsCost = blockCost + cementCost + sandCost;
  const laborCost = masonryLaborCost + plasterLaborCost;
  const totalCost = materialsCost + laborCost;

  return {
    grossWallArea,
    netWallArea,
    blockFaceArea,
    blocksExact,
    blocksToBuy,
    layingMortarVolume,
    plasterArea,
    plasterMortarVolume,
    totalWetMortarVolume,
    dryMortarVolume,
    cementBags,
    cementBagsToBuy,
    sandVolume,
    blockCost,
    cementCost,
    sandCost,
    masonryLaborCost,
    plasterLaborCost,
    materialsCost,
    laborCost,
    totalCost,
  };
}

export type GypsumBoardSides = 1 | 2;

export type GypsumInput = {
  wallLength: number;
  wallHeight: number;
  openingsArea: number;
  boardSides: GypsumBoardSides;
  boardWidth: number;
  boardHeight: number;
  wastePercentage: number;
  studSpacing: number;
  studPieceLength: number;
  trackPieceLength: number;
  screwsPerBoard: number;
  screwsPerBox: number;
  tapePerSquareMeter: number;
  tapeRollLength: number;
  compoundKgPerSquareMeter: number;
  compoundPackageKg: number;
};

export type GypsumPrices = {
  boardUnit: number;
  studPiece: number;
  trackPiece: number;
  screwBox: number;
  tapeRoll: number;
  compoundPackage: number;
  laborSquareMeter: number;
};

export type GypsumResult = {
  grossWallArea: number;
  netWallArea: number;
  finishedArea: number;
  boardsExact: number;
  boardsToBuy: number;
  studPositions: number;
  studLinearMeters: number;
  studPieces: number;
  trackLinearMeters: number;
  trackPieces: number;
  screws: number;
  screwBoxes: number;
  tapeLinearMeters: number;
  tapeRolls: number;
  compoundKilograms: number;
  compoundPackages: number;
  boardCost: number;
  studCost: number;
  trackCost: number;
  screwCost: number;
  tapeCost: number;
  compoundCost: number;
  materialsCost: number;
  laborCost: number;
  totalCost: number;
};

function emptyGypsumResult(): GypsumResult {
  return {
    grossWallArea: 0, netWallArea: 0, finishedArea: 0,
    boardsExact: 0, boardsToBuy: 0, studPositions: 0,
    studLinearMeters: 0, studPieces: 0, trackLinearMeters: 0,
    trackPieces: 0, screws: 0, screwBoxes: 0,
    tapeLinearMeters: 0, tapeRolls: 0, compoundKilograms: 0,
    compoundPackages: 0, boardCost: 0, studCost: 0,
    trackCost: 0, screwCost: 0, tapeCost: 0,
    compoundCost: 0, materialsCost: 0, laborCost: 0,
    totalCost: 0,
  };
}

export function calculateGypsum(
  input: GypsumInput,
  prices: GypsumPrices,
): GypsumResult {
  const length = sanitizeNumber(input.wallLength);
  const height = sanitizeNumber(input.wallHeight);
  const boardWidth = sanitizeNumber(input.boardWidth);
  const boardHeight = sanitizeNumber(input.boardHeight);
  const spacing = sanitizeNumber(input.studSpacing);
  const studLength = sanitizeNumber(input.studPieceLength);
  const trackLength = sanitizeNumber(input.trackPieceLength);

  if (!length || !height || !boardWidth || !boardHeight ||
      !spacing || !studLength || !trackLength) {
    return emptyGypsumResult();
  }

  const grossWallArea = length * height;
  const netWallArea = Math.max(
    grossWallArea - sanitizeNumber(input.openingsArea),
    0,
  );
  if (!netWallArea) {
    return { ...emptyGypsumResult(), grossWallArea };
  }

  const sides = Math.min(
    Math.max(Math.round(sanitizeNumber(input.boardSides)), 1),
    2,
  );
  const finishedArea = netWallArea * sides;
  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const boardsExact =
    (finishedArea / (boardWidth * boardHeight)) * wasteFactor;
  const boardsToBuy = Math.ceil(boardsExact);

  const studPositions = Math.ceil(length / spacing) + 1;
  const studLinearMeters = studPositions * height * wasteFactor;
  const piecesPerStud = Math.ceil(height / studLength);
  const studPieces = Math.ceil(
    studPositions * piecesPerStud * wasteFactor,
  );
  const trackLinearMeters = length * 2 * wasteFactor;
  const trackPieces = Math.ceil(trackLinearMeters / trackLength);

  const screws = Math.ceil(
    boardsToBuy * sanitizeNumber(input.screwsPerBoard),
  );
  const screwBoxes = Math.ceil(
    screws / (sanitizeNumber(input.screwsPerBox) || 1),
  );
  const tapeLinearMeters =
    finishedArea * sanitizeNumber(input.tapePerSquareMeter) * wasteFactor;
  const tapeRolls = Math.ceil(
    tapeLinearMeters / (sanitizeNumber(input.tapeRollLength) || 1),
  );
  const compoundKilograms =
    finishedArea *
    sanitizeNumber(input.compoundKgPerSquareMeter) *
    wasteFactor;
  const compoundPackages = Math.ceil(
    compoundKilograms /
      (sanitizeNumber(input.compoundPackageKg) || 1),
  );

  const boardCost = boardsToBuy * sanitizeNumber(prices.boardUnit);
  const studCost = studPieces * sanitizeNumber(prices.studPiece);
  const trackCost = trackPieces * sanitizeNumber(prices.trackPiece);
  const screwCost = screwBoxes * sanitizeNumber(prices.screwBox);
  const tapeCost = tapeRolls * sanitizeNumber(prices.tapeRoll);
  const compoundCost =
    compoundPackages * sanitizeNumber(prices.compoundPackage);
  const materialsCost = boardCost + studCost + trackCost +
    screwCost + tapeCost + compoundCost;
  const laborCost =
    finishedArea * sanitizeNumber(prices.laborSquareMeter);

  return {
    grossWallArea, netWallArea, finishedArea, boardsExact,
    boardsToBuy, studPositions, studLinearMeters, studPieces,
    trackLinearMeters, trackPieces, screws, screwBoxes,
    tapeLinearMeters, tapeRolls, compoundKilograms,
    compoundPackages, boardCost, studCost, trackCost,
    screwCost, tapeCost, compoundCost, materialsCost,
    laborCost, totalCost: materialsCost + laborCost,
  };
}

export type PvcCeilingInput = {
  area: number;
  perimeter: number;
  panelWidth: number;
  panelLength: number;
  wastePercentage: number;
  supportSpacing: number;
  supportPieceLength: number;
  carrierSpacing: number;
  carrierPieceLength: number;
  trackPieceLength: number;
  hangerSpacing: number;
  screwsPerSquareMeter: number;
  screwsPerBox: number;
};

export type PvcCeilingPrices = {
  panelPiece: number;
  trackPiece: number;
  supportPiece: number;
  carrierPiece: number;
  hangerUnit: number;
  screwBox: number;
  laborSquareMeter: number;
};

export type PvcCeilingResult = {
  netArea: number;
  areaWithWaste: number;
  panelCoverage: number;
  panelsExact: number;
  panelsToBuy: number;
  trackLinearMeters: number;
  trackPieces: number;
  supportLinearMeters: number;
  supportPieces: number;
  carrierLinearMeters: number;
  carrierPieces: number;
  hangers: number;
  screws: number;
  screwBoxes: number;
  panelCost: number;
  trackCost: number;
  supportCost: number;
  carrierCost: number;
  hangerCost: number;
  screwCost: number;
  materialsCost: number;
  laborCost: number;
  totalCost: number;
};

function emptyPvcCeilingResult(): PvcCeilingResult {
  return {
    netArea: 0, areaWithWaste: 0, panelCoverage: 0,
    panelsExact: 0, panelsToBuy: 0, trackLinearMeters: 0,
    trackPieces: 0, supportLinearMeters: 0, supportPieces: 0,
    carrierLinearMeters: 0, carrierPieces: 0, hangers: 0,
    screws: 0, screwBoxes: 0, panelCost: 0, trackCost: 0,
    supportCost: 0, carrierCost: 0, hangerCost: 0,
    screwCost: 0, materialsCost: 0, laborCost: 0,
    totalCost: 0,
  };
}

export function calculatePvcCeiling(
  input: PvcCeilingInput,
  prices: PvcCeilingPrices,
): PvcCeilingResult {
  const area = sanitizeNumber(input.area);
  const perimeter = sanitizeNumber(input.perimeter);
  const panelWidth = sanitizeNumber(input.panelWidth);
  const panelLength = sanitizeNumber(input.panelLength);
  const supportSpacing = sanitizeNumber(input.supportSpacing);
  const supportPieceLength = sanitizeNumber(input.supportPieceLength);
  const carrierSpacing = sanitizeNumber(input.carrierSpacing);
  const carrierPieceLength = sanitizeNumber(input.carrierPieceLength);
  const trackPieceLength = sanitizeNumber(input.trackPieceLength);
  const hangerSpacing = sanitizeNumber(input.hangerSpacing);

  if (!area || !perimeter || !panelWidth || !panelLength ||
      !supportSpacing || !supportPieceLength || !carrierSpacing ||
      !carrierPieceLength || !trackPieceLength || !hangerSpacing) {
    return emptyPvcCeilingResult();
  }

  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const areaWithWaste = area * wasteFactor;
  const panelCoverage = panelWidth * panelLength;
  const panelsExact = areaWithWaste / panelCoverage;
  const panelsToBuy = Math.ceil(panelsExact);

  const trackLinearMeters = perimeter * wasteFactor;
  const trackPieces = Math.ceil(trackLinearMeters / trackPieceLength);
  const supportLinearMeters =
    (area / supportSpacing) * wasteFactor;
  const supportPieces = Math.ceil(
    supportLinearMeters / supportPieceLength,
  );
  const carrierLinearMeters =
    (area / carrierSpacing) * wasteFactor;
  const carrierPieces = Math.ceil(
    carrierLinearMeters / carrierPieceLength,
  );
  const hangers = Math.ceil(carrierLinearMeters / hangerSpacing);
  const screws = Math.ceil(
    area * sanitizeNumber(input.screwsPerSquareMeter) * wasteFactor,
  );
  const screwBoxes = Math.ceil(
    screws / (sanitizeNumber(input.screwsPerBox) || 1),
  );

  const panelCost =
    panelsToBuy * sanitizeNumber(prices.panelPiece);
  const trackCost =
    trackPieces * sanitizeNumber(prices.trackPiece);
  const supportCost =
    supportPieces * sanitizeNumber(prices.supportPiece);
  const carrierCost =
    carrierPieces * sanitizeNumber(prices.carrierPiece);
  const hangerCost =
    hangers * sanitizeNumber(prices.hangerUnit);
  const screwCost =
    screwBoxes * sanitizeNumber(prices.screwBox);
  const materialsCost = panelCost + trackCost + supportCost +
    carrierCost + hangerCost + screwCost;
  const laborCost =
    area * sanitizeNumber(prices.laborSquareMeter);

  return {
    netArea: area, areaWithWaste, panelCoverage, panelsExact,
    panelsToBuy, trackLinearMeters, trackPieces,
    supportLinearMeters, supportPieces, carrierLinearMeters,
    carrierPieces, hangers, screws, screwBoxes, panelCost,
    trackCost, supportCost, carrierCost, hangerCost, screwCost,
    materialsCost, laborCost, totalCost: materialsCost + laborCost,
  };
}

export type PaintInput = {
  grossArea: number;
  openingsArea: number;
  coats: number;
  coveragePerGallon: number;
  wastePercentage: number;
  primerEnabled: boolean;
  primerCoats: number;
  primerCoveragePerGallon: number;
};

export type PaintPrices = {
  paintGallon: number;
  primerGallon: number;
  supplies: number;
  laborSquareMeter: number;
};

export type PaintResult = {
  grossArea: number;
  netArea: number;
  paintApplicationArea: number;
  paintGallonsExact: number;
  paintGallonsToBuy: number;
  primerApplicationArea: number;
  primerGallonsExact: number;
  primerGallonsToBuy: number;
  paintCost: number;
  primerCost: number;
  suppliesCost: number;
  materialsCost: number;
  laborCost: number;
  totalCost: number;
};

export function calculatePaint(
  input: PaintInput,
  prices: PaintPrices,
): PaintResult {
  const grossArea = sanitizeNumber(input.grossArea);
  const netArea = Math.max(
    grossArea - sanitizeNumber(input.openingsArea),
    0,
  );
  const coats = Math.max(Math.round(sanitizeNumber(input.coats)), 1);
  const coverage = sanitizeNumber(input.coveragePerGallon);
  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const paintApplicationArea = netArea * coats;
  const paintGallonsExact = coverage
    ? (paintApplicationArea / coverage) * wasteFactor : 0;
  const paintGallonsToBuy = Math.ceil(paintGallonsExact);

  const primerCoats = input.primerEnabled
    ? Math.max(Math.round(sanitizeNumber(input.primerCoats)), 1) : 0;
  const primerApplicationArea = netArea * primerCoats;
  const primerCoverage = sanitizeNumber(input.primerCoveragePerGallon);
  const primerGallonsExact = primerCoverage
    ? (primerApplicationArea / primerCoverage) * wasteFactor : 0;
  const primerGallonsToBuy = Math.ceil(primerGallonsExact);

  const paintCost =
    paintGallonsToBuy * sanitizeNumber(prices.paintGallon);
  const primerCost =
    primerGallonsToBuy * sanitizeNumber(prices.primerGallon);
  const suppliesCost = sanitizeNumber(prices.supplies);
  const materialsCost = paintCost + primerCost + suppliesCost;
  const laborCost =
    netArea * sanitizeNumber(prices.laborSquareMeter);

  return {
    grossArea, netArea, paintApplicationArea, paintGallonsExact,
    paintGallonsToBuy, primerApplicationArea, primerGallonsExact,
    primerGallonsToBuy, paintCost, primerCost, suppliesCost,
    materialsCost, laborCost, totalCost: materialsCost + laborCost,
  };
}

export type FlooringInput = {
  grossArea: number;
  excludedArea: number;
  tileLengthCm: number;
  tileWidthCm: number;
  piecesPerBox: number;
  wastePercentage: number;
  adhesiveCoveragePerBag: number;
  groutJointWidthMm: number;
  groutJointDepthMm: number;
  groutBagKilograms: number;
};

export type FlooringPrices = {
  flooringBox: number;
  adhesiveBag: number;
  groutBag: number;
  supplies: number;
  laborSquareMeter: number;
};

export type FlooringResult = {
  grossArea: number;
  netArea: number;
  areaWithWaste: number;
  tileArea: number;
  piecesExact: number;
  piecesToBuy: number;
  boxesExact: number;
  boxesToBuy: number;
  adhesiveBagsExact: number;
  adhesiveBagsToBuy: number;
  groutKilograms: number;
  groutBagsExact: number;
  groutBagsToBuy: number;
  flooringCost: number;
  adhesiveCost: number;
  groutCost: number;
  suppliesCost: number;
  materialsCost: number;
  laborCost: number;
  totalCost: number;
};

function emptyFlooringResult(): FlooringResult {
  return {
    grossArea: 0,
    netArea: 0,
    areaWithWaste: 0,
    tileArea: 0,
    piecesExact: 0,
    piecesToBuy: 0,
    boxesExact: 0,
    boxesToBuy: 0,
    adhesiveBagsExact: 0,
    adhesiveBagsToBuy: 0,
    groutKilograms: 0,
    groutBagsExact: 0,
    groutBagsToBuy: 0,
    flooringCost: 0,
    adhesiveCost: 0,
    groutCost: 0,
    suppliesCost: 0,
    materialsCost: 0,
    laborCost: 0,
    totalCost: 0,
  };
}

export function calculateFlooring(
  input: FlooringInput,
  prices: FlooringPrices,
): FlooringResult {
  const grossArea = sanitizeNumber(input.grossArea);
  const excludedArea = sanitizeNumber(input.excludedArea);
  const netArea = Math.max(grossArea - excludedArea, 0);
  const tileLengthMm =
    sanitizeNumber(input.tileLengthCm) * 10;
  const tileWidthMm =
    sanitizeNumber(input.tileWidthCm) * 10;
  const piecesPerBox = Math.max(
    Math.round(sanitizeNumber(input.piecesPerBox)),
    1,
  );
  const adhesiveCoverage =
    sanitizeNumber(input.adhesiveCoveragePerBag);
  const groutBagKilograms =
    sanitizeNumber(input.groutBagKilograms);

  if (
    !netArea ||
    !tileLengthMm ||
    !tileWidthMm ||
    !adhesiveCoverage ||
    !groutBagKilograms
  ) {
    return {
      ...emptyFlooringResult(),
      grossArea,
      netArea,
    };
  }

  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const areaWithWaste = netArea * wasteFactor;
  const tileArea =
    (tileLengthMm / 1000) * (tileWidthMm / 1000);
  const piecesExact = areaWithWaste / tileArea;
  const boxesExact = piecesExact / piecesPerBox;
  const boxesToBuy = Math.ceil(boxesExact);
  const piecesToBuy = boxesToBuy * piecesPerBox;

  const adhesiveBagsExact =
    netArea / adhesiveCoverage;
  const adhesiveBagsToBuy =
    Math.ceil(adhesiveBagsExact);

  const jointWidth =
    sanitizeNumber(input.groutJointWidthMm);
  const jointDepth =
    sanitizeNumber(input.groutJointDepthMm);
  const groutKilogramsPerSquareMeter =
    ((tileLengthMm + tileWidthMm) /
      (tileLengthMm * tileWidthMm)) *
    jointWidth *
    jointDepth *
    1.6;
  const groutKilograms =
    netArea * groutKilogramsPerSquareMeter;
  const groutBagsExact =
    groutKilograms / groutBagKilograms;
  const groutBagsToBuy = Math.ceil(groutBagsExact);

  const flooringCost =
    boxesToBuy * sanitizeNumber(prices.flooringBox);
  const adhesiveCost =
    adhesiveBagsToBuy *
    sanitizeNumber(prices.adhesiveBag);
  const groutCost =
    groutBagsToBuy * sanitizeNumber(prices.groutBag);
  const suppliesCost = sanitizeNumber(prices.supplies);
  const materialsCost =
    flooringCost +
    adhesiveCost +
    groutCost +
    suppliesCost;
  const laborCost =
    netArea * sanitizeNumber(prices.laborSquareMeter);

  return {
    grossArea,
    netArea,
    areaWithWaste,
    tileArea,
    piecesExact,
    piecesToBuy,
    boxesExact,
    boxesToBuy,
    adhesiveBagsExact,
    adhesiveBagsToBuy,
    groutKilograms,
    groutBagsExact,
    groutBagsToBuy,
    flooringCost,
    adhesiveCost,
    groutCost,
    suppliesCost,
    materialsCost,
    laborCost,
    totalCost: materialsCost + laborCost,
  };
}

export type ElectricalInput = {
  lightPoints: number;
  switchPoints: number;
  outletPoints: number;
  dedicatedPoints: number;
  averageRouteLength: number;
  lightingConductors: number;
  powerConductors: number;
  wastePercentage: number;
  cableRollLength: number;
  conduitPieceLength: number;
  lightingPointsPerCircuit: number;
  outletPointsPerCircuit: number;
};

export type ElectricalPrices = {
  lightingCableRoll: number;
  powerCableRoll: number;
  conduitPiece: number;
  boxUnit: number;
  outletUnit: number;
  switchUnit: number;
  breakerUnit: number;
  supplies: number;
  laborStandardPoint: number;
  laborDedicatedPoint: number;
};

export type ElectricalResult = {
  lightPoints: number;
  switchPoints: number;
  outletPoints: number;
  dedicatedPoints: number;
  standardPoints: number;
  totalPoints: number;
  routeMeters: number;
  lightingCableMeters: number;
  lightingCableRollsExact: number;
  lightingCableRollsToBuy: number;
  powerCableMeters: number;
  powerCableRollsExact: number;
  powerCableRollsToBuy: number;
  conduitMeters: number;
  conduitPieces: number;
  boxes: number;
  lightingCircuits: number;
  outletCircuits: number;
  dedicatedCircuits: number;
  totalBreakers: number;
  lightingCableCost: number;
  powerCableCost: number;
  conduitCost: number;
  boxCost: number;
  outletCost: number;
  switchCost: number;
  breakerCost: number;
  suppliesCost: number;
  materialsCost: number;
  standardLaborCost: number;
  dedicatedLaborCost: number;
  laborCost: number;
  totalCost: number;
};

function emptyElectricalResult(): ElectricalResult {
  return {
    lightPoints: 0,
    switchPoints: 0,
    outletPoints: 0,
    dedicatedPoints: 0,
    standardPoints: 0,
    totalPoints: 0,
    routeMeters: 0,
    lightingCableMeters: 0,
    lightingCableRollsExact: 0,
    lightingCableRollsToBuy: 0,
    powerCableMeters: 0,
    powerCableRollsExact: 0,
    powerCableRollsToBuy: 0,
    conduitMeters: 0,
    conduitPieces: 0,
    boxes: 0,
    lightingCircuits: 0,
    outletCircuits: 0,
    dedicatedCircuits: 0,
    totalBreakers: 0,
    lightingCableCost: 0,
    powerCableCost: 0,
    conduitCost: 0,
    boxCost: 0,
    outletCost: 0,
    switchCost: 0,
    breakerCost: 0,
    suppliesCost: 0,
    materialsCost: 0,
    standardLaborCost: 0,
    dedicatedLaborCost: 0,
    laborCost: 0,
    totalCost: 0,
  };
}

export function calculateElectrical(
  input: ElectricalInput,
  prices: ElectricalPrices,
): ElectricalResult {
  const lightPoints = Math.round(
    sanitizeNumber(input.lightPoints),
  );
  const switchPoints = Math.round(
    sanitizeNumber(input.switchPoints),
  );
  const outletPoints = Math.round(
    sanitizeNumber(input.outletPoints),
  );
  const dedicatedPoints = Math.round(
    sanitizeNumber(input.dedicatedPoints),
  );

  const standardPoints =
    lightPoints + switchPoints + outletPoints;
  const totalPoints = standardPoints + dedicatedPoints;
  const averageRouteLength =
    sanitizeNumber(input.averageRouteLength);
  const cableRollLength =
    sanitizeNumber(input.cableRollLength);
  const conduitPieceLength =
    sanitizeNumber(input.conduitPieceLength);

  if (
    !totalPoints ||
    !averageRouteLength ||
    !cableRollLength ||
    !conduitPieceLength
  ) {
    return {
      ...emptyElectricalResult(),
      lightPoints,
      switchPoints,
      outletPoints,
      dedicatedPoints,
      standardPoints,
      totalPoints,
    };
  }

  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const lightingConductors = Math.max(
    Math.round(sanitizeNumber(input.lightingConductors)),
    1,
  );
  const powerConductors = Math.max(
    Math.round(sanitizeNumber(input.powerConductors)),
    1,
  );

  const routeMeters =
    totalPoints * averageRouteLength;
  const lightingRouteMeters =
    (lightPoints + switchPoints) * averageRouteLength;
  const powerRouteMeters =
    (outletPoints + dedicatedPoints) *
    averageRouteLength;

  const lightingCableMeters =
    lightingRouteMeters *
    lightingConductors *
    wasteFactor;
  const lightingCableRollsExact =
    lightingCableMeters / cableRollLength;
  const lightingCableRollsToBuy =
    Math.ceil(lightingCableRollsExact);

  const powerCableMeters =
    powerRouteMeters *
    powerConductors *
    wasteFactor;
  const powerCableRollsExact =
    powerCableMeters / cableRollLength;
  const powerCableRollsToBuy =
    Math.ceil(powerCableRollsExact);

  const conduitMeters = routeMeters * wasteFactor;
  const conduitPieces = Math.ceil(
    conduitMeters / conduitPieceLength,
  );
  const boxes = totalPoints;

  const lightingPointsPerCircuit = Math.max(
    Math.round(
      sanitizeNumber(input.lightingPointsPerCircuit),
    ),
    1,
  );
  const outletPointsPerCircuit = Math.max(
    Math.round(
      sanitizeNumber(input.outletPointsPerCircuit),
    ),
    1,
  );

  const lightingCircuits = lightPoints
    ? Math.ceil(lightPoints / lightingPointsPerCircuit)
    : 0;
  const outletCircuits = outletPoints
    ? Math.ceil(outletPoints / outletPointsPerCircuit)
    : 0;
  const dedicatedCircuits = dedicatedPoints;
  const totalBreakers =
    lightingCircuits +
    outletCircuits +
    dedicatedCircuits;

  const lightingCableCost =
    lightingCableRollsToBuy *
    sanitizeNumber(prices.lightingCableRoll);
  const powerCableCost =
    powerCableRollsToBuy *
    sanitizeNumber(prices.powerCableRoll);
  const conduitCost =
    conduitPieces *
    sanitizeNumber(prices.conduitPiece);
  const boxCost =
    boxes * sanitizeNumber(prices.boxUnit);
  const outletCost =
    (outletPoints + dedicatedPoints) *
    sanitizeNumber(prices.outletUnit);
  const switchCost =
    switchPoints *
    sanitizeNumber(prices.switchUnit);
  const breakerCost =
    totalBreakers *
    sanitizeNumber(prices.breakerUnit);
  const suppliesCost =
    sanitizeNumber(prices.supplies);

  const materialsCost =
    lightingCableCost +
    powerCableCost +
    conduitCost +
    boxCost +
    outletCost +
    switchCost +
    breakerCost +
    suppliesCost;

  const standardLaborCost =
    standardPoints *
    sanitizeNumber(prices.laborStandardPoint);
  const dedicatedLaborCost =
    dedicatedPoints *
    sanitizeNumber(prices.laborDedicatedPoint);
  const laborCost =
    standardLaborCost + dedicatedLaborCost;

  return {
    lightPoints,
    switchPoints,
    outletPoints,
    dedicatedPoints,
    standardPoints,
    totalPoints,
    routeMeters,
    lightingCableMeters,
    lightingCableRollsExact,
    lightingCableRollsToBuy,
    powerCableMeters,
    powerCableRollsExact,
    powerCableRollsToBuy,
    conduitMeters,
    conduitPieces,
    boxes,
    lightingCircuits,
    outletCircuits,
    dedicatedCircuits,
    totalBreakers,
    lightingCableCost,
    powerCableCost,
    conduitCost,
    boxCost,
    outletCost,
    switchCost,
    breakerCost,
    suppliesCost,
    materialsCost,
    standardLaborCost,
    dedicatedLaborCost,
    laborCost,
    totalCost: materialsCost + laborCost,
  };
}

export type SpecialSystemType =
  | "cctv"
  | "alarm"
  | "fire"
  | "access";

export type SpecialSystemsInput = {
  systemType: SpecialSystemType;
  deviceA: number;
  deviceB: number;
  deviceC: number;
  deviceD: number;
  deviceE: number;
  wiredPoints: number;
  averageRouteLength: number;
  cableRunsPerPoint: number;
  wastePercentage: number;
  cableRollLength: number;
  conduitPieceLength: number;
};

export type SpecialSystemsPrices = {
  deviceAUnit: number;
  deviceBUnit: number;
  deviceCUnit: number;
  deviceDUnit: number;
  deviceEUnit: number;
  cableRoll: number;
  conduitPiece: number;
  boxUnit: number;
  supplies: number;
  laborWiredPoint: number;
  programming: number;
};

export type SpecialSystemsResult = {
  systemType: SpecialSystemType;
  deviceA: number;
  deviceB: number;
  deviceC: number;
  deviceD: number;
  deviceE: number;
  totalEquipment: number;
  wiredPoints: number;
  routeMeters: number;
  cableMeters: number;
  cableRollsExact: number;
  cableRollsToBuy: number;
  conduitMeters: number;
  conduitPieces: number;
  boxes: number;
  deviceACost: number;
  deviceBCost: number;
  deviceCCost: number;
  deviceDCost: number;
  deviceECost: number;
  cableCost: number;
  conduitCost: number;
  boxCost: number;
  suppliesCost: number;
  materialsCost: number;
  installationLaborCost: number;
  programmingCost: number;
  laborCost: number;
  totalCost: number;
};

function emptySpecialSystemsResult(
  systemType: SpecialSystemType,
): SpecialSystemsResult {
  return {
    systemType,
    deviceA: 0,
    deviceB: 0,
    deviceC: 0,
    deviceD: 0,
    deviceE: 0,
    totalEquipment: 0,
    wiredPoints: 0,
    routeMeters: 0,
    cableMeters: 0,
    cableRollsExact: 0,
    cableRollsToBuy: 0,
    conduitMeters: 0,
    conduitPieces: 0,
    boxes: 0,
    deviceACost: 0,
    deviceBCost: 0,
    deviceCCost: 0,
    deviceDCost: 0,
    deviceECost: 0,
    cableCost: 0,
    conduitCost: 0,
    boxCost: 0,
    suppliesCost: 0,
    materialsCost: 0,
    installationLaborCost: 0,
    programmingCost: 0,
    laborCost: 0,
    totalCost: 0,
  };
}

export function calculateSpecialSystems(
  input: SpecialSystemsInput,
  prices: SpecialSystemsPrices,
): SpecialSystemsResult {
  const deviceA = Math.round(sanitizeNumber(input.deviceA));
  const deviceB = Math.round(sanitizeNumber(input.deviceB));
  const deviceC = Math.round(sanitizeNumber(input.deviceC));
  const deviceD = Math.round(sanitizeNumber(input.deviceD));
  const deviceE = Math.round(sanitizeNumber(input.deviceE));
  const totalEquipment =
    deviceA + deviceB + deviceC + deviceD + deviceE;

  const wiredPoints = Math.round(
    sanitizeNumber(input.wiredPoints),
  );
  const averageRouteLength = sanitizeNumber(
    input.averageRouteLength,
  );
  const cableRunsPerPoint = Math.max(
    Math.round(sanitizeNumber(input.cableRunsPerPoint)),
    1,
  );
  const cableRollLength = sanitizeNumber(
    input.cableRollLength,
  );
  const conduitPieceLength = sanitizeNumber(
    input.conduitPieceLength,
  );

  if (!totalEquipment) {
    return {
      ...emptySpecialSystemsResult(input.systemType),
      deviceA,
      deviceB,
      deviceC,
      deviceD,
      deviceE,
      totalEquipment,
      wiredPoints,
    };
  }

  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const routeMeters = wiredPoints * averageRouteLength;
  const cableMeters =
    routeMeters * cableRunsPerPoint * wasteFactor;
  const cableRollsExact = cableRollLength
    ? cableMeters / cableRollLength
    : 0;
  const cableRollsToBuy = Math.ceil(cableRollsExact);
  const conduitMeters = routeMeters * wasteFactor;
  const conduitPieces = conduitPieceLength
    ? Math.ceil(conduitMeters / conduitPieceLength)
    : 0;
  const boxes = wiredPoints;

  const deviceACost =
    deviceA * sanitizeNumber(prices.deviceAUnit);
  const deviceBCost =
    deviceB * sanitizeNumber(prices.deviceBUnit);
  const deviceCCost =
    deviceC * sanitizeNumber(prices.deviceCUnit);
  const deviceDCost =
    deviceD * sanitizeNumber(prices.deviceDUnit);
  const deviceECost =
    deviceE * sanitizeNumber(prices.deviceEUnit);
  const cableCost =
    cableRollsToBuy * sanitizeNumber(prices.cableRoll);
  const conduitCost =
    conduitPieces * sanitizeNumber(prices.conduitPiece);
  const boxCost = boxes * sanitizeNumber(prices.boxUnit);
  const suppliesCost = sanitizeNumber(prices.supplies);

  const materialsCost =
    deviceACost +
    deviceBCost +
    deviceCCost +
    deviceDCost +
    deviceECost +
    cableCost +
    conduitCost +
    boxCost +
    suppliesCost;

  const installationLaborCost =
    wiredPoints * sanitizeNumber(prices.laborWiredPoint);
  const programmingCost = sanitizeNumber(prices.programming);
  const laborCost =
    installationLaborCost + programmingCost;

  return {
    systemType: input.systemType,
    deviceA,
    deviceB,
    deviceC,
    deviceD,
    deviceE,
    totalEquipment,
    wiredPoints,
    routeMeters,
    cableMeters,
    cableRollsExact,
    cableRollsToBuy,
    conduitMeters,
    conduitPieces,
    boxes,
    deviceACost,
    deviceBCost,
    deviceCCost,
    deviceDCost,
    deviceECost,
    cableCost,
    conduitCost,
    boxCost,
    suppliesCost,
    materialsCost,
    installationLaborCost,
    programmingCost,
    laborCost,
    totalCost: materialsCost + laborCost,
  };
}

export type AirConditioningInput = {
  grossArea: number;
  excludedArea: number;
  unitCount: number;
  occupants: number;
  btuPerSquareMeter: number;
  extraBtuPerPerson: number;
  heatLoadPercentage: number;
  selectedCapacityBtu: number;
  copperRoutePerUnit: number;
  includedCopperPerUnit: number;
  cableRoutePerUnit: number;
  drainRoutePerUnit: number;
  wastePercentage: number;
  drainPieceLength: number;
  refrigerantKgPerExtraMeter: number;
};

export type AirConditioningPrices = {
  equipmentUnit: number;
  copperPairMeter: number;
  cableMeter: number;
  drainPiece: number;
  bracketSet: number;
  breakerUnit: number;
  disconnectUnit: number;
  refrigerantKilogram: number;
  supplies: number;
  laborUnit: number;
  coreDrillingUnit: number;
};

export type AirConditioningResult = {
  grossArea: number;
  netArea: number;
  unitCount: number;
  baseLoadBtu: number;
  occupantLoadBtu: number;
  designLoadBtu: number;
  recommendedCapacityPerUnit: number;
  selectedCapacityPerUnit: number;
  totalInstalledCapacity: number;
  copperMeters: number;
  extraCopperMeters: number;
  cableMeters: number;
  drainMeters: number;
  drainPieces: number;
  brackets: number;
  breakers: number;
  disconnects: number;
  refrigerantKilograms: number;
  equipmentCost: number;
  copperCost: number;
  cableCost: number;
  drainCost: number;
  bracketCost: number;
  breakerCost: number;
  disconnectCost: number;
  refrigerantCost: number;
  suppliesCost: number;
  materialsCost: number;
  installationLaborCost: number;
  coreDrillingCost: number;
  laborCost: number;
  totalCost: number;
};

const STANDARD_AIR_CAPACITIES = [
  9000,
  12000,
  18000,
  24000,
  30000,
  36000,
  48000,
  60000,
];

function roundUpAirCapacity(requiredBtu: number): number {
  if (!requiredBtu) return 0;

  const standard = STANDARD_AIR_CAPACITIES.find(
    (capacity) => capacity >= requiredBtu,
  );

  return standard ?? Math.ceil(requiredBtu / 6000) * 6000;
}

function emptyAirConditioningResult(
  unitCount = 0,
): AirConditioningResult {
  return {
    grossArea: 0,
    netArea: 0,
    unitCount,
    baseLoadBtu: 0,
    occupantLoadBtu: 0,
    designLoadBtu: 0,
    recommendedCapacityPerUnit: 0,
    selectedCapacityPerUnit: 0,
    totalInstalledCapacity: 0,
    copperMeters: 0,
    extraCopperMeters: 0,
    cableMeters: 0,
    drainMeters: 0,
    drainPieces: 0,
    brackets: 0,
    breakers: 0,
    disconnects: 0,
    refrigerantKilograms: 0,
    equipmentCost: 0,
    copperCost: 0,
    cableCost: 0,
    drainCost: 0,
    bracketCost: 0,
    breakerCost: 0,
    disconnectCost: 0,
    refrigerantCost: 0,
    suppliesCost: 0,
    materialsCost: 0,
    installationLaborCost: 0,
    coreDrillingCost: 0,
    laborCost: 0,
    totalCost: 0,
  };
}

export function calculateAirConditioning(
  input: AirConditioningInput,
  prices: AirConditioningPrices,
): AirConditioningResult {
  const grossArea = sanitizeNumber(input.grossArea);
  const netArea = Math.max(
    grossArea - sanitizeNumber(input.excludedArea),
    0,
  );
  const unitCount = Math.max(
    Math.round(sanitizeNumber(input.unitCount)),
    1,
  );

  if (!netArea) {
    return {
      ...emptyAirConditioningResult(unitCount),
      grossArea,
      netArea,
    };
  }

  const occupants = Math.round(sanitizeNumber(input.occupants));
  const btuPerSquareMeter =
    sanitizeNumber(input.btuPerSquareMeter) || 600;
  const extraBtuPerPerson =
    sanitizeNumber(input.extraBtuPerPerson) || 600;
  const baseLoadBtu = netArea * btuPerSquareMeter;
  const occupantLoadBtu =
    Math.max(occupants - 2, 0) * extraBtuPerPerson;
  const designLoadBtu =
    (baseLoadBtu + occupantLoadBtu) *
    (1 + sanitizeNumber(input.heatLoadPercentage) / 100);
  const recommendedCapacityPerUnit = roundUpAirCapacity(
    designLoadBtu / unitCount,
  );
  const selectedCapacityPerUnit =
    sanitizeNumber(input.selectedCapacityBtu) ||
    recommendedCapacityPerUnit;
  const totalInstalledCapacity =
    selectedCapacityPerUnit * unitCount;

  const wasteFactor =
    1 + sanitizeNumber(input.wastePercentage) / 100;
  const copperRoutePerUnit = sanitizeNumber(
    input.copperRoutePerUnit,
  );
  const includedCopperPerUnit = sanitizeNumber(
    input.includedCopperPerUnit,
  );
  const cableRoutePerUnit = sanitizeNumber(
    input.cableRoutePerUnit,
  );
  const drainRoutePerUnit = sanitizeNumber(
    input.drainRoutePerUnit,
  );
  const drainPieceLength = sanitizeNumber(
    input.drainPieceLength,
  );

  const copperMeters =
    unitCount * copperRoutePerUnit * wasteFactor;
  const extraCopperMeters =
    unitCount *
    Math.max(copperRoutePerUnit - includedCopperPerUnit, 0) *
    wasteFactor;
  const cableMeters =
    unitCount * cableRoutePerUnit * wasteFactor;
  const drainMeters =
    unitCount * drainRoutePerUnit * wasteFactor;
  const drainPieces = drainPieceLength
    ? Math.ceil(drainMeters / drainPieceLength)
    : 0;
  const brackets = unitCount;
  const breakers = unitCount;
  const disconnects = unitCount;
  const refrigerantKilograms =
    unitCount *
    Math.max(copperRoutePerUnit - includedCopperPerUnit, 0) *
    sanitizeNumber(input.refrigerantKgPerExtraMeter);

  const equipmentCost =
    unitCount * sanitizeNumber(prices.equipmentUnit);
  const copperCost =
    extraCopperMeters * sanitizeNumber(prices.copperPairMeter);
  const cableCost =
    cableMeters * sanitizeNumber(prices.cableMeter);
  const drainCost =
    drainPieces * sanitizeNumber(prices.drainPiece);
  const bracketCost =
    brackets * sanitizeNumber(prices.bracketSet);
  const breakerCost =
    breakers * sanitizeNumber(prices.breakerUnit);
  const disconnectCost =
    disconnects * sanitizeNumber(prices.disconnectUnit);
  const refrigerantCost =
    refrigerantKilograms *
    sanitizeNumber(prices.refrigerantKilogram);
  const suppliesCost = sanitizeNumber(prices.supplies);
  const materialsCost =
    equipmentCost +
    copperCost +
    cableCost +
    drainCost +
    bracketCost +
    breakerCost +
    disconnectCost +
    refrigerantCost +
    suppliesCost;

  const installationLaborCost =
    unitCount * sanitizeNumber(prices.laborUnit);
  const coreDrillingCost =
    unitCount * sanitizeNumber(prices.coreDrillingUnit);
  const laborCost = installationLaborCost + coreDrillingCost;

  return {
    grossArea,
    netArea,
    unitCount,
    baseLoadBtu,
    occupantLoadBtu,
    designLoadBtu,
    recommendedCapacityPerUnit,
    selectedCapacityPerUnit,
    totalInstalledCapacity,
    copperMeters,
    extraCopperMeters,
    cableMeters,
    drainMeters,
    drainPieces,
    brackets,
    breakers,
    disconnects,
    refrigerantKilograms,
    equipmentCost,
    copperCost,
    cableCost,
    drainCost,
    bracketCost,
    breakerCost,
    disconnectCost,
    refrigerantCost,
    suppliesCost,
    materialsCost,
    installationLaborCost,
    coreDrillingCost,
    laborCost,
    totalCost: materialsCost + laborCost,
  };
}

// MDF_CALCULATOR_V1

export type MdfFurnitureInput = {
  width: number;
  height: number;
  depth: number;
  quantity: number;
  verticalPanels: number;
  horizontalPanels: number;
  shelves: number;
  frontArea: number;
  backArea: number;
  extraMdfArea: number;
  wastePercentage: number;
  boardWidth: number;
  boardLength: number;
  backBoardWidth: number;
  backBoardLength: number;
  extraEdgeMeters: number;
  edgeRollLength: number;
  doors: number;
  hingesPerDoor: number;
  drawers: number;
  slidesPerDrawer: number;
  handles: number;
  legs: number;
};

export type MdfFurniturePrices = {
  mdfBoard: number;
  backBoard: number;
  edgeRoll: number;
  hingeUnit: number;
  slidePair: number;
  handleUnit: number;
  legUnit: number;
  supplies: number;
  laborSquareMeter: number;
  installationUnit: number;
};

export type MdfFurnitureResult = {
  quantity: number;
  grossMdfArea: number;
  mdfAreaWithWaste: number;
  boardArea: number;
  boardsExact: number;
  boardsToBuy: number;
  backAreaWithWaste: number;
  backBoardArea: number;
  backBoardsExact: number;
  backBoardsToBuy: number;
  edgeLinearMeters: number;
  edgeRollsExact: number;
  edgeRollsToBuy: number;
  hinges: number;
  slidePairs: number;
  handles: number;
  legs: number;
  mdfCost: number;
  backCost: number;
  edgeCost: number;
  hingeCost: number;
  slideCost: number;
  handleCost: number;
  legCost: number;
  suppliesCost: number;
  materialsCost: number;
  laborCost: number;
  installationCost: number;
  totalCost: number;
};

function emptyMdfFurnitureResult(quantity = 1): MdfFurnitureResult {
  return {
    quantity,
    grossMdfArea: 0,
    mdfAreaWithWaste: 0,
    boardArea: 0,
    boardsExact: 0,
    boardsToBuy: 0,
    backAreaWithWaste: 0,
    backBoardArea: 0,
    backBoardsExact: 0,
    backBoardsToBuy: 0,
    edgeLinearMeters: 0,
    edgeRollsExact: 0,
    edgeRollsToBuy: 0,
    hinges: 0,
    slidePairs: 0,
    handles: 0,
    legs: 0,
    mdfCost: 0,
    backCost: 0,
    edgeCost: 0,
    hingeCost: 0,
    slideCost: 0,
    handleCost: 0,
    legCost: 0,
    suppliesCost: 0,
    materialsCost: 0,
    laborCost: 0,
    installationCost: 0,
    totalCost: 0,
  };
}

export function calculateMdfFurniture(
  input: MdfFurnitureInput,
  prices: MdfFurniturePrices,
): MdfFurnitureResult {
  const width = sanitizeNumber(input.width);
  const height = sanitizeNumber(input.height);
  const depth = sanitizeNumber(input.depth);
  const quantity = Math.max(Math.round(sanitizeNumber(input.quantity)), 1);
  const boardWidth = sanitizeNumber(input.boardWidth);
  const boardLength = sanitizeNumber(input.boardLength);
  const backBoardWidth = sanitizeNumber(input.backBoardWidth);
  const backBoardLength = sanitizeNumber(input.backBoardLength);
  const edgeRollLength = sanitizeNumber(input.edgeRollLength);

  if (!width || !height || !depth || !boardWidth || !boardLength) {
    return emptyMdfFurnitureResult(quantity);
  }

  const verticalPanels = Math.round(sanitizeNumber(input.verticalPanels));
  const horizontalPanels = Math.round(sanitizeNumber(input.horizontalPanels));
  const shelves = Math.round(sanitizeNumber(input.shelves));
  const frontArea = sanitizeNumber(input.frontArea);
  const backArea = sanitizeNumber(input.backArea);
  const extraMdfArea = sanitizeNumber(input.extraMdfArea);
  const wasteFactor = 1 + sanitizeNumber(input.wastePercentage) / 100;

  const bodyAreaPerUnit =
    verticalPanels * height * depth +
    (horizontalPanels + shelves) * width * depth;
  const grossMdfArea =
    quantity * (bodyAreaPerUnit + frontArea + extraMdfArea);
  const mdfAreaWithWaste = grossMdfArea * wasteFactor;
  const boardArea = boardWidth * boardLength;
  const boardsExact = mdfAreaWithWaste / boardArea;
  const boardsToBuy = Math.ceil(boardsExact);

  const backAreaWithWaste = quantity * backArea * wasteFactor;
  const backBoardArea = backBoardWidth * backBoardLength;
  const backBoardsExact = backBoardArea
    ? backAreaWithWaste / backBoardArea
    : 0;
  const backBoardsToBuy = Math.ceil(backBoardsExact);

  const edgePerUnit =
    verticalPanels * height +
    (horizontalPanels + shelves) * width +
    sanitizeNumber(input.extraEdgeMeters);
  const edgeLinearMeters = quantity * edgePerUnit * wasteFactor;
  const edgeRollsExact = edgeRollLength
    ? edgeLinearMeters / edgeRollLength
    : 0;
  const edgeRollsToBuy = Math.ceil(edgeRollsExact);

  const doors = Math.round(sanitizeNumber(input.doors));
  const drawers = Math.round(sanitizeNumber(input.drawers));
  const hinges =
    quantity * doors * Math.round(sanitizeNumber(input.hingesPerDoor));
  const slidePairs =
    quantity * drawers * Math.round(sanitizeNumber(input.slidesPerDrawer));
  const handles = quantity * Math.round(sanitizeNumber(input.handles));
  const legs = quantity * Math.round(sanitizeNumber(input.legs));

  const mdfCost = boardsToBuy * sanitizeNumber(prices.mdfBoard);
  const backCost = backBoardsToBuy * sanitizeNumber(prices.backBoard);
  const edgeCost = edgeRollsToBuy * sanitizeNumber(prices.edgeRoll);
  const hingeCost = hinges * sanitizeNumber(prices.hingeUnit);
  const slideCost = slidePairs * sanitizeNumber(prices.slidePair);
  const handleCost = handles * sanitizeNumber(prices.handleUnit);
  const legCost = legs * sanitizeNumber(prices.legUnit);
  const suppliesCost = sanitizeNumber(prices.supplies);
  const materialsCost =
    mdfCost +
    backCost +
    edgeCost +
    hingeCost +
    slideCost +
    handleCost +
    legCost +
    suppliesCost;
  const laborCost =
    grossMdfArea * sanitizeNumber(prices.laborSquareMeter);
  const installationCost =
    quantity * sanitizeNumber(prices.installationUnit);
  const totalCost = materialsCost + laborCost + installationCost;

  return {
    quantity,
    grossMdfArea,
    mdfAreaWithWaste,
    boardArea,
    boardsExact,
    boardsToBuy,
    backAreaWithWaste,
    backBoardArea,
    backBoardsExact,
    backBoardsToBuy,
    edgeLinearMeters,
    edgeRollsExact,
    edgeRollsToBuy,
    hinges,
    slidePairs,
    handles,
    legs,
    mdfCost,
    backCost,
    edgeCost,
    hingeCost,
    slideCost,
    handleCost,
    legCost,
    suppliesCost,
    materialsCost,
    laborCost,
    installationCost,
    totalCost,
  };
}
