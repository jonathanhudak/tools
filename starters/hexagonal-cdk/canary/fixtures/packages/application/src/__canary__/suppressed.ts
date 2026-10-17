// CANARY: trying to silence the rails with directive comments.
/* eslint-disable */
// eslint-disable-next-line no-restricted-properties
export const now = (): number => Date.now();

// @ts-ignore
export const n: number = 'not a number';
