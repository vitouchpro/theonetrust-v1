/** Versioned API prefix shared by the web client and the API server. */
export const API_V1_PREFIX = '/api/v1';

/** Supported public languages. Tamil and English must stay equivalent. */
export const LOCALES = ['ta', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Stable machine-readable error envelope returned by every API error. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    correlationId: string;
  };
}

export interface HealthResponse {
  status: 'ok';
  service: 'theonetrust-api';
  version: string;
  time: string;
}
