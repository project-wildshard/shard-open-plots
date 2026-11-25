// TS16d guard: the author-preparation cache key leaves src/shards tests out, so a test-only push restores the
// preparation instead of cold-building and uploading a fresh one. That is sound only while no build input is a test
// file: no non-test file under src/shards imports one, and no generator lists files with ctx.inputFiles (a listing
// could pick a test up without the key changing). The key must also stay byte-identical in ci.yml (push) and
// ring-2-prepare.yml (nightly, candidates), or a candidate finds no preparation.
import assert from 'node:assert/strict';
import {globSync, readFileSync} from 'node:fs';
import test from 'node:test';

const keyOf = path => {
  const lines = readFileSync(path, 'utf8').split('\n').filter(line => line.trim().startsWith('AUTHOR_KEY:'));
  assert.equal(lines.length, 1, `${path} binds AUTHOR_KEY once`);
  return lines[0].trim();
};

test('ci.yml and ring-2-prepare.yml bind the same preparation key, tests left out', () => {
  const ci = keyOf('.github/workflows/ci.yml');
  assert.equal(keyOf('.github/workflows/ring-2-prepare.yml'), ci);
  assert.match(ci, /'src\/shards\/\*\*', '!src\/shards\/\*\*\/\*\.test\.ts'/);
});

test('no build input under src/shards is a test file', () => {
  const sources = globSync('src/shards/**/*.{ts,mts,js,mjs}').filter(path => !/\.test\.[^/]+$/.test(path));
  assert.ok(sources.length > 0, 'found src/shards sources');
  for (const path of sources) {
    const text = readFileSync(path, 'utf8');
    assert.doesNotMatch(text, /from\s+['"][^'"]*\.test(\.[a-z]+)?['"]|import\(\s*['"][^'"]*\.test(\.[a-z]+)?['"]/, `${path} imports a test file`);
    assert.doesNotMatch(text, /\binputFiles\s*\(/, `${path} lists input files, which the key cannot see past`);
  }
});
