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
