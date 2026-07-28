'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSalesCart } from '@/hooks/useSalesCart';
import {
  emptyPayments,
  useSalesPayments,
} from '@/hooks/useSalesPayments';
import { SalesCartSection } from './components/SalesCartSection';
import { PaymentSummarySection } from './components/PaymentSummarySection';
import { useSalesCheckout } from '@/hooks/useSalesCheckout';
import { useSalesCurrentAccounts } from '@/hooks/useSalesCurrentAccounts';

export default function SalesPage() {
  const {
    cart,
    cartHydrated,
    cartSubtotal,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useSalesCart();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { currentAccounts } = useSalesCurrentAccounts();
  const subtotal = cartSubtotal;

  const {
    payments,
    setPayments,
    selectedCurrentAccountId,
    setSelectedCurrentAccountId,
    note,
    setNote,
    remainingTotal,
    handlePaymentInput,
    fillSinglePayment,
    fillRemainingPayment,
  } = useSalesPayments(subtotal);

  const selectedCurrentAccount = currentAccounts.find(
    (account) => account.id === selectedCurrentAccountId,
  );

  const {saving, completeSale} = useSalesCheckout({
    cart,
    subtotal,
    remainingTotal,
    payments,
    selectedCurrentAccount,
    note,
    clearCart,
    setPayments,
    setSelectedCurrentAccountId,
    setNote,
    setMessage,
    setError,
  });

  function handleClearCart() {
    const cleared = clearCart();

    if (!cleared) return;

    setPayments(emptyPayments);
    setSelectedCurrentAccountId(0);
    setNote('');
    setError('');
    setMessage('Sepet temizlendi.');
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900">Satışlar</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sepeti kontrol edin, ödeme dağılımını girin ve satışı tamamlayın.
          </p>
        </div>

        <Link
          href="/dashboard/products"
          className="w-fit rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Ürün Ekle
        </Link>
      </div>

      {message ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <SalesCartSection
          cart={cart}
          cartHydrated={cartHydrated}
          onClearCart={handleClearCart}
          onIncreaseQuantity={increaseQuantity}
          onDecreaseQuantity={decreaseQuantity}
          onRemoveItem={removeItem}
        />
        <PaymentSummarySection
          subtotal={subtotal}
          remainingTotal={remainingTotal}
          payments={payments}
          currentAccounts={currentAccounts}
          selectedCurrentAccountId={selectedCurrentAccountId}
          note={note}
          error={error}
          saving={saving}
          cartLength={cart.length}
          onFillSinglePayment={fillSinglePayment}
          onFillRemainingPayment={fillRemainingPayment}
          onPaymentInput={handlePaymentInput}
          onClearPayments={() => {
            setPayments(emptyPayments);
            setSelectedCurrentAccountId(0);
            setError('');
            setMessage('');
          }}
          onCurrentAccountChange={setSelectedCurrentAccountId}
          onNoteChange={setNote}
          onCompleteSale={completeSale}
        />
      </div>
    </div>
  );
}