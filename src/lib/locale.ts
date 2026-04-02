export const formatCurrencyTZS = (amount: number): string => {
  return `TZS ${formatNumberTZ(amount)}`;
};

export const formatNumberTZ = (amount: number): string => {
  return new Intl.NumberFormat('en-TZ').format(Math.round(amount));
};

export const formatDateTZ = (date: string | Date): string => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('en-TZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};
