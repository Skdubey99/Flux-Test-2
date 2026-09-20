import { CurrencyConfig } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', locale: 'en-US', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', label: 'Japanese Yen (¥)' },
];

export const DEFAULT_CURRENCY = CURRENCIES[0];

export function formatCurrency(amount: number, currency: CurrencyConfig = DEFAULT_CURRENCY): string {
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
}
