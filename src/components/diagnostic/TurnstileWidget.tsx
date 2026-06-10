/**
 * Cloudflare Turnstile widget — Phase K1A.
 *
 * Loads the Turnstile script lazily, renders the widget, and surfaces the
 * verification token to the parent via onToken callback. Sitekey is read
 * from VITE_TURNSTILE_SITE_KEY. When the env var is unset and we're in dev,
 * the widget renders a "(Turnstile dev bypass)" placeholder and emits an
 * empty-string token — the worker accepts this in dev only.
 */

import { useEffect, useRef } from 'react';
import { dlog } from '../../lib/log';

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__turnstileOnLoad&render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey:    string;
        callback?:  (token: string) => void;
        'error-callback'?: (code?: string) => void;
        'expired-callback'?: () => void;
      }) => string | undefined;
      reset:  (widgetId?: string) => void;
    };
    __turnstileOnLoad?: () => void;
  }
}

let scriptInjected = false;
const onLoadCallbacks: Array<() => void> = [];

function ensureScript(): Promise<void> {
  return new Promise(resolve => {
    if (window.turnstile) { resolve(); return; }
    onLoadCallbacks.push(resolve);
    if (scriptInjected) return;
    scriptInjected = true;
    window.__turnstileOnLoad = () => {
      const cbs = onLoadCallbacks.splice(0);
      cbs.forEach(cb => cb());
    };
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  });
}

interface Props {
  onToken: (token: string) => void;
}

export function TurnstileWidget({ onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef  = useRef<string | undefined>(undefined);
  const sitekey      = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    let cancelled = false;
    if (!sitekey) {
      // Dev bypass — emit empty token, worker accepts in non-prod.
      dlog('[turnstile] no VITE_TURNSTILE_SITE_KEY — dev bypass');
      onToken('');
      return;
    }
    void ensureScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        callback:        (t: string) => onToken(t),
        'error-callback':   (code?: string) => { console.error('[turnstile] widget error code=', code); onToken(''); },
        'expired-callback': () => onToken(''),
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitekey]);

  if (!sitekey) {
    return (
      <div style={{
        padding: '8px 12px', borderRadius: 8, fontSize: 12,
        background: 'var(--surface-2)', color: 'var(--text-muted)',
        border: '1px dashed var(--border)',
      }}>
        Turnstile disabled in this environment.
      </div>
    );
  }

  return <div ref={containerRef} style={{ minHeight: 65 }} />;
}
