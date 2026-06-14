// Offline locale scaffolder — B6.5 translation workflow.
//
//   node scripts/i18n/scaffold-locale.mjs <code>
//
// Reads the canonical English catalog (en.ts) and emits a structurally
// IDENTICAL `<code>.ts` whose every value is `TODO[<code>] <English>`. It does
// NOT translate (no LLM, no online MT, no dependency) — it produces a
// compiling draft for a HUMAN translator to fill. The CI gate (check.mjs) then
// refuses to ship any file still containing a `TODO[` marker, so an
// un-validated draft cannot be committed.
//
// After scaffolding, wire the language manually (the compiler will tell you):
//   1. add the code to `Language` + label maps in src/lib/preferences.ts
//   2. add one row to LOCALE_REGISTRY in src/lib/locale/i18n/registry.ts
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const I18N_DIR = join(here, '..', '..', 'src', 'lib', 'locale', 'i18n');

const code = process.argv[2];
if (!code || !/^[a-z]{2}$/.test(code)) {
  console.error('Usage: node scripts/i18n/scaffold-locale.mjs <code>   (e.g. "ar")');
  process.exit(1);
}
const outPath = join(I18N_DIR, `${code}.ts`);
if (existsSync(outPath)) {
  console.error(`Refusing to overwrite existing ${code}.ts`);
  process.exit(1);
}

const enLines = readFileSync(join(I18N_DIR, 'en.ts'), 'utf8').split(/\r?\n/);
const start = enLines.findIndex(l => /export const en = \{/.test(l));
const end = enLines.findIndex(l => /^\} as const;/.test(l));
if (start === -1 || end === -1) {
  console.error('Could not locate the `export const en = { … } as const;` block in en.ts');
  process.exit(1);
}

const VALUE_RE = /^(\s*'?[\w-]+'?:\s*)'((?:[^'\\]|\\.)*)'(,?)\s*$/;
const body = enLines.slice(start + 1, end).map(line => {
  const m = VALUE_RE.exec(line);
  if (!m) return line; // group open/close, comment, blank — copy verbatim
  const [, head, value, comma] = m;
  return `${head}'TODO[${code}] ${value}'${comma}`;
});

const out = `/** B6.x — ${code.toUpperCase()} dictionary (DRAFT — scaffolded, NOT translated).
 *  Typed \`: Dict\` ⇒ compile-time completeness. Replace every TODO[${code}]
 *  value with a human translation, then remove this notice. CI (check.mjs)
 *  blocks any commit that still contains a TODO[ marker. */
import type { Dict } from './en';

export const ${code}: Dict = {
${body.join('\n')}
};
`;

writeFileSync(outPath, out);
console.log(`Scaffolded ${outPath} (${body.filter(l => l.includes('TODO[')).length} strings to translate).`);
console.log('Next: add the code to Language + label maps (preferences.ts) and a LOCALE_REGISTRY row (registry.ts).');
