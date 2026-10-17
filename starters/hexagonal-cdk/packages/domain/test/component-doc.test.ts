import { describe, expect, it } from 'vitest';
import { normalizeComponent } from '../src/model/component-doc.js';
import { score, searchableTerms } from '../src/model/search.js';
import { toSlug } from '../src/model/slug.js';

const AT = new Date('2026-01-01T00:00:00.000Z');
const FILE = 'AbCdEf1234567890';

describe('normalizeComponent', () => {
  it('normalizes a component set with props and bound tokens', () => {
    const result = normalizeComponent(
      {
        fileKey: FILE,
        node: {
          id: '12:345',
          name: '  Button / Primary ',
          type: 'COMPONENT_SET',
          description: ' Main call to action ',
          componentPropertyDefinitions: {
            'Label#1:2': { type: 'TEXT', defaultValue: 'Click' },
            Size: { type: 'VARIANT', defaultValue: 'md', variantOptions: ['sm', 'md', 'lg'] },
          },
          boundVariables: { 'color.bg.primary': {} },
          children: [{ id: '12:346', name: 'label', type: 'TEXT', boundVariables: { 'font.body': {} } }],
        },
      },
      AT,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      id: '12:345',
      fileKey: FILE,
      name: 'Button / Primary',
      slug: 'button-primary',
      description: 'Main call to action',
      props: [
        { name: 'Label', kind: 'text', defaultValue: 'Click', options: [] },
        { name: 'Size', kind: 'variant', defaultValue: 'md', options: ['sm', 'md', 'lg'] },
      ],
      tokens: ['color.bg.primary', 'font.body'],
      indexedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it.each([
    [{ id: '1:2', name: 'Frame', type: 'FRAME' }, FILE, 'UNSUPPORTED_NODE_TYPE'],
    [{ id: 'nope', name: 'X', type: 'COMPONENT' }, FILE, 'INVALID_NODE_ID'],
    [{ id: '1:2', name: '***', type: 'COMPONENT' }, FILE, 'INVALID_NAME'],
    [{ id: '1:2', name: 'X', type: 'COMPONENT' }, 'bad key!', 'INVALID_FILE_KEY'],
  ])('rejects %j', (node, fileKey, code) => {
    const result = normalizeComponent({ fileKey, node }, AT);
    expect(result.ok ? null : result.error.code).toBe(code);
  });
});

describe('search primitives', () => {
  it('slugifies diacritics and separators', () => {
    expect(toSlug('Côté / Tab Bar')).toBe('cote-tab-bar');
  });

  it('requires every query term to match', () => {
    const doc = normalizeComponent({ fileKey: FILE, node: { id: '1:2', name: 'Icon Button', type: 'COMPONENT' } }, AT);
    if (!doc.ok) throw new Error('fixture');
    const terms = searchableTerms(doc.value);
    expect(score(terms, 'icon button')).toBeGreaterThan(0);
    expect(score(terms, 'icon toggle')).toBe(0);
    expect(score(terms, '')).toBe(0);
  });
});
