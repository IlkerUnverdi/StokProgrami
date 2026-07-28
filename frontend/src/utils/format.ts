// frontend/src/utils/format.ts

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function formatPrice(value: number | string) {
  return `${Number(value).toFixed(2)} ₺`;
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('tr-TR');
}

export function toNumberPrice(value: number | string) {
  return Number(value || 0);
}