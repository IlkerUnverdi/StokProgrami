// frontend/src/types/dashboard.ts

export type SaleItem = {
  id: number;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  product: {
    id: number;
    name: string;
    barcode?: string | null;
    partBrand?: { name: string };
    oemCodes?: { code: string; isPrimary: boolean }[];
    referenceCodes?: { code: string }[];
  };
};

export type Sale = {
  id: number;
  saleNo: string;
  grandTotal: string;
  note?: string | null;
  createdAt: string;
  currentAccount?: { id?: number; name: string; phone?: string | null } | null;
  items: SaleItem[];
};

export type ManualPayment = {
  id: number;
  amount: string | number;
  note?: string | null;
  createdAt: string;
  currentAccount?: {
    id: number;
    name: string;
    phone?: string | null;
  } | null;
  user?: {
    username: string;
  } | null;
};

export type CurrentAccountMovementDetail = {
  id: number;
  type: 'DEBT' | 'PAYMENT';
  amount: string | number;
  note?: string | null;
  createdAt: string;
  sale?: {
    saleNo?: string;
    items?: SaleItem[];
  } | null;
};

export type CurrentAccountDetail = {
  id: number;
  name: string;
  phone?: string | null;
  currentAccountMovements?: CurrentAccountMovementDetail[];
  sales?: Sale[];
};

export type DailySalesResponse = {
  summary: {
    salesCount: number;
    totalItems: number;
    salesTotal: number;
    collectedTotal: number;
    cariDebtTotal: number;
    manualPaymentTotal: number;
  };
  sales: Sale[];
  manualPayments: ManualPayment[];
};