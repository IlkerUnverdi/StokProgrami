import { useCustomerReturnForm } from '@/hooks/useCustomerReturnForm';
import type { CurrentAccount } from '@/types/currentAccount';
import type {
  CreateCustomerReturnPayload,
  CustomerReturn,
  CustomerReturnSale,
} from '@/types/return';

import {
  formatReturnDate,
  formatReturnPrice,
} from '../_lib/returnPresentation';

type CustomerReturnFormProps = {
  customers: CurrentAccount[];
  sales: CustomerReturnSale[];
  returns: CustomerReturn[];
  saving: boolean;
  createReturn: (payload: CreateCustomerReturnPayload) => Promise<boolean>;
};

export function CustomerReturnForm({
  customers,
  sales,
  returns,
  saving,
  createReturn,
}: CustomerReturnFormProps) {
  const {
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
  } = useCustomerReturnForm({ sales, returns, createReturn });

  const selectableItems = returnableSaleItems.filter(
    (item) =>
      !draftItems.some((draftItem) => draftItem.productId === item.productId),
  );

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Müşteriden İade Al
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          İadeyi satış belgesine bağlayarak stoğu ve müşteri bakiyesini
          güncelleyin.
        </p>
      </div>

      <fieldset disabled={saving} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-neutral-700">
          Müşteri
          <select
            value={customerId}
            onChange={(event) => changeCustomer(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          >
            <option value="">Müşteri seçin</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Satış Belgesi
          <select
            value={saleId}
            onChange={(event) => changeSale(event.target.value)}
            disabled={!customerId}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          >
            <option value="">
              {customerId ? 'Satış seçin' : 'Önce müşteri seçin'}
            </option>
            {customerSales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {sale.saleNo} • {formatReturnDate(sale.createdAt)}
              </option>
            ))}
          </select>
        </label>

        {customerId && customerSales.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Bu müşteriye ait iade edilebilir satış bulunmuyor.
          </div>
        ) : null}

        <label className="block text-sm font-medium text-neutral-700">
          Ürün
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            disabled={!selectedSale}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          >
            <option value="">
              {selectedSale ? 'Ürün seçin' : 'Önce satış seçin'}
            </option>
            {selectableItems.map((item) => (
              <option key={item.id} value={item.productId}>
                {item.product.name} • İade edilebilir: {item.returnableQuantity}
              </option>
            ))}
          </select>
        </label>

        {selectedSaleItem ? (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center text-xs">
            <div>
              <div className="text-neutral-500">Satılan</div>
              <div className="mt-1 font-bold text-neutral-900">
                {selectedSaleItem.quantity}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">İade Edilebilir</div>
              <div className="mt-1 font-bold text-green-700">
                {selectedSaleItem.returnableQuantity}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">Birim Fiyat</div>
              <div className="mt-1 font-bold text-neutral-900">
                {formatReturnPrice(selectedSaleItem.unitPrice)}
              </div>
            </div>
          </div>
        ) : null}

        <label className="block text-sm font-medium text-neutral-700">
          Adet
          <input
            type="number"
            min={1}
            max={selectedSaleItem?.returnableQuantity}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={!selectedSaleItem}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          />
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Ürün Notu
          <input
            value={itemNote}
            onChange={(event) => setItemNote(event.target.value)}
            placeholder="Örn: Ambalajı açılmamış"
            disabled={!selectedSaleItem}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          />
        </label>

        <button
          type="button"
          onClick={addDraftItem}
          disabled={!selectedSaleItem}
          className="w-full rounded-xl border border-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
        >
          İade Listesine Ekle
        </button>

        {draftItems.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
            {draftItems.map((item) => {
              const saleItem = returnableSaleItems.find(
                (candidate) => candidate.productId === item.productId,
              );

              return (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{saleItem?.product.name}</div>
                    <div className="text-xs text-neutral-500">
                      {item.quantity} adet •{' '}
                      {formatReturnPrice(
                        Number(saleItem?.unitPrice ?? 0) * item.quantity,
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDraftItem(item.productId)}
                    className="text-xs font-medium text-red-600"
                  >
                    Kaldır
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}

        <label className="block text-sm font-medium text-neutral-700">
          İade Notu
          <textarea
            rows={3}
            value={returnNote}
            onChange={(event) => setReturnNote(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-red-600 disabled:bg-neutral-100"
          />
        </label>

        {formError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => void submitReturn()}
          disabled={!customerId || !saleId || draftItems.length === 0}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'İadeyi Stok ve Cariye İşle'}
        </button>
      </fieldset>
    </section>
  );
}
