// i18n validation gate — B6.5 translation workflow.
//
//   node scripts/i18n/check.mjs   (npm run i18n:check)
//
// FAILS (exit 1) if any locale dictionary still contains an un-filled draft
// marker `TODO[` or an empty string value. Run in CI / before commit so an
// un-validated translation draft can never be shipped. Per-locale KEY
// completeness is already enforced by the TypeScript build (`: Dict`) and by
// tests/unit/i18n.test.ts; this gate covers what the type system cannot —
// placeholder/empty content.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(here, '..', '..', 'src', 'lib', 'locale', 'i18n');
const SKIP = new Set(['en.ts', 'index.ts', 'registry.ts']);

const files = readdirSync(I18N_DIR).filter(f => f.endsWith('.ts') && !SKIP.has(f));
const problems = [];

for (const file of files) {
  const lines = readFileSync(join(I18N_DIR, file), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.includes('TODO[')) problems.push(`${file}:${i + 1}  un-translated draft marker (TODO[)`);
    if (/:\s*(''|"")\s*,?\s*$/.test(line)) problems.push(`${file}:${i + 1}  empty string value`);
  });
}

if (problems.length) {
  console.error(`i18n check FAILED — ${problems.length} issue(s):`);
  for (const p of problems) console.error('  - ' + p);
  console.error('\nFill every TODO[ value with a human translation before committing (no LLM/MT).');
  process.exit(1);
}
console.log(`i18n check OK — ${files.length} locale file(s), no TODO markers or empty values.`);
