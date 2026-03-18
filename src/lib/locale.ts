import { getStoredRegion } from './regions';

const currentRegion = getStoredRegion();

export function formatCurrencyTZS(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(amount) ? amount : 0;
  
  return new Intl.NumberFormat(currentRegion.locale, {
    style: "currency",
    currency: currentRegion.currency,
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatNumberTZ(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(currentRegion.locale, {
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatDateTZ(value: Date | string | number) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(currentRegion.locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

