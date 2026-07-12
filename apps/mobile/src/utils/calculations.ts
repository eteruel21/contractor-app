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
