// ENFORCEMENT CONFIG - human-owned. Agents: do not edit. If a rule blocks you, add a port.
// Independent second opinion on the ring graph (does not share code or config with ESLint).
/** @type {import('dependency-cruiser').IConfiguration} */

const SRC = (ring) => `^packages/${ring}/src/`;
const TEST = `^packages/[^/]+/test/`;
const ADVICE_PORT = 'Define a port interface in packages/domain/src/ports/<name>.port.ts, implement it in packages/adapters-driven, and wire it in packages/composition.';

module.exports = {
  forbidden: [
    // ---- graph hygiene -------------------------------------------------------
    { name: 'no-circular', severity: 'error', comment: 'Circular imports. Extract the shared piece into a third module (in the innermost ring that needs it).', from: {}, to: { circular: true } },
    {
      name: 'no-orphans',
      severity: 'error',
      comment: 'Module is not reachable from anything and imports nothing. Wire it in (export it from the ring index) or delete it.',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', 'tsconfig[.a-z]*\\.json$', '(vitest|eslint)\\.config\\.[cm]?[jt]s$'] },
      to: {},
    },
    { name: 'not-to-unresolvable', severity: 'error', comment: 'Import does not resolve. In this workspace that usually means the package is not declared in this ring\'s package.json - and it is probably not allowed here anyway.', from: {}, to: { couldNotResolve: true } },
    { name: 'no-undeclared-deps', severity: 'error', comment: 'Dependency is not declared in the nearest package.json.', from: {}, to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] } },
    { name: 'src-not-to-dev-dep', severity: 'error', comment: 'Production code imports a devDependency. Tests-only helpers (in-memory adapters, vitest) must not leak into src.', from: { path: '^packages/[^/]+/src/' }, to: { dependencyTypes: ['npm-dev'], dependencyTypesNot: ['type-only'] } },

    // ---- rings ---------------------------------------------------------------
    {
      name: 'domain-is-pure',
      severity: 'error',
      comment: `domain must not import anything outside packages/domain/src (no rings, no npm, no node builtins). ${ADVICE_PORT}`,
      from: { path: SRC('domain') },
      to: { pathNot: SRC('domain') },
    },
    {
      name: 'application-only-domain',
      severity: 'error',
      comment: `application may import only @hex/domain. ${ADVICE_PORT}`,
      from: { path: SRC('application') },
      to: { pathNot: [SRC('application'), SRC('domain')] },
    },
    {
      name: 'adapters-driven-allowed',
      severity: 'error',
      comment: 'adapters-driven may import only @hex/domain and @aws-sdk/*. Never application or adapters-driving.',
      from: { path: SRC('adapters-driven') },
      to: { pathNot: [SRC('adapters-driven'), SRC('domain'), 'node_modules/@aws-sdk/'], dependencyTypesNot: ['core'] },
    },
    {
      name: 'adapters-driven-no-core-modules',
      severity: 'error',
      comment: 'adapters-driven talks to infrastructure through SDK clients only; no raw node builtins.',
      from: { path: SRC('adapters-driven') },
      to: { dependencyTypes: ['core'] },
    },
    {
      name: 'adapters-driving-allowed',
      severity: 'error',
      comment: 'adapters-driving may import only @hex/application, @hex/domain and (type-only) aws-lambda. Wiring of driven adapters belongs in packages/composition.',
      from: { path: SRC('adapters-driving') },
      to: { pathNot: [SRC('adapters-driving'), SRC('application'), SRC('domain'), 'node_modules/@types/aws-lambda/'] },
    },
    {
      name: 'no-adapter-cross-imports-driving-to-driven',
      severity: 'error',
      comment: 'adapters-driving must not import adapters-driven. Only packages/composition may see both adapter packages.',
      from: { path: '^packages/adapters-driving/' },
      to: { path: '^packages/adapters-driven/' },
    },
    {
      name: 'no-adapter-cross-imports-driven-to-driving',
      severity: 'error',
      comment: 'adapters-driven must not import adapters-driving. Only packages/composition may see both adapter packages.',
      from: { path: '^packages/adapters-driven/' },
      to: { path: '^packages/adapters-driving/' },
    },
    {
      name: 'only-composition-imports-driven-adapters',
      severity: 'error',
      comment: 'Only packages/composition may import adapters-driven (application tests may import the in-memory subpath).',
      from: { pathNot: ['^packages/composition/', '^packages/adapters-driven/', '^packages/application/test/'] },
      to: { path: SRC('adapters-driven') },
    },
    {
      name: 'application-tests-use-in-memory-only',
      severity: 'error',
      comment: 'Application tests may use only the in-memory adapters (@hex/adapters-driven/in-memory).',
      from: { path: '^packages/application/test/' },
      to: { path: SRC('adapters-driven'), pathNot: `${SRC('adapters-driven')}(in-memory|clock/fixed-clock)` },
    },
    {
      name: 'only-composition-imports-driving-adapters',
      severity: 'error',
      comment: 'Only packages/composition may import adapters-driving.',
      from: { pathNot: ['^packages/composition/', '^packages/adapters-driving/'] },
      to: { path: SRC('adapters-driving') },
    },
    {
      name: 'nothing-imports-composition',
      severity: 'error',
      comment: 'composition is the outermost ring; nothing depends on it (except its own tests).',
      from: { pathNot: '^packages/composition/' },
      to: { path: SRC('composition') },
    },
    {
      name: 'infra-does-not-import-rings',
      severity: 'error',
      comment: 'infra references Lambda entry points by file path; it must never import ring code.',
      from: { path: '^infra/' },
      to: { path: '^packages/' },
    },
    {
      name: 'tests-not-imported-from-src',
      severity: 'error',
      comment: 'Production code must not import test files.',
      from: { path: '^packages/[^/]+/src/' },
      to: { path: TEST },
    },
  ],
  options: {
    doNotFollow: { path: ['node_modules'] },
    exclude: { path: ['(^|/)(dist|dist-test|dist-tooling|cdk\\.out)/', '^canary/'] },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    combinedDependencies: false,
    preserveSymlinks: false,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'types', 'node', 'default'],
      extensions: ['.ts', '.js', '.mjs', '.cjs', '.d.ts'],
      mainFields: ['types', 'module', 'main'],
    },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
