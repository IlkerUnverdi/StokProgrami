export type PartBrand = {
  id: number;
  name: string;
  isActive?: boolean;
  productCount?: number;
  products?: Array<{
    id: number;
  }>;
};
