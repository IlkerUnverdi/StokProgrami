export function toNumberPrice(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return 0;

  const normalizedValue = String(value).replace(',', '.');
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}