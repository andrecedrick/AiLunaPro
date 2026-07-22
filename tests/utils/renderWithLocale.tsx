/**
 * renderWithLocale — the standard render for any component that reads locale.
 *
 * Why this exists
 * ---------------
 * Tests used to call Testing Library's bare `render()`, so components resolved
 * their catalog from the CONTEXT DEFAULT (`createContext<Dict>(EN)`) rather than
 * from a provider. That made the synchronous English catalog load-bearing for
 * the test suite while being redundant in production — in `App.tsx` every
 * user-facing component already renders inside `LocaleProvider`.
 *
 * Two consequences, both bad:
 *   1. The suite was UNREALISTIC — it exercised a provider-less arrangement that
 *      never occurs in the running app.
 *   2. It silently blocked making the 156 KB English catalog an async chunk:
 *      removing the sync default broke 45 tests that had no provider to fall
 *      back to, even though production was unaffected.
 *
 * Wrapping here removes that coupling. `LocaleProvider` reads its language from
 * `PreferencesContext`, so both providers are mounted — matching the real tree.
 *
 * Production code is deliberately unchanged: this is a test-harness fix. Once
 * every render goes through a provider, switching the catalog to an async chunk
 * becomes a change to this helper (await the catalog) plus `LocaleProvider`,
 * instead of a rewrite of every test file.
 */

import { Fragment, type ComponentType, type ReactElement, type ReactNode } from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import * as PreferencesModule from '../../src/context/PreferencesContext';
import * as LocaleModule from '../../src/context/LocaleContext';

/**
 * `LocaleProvider` reads its language through `usePreferences`. Several suites
 * `vi.mock` PreferencesContext and expose only that hook — in those files the
 * real provider does not exist (and is not needed, the mock supplies the hook).
 * Resolve it defensively so one harness serves both arrangements: accessing a
 * missing export on a vitest mock namespace throws, hence the try/catch.
 */
type Wrapper = ComponentType<{ children: ReactNode }>;

function resolveProvider(mod: unknown, name: string): Wrapper {
  try {
    const P = (mod as Record<string, unknown>)[name];
    return typeof P === 'function' ? (P as Wrapper) : Fragment;
  } catch {
    return Fragment;
  }
}

function LocaleHarness({ children }: { children: ReactNode }) {
  // A suite that mocks LocaleContext supplies `useLocale` itself; wrapping it in
  // the real provider would be both impossible (no export) and pointless.
  const Preferences = resolveProvider(PreferencesModule, 'PreferencesProvider');
  const Locale      = resolveProvider(LocaleModule, 'LocaleProvider');
  return (
    <Preferences>
      <Locale>{children}</Locale>
    </Preferences>
  );
}

/**
 * Render `ui` inside the same locale provider chain the app mounts.
 * Drop-in replacement for Testing Library's `render` — same return value, so
 * `rerender`, `unmount` and queries behave identically.
 */
export function renderWithLocale(
  ui: ReactElement,
  options?: RenderOptions,
): RenderResult {
  const { wrapper: Inner, ...rest } = (options ?? {}) as RenderOptions & { wrapper?: Wrapper };

  // A caller-supplied wrapper (auth/route harness) must be COMPOSED, not
  // substituted — spreading options over `{ wrapper: LocaleHarness }` silently
  // dropped the locale providers for every call site that passed one.
  const Combined: Wrapper = Inner
    ? ({ children }) => (
        <LocaleHarness>
          <Inner>{children}</Inner>
        </LocaleHarness>
      )
    : LocaleHarness;

  return render(ui, { ...rest, wrapper: Combined });
}

export { LocaleHarness };
