'use client';

import { useMemo, useState } from 'react';

import { useCustomerReturns } from '@/hooks/useCustomerReturns';
import { useSupplierReturns } from '@/hooks/useSupplierReturns';

import { CustomerReturnForm } from './components/CustomerReturnForm';
import { CustomerReturnHistory } from './components/CustomerReturnHistory';
import { PendingSupplierReturns } from './components/PendingSupplierReturns';
import { SupplierReturnForm } from './components/SupplierReturnForm';
import { SupplierReturnHistory } from './components/SupplierReturnHistory';

type ReturnTab = 'SUPPLIER' | 'CUSTOMER';

function FeedbackMessage({
  message,
  error,
}: {
  message: string;
  error: string;
}) {
  return (
    <>
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
    </>
  );
}

function SupplierReturnsPanel() {
  const {
    products,
    suppliers,
    returns,
    loading,
    savingAction,
    error,
    message,
    createReturn,
    completeReturn,
    cancelReturn,
  } = useSupplierReturns();

  const pendingReturns = useMemo(
    () => returns.filter((returnDocument) => returnDocument.status === 'PENDING'),
    [returns],
  );
  const pastReturns = useMemo(
    () => returns.filter((returnDocument) => returnDocument.status !== 'PENDING'),
    [returns],
  );

  return (
    <div className="space-y-6">
      <FeedbackMessage message={message} error={error} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <PendingSupplierReturns
          returns={pendingReturns}
          loading={loading}
          savingAction={savingAction}
          onComplete={completeReturn}
          onCancel={cancelReturn}
        />

        <SupplierReturnForm
          products={products}
          suppliers={suppliers}
          savingAction={savingAction}
          createReturn={createReturn}
        />
      </div>

      <SupplierReturnHistory returns={pastReturns} />
    </div>
  );
}

function CustomerReturnsPanel() {
  const {
    sales,
    customers,
    returns,
    loading,
    saving,
    error,
    message,
    createReturn,
  } = useCustomerReturns();

  return (
    <div className="space-y-6">
      <FeedbackMessage message={message} error={error} />

      <CustomerReturnForm
        customers={customers}
        sales={sales}
        returns={returns}
        saving={saving}
        createReturn={createReturn}
      />

      <CustomerReturnHistory returns={returns} loading={loading} />
    </div>
  );
}

export default function ReturnsPage() {
  const [activeTab, setActiveTab] = useState<ReturnTab>('SUPPLIER');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-900">İadeler</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Müşteriden gelen ürünleri satış belgesiyle stoğa alın veya
          tedarikçiye gönderilecek ürünleri takip edin.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('SUPPLIER')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'SUPPLIER'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Tedarikçi İadeleri
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CUSTOMER')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'CUSTOMER'
              ? 'bg-red-600 text-white'
              : 'text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          Müşteri İadeleri
        </button>
      </div>

      {activeTab === 'SUPPLIER' ? (
        <SupplierReturnsPanel />
      ) : (
        <CustomerReturnsPanel />
      )}
    </div>
  );
}
