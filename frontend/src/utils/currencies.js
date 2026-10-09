/**
 * Devises supportées par MakeInvoice.
 * `code` = ISO 4217 (utilisé en base)
 * `symbol` = symbole d'affichage
 * `locale` = locale pour Intl.NumberFormat
 * `decimals` = nombre de décimales (0 pour FCFA, 2 pour EUR/USD)
 */
export const CURRENCIES = {
  XOF: { code: 'XOF', symbol: 'FCFA', locale: 'fr-SN', decimals: 0, label: 'FCFA (XOF)' },
  XAF: { code: 'XAF', symbol: 'FCFA', locale: 'fr-CM', decimals: 0, label: 'FCFA Central (XAF)' },
  EUR: { code: 'EUR', symbol: '€',    locale: 'fr-FR', decimals: 2, label: 'Euro (EUR)' },
  USD: { code: 'USD', symbol: '$',    locale: 'en-US', decimals: 2, label: 'US Dollar (USD)' },
  GBP: { code: 'GBP', symbol: '£',    locale: 'en-GB', decimals: 2, label: 'Pound Sterling (GBP)' },
  CAD: { code: 'CAD', symbol: 'C$',   locale: 'en-CA', decimals: 2, label: 'Canadian Dollar (CAD)' },
  MAD: { code: 'MAD', symbol: 'DH',   locale: 'fr-MA', decimals: 2, label: 'Dirham (MAD)' },
  NGN: { code: 'NGN', symbol: '₦',    locale: 'en-NG', decimals: 0, label: 'Naira (NGN)' },
  GHS: { code: 'GHS', symbol: 'GH₵',  locale: 'en-GH', decimals: 2, label: 'Cedi (GHS)' },
};

export const DEFAULT_CURRENCY = 'XOF';

export const CURRENCY_OPTIONS = Object.values(CURRENCIES);

/**
 * Formate un montant selon la devise choisie.
 * Ex: "50 000 FCFA" ou "€1,250.00" ou "$1,250.00"
 */
export function formatMoney(amount, currencyCode = DEFAULT_CURRENCY) {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const n = Number(amount);
  if (isNaN(n)) {
    return `0 ${currency.symbol}`;
  }

  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(n);

  // FCFA, MAD, NGN : symbole après le montant
  // EUR, USD, GBP, CAD, GHS : symbole avant
  const symbolAfter = ['XOF', 'XAF', 'MAD', 'NGN'].includes(currency.code);

  return symbolAfter
    ? `${formatted} ${currency.symbol}`
    : `${currency.symbol}${formatted}`;
}