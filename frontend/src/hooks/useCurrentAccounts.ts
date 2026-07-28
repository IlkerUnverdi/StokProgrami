'use client';

import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import type {
  AccountWithBalance,
  CurrentAccount,
  CurrentAccountDetail,
  CurrentAccountFormState,
} from '@/types/currentAccount';
import { getErrorMessage } from '@/utils/apiError';

const emptyForm: CurrentAccountFormState = {
  name: '',
  phone: '',
  taxNumber: '',
  address: '',
  type: 'CUSTOMER',
  isActive: true,
};

export function useCurrentAccounts() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [selectedAccount, setSelectedAccount] =
    useState<CurrentAccountDetail | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [form, setForm] = useState<CurrentAccountFormState>(emptyForm);
  const [selectedBalance, setSelectedBalance] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function fetchAccounts() {
    setLoading(true);
    setError('');

    try {
      const res = await api.get<CurrentAccount[]>('/current-accounts');

      const accountsWithBalance = await Promise.all(
        res.data.map(async (account) => {
          const balanceRes = await api.get<{ balance: number }>(
            `/current-accounts/${account.id}/balance`,
          );

          return {
            ...account,
            balance: Number(balanceRes.data.balance ?? 0),
          };
        }),
      );

      setAccounts(accountsWithBalance);
    } catch (err: unknown) {
      console.error('CURRENT ACCOUNTS LOAD ERROR:', err);
      setError(getErrorMessage(err) || 'Cariler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }

  async function selectAccount(account: AccountWithBalance) {
    setSelectedAccount(null);
    setSelectedBalance(account.balance);
    setDetailLoading(true);
    setError('');
    setMessage('');

    try {
      const [detailRes, balanceRes] = await Promise.all([
        api.get<CurrentAccountDetail>(`/current-accounts/${account.id}`),
        api.get<{ balance: number }>(`/current-accounts/${account.id}/balance`),
      ]);

      setSelectedAccount(detailRes.data);
      setSelectedBalance(Number(balanceRes.data.balance ?? 0));
    } catch (err: unknown) {
      console.error('CURRENT ACCOUNT DETAIL ERROR:', err);
      setError(getErrorMessage(err) || 'Cari detayı yüklenemedi.');
    } finally {
      setDetailLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setSelectedAccountId(null);
    setFormMode('create');
    setMessage('');
    setError('');
  }

  function selectAccountForEdit(account: CurrentAccount) {
    setSelectedAccountId(account.id);
    setFormMode('edit');
    setForm({
      name: account.name ?? '',
      phone: account.phone ?? '',
      taxNumber: account.taxNumber ?? '',
      address: account.address ?? '',
      type: account.type,
      isActive: account.isActive,
    });
    setMessage('');
    setError('');
  }

  function updateForm<K extends keyof CurrentAccountFormState>(key: K, value: CurrentAccountFormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSave() {
    setError('');
    setMessage('');

    if (!form.name.trim()) {
      setError('Cari adı zorunludur.');
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      taxNumber: form.taxNumber.trim() || undefined,
      address: form.address.trim() || undefined,
      type: form.type,
      isActive: form.isActive,
    };

    try {
      if (formMode === 'edit' && selectedAccountId !== null) {
        await api.patch(`/current-accounts/${selectedAccountId}`, payload);
        setMessage('Cari başarıyla güncellendi.');
      } else {
        await api.post('/current-accounts', payload);
        setMessage('Cari başarıyla oluşturuldu.');
      }

      await fetchAccounts();
      resetForm();
    } catch (err: unknown) {
      console.error('SAVE CURRENT ACCOUNT ERROR', err);
      setError(getErrorMessage(err) || 'Cari kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('tr');

    if (!q) return accounts;

    return accounts.filter((account) => {
      return (
        account.name.toLocaleLowerCase('tr').includes(q) ||
        (account.phone ?? '').toLocaleLowerCase('tr').includes(q) ||
        (account.taxNumber ?? '').toLocaleLowerCase('tr').includes(q)
      );
    });
  }, [accounts, search]);

  const customerReceivable = useMemo(() => {
    return accounts
      .filter((account) => account.type === 'CUSTOMER')
      .reduce((sum, account) => sum + Math.max(account.balance, 0), 0);
  }, [accounts]);

  const supplierDebt = useMemo(() => {
    return accounts
      .filter((account) => account.type === 'SUPPLIER')
      .reduce((sum, account) => sum + Math.max(account.balance, 0), 0);
  }, [accounts]);

  const totalCredit = useMemo(() => {
    return accounts.reduce(
      (sum, account) => sum + Math.abs(Math.min(account.balance, 0)),
      0,
    );
  }, [accounts]);

  return {
    accounts,
    selectedAccount,
    selectedAccountId,
    formMode,
    form,
    selectedBalance,
    search,
    loading,
    detailLoading,
    saving,
    message,
    error,
    filteredAccounts,
    customerReceivable,
    supplierDebt,
    totalCredit,
    setSearch,
    setMessage,
    setError,
    setSelectedBalance,
    setForm,
    setSelectedAccountId,
    setFormMode,
    fetchAccounts,
    selectAccount,
    resetForm,
    selectAccountForEdit,
    updateForm,
    handleSave,
  };
}