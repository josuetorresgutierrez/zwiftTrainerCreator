export function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits);
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}
