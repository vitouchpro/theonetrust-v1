/**
 * Normalised donation status owned by the backend. Only a verified captured
 * payment may become PAID. See PROJECT_SPEC.md §6 "Payment state model".
 */
export const DONATION_STATUSES = [
  'CREATED',
  'PENDING',
  'AUTHORIZED',
  'PAID',
  'FAILED',
  'REFUND_PENDING',
  'REFUNDED',
  'MANUAL_REVIEW',
] as const;
export type DonationStatus = (typeof DONATION_STATUSES)[number];

/** Statuses after which no automatic transition may move the donation backwards. */
export const TERMINAL_DONATION_STATUSES: readonly DonationStatus[] = ['FAILED', 'REFUNDED'];

export function isDonationStatus(value: unknown): value is DonationStatus {
  return typeof value === 'string' && (DONATION_STATUSES as readonly string[]).includes(value);
}

/** Help-request case inbox statuses (plan PDF §5). */
export const HELP_REQUEST_STATUSES = [
  'NEW',
  'CONTACTED',
  'VERIFYING',
  'HELPING',
  'CLOSED',
] as const;
export type HelpRequestStatus = (typeof HELP_REQUEST_STATUSES)[number];

/** Statutory tax certificate tracking — the website never issues Form 114 itself. */
export const TAX_CERTIFICATE_STATUSES = [
  'NOT_APPLICABLE',
  'PENDING_TRUST_FILING',
  'FORM_113_FILED',
  'FORM_114_ISSUED',
  'CORRECTION_REQUIRED',
] as const;
export type TaxCertificateStatus = (typeof TAX_CERTIFICATE_STATUSES)[number];
