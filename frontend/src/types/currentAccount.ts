import type { PaymentMethod, PaymentType } from '@/types/payment';

export type AccountType = 'CUSTOMER' | 'SUPPLIER';

export type CurrentAccount = {
  id: number;
  name: string;
  phone?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  type: AccountType;
  isActive: boolean;
};

export type CurrentAccountFormState = {
  name: string;
  phone: string;
  taxNumber: string;
  address: string;
  type: AccountType;
  isActive: boolean;
};

export type CurrentAccountMovementProduct = {
  name: string;
  partBrand?: { name: string } | null;
  oemCodes?: Array<{
    id: number;
    code: string;
    isPrimary: boolean;
  }>;
  referenceCodes?: Array<{
    id: number;
    code: string;
  }>;
};

export type CurrentAccountMovementItem = {
  id?: number;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  product?: CurrentAccountMovementProduct | null;
};

export type CurrentAccountMovementSale = {
  saleNo: string;
  grandTotal?: string | number;
  payments?: Array<{
    method: PaymentType;
    amount: string | number;
  }>;
  items?: CurrentAccountMovementItem[];
};

export type CurrentAccountMovementPurchase = {
  purchaseNo: string;
  grandTotal?: string | number;
  paymentType?: PaymentType | string | null;
  items?: CurrentAccountMovementItem[];
};

export type CurrentAccountMovementReturn = {
  returnNo: string;
  type:
    | 'CUSTOMER_RETURN'
    | 'SUPPLIER_RETURN'
    | 'DEFECTIVE_RETURN'
    | 'WRONG_ITEM_RETURN';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  items?: CurrentAccountMovementItem[];
};

export type CurrentAccountMovement = {
  id: number;
  type: 'DEBT' | 'PAYMENT' | 'CREDIT';
  amount: string;
  paymentMethod?: PaymentMethod | null;
  note?: string | null;
  createdAt: string;
  sale?: CurrentAccountMovementSale | null;
  purchase?: CurrentAccountMovementPurchase | null;
  returnDocument?: CurrentAccountMovementReturn | null;
  user?: {
    username: string;
  };
};

export type CurrentAccountDetail = CurrentAccount & {
  currentAccountMovements?: CurrentAccountMovement[];
};

export type AccountWithBalance = CurrentAccount & {
  balance: number;
};
