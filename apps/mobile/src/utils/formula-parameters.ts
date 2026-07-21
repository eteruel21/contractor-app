export function getFormulaNumber(
  parameters: Record<string, number> | null | undefined,
  key: string,
  fallback: number,
): number {
  const value = parameters?.[key];

  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}
