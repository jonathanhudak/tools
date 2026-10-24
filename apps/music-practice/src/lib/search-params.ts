/**
 * Shared helpers for validating route search params.
 *
 * Values that arrive from a URL are untrusted: they can be missing, the wrong
 * type, or an inherited object property. Both helpers always return a value
 * that is valid for the page, so a bad link falls back to the default instead
 * of crashing.
 */

/** Instruments offered by the instrument toggle, shared by every page that uses it. */
export const INSTRUMENTS = ['guitar', 'banjo', 'piano'] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

/**
 * Return `value` when it is one of `allowed`, otherwise `fallback`.
 *
 * Uses `Array.prototype.includes` so inherited object names such as
 * `toString`, `constructor` or `__proto__` are rejected.
 */
export function oneOf<T extends string>(allowed: readonly T[], value: unknown, fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * Return `value` as a whole number inside `[min, max]`, otherwise `fallback`.
 *
 * The router's JSON parser hands `?bpm=120` over as the number `120`, but links
 * are sometimes built with the string `"120"`, so both forms are accepted.
 */
export function intInRange(value: unknown, min: number, max: number, fallback: number): number {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN;
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}
