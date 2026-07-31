'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { StockProductList } from './components/StockProductList';

type ProductItem = {
  id: number;
  name: string;
  barcode?: string | null;
  currentStock?: number;
  partBrand?: { name: string };
  oemCodes?: { id: number; code: string; isPrimary: boolean }[];
  referenceCodes?: { id: number; code: string }[];
};

type SupplierItem = {
  id: number;
  name: string;
  phone?: string | null;
  type: 'CUSTOMER' | 'SUPPLIER';
  isActive: boolean;
};

function getPrimaryOem(product: ProductItem) {
  const primary = product.oemCodes?.find((item) => item.isPrimary);
  return primary?.code || product.oemCodes?.[0]?.code || '-';
}

export default function StockPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitCost, setUnitCost] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const [productsResponse, suppliersResponse] = await Promise.all([
          api.get<ProductItem[]>('/products'),
          api.get<SupplierItem[]>('/current-accounts'),
        ]);

        setProducts(productsResponse.data);
        setSuppliers(
          suppliersResponse.data.filter(
            (account) => account.type === 'SUPPLIER' && account.isActive,
          ),
        );
      } catch {
        setError('Ürünler veya tedarikçiler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    }

    void fetchProducts();
  }, []);

  const selectedProduct = products.find((item) => item.id === selectedProductId);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');

    return products.filter((product) => {
      return (
        q.length === 0 ||
        product.name.toLocaleLowerCase('tr').includes(q) ||
        (product.barcode ?? '').toLocaleLowerCase('tr').includes(q) ||
        (product.partBrand?.name ?? '').toLocaleLowerCase('tr').includes(q) ||
        (product.oemCodes ?? []).some((item) =>
          item.code.toLocaleLowerCase('tr').includes(q),
        ) ||
        (product.referenceCodes ?? []).some((item) =>
          item.code.toLocaleLowerCase('tr').includes(q),
        )
      );
    });
  }, [products, search]);

  async function handleSubmit() {
    const parsedQuantity = Number(quantity);
    const parsedUnitCost = Number(unitCost);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('Adet pozitif bir tam sayı olmalıdır.');
      setMessage('');
      return;
    }

    if (
      unitCost.trim().length === 0 ||
      !Number.isFinite(parsedUnitCost) ||
      parsedUnitCost <= 0
    ) {
      setError('Birim alış fiyatı sıfırdan büyük olmalıdır.');
      setMessage('');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.post('/stock-movements', {
        productId: selectedProductId,
        supplierId: selectedSupplierId
          ? Number(selectedSupplierId)
          : undefined,
        type: 'IN',
        quantity: parsedQuantity,
        unitCost: parsedUnitCost,
        reference: reference || undefined,
        note: note || undefined,
      });

      const response = await api.get<ProductItem[]>('/products');
      setProducts(response.data);

      setQuantity('1');
      setUnitCost('');
      setReference('');
      setNote('');
      setMessage('Stok girişi başarıyla kaydedildi.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const rawMessage = err.response?.data?.message;
        setError(
          typeof rawMessage === 'string'
            ? rawMessage
            : Array.isArray(rawMessage)
              ? rawMessage.join(', ')
              : 'Stok girişi yapılamadı.',
        );
      } else {
        setError('Stok girişi yapılamadı.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">Stok Girişi</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Sadece kayıtlı ürünlere stok ekleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Ürün Ara
          </label>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı / barkod / OEM / reference / marka"
            className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
          />

          <StockProductList
            loading={loading}
            products={filteredProducts}
            onSelectProduct={(product) => {
              setSelectedProductId(product.id);
              setSelectedSupplierId('');
            }}
          />
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
          <h2 className="text-xl font-semibold text-neutral-900">Stok Ekle</h2>

          {selectedProduct ? (
            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm">
              <div className="font-semibold text-neutral-900">
                {selectedProduct.name}
              </div>
              <div className="mt-1 text-neutral-500">
                Mevcut stok: {selectedProduct.currentStock ?? 0} adet
              </div>

              <div className="mt-3 text-xs text-neutral-500">
                OEM: {getPrimaryOem(selectedProduct)} • Marka:{' '}
                {selectedProduct.partBrand?.name || '-'}
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-xs font-medium text-neutral-600">
                  Tedarikçi
                </label>

                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none focus:border-red-600"
                >
                  <option value="">Tedarikçi seç</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                      {supplier.phone ? ` (${supplier.phone})` : ''}
                    </option>
                  ))}
                </select>

                {suppliers.length === 0 ? (
                  <div className="mt-2 text-xs text-orange-600">
                    Kayıtlı aktif tedarikçi bulunmuyor. Önce Cari Ayarları ekranından SUPPLIER tipinde cari ekleyin.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
              Önce soldan ürün seç.
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Adet
              </label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Birim Alış Fiyatı
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="Örn: 150.00"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Fatura / Referans
              </label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Opsiyonel"
                className="h-11 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Not
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Opsiyonel"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-red-600"
              />
            </div>

            {message ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !selectedProductId ||
                !selectedSupplierId ||
                saving ||
                !Number.isInteger(Number(quantity)) ||
                Number(quantity) <= 0 ||
                unitCost.trim().length === 0 ||
                !Number.isFinite(Number(unitCost)) ||
                Number(unitCost) <= 0
              }
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Kaydediliyor...'
                : !selectedProductId
                  ? 'Önce Ürün Seç'
                  : !selectedSupplierId
                    ? 'Tedarikçi Seç'
                    : unitCost.trim().length === 0 ||
                        !Number.isFinite(Number(unitCost)) ||
                        Number(unitCost) <= 0
                      ? 'Alış Fiyatı Gir'
                    : 'Stok Girişini Kaydet'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
