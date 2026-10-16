// ENFORCEMENT - human-owned. Agents: do not edit. If a rule blocks you, add a port.
//
// Third, independent check of the ring graph (ArchUnitTS reads the TS program, not ESLint or
// dependency-cruiser config). Empty-test protection is ON (the library default; we never pass
// `allowEmptyTests`), so renaming/moving a ring folder makes these fail loudly instead of
// silently checking zero files.
import { projectFiles, type FileInfo } from 'archunit';
import { describe, expect, it } from 'vitest';

const TSCONFIG = 'tsconfig.arch.json';
const STRICT = { allowEmptyTests: false } as const;
const files = () => projectFiles(TSCONFIG);

const src = (ring: string) => `packages/${ring}/src/**`;

describe('ring dependencies', () => {
  const forbidden: Array<[from: string, to: string[]]> = [
    ['domain', ['application', 'adapters-driven', 'adapters-driving', 'composition']],
    ['application', ['adapters-driven', 'adapters-driving', 'composition']],
    ['adapters-driven', ['application', 'adapters-driving', 'composition']],
    ['adapters-driving', ['adapters-driven', 'composition']],
  ];

  for (const [from, targets] of forbidden) {
    for (const to of targets) {
      it(`${from} must not depend on ${to}`, async () => {
        const rule = files().inPath(src(from)).shouldNot().dependOnFiles().inPath(src(to));
        await expect(rule).toPassAsync(STRICT);
      });
    }
  }

  it('infra must not depend on any ring', async () => {
    const rule = files().inPath('infra/**').shouldNot().dependOnFiles().inPath('packages/**');
    await expect(rule).toPassAsync(STRICT);
  });

  it('ring sources are cycle-free', async () => {
    const rule = files().inPath('packages/*/src/**').should().haveNoCycles();
    await expect(rule).toPassAsync(STRICT);
  });
});

describe('naming and placement', () => {
  it('port files live in domain/src/ports and are named *.port.ts', async () => {
    await expect(files().withName('*.port.ts').should().beInPath('packages/domain/src/ports/**')).toPassAsync(STRICT);
    await expect(
      files().inPath('packages/domain/src/ports/**', { except: { withName: 'index.ts' } }).should().haveName('*.port.ts'),
    ).toPassAsync(STRICT);
  });

  it('every port file exports only interfaces named *Port', async () => {
    const onlyPortInterfaces = (file: FileInfo): boolean => {
      const exported = [...file.content.matchAll(/export\s+(interface|type|class|const|function|enum)\s+(\w+)/g)];
      return exported.length > 0 && exported.every(([, kind, name]) => kind === 'interface' && name!.endsWith('Port'));
    };
    const rule = files()
      .inPath('packages/domain/src/ports/**', { except: { withName: 'index.ts' } })
      .should()
      .adhereTo(onlyPortInterfaces, 'Port files must export only `interface XxxPort` declarations.');
    await expect(rule).toPassAsync(STRICT);
  });

  it('use cases live in application/src/use-cases and are named *.use-case.ts', async () => {
    await expect(files().withName('*.use-case.ts').should().beInPath('packages/application/src/use-cases/**')).toPassAsync(STRICT);
    await expect(
      files().inPath('packages/application/src/use-cases/**').should().haveName('*.use-case.ts'),
    ).toPassAsync(STRICT);
  });

  it('driven adapter files are named *.adapter.ts and implement a domain port', async () => {
    const implementsPort = (file: FileInfo): boolean =>
      /class\s+\w+\s+implements\s+\w+Port\b/.test(file.content) && /from '@hex\/domain'/.test(file.content);
    const rule = files()
      .inPath('packages/adapters-driven/src/**', { except: { withName: 'index.ts' } })
      .should()
      .adhereTo(implementsPort, 'Driven adapters must be `class X implements SomethingPort` importing the port from @hex/domain.');
    await expect(rule).toPassAsync(STRICT);
    await expect(
      files().inPath('packages/adapters-driven/src/**', { except: { withName: 'index.ts' } }).should().haveName('*.adapter.ts'),
    ).toPassAsync(STRICT);
  });

  it('driving adapter entry files are named *.adapter.ts', async () => {
    const rule = files()
      .inPath('packages/adapters-driving/src/{http,sqs}/**')
      .should()
      .haveName('*.adapter.ts');
    await expect(rule).toPassAsync(STRICT);
  });

  it('Lambda entry points live only in composition/src/lambdas', async () => {
    await expect(files().withName('*.lambda.ts').should().beInPath('packages/composition/src/lambdas/**')).toPassAsync(STRICT);
  });
});
