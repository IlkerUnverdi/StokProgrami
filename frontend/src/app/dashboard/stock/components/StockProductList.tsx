'use client';

type ProductItem = {
  id: number;
  name: string;
  barcode?: string | null;
  currentStock?: number;
  partBrand?: { name: string };
  oemCodes?: { id: number; code: string; isPrimary: boolean }[];
  referenceCodes?: { id: number; code: string }[];
};

type StockProductListProps = {
  products: ProductItem[];
  loading: boolean;
  onSelectProduct: (product: ProductItem) => void;
};

function getPrimaryOem(product: ProductItem) {
  const primary = product.oemCodes?.find((item) => item.isPrimary);
  return primary?.code || product.oemCodes?.[0]?.code || '-';
}

export function StockProductList({
  products,
  loading,
  onSelectProduct,
}: StockProductListProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">

      <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="p-4 text-left font-semibold">Ürün</th>
              <th className="p-4 text-left font-semibold">Parça No</th>
              <th className="p-4 text-left font-semibold">OEM</th>
              <th className="p-4 text-left font-semibold">Marka</th>
              <th className="p-4 text-left font-semibold">Stok</th>
              <th className="p-4 text-left font-semibold">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-500">
                  Ürün bulunamadı.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const isSelected = false;

                return (
                  <tr
                    key={product.id}
                    className={`border-t border-neutral-200 ${
                      isSelected ? 'bg-red-50/60' : ''
                    }`}
                  >
                    <td className="p-4 font-medium text-neutral-900">
                      {product.name}
                    </td>
                    <td className="p-4">{product.barcode || '-'}</td>
                    <td className="p-4">{getPrimaryOem(product)}</td>
                    <td className="p-4">{product.partBrand?.name || '-'}</td>
                    <td className="p-4">{product.currentStock ?? 0} adet</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className={`rounded-xl px-4 py-2 text-xs font-medium text-white ${
                          isSelected
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-neutral-900 hover:bg-neutral-800'
                        }`}
                      >
                        {isSelected ? 'Seçili' : 'Seç'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}