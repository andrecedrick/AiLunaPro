import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/*
 * English-only source policy (CLAUDE.md "Language Rule").
 *
 * A one-off grep proved the repo clean once; this keeps it clean. French copy had
 * leaked into three places at different times — a hardcoded CTA on the public ROI
 * calculator (visible to every locale), the persisted worksheet save title, and
 * the task/visibility source strings — because nothing enforced the rule.
 *
 * Scope: source under src/ and worker/src/, plus tests/. The i18n locale
 * dictionaries are the SOLE sanctioned home for non-English copy and are excluded.
 *
 * Detection is token-based on unambiguously French words. Deliberately excluded
 * from the token list: words that are also valid English ("source", "clients",
 * "estimation", "note", "double"), and "sans" because `sans-serif` appears in CSS
 * font stacks. A miss is acceptable here; a false positive that blocks the build
 * on legitimate English is not.
 */

const ROOT = join(__dirname, '..', '..');
const SCAN_DIRS = ['src', 'worker/src', 'tests'];
const EXCLUDE = [
  'src/lib/locale/i18n',                // the sanctioned exception
  'tests/unit/language-policy.test.ts', // this file names French words on purpose
];

/*
 * Files whose SUBJECT is non-English input. Exempt wholesale, with the reason
 * recorded here so an exemption is a decision rather than a silent gap. Anything
 * else needs the line-level LANG_EXEMPT marker instead.
 */
const ALLOWED_FILES: Record<string, string> = {
  'tests/determinism/quote-pdf.test.ts':
    'quote-pdf takes every string as input (docTitle: string); the French fixture is what proves rendering is locale-agnostic.',
  'tests/unit/worksheet-catalog.test.ts':
    'asserts French input still produces suggestions — the no-regression half of the locale-aware matcher.',
};

/** Line-level opt-out. Must carry a reason after the marker. */
const LANG_EXEMPT = 'LANG-EXEMPT:';

const FRENCH_TOKENS = [
  'afin', 'ainsi', 'aucune', 'avec', 'cela', 'cette', 'chaque', 'depuis', 'déjà',
  'donné', 'données', 'entreprise', 'entretien', 'était', 'être', 'facture',
  'facturation', 'fichier', 'jamais', 'lorsque', 'lui-même', 'mais', 'même',
  'nous', 'parce', 'pendant', 'plusieurs', 'pourquoi', 'pour', 'réseau', 'réunion',
  'rédaction', 'saisie', 'selon', 'seulement', 'tâche', 'tâches', 'toujours',
  'toutes', 'très', 'utilisateur', 'vous', 'vraies', 'vérité', 'devis', 'globale',
];
const RE = new RegExp(`\\b(${FRENCH_TOKENS.join('|')})\\b`, 'iu');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walk(full, out);
    } else if (/\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function scan(): Array<{ file: string; line: number; text: string; token: string }> {
  const hits: Array<{ file: string; line: number; text: string; token: string }> = [];
  for (const dir of SCAN_DIRS) {
    for (const full of walk(join(ROOT, dir))) {
      const rel = relative(ROOT, full).replace(/\\/g, '/');
      if (EXCLUDE.some(e => rel.startsWith(e))) continue;
      if (ALLOWED_FILES[rel]) continue;
      readFileSync(full, 'utf8').split('\n').forEach((text, i) => {
        if (text.includes(LANG_EXEMPT)) return;
        const m = RE.exec(text);
        if (m) hits.push({ file: rel, line: i + 1, text: text.trim().slice(0, 140), token: m[1] });
      });
    }
  }
  return hits;
}

describe('English-only source policy', () => {
  it('no French outside the i18n locale dictionaries', () => {
    const hits = scan();
    const report = hits.map(h => `  ${h.file}:${h.line}  [${h.token}]  ${h.text}`).join('\n');
    expect(hits, `French found outside src/lib/locale/i18n:\n${report}`).toHaveLength(0);
  });

  it('the scanner actually detects French (guards against a dead test)', () => {
    // If the regex ever broke, the assertion above would pass vacuously forever.
    expect(RE.test("Cette estimation est globale")).toBe(true);
    expect(RE.test('const total = items.length;')).toBe(false);
    // Must not fire on the CSS font stack that made an earlier grep-based scan noisy.
    expect(RE.test("fontFamily: 'system-ui, sans-serif'")).toBe(false);
  });
});
