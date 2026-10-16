const c8 = require.resolve('c8/bin/c8');
const mocha = require.resolve('mocha/bin/mocha');

// source-map 0.7 chooses its browser loader when Node exposes global fetch.
// Disable it only in the c8 process so source maps load from disk.
globalThis.fetch = undefined;

process.argv = [
  process.execPath,
  c8,
  '--exclude-after-remap',
  '--include=src/**/*.ts',
  '--exclude=**/*.spec.ts',
  '--reporter=text',
  '--check-coverage',
  '--lines=90',
  '--branches=70',
  '--functions=90',
  mocha,
  '-R',
  'spec',
  'test/*.spec.js',
];

require(c8);
