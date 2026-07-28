import { api } from '@/lib/api';
import { PartBrand } from '@/types/brand';

export async function getPartBrands() {
  const res = await api.get<PartBrand[]>('/part-brands');
  return res.data;
}