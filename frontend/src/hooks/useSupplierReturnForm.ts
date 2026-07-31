'use client';

import { useState } from 'react';

import type { ProductListItem } from '@/types/product';
import type {
  CreateSupplierReturnPayload,
  DraftSupplierReturnItem,
  SupplierReturnType,
} from '@/types/return';

type UseSupplierReturnFormParams = {
  products: ProductListItem[];
  createReturn: (payload: CreateSupplierReturnPayload) => Promise<boolean>;
};

export function useSupplierReturnForm({
  products,
  createReturn,
}: UseSupplierReturnFormParams) {
  const [supplierId, setSupplierId] = useState('');
  const [returnType, setReturnType] =
    useState<SupplierReturnType>('DEFECTIVE_RETURN');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [itemNote, setItemNote] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [draftItems, setDraftItems] = useState<DraftSupplierReturnItem[]>([]);
  const [formError, setFormError] = useState('');

  const selectedProduct = products.find(
    (product) => product.id === Number(selectedProductId),
  );

  function addDraftItem() {
    const parsedQuantity = Number(quantity);

    setFormError('');

    if (!selectedProduct) {
      setFormError('İade edilecek ürünü seçin.');
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setFormError('İade adedi pozitif bir tam sayı olmalıdır.');
      return;
    }

    if (parsedQuantity > (selectedProduct.currentStock ?? 0)) {
      setFormError('İade adedi satılabilir stoktan fazla olamaz.');
      return;
    }

    if (draftItems.some((item) => item.productId === selectedProduct.id)) {
      setFormError('Aynı ürün iade listesine birden fazla eklenemez.');
      return;
    }

    setDraftItems((current) => [
      ...current,
      {
        productId: selectedProduct.id,
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

    if (!supplierId) {
      setFormError('Tedarikçi seçin.');
      return;
    }

    if (draftItems.length === 0) {
      setFormError('İade listesine en az bir ürün ekleyin.');
      return;
    }

    const created = await createReturn({
      type: returnType,
      currentAccountId: Number(supplierId),
      note: returnNote.trim() || undefined,
      items: draftItems,
    });

    if (created) {
      setDraftItems([]);
      setReturnNote('');
    }
  }

  return {
    supplierId,
    setSupplierId,
    returnType,
    setReturnType,
    selectedProductId,
    setSelectedProductId,
    selectedProduct,
    quantity,
    setQuantity,
    itemNote,
    setItemNote,
    returnNote,
    setReturnNote,
    draftItems,
    formError,
    addDraftItem,
    removeDraftItem,
    submitReturn,
  };
}
