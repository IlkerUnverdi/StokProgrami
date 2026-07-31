'use client';

import { useMemo, useState } from 'react';

import type {
  CreateCustomerReturnPayload,
  CustomerReturn,
  CustomerReturnSale,
  DraftReturnItem,
} from '@/types/return';

type UseCustomerReturnFormParams = {
  sales: CustomerReturnSale[];
  returns: CustomerReturn[];
  createReturn: (payload: CreateCustomerReturnPayload) => Promise<boolean>;
};

export function useCustomerReturnForm({
  sales,
  returns,
  createReturn,
}: UseCustomerReturnFormParams) {
  const [customerId, setCustomerId] = useState('');
  const [saleId, setSaleId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [itemNote, setItemNote] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [draftItems, setDraftItems] = useState<DraftReturnItem[]>([]);
  const [formError, setFormError] = useState('');

  const returnedQuantityBySaleAndProduct = useMemo(() => {
    const quantities = new Map<string, number>();

    for (const returnDocument of returns) {
      if (
        returnDocument.status === 'CANCELLED' ||
        !returnDocument.sourceSaleId
      ) {
        continue;
      }

      for (const item of returnDocument.items) {
        const key = `${returnDocument.sourceSaleId}:${item.productId}`;
        quantities.set(key, (quantities.get(key) ?? 0) + item.quantity);
      }
    }

    return quantities;
  }, [returns]);

  const customerSales = useMemo(() => {
    const parsedCustomerId = Number(customerId);

    if (!parsedCustomerId) return [];

    return sales.filter(
      (sale) =>
        sale.currentAccountId === parsedCustomerId &&
        sale.items.some((item) => {
          const returnedQuantity =
            returnedQuantityBySaleAndProduct.get(
              `${sale.id}:${item.productId}`,
            ) ?? 0;

          return item.quantity > returnedQuantity;
        }),
    );
  }, [customerId, returnedQuantityBySaleAndProduct, sales]);

  const selectedSale = customerSales.find(
    (sale) => sale.id === Number(saleId),
  );

  const returnableSaleItems = useMemo(
    () =>
      (selectedSale?.items ?? [])
        .map((item) => ({
          ...item,
          returnableQuantity: Math.max(
            0,
            item.quantity -
              (returnedQuantityBySaleAndProduct.get(
                `${selectedSale?.id}:${item.productId}`,
              ) ?? 0),
          ),
        }))
        .filter((item) => item.returnableQuantity > 0),
    [returnedQuantityBySaleAndProduct, selectedSale],
  );

  const selectedSaleItem = returnableSaleItems.find(
    (item) => item.productId === Number(selectedProductId),
  );

  function changeCustomer(nextCustomerId: string) {
    setCustomerId(nextCustomerId);
    setSaleId('');
    setSelectedProductId('');
    setDraftItems([]);
    setFormError('');
  }

  function changeSale(nextSaleId: string) {
    setSaleId(nextSaleId);
    setSelectedProductId('');
    setDraftItems([]);
    setFormError('');
  }

  function addDraftItem() {
    const parsedQuantity = Number(quantity);

    setFormError('');

    if (!selectedSaleItem) {
      setFormError('İade edilecek ürünü seçin.');
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setFormError('İade adedi pozitif bir tam sayı olmalıdır.');
      return;
    }

    if (parsedQuantity > selectedSaleItem.returnableQuantity) {
      setFormError(
        `Bu satıştan en fazla ${selectedSaleItem.returnableQuantity} adet iade edilebilir.`,
      );
      return;
    }

    if (draftItems.some((item) => item.productId === selectedSaleItem.productId)) {
      setFormError('Aynı ürün iade listesine birden fazla eklenemez.');
      return;
    }

    setDraftItems((current) => [
      ...current,
      {
        productId: selectedSaleItem.productId,
        quantity: parsedQuantity,
        note: itemNote.trim() || undefined,
      },
    ]);
    setSelectedProductId('');
    setQuantity('1');
    setItemNote('');
  }

  function removeDraftItem(productId: number) {
    setDraftItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }

  async function submitReturn() {
    setFormError('');

    if (!customerId || !saleId) {
      setFormError('Müşteri ve satış belgesi seçin.');
      return;
    }

    if (draftItems.length === 0) {
      setFormError('İade listesine en az bir ürün ekleyin.');
      return;
    }

    const created = await createReturn({
      type: 'CUSTOMER_RETURN',
      currentAccountId: Number(customerId),
      sourceSaleId: Number(saleId),
      note: returnNote.trim() || undefined,
      items: draftItems,
    });

    if (created) {
      setSaleId('');
      setSelectedProductId('');
      setQuantity('1');
      setItemNote('');
      setReturnNote('');
      setDraftItems([]);
    }
  }

  return {
    customerId,
    saleId,
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    itemNote,
    setItemNote,
    returnNote,
    setReturnNote,
    customerSales,
    selectedSale,
    returnableSaleItems,
    selectedSaleItem,
    draftItems,
    formError,
    changeCustomer,
    changeSale,
    addDraftItem,
    removeDraftItem,
    submitReturn,
  };
}
