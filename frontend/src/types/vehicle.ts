

export type VehicleVariant = {
  id: number;
  brandName?: string | null;
  modelName: string;
  engine: string;
  fuel?: string | null;
  yearStart?: number | null;
  yearEnd?: number | null;
  startYear?: number | null;
  endYear?: number | null;

  vehicleBrand?: {
    id: number;
    name: string;
  } | null;
};

export type RawVehicleVariant = {
  id: number;
  brandName?: string | null;
  vehicleBrand?: {
    id?: number;
    name?: string | null;
  } | null;

  modelName?: string | null;
  engine?: string | null;
  fuel?: string | null;
  yearStart?: number | null;
  yearEnd?: number | null;
};

export type VehicleForm = {
  brandName: string;
  modelName: string;
  engine: string;
  fuel: string;
  yearStart: string;
  yearEnd: string;
};