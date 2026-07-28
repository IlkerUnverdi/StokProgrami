export type CategoryGroup = {
  id: number;
  name: string;
  isActive?: boolean;
};

export type Category = {
  id: number;
  name: string;
  categoryGroupId: number;
  isActive?: boolean;
  categoryGroup?: CategoryGroup | null;
};