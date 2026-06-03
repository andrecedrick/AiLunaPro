import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

/*
 * Regression guard for the prod boot crash:
 *   "No Firebase App '[DEFAULT]' has been created — call initializeApp() first
 *    (app/no-app)"
 *
 * The fix: main.tsx imports './lib/firebase' (which calls initializeApp at module
 * evaluation) as its FIRST entry dependency — before './App' and therefore before
 * any code-split chunk can reach getAuth(). This source-level check fails loudly
 * if that ordering is ever reverted. (Runtime init can't be asserted here because
 * the test env mocks the firebase layer.)
 */
function readMain(): string {
  return readFileSync(path.join(ROOT, 'src/main.tsx'), 'utf8');
}

describe('firebase initialization order (entry-first import)', () => {
  it('main.tsx imports ./lib/firebase before ./App', () => {
    const src = readMain();
    const fbIdx = src.indexOf("import './lib/firebase'");
    const appIdx = src.indexOf("import App");
    expect(fbIdx, "main.tsx must import './lib/firebase'").toBeGreaterThanOrEqual(0);
    expect(appIdx, "main.tsx must import App").toBeGreaterThanOrEqual(0);
    expect(fbIdx, 'firebase init must come before App import').toBeLessThan(appIdx);
  });

  it("initializeApp() and getAuth() live in the SAME module (firebase.ts) in order", () => {
    const fb = readFileSync(path.join(ROOT, 'src/lib/firebase.ts'), 'utf8');
    const initIdx = fb.search(/initializeApp\(/);
    const getAuthIdx = fb.search(/getAuth\(app\)/);
    expect(initIdx, 'firebase.ts must call initializeApp').toBeGreaterThanOrEqual(0);
    expect(getAuthIdx, 'firebase.ts must call getAuth(app) in the same module').toBeGreaterThanOrEqual(0);
    expect(initIdx, 'initializeApp must precede getAuth in the module').toBeLessThan(getAuthIdx);
    // firebase-auth.ts only re-exports auth (no separate getAuth call to reorder).
    const authMod = readFileSync(path.join(ROOT, 'src/lib/firebase-auth.ts'), 'utf8');
    expect(authMod).toMatch(/export \{ auth \} from '\.\/firebase'/);
    expect(authMod).not.toMatch(/getAuth\(/);
  });
});
