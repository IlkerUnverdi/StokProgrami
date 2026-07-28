

'use client';

import { useMemo, useState } from 'react';

import type { VehicleVariant } from '@/types/vehicle';
import {
  getVehicleYearRangeLabel,
  getVehicleYearRangeValue,
} from '@/utils/vehicle';

export type VehicleBrandOption = {
  id: number;
  name: string;
};

export type VehicleYearRangeOption = {
  value: string;
  label: string;
};

export function getVariantBrandId(variant: VehicleVariant) {
  return variant.vehicleBrand?.id ?? 0;
}

export function getVariantBrandName(variant: VehicleVariant) {
  const rawName = variant.brandName ?? variant.vehicleBrand?.name ?? '';

  if (!rawName || rawName.toLowerCase() === 'undefined') {
    return '';
  }

  return rawName;
}

export function getVehicleBrandOptions(
  vehicleVariants: VehicleVariant[],
): VehicleBrandOption[] {
  const map = new Map<number, VehicleBrandOption>();

  for (const variant of vehicleVariants) {
    const id = getVariantBrandId(variant);
    const name = getVariantBrandName(variant);

    if (id > 0 && name) {
      map.set(id, { id, name });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'tr'),
  );
}

export function getVehicleModelOptions(
  vehicleVariants: VehicleVariant[],
  vehicleBrandId: number,
): string[] {
  if (vehicleBrandId === 0) return [];

  return Array.from(
    new Set(
      vehicleVariants
        .filter((variant) => getVariantBrandId(variant) === vehicleBrandId)
        .map((variant) => variant.modelName)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function getVehicleYearRangeOptions(
  vehicleVariants: VehicleVariant[],
  vehicleBrandId: number,
  vehicleModelName: string,
): VehicleYearRangeOption[] {
  if (vehicleBrandId === 0 || vehicleModelName === '') return [];

  const map = new Map<string, string>();

  for (const variant of vehicleVariants) {
    if (
      getVariantBrandId(variant) === vehicleBrandId &&
      variant.modelName === vehicleModelName
    ) {
      map.set(
        getVehicleYearRangeValue(variant),
        getVehicleYearRangeLabel(variant),
      );
    }
  }

  return Array.from(map.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'));
}

export function getVehicleEngineOptions(
  vehicleVariants: VehicleVariant[],
  vehicleBrandId: number,
  vehicleModelName: string,
  vehicleYearRange = '',
): string[] {
  if (vehicleBrandId === 0 || vehicleModelName === '') return [];

  return Array.from(
    new Set(
      vehicleVariants
        .filter((variant) => {
          const matchesBrand = getVariantBrandId(variant) === vehicleBrandId;
          const matchesModel = variant.modelName === vehicleModelName;
          const matchesYearRange =
            vehicleYearRange === '' ||
            getVehicleYearRangeValue(variant) === vehicleYearRange;

          return matchesBrand && matchesModel && matchesYearRange;
        })
        .map((variant) => variant.engine)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, 'tr'));
}

export function findVehicleVariantBySelection(
  vehicleVariants: VehicleVariant[],
  vehicleBrandId: number,
  vehicleModelName: string,
  vehicleYearRange: string,
  vehicleEngine: string,
) {
  return vehicleVariants.find((variant) => {
    const matchesBrand = getVariantBrandId(variant) === vehicleBrandId;
    const matchesModel = variant.modelName === vehicleModelName;
    const matchesYearRange =
      vehicleYearRange === '' ||
      getVehicleYearRangeValue(variant) === vehicleYearRange;
    const matchesEngine = variant.engine === vehicleEngine;

    return matchesBrand && matchesModel && matchesYearRange && matchesEngine;
  });
}

export function useVehicleFilters(vehicleVariants: VehicleVariant[]) {
  const [vehicleBrandId, setVehicleBrandId] = useState(0);
  const [vehicleModelName, setVehicleModelName] = useState('');
  const [vehicleYearRange, setVehicleYearRange] = useState('');
  const [vehicleEngine, setVehicleEngine] = useState('');

  const availableVehicleBrands = useMemo(() => {
    return getVehicleBrandOptions(vehicleVariants);
  }, [vehicleVariants]);

  const availableVehicleModels = useMemo(() => {
    return getVehicleModelOptions(vehicleVariants, vehicleBrandId);
  }, [vehicleVariants, vehicleBrandId]);

  const availableVehicleYearRanges = useMemo(() => {
    return getVehicleYearRangeOptions(
      vehicleVariants,
      vehicleBrandId,
      vehicleModelName,
    );
  }, [vehicleVariants, vehicleBrandId, vehicleModelName]);

  const availableVehicleEngines = useMemo(() => {
    return getVehicleEngineOptions(
      vehicleVariants,
      vehicleBrandId,
      vehicleModelName,
      vehicleYearRange,
    );
  }, [vehicleVariants, vehicleBrandId, vehicleModelName, vehicleYearRange]);

  function resetVehicleFilters() {
    setVehicleBrandId(0);
    setVehicleModelName('');
    setVehicleYearRange('');
    setVehicleEngine('');
  }

  return {
    vehicleBrandId,
    vehicleModelName,
    vehicleYearRange,
    vehicleEngine,

    setVehicleBrandId,
    setVehicleModelName,
    setVehicleYearRange,
    setVehicleEngine,
    resetVehicleFilters,

    availableVehicleBrands,
    availableVehicleModels,
    availableVehicleYearRanges,
    availableVehicleEngines,
  };
}