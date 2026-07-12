export function formatDecimal(
  value: number,
  maximumFractionDigits = 4,
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("es-PA", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}
