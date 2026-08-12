export type CardBrand = 'VISA' | 'MASTERCARD' | 'ELO';

const ELO_PREFIXES = ['636368', '438935', '504175', '451416', '636297', '5067', '4576', '4011', '506699', '509'];

export function detectCardBrand(digits: string): CardBrand | null {
  if (!digits) return null;
  if (ELO_PREFIXES.some((prefix) => digits.startsWith(prefix))) return 'ELO';
  if (/^4/.test(digits)) return 'VISA';
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(digits)) return 'MASTERCARD';
  return null;
}
