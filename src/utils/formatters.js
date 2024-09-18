import { format, formatDistanceToNow } from 'date-fns';
import { enUS, pl } from 'date-fns/locale';

const locales = { enUS, pl };

export function formatNumber(number, options = {}) {
  const {
    locale = 'en-US',
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard'
  } = options;

  return new Intl.NumberFormat(locale, {
    style,
    minimumFractionDigits,
    maximumFractionDigits,
    notation
  }).format(number);
}

export function formatCurrency(amount, options = {}) {
  const {
    currency = 'USD',
    locale = 'en-US'
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatDate(date, formatStr = 'PP', options = {}) {
  const { locale = 'enUS' } = options;
  return format(date, formatStr, {
    locale: locales[locale]
  });
}

export function formatRelativeTime(date, options = {}) {
  const { locale = 'enUS', addSuffix = true } = options;
  return formatDistanceToNow(date, {
    addSuffix,
    locale: locales[locale]
  });
}

export function truncateText(text, maxLength = 100, ellipsis = '...') {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}