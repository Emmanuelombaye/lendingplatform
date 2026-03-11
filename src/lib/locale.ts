export const APP_LOCALE = "sw-TZ";

export function formatCurrencyTZS(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(amount) ? amount : 0;
  // Tanzania-wide display: currency is always TZS.
  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatNumberTZ(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(APP_LOCALE, {
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatDateTZ(value: Date | string | number) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(APP_LOCALE, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

