

'use client';

import { useState } from 'react';
import type { CurrentAccountMovement } from '@/types/currentAccount';
import { formatPrice, formatDate } from '@/utils/format';
import { toNumberPrice } from '@/utils/number';

type CurrentAccountMovementsProps = {
  movements: CurrentAccountMovement[];
};

function getPrimaryOem(
  codes?: Array<{ id: number; code: string; isPrimary: boolean }>,
) {
  const primary = codes?.find((code) => code.isPrimary);
  return primary?.code || codes?.[0]?.code || '-';
}

function getPrimaryReference(
  codes?: Array<{ id: number; code: string }>,
) {
  return codes?.[0]?.code || '-';
}

function getPaymentLabel(method: 'CASH' | 'CARD' | 'TRANSFER' | 'ON_ACCOUNT') {
  if (method === 'CASH') return 'Nakit';
  if (method === 'CARD') return 'Kart';
  if (method === 'TRANSFER') return 'Havale/EFT';
  return 'Cari';
}

function getCollectionPaymentLabel(
  method?: 'CASH' | 'CARD' | 'TRANSFER' | 'ON_ACCOUNT' | string | null,
) {
  if (method === 'CASH') return 'Nakit';
  if (method === 'CARD') return 'Kart';
  if (method === 'TRANSFER') return 'Havale/EFT';
  if (method === 'ON_ACCOUNT') return 'Cari';
  return 'Yöntem yok';
}

function isAutoPurchaseNote(note?: string | null) {
  if (!note) return false;

  const normalized = note.toLocaleLowerCase('tr');

  return (
    normalized.includes('alış kaydı') ||
    normalized.includes('alis kaydi') ||
    normalized.includes('ürün:') ||
    normalized.includes('urun:') ||
    normalized.includes('adet:') ||
    normalized.includes('birim alış') ||
    normalized.includes('birim alis')
  );
}

export function CurrentAccountMovements({
  movements,
}: CurrentAccountMovementsProps) {
  const [expandedMovementId, setExpandedMovementId] = useState<number | null>(
    null,
  );

  return (
    <div>
      <h3 className="mb-3 font-semibold text-neutral-900">Hareketler</h3>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {movements.length > 0 ? (
          movements.map((movement) => {
            const isExpanded = expandedMovementId === movement.id;
            const saleItems = movement.sale?.items ?? [];
            const salePayments = movement.sale?.payments ?? [];
            const purchaseItems = movement.purchase?.items ?? [];
            const returnItems = movement.returnDocument?.items ?? [];
            const lowerNote = movement.note?.toLocaleLowerCase('tr') ?? '';
            const isPurchaseMovement =
              Boolean(movement.purchase) ||
              lowerNote.includes('alış kaydı') ||
              lowerNote.includes('alis kaydi');

            return (
              <div
                key={movement.id}
                className="rounded-xl border border-neutral-200 p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-neutral-900">
                      {movement.type === 'CREDIT'
                        ? 'İade Mahsubu'
                        : movement.type === 'PAYMENT'
                        ? 'Tahsilat'
                        : isPurchaseMovement
                          ? 'Borç / Alış'
                          : 'Borç / Satış'}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {formatDate(movement.createdAt)}
                      {movement.sale?.saleNo
                        ? ` • ${movement.sale.saleNo}`
                        : movement.purchase?.purchaseNo
                          ? ` • ${movement.purchase.purchaseNo}`
                          : movement.returnDocument?.returnNo
                            ? ` • ${movement.returnDocument.returnNo}`
                            : ''}
                    </div>
                    {movement.type !== 'DEBT' || !isPurchaseMovement ? (
                      <div className="mt-1 text-xs text-neutral-600">
                        {movement.type === 'PAYMENT'
                          ? `Ödeme: ${getCollectionPaymentLabel(
                              movement.paymentMethod,
                            )}${movement.note ? ` • ${movement.note}` : ''}`
                          : movement.note || ''}
                      </div>
                    ) : null}
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold ${
                        movement.type === 'DEBT'
                          ? 'text-red-700'
                          : 'text-green-700'
                      }`}
                    >
                      {movement.type === 'DEBT' ? '+' : '-'}
                      {formatPrice(toNumberPrice(movement.amount))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMovementId(isExpanded ? null : movement.id)
                      }
                      className="mt-2 rounded-lg border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      {isExpanded ? 'Kapat' : 'Detay'}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-3 space-y-3 rounded-xl bg-neutral-50 p-3">
                    {movement.type === 'CREDIT' ? (
                      <>
                        <div className="text-xs text-neutral-700">
                          <div className="font-semibold text-neutral-900">
                            İade Mahsubu{' '}
                            {movement.returnDocument?.returnNo
                              ? `• ${movement.returnDocument.returnNo}`
                              : ''}
                          </div>
                          <div className="mt-1">
                            Cari borçtan düşülen:{' '}
                            {formatPrice(toNumberPrice(movement.amount))}
                          </div>
                          <div>Personel: {movement.user?.username || '-'}</div>
                          <div>Not: {movement.note || '-'}</div>
                        </div>

                        {returnItems.length > 0 ? (
                          <div className="space-y-2">
                            {returnItems.map((item, index) => (
                              <div
                                key={item.id ?? index}
                                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-2 text-xs"
                              >
                                <div>
                                  <div className="font-medium text-neutral-900">
                                    {item.product?.name || 'Ürün'}
                                  </div>
                                  <div className="text-neutral-500">
                                    {item.quantity} adet ×{' '}
                                    {formatPrice(
                                      toNumberPrice(item.unitPrice),
                                    )}
                                  </div>
                                </div>
                                <div className="font-semibold text-neutral-900">
                                  {formatPrice(
                                    toNumberPrice(item.lineTotal),
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : movement.type === 'PAYMENT' ? (
                      <div className="text-xs text-neutral-700">
                        <div className="font-semibold text-neutral-900">
                          Tahsilat Detayı
                        </div>
                        <div className="mt-1">
                          Tutar: {formatPrice(toNumberPrice(movement.amount))}
                        </div>
                        <div>
                          Ödeme Yöntemi:{' '}
                          {getCollectionPaymentLabel(movement.paymentMethod)}
                        </div>
                        <div>Personel: {movement.user?.username || '-'}</div>
                        <div>Not: {movement.note || '-'}</div>
                      </div>
                    ) : isPurchaseMovement ? (
                      <>
                        <div className="text-xs">
                          <div className="font-semibold text-neutral-900">
                            Alış Detayı{' '}
                            {movement.purchase?.purchaseNo
                              ? `• ${movement.purchase.purchaseNo}`
                              : ''}
                          </div>
                          <div className="mt-1 text-neutral-500">
                            Alış Toplamı:{' '}
                            {formatPrice(
                              toNumberPrice(
                                movement.purchase?.grandTotal ?? movement.amount,
                              ),
                            )}
                          </div>
                          <div className="mt-1 text-neutral-500">
                            Ödeme Tipi:{' '}
                            {getCollectionPaymentLabel(
                              movement.purchase?.paymentType ??
                                movement.paymentMethod,
                            )}
                          </div>
                          <div className="mt-1 text-neutral-500">
                            Personel: {movement.user?.username || '-'}
                          </div>
                          {movement.note && !isAutoPurchaseNote(movement.note) ? (
                            <div className="mt-1 text-neutral-500">
                              Not: {movement.note}
                            </div>
                          ) : null}
                        </div>

                        {purchaseItems.length > 0 ? (
                          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                            <table className="w-full text-xs">
                              <thead className="bg-neutral-100">
                                <tr>
                                  <th className="p-2 text-left font-semibold">
                                    Ürün
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    OEM
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    Ref.
                                  </th>
                                  <th className="p-2 text-right font-semibold">
                                    Adet
                                  </th>
                                  <th className="p-2 text-right font-semibold">
                                    Birim
                                  </th>
                                  <th className="p-2 text-right font-semibold">
                                    Toplam
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {purchaseItems.map((item, index) => (
                                  <tr
                                    key={item.id ?? index}
                                    className="border-t border-neutral-200"
                                  >
                                    <td className="p-2 align-top">
                                      <div className="font-medium text-neutral-900">
                                        {item.product?.name || 'Ürün'}
                                      </div>
                                      <div className="text-neutral-500">
                                        {item.product?.partBrand?.name ||
                                          'Marka yok'}
                                      </div>
                                    </td>
                                    <td className="p-2 align-top">
                                      {getPrimaryOem(item.product?.oemCodes)}
                                    </td>
                                    <td className="p-2 align-top">
                                      {getPrimaryReference(
                                        item.product?.referenceCodes,
                                      )}
                                    </td>
                                    <td className="p-2 text-right align-top">
                                      {item.quantity}
                                    </td>
                                    <td className="p-2 text-right align-top">
                                      {formatPrice(toNumberPrice(item.unitPrice))}
                                    </td>
                                    <td className="p-2 text-right align-top font-semibold">
                                      {formatPrice(toNumberPrice(item.lineTotal))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                            Bu alış hareketi kaydedilmiş, ancak backend response
                            içinde purchase.items detayı gelmiyor.
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-xs">
                          <div className="font-semibold text-neutral-900">
                            Satış Detayı{' '}
                            {movement.sale?.saleNo
                              ? `• ${movement.sale.saleNo}`
                              : ''}
                          </div>
                          <div className="mt-1 text-neutral-500">
                            Satış Toplamı:{' '}
                            {formatPrice(toNumberPrice(movement.sale?.grandTotal))}
                          </div>
                        </div>

                        {salePayments.length > 0 ? (
                          <div className="rounded-xl border border-neutral-200 bg-white p-3">
                            <div className="mb-2 text-xs font-semibold text-neutral-900">
                              Ödeme Dağılımı
                            </div>
                            <div className="space-y-1 text-xs text-neutral-600">
                              {salePayments.map((payment, index) => (
                                <div
                                  key={`${payment.method}-${index}`}
                                  className="flex justify-between gap-3"
                                >
                                  <span>{getPaymentLabel(payment.method)}</span>
                                  <span className="font-semibold">
                                    {formatPrice(toNumberPrice(payment.amount))}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {saleItems.length > 0 ? (
                          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                            <table className="w-full text-xs">
                              <thead className="bg-neutral-100">
                                <tr>
                                  <th className="p-2 text-left font-semibold">
                                    Ürün
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    OEM
                                  </th>
                                  <th className="p-2 text-left font-semibold">
                                    Ref.
                                  </th>
                                  <th className="p-2 text-right font-semibold">
                                    Adet
                                  </th>
                                  <th className="p-2 text-right font-semibold">
                                    Toplam
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {saleItems.map((item, index) => (
                                  <tr
                                    key={item.id ?? index}
                                    className="border-t border-neutral-200"
                                  >
                                    <td className="p-2 align-top">
                                      <div className="font-medium text-neutral-900">
                                        {item.product?.name || 'Ürün'}
                                      </div>
                                      <div className="text-neutral-500">
                                        {item.product?.partBrand?.name ||
                                          'Marka yok'}
                                      </div>
                                    </td>
                                    <td className="p-2 align-top">
                                      {getPrimaryOem(item.product?.oemCodes)}
                                    </td>
                                    <td className="p-2 align-top">
                                      {getPrimaryReference(
                                        item.product?.referenceCodes,
                                      )}
                                    </td>
                                    <td className="p-2 text-right align-top">
                                      {item.quantity}
                                    </td>
                                    <td className="p-2 text-right align-top font-semibold">
                                      {formatPrice(toNumberPrice(item.lineTotal))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
                            Bu satış için ürün detayı gelmiyor. Backend response
                            içinde sale.items boş geliyor olabilir.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="text-sm text-neutral-500">
            Bu cari için hareket yok.
          </div>
        )}
      </div>
    </div>
  );
}
