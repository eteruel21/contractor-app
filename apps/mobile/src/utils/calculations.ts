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
  cementKilograms: number;

  sandVolume: number;
  sandBags: number;

  gravelVolume: number;
  gravelBags: number;

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
    cementKilograms: 0,

    sandVolume: 0,
    sandBags: 0,

    gravelVolume: 0,
    gravelBags: 0,

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
  const wastePercentage = sanitizeNumber(input.wastePercentage);

  const cementPart = sanitizeNumber(input.mixCement);
  const sandPart = sanitizeNumber(input.mixSand);
  const gravelPart = sanitizeNumber(input.mixGravel);

  const cementBagWeight =
    sanitizeNumber(input.cementBagWeight) || 42.5;

  const sandBagVolume =
    sanitizeNumber(input.sandBagVolume) ||
    DEFAULT_AGGREGATE_BAG_VOLUME;

  const gravelBagVolume =
    sanitizeNumber(input.gravelBagVolume) ||
    DEFAULT_AGGREGATE_BAG_VOLUME;

  const totalParts = cementPart + sandPart + gravelPart;

  if (
    length === 0 ||
    width === 0 ||
    thickness === 0 ||
    totalParts === 0
  ) {
    return createEmptyResult();
  }

  const netVolume = length * width * thickness;
  const volumeWithWaste =
    netVolume * (1 + wastePercentage / 100);
  const dryVolume = volumeWithWaste * DRY_VOLUME_FACTOR;

  const cementVolume =
    dryVolume * (cementPart / totalParts);
  const sandVolume =
    dryVolume * (sandPart / totalParts);
  const gravelVolume =
    dryVolume * (gravelPart / totalParts);

  const cementKilograms =
    cementVolume * CEMENT_DENSITY_KG_M3;
  const cementBags = cementKilograms / cementBagWeight;

  const sandBags = sandVolume / sandBagVolume;
  const gravelBags = gravelVolume / gravelBagVolume;

  const cementCost =
    cementBags * sanitizeNumber(prices.cementBag);

  const sandCost =
    input.sandPriceMode === "bag"
      ? sandBags * sanitizeNumber(prices.sandBag)
      : sandVolume * sanitizeNumber(prices.sandCubicMeter);

  const gravelCost =
    input.gravelPriceMode === "bag"
      ? gravelBags * sanitizeNumber(prices.gravelBag)
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
    cementKilograms,

    sandVolume,
    sandBags,

    gravelVolume,
    gravelBags,

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
