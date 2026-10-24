import { describe, it, expect } from 'vitest';
import { oneOf, intInRange } from '../search-params';

const COLORS = ['red', 'green', 'blue'] as const;

describe('oneOf', () => {
  it.each(COLORS)('passes through allowed value %s', (value) => {
    expect(oneOf(COLORS, value, 'red')).toBe(value);
  });

  it.each([
    'toString',
    'constructor',
    '__proto__',
    'hasOwnProperty',
    '',
    'valueOf',
    'RED',
  ])('falls back for string %s', (value) => {
    expect(oneOf(COLORS, value, 'red')).toBe('red');
  });

  it.each([42, null, undefined, true, {}, []])('falls back for non-string %p', (value) => {
    expect(oneOf(COLORS, value, 'red')).toBe('red');
  });

  it('returns the fallback when the value is missing', () => {
    expect(oneOf(COLORS, undefined, 'green')).toBe('green');
  });
});

describe('intInRange', () => {
  it('accepts whole numbers as numbers', () => {
    expect(intInRange(120, 20, 300, 90)).toBe(120);
  });

  it('accepts whole numbers as strings', () => {
    expect(intInRange('120', 20, 300, 90)).toBe(120);
  });

  it('accepts the range boundaries', () => {
    expect(intInRange(20, 20, 300, 90)).toBe(20);
    expect(intInRange('300', 20, 300, 90)).toBe(300);
  });

  it.each([
    ['abc', 'non-numeric'],
    ['', 'empty'],
    ['12.5', 'fraction as string'],
    [12.5, 'fraction as number'],
    [9999, 'above range'],
    [19, 'below range'],
    [NaN, 'NaN'],
    [Infinity, 'Infinity'],
    [null, 'null'],
    [undefined, 'undefined'],
    [true, 'boolean'],
    [{}, 'object'],
    [[], 'array'],
  ])('falls back for %p (%s)', (value, _label) => {
    expect(intInRange(value, 20, 300, 90)).toBe(90);
  });
});
