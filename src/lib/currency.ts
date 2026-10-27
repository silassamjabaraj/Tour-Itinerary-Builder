import { CurrencyMaster } from '../types';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  exchangeRateToBase: number; // 1 INR (Base) = X Currency
  decimalPlaces: number;
  flag: string;
}

export const DEFAULT_CURRENCIES: CurrencyInfo[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRateToBase: 1.0, decimalPlaces: 2, flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRateToBase: 0.012, decimalPlaces: 2, flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRateToBase: 0.011, decimalPlaces: 2, flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRateToBase: 0.0093, decimalPlaces: 2, flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', exchangeRateToBase: 0.044, decimalPlaces: 2, flag: '🇦🇪' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRateToBase: 0.016, decimalPlaces: 2, flag: '🇸🇬' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', exchangeRateToBase: 0.018, decimalPlaces: 2, flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', exchangeRateToBase: 0.016, decimalPlaces: 2, flag: '🇨🇦' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR ', exchangeRateToBase: 0.045, decimalPlaces: 2, flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR ', exchangeRateToBase: 0.044, decimalPlaces: 2, flag: '🇶🇦' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRateToBase: 1.85, decimalPlaces: 0, flag: '🇯🇵' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', exchangeRateToBase: 0.42, decimalPlaces: 2, flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM ', exchangeRateToBase: 0.056, decimalPlaces: 2, flag: '🇲🇾' },
];

export function getCurrencySymbol(currencyCode: string = 'INR', customCurrencies?: CurrencyMaster[]): string {
  const code = (currencyCode || 'INR').toUpperCase();
  if (customCurrencies) {
    const custom = customCurrencies.find((c) => c.code.toUpperCase() === code);
    if (custom) return custom.symbol;
  }

  const found = DEFAULT_CURRENCIES.find((c) => c.code === code);
  if (found) return found.symbol;

  switch (code) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'AED': return 'AED ';
    case 'SGD': return 'S$';
    case 'AUD': return 'A$';
    case 'CAD': return 'C$';
    case 'SAR': return 'SAR ';
    case 'QAR': return 'QAR ';
    case 'JPY': return '¥';
    case 'THB': return '฿';
    case 'MYR': return 'RM ';
    default: return `${code} `;
  }
}

export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: string = 'INR',
  options: {
    decimals?: number;
    showCode?: boolean;
    customCurrencies?: CurrencyMaster[];
  } = {}
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${getCurrencySymbol(currencyCode, options.customCurrencies)}0`;
  }

  const code = (currencyCode || 'INR').toUpperCase();
  const symbol = getCurrencySymbol(code, options.customCurrencies);

  let decimals = options.decimals;
  if (decimals === undefined) {
    if (code === 'JPY' || code === 'KRW') {
      decimals = 0;
    } else {
      decimals = Math.abs(amount) < 1000 && amount % 1 !== 0 ? 2 : 0;
    }
  }

  const formattedNum = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options.showCode && code !== 'INR' && !symbol.includes(code)) {
    return `${symbol}${formattedNum} ${code}`;
  }

  return `${symbol}${formattedNum}`;
}

export function getExchangeRateBetween(
  fromCurrency: string,
  toCurrency: string,
  currenciesList: CurrencyMaster[] = []
): number {
  const from = (fromCurrency || 'INR').toUpperCase();
  const to = (toCurrency || 'INR').toUpperCase();

  if (from === to) return 1.0;

  // Rate to base (e.g. 1 Base INR = X Currency)
  const getRateToBase = (code: string): number => {
    const custom = currenciesList.find((c) => c.code.toUpperCase() === code);
    if (custom) return custom.exchangeRateToBase || 1;

    const def = DEFAULT_CURRENCIES.find((c) => c.code === code);
    if (def) return def.exchangeRateToBase;

    return 1;
  };

  const fromRate = getRateToBase(from);
  const toRate = getRateToBase(to);

  if (fromRate === 0) return 1.0;
  return toRate / fromRate;
}

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  currenciesList: CurrencyMaster[] = []
): number {
  if (!amount || fromCurrency === toCurrency) return amount;
  const rate = getExchangeRateBetween(fromCurrency, toCurrency, currenciesList);
  return amount * rate;
}
