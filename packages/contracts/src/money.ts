/**
 * Money is always stored and transported as integer paise (1 rupee = 100 paise).
 * Never use floating-point rupees for amounts.
 */
export type Paise = number & { readonly __brand: 'Paise' };

export const PAISE_PER_RUPEE = 100;

export class InvalidAmountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAmountError';
  }
}

/** Validates an integer paise amount (positive, safe integer). */
export function toPaise(value: number): Paise {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new InvalidAmountError(`Amount must be a positive whole number of paise, got ${value}`);
  }
  return value as Paise;
}

/** Converts whole rupees (e.g. from a quick-pick button) to paise. */
export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isSafeInteger(rupees) || rupees <= 0) {
    throw new InvalidAmountError(`Rupee amount must be a positive whole number, got ${rupees}`);
  }
  return toPaise(rupees * PAISE_PER_RUPEE);
}

/** Formats paise as an Indian-grouped INR string, e.g. 150000 -> "₹1,500". */
export function formatInr(paise: Paise, locale: 'en-IN' | 'ta-IN' = 'en-IN'): string {
  const rupees = paise / PAISE_PER_RUPEE;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}
