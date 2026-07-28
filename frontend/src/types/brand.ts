export type PartBrand = {
  id: number;
  name: string;
  isActive?: boolean;
  products?: Array<{
    id: number;
  }>;
};