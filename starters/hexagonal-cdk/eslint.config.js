// ENFORCEMENT CONFIG - human-owned. Agents: do not edit. If a rule blocks you, add a port.
//
// Layers enforced here:
//   1. eslint-plugin-boundaries: ring-to-ring and ring-to-npm-package dependency policy (default: disallow)
//   2. no-unknown-files: every linted file must belong to a known ring
//   3. core purity: no I/O, time, randomness, or env in domain/application
//   4. anti-tamper: no eslint directive comments, no @ts-ignore / @ts-nocheck
import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

const TS = ['**/*.ts'];
const ALL = ['**/*.{ts,js,mjs,cjs}'];

/** Where things go. `partialMatch: false` = pattern is matched from the starter root. */
const elements = [
  { type: 'domain', pattern: 'packages/domain/src', partialMatch: false },
  { type: 'application', pattern: 'packages/application/src', partialMatch: false },
  { type: 'adapters-driven', pattern: 'packages/adapters-driven/src', partialMatch: false },
  { type: 'adapters-driving', pattern: 'packages/adapters-driving/src', partialMatch: false },
  { type: 'composition', pattern: 'packages/composition/src', partialMatch: false },
  { type: 'test', pattern: 'packages/*/test', capture: ['ring'], partialMatch: false },
  { type: 'infra', pattern: 'infra/{bin,lib}', partialMatch: false },
  { type: 'arch', pattern: 'arch', partialMatch: false },
  { type: 'scripts', pattern: 'scripts', partialMatch: false },
  { type: 'scripts', pattern: '.claude/hooks', partialMatch: false },
];

const ring = (type) => ({ element: { type } });
const rings = (...types) => types.map(ring);
const npm = (source) => ({ module: { origin: 'external', source } });
const core = { module: { origin: 'core' } };

const FIX = {
  domain:
    'domain is the innermost ring and imports NOTHING outside itself (no other ring, no npm package, no node builtin). ' +
    'If you need a capability (storage, search, time, HTTP, randomness), define a port interface in packages/domain/src/ports/<name>.port.ts ' +
    'and implement it in packages/adapters-driven; the composition root injects it.',
  application:
    'application may import only @hex/domain. Use cases depend on port interfaces, never on adapters or SDKs. ' +
    'Add/extend a port in packages/domain/src/ports, accept it via the use case constructor, implement it in adapters-driven, wire it in composition.',
  'adapters-driven':
    'adapters-driven may import only @hex/domain (to implement its ports) and infrastructure SDKs (@aws-sdk/*). ' +
    'It must never import application or adapters-driving; if two adapters need shared logic, move the pure part into domain.',
  'adapters-driving':
    'adapters-driving may import only @hex/application, @hex/domain and type-only aws-lambda. ' +
    'It receives constructed use cases as arguments; it must not import adapters-driven - wiring belongs in packages/composition.',
  composition:
    'composition wires rings together. It may import any ring and @aws-sdk/client-s3, but nothing may import composition except tests.',
  infra:
    'infra (CDK) may import only aws-cdk-lib, constructs and node builtins. Reference Lambda code by file path (see lambdaEntry), never import ring code.',
  test: 'tests may import their own ring, @hex/domain, vitest, and the in-memory adapters via @hex/adapters-driven/in-memory. Do not use mocking libraries.',
};

/** Allow-list policies. Anything not allowed here is a violation (default: disallow). */
const allowPolicies = [
  // domain: no allow entries at all -> it can only use files inside itself.
  { from: ring('application'), allow: { to: ring('domain') } },
  { from: ring('adapters-driven'), allow: { to: [ring('domain'), npm('@aws-sdk/*')] } },
  {
    from: ring('adapters-driving'),
    allow: [{ to: rings('application', 'domain') }, { to: npm('aws-lambda'), dependency: { kind: 'type' } }],
  },
  {
    from: ring('composition'),
    allow: { to: [...rings('domain', 'application', 'adapters-driven', 'adapters-driving'), npm('@aws-sdk/client-s3')] },
  },
  { from: ring('infra'), allow: { to: [ring('infra'), npm('aws-cdk-lib'), npm('constructs'), core] } },
  { from: ring('test'), allow: { to: [ring('domain'), npm('vitest')] } },
  { from: { element: { type: 'test', captured: { ring: 'domain' } } }, allow: { to: ring('domain') } },
  { from: { element: { type: 'test', captured: { ring: 'application' } } }, allow: { to: ring('application') } },
  {
    from: { element: { type: 'test', captured: { ring: 'application' } } },
    allow: { to: { element: { type: 'adapters-driven', fileInternalPath: 'in-memory/index.ts' } } },
  },
  { from: { element: { type: 'test', captured: { ring: 'adapters-driven' } } }, allow: { to: ring('adapters-driven') } },
  {
    from: { element: { type: 'test', captured: { ring: 'composition' } } },
    allow: {
      to: [...rings('composition', 'adapters-driven', 'adapters-driving'), { module: { origin: 'external', source: 'aws-lambda' } }],
    },
  },
  { from: ring('arch'), allow: { to: [npm('archunit'), npm('vitest'), core, ring('arch')] } },
  { from: ring('scripts'), allow: { to: core } },
];

/**
 * Per-ring catch-all disallow policies. They are listed FIRST: boundaries uses
 * last-match-wins, so an allow-list entry below overrides them, and anything
 * the allow-list does not cover is reported with that ring's fix-it message.
 */
const disallowPolicies = Object.entries(FIX)
  .filter(([type]) => type !== 'test')
  .map(([type, fix]) => ({
    from: ring(type),
    disallow: {
      to: { module: { origin: '*' } },
    },
    message: `{{from.type}} must not import "{{dependency.source}}". ${fix}`,
  }));

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/dist-test/**',
      '**/dist-tooling/**',
      'infra/cdk.out/**',
      // Fixtures are deliberately broken; `pnpm arch:canary` lints them on purpose.
      'canary/**',
      // Root-level tool configs are human-owned (see .claude/settings.json + CODEOWNERS).
      'eslint.config.js',
      'vitest.config.ts',
      '.dependency-cruiser.cjs',
    ],
  },
  {
    linterOptions: {
      // Same effect as --no-inline-config, but also applies in editors and ad-hoc runs.
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: c.files ?? TS })),
  {
    files: ['scripts/**/*.mjs', '.claude/hooks/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly', URL: 'readonly' } },
  },
  {
    files: ALL,
    plugins: { boundaries, 'eslint-comments': comments },
    settings: {
      'boundaries/elements': elements,
      'boundaries/root-path': import.meta.dirname,
      'boundaries/dependency-nodes': ['import', 'export', 'dynamic-import', 'require'],
      'import/resolver': {
        typescript: { alwaysTryTypes: true, noWarnOnMultipleProjects: true, project: ['packages/*/tsconfig.json', 'infra/tsconfig.json', 'tsconfig.tooling.json'] },
        node: true,
      },
      'import/extensions': ['.ts', '.js', '.mjs', '.cjs'],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          checkAllOrigins: true,
          checkUnknownLocals: true,
          message:
            '{{from.type}} must not import "{{dependency.source}}" ({{to.type}}{{to.origin}}). ' +
            'Allowed edges: application->domain; adapters-driven->domain,@aws-sdk/*; adapters-driving->application,domain; ' +
            'composition->any ring. If you need a new capability, add a port in packages/domain/src/ports.',
          policies: [...disallowPolicies, ...allowPolicies],
        },
      ],
      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/no-ignored-dependencies': 'error',

      // Anti-tamper: no directive comments of any kind; no TS escape hatches.
      'eslint-comments/no-use': ['error', { allow: [] }],
    },
  },
  {
    files: TS,
    rules: {
      // `ts-expect-error` is banned too: it is just @ts-ignore that complains when unused.
      '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': true, 'ts-nocheck': true, 'ts-check': false, 'ts-expect-error': true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
    },
  },
  {
    // Core purity. Applies to domain and application source: everything effectful comes through a port.
    files: ['packages/domain/src/**/*.ts', 'packages/application/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['node:*'], message: 'Core rings cannot use Node builtins. Define a port in packages/domain/src/ports.' },
            { group: ['@aws-sdk/*', 'aws-cdk-lib', 'aws-cdk-lib/*', 'constructs', 'aws-lambda'], message: 'Core rings cannot touch AWS. Define a port and implement it in packages/adapters-driven.' },
            { group: ['@hex/adapters-*', '@hex/composition', '**/adapters-*/**', '**/composition/**'], message: 'Core rings cannot import adapters. Depend on a port interface from packages/domain/src/ports instead.' },
          ],
          paths: ['fs', 'path', 'os', 'http', 'https', 'net', 'child_process', 'crypto', 'url', 'util', 'stream', 'events', 'buffer', 'process', 'worker_threads'].map(
            (name) => ({ name, message: 'Core rings cannot use Node builtins. Define a port in packages/domain/src/ports.' }),
          ),
        },
      ],
      'no-restricted-globals': [
        'error',
        ...['fetch', 'XMLHttpRequest', 'WebSocket', 'process', 'console', 'setTimeout', 'setInterval', 'setImmediate', 'crypto', 'performance', 'require', 'Buffer', '__dirname', '__filename', 'globalThis'].map(
          (name) => ({ name, message: `"${name}" is I/O, time, or environment. Inject it through a port (packages/domain/src/ports) and implement it in adapters-driven.` }),
        ),
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'Use ClockPort.now() (packages/domain/src/ports/clock.port.ts).' },
        { object: 'Math', property: 'random', message: 'Randomness must come through a port (e.g. IdGeneratorPort) so the core stays deterministic.' },
        { object: 'crypto', property: 'randomUUID', message: 'Randomness must come through a port (e.g. IdGeneratorPort).' },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: "NewExpression[callee.name='Date'][arguments.length=0]", message: '`new Date()` reads the wall clock. Use ClockPort.now(), or pass a timestamp in.' },
        { selector: "CallExpression[callee.name='Date']", message: '`Date()` reads the wall clock. Use ClockPort.now().' },
        { selector: 'ImportExpression', message: 'Dynamic import() is I/O. Core rings must be statically analyzable.' },
      ],
    },
  },
);
