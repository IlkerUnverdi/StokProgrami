

'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';

type SystemUser = {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
};

type UserFormState = {
  username: string;
  password: string;
  role: string;
};

const emptyForm: UserFormState = {
  username: '',
  password: '',
  role: 'USER',
};

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const rawMessage = err.response?.data?.message;

    if (typeof rawMessage === 'string') return rawMessage;
    if (Array.isArray(rawMessage)) return rawMessage.join(', ');
  }

  return fallback;
}

export function useUsers() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr');

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.username.toLocaleLowerCase('tr').includes(query) ||
        user.role.toLocaleLowerCase('tr').includes(query)
      );
    });
  }, [users, search]);

  async function loadUsers() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get<SystemUser[]>('/users');
      setUsers(response.data ?? []);
    } catch (err) {
      console.error('LOAD USERS ERROR:', err);
      setError(getErrorMessage(err, 'Kullanıcılar yüklenemedi.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  function updateField<K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const username = form.username.trim();
    const password = form.password.trim();

    if (!username) {
      setError('Kullanıcı adı zorunludur.');
      setSaving(false);
      return;
    }

    if (!password) {
      setError('Şifre zorunludur.');
      setSaving(false);
      return;
    }

    try {
      await api.post('/users', {
        username,
        password,
        role: form.role,
      });

      setForm(emptyForm);
      setMessage('Kullanıcı oluşturuldu.');
      await loadUsers();
    } catch (err) {
      console.error('CREATE USER ERROR:', err);
      setError(getErrorMessage(err, 'Kullanıcı oluşturulamadı.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: SystemUser) {
    if (user.username.toLocaleLowerCase('tr') === 'admin') {
      setError('Admin kullanıcısı silinemez.');
      return;
    }

    const confirmed = window.confirm(`${user.username} kullanıcısı silinsin mi?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await api.delete(`/users/${user.id}`);
      setMessage('Kullanıcı silindi.');
      await loadUsers();
    } catch (err) {
      console.error('DELETE USER ERROR:', err);
      setError(getErrorMessage(err, 'Kullanıcı silinemedi.'));
    } finally {
      setSaving(false);
    }
  }

  return {
    users,
    visibleUsers,
    form,
    search,
    loading,
    saving,
    error,
    message,

    setSearch,
    setError,
    setMessage,
    setForm,

    loadUsers,
    updateField,
    handleSubmit,
    deleteUser,
  };
}