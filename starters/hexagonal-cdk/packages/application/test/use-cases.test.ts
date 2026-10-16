import { FixedClock, InMemoryComponentRepo, InMemorySearchIndex } from '@hex/adapters-driven/in-memory';
import type { FigmaComponentInput } from '@hex/domain';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndexComponent } from '../src/use-cases/index-component.use-case.js';
import { SearchComponents } from '../src/use-cases/search-components.use-case.js';

const FILE = 'AbCdEf1234567890';
const component = (id: string, name: string, description = ''): FigmaComponentInput => ({
  fileKey: FILE,
  node: { id, name, type: 'COMPONENT', description },
});

describe('IndexComponent + SearchComponents', () => {
  let repo: InMemoryComponentRepo;
  let index: InMemorySearchIndex;
  let clock: FixedClock;
  let indexComponent: IndexComponent;
  let search: SearchComponents;

  beforeEach(() => {
    repo = new InMemoryComponentRepo();
    index = new InMemorySearchIndex();
    clock = new FixedClock(new Date('2026-05-01T12:00:00.000Z'));
    indexComponent = new IndexComponent({ repo, index, clock });
    search = new SearchComponents({ repo, index });
  });

  it('stores the normalized doc stamped with the clock time', async () => {
    const result = await indexComponent.execute(component('1:1', 'Button'));
    expect(result.ok && result.value.indexedAt).toBe('2026-05-01T12:00:00.000Z');
    expect(repo.size()).toBe(1);
  });

  it('does not store or index invalid nodes', async () => {
    const result = await indexComponent.execute({ fileKey: FILE, node: { id: '1:1', name: 'x', type: 'FRAME' } });
    expect(result.ok).toBe(false);
    expect(repo.size()).toBe(0);
    expect(await search.execute({ query: 'x' })).toEqual([]);
  });

  it('ranks name matches above description matches', async () => {
    await indexComponent.execute(component('1:1', 'Card', 'Container that can hold a button'));
    await indexComponent.execute(component('1:2', 'Button'));
    await indexComponent.execute(component('1:3', 'Avatar'));
    const results = await search.execute({ query: 'button' });
    expect(results.map((r) => r.doc.name)).toEqual(['Button', 'Card']);
  });

  it('re-indexing replaces the previous version', async () => {
    await indexComponent.execute(component('1:1', 'Chip'));
    clock.advance(60_000);
    await indexComponent.execute(component('1:1', 'Tag'));
    expect(await search.execute({ query: 'chip' })).toEqual([]);
    const [hit] = await search.execute({ query: 'tag' });
    expect(hit?.doc.indexedAt).toBe('2026-05-01T12:01:00.000Z');
  });

  it('clamps the limit', async () => {
    for (let i = 0; i < 60; i++) await indexComponent.execute(component(`2:${i}`, `Icon ${i}`));
    expect(await search.execute({ query: 'icon', limit: 1000 })).toHaveLength(50);
    expect(await search.execute({ query: 'icon', limit: 0 })).toHaveLength(1);
  });
});
