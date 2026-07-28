import type { VehicleVariant } from '@/types/vehicle';

export function normalizeFuel(value?: string | null) {
  return (value || '').trim().toUpperCase();
}

export function getFuelLabel(value?: string | null) {
  const fuel = normalizeFuel(value);

  switch (fuel) {
    case 'DIESEL':
    case 'DIZEL':
      return 'Dizel';

    case 'GASOLINE':
    case 'BENZIN':
      return 'Benzin';

    case 'LPG':
      return 'LPG';

    case 'HYBRID':
      return 'Hibrit';

    case 'ELECTRIC':
      return 'Elektrik';

    default:
      return value || '-';
  }
}

export function getVariantYearStart(
  variant?: Pick<VehicleVariant, 'yearStart'> | null,
) {
  return variant?.yearStart ?? null;
}

export function getVariantYearEnd(
  variant?: Pick<VehicleVariant, 'yearEnd'> | null,
) {
  return variant?.yearEnd ?? null;
}

export function formatYearRange(
  yearStart?: number | null,
  yearEnd?: number | null,
) {
  if (!yearStart && !yearEnd) {
    return '-';
  }

  if (yearStart && !yearEnd) {
    return `${yearStart}+`;
  }

  if (!yearStart && yearEnd) {
    return `- ${yearEnd}`;
  }

  return `${yearStart}-${yearEnd}`;
}

export function getVehicleYearRangeLabel(
  variant?: Pick<VehicleVariant, 'yearStart' | 'yearEnd' | 'startYear' | 'endYear'> | null,
) {
  const yearStart = variant?.yearStart ?? variant?.startYear ?? null;
  const yearEnd = variant?.yearEnd ?? variant?.endYear ?? null;

  return formatYearRange(yearStart, yearEnd);
}

export function getVehicleYearRangeValue(
  variant?: Pick<VehicleVariant, 'yearStart' | 'yearEnd' | 'startYear' | 'endYear'> | null,
) {
  const yearStart = variant?.yearStart ?? variant?.startYear ?? '';
  const yearEnd = variant?.yearEnd ?? variant?.endYear ?? '';

  return `${yearStart}-${yearEnd}`;
}

export function formatVehicleVariantLabel(
  variant?: VehicleVariant | null,
) {
  if (!variant) {
    return '-';
  }

  const rawBrandName = variant.brandName ?? variant.vehicleBrand?.name ?? '';
  const brandName =
    rawBrandName && rawBrandName.toLowerCase() !== 'undefined'
      ? rawBrandName
      : '-';

  const modelName = variant.modelName || '-';
  const engine = variant.engine || '-';
  const fuel = getFuelLabel(variant.fuel);
  const yearRange = getVehicleYearRangeLabel(variant);

  return `${brandName} ${modelName}\n${engine} • ${fuel} • ${yearRange}`;
}