import { useSupplierReturnForm } from '@/hooks/useSupplierReturnForm';
import type { CurrentAccount } from '@/types/currentAccount';
import type { ProductListItem } from '@/types/product';
import type {
  CreateSupplierReturnPayload,
  SupplierReturnType,
} from '@/types/return';

import { supplierReturnTypeLabels } from '../_lib/returnPresentation';

type SupplierReturnFormProps = {
  products: ProductListItem[];
  suppliers: CurrentAccount[];
  savingAction: string;
  createReturn: (
    payload: CreateSupplierReturnPayload,
    invoiceFile?: File | null
  ) => Promise<boolean>;
};

export function SupplierReturnForm({
  products,
  suppliers,
  savingAction,
  createReturn,
}: SupplierReturnFormProps) {
  const {
    supplierId,
    setSupplierId,
    returnInvoiceNo,
    setReturnInvoiceNo,
    returnInvoiceDate,
    setReturnInvoiceDate,
    returnInvoiceFile,
    setReturnInvoiceFile,
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
  } = useSupplierReturnForm({ products, createReturn });

  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
      <h2 className="text-xl font-semibold text-neutral-900">
        Yeni İade Kaydı
      </h2>

      <fieldset disabled={Boolean(savingAction)} className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-neutral-700">
          Tedarikçi
          <select
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          >
            <option value="">Tedarikçi seçin</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-700">
            İade Fatura No
            <input
              type="text"
              value={returnInvoiceNo}
              onChange={(event) => setReturnInvoiceNo(event.target.value)}
              placeholder="Varsa iade faturası numarası"
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            İade Fatura Tarihi
            <input
              type="date"
              value={returnInvoiceDate}
              onChange={(event) => setReturnInvoiceDate(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            İade Fatura Dosyası
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setReturnInvoiceFile(file);
              }}
              className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
            />

            <span className="mt-1 block text-xs text-neutral-500">
              PDF, JPG veya PNG • Maksimum 10 MB
            </span>

            {returnInvoiceFile ? (
              <span className="mt-1 block text-xs text-neutral-700">
                Seçilen dosya: {returnInvoiceFile.name}
              </span>
            ) : null}
          </label>
        </div>

        <label className="block text-sm font-medium text-neutral-700">
          İade Nedeni
          <select
            value={returnType}
            onChange={(event) =>
              setReturnType(event.target.value as SupplierReturnType)
            }
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          >
            {Object.entries(supplierReturnTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Ürün
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          >
            <option value="">Ürün seçin
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} • Satılabilir: {product.currentStock ?? 0}
              </option>
            ))}
          </select>
        </label>

        {selectedProduct ? (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center text-xs">
            <div>
              <div className="text-neutral-500">Satılabilir</div>
              <div className="mt-1 font-bold text-neutral-900">
                {selectedProduct.currentStock ?? 0}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">İade Bekleyen</div>
              <div className="mt-1 font-bold text-amber-700">
                {selectedProduct.returnPendingStock ?? 0}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">Fiziksel</div>
              <div className="mt-1 font-bold text-neutral-900">
                {selectedProduct.physicalStock ??
                  selectedProduct.currentStock ??
                  0}
              </div>
            </div>
          </div>
        ) : null}

        <label className="block text-sm font-medium text-neutral-700">
          Adet
          <input
            type="number"
            min={1}
            max={selectedProduct?.currentStock}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          />
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Ürün Notu
          <input
            value={itemNote}
            onChange={(event) => setItemNote(event.target.value)}
            placeholder="Örn: Kutudan arızalı çıktı"
            className="mt-2 h-11 w-full rounded-xl border border-neutral-300 px-3 outline-none focus:border-red-600 disabled:bg-neutral-100"
          />
        </label>

        <button
          type="button"
          onClick={addDraftItem}
          disabled={!selectedProduct}
          className="w-full rounded-xl border border-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
        >
          İade Listesine Ekle
        </button>

        {draftItems.length > 0 ? (
          <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
            {draftItems.map((item) => {
              const product = products.find(
                (candidate) => candidate.id === item.productId,
              );

              return (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{product?.name}</div>
                    <div className="text-xs text-neutral-500">
                      {item.quantity} adet
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
          disabled={!supplierId || draftItems.length === 0}
          className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {savingAction === 'create'
            ? 'Kaydediliyor...'
            : 'İade Bekleyenlere Al'}
        </button>
      </fieldset>
    </aside>
  );
}
